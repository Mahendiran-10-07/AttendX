import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  ScrollView, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

/**
 * ImportPreviewModal
 * Shows imported subjects before applying, with Replace / Merge options.
 *
 * Props:
 *   visible, data ({ subjects, timetable, exportedAt }),
 *   onReplace, onMerge, onCancel
 */
const ImportPreviewModal = ({ visible, data, onReplace, onMerge, onCancel }) => {
  const { isDark } = useTheme();
  const C = isDark ? COLORS.dark : COLORS.light;
  const [mode, setMode] = useState('replace'); // 'replace' | 'merge'

  if (!data) return null;

  const { subjects = [], timetable = {}, exportedAt } = data;
  const timetableCount = Object.values(timetable).reduce(
    (sum, day) => sum + Object.keys(day).length, 0
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={{ flex: 1 }}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onCancel} />

        <View style={[styles.sheet, { backgroundColor: C.card }]}>
          <View style={[styles.handle, { backgroundColor: C.border }]} />

          {/* Title */}
          <View style={styles.titleRow}>
            <View style={[styles.iconWrap, { backgroundColor: C.accentBg }]}>
              <Ionicons name="download-outline" size={24} color={C.accent} />
            </View>
            <View style={{ flex: 1, marginLeft: SPACING.md }}>
              <Text style={[TYPOGRAPHY.h3, { color: C.text }]}>Import Preview</Text>
              {exportedAt && (
                <Text style={[TYPOGRAPHY.tiny, { color: C.textMuted }]}>
                  Exported {new Date(exportedAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={onCancel} activeOpacity={0.7}>
              <Ionicons name="close-circle-outline" size={24} color={C.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={[styles.statsRow, { backgroundColor: C.bg, borderColor: C.border }]}>
            <StatBadge icon="book-outline" label="Subjects" value={subjects.length} C={C} />
            <View style={[styles.statDivider, { backgroundColor: C.border }]} />
            <StatBadge icon="grid-outline" label="Timetable Slots" value={timetableCount} C={C} />
          </View>

          {/* Subject List Preview */}
          <Text style={[TYPOGRAPHY.smallMedium, { color: C.textSecondary, marginBottom: SPACING.sm }]}>
            Subjects in this file:
          </Text>
          <ScrollView style={{ maxHeight: 160 }} showsVerticalScrollIndicator={false}>
            {subjects.map((sub, i) => (
              <View key={sub.id ?? i} style={[styles.subRow, { borderColor: C.border, backgroundColor: C.bg }]}>
                <View style={[styles.numBadge, { backgroundColor: C.accentBg }]}>
                  <Text style={[TYPOGRAPHY.tiny, { color: C.accent }]}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]} numberOfLines={1}>
                    {sub.name}
                  </Text>
                  <Text style={[TYPOGRAPHY.tiny, { color: C.textMuted }]}>{sub.code}</Text>
                </View>
                {sub.targetPercent && (
                  <Text style={[TYPOGRAPHY.tiny, { color: C.accent }]}>{sub.targetPercent}%</Text>
                )}
              </View>
            ))}
          </ScrollView>

          {/* Mode Selector */}
          <Text style={[TYPOGRAPHY.smallMedium, { color: C.textSecondary, marginTop: SPACING.md, marginBottom: SPACING.sm }]}>
            How to import:
          </Text>
          <View style={styles.modeRow}>
            <ModeOption
              selected={mode === 'replace'}
              onPress={() => setMode('replace')}
              icon="refresh-outline"
              label="Replace"
              desc="Clear existing, load fresh"
              C={C}
            />
            <ModeOption
              selected={mode === 'merge'}
              onPress={() => setMode('merge')}
              icon="git-merge-outline"
              label="Merge"
              desc="Add to existing subjects"
              C={C}
            />
          </View>

          {/* Warning for replace */}
          {mode === 'replace' && (
            <View style={[styles.warning, { backgroundColor: C.absentBg, borderColor: C.absent + '50' }]}>
              <Ionicons name="warning-outline" size={14} color={C.absent} />
              <Text style={[TYPOGRAPHY.tiny, { color: C.absent, marginLeft: SPACING.xs, flex: 1 }]}>
                Replace will remove your current subjects and timetable.
              </Text>
            </View>
          )}

          {/* Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={[styles.cancelBtn, { borderColor: C.border }]} onPress={onCancel} activeOpacity={0.7}>
              <Text style={[TYPOGRAPHY.bodyMedium, { color: C.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.importBtn, { backgroundColor: C.accent }]}
              onPress={() => mode === 'replace' ? onReplace(data) : onMerge(data)}
              activeOpacity={0.8}
            >
              <Ionicons name="download-outline" size={16} color="#fff" />
              <Text style={[TYPOGRAPHY.bodyMedium, { color: '#fff', marginLeft: 6 }]}>
                {mode === 'replace' ? 'Replace & Import' : 'Merge & Import'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const StatBadge = ({ icon, label, value, C }) => (
  <View style={styles.statItem}>
    <Ionicons name={icon} size={18} color={C.accent} />
    <Text style={[TYPOGRAPHY.h4, { color: C.text, marginTop: 2 }]}>{value}</Text>
    <Text style={[TYPOGRAPHY.tiny, { color: C.textMuted }]}>{label}</Text>
  </View>
);

const ModeOption = ({ selected, onPress, icon, label, desc, C }) => (
  <TouchableOpacity
    style={[
      styles.modeBtn,
      {
        borderColor: selected ? C.accent : C.border,
        backgroundColor: selected ? C.accentBg : C.bg,
      }
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Ionicons name={icon} size={18} color={selected ? C.accent : C.textMuted} />
    <Text style={[TYPOGRAPHY.smallMedium, { color: selected ? C.accent : C.text, marginTop: 4 }]}>{label}</Text>
    <Text style={[TYPOGRAPHY.tiny, { color: C.textMuted, textAlign: 'center' }]}>{desc}</Text>
    {selected && (
      <Ionicons name="checkmark-circle" size={14} color={C.accent} style={{ marginTop: 4 }} />
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  sheet: {
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    padding: SPACING.xl,
    paddingBottom: 40,
  },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: SPACING.lg },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg },
  iconWrap: { width: 48, height: 48, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center' },
  statsRow: {
    flexDirection: 'row', borderRadius: RADIUS.lg, borderWidth: 1,
    padding: SPACING.md, marginBottom: SPACING.lg,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statDivider: { width: 1, marginVertical: 4 },
  subRow: {
    flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.md,
    borderWidth: 1, padding: SPACING.sm, marginBottom: SPACING.xs, gap: SPACING.sm,
  },
  numBadge: { width: 24, height: 24, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center' },
  modeRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  modeBtn: {
    flex: 1, borderRadius: RADIUS.lg, borderWidth: 1.5,
    padding: SPACING.md, alignItems: 'center',
  },
  warning: {
    flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.md,
    borderWidth: 1, padding: SPACING.sm, marginBottom: SPACING.md,
  },
  btnRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  cancelBtn: {
    flex: 1, borderWidth: 1.5, borderRadius: RADIUS.full,
    paddingVertical: SPACING.md, alignItems: 'center',
  },
  importBtn: {
    flex: 2, borderRadius: RADIUS.full, paddingVertical: SPACING.md,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center',
  },
});

export default ImportPreviewModal;
