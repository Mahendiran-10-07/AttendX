import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { useSubjectsData, useAttendance } from '../context/AttendanceContext';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import DateNavigator from '../components/DateNavigator';
import AttendanceButton from '../components/AttendanceButton';
import DatePickerModal from '../components/DatePickerModal';
import { toDateString, getDayName, formatDateLabel } from '../utils/calculations';

const MarkScreen = () => {
  const { isDark } = useTheme();
  const C = isDark ? COLORS.dark : COLORS.light;
  const insets = useSafeAreaInsets();
  const { getSubjectsForDay, subjects } = useSubjectsData();
  const { getDateRecords, markSingle, markDay } = useAttendance();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [localRecords, setLocalRecords] = useState({});

  const dateStr = toDateString(selectedDate);
  const dayName = getDayName(selectedDate);
  const isSunday = selectedDate.getDay() === 0;

  const scheduledSlots = useMemo(() => getSubjectsForDay(dayName), [dayName, getSubjectsForDay]);
  const savedRecords = useMemo(() => getDateRecords(dateStr), [dateStr, getDateRecords]);
  const records = useMemo(() => ({ ...savedRecords, ...localRecords }), [savedRecords, localRecords]);

  // Day-level holiday: check if _day_holiday key exists
  const isDayHoliday = !!records['_day_holiday'];

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setLocalRecords({});
  };

  const handleMark = (subjectId, hour, status) => {
    const key = `${subjectId}_h${hour}`;
    const next = records[key] === status ? null : status;
    const updated = { ...localRecords, [key]: next ?? '' };
    setLocalRecords(updated);
    markSingle(dateStr, subjectId, hour, next ?? ''); // instant, no await
  };

  const handleMarkAll = (status) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const allSlots = scheduledSlots.length > 0 ? scheduledSlots : subjects.map((s, i) => ({ hour: i + 1, subject: s }));
    const newRecords = {};
    allSlots.forEach(({ hour, subject }) => { newRecords[`${subject.id}_h${hour}`] = status; });
    setLocalRecords(newRecords);
    markDay(dateStr, { ...savedRecords, ...newRecords }); // instant, no await
  };

  // Toggle day-level holiday
  const handleDayHoliday = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (isDayHoliday) {
      setLocalRecords({ '_day_holiday': '' });
      markDay(dateStr, {}); // instant
    } else {
      const allSlots = scheduledSlots.length > 0 ? scheduledSlots : subjects.map((s, i) => ({ hour: i + 1, subject: s }));
      const newRecords = { '_day_holiday': 'yes' };
      allSlots.forEach(({ hour, subject }) => { newRecords[`${subject.id}_h${hour}`] = 'holiday'; });
      setLocalRecords(newRecords);
      markDay(dateStr, newRecords); // instant
    }
  };

  const getStatus = (subjectId, hour) => records[`${subjectId}_h${hour}`] || null;

  const allSlots = scheduledSlots.length > 0
    ? scheduledSlots
    : subjects.map((s, i) => ({ hour: i + 1, subject: s }));

  const hasAnyMarked = Object.entries(records).some(([k, v]) => !k.startsWith('_') && v && v !== '');
  const presentCount = Object.entries(records).filter(([k, v]) => !k.startsWith('_') && v === 'present').length;
  const absentCount = Object.entries(records).filter(([k, v]) => !k.startsWith('_') && v === 'absent').length;

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.bg} />

      {/* Header */}
      <View style={[styles.headerArea, { paddingTop: insets.top + SPACING.md }]}>
        <Text style={[TYPOGRAPHY.h2, { color: C.text }]}>Mark Attendance</Text>
        <TouchableOpacity
          style={[styles.calIconBtn, { backgroundColor: C.card, borderColor: C.border }]}
          onPress={() => setPickerVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="calendar-outline" size={18} color={C.accent} />
        </TouchableOpacity>
      </View>

      <DateNavigator date={selectedDate} onDateChange={handleDateChange} colors={C} />

      {/* Sunday Banner */}
      {isSunday && (
        <View style={[styles.holidayBanner, { backgroundColor: C.holidayBg, borderColor: C.holiday + '60' }]}>
          <Text style={{ fontSize: 22 }}>🏖️</Text>
          <View style={{ marginLeft: SPACING.sm }}>
            <Text style={[TYPOGRAPHY.h4, { color: C.holiday }]}>Sunday — Day Off</Text>
            <Text style={[TYPOGRAPHY.small, { color: C.textMuted }]}>No classes today</Text>
          </View>
        </View>
      )}

      {/* Day Holiday Banner */}
      {!isSunday && isDayHoliday && (
        <View style={[styles.holidayBanner, { backgroundColor: C.holidayBg, borderColor: C.holiday + '60' }]}>
          <Text style={{ fontSize: 22 }}>🏖️</Text>
          <View style={{ flex: 1, marginLeft: SPACING.sm }}>
            <Text style={[TYPOGRAPHY.h4, { color: C.holiday }]}>Holiday</Text>
            <Text style={[TYPOGRAPHY.small, { color: C.textMuted }]}>Entire day marked as holiday</Text>
          </View>
          <TouchableOpacity
            style={[styles.removeHoliday, { borderColor: C.holiday }]}
            onPress={handleDayHoliday}
            activeOpacity={0.7}
          >
            <Text style={[TYPOGRAPHY.tiny, { color: C.holiday }]}>Remove</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bulk Actions — only if not Sunday and not holiday */}
      {!isSunday && !isDayHoliday && allSlots.length > 0 && (
        <View style={styles.bulkRow}>
          <TouchableOpacity
            style={[styles.bulkBtn, { backgroundColor: C.presentBg, borderColor: C.present }]}
            onPress={() => handleMarkAll('present')}
            activeOpacity={0.75}
          >
            <Text style={{ fontSize: 12 }}>✅</Text>
            <Text style={[TYPOGRAPHY.smallMedium, { color: C.present, marginLeft: 5 }]}>All Present</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bulkBtn, { backgroundColor: C.absentBg, borderColor: C.absent }]}
            onPress={() => handleMarkAll('absent')}
            activeOpacity={0.75}
          >
            <Text style={{ fontSize: 12 }}>❌</Text>
            <Text style={[TYPOGRAPHY.smallMedium, { color: C.absent, marginLeft: 5 }]}>All Absent</Text>
          </TouchableOpacity>

          {/* Day Holiday Button */}
          <TouchableOpacity
            style={[styles.bulkBtn, { backgroundColor: C.holidayBg, borderColor: C.holiday }]}
            onPress={handleDayHoliday}
            activeOpacity={0.75}
          >
            <Text style={{ fontSize: 12 }}>🏖️</Text>
            <Text style={[TYPOGRAPHY.smallMedium, { color: C.holiday, marginLeft: 5 }]}>Holiday</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Subject List */}
      {!isSunday && !isDayHoliday && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 90, paddingHorizontal: SPACING.xl }}
        >
          {allSlots.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={{ fontSize: 40 }}>📅</Text>
              <Text style={[TYPOGRAPHY.body, { color: C.textSecondary, marginTop: SPACING.sm, textAlign: 'center' }]}>
                No subjects scheduled for {dayName}.{'\n'}Set up your timetable first!
              </Text>
            </View>
          ) : (
            allSlots.map(({ hour, subject }) => {
              const status = getStatus(subject.id, hour);
              return (
                <AttendanceRow
                  key={`${subject.id}_h${hour}`}
                  subject={subject}
                  hour={hour}
                  status={status}
                  onMark={(s) => handleMark(subject.id, hour, s)}
                  C={C}
                  isDark={isDark}
                />
              );
            })
          )}

          {/* Summary */}
          {hasAnyMarked && (
            <View style={[styles.summaryCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={[TYPOGRAPHY.smallMedium, { color: C.text, marginBottom: SPACING.sm }]}>Today's Summary</Text>
              <View style={styles.summaryRow}>
                {[
                  { label: 'Present', count: presentCount, color: C.present },
                  { label: 'Absent', count: absentCount, color: C.absent },
                  { label: 'Pending', count: allSlots.length - presentCount - absentCount, color: C.textMuted },
                ].map(item => (
                  <View key={item.label} style={styles.summaryItem}>
                    <Text style={[TYPOGRAPHY.h3, { color: item.color }]}>{item.count}</Text>
                    <Text style={[TYPOGRAPHY.tiny, { color: C.textMuted }]}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}

      <DatePickerModal
        visible={isPickerVisible}
        date={selectedDate}
        onConfirm={(date) => { setPickerVisible(false); handleDateChange(date); }}
        onCancel={() => setPickerVisible(false)}
        maximumDate={new Date()}
      />
    </View>
  );
};

const AttendanceRow = ({ subject, hour, status, onMark, C, isDark }) => (
  <View style={[
    styles.row,
    { backgroundColor: C.card, borderColor: C.border, ...(isDark ? SHADOWS.dark.small : SHADOWS.light.small) }
  ]}>
    <View style={styles.rowLeft}>
      <View style={[styles.hourBadge, { backgroundColor: C.accentBg }]}>
        <Text style={[TYPOGRAPHY.tiny, { color: C.accent }]}>H{hour}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]} numberOfLines={1}>{subject.name}</Text>
        <Text style={[TYPOGRAPHY.tiny, { color: C.textMuted }]}>{subject.code}</Text>
      </View>
    </View>
    {/* Only Present & Absent — no per-subject holiday */}
    <View style={styles.btnGroup}>
      <AttendanceButton label="P" targetStatus="present" status={status} onPress={onMark} colors={C} size="small" />
      <View style={{ width: 6 }} />
      <AttendanceButton label="A" targetStatus="absent" status={status} onPress={onMark} colors={C} size="small" />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerArea: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.xl, paddingBottom: SPACING.md },
  calIconBtn: { width: 38, height: 38, borderRadius: RADIUS.full, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  holidayBanner: { flexDirection: 'row', alignItems: 'center', marginHorizontal: SPACING.xl, marginBottom: SPACING.md, padding: SPACING.md, borderRadius: RADIUS.xl, borderWidth: 1 },
  removeHoliday: { paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADIUS.full, borderWidth: 1.5 },
  bulkRow: { flexDirection: 'row', paddingHorizontal: SPACING.xl, gap: SPACING.sm, marginBottom: SPACING.md },
  bulkBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.sm, borderRadius: RADIUS.lg, borderWidth: 1.5 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: RADIUS.lg, borderWidth: 1, padding: SPACING.md, marginBottom: SPACING.sm },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: SPACING.sm },
  hourBadge: { width: 32, height: 32, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  btnGroup: { flexDirection: 'row', alignItems: 'center' },
  emptyCard: { borderRadius: RADIUS.xl, borderWidth: 1, borderStyle: 'dashed', padding: SPACING.xxxl, alignItems: 'center', marginTop: SPACING.md },
  summaryCard: { borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING.lg, marginTop: SPACING.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center' },
});

export default MarkScreen;
