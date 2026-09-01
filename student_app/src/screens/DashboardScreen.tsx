import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  getStudentAttendance,
  StudentAttendance,
} from '../services/attendanceService';

export type User = {
  id: string | number;
  firstName?: string;
  lastName?: string;
  email: string;
  MIS?: string;
  year?: number;
  semester?: number;
  department?: string;
  profilePic?: string | null;
  role?: string;

  class?: {
    classId: string | number;
    name: string;
    code: string;
    description?: string;
  } | null;
};

type Props = {
  user: User;
  token: string;
  onScan: () => void;
  onAttendance: () => void;
  onSettings: () => void;
  onLogout: () => Promise<void>;
};

export default function DashboardScreen({
  user,
  token,
  onScan,
  onAttendance,
  onSettings,
  onLogout,
}: Props) {
  const [attendance, setAttendance] = useState<StudentAttendance[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(true);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      setLoadingAttendance(true);

      const response = await getStudentAttendance(token, user.id);

      if (!response.success) {
        throw new Error(response.message || 'Could not load attendance.');
      }

      setAttendance(response.attendance || []);
    } catch (error: any) {
      console.error('DASHBOARD ATTENDANCE ERROR:', error);

      Alert.alert(
        'Attendance',
        error?.message || 'Could not load attendance data.',
      );
    } finally {
      setLoadingAttendance(false);
    }
  };

  const totalPresent = attendance.reduce(
    (sum, course) => sum + course.present,
    0,
  );

  const totalClasses = attendance.reduce(
    (sum, course) => sum + course.total,
    0,
  );

  const overallPercentage =
    totalClasses > 0 ? ((totalPresent / totalClasses) * 100).toFixed(1) : '0.0';

  const percentageNumber = Number(overallPercentage);

  const attendanceStatus =
    percentageNumber >= 75
      ? 'Good standing'
      : percentageNumber >= 60
      ? 'Needs attention'
      : 'Low attendance';

  const attendanceStatusColor =
    percentageNumber >= 75
      ? '#16A34A'
      : percentageNumber >= 60
      ? '#D97706'
      : '#DC2626';

  const firstName = user.firstName || 'Student';

  const fullName =
    `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Student';

  return (
    <View style={styles.screen}>
      {/* Everything behind this scrolls */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.headerBackground}>
          <View style={styles.headerCircleOne} />
          <View style={styles.headerCircleTwo} />

          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerSmall}>IIIT Pune</Text>
              <Text style={styles.headerTitle}>Student Portal</Text>
            </View>

            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {firstName.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.greeting}>
            <Text style={styles.greetingSmall}>Welcome back</Text>

            <Text style={styles.greetingName}>{fullName}</Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* Attendance overview */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Attendance</Text>

            <TouchableOpacity onPress={onAttendance} activeOpacity={0.7}>
              <Text style={styles.viewAll}>View report</Text>
            </TouchableOpacity>
          </View>

          {loadingAttendance ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="small" color="#4F46E5" />

              <Text style={styles.loadingText}>Loading attendance...</Text>
            </View>
          ) : (
            <View style={styles.statsRow}>
              {/* Overall */}
              <View style={[styles.statCard, styles.statCardLarge]}>
                <View style={styles.statTopRow}>
                  <View style={styles.statIconPurple}>
                    <Text style={styles.statIconText}>%</Text>
                  </View>

                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor: attendanceStatusColor,
                      },
                    ]}
                  />
                </View>

                <Text style={styles.statValue}>{overallPercentage}%</Text>

                <Text style={styles.statLabel}>Overall Attendance</Text>

                <Text
                  style={[styles.statStatus, { color: attendanceStatusColor }]}
                >
                  {attendanceStatus}
                </Text>
              </View>

              {/* Classes */}
              <View style={styles.statCard}>
                <View style={styles.statTopRow}>
                  <View style={styles.statIconBlue}>
                    <Text style={styles.statIconTextBlue}>#</Text>
                  </View>
                </View>

                <Text style={styles.statValueSmall}>{totalPresent}</Text>

                <Text style={styles.statLabel}>attended</Text>

                <Text style={styles.statSecondary}>
                  {totalClasses} Total Classes
                </Text>
              </View>
            </View>
          )}

          {/* Student information */}
          <Text style={styles.infoSectionTitle}>Student Information</Text>

          <View style={styles.infoCard}>
            <InfoRow label="MIS" value={user.MIS} first />

            <InfoRow label="Email" value={user.email} />

            <InfoRow label="Department" value={user.department} />

            <InfoRow
              label="Year"
              value={user.year !== undefined ? `Year ${user.year}` : undefined}
            />

            <InfoRow
              label="Semester"
              value={
                user.semester !== undefined
                  ? `Semester ${user.semester}`
                  : undefined
              }
              last
            />
          </View>

          {/* View Attendance */}
          <TouchableOpacity
            onPress={onAttendance}
            activeOpacity={0.8}
            style={styles.actionCard}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>✓</Text>
            </View>

            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>View Attendance</Text>

              <Text style={styles.actionSubtitle}>
                View your attendance by subject.
              </Text>
            </View>

            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          {/* Settings */}
          <TouchableOpacity
            onPress={onSettings}
            activeOpacity={0.8}
            style={styles.actionCard}
          >
            <View style={styles.actionIconNeutral}>
              <Text style={styles.actionIconTextNeutral}>⚙</Text>
            </View>

            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Settings</Text>

              <Text style={styles.actionSubtitle}>
                Manage your account preferences.
              </Text>
            </View>

            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity
            onPress={async () => {
              try {
                await onLogout();
              } catch {
                // App.tsx handles logout state.
              }
            }}
            activeOpacity={0.7}
            style={styles.logoutButton}
          >
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

          <Text style={styles.footer}>Student Attendance System</Text>
        </View>
      </ScrollView>

      {/* =====================================================
          FLOATING SCAN BUTTON
          This is OUTSIDE ScrollView, so it never scrolls away.
          ===================================================== */}
      <TouchableOpacity
        onPress={onScan}
        activeOpacity={0.92}
        style={styles.floatingScan}
      >
        <View style={styles.floatingQr}>
          <View style={styles.qrTopLeft} />
          <View style={styles.qrTopRight} />
          <View style={styles.qrBottomLeft} />
          <View style={styles.qrBottomRight} />

          <View style={styles.qrDotOne} />
          <View style={styles.qrDotTwo} />
          <View style={styles.qrDotThree} />
          <View style={styles.qrDotFour} />
          <View style={styles.qrDotFive} />
        </View>

        <View style={styles.floatingText}>
          <Text style={styles.floatingEyebrow}>MARK ATTENDANCE</Text>

          <Text style={styles.floatingTitle}>Scan QR Code</Text>
        </View>

        <View style={styles.floatingArrow}>
          <Text style={styles.floatingArrowText}>›</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

function InfoRow({
  label,
  value,
  first,
  last,
}: {
  label: string;
  value?: string;
  first?: boolean;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.infoRow,
        first && styles.infoRowFirst,
        last && styles.infoRowLast,
      ]}
    >
      <Text style={styles.infoLabel}>{label}</Text>

      <Text style={styles.infoValue}>{value || '--'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7FF',
  },

  scrollContent: {
    paddingBottom: 120,
  },

  /* Header */

  headerBackground: {
    height: 235,
    backgroundColor: '#312E81',
    paddingHorizontal: 22,
    paddingTop: 52,
    overflow: 'hidden',
  },

  headerCircleOne: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: '#4F46E5',
    top: -125,
    right: -55,
  },

  headerCircleTwo: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#06B6D4',
    opacity: 0.55,
    right: 25,
    bottom: -85,
  },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerSmall: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.7,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: 0.1,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },

  greeting: {
    marginTop: 27,
  },

  greetingSmall: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.2,
  },

  greetingName: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: '800',
    marginTop: 4,
    letterSpacing: -0.4,
  },

  /* Body */

  body: {
    paddingHorizontal: 20,
    marginTop: -30,
  },

  /* Attendance */

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 12,
  },

  sectionTitle: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  viewAll: {
    color: '#4F46E5',
    fontSize: 13,
    fontWeight: '700',
  },

  loadingCard: {
    height: 142,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 9,
  },

  /* Stats */

  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    minHeight: 150,

    elevation: 2,

    shadowColor: '#111827',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 5,
  },

  statCardLarge: {
    flex: 1.35,
  },

  statTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  statIconPurple: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statIconBlue: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statIconText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '800',
  },

  statIconTextBlue: {
    color: '#0284C7',
    fontSize: 16,
    fontWeight: '800',
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  statValue: {
    color: '#111827',
    fontSize: 30,
    fontWeight: '800',
    marginTop: 14,
    letterSpacing: -0.5,
  },

  statValueSmall: {
    color: '#111827',
    fontSize: 30,
    fontWeight: '800',
    marginTop: 14,
    letterSpacing: -0.5,
  },

  statLabel: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },

  statStatus: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 8,
  },

  statSecondary: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 8,
  },

  /* Student information */

  infoSectionTitle: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginTop: 28,
    marginBottom: 12,
  },

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 18,

    elevation: 2,

    shadowColor: '#111827',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  infoRowFirst: {
    minHeight: 54,
  },

  infoRowLast: {
    borderBottomWidth: 0,
  },

  infoLabel: {
    color: '#9CA3AF',
    fontSize: 12.5,
    fontWeight: '500',
    flex: 1,
  },

  infoValue: {
    color: '#111827',
    fontSize: 13.5,
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },

  /* Actions */

  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',

    elevation: 2,

    shadowColor: '#111827',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },

  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  actionIconNeutral: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  actionIconText: {
    color: '#16A34A',
    fontSize: 18,
    fontWeight: '800',
  },

  actionIconTextNeutral: {
    color: '#4B5563',
    fontSize: 17,
    fontWeight: '700',
  },

  actionText: {
    flex: 1,
  },

  actionTitle: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
  },

  actionSubtitle: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 3,
  },

  actionArrow: {
    color: '#9CA3AF',
    fontSize: 25,
    fontWeight: '300',
    marginLeft: 8,
  },

  /* Logout */

  logoutButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
    marginTop: 16,
  },

  logoutText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
  },

  footer: {
    color: '#C4C7D0',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 5,
  },

  /* =====================================================
     FLOATING SCAN BUTTON
     ===================================================== */

  floatingScan: {
    position: 'absolute',

    bottom: 40,

    left: 20,
    right: 20,

    minHeight: 76,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 16,

    backgroundColor: '#111827',
    borderRadius: 22,

    elevation: 10,

    shadowColor: '#111827',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,

    overflow: 'hidden',
  },

  floatingQr: {
    width: 50,
    height: 50,
    borderRadius: 14,

    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',

    position: 'relative',
    marginRight: 14,
  },

  qrTopLeft: {
    position: 'absolute',
    left: 8,
    top: 8,
    width: 15,
    height: 15,

    borderWidth: 3,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: '#FFFFFF',
  },

  qrTopRight: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 15,
    height: 15,

    borderWidth: 3,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderColor: '#FFFFFF',
  },

  qrBottomLeft: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    width: 15,
    height: 15,

    borderWidth: 3,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderColor: '#FFFFFF',
  },

  qrBottomRight: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 15,
    height: 15,

    borderWidth: 3,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#FFFFFF',
  },

  qrDotOne: {
    position: 'absolute',
    left: 25,
    top: 13,
    width: 5,
    height: 5,
    backgroundColor: '#FFFFFF',
  },

  qrDotTwo: {
    position: 'absolute',
    left: 22,
    top: 23,
    width: 6,
    height: 6,
    backgroundColor: '#FFFFFF',
  },

  qrDotThree: {
    position: 'absolute',
    right: 19,
    top: 24,
    width: 5,
    height: 5,
    backgroundColor: '#FFFFFF',
  },

  qrDotFour: {
    position: 'absolute',
    left: 25,
    bottom: 13,
    width: 5,
    height: 5,
    backgroundColor: '#FFFFFF',
  },

  qrDotFive: {
    position: 'absolute',
    right: 13,
    bottom: 13,
    width: 6,
    height: 6,
    backgroundColor: '#FFFFFF',
  },

  floatingText: {
    flex: 1,
  },

  floatingEyebrow: {
    color: '#A5B4FC',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },

  floatingTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    marginTop: 2,
  },

  floatingArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,

    backgroundColor: '#FFFFFF',

    alignItems: 'center',
    justifyContent: 'center',

    marginLeft: 8,
  },

  floatingArrowText: {
    color: '#312E81',
    fontSize: 27,
    lineHeight: 30,
    fontWeight: '500',
    marginTop: -2,
  },
});
