import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, RefreshControl, Animated, Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSubjectsData, useAttendance } from '../context/AttendanceContext';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import CircularProgress from '../components/CircularProgress';
import { calcSubjectStats, calcOverallStats, getStatusCategory } from '../utils/calculations';

// ─── 🎨 GLOW TUNING — adjust these to customise the green glow ───────────────
const GLOW_COLOR   = '#5C8B6E';  // base green colour (your sage accent)
const GLOW_OPACITY = 0.18;        // 0 = invisible, 1 = fully opaque
const GLOW_RADIUS  = 250;         // size of the glow blob in dp
const GLOW_SPREAD  = 0.55;        // inner blob size relative to GLOW_RADIUS
// ─────────────────────────────────────────────────────────────────────────────

// Module-level flag: true = already animated this app session.
// Resets to false every time the JS bundle reloads (i.e. every app open).
// Stays true when user navigates away and comes back (tab switch).
let hasAnimatedThisSession = false;

const HomeScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const C = isDark ? COLORS.dark : COLORS.light;
  const insets = useSafeAreaInsets();
  const { subjects, settings, loading, reload } = useSubjectsData();
  const { attendance } = useAttendance();

  const globalTarget = settings.targetPercent ?? 75;

  const overallStats = useMemo(
    () => calcOverallStats(subjects, attendance, globalTarget),
    [subjects, attendance, globalTarget]
  );

  const subjectStats = useMemo(() =>
    subjects.map(sub => ({
      ...sub,
      stats: calcSubjectStats(sub.id, attendance, sub.targetPercent ?? globalTarget),
      target: sub.targetPercent ?? globalTarget,
    })),
    [subjects, attendance, globalTarget]
  );

  // ─── Launch animation (once per app session) ─────────────────────────────
  // fillFactor goes 0 → 1 and is multiplied into all CircularProgress %
  const animValue = useRef(new Animated.Value(hasAnimatedThisSession ? 1 : 0)).current;
  const [fillFactor, setFillFactor] = useState(hasAnimatedThisSession ? 1 : 0);

  useEffect(() => {
    // Skip if already animated, still loading, or no attendance data at all
    if (hasAnimatedThisSession || loading || overallStats.total === 0) {
      if (!loading) setFillFactor(1); // show static if no data / already animated
      return;
    }

    hasAnimatedThisSession = true;

    const id = animValue.addListener(({ value }) => setFillFactor(value));

    Animated.timing(animValue, {
      toValue: 1,
      duration: 1600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // can't use native driver for JS-driven SVG values
    }).start(() => animValue.removeListener(id));

    return () => animValue.removeListener(id);
  }, [loading, overallStats.total]);
  // ─────────────────────────────────────────────────────────────────────────

  const overallCategory = getStatusCategory(overallStats.percentage, globalTarget);

  const getProgressColor = (category) => {
    if (category === 'safe') return C.present;
    if (category === 'warning') return C.warning;
    return C.danger;
  };

  const getSubjectColor = (sub) => {
    const cat = getStatusCategory(sub.stats.percentage, sub.target);
    return getProgressColor(cat);
  };

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.bg} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} tintColor={C.accent} />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      >
        {/* Header */}
        <View style={[styles.headerArea, { paddingTop: insets.top + SPACING.md }]}>
          <View>
            <Text style={[TYPOGRAPHY.tiny, { color: C.textMuted }]}>WELCOME TO</Text>
            <Text style={[TYPOGRAPHY.h2, { color: C.text }]}>AttendX</Text>
          </View>
          <TouchableOpacity
            style={[styles.settingsBtn, { backgroundColor: C.card, borderColor: C.border }]}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={20} color={C.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Overall Attendance Hero Card */}
        <View style={[
          styles.heroCard,
          { backgroundColor: C.card, borderColor: C.border, ...(isDark ? SHADOWS.dark.medium : SHADOWS.light.medium) }
        ]}>
          {/* ── Green glow blobs — position:absolute, clipped by overflow:hidden ── */}
          <View pointerEvents="none" style={[
            styles.glowOuter,
            { width: GLOW_RADIUS, height: GLOW_RADIUS, borderRadius: GLOW_RADIUS / 2,
              backgroundColor: GLOW_COLOR, opacity: GLOW_OPACITY * 0.5 }
          ]} />
          <View pointerEvents="none" style={[
            styles.glowInner,
            { width: GLOW_RADIUS * GLOW_SPREAD, height: GLOW_RADIUS * GLOW_SPREAD,
              borderRadius: (GLOW_RADIUS * GLOW_SPREAD) / 2,
              backgroundColor: GLOW_COLOR, opacity: GLOW_OPACITY }
          ]} />
          <View style={styles.heroTop}>
            <View style={styles.heroLeft}>
              <Text style={[TYPOGRAPHY.tiny, { color: C.textMuted, letterSpacing: 1 }]}>OVERALL ATTENDANCE</Text>
              <Text style={[TYPOGRAPHY.h1, { color: C.text, marginTop: 4 }]}>
                {Math.round(overallStats.percentage * fillFactor)}%
              </Text>
              <Text style={[TYPOGRAPHY.small, { color: C.textSecondary, marginTop: 2 }]}>
                {overallStats.attended} of {overallStats.total} classes
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: `${getProgressColor(overallCategory)}20` }]}>
                <View style={[styles.statusDot, { backgroundColor: getProgressColor(overallCategory) }]} />
                <Text style={[TYPOGRAPHY.tiny, { color: getProgressColor(overallCategory) }]}>
                  {overallCategory === 'safe' ? 'On Track' : overallCategory === 'warning' ? 'Warning' : 'Critical'}
                </Text>
              </View>
            </View>
            <CircularProgress
              size={110}
              strokeWidth={10}
              percentage={Math.round(overallStats.percentage * fillFactor)}
              color={getProgressColor(overallCategory)}
              bgColor={`${getProgressColor(overallCategory)}20`}
              textColor={C.text}
              labelStyle={TYPOGRAPHY.h3}
              sublabel={`/ ${globalTarget}%`}
              sublabelStyle={{ color: C.textMuted }}
            />
          </View>

          {/* Target indicator */}
          <View style={[styles.targetRow, { borderTopColor: C.border }]}>
            <Ionicons name="flag-outline" size={14} color={C.accent} />
            <Text style={[TYPOGRAPHY.small, { color: C.textSecondary, marginLeft: 6 }]}>
              Target: <Text style={{ color: C.accent, fontFamily: 'Inter_600SemiBold' }}>{globalTarget}%</Text>
              {'  '}•{'  '}{subjects.length} subjects
            </Text>
          </View>
        </View>

        {/* Subject-wise Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[TYPOGRAPHY.h4, { color: C.text }]}>Subject Wise</Text>
            {subjects.length > 0 && (
              <Text style={[TYPOGRAPHY.tiny, { color: C.textMuted }]}>
                {subjectStats.filter(s => getStatusCategory(s.stats.percentage, s.target) === 'safe').length}/{subjects.length} safe
              </Text>
            )}
          </View>

          {subjects.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <Ionicons name="book-outline" size={40} color={C.textMuted} />
              <Text style={[TYPOGRAPHY.body, { color: C.textSecondary, marginTop: SPACING.sm, textAlign: 'center' }]}>
                No subjects yet.{'\n'}Add subjects to start tracking!
              </Text>
              <TouchableOpacity
                style={[styles.addBtn, { backgroundColor: C.accent }]}
                onPress={() => navigation.navigate('Subjects')}
                activeOpacity={0.8}
              >
                <Text style={[TYPOGRAPHY.smallMedium, { color: '#fff' }]}>+ Add Subjects</Text>
              </TouchableOpacity>
            </View>
          ) : (
            subjectStats.map(sub => {
              const cat = getStatusCategory(sub.stats.percentage, sub.target);
              const color = getProgressColor(cat);
              return (
                <SubjectCard
                  key={sub.id}
                  subject={sub}
                  stats={sub.stats}
                  color={color}
                  category={cat}
                  C={C}
                  isDark={isDark}
                  fillFactor={fillFactor}
                />
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const SubjectCard = ({ subject, stats, color, category, C, isDark, fillFactor = 1 }) => (
  <View style={[
    styles.subCard,
    { backgroundColor: C.card, borderColor: C.border, borderLeftColor: color, ...(isDark ? SHADOWS.dark.small : SHADOWS.light.small) }
  ]}>
    <View style={styles.subCardLeft}>
      {/* Name row: name shrinks, code badge stays fixed */}
      <View style={styles.subNameRow}>
        <Text
          style={[TYPOGRAPHY.bodyMedium, { color: C.text, flex: 1, flexShrink: 1 }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {subject.name}
        </Text>
        <View style={[styles.codeBadge, { backgroundColor: C.accentBg, flexShrink: 0, marginLeft: SPACING.xs }]}>
          <Text style={[TYPOGRAPHY.tiny, { color: C.accent }]} numberOfLines={1}>{subject.code}</Text>
        </View>
      </View>

      <Text style={[TYPOGRAPHY.small, { color: C.textSecondary, marginTop: 2 }]}>
        {stats.attended}/{stats.total} classes attended
      </Text>

      {/* Skip/Attend info */}
      <View style={[styles.skipRow, { backgroundColor: `${color}15`, borderColor: `${color}30` }]}>
        <Ionicons
          name={category === 'safe' ? 'checkmark-circle-outline' : 'alert-circle-outline'}
          size={13}
          color={color}
        />
        <Text style={[TYPOGRAPHY.tiny, { color, marginLeft: 4, flex: 1 }]} numberOfLines={2}>
          {category === 'safe'
            ? stats.canSkip > 0
              ? `Can skip ${stats.canSkip} more class${stats.canSkip > 1 ? 'es' : ''}`
              : 'Exactly at target — attend all!'
            : `Must attend ${stats.mustAttend} more to reach ${subject.target ?? 75}%`
          }
        </Text>
      </View>
    </View>

    <CircularProgress
      size={64}
      strokeWidth={6}
      percentage={Math.round(stats.percentage * fillFactor)}
      color={color}
      bgColor={`${color}20`}
      textColor={C.text}
      labelStyle={{ fontSize: 13, fontFamily: 'Inter_700Bold' }}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    marginHorizontal: SPACING.xl,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    overflow: 'hidden',   // clips the glow blobs to card bounds
  },
  // Glow blob positioned bottom-right corner
  glowOuter: {
    position: 'absolute',
    bottom: -GLOW_RADIUS * 0.35,
    right:  -GLOW_RADIUS * 0.35,
  },
  glowInner: {
    position: 'absolute',
    bottom: -GLOW_RADIUS * GLOW_SPREAD * 0.3,
    right:  -GLOW_RADIUS * GLOW_SPREAD * 0.3,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLeft: {
    flex: 1,
    marginRight: SPACING.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginTop: SPACING.sm,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
  },
  section: {
    paddingHorizontal: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  subCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  subCardLeft: {
    flex: 1,
    marginRight: SPACING.md,
  },
  subNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  codeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  skipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  emptyCard: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.xxxl,
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  addBtn: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
});

export default HomeScreen;
