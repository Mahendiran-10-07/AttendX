import React, { useState } from 'react';
import {
  View, Text, Modal, TouchableOpacity, StyleSheet,
  ScrollView, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const { width } = Dimensions.get('window');

const DatePickerModal = ({ visible, date, onConfirm, onCancel, maximumDate }) => {
  const { isDark } = useTheme();
  const C = isDark ? COLORS.dark : COLORS.light;

  const [viewYear, setViewYear] = useState(date.getFullYear());
  const [viewMonth, setViewMonth] = useState(date.getMonth());
  const [selected, setSelected] = useState(date);

  const today = maximumDate || new Date();

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const handleNextMonth = () => {
    const nextDate = new Date(viewYear, viewMonth + 1, 1);
    if (nextDate > today) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const handleSelectDay = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    if (d > today) return;
    setSelected(d);
  };

  const handleConfirm = () => onConfirm(selected);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth); // 0=Sun
  // Convert to Mon-first: (firstDay + 6) % 7
  const offset = (firstDay + 6) % 7;

  const selStr = `${selected.getFullYear()}-${selected.getMonth()}-${selected.getDate()}`;

  const isNextDisabled = (() => {
    const nextDate = new Date(viewYear, viewMonth + 1, 1);
    return nextDate > today;
  })();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onCancel} />
      <View style={styles.centeredView}>
        <View style={[styles.picker, { backgroundColor: C.card, borderColor: C.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.arrowBtn} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={20} color={C.accent} />
            </TouchableOpacity>
            <Text style={[TYPOGRAPHY.h4, { color: C.text }]}>
              {MONTHS[viewMonth]} {viewYear}
            </Text>
            <TouchableOpacity
              onPress={handleNextMonth}
              style={styles.arrowBtn}
              activeOpacity={isNextDisabled ? 0.3 : 0.7}
            >
              <Ionicons name="chevron-forward" size={20} color={isNextDisabled ? C.textMuted : C.accent} />
            </TouchableOpacity>
          </View>

          {/* Day labels */}
          <View style={styles.weekRow}>
            {['Mo','Tu','We','Th','Fr','Sa','Su'].map(d => (
              <Text key={d} style={[TYPOGRAPHY.tiny, { color: C.textMuted, width: 36, textAlign: 'center' }]}>{d}</Text>
            ))}
          </View>

          {/* Days grid */}
          <View style={styles.daysGrid}>
            {/* Offset empty cells */}
            {Array.from({ length: offset }).map((_, i) => (
              <View key={`e${i}`} style={styles.dayCell} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const thisDate = new Date(viewYear, viewMonth, day);
              const isFuture = thisDate > today;
              const isSelected = selStr === `${viewYear}-${viewMonth}-${day}`;
              const isToday =
                thisDate.toDateString() === new Date().toDateString();

              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayCell,
                    isSelected && { backgroundColor: C.accent, borderRadius: RADIUS.md },
                    !isSelected && isToday && {
                      borderWidth: 1.5, borderColor: C.accent, borderRadius: RADIUS.md,
                    },
                  ]}
                  onPress={() => !isFuture && handleSelectDay(day)}
                  activeOpacity={isFuture ? 1 : 0.7}
                >
                  <Text style={[
                    TYPOGRAPHY.smallMedium,
                    {
                      color: isFuture
                        ? C.textMuted
                        : isSelected
                          ? '#fff'
                          : isToday
                            ? C.accent
                            : C.text,
                    }
                  ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Action buttons */}
          <View style={[styles.actions, { borderTopColor: C.border }]}>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: C.border }]}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={[TYPOGRAPHY.bodyMedium, { color: C.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: C.accent }]}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={[TYPOGRAPHY.bodyMedium, { color: '#fff' }]}>Select</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  centeredView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  picker: {
    width: width - 48,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.lg,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  arrowBtn: {
    padding: SPACING.sm,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    paddingHorizontal: 2,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 4,
  },
  dayCell: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  confirmBtn: {
    flex: 2,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
});

export default DatePickerModal;
