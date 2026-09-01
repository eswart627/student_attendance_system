import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Header, ScreenContainer } from '../components';
import {
  getStudentAttendance,
  StudentAttendance,
} from '../services/attendanceService';
import type { MainStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'Attendance'> & {
  token: string;
  studentId: string | number;
};

export default function AttendanceScreen({
  navigation,
  token,
  studentId,
}: Props) {
  const [attendance, setAttendance] = useState<StudentAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAttendance = useCallback(async () => {
    try {
      const response = await getStudentAttendance(token, studentId);

      if (!response.success) {
        throw new Error(response.message || 'Could not load attendance.');
      }

      setAttendance(response.attendance || []);
    } catch (error: any) {
      console.error('ATTENDANCE SCREEN ERROR:', error);

      Alert.alert(
        'Unable to load attendance',
        error?.message || 'Something went wrong while loading attendance.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, studentId]);

  React.useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAttendance();
  };

  const handleBack = () => {
    navigation.goBack();
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

  const overallValue = Number(overallPercentage) || 0;

  /* ============================================================
     LOADING
     ============================================================ */

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScreenContainer scroll={false}>
          <View style={styles.loadingScreen}>
            <View style={styles.topArea}>
              <BackButton onPress={handleBack} />

              <Header
                title="Attendance"
                subtitle="Your attendance by subject"
              />
            </View>

            <View style={styles.loadingContainer}>
              <View style={styles.loadingCard}>
                <View style={styles.loadingIcon}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                </View>

                <Text style={styles.loadingTitle}>Loading attendance</Text>

                <Text style={styles.loadingMessage}>
                  Fetching your latest attendance records...
                </Text>
              </View>
            </View>
          </View>
        </ScreenContainer>
      </SafeAreaView>
    );
  }

  /* ============================================================
     MAIN SCREEN
     ============================================================ */

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScreenContainer scroll={false}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#111827"
              colors={['#111827']}
            />
          }
          contentContainerStyle={styles.scrollContent}
        >
          {/* ==================================================
              TOP / BACK BUTTON
              ================================================== */}

          <View style={styles.topArea}>
            <BackButton onPress={handleBack} />

            <Header title="Attendance" subtitle="Your attendance by subject" />
          </View>

          <View style={styles.content}>
            {/* ==================================================
                OVERALL ATTENDANCE
                ================================================== */}

            <View style={styles.overallCard}>
              <View style={styles.overallTopRow}>
                <View>
                  <Text style={styles.overallEyebrow}>OVERALL ATTENDANCE</Text>

                  <Text style={styles.overallPercentage}>
                    {overallPercentage}%
                  </Text>
                </View>

                <View
                  style={[
                    styles.overallBadge,
                    overallValue >= 75 && styles.overallBadgeGood,
                    overallValue >= 60 &&
                      overallValue < 75 &&
                      styles.overallBadgeAverage,
                    overallValue < 60 && styles.overallBadgeLow,
                  ]}
                >
                  <View
                    style={[
                      styles.overallBadgeDot,
                      overallValue >= 75 && styles.overallBadgeDotGood,
                      overallValue >= 60 &&
                        overallValue < 75 &&
                        styles.overallBadgeDotAverage,
                      overallValue < 60 && styles.overallBadgeDotLow,
                    ]}
                  />

                  <Text style={styles.overallBadgeText}>
                    {overallValue >= 75
                      ? 'Good'
                      : overallValue >= 60
                      ? 'Average'
                      : 'Low'}
                  </Text>
                </View>
              </View>

              <Text style={styles.overallSubtext}>
                {totalPresent} of {totalClasses} classes attended
              </Text>

              <View style={styles.overallProgressTrack}>
                <View
                  style={[
                    styles.overallProgressFill,
                    {
                      width: `${Math.min(Math.max(overallValue, 0), 100)}%`,
                    },
                  ]}
                />
              </View>

              <View style={styles.overallFooter}>
                <Text style={styles.overallFooterText}>
                  Attendance progress
                </Text>

                <Text style={styles.overallFooterText}>
                  {overallPercentage}%
                </Text>
              </View>
            </View>

            {/* ==================================================
                SUBJECTS HEADER
                ================================================== */}

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Subjects</Text>

                <Text style={styles.sectionSubtitle}>Attendance breakdown</Text>
              </View>

              {attendance.length > 0 && (
                <View style={styles.subjectCount}>
                  <Text style={styles.subjectCountText}>
                    {attendance.length}
                  </Text>
                </View>
              )}
            </View>

            {/* ==================================================
                EMPTY STATE
                ================================================== */}

            {attendance.length === 0 ? (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIcon}>
                  <Text style={styles.emptyIconText}>%</Text>
                </View>

                <Text style={styles.emptyTitle}>No attendance data</Text>

                <Text style={styles.emptyMessage}>
                  Attendance information will appear here once classes are
                  recorded.
                </Text>
              </View>
            ) : (
              attendance.map(course => (
                <CourseAttendanceCard
                  key={String(course.courseId)}
                  course={course}
                />
              ))
            )}
          </View>
        </ScrollView>
      </ScreenContainer>
    </SafeAreaView>
  );
}

/* ==============================================================
   BACK BUTTON
   ============================================================== */

function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.backButton,
        pressed && styles.backButtonPressed,
      ]}
      hitSlop={8}
    >
      <Text style={styles.backArrow}>‹</Text>

      <Text style={styles.backText}>Back</Text>
    </Pressable>
  );
}

/* ==============================================================
   COURSE ATTENDANCE CARD
   ============================================================== */

function CourseAttendanceCard({ course }: { course: StudentAttendance }) {
  const percentage = Number(course.percentage) || 0;

  const safePercentage = Math.min(Math.max(percentage, 0), 100);

  const percentageText = `${percentage.toFixed(1)}%`;

  const isGood = percentage >= 75;

  const isAverage = percentage >= 60 && percentage < 75;

  const isLow = percentage < 60;

  const progressColor = isGood ? '#16A34A' : isAverage ? '#D97706' : '#DC2626';

  const statusText = isGood
    ? 'Good attendance'
    : isAverage
    ? 'Needs attention'
    : 'Low attendance';

  return (
    <View style={styles.courseCard}>
      <View style={styles.courseHeader}>
        <View style={styles.courseInfo}>
          <Text style={styles.courseName} numberOfLines={2}>
            {course.courseName}
          </Text>

          <View style={styles.courseCodePill}>
            <Text style={styles.courseCode}>{course.courseCode}</Text>
          </View>
        </View>

        <View
          style={[
            styles.percentageContainer,
            isGood && styles.percentageContainerGood,
            isAverage && styles.percentageContainerAverage,
            isLow && styles.percentageContainerLow,
          ]}
        >
          <Text
            style={[
              styles.percentageText,
              {
                color: progressColor,
              },
            ]}
          >
            {percentageText}
          </Text>
        </View>
      </View>

      <View style={styles.courseStatusRow}>
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor: progressColor,
            },
          ]}
        />

        <Text
          style={[
            styles.courseStatus,
            {
              color: progressColor,
            },
          ]}
        >
          {statusText}
        </Text>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${safePercentage}%`,
              backgroundColor: progressColor,
            },
          ]}
        />
      </View>

      <View style={styles.courseFooter}>
        <Text style={styles.courseFooterText}>{course.present} present</Text>

        <View style={styles.footerDivider} />

        <Text style={styles.courseFooterText}>
          {course.total} total classes
        </Text>

        <View style={styles.footerSpacer} />

        <Text style={styles.courseFooterPercentage}>{percentageText}</Text>
      </View>
    </View>
  );
}

/* ==============================================================
   STYLES
   ============================================================== */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  scrollContent: {
    paddingTop: 6,
    paddingBottom: 40,
  },

  topArea: {
    paddingHorizontal: 24,
    paddingTop: 4,
  },

  backButton: {
    alignSelf: 'flex-start',

    flexDirection: 'row',

    alignItems: 'center',

    minHeight: 38,

    paddingHorizontal: 4,

    marginBottom: 2,
  },

  backButtonPressed: {
    opacity: 0.55,
  },

  backArrow: {
    fontSize: 31,

    lineHeight: 31,

    fontWeight: '300',

    color: '#111827',

    marginRight: 3,

    marginTop: -2,
  },

  backText: {
    fontSize: 14,

    fontWeight: '700',

    color: '#4B5563',
  },

  content: {
    width: '100%',

    paddingHorizontal: 24,

    paddingTop: 10,

    alignSelf: 'center',
  },

  /* ============================================================
     OVERALL CARD
     ============================================================ */

  overallCard: {
    backgroundColor: '#111827',

    borderRadius: 22,

    paddingHorizontal: 22,
    paddingVertical: 22,

    marginBottom: 28,

    overflow: 'hidden',

    borderWidth: 1,

    borderColor: 'rgba(255, 255, 255, 0.05)',
  },

  overallTopRow: {
    flexDirection: 'row',

    alignItems: 'flex-start',

    justifyContent: 'space-between',
  },

  overallEyebrow: {
    color: '#9CA3AF',

    fontSize: 11,

    fontWeight: '800',

    letterSpacing: 1.2,
  },

  overallPercentage: {
    color: '#FFFFFF',

    fontSize: 38,

    fontWeight: '800',

    letterSpacing: -1.2,

    marginTop: 3,
  },

  overallBadge: {
    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: 11,
    paddingVertical: 7,

    borderRadius: 999,

    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },

  overallBadgeGood: {
    backgroundColor: 'rgba(22, 163, 74, 0.16)',
  },

  overallBadgeAverage: {
    backgroundColor: 'rgba(217, 119, 6, 0.16)',
  },

  overallBadgeLow: {
    backgroundColor: 'rgba(220, 38, 38, 0.16)',
  },

  overallBadgeDot: {
    width: 6,
    height: 6,

    borderRadius: 999,

    backgroundColor: '#9CA3AF',

    marginRight: 6,
  },

  overallBadgeDotGood: {
    backgroundColor: '#4ADE80',
  },

  overallBadgeDotAverage: {
    backgroundColor: '#FBBF24',
  },

  overallBadgeDotLow: {
    backgroundColor: '#F87171',
  },

  overallBadgeText: {
    color: '#E5E7EB',

    fontSize: 12,

    fontWeight: '700',
  },

  overallSubtext: {
    color: '#9CA3AF',

    fontSize: 14,

    marginTop: 3,
  },

  overallProgressTrack: {
    height: 7,

    borderRadius: 999,

    backgroundColor: 'rgba(255, 255, 255, 0.10)',

    overflow: 'hidden',

    marginTop: 20,
  },

  overallProgressFill: {
    height: '100%',

    borderRadius: 999,

    backgroundColor: '#FFFFFF',
  },

  overallFooter: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    marginTop: 10,
  },

  overallFooterText: {
    color: '#6B7280',

    fontSize: 11,

    fontWeight: '600',
  },

  /* ============================================================
     SECTION
     ============================================================ */

  sectionHeader: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 20,

    fontWeight: '800',

    color: '#111827',

    letterSpacing: -0.3,
  },

  sectionSubtitle: {
    fontSize: 13,

    color: '#9CA3AF',

    marginTop: 2,
  },

  subjectCount: {
    minWidth: 30,

    height: 30,

    paddingHorizontal: 9,

    alignItems: 'center',

    justifyContent: 'center',

    borderRadius: 999,

    backgroundColor: '#F3F4F6',
  },

  subjectCountText: {
    color: '#4B5563',

    fontSize: 12,

    fontWeight: '800',
  },

  /* ============================================================
     COURSE CARD
     ============================================================ */

  courseCard: {
    backgroundColor: '#FFFFFF',

    borderRadius: 18,

    padding: 18,

    marginBottom: 12,

    borderWidth: 1,

    borderColor: '#F0F1F3',

    shadowColor: '#111827',

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.04,

    shadowRadius: 8,

    elevation: 1,
  },

  courseHeader: {
    flexDirection: 'row',

    alignItems: 'flex-start',

    justifyContent: 'space-between',
  },

  courseInfo: {
    flex: 1,

    paddingRight: 14,
  },

  courseName: {
    fontSize: 17,

    fontWeight: '800',

    color: '#111827',

    lineHeight: 22,
  },

  courseCodePill: {
    alignSelf: 'flex-start',

    marginTop: 7,

    paddingHorizontal: 8,

    paddingVertical: 4,

    borderRadius: 6,

    backgroundColor: '#F3F4F6',
  },

  courseCode: {
    fontSize: 11,

    fontWeight: '700',

    color: '#6B7280',

    letterSpacing: 0.4,
  },

  percentageContainer: {
    minWidth: 65,

    alignItems: 'center',

    justifyContent: 'center',

    paddingHorizontal: 9,

    paddingVertical: 8,

    borderRadius: 12,

    backgroundColor: '#F9FAFB',
  },

  percentageContainerGood: {
    backgroundColor: 'rgba(22, 163, 74, 0.08)',
  },

  percentageContainerAverage: {
    backgroundColor: 'rgba(217, 119, 6, 0.08)',
  },

  percentageContainerLow: {
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
  },

  percentageText: {
    fontSize: 19,

    fontWeight: '800',

    letterSpacing: -0.3,
  },

  /* ============================================================
     STATUS
     ============================================================ */

  courseStatusRow: {
    flexDirection: 'row',

    alignItems: 'center',

    marginTop: 17,
  },

  statusDot: {
    width: 6,

    height: 6,

    borderRadius: 999,

    marginRight: 7,
  },

  courseStatus: {
    fontSize: 12,

    fontWeight: '700',
  },

  /* ============================================================
     PROGRESS
     ============================================================ */

  progressTrack: {
    height: 8,

    backgroundColor: '#EEF0F2',

    borderRadius: 999,

    overflow: 'hidden',

    marginTop: 9,
  },

  progressFill: {
    height: '100%',

    borderRadius: 999,
  },

  /* ============================================================
     FOOTER
     ============================================================ */

  courseFooter: {
    flexDirection: 'row',

    alignItems: 'center',

    marginTop: 12,
  },

  courseFooterText: {
    color: '#6B7280',

    fontSize: 12,

    fontWeight: '500',
  },

  footerDivider: {
    width: 3,

    height: 3,

    borderRadius: 999,

    backgroundColor: '#D1D5DB',

    marginHorizontal: 7,
  },

  footerSpacer: {
    flex: 1,
  },

  courseFooterPercentage: {
    color: '#9CA3AF',

    fontSize: 12,

    fontWeight: '700',
  },

  /* ============================================================
     EMPTY
     ============================================================ */

  emptyCard: {
    backgroundColor: '#FFFFFF',

    borderRadius: 18,

    paddingHorizontal: 24,

    paddingVertical: 30,

    alignItems: 'center',

    borderWidth: 1,

    borderColor: '#F0F1F3',
  },

  emptyIcon: {
    width: 52,

    height: 52,

    alignItems: 'center',

    justifyContent: 'center',

    borderRadius: 16,

    backgroundColor: '#F3F4F6',
  },

  emptyIconText: {
    fontSize: 23,

    fontWeight: '800',

    color: '#6B7280',
  },

  emptyTitle: {
    fontSize: 17,

    fontWeight: '800',

    color: '#111827',

    marginTop: 16,
  },

  emptyMessage: {
    color: '#6B7280',

    fontSize: 13,

    lineHeight: 20,

    textAlign: 'center',

    marginTop: 7,

    maxWidth: 290,
  },

  /* ============================================================
     LOADING
     ============================================================ */

  loadingScreen: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,

    justifyContent: 'center',

    paddingHorizontal: 24,

    paddingBottom: 40,
  },

  loadingCard: {
    alignItems: 'center',

    paddingVertical: 34,

    paddingHorizontal: 24,

    borderRadius: 20,

    backgroundColor: '#FFFFFF',

    borderWidth: 1,

    borderColor: '#F0F1F3',
  },

  loadingIcon: {
    width: 46,

    height: 46,

    alignItems: 'center',

    justifyContent: 'center',

    borderRadius: 14,

    backgroundColor: '#111827',
  },

  loadingTitle: {
    marginTop: 15,

    fontSize: 17,

    fontWeight: '800',

    color: '#111827',
  },

  loadingMessage: {
    marginTop: 6,

    fontSize: 13,

    lineHeight: 19,

    color: '#6B7280',

    textAlign: 'center',
  },
});
