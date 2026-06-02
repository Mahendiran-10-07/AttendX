import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { useSubjectsData } from '../context/AttendanceContext';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import ConfirmModal from '../components/ConfirmModal';
import ImportPreviewModal from '../components/ImportPreviewModal';
import { exportData, importData } from '../utils/importExport';

const SubjectsScreen = () => {
  const { isDark } = useTheme();
  const C = isDark ? COLORS.dark : COLORS.light;
  const insets = useSafeAreaInsets();
  const { subjects, addSubject, editSubject, deleteSubject, settings, timetable, reorderSubjects, saveTimetableDirectly, bulkImport } = useSubjectsData();

  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', targetPercent: '' });
  const [errors, setErrors] = useState({});
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  // Import/Export state
  const [importPreviewVisible, setImportPreviewVisible] = useState(false);
  const [importPreviewData, setImportPreviewData] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const openAdd = () => {
    setForm({ name: '', code: '', targetPercent: '' });
    setErrors({});
    setEditMode(false);
    setEditId(null);
    setModalVisible(true);
  };

  const openEdit = (sub) => {
    setForm({
      name: sub.name,
      code: sub.code,
      targetPercent: sub.targetPercent != null ? String(sub.targetPercent) : '',
    });
    setErrors({});
    setEditMode(true);
    setEditId(sub.id);
    setModalVisible(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Subject name is required';
    if (!form.code.trim()) e.code = 'Subject code is required';
    if (form.targetPercent && (isNaN(Number(form.targetPercent)) || Number(form.targetPercent) < 1 || Number(form.targetPercent) > 100)) {
      e.targetPercent = 'Enter a valid percentage (1–100)';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const payload = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      targetPercent: form.targetPercent ? Number(form.targetPercent) : null,
    };
    if (editMode && editId) editSubject(editId, payload);
    else addSubject(payload);
    setModalVisible(false);
  };

  const handleDeletePress = (sub) => {
    setPendingDelete(sub);
    setConfirmVisible(true);
  };

  const handleDeleteConfirm = () => {
    if (!pendingDelete) return;
    setConfirmVisible(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    deleteSubject(pendingDelete.id); // instant
    setPendingDelete(null);
  };

  // ─── Export ───────────────────────────────────────────────────
  const handleExport = async () => {
    setIsExporting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await exportData(subjects, timetable ?? {});
    setIsExporting(false);
    if (!result.success && result.error) {
      alert(result.error);
    }
  };

  // ─── Import ───────────────────────────────────────────────────
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await bulkImport(data.subjects, data.timetable ?? {}, 'replace');
  };

  const handleImportMerge = async (data) => {
    setImportPreviewVisible(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await bulkImport(data.subjects, data.timetable ?? {}, 'merge');
  };

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.bg} />

      <View style={[styles.headerArea, { paddingTop: insets.top + SPACING.md }]}>
        <View>
          <Text style={[TYPOGRAPHY.h2, { color: C.text }]}>Subjects</Text>
          <Text style={[TYPOGRAPHY.small, { color: C.textMuted }]}>
            {subjects.length} subject{subjects.length !== 1 ? 's' : ''} added
          </Text>
        </View>
        <View style={styles.headerBtns}>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: C.card, borderColor: C.border }]}
            onPress={handleImport}
            activeOpacity={0.7}
            disabled={isImporting}
          >
            <Ionicons name="download-outline" size={18} color={isImporting ? C.textMuted : C.accent} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: C.card, borderColor: C.border }]}
            onPress={handleExport}
            activeOpacity={0.7}
            disabled={isExporting || subjects.length === 0}
          >
            <Ionicons name="share-outline" size={18} color={isExporting || subjects.length === 0 ? C.textMuted : C.accent} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: C.accent }]} onPress={openAdd} activeOpacity={0.8}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={[TYPOGRAPHY.smallMedium, { color: '#fff', marginLeft: 4 }]}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: SPACING.xl, paddingBottom: insets.bottom + 90 }}
      >
        {subjects.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <Text style={{ fontSize: 48 }}>📚</Text>
            <Text style={[TYPOGRAPHY.h4, { color: C.text, marginTop: SPACING.md }]}>No Subjects Yet</Text>
            <Text style={[TYPOGRAPHY.body, { color: C.textSecondary, marginTop: SPACING.sm, textAlign: 'center' }]}>
              Add your subjects one by one with their name and code.
            </Text>
            <TouchableOpacity style={[styles.emptyAddBtn, { backgroundColor: C.accent }]} onPress={openAdd} activeOpacity={0.8}>
              <Ionicons name="add-circle-outline" size={18} color="#fff" />
              <Text style={[TYPOGRAPHY.bodyMedium, { color: '#fff', marginLeft: 6 }]}>Add First Subject</Text>
            </TouchableOpacity>
          </View>
        ) : (
          subjects.map((sub, idx) => (
            <View
              key={sub.id}
              style={[styles.subCard, { backgroundColor: C.card, borderColor: C.border, ...(isDark ? SHADOWS.dark.small : SHADOWS.light.small) }]}
            >
              <View style={[styles.indexBadge, { backgroundColor: C.accentBg }]}>
                <Text style={[TYPOGRAPHY.smallMedium, { color: C.accent }]}>{idx + 1}</Text>
              </View>
              <View style={styles.subInfo}>
                <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]}>{sub.name}</Text>
                <View style={styles.tagsRow}>
                  <View style={[styles.tag, { backgroundColor: C.accentBg }]}>
                    <Text style={[TYPOGRAPHY.tiny, { color: C.accent }]}>{sub.code}</Text>
                  </View>
                  <View style={[styles.tag, { backgroundColor: C.card, borderColor: C.border, borderWidth: 1 }]}>
                    <Ionicons name="flag-outline" size={10} color={C.textMuted} />
                    <Text style={[TYPOGRAPHY.tiny, { color: C.textMuted, marginLeft: 3 }]}>
                      {sub.targetPercent ?? settings.targetPercent ?? 75}%
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: C.accentBg }]} onPress={() => openEdit(sub)} activeOpacity={0.7}>
                  <Ionicons name="pencil-outline" size={16} color={C.accent} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: C.absentBg }]} onPress={() => handleDeletePress(sub)} activeOpacity={0.7}>
                  <Ionicons name="trash-outline" size={16} color={C.absent} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add/Edit Modal — no dim overlay */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setModalVisible(false)} />
          <View style={[styles.sheet, { backgroundColor: C.card }]}>
            <View style={[styles.handle, { backgroundColor: C.border }]} />
            <Text style={[TYPOGRAPHY.h3, { color: C.text, marginBottom: SPACING.lg }]}>
              {editMode ? 'Edit Subject' : 'Add Subject'}
            </Text>

            <FormField label="Subject Name *" value={form.name} onChangeText={t => setForm(f => ({ ...f, name: t }))}
              placeholder="e.g. Mathematics" error={errors.name} C={C} />
            <FormField label="Subject Code *" value={form.code} onChangeText={t => setForm(f => ({ ...f, code: t }))}
              placeholder="e.g. MA101" error={errors.code} C={C} autoCapitalize="characters" />
            <FormField label={`Target % (optional, default ${settings.targetPercent ?? 75}%)`}
              value={form.targetPercent} onChangeText={t => setForm(f => ({ ...f, targetPercent: t }))}
              placeholder="75" error={errors.targetPercent} C={C} keyboardType="numeric" />

            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.cancelBtn, { borderColor: C.border }]} onPress={() => setModalVisible(false)} activeOpacity={0.7}>
                <Text style={[TYPOGRAPHY.bodyMedium, { color: C.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: C.accent }]} onPress={handleSave} activeOpacity={0.8}>
                <Text style={[TYPOGRAPHY.bodyMedium, { color: '#fff' }]}>{editMode ? 'Save Changes' : 'Add Subject'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Import Preview Modal */}
      <ImportPreviewModal
        visible={importPreviewVisible}
        data={importPreviewData}
        onReplace={handleImportReplace}
        onMerge={handleImportMerge}
        onCancel={() => setImportPreviewVisible(false)}
      />

      {/* Themed Delete Confirmation */}
      <ConfirmModal
        visible={confirmVisible}
        icon="trash-outline"
        title={`Delete "${pendingDelete?.name}"?`}
        message="Attendance records remain but this subject won't be tracked anymore."
        confirmLabel="Delete"
        confirmDanger
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setConfirmVisible(false); setPendingDelete(null); }}
      />
    </View>
  );
};

const FormField = ({ label, value, onChangeText, placeholder, error, C, keyboardType, autoCapitalize }) => (
  <View style={{ marginBottom: SPACING.md }}>
    <Text style={[TYPOGRAPHY.smallMedium, { color: C.textSecondary, marginBottom: 6 }]}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={C.textMuted}
      keyboardType={keyboardType || 'default'}
      autoCapitalize={autoCapitalize || 'words'}
      style={[styles.input, { backgroundColor: C.bg, borderColor: error ? C.absent : C.border, color: C.text }]}
    />
    {error && <Text style={[TYPOGRAPHY.tiny, { color: C.absent, marginTop: 4 }]}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerArea: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.xl, paddingBottom: SPACING.md },
  headerBtns: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  iconBtn: { width: 38, height: 38, borderRadius: RADIUS.full, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  addBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.full },
  subCard: { flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.lg, borderWidth: 1, padding: SPACING.md, marginBottom: SPACING.sm },
  indexBadge: { width: 36, height: 36, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  subInfo: { flex: 1 },
  tagsRow: { flexDirection: 'row', gap: SPACING.xs, marginTop: 4 },
  tag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.full },
  actions: { flexDirection: 'row', gap: SPACING.xs },
  actionBtn: { width: 34, height: 34, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  emptyCard: { borderRadius: RADIUS.xl, borderWidth: 1, borderStyle: 'dashed', padding: SPACING.xxxl, alignItems: 'center' },
  emptyAddBtn: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.lg, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: RADIUS.full },
  sheet: { borderTopLeftRadius: RADIUS.xxl, borderTopRightRadius: RADIUS.xxl, padding: SPACING.xl, paddingBottom: 36 },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: SPACING.lg },
  input: { borderWidth: 1.5, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm + 2, fontSize: 15, fontFamily: 'Inter_400Regular' },
  modalBtns: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.lg },
  cancelBtn: { flex: 1, borderWidth: 1.5, borderRadius: RADIUS.full, paddingVertical: SPACING.md, alignItems: 'center' },
  saveBtn: { flex: 2, borderRadius: RADIUS.full, paddingVertical: SPACING.md, alignItems: 'center' },
});

export default SubjectsScreen;
