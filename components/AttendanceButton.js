import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { RADIUS, TYPOGRAPHY } from '../constants/theme';

/**
 * status: 'present' | 'absent' | 'holiday' | null
 */
const AttendanceButton = ({ label, status, targetStatus, onPress, colors, size = 'normal' }) => {
  const isActive = status === targetStatus;

  const getColors = () => {
    switch (targetStatus) {
      case 'present':
        return {
          active: colors.present,
          activeBg: colors.presentBg,
          border: colors.present,
        };
      case 'absent':
        return {
          active: colors.absent,
          activeBg: colors.absentBg,
          border: colors.absent,
        };
      case 'holiday':
        return {
          active: colors.holiday,
          activeBg: colors.holidayBg,
          border: colors.holiday,
        };
      default:
        return { active: colors.accent, activeBg: colors.accentBg, border: colors.accent };
    }
  };

  const { active, activeBg, border } = getColors();
  const isSmall = size === 'small';

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(targetStatus);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={handlePress}
      style={[
        styles.btn,
        {
          backgroundColor: isActive ? activeBg : 'transparent',
          borderColor: isActive ? border : colors.border,
          paddingVertical: isSmall ? 6 : 10,
          paddingHorizontal: isSmall ? 12 : 18,
        },
      ]}
    >
      {targetStatus === 'present' && <Text style={styles.emoji}>{isSmall ? '✅' : '✅'}</Text>}
      {targetStatus === 'absent' && <Text style={styles.emoji}>{isSmall ? '❌' : '❌'}</Text>}
      {targetStatus === 'holiday' && <Text style={styles.emoji}>{isSmall ? '🏖️' : '🏖️'}</Text>}
      <Text style={[
        isSmall ? TYPOGRAPHY.tiny : TYPOGRAPHY.smallMedium,
        { color: isActive ? active : colors.textSecondary, marginLeft: 4 },
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: RADIUS.full,
  },
  emoji: {
    fontSize: 13,
  },
});

export default AttendanceButton;
