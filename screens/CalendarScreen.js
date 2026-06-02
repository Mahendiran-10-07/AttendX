import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, StatusBar, TouchableOpacity,
  Modal, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSubjectsData, useAttendance } from '../context/AttendanceContext';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';
import { toDateString } from '../utils/calculations';

const STATUS_EMOJI = { present: '✅', absent: '❌', holiday: '🏖️' };
const STATUS_LABEL = { present: 'Present', absent: 'Absent', holiday: 'Holiday' };

// Generate all Sundays ± 2 years from now
const getSundayMarks = (C) => {
  const marks = {};
  const now = new Date();
  const startYear = now.getFullYear() - 1;
  const endYear = now.getFullYear() + 2;
  for (let y = startYear; y <= endYear; y++) {
    for (let m = 0; m < 12; m++) {
      const days = new Date(y, m + 1, 0).getDate();
      for (let d = 1; d <= days; d++) {
        if (new Date(y, m, d).getDay() === 0) {
          const ds = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          marks[ds] = 'sunday';
        }
      }
    }
  }
  return marks;
};

const CalendarScreen = () => {
  const { isDark, theme } = useTheme();
  const C = isDark ? COLORS.dark : COLORS.light;
  const insets = useSafeAreaInsets();
  const { subjects } = useSubjectsData();
  const { attendance } = useAttendance();

  const [selectedDate, setSelectedDate] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const today = toDateString(new Date());
  const sundaySet = useMemo(() => getSundayMarks(C), []);

  const markedDates = useMemo(() => {
    const marks = {};
    // Build set of active subject IDs for fast lookup
    const activeSubjectIds = new Set(subjects.map(s => s.id));

    // First: attendance marks — only for currently active subjects
    Object.entries(attendance).forEach(([date, records]) => {
      if (sundaySet[date]) return; // skip sundays

      // Filter to only records belonging to current subjects
      const relevantValues = Object.entries(records)
        .filter(([k, v]) => {
          if (!v || v === '') return false;
          if (k.startsWith('_')) return false; // skip _day_holiday etc.
          const subjectId = k.split('_h')[0];
          return activeSubjectIds.has(subjectId);
        })
        .map(([, v]) => v);

      if (!relevantValues.length) return; // no active subject records → no mark

      const hasAbsent = relevantValues.some(v => v === 'absent');
      const allHoliday = relevantValues.every(v => v === 'holiday');
      const dotColor = allHoliday ? C.holiday : hasAbsent ? C.absent : C.present;

      marks[date] = {
        customStyles: {
          container: { backgroundColor: dotColor + '25', borderRadius: 8, borderWidth: 1.5, borderColor: dotColor },
          text: { color: isDark ? '#FFF' : '#1A1A1A', fontWeight: '700' },
        },
      };
    });

    // Sundays — holiday styled, disabled
    Object.keys(sundaySet).forEach(ds => {
      if (!marks[ds]) {
        marks[ds] = {
          customStyles: {
            container: { backgroundColor: C.holiday + '18', borderRadius: 8 },
            text: { color: C.holiday, opacity: 0.6 },
          },
        };
      }
    });

    // Today border
    if (!marks[today]) {
      marks[today] = {
        customStyles: {
          container: { borderRadius: 8, borderWidth: 2, borderColor: C.accent },
          text: { color: C.accent, fontWeight: '700' },
        },
      };
    }
    return marks;
  }, [attendance, subjects, C, isDark, today, sundaySet]);

  const handleDayPress = (day) => {
    if (sundaySet[day.dateString]) return; // block Sunday
    const dateStr = day.dateString;
    const rec = attendance[dateStr];
    if (rec && Object.values(rec).some(v => v && v !== '')) {
      setSelectedDate(dateStr);
      setDetailVisible(true);
    }
  };

  const getDateDetail = (dateStr) => {
    if (!dateStr || !attendance[dateStr]) return [];
    return Object.entries(attendance[dateStr])
      .filter(([k, v]) => v && v !== '' && !k.startsWith('_'))
      .map(([key, status]) => {
        const [subjectId, hourPart] = key.split('_h');
        const subject = subjects.find(s => s.id === subjectId);
        return subject ? { subject, hour: Number(hourPart), status } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.hour - b.hour);
  };

  const detailData = getDateDetail(selectedDate);
  const getStatusColor = (s) => s === 'present' ? C.present : s === 'absent' ? C.absent : C.holiday;
  const summary = detailData.reduce((acc, i) => { acc[i.status] = (acc[i.status] || 0) + 1; return acc; }, {});

  const formattedDate = selectedDate
    ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  const calTheme = {
    backgroundColor: C.card, calendarBackground: C.card,
    textSectionTitleColor: C.textMuted, dayTextColor: C.text,
    todayTextColor: C.accent, monthTextColor: C.text, arrowColor: C.accent,
    textDisabledColor: C.textMuted + '50',
    textDayFontFamily: 'Inter_400Regular', textMonthFontFamily: 'Inter_700Bold',
    textDayHeaderFontFamily: 'Inter_500Medium',
    textDayFontSize: 14, textMonthFontSize: 16, textDayHeaderFontSize: 12,
  };

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.bg} />
      <View style={[styles.headerArea, { paddingTop: insets.top + SPACING.md }]}>
        <Text style={[TYPOGRAPHY.h2, { color: C.text }]}>Calendar</Text>
        <Text style={[TYPOGRAPHY.small, { color: C.textMuted }]}>Tap a marked date for details</Text>
      </View>

      <View style={[styles.calendarWrap, { backgroundColor: C.card, borderColor: C.border }]}>
        <Calendar
          key={theme}
          markingType="custom"
          markedDates={markedDates}
          onDayPress={handleDayPress}
          theme={calTheme}
          style={{ borderRadius: RADIUS.xl }}
        />
      </View>

      <View style={[styles.legend, { backgroundColor: C.card, borderColor: C.border }]}>
        {[
          { color: C.present, label: 'All Present' },
          { color: C.absent, label: 'Any Absent' },
          { color: C.holiday, label: 'Holiday/Sun' },
          { color: C.accent, label: 'Today' },
        ].map(item => (
          <View key={item.label} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text style={[TYPOGRAPHY.tiny, { color: C.textSecondary }]}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Detail Modal — no dim overlay */}
      <Modal visible={detailVisible} transparent animationType="slide" onRequestClose={() => setDetailVisible(false)}>
        <View style={{ flex: 1 }}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setDetailVisible(false)} />
          <View style={[styles.sheet, { backgroundColor: C.card }]}>
            <View style={[styles.handle, { backgroundColor: C.border }]} />
            <View style={styles.sheetHeader}>
              <View>
                <Text style={[TYPOGRAPHY.h4, { color: C.text }]}>{formattedDate}</Text>
                <Text style={[TYPOGRAPHY.small, { color: C.textMuted }]}>{detailData.length} class{detailData.length !== 1 ? 'es' : ''} recorded</Text>
              </View>
              <TouchableOpacity onPress={() => setDetailVisible(false)} activeOpacity={0.7}>
                <Ionicons name="close-circle-outline" size={24} color={C.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.summaryRow}>
              {Object.entries(summary).map(([status, count]) => (
                <View key={status} style={[styles.summaryChip, { backgroundColor: getStatusColor(status) + '20', borderColor: getStatusColor(status) + '50' }]}>
                  <Text style={{ fontSize: 13 }}>{STATUS_EMOJI[status]}</Text>
                  <Text style={[TYPOGRAPHY.smallMedium, { color: getStatusColor(status), marginLeft: 4 }]}>{count} {STATUS_LABEL[status]}</Text>
                </View>
              ))}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 320 }}>
              {detailData.map((item, idx) => (
                <View key={idx} style={[styles.detailRow, { borderColor: C.border, backgroundColor: C.bg }]}>
                  <View style={[styles.hourBadge, { backgroundColor: C.accentBg }]}>
                    <Text style={[TYPOGRAPHY.tiny, { color: C.accent }]}>H{item.hour}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]} numberOfLines={1}>{item.subject.name}</Text>
                    <Text style={[TYPOGRAPHY.tiny, { color: C.textMuted }]}>{item.subject.code}</Text>
                  </View>
                  <View style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) + '20', borderColor: getStatusColor(item.status) + '50' }]}>
                    <Text style={{ fontSize: 12 }}>{STATUS_EMOJI[item.status]}</Text>
                    <Text style={[TYPOGRAPHY.tiny, { color: getStatusColor(item.status), marginLeft: 3 }]}>{STATUS_LABEL[item.status]}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerArea: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.md },
  calendarWrap: { marginHorizontal: SPACING.lg, borderRadius: RADIUS.xl, borderWidth: 1, overflow: 'hidden', marginBottom: SPACING.md },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: SPACING.sm, marginHorizontal: SPACING.xl, padding: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  dot: { width: 8, height: 8, borderRadius: 4 },
  sheet: { borderTopLeftRadius: RADIUS.xxl, borderTopRightRadius: RADIUS.xxl, padding: SPACING.xl, paddingBottom: 36 },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: SPACING.lg },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.md },
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md },
  summaryChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.sm, paddingVertical: 5, borderRadius: RADIUS.full, borderWidth: 1 },
  detailRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, gap: SPACING.sm },
  hourBadge: { width: 32, height: 32, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statusChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.full, borderWidth: 1, flexShrink: 0 },
});

export default CalendarScreen;
