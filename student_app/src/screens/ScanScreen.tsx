import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';

import { useBarcodeScannerOutput } from 'react-native-vision-camera-barcode-scanner';

import { markAttendance } from '../services/attendanceService';
import colors from '../styles/colors';
import spacing from '../styles/spacing';
import typography from '../styles/typography';
import theme from '../styles/theme';

type Props = {
  navigation: any;
  token: string;
};

type ScanStatus = 'idle' | 'scanning' | 'success' | 'error';

export default function ScanScreen({ navigation, token }: Props) {
  const device = useCameraDevice('back');

  const { hasPermission, requestPermission } = useCameraPermission();

  const [cameraError, setCameraError] = useState<string | null>(null);

  const [scannedValue, setScannedValue] = useState<string | null>(null);

  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  /*
   * Prevents multiple requests while the current
   * QR code is being verified.
   */
  const isSubmitting = useRef(false);

  /*
   * Once attendance is successfully marked, scanning
   * is permanently disabled until the screen is left.
   */
  const attendanceMarked = useRef(false);

  /*
   * Prevents Vision Camera from repeatedly submitting
   * the same QR over consecutive frames.
   */
  const lastScannedValue = useRef<string | null>(null);

  const lastScannedTime = useRef(0);

  /* ============================================================
     CAMERA PERMISSION
     ============================================================ */

  useEffect(() => {
    if (!hasPermission) {
      requestPermission().catch(() => {
        /*
         * Permission denial is already represented by the
         * permission screen. Do not create a console error
         * for an expected permission state.
         */
      });
    }
  }, [hasPermission, requestPermission]);

  /* ============================================================
     ERROR MESSAGE
     ============================================================ */

  const getAttendanceErrorMessage = (message: unknown): string => {
    const backendMessage = String(message || '').trim();

    const normalizedMessage = backendMessage.toLowerCase();

    /*
     * Different class / class mismatch.
     */
    if (
      (normalizedMessage.includes('class') &&
        (normalizedMessage.includes('different') ||
          normalizedMessage.includes('mismatch') ||
          normalizedMessage.includes('not belong') ||
          normalizedMessage.includes('not enrolled') ||
          normalizedMessage.includes('invalid'))) ||
      normalizedMessage.includes('wrong class') ||
      normalizedMessage.includes('class does not match') ||
      normalizedMessage.includes('class_id') ||
      normalizedMessage.includes('classid')
    ) {
      return (
        'This QR code belongs to a different class. ' +
        'Please scan the QR code displayed for your class.'
      );
    }

    /*
     * Expired session.
     */
    if (
      normalizedMessage.includes('expired') ||
      normalizedMessage.includes('session ended') ||
      normalizedMessage.includes('session has ended')
    ) {
      return (
        'This attendance session has ended. ' +
        'Please ask your instructor to display a new QR code.'
      );
    }

    /*
     * Already marked.
     */
    if (
      normalizedMessage.includes('already') &&
      normalizedMessage.includes('attendance')
    ) {
      return 'Your attendance has already been marked for this session.';
    }

    /*
     * No active session.
     */
    if (
      normalizedMessage.includes('not active') ||
      normalizedMessage.includes('inactive') ||
      normalizedMessage.includes('no active session')
    ) {
      return 'There is no active attendance session for this QR code.';
    }

    /*
     * Invalid QR.
     */
    if (
      normalizedMessage.includes('invalid qr') ||
      normalizedMessage.includes('invalid token') ||
      normalizedMessage.includes('invalid qr code')
    ) {
      return (
        'This QR code is invalid. ' +
        'Please scan the QR code displayed by your instructor.'
      );
    }

    /*
     * Session not found.
     */
    if (
      normalizedMessage.includes('session not found') ||
      normalizedMessage.includes('attendance session not found')
    ) {
      return (
        'This attendance session could not be found. ' +
        'Please ask your instructor to generate a new QR code.'
      );
    }

    /*
     * Preserve an actual useful backend message.
     */
    if (backendMessage) {
      return backendMessage;
    }

    return 'Unable to mark attendance. Please try again.';
  };

  /* ============================================================
     QR HANDLER
     ============================================================ */

  const handleBarcodeScanned = useCallback(
    async (barcodes: any[]) => {
      /*
       * No barcode.
       */
      if (!barcodes?.length) {
        return;
      }

      /*
       * CRITICAL:
       * Once attendance has been marked successfully,
       * completely ignore every future barcode event.
       *
       * This is what prevents the camera from scanning
       * repeatedly after successful attendance.
       */
      if (attendanceMarked.current) {
        return;
      }

      /*
       * A request is already in progress.
       */
      if (isSubmitting.current) {
        return;
      }

      const barcode = barcodes[0];

      const qrToken =
        barcode?.rawValue ?? barcode?.displayValue ?? barcode?.value;

      /*
       * Barcode was detected but contains no usable value.
       */
      if (!qrToken) {
        return;
      }

      const now = Date.now();

      /*
       * Ignore the same QR for a short period.
       *
       * This protects against Vision Camera detecting
       * the same QR in multiple consecutive frames.
       */
      if (
        qrToken === lastScannedValue.current &&
        now - lastScannedTime.current < 1500
      ) {
        return;
      }

      lastScannedValue.current = qrToken;
      lastScannedTime.current = now;

      /*
       * Lock the scanner while this QR is being processed.
       */
      isSubmitting.current = true;

      const scannedAt = Date.now();

      setScannedValue(qrToken);
      setScanStatus('scanning');
      setStatusMessage('Verifying attendance...');

      try {
        const response = await markAttendance(token, qrToken, scannedAt);

        /*
         * IMPORTANT:
         *
         * A normal API rejection is NOT thrown.
         *
         * For example:
         * - wrong class
         * - expired session
         * - already marked
         * - invalid QR
         *
         * These are expected application states,
         * not JavaScript exceptions.
         */

        if (!response.success) {
          const friendlyMessage = getAttendanceErrorMessage(response.message);

          setScanStatus('error');
          setStatusMessage(friendlyMessage);

          /*
           * Unlock the scanner after an expected rejection.
           *
           * The student can now scan a different QR.
           */
          isSubmitting.current = false;

          return;
        }

        /*
         * ======================================================
         * SUCCESS
         * ======================================================
         *
         * Set this BEFORE updating the UI.
         *
         * Vision Camera may immediately deliver another
         * barcode frame after this callback completes.
         * attendanceMarked prevents that frame from doing
         * anything.
         */
        attendanceMarked.current = true;

        /*
         * Keep submitting locked as well.
         */
        isSubmitting.current = true;

        setScanStatus('success');

        setStatusMessage(response.message || 'Attendance marked successfully');

        /*
         * No timeout.
         *
         * No reset.
         *
         * No second scan.
         *
         * The screen simply stays on the successful state.
         */
      } catch (error: any) {
        /*
         * This catch is only for an actual unexpected
         * failure from markAttendance(), such as a network
         * or runtime failure.
         *
         * We deliberately do NOT console.error() here.
         * The user asked for the notification without
         * unnecessary console error output.
         */

        setScanStatus('error');

        setStatusMessage(getAttendanceErrorMessage(error?.message));

        /*
         * Allow another scan after an unexpected failure.
         */
        isSubmitting.current = false;
      }
    },
    [token],
  );

  /* ============================================================
     BARCODE OUTPUT
     ============================================================ */

  const barcodeOutput = useBarcodeScannerOutput({
    barcodeFormats: ['qr-code'],

    onBarcodeScanned: handleBarcodeScanned,

    onError: error => {
      /*
       * Scanner errors are genuine scanner errors,
       * so keep them visible to the user.
       *
       * But do not log expected attendance errors here.
       */
      setCameraError(error?.message || 'Unable to use the QR scanner.');
    },
  });

  /* ============================================================
     PERMISSION SCREEN
     ============================================================ */

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <View style={styles.permissionContent}>
          <View style={styles.permissionIcon}>
            <Text style={styles.permissionIconText}>⌁</Text>
          </View>

          <Text style={styles.permissionTitle}>Camera access required</Text>

          <Text style={styles.permissionMessage}>
            Camera access is needed to scan your attendance QR code.
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Allow Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.permissionBackButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.permissionBackText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /* ============================================================
     CAMERA INITIALIZATION
     ============================================================ */

  if (device == null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.white} />

        <Text style={styles.loadingTitle}>Starting camera</Text>

        <Text style={styles.loadingMessage}>Preparing the scanner...</Text>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.loadingBackButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.loadingBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /* ============================================================
     MAIN SCANNER
     ============================================================ */

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        /*
         * The camera itself can remain active.
         *
         * attendanceMarked.current prevents all barcode
         * callbacks after success.
         */
        isActive={true}
        outputs={[barcodeOutput]}
        enableNativeZoomGesture={true}
        onError={error => {
          setCameraError(error?.message || 'Unable to use the camera.');
        }}
      />

      <View pointerEvents="none" style={styles.darkOverlay} />

      <SafeAreaView style={styles.safeArea}>
        {/* ======================================================
            HEADER
            ====================================================== */}

        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Scan Attendance</Text>

            <Text style={styles.headerSubtitle}>
              Scan the QR code displayed by your instructor
            </Text>
          </View>
        </View>

        {/* ======================================================
            SCANNER AREA
            ====================================================== */}

        <View style={styles.scannerArea}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTopLeft]} />

            <View style={[styles.corner, styles.cornerTopRight]} />

            <View style={[styles.corner, styles.cornerBottomLeft]} />

            <View style={[styles.corner, styles.cornerBottomRight]} />
          </View>

          <Text style={styles.scanInstruction}>
            {attendanceMarked.current
              ? 'Attendance has been recorded'
              : 'Align the QR code within the frame'}
          </Text>

          {!attendanceMarked.current && (
            <View style={styles.zoomHint}>
              <Text style={styles.zoomIcon}>+</Text>

              <Text style={styles.zoomText}>Pinch to zoom</Text>
            </View>
          )}
        </View>

        {/* ======================================================
            STATUS CARD
            ====================================================== */}

        {scanStatus !== 'idle' && (
          <View
            style={[
              styles.statusCard,

              scanStatus === 'success' && styles.statusCardSuccess,

              scanStatus === 'error' && styles.statusCardError,
            ]}
          >
            <View
              style={[
                styles.statusIcon,

                scanStatus === 'success' && styles.statusIconSuccess,

                scanStatus === 'error' && styles.statusIconError,
              ]}
            >
              {scanStatus === 'scanning' ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.statusIconText}>
                  {scanStatus === 'success' ? '✓' : '!'}
                </Text>
              )}
            </View>

            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>
                {scanStatus === 'success'
                  ? 'Attendance marked'
                  : scanStatus === 'error'
                  ? 'Attendance not marked'
                  : 'Verifying attendance'}
              </Text>

              <Text style={styles.statusMessage}>{statusMessage}</Text>
            </View>
          </View>
        )}

        {/* ======================================================
            CAMERA ERROR
            ====================================================== */}

        {cameraError && (
          <View style={styles.cameraError}>
            <Text style={styles.cameraErrorText}>{cameraError}</Text>
          </View>
        )}

        {/* ======================================================
            BOTTOM
            ====================================================== */}

        <View style={styles.bottomArea}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

/* ==============================================================
   STYLES
   ============================================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },

  safeArea: {
    flex: 1,
  },

  darkOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
  },

  /* ============================================================
     HEADER
     ============================================================ */

  header: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxxl + spacing.sm,
  },

  headerTextContainer: {
    alignSelf: 'flex-start',
    maxWidth: '88%',
  },

  headerTitle: {
    ...typography.heading,
    color: colors.white,
    fontSize: 25,
  },

  headerSubtitle: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.78)',
    marginTop: spacing.xs,
    lineHeight: 20,
  },

  /* ============================================================
     SCANNER
     ============================================================ */

  scannerArea: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',
  },

  scanFrame: {
    width: 270,
    height: 270,

    position: 'relative',
  },

  corner: {
    position: 'absolute',

    width: 34,
    height: 34,

    borderColor: colors.white,
  },

  cornerTopLeft: {
    top: 0,
    left: 0,

    borderTopWidth: 4,
    borderLeftWidth: 4,

    borderTopLeftRadius: theme.radius.md,
  },

  cornerTopRight: {
    top: 0,
    right: 0,

    borderTopWidth: 4,
    borderRightWidth: 4,

    borderTopRightRadius: theme.radius.md,
  },

  cornerBottomLeft: {
    bottom: 0,
    left: 0,

    borderBottomWidth: 4,
    borderLeftWidth: 4,

    borderBottomLeftRadius: theme.radius.md,
  },

  cornerBottomRight: {
    bottom: 0,
    right: 0,

    borderBottomWidth: 4,
    borderRightWidth: 4,

    borderBottomRightRadius: theme.radius.md,
  },

  scanInstruction: {
    ...typography.bodyMedium,

    color: colors.white,

    marginTop: spacing.xxl,

    textAlign: 'center',
  },

  zoomHint: {
    flexDirection: 'row',

    alignItems: 'center',

    marginTop: spacing.md,

    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,

    borderRadius: theme.radius.round,

    backgroundColor: 'rgba(0, 0, 0, 0.52)',
  },

  zoomIcon: {
    color: colors.white,

    fontSize: 16,
    fontWeight: '700',

    marginRight: spacing.xs,
  },

  zoomText: {
    ...typography.small,

    color: 'rgba(255, 255, 255, 0.85)',
  },

  /* ============================================================
     STATUS
     ============================================================ */

  statusCard: {
    position: 'absolute',

    left: spacing.xl,
    right: spacing.xl,

    bottom: 108,

    flexDirection: 'row',

    alignItems: 'center',

    padding: spacing.lg,

    borderRadius: theme.radius.lg,

    backgroundColor: 'rgba(17, 24, 39, 0.94)',
  },

  statusCardSuccess: {
    backgroundColor: 'rgba(22, 163, 74, 0.94)',
  },

  statusCardError: {
    backgroundColor: 'rgba(220, 38, 38, 0.94)',
  },

  statusIcon: {
    width: 40,
    height: 40,

    borderRadius: theme.radius.round,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },

  statusIconSuccess: {
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
  },

  statusIconError: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },

  statusIconText: {
    color: colors.white,

    fontSize: 21,
    fontWeight: '800',
  },

  statusTextContainer: {
    flex: 1,

    marginLeft: spacing.md,
  },

  statusTitle: {
    ...typography.bodyBold,

    color: colors.white,
  },

  statusMessage: {
    ...typography.small,

    color: 'rgba(255, 255, 255, 0.86)',

    marginTop: 2,

    lineHeight: 17,
  },

  /* ============================================================
     CAMERA ERROR
     ============================================================ */

  cameraError: {
    position: 'absolute',

    top: 120,

    left: spacing.xl,
    right: spacing.xl,

    padding: spacing.md,

    borderRadius: theme.radius.md,

    backgroundColor: 'rgba(220, 38, 38, 0.92)',
  },

  cameraErrorText: {
    ...typography.small,

    color: colors.white,

    textAlign: 'center',
  },

  /* ============================================================
     BOTTOM
     ============================================================ */

  bottomArea: {
    alignItems: 'center',

    paddingBottom: spacing.xxxl + spacing.sm + spacing.sm,
  },

  cancelButton: {
    minWidth: 120,

    alignItems: 'center',

    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,

    borderRadius: theme.radius.round,

    backgroundColor: 'rgba(17, 24, 39, 0.88)',

    borderWidth: 1,

    borderColor: 'rgba(255, 255, 255, 0.18)',
  },

  cancelText: {
    ...typography.bodyMedium,

    color: colors.white,
  },

  /* ============================================================
     PERMISSION
     ============================================================ */

  permissionContainer: {
    flex: 1,

    backgroundColor: colors.background,
  },

  permissionContent: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: spacing.xxxl,
  },

  permissionIcon: {
    width: 72,
    height: 72,

    borderRadius: theme.radius.lg,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: colors.primary,
  },

  permissionIconText: {
    color: colors.white,

    fontSize: 36,
    fontWeight: '300',
  },

  permissionTitle: {
    ...typography.heading,

    color: colors.text,

    fontSize: 22,

    marginTop: spacing.xxl,

    textAlign: 'center',
  },

  permissionMessage: {
    ...typography.body,

    color: colors.textSecondary,

    lineHeight: 23,

    marginTop: spacing.sm,

    textAlign: 'center',
  },

  permissionButton: {
    width: '100%',

    alignItems: 'center',

    paddingVertical: spacing.lg,

    marginTop: spacing.xxxl,

    borderRadius: theme.radius.md,

    backgroundColor: colors.primary,
  },

  permissionButtonText: {
    ...typography.bodyBold,

    color: colors.white,
  },

  permissionBackButton: {
    paddingVertical: spacing.lg,

    marginTop: spacing.sm,
  },

  permissionBackText: {
    ...typography.bodyMedium,

    color: colors.textSecondary,
  },

  /* ============================================================
     CAMERA LOADING
     ============================================================ */

  loadingContainer: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: spacing.xxxl,

    backgroundColor: colors.black,
  },

  loadingTitle: {
    ...typography.subheading,

    color: colors.white,

    marginTop: spacing.xl,
  },

  loadingMessage: {
    ...typography.caption,

    color: 'rgba(255, 255, 255, 0.65)',

    marginTop: spacing.xs,
  },

  loadingBackButton: {
    marginTop: spacing.xxxl,

    paddingHorizontal: spacing.xxl,

    paddingVertical: spacing.md,

    borderRadius: theme.radius.round,

    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },

  loadingBackText: {
    ...typography.bodyMedium,

    color: colors.white,
  },
});
