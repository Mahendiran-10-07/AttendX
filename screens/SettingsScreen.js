import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, Switch, Alert, TextInput, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { useSubjectsData } from '../context/AttendanceContext';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import ConfirmModal from '../components/ConfirmModal';

const SettingsScreen = () => {
  const { isDark, toggleTheme } = useTheme();
  const C = isDark ? COLORS.dark : COLORS.light;
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, semesters, startNewSemester, getArchivedData, removeArchivedSemester, reload } = useSubjectsData();

  const [newSemLabel, setNewSemLabel] = useState('');
  const [semModalVisible, setSemModalVisible] = useState(false);
  const [archiveViewVisible, setArchiveViewVisible] = useState(false);
  const [archivedData, setArchivedData] = useState(null);
  const [selectedArchivedSem, setSelectedArchivedSem] = useState(null);

  // Edit current semester name
  const [editSemVisible, setEditSemVisible] = useState(false);
  const [editSemName, setEditSemName] = useState('');

  // Confirm delete state
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [pendingDeleteSem, setPendingDeleteSem] = useState(null);

  const currentSemester = semesters.find(s => s.id === settings.currentSemesterId);
  const archivedSemesters = semesters.filter(s => s.archived);

  const handleTargetChange = async (val) => {
    const n = Math.max(1, Math.min(100, Math.round(val)));
    await updateSettings({ targetPercent: n });
  };

  const handleNewSemester = async () => {
    if (!newSemLabel.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await startNewSemester(newSemLabel.trim());
    setSemModalVisible(false);
    setNewSemLabel('');
  };

  const handleEditSemName = async () => {
    if (!editSemName.trim()) return;
    const { saveSemesters } = require('../utils/storage');
    const updated = semesters.map(s =>
      s.id === settings.currentSemesterId ? { ...s, label: editSemName.trim() } : s
    );
    await saveSemesters(updated);
    await reload();
    setEditSemVisible(false);
  };

  const viewArchivedSemester = async (sem) => {
    const data = await getArchivedData(sem.id);
    setArchivedData(data);
    setSelectedArchivedSem(sem);
    setArchiveViewVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.bg} />

      {/* Header */}
      <View style={[styles.headerArea, { paddingTop: insets.top + SPACING.md }]}>
        <Text style={[TYPOGRAPHY.h2, { color: C.text }]}>Settings</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: SPACING.xl, paddingBottom: insets.bottom + 90 }}
      >
        {/* Appearance */}
        <SectionHeader label="Appearance" C={C} />
        <SettingCard C={C} isDark={isDark}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name={isDark ? 'moon-outline' : 'sunny-outline'} size={20} color={C.accent} />
              <View style={{ marginLeft: SPACING.sm }}>
                <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]}>Dark Mode</Text>
                <Text style={[TYPOGRAPHY.tiny, { color: C.textMuted }]}>
                  {isDark ? 'Dark theme active' : 'Light theme active'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: C.border, true: C.accent }}
              thumbColor="#fff"
            />
          </View>
        </SettingCard>

        {/* Attendance Target */}
        <SectionHeader label="Attendance Target" C={C} />
        <SettingCard C={C} isDark={isDark}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="flag-outline" size={20} color={C.accent} />
              <View style={{ marginLeft: SPACING.sm }}>
                <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]}>Global Target</Text>
                <Text style={[TYPOGRAPHY.tiny, { color: C.textMuted }]}>Applied to all subjects</Text>
              </View>
            </View>
            <Text style={[TYPOGRAPHY.h3, { color: C.accent }]}>{settings.targetPercent ?? 75}%</Text>
          </View>

          <View style={styles.targetBtnRow}>
            {[60, 65, 70, 75, 80, 85].map(pct => (
              <TouchableOpacity
                key={pct}
                style={[
                  styles.pctBtn,
                  {
                    backgroundColor: (settings.targetPercent ?? 75) === pct ? C.accent : C.bg,
                    borderColor: (settings.targetPercent ?? 75) === pct ? C.accent : C.border,
                  }
                ]}
                onPress={() => handleTargetChange(pct)}
                activeOpacity={0.7}
              >
                <Text style={[
                  TYPOGRAPHY.smallMedium,
                  { color: (settings.targetPercent ?? 75) === pct ? '#fff' : C.textSecondary }
                ]}>
                  {pct}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SettingCard>

        {/* Current Semester */}
        <SectionHeader label="Semester" C={C} />
        <SettingCard C={C} isDark={isDark}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="school-outline" size={20} color={C.accent} />
              <View style={{ marginLeft: SPACING.sm }}>
                <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]}>Current Semester</Text>
                <Text style={[TYPOGRAPHY.small, { color: C.accent }]}>
                  {currentSemester?.label ?? 'Semester 1'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.editSemBtn, { backgroundColor: C.accentBg }]}
              onPress={() => { setEditSemName(currentSemester?.label ?? ''); setEditSemVisible(true); }}
              activeOpacity={0.7}
            >
              <Ionicons name="pencil-outline" size={15} color={C.accent} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.semBtn, { backgroundColor: C.accent }]}
            onPress={() => setSemModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh-outline" size={16} color="#fff" />
            <Text style={[TYPOGRAPHY.smallMedium, { color: '#fff', marginLeft: 6 }]}>Start New Semester</Text>
          </TouchableOpacity>
        </SettingCard>

        {/* Archived Semesters */}
        {archivedSemesters.length > 0 && (
          <>
            <SectionHeader label="Archived Semesters" C={C} />
            <SettingCard C={C} isDark={isDark}>
              {archivedSemesters.map((sem, idx) => (
                <View
                  key={sem.id}
                  style={[
                    styles.archiveRow,
                    { borderColor: C.border },
                    idx === archivedSemesters.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <TouchableOpacity
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => viewArchivedSemester(sem)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="archive-outline" size={16} color={C.textMuted} />
                    <View style={{ marginLeft: SPACING.sm }}>
                      <Text style={[TYPOGRAPHY.bodyMedium, { color: C.textSecondary }]}>{sem.label}</Text>
                      {sem.endDate && (
                        <Text style={[TYPOGRAPHY.tiny, { color: C.textMuted }]}>
                          Ended {new Date(sem.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
                    <Ionicons name="chevron-forward" size={16} color={C.textMuted} />
                    <TouchableOpacity
                      style={[styles.deleteBtn, { borderColor: C.absent + '60', backgroundColor: C.absentBg }]}
                      onPress={() => {
                        setPendingDeleteSem(sem);
                        setDeleteConfirmVisible(true);
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash-outline" size={14} color={C.absent} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </SettingCard>
          </>
        )}

        {/* About */}
        <SectionHeader label="About" C={C} />
        <SettingCard C={C} isDark={isDark}>
          <View style={styles.settingRow}>
            <Text style={[TYPOGRAPHY.body, { color: C.textSecondary }]}>AttendX</Text>
            <Text style={[TYPOGRAPHY.small, { color: C.textMuted }]}>v1.0.0</Text>
          </View>
          <Text style={[TYPOGRAPHY.small, { color: C.textMuted, marginTop: 4 }]}>
            Your smart attendance companion. Data stored locally on device.
          </Text>
        </SettingCard>
      </ScrollView>

      {/* New Semester Modal — no dim */}
      <Modal visible={semModalVisible} transparent animationType="slide" onRequestClose={() => setSemModalVisible(false)}>
        <View style={{ flex: 1 }}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setSemModalVisible(false)} />
          <View style={[styles.sheet, { backgroundColor: C.card }]}>
            <View style={[styles.handle, { backgroundColor: C.border }]} />
            <Text style={[TYPOGRAPHY.h3, { color: C.text, marginBottom: SPACING.sm }]}>Start New Semester</Text>
            <Text style={[TYPOGRAPHY.small, { color: C.textMuted, marginBottom: SPACING.lg }]}>
              All current subjects &amp; attendance will be archived. Enter a name for the new semester.
            </Text>
            <TextInput
              value={newSemLabel}
              onChangeText={setNewSemLabel}
              placeholder="e.g. Semester 2 — Jul 2026"
              placeholderTextColor={C.textMuted}
              style={[styles.input, { backgroundColor: C.bg, borderColor: C.border, color: C.text }]}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.cancelBtn, { borderColor: C.border }]} onPress={() => setSemModalVisible(false)} activeOpacity={0.7}>
                <Text style={[TYPOGRAPHY.bodyMedium, { color: C.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: C.accent }]} onPress={handleNewSemester} activeOpacity={0.8}>
                <Text style={[TYPOGRAPHY.bodyMedium, { color: '#fff' }]}>Start Fresh</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Archive View Modal — no dim, rich stats */}
      <Modal visible={archiveViewVisible} transparent animationType="slide" onRequestClose={() => setArchiveViewVisible(false)}>
        <View style={{ flex: 1 }}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setArchiveViewVisible(false)} />
          <View style={[styles.sheet, { backgroundColor: C.card, maxHeight: '75%' }]}>
            <View style={[styles.handle, { backgroundColor: C.border }]} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm }}>
              <Text style={[TYPOGRAPHY.h3, { color: C.text }]}>{selectedArchivedSem?.label}</Text>
              <TouchableOpacity onPress={() => setArchiveViewVisible(false)} activeOpacity={0.7}>
                <Ionicons name="close-circle-outline" size={24} color={C.textMuted} />
              </TouchableOpacity>
            </View>
            {archivedData?.archivedAt && (
              <Text style={[TYPOGRAPHY.tiny, { color: C.textMuted, marginBottom: SPACING.md }]}>
                Archived on {new Date(archivedData.archivedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                {'  '}•{'  '}{Object.keys(archivedData.attendance || {}).length} days recorded
              </Text>
            )}
            <ScrollView showsVerticalScrollIndicator={false}>
              {archivedData?.subjects?.map(sub => {
                let attended = 0, total = 0;
                Object.values(archivedData.attendance || {}).forEach(day => {
                  Object.entries(day).forEach(([k, v]) => {
                    if (k.startsWith(sub.id + '_h') && v !== 'holiday') {
                      total++;
                      if (v === 'present') attended++;
                    }
                  });
                });
                const pct = total > 0 ? Math.round((attended / total) * 100) : 0;
                const color = pct >= (sub.targetPercent ?? 75) ? C.present : C.absent;
                return (
                  <View key={sub.id} style={[styles.archiveStatRow, { borderColor: C.border, backgroundColor: C.bg }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]} numberOfLines={1}>{sub.name}</Text>
                      <Text style={[TYPOGRAPHY.tiny, { color: C.textMuted }]}>{sub.code}  •  {attended}/{total} classes</Text>
                    </View>
                    <Text style={[TYPOGRAPHY.h4, { color }]}>{pct}%</Text>
                  </View>
                );
              })}
              {(!archivedData?.subjects?.length) && (
                <Text style={[TYPOGRAPHY.body, { color: C.textSecondary, textAlign: 'center', paddingVertical: SPACING.xl }]}>No data found.</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
      {/* Edit Semester Name Modal */}
      <Modal visible={editSemVisible} transparent animationType="slide" onRequestClose={() => setEditSemVisible(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setEditSemVisible(false)} />
          <View style={[styles.sheet, { backgroundColor: C.card }]}>
            <View style={[styles.handle, { backgroundColor: C.border }]} />
            <Text style={[TYPOGRAPHY.h3, { color: C.text, marginBottom: SPACING.sm }]}>Rename Semester</Text>
            <Text style={[TYPOGRAPHY.small, { color: C.textMuted, marginBottom: SPACING.lg }]}>Update the name of the current semester.</Text>
            <TextInput
              value={editSemName}
              onChangeText={setEditSemName}
              placeholder="Semester name"
              placeholderTextColor={C.textMuted}
              style={[styles.input, { backgroundColor: C.bg, borderColor: C.border, color: C.text }]}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.cancelBtn, { borderColor: C.border }]} onPress={() => setEditSemVisible(false)} activeOpacity={0.7}>
                <Text style={[TYPOGRAPHY.bodyMedium, { color: C.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: C.accent }]} onPress={handleEditSemName} activeOpacity={0.8}>
                <Text style={[TYPOGRAPHY.bodyMedium, { color: '#fff' }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Themed Delete Confirmation */}
      <ConfirmModal
        visible={deleteConfirmVisible}
        icon="archive-outline"
        title={`Delete "${pendingDeleteSem?.label}"?`}
        message="All data for this semester will be permanently removed. This cannot be undone."
        confirmLabel="Delete"
        confirmDanger
        onConfirm={async () => {
          setDeleteConfirmVisible(false);
          if (pendingDeleteSem) await removeArchivedSemester(pendingDeleteSem.id);
          setPendingDeleteSem(null);
        }}
        onCancel={() => { setDeleteConfirmVisible(false); setPendingDeleteSem(null); }}
      />
    </View>
  );
};

const SectionHeader = ({ label, C }) => (
  <Text style={[TYPOGRAPHY.tiny, { color: C.textMuted, letterSpacing: 1, marginBottom: SPACING.sm, marginTop: SPACING.lg }]}>
    {label.toUpperCase()}
  </Text>
);

const SettingCard = ({ children, C, isDark }) => (
  <View style={[styles.card, { backgroundColor: C.card, borderColor: C.border, ...(isDark ? SHADOWS.dark.small : SHADOWS.light.small) }]}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerArea: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  card: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetBtnRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.md,
  },
  pctBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
  },
  semBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    padding: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  archiveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  editSemBtn: {
    width: 32, height: 32, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
  },
  archiveStatRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm,
  },
  deleteBtn: {
    width: 30, height: 30, borderRadius: RADIUS.md, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  sheet: {
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    padding: SPACING.xl,
    paddingBottom: 36,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    marginBottom: SPACING.md,
  },
  modalBtns: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  saveBtn: {
    flex: 2,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
});

export default SettingsScreen;
