import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';
import { formatDateLabel, toDateString } from '../utils/calculations';

const DateNavigator = ({ date, onDateChange, colors }) => {
  const goBack = () => {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    onDateChange(d);
  };

  const goForward = () => {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    onDateChange(d);
  };

  const isToday = toDateString(date) === toDateString(new Date());

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity onPress={goBack} style={styles.arrow} activeOpacity={0.7}>
        <Ionicons name="chevron-back" size={20} color={colors.accent} />
      </TouchableOpacity>

      <View style={styles.center}>
        <Text style={[TYPOGRAPHY.h4, { color: colors.text }]}>
          {formatDateLabel(date)}
        </Text>
        <Text style={[TYPOGRAPHY.tiny, { color: colors.textMuted }]}>
          {date.toLocaleDateString('en-IN', { weekday: 'long' })}
          {isToday && (
            <Text style={{ color: colors.accent }}> • Today</Text>
          )}
        </Text>
      </View>

      <TouchableOpacity
        onPress={isToday ? null : goForward}
        style={styles.arrow}
        activeOpacity={isToday ? 1 : 0.7}
        disabled={isToday}
      >
        <Ionicons name="chevron-forward" size={20} color={isToday ? colors.border : colors.accent} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  arrow: {
    padding: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
});

export default DateNavigator;
