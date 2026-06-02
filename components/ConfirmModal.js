import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

/**
 * Themed confirmation bottom sheet — replaces native Alert.alert()
 * Props:
 *   visible, title, message, confirmLabel, confirmDanger,
 *   onConfirm, onCancel, icon
 */
const ConfirmModal = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmDanger = false,
  onConfirm,
  onCancel,
  icon,
}) => {
  const { isDark } = useTheme();
  const C = isDark ? COLORS.dark : COLORS.light;

  const confirmColor = confirmDanger ? C.absent : C.accent;
  const confirmBg = confirmDanger ? C.absentBg : C.accentBg;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={{ flex: 1 }}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onCancel} />
        <View style={[styles.sheet, { backgroundColor: C.card }]}>
          <View style={[styles.handle, { backgroundColor: C.border }]} />

          {/* Icon */}
          {icon && (
            <View style={[styles.iconWrap, { backgroundColor: confirmBg }]}>
              <Ionicons name={icon} size={28} color={confirmColor} />
            </View>
          )}

          <Text style={[TYPOGRAPHY.h3, { color: C.text, textAlign: 'center', marginBottom: SPACING.sm }]}>
            {title}
          </Text>
          {message && (
            <Text style={[TYPOGRAPHY.small, { color: C.textSecondary, textAlign: 'center', marginBottom: SPACING.xl }]}>
              {message}
            </Text>
          )}

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: C.border }]}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={[TYPOGRAPHY.bodyMedium, { color: C.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: confirmColor }]}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={[TYPOGRAPHY.bodyMedium, { color: '#fff' }]}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  sheet: {
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    padding: SPACING.xl,
    paddingBottom: 40,
    alignItems: 'center',
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    alignSelf: 'center', marginBottom: SPACING.lg,
  },
  iconWrap: {
    width: 60, height: 60, borderRadius: 30,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  btnRow: {
    flexDirection: 'row', gap: SPACING.sm, width: '100%',
  },
  cancelBtn: {
    flex: 1, borderWidth: 1.5, borderRadius: RADIUS.full,
    paddingVertical: SPACING.md, alignItems: 'center',
  },
  confirmBtn: {
    flex: 2, borderRadius: RADIUS.full,
    paddingVertical: SPACING.md, alignItems: 'center',
  },
});

export default ConfirmModal;
