import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, Modal, FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAttendance, useSubjectsData } from '../context/AttendanceContext';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, DAYS, HOURS_PER_DAY } from '../constants/theme';
import ImportPreviewModal from '../components/ImportPreviewModal';
import { exportData, importData } from '../utils/importExport';

const TimetableScreen = () => {
  const { isDark } = useTheme();
  const C = isDark ? COLORS.dark : COLORS.light;
  const insets = useSafeAreaInsets();
  const { subjects, timetable, setSlot, saveTimetableDirectly, addSubject, deleteSubject, bulkImport } = useSubjectsData();

  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState(null);
  const [importPreviewVisible, setImportPreviewVisible] = useState(false);
  const [importPreviewData, setImportPreviewData] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const getSlotSubject = (day, hour) => {
    const id = timetable[day]?.[hour];
    return id ? subjects.find(s => s.id === id) : null;
  };

  const openPicker = (day, hour) => {
    setPickerTarget({ day, hour });
    setPickerVisible(true);
  };

  const handleSelect = (subjectId) => {
    if (!pickerTarget) return;
    const { day, hour } = pickerTarget;
    setSlot(day, hour, subjectId);
    setPickerVisible(false);
    setPickerTarget(null);
  };

  const handleClear = (day, hour) => {
    setSlot(day, hour, null);
  };

  const handleExport = async () => {
    setIsExporting(true);
    const result = await exportData(subjects, timetable);
    setIsExporting(false);
    if (!result.success && result.error) alert(result.error);
  };

  const handleImport = async () => {
    setIsImporting(true);
    const result = await importData();
    setIsImporting(false);
    if (result.cancelled) return;
    if (!result.success) { alert(result.error); return; }
    setImportPreviewData(result.data);
    setImportPreviewVisible(true);
  };

  const handleImportReplace = async (data) => {
    setImportPreviewVisible(false);
    await bulkImport(data.subjects, data.timetable ?? {}, 'replace');
  };

  const handleImportMerge = async (data) => {
    setImportPreviewVisible(false);
    await bulkImport(data.subjects, data.timetable ?? {}, 'merge');
  };

  const hours = Array.from({ length: HOURS_PER_DAY }, (_, i) => i + 1);

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.bg} />

      <View style={[styles.headerArea, { paddingTop: insets.top + SPACING.md }]}>
        <View>
          <Text style={[TYPOGRAPHY.h2, { color: C.text }]}>Timetable</Text>
          <Text style={[TYPOGRAPHY.small, { color: C.textMuted }]}>Tap a slot to assign a subject</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: C.card, borderColor: C.border }]}
            onPress={handleImport} disabled={isImporting} activeOpacity={0.7}
          >
            <Ionicons name="download-outline" size={18} color={isImporting ? C.textMuted : C.accent} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: C.card, borderColor: C.border }]}
            onPress={handleExport} disabled={isExporting} activeOpacity={0.7}
          >
            <Ionicons name="share-outline" size={18} color={isExporting ? C.textMuted : C.accent} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 90, paddingHorizontal: SPACING.xl }}
      >
        <View style={[styles.infoBanner, { backgroundColor: C.accentBg, borderColor: C.accent + '40' }]}>
          <Ionicons name="information-circle-outline" size={16} color={C.accent} />
          <Text style={[TYPOGRAPHY.small, { color: C.accent, marginLeft: SPACING.sm, flex: 1 }]}>
            Setting up timetable auto-loads correct subjects in Mark screen daily.
          </Text>
        </View>

        {/* Hour Labels Header */}
        <View style={styles.gridHeader}>
          <View style={styles.dayLabel} />
          {hours.map(h => (
            <View key={h} style={styles.hourHeader}>
              <Text style={[TYPOGRAPHY.tiny, { color: C.textMuted }]}>H{h}</Text>
            </View>
          ))}
        </View>

        {/* Grid — Mon to Sat only */}
        {DAYS.map(day => (
          <View key={day} style={styles.gridRow}>
            <View style={styles.dayLabel}>
              <Text style={[TYPOGRAPHY.smallMedium, { color: C.textSecondary }]}>{day}</Text>
            </View>
            {hours.map(hour => {
              const sub = getSlotSubject(day, hour);
              return (
                <TouchableOpacity
                  key={hour}
                  style={[
                    styles.slot,
                    { backgroundColor: sub ? C.accentBg : C.card, borderColor: sub ? C.accent + '60' : C.border }
                  ]}
                  onPress={() => openPicker(day, hour)}
                  onLongPress={() => sub && handleClear(day, hour)}
                  activeOpacity={0.7}
                >
                  {sub ? (
                    <Text style={[TYPOGRAPHY.tiny, { color: C.accent, textAlign: 'center' }]} numberOfLines={2}>
                      {sub.code}
                    </Text>
                  ) : (
                    <Ionicons name="add" size={14} color={C.border} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        <Text style={[TYPOGRAPHY.tiny, { color: C.textMuted, textAlign: 'center', marginTop: SPACING.md }]}>
          💡 Long press a filled slot to clear it
        </Text>
      </ScrollView>

      {/* Subject Picker Modal — no dim overlay */}
      <Modal
        visible={pickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerVisible(false)}
      >
        <View style={{ flex: 1 }}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setPickerVisible(false)} />
          <View style={[styles.modalSheet, { backgroundColor: C.card }]}>
            <View style={[styles.modalHandle, { backgroundColor: C.border }]} />
            <Text style={[TYPOGRAPHY.h4, { color: C.text, marginBottom: SPACING.md }]}>
              Select Subject
              {pickerTarget && (
                <Text style={[TYPOGRAPHY.small, { color: C.textMuted }]}>
                  {'  '}{pickerTarget.day} · Hour {pickerTarget.hour}
                </Text>
              )}
            </Text>

            {subjects.length === 0 ? (
              <Text style={[TYPOGRAPHY.body, { color: C.textSecondary, textAlign: 'center', paddingVertical: SPACING.xl }]}>
                No subjects added yet. Add subjects first!
              </Text>
            ) : (
              <FlatList
                data={subjects}
                keyExtractor={s => s.id}
                renderItem={({ item }) => {
                  const isCurrentSlot = pickerTarget &&
                    timetable[pickerTarget.day]?.[pickerTarget.hour] === item.id;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.subjectOption,
                        {
                          backgroundColor: isCurrentSlot ? C.accentBg : C.cardElevated,
                          borderColor: isCurrentSlot ? C.accent : C.border,
                        }
                      ]}
                      onPress={() => handleSelect(item.id)}
                      activeOpacity={0.7}
                    >
                      <View>
                        <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]}>{item.name}</Text>
                        <Text style={[TYPOGRAPHY.tiny, { color: C.textMuted }]}>{item.code}</Text>
                      </View>
                      {isCurrentSlot && <Ionicons name="checkmark-circle" size={20} color={C.accent} />}
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Import Preview Modal */}
      <ImportPreviewModal
        visible={importPreviewVisible}
        data={importPreviewData}
        onReplace={handleImportReplace}
        onMerge={handleImportMerge}
        onCancel={() => setImportPreviewVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerArea: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.xl, paddingBottom: SPACING.md },
  iconBtn: { width: 38, height: 38, borderRadius: RADIUS.full, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  infoBanner: {
    flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.lg,
    borderWidth: 1, padding: SPACING.md, marginBottom: SPACING.lg,
  },
  gridHeader: { flexDirection: 'row', marginBottom: SPACING.xs },
  dayLabel: { width: 44, justifyContent: 'center', paddingRight: SPACING.xs },
  hourHeader: { flex: 1, alignItems: 'center', paddingBottom: SPACING.xs },
  gridRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm, gap: SPACING.xs },
  slot: {
    flex: 1, height: 52, borderRadius: RADIUS.md, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', padding: 3,
  },
  modalSheet: {
    borderTopLeftRadius: RADIUS.xxl, borderTopRightRadius: RADIUS.xxl,
    padding: SPACING.xl, maxHeight: '60%',
  },
  modalHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: SPACING.lg },
  subjectOption: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderRadius: RADIUS.lg, borderWidth: 1, padding: SPACING.md, marginBottom: SPACING.sm,
  },
});

export default TimetableScreen;
