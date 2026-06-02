import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, TYPOGRAPHY } from '../constants/theme';

const Header = ({ title, subtitle, colors, rightAction, leftAction, showBack }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + SPACING.sm, backgroundColor: colors.bg }]}>
      <View style={styles.row}>
        {leftAction && (
          <TouchableOpacity onPress={leftAction.onPress} style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name={leftAction.icon || 'arrow-back'} size={22} color={colors.text} />
          </TouchableOpacity>
        )}
        {!leftAction && <View style={styles.iconBtn} />}

        <View style={styles.center}>
          <Text style={[TYPOGRAPHY.h3, { color: colors.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[TYPOGRAPHY.tiny, { color: colors.textMuted }]}>{subtitle}</Text>
          )}
        </View>

        {rightAction && (
          <TouchableOpacity onPress={rightAction.onPress} style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name={rightAction.icon} size={22} color={colors.accent} />
          </TouchableOpacity>
        )}
        {!rightAction && <View style={styles.iconBtn} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Header;
