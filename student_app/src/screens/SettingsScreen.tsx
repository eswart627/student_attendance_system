import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Props = {
  navigation: any;
  user?: any;
  onLogout: () => void;
};

export default function SettingsScreen({ navigation, user, onLogout }: Props) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: onLogout,
      },
    ]);
  };

  const handleProfile = () => {
    const fullName =
      `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Student';

    const email = user?.email || 'Not available';

    const mis = user?.MIS || user?.mis || user?.studentId || 'Not available';

    Alert.alert('Profile', `${fullName}\n\nEmail: ${email}\nMIS: ${mis}`, [
      {
        text: 'Done',
      },
    ]);
  };

  const handleAbout = () => {
    Alert.alert(
      'Student Attendance System',
      'Student attendance mobile application.\n\nIIIT Pune',
      [
        {
          text: 'Done',
        },
      ],
    );
  };

  const firstName = user?.firstName || '';
  const lastName = user?.lastName || '';

  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'S';

  const fullName = `${firstName} ${lastName}`.trim() || 'Student';

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      {/* =====================================================
          OUTER SAFE AREA
          Explicit Android spacing instead of relying on
          ScreenContainer/Header positioning.
          ===================================================== */}

      <View
        style={[
          styles.safeArea,
          {
            paddingTop: StatusBar.currentHeight || 24,
          },
        ]}
      >
        {/* ===================================================
            BACKGROUND DECORATION
            Same visual language as Dashboard.
            =================================================== */}

        <View style={styles.backgroundCircleLarge} />
        <View style={styles.backgroundCircleMedium} />
        <View style={styles.backgroundCircleSmall} />

        {/* ===================================================
            MAIN SETTINGS PANEL
            =================================================== */}

        <View style={styles.panel}>
          {/* Decorative circles inside panel */}

          <View style={styles.panelCircleOne} />
          <View style={styles.panelCircleTwo} />

          {/* =================================================
              TOP BAR
              ================================================= */}

          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              activeOpacity={0.75}
              style={styles.backButton}
            >
              <View style={styles.backButtonCircle}>
                <Text style={styles.backArrow}>‹</Text>
              </View>

              <Text style={styles.backText}>Dashboard</Text>
            </TouchableOpacity>

            <View style={styles.topStatus}>
              <View style={styles.statusDot} />

              <Text style={styles.topStatusText}>ACCOUNT</Text>
            </View>
          </View>

          {/* =================================================
              TITLE
              ================================================= */}

          <View style={styles.titleBlock}>
            <View style={styles.titleAccentRow}>
              <View style={styles.titleAccent} />

              <Text style={styles.titleEyebrow}>ACCOUNT SETTINGS</Text>
            </View>

            <Text style={styles.title}>Settings</Text>

            <Text style={styles.subtitle}>
              Manage your account and preferences.
            </Text>
          </View>

          {/* =================================================
              SCROLLABLE CONTENT
              ================================================= */}

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* =================================================
                PROFILE HERO
                ================================================= */}

            <View style={styles.profileCard}>
              <View style={styles.profileCircleLarge} />
              <View style={styles.profileCircleSmall} />

              <View style={styles.profileAvatarRing}>
                <View style={styles.profileAvatar}>
                  <Text style={styles.profileAvatarText}>{initials}</Text>
                </View>
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.profileName} numberOfLines={1}>
                  {fullName}
                </Text>

                <Text style={styles.profileEmail} numberOfLines={1}>
                  {user?.email || 'Student account'}
                </Text>

                <View style={styles.studentBadge}>
                  <View style={styles.studentBadgeDot} />

                  <Text style={styles.studentBadgeText}>STUDENT ACCOUNT</Text>
                </View>
              </View>

              <View style={styles.profileCheck}>
                <Text style={styles.profileCheckText}>✓</Text>
              </View>
            </View>

            {/* =================================================
                ACCOUNT SECTION
                ================================================= */}

            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionDot} />

                <Text style={styles.sectionTitle}>Account</Text>
              </View>

              <Text style={styles.sectionCount}>3 OPTIONS</Text>
            </View>

            <View style={styles.accountCard}>
              {/* PROFILE */}

              <SettingRow
                title="Profile"
                subtitle="View your student information"
                type="profile"
                onPress={handleProfile}
              />

              <View style={styles.divider} />

              {/* NOTIFICATIONS */}

              <SettingRow
                title="Notifications"
                subtitle={
                  notificationsEnabled
                    ? 'Attendance notifications are enabled'
                    : 'Attendance notifications are disabled'
                }
                type="notification"
                right={
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                    trackColor={{
                      false: '#CBD5E1',
                      true: '#A5B4FC',
                    }}
                    thumbColor={notificationsEnabled ? '#4F46E5' : '#F8FAFC'}
                    ios_backgroundColor="#CBD5E1"
                  />
                }
              />

              <View style={styles.divider} />

              {/* ABOUT */}

              <SettingRow
                title="About"
                subtitle="Student Attendance System"
                type="info"
                onPress={handleAbout}
              />
            </View>

            {/* =================================================
                SESSION SECTION
                ================================================= */}

            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={[styles.sectionDot, styles.sectionDotRed]} />

                <Text style={styles.sectionTitle}>Session</Text>
              </View>

              <Text style={styles.sectionCount}>SECURITY</Text>
            </View>

            <TouchableOpacity
              onPress={handleLogout}
              activeOpacity={0.78}
              style={styles.logoutCard}
            >
              <View style={styles.logoutIconCircle}>
                <Text style={styles.logoutIcon}>↪</Text>
              </View>

              <View style={styles.logoutContent}>
                <Text style={styles.logoutTitle}>Log out</Text>

                <Text style={styles.logoutSubtitle}>
                  Sign out of your student account
                </Text>
              </View>

              <View style={styles.logoutArrowCircle}>
                <Text style={styles.logoutArrow}>›</Text>
              </View>
            </TouchableOpacity>

            {/* =================================================
                FOOTER
                ================================================= */}

            <View style={styles.footer}>
              <View style={styles.footerDecoration} />

              <View style={styles.footerMark}>
                <Text style={styles.footerMarkText}>✓</Text>
              </View>

              <Text style={styles.footerTitle}>Student Attendance System</Text>

              <Text style={styles.footerSubtitle}>IIIT Pune</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

/* =============================================================
   SETTING ROW
   ============================================================= */

function SettingRow({
  title,
  subtitle,
  type,
  onPress,
  right,
}: {
  title: string;
  subtitle: string;
  type: 'profile' | 'notification' | 'info';
  onPress?: () => void;
  right?: React.ReactNode;
}) {
  const content = (
    <>
      {/* ICON */}

      <View style={styles.settingIcon}>
        {type === 'profile' && (
          <>
            <View style={styles.personHead} />
            <View style={styles.personBody} />
          </>
        )}

        {type === 'notification' && (
          <>
            <View style={styles.bellBody} />
            <View style={styles.bellBottom} />
          </>
        )}

        {type === 'info' && <Text style={styles.infoIcon}>i</Text>}
      </View>

      {/* TEXT */}

      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>

        <Text style={styles.settingSubtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>

      {/* RIGHT SIDE */}

      {right ? (
        right
      ) : (
        <View style={styles.settingArrowCircle}>
          <Text style={styles.settingArrow}>›</Text>
        </View>
      )}
    </>
  );

  if (!onPress) {
    return <View style={styles.settingRow}>{content}</View>;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.72}
      style={styles.settingRow}
    >
      {content}
    </TouchableOpacity>
  );
}

/* =============================================================
   STYLES
   ============================================================= */

const styles = StyleSheet.create({
  /* ===========================================================
     SCREEN
     =========================================================== */

  screen: {
    flex: 1,
    backgroundColor: '#F5F7FF',
  },

  safeArea: {
    flex: 1,
    paddingHorizontal: 12,
    paddingBottom: 12,
    position: 'relative',
  },

  /* ===========================================================
     BACKGROUND
     =========================================================== */

  backgroundCircleLarge: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#E9E7FF',
    top: -120,
    right: -115,
    opacity: 0.8,
  },

  backgroundCircleMedium: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#E8F2FF',
    bottom: 45,
    left: -95,
    opacity: 0.8,
  },

  backgroundCircleSmall: {
    position: 'absolute',
    width: 85,
    height: 85,
    borderRadius: 43,
    borderWidth: 13,
    borderColor: '#ECEBFA',
    right: -30,
    bottom: 150,
  },

  /* ===========================================================
     MAIN PANEL
     =========================================================== */

  panel: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#DDE3EA',
    overflow: 'hidden',
    position: 'relative',
  },

  panelCircleOne: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: '#EEF2FF',
    right: -105,
    top: 115,
    opacity: 0.75,
  },

  panelCircleTwo: {
    position: 'absolute',
    width: 95,
    height: 95,
    borderRadius: 48,
    backgroundColor: '#F1F5FF',
    left: -55,
    bottom: 170,
  },

  /* ===========================================================
     TOP BAR
     =========================================================== */

  topBar: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 5,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingRight: 10,
  },

  backButtonCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  backArrow: {
    color: '#4F46E5',
    fontSize: 27,
    lineHeight: 29,
    fontWeight: '400',
    marginTop: -2,
  },

  backText: {
    color: '#4F46E5',
    fontSize: 13,
    fontWeight: '700',
  },

  topStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
    marginRight: 6,
  },

  topStatusText: {
    color: '#64748B',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },

  /* ===========================================================
     TITLE
     =========================================================== */

  titleBlock: {
    paddingHorizontal: 20,
    paddingTop: 9,
    paddingBottom: 18,
  },

  titleAccentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  titleAccent: {
    width: 24,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#9A804F',
    marginRight: 7,
  },

  titleEyebrow: {
    color: '#527C7A',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.4,
  },

  title: {
    color: '#172D38',
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.7,
  },

  subtitle: {
    color: '#78847F',
    fontSize: 12,
    marginTop: 4,
  },

  /* ===========================================================
     SCROLL
     =========================================================== */

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  /* ===========================================================
     PROFILE CARD
     =========================================================== */

  profileCard: {
    minHeight: 122,
    backgroundColor: '#312E81',
    borderRadius: 21,
    paddingHorizontal: 16,
    paddingVertical: 17,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 23,

    shadowColor: '#312E81',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.13,
    shadowRadius: 14,
    elevation: 4,
  },

  profileCircleLarge: {
    position: 'absolute',
    width: 145,
    height: 145,
    borderRadius: 73,
    backgroundColor: '#4F46E5',
    right: -62,
    top: -65,
    opacity: 0.7,
  },

  profileCircleSmall: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#6366F1',
    right: 30,
    bottom: -40,
    opacity: 0.55,
  },

  profileAvatarRing: {
    width: 67,
    height: 67,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileAvatar: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileAvatarText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
  },

  profileInfo: {
    flex: 1,
    marginLeft: 14,
    marginRight: 5,
  },

  profileName: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
  },

  profileEmail: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    marginTop: 3,
  },

  studentBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8,
  },

  studentBadgeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#A7F3D0',
    marginRight: 5,
  },

  studentBadgeText: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  profileCheck: {
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.13)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },

  profileCheckText: {
    color: '#A7F3D0',
    fontSize: 14,
    fontWeight: '800',
  },

  /* ===========================================================
     SECTION HEADERS
     =========================================================== */

  sectionHeader: {
    height: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#527C7A',
    marginRight: 7,
  },

  sectionDotRed: {
    backgroundColor: '#B45353',
  },

  sectionTitle: {
    color: '#172D38',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.1,
  },

  sectionCount: {
    color: '#9AA5A1',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },

  /* ===========================================================
     ACCOUNT CARD
     =========================================================== */

  accountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#E1E6EB',
    paddingHorizontal: 15,
    marginBottom: 23,

    shadowColor: '#172D38',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.035,
    shadowRadius: 10,
    elevation: 2,
  },

  settingRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
  },

  settingIcon: {
    width: 41,
    height: 41,
    borderRadius: 13,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  settingContent: {
    flex: 1,
    marginLeft: 13,
    marginRight: 7,
  },

  settingTitle: {
    color: '#17202B',
    fontSize: 15,
    fontWeight: '800',
  },

  settingSubtitle: {
    color: '#71808C',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },

  divider: {
    height: 1,
    backgroundColor: '#F0F3F5',
    marginLeft: 54,
  },

  settingArrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  settingArrow: {
    color: '#94A3B8',
    fontSize: 21,
    lineHeight: 23,
    marginLeft: 1,
  },

  /* ===========================================================
     PROFILE ICON
     =========================================================== */

  personHead: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#5B55D9',
    top: 9,
  },

  personBody: {
    position: 'absolute',
    width: 20,
    height: 11,
    borderTopLeftRadius: 11,
    borderTopRightRadius: 11,
    backgroundColor: '#5B55D9',
    bottom: 8,
  },

  /* ===========================================================
     NOTIFICATION ICON
     =========================================================== */

  bellBody: {
    width: 15,
    height: 17,
    borderWidth: 2,
    borderColor: '#5B55D9',
    borderRadius: 9,
  },

  bellBottom: {
    width: 7,
    height: 2,
    borderRadius: 2,
    backgroundColor: '#5B55D9',
    marginTop: 2,
  },

  /* ===========================================================
     INFO ICON
     =========================================================== */

  infoIcon: {
    color: '#5B55D9',
    fontSize: 19,
    fontWeight: '800',
  },

  /* ===========================================================
     LOGOUT
     =========================================================== */

  logoutCard: {
    minHeight: 78,
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#F1CACA',
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: '#991B1B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.035,
    shadowRadius: 10,
    elevation: 1,
  },

  logoutIconCircle: {
    width: 41,
    height: 41,
    borderRadius: 21,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoutIcon: {
    color: '#C53E3E',
    fontSize: 21,
    fontWeight: '800',
  },

  logoutContent: {
    flex: 1,
    marginLeft: 13,
  },

  logoutTitle: {
    color: '#C53E3E',
    fontSize: 15,
    fontWeight: '800',
  },

  logoutSubtitle: {
    color: '#9AA3AD',
    fontSize: 11,
    marginTop: 3,
  },

  logoutArrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoutArrow: {
    color: '#C53E3E',
    fontSize: 21,
    lineHeight: 23,
  },

  /* ===========================================================
     FOOTER
     =========================================================== */

  footer: {
    alignItems: 'center',
    marginTop: 28,
    paddingBottom: 5,
    position: 'relative',
  },

  footerDecoration: {
    width: 34,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#DDE3EA',
    marginBottom: 10,
  },

  footerMark: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },

  footerMarkText: {
    color: '#6366F1',
    fontSize: 12,
    fontWeight: '800',
  },

  footerTitle: {
    color: '#94A0AA',
    fontSize: 10,
    fontWeight: '700',
  },

  footerSubtitle: {
    color: '#C5CBD2',
    fontSize: 9,
    marginTop: 3,
  },
});
