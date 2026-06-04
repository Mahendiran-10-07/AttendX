import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Linking, StatusBar, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/theme';

const CONTACTS = [
  {
    id: 'linkedin',
    icon: 'linkedin',
    label: 'LinkedIn',
    url: 'https://linkedin.com/in/mahendiran0',
  },
  {
    id: 'github',
    icon: 'github',
    label: 'GitHub',
    url: 'https://github.com/Mahendiran-10-07',
  },
  {
    id: 'gmail',
    icon: 'gmail',
    label: 'Gmail',
    url: 'mailto:support.mahendiran@gmail.com',
  },
];

const AboutScreen = () => {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const C = isDark ? COLORS.dark : COLORS.light;
  const insets = useSafeAreaInsets();

  const openLink = (url) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.bg} />

      {/* Header */}
      <View style={[styles.headerArea, { paddingTop: insets.top + SPACING.md }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={[TYPOGRAPHY.h2, { color: C.text }]}>About</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: SPACING.xl, paddingBottom: insets.bottom + 90 }}
      >
        {/* ── App Identity Card ── */}
        <View style={[styles.appCard, { backgroundColor: C.card, borderColor: C.border, ...(isDark ? SHADOWS.dark.small : SHADOWS.light.small) }]}>

          {/* Real App Icon */}
          <View style={[styles.iconWrapper, { borderColor: C.accent + '40', backgroundColor: C.accentBg }]}>
            <Image
              source={require('../assets/icon.png')}
              style={styles.appIcon}
              resizeMode="cover"
            />
          </View>

          <Text style={[TYPOGRAPHY.h2, { color: C.text, marginTop: SPACING.md, letterSpacing: -0.5 }]}>
            AttendX
          </Text>
          <View style={[styles.versionBadge, { backgroundColor: C.accentBg, borderColor: C.accent + '40' }]}>
            <Text style={[TYPOGRAPHY.tiny, { color: C.accent, letterSpacing: 0.5 }]}>v 1.0.0</Text>
          </View>

          <Text style={[TYPOGRAPHY.body, { color: C.textSecondary, marginTop: SPACING.md, textAlign: 'center', lineHeight: 22 }]}>
            Smart attendance tracker for college students.{'\n'}
            Track, manage, and never miss your target.
          </Text>

          {/* Tags */}
          <View style={styles.tagRow}>
            {['Offline', 'Private', 'Android'].map(tag => (
              <View key={tag} style={[styles.tag, { backgroundColor: C.accentBg, borderColor: C.accent + '30' }]}>
                <Text style={[TYPOGRAPHY.tiny, { color: C.accent }]}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Developer ── */}
        <Text style={[styles.sectionLabel, { color: C.textMuted }]}>DEVELOPER</Text>
        <View style={[styles.devCard, { backgroundColor: C.card, borderColor: C.border, ...(isDark ? SHADOWS.dark.small : SHADOWS.light.small) }]}>
          <View style={[styles.avatar, { backgroundColor: C.accentBg, borderColor: C.accent + '50' }]}>
            <Text style={[TYPOGRAPHY.h3, { color: C.accent }]}>M</Text>
          </View>
          <View style={{ flex: 1, marginLeft: SPACING.md }}>
            <Text style={[TYPOGRAPHY.h4, { color: C.text }]}>Mahendiran</Text>
            <Text style={[TYPOGRAPHY.small, { color: C.textMuted }]}>Mobile App Developer</Text>
          </View>
          <View style={[styles.devBadge, { backgroundColor: C.accentBg }]}>
            <Ionicons name="code-slash-outline" size={16} color={C.accent} />
          </View>
        </View>

        {/* ── Contact — Big Icon Row ── */}
        <Text style={[styles.sectionLabel, { color: C.textMuted }]}>CONTACT</Text>
        <View style={[styles.socialCard, { backgroundColor: C.card, borderColor: C.border, ...(isDark ? SHADOWS.dark.small : SHADOWS.light.small) }]}>
          <View style={styles.iconRow}>
            {CONTACTS.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.iconBtnWrap}
                onPress={() => openLink(item.url)}
                activeOpacity={0.7}
              >
                {/* Big outlined icon box — matches uploaded image style */}
                <View style={[styles.bigIconBox, { borderColor: C.accent + '60', backgroundColor: C.accentBg }]}>
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={36}
                    color={C.accent}
                  />
                </View>
                <Text style={[TYPOGRAPHY.tiny, { color: C.textMuted, marginTop: SPACING.xs, letterSpacing: 0.3 }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Text style={[TYPOGRAPHY.small, { color: C.textMuted }]}>Made with </Text>
          <Ionicons name="heart" size={13} color="#EF5350" />
          <Text style={[TYPOGRAPHY.small, { color: C.textMuted }]}> by Mahendiran</Text>
        </View>
        <Text style={[TYPOGRAPHY.tiny, { color: C.textMuted, textAlign: 'center', marginTop: SPACING.xs }]}>
          All data stored locally on your device. No cloud. No login.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  headerArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  backBtn: {
    width: 36, height: 36,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: RADIUS.md,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
  },

  // App card
  appCard: {
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    padding: SPACING.xl,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  iconWrapper: {
    width: 90, height: 90,
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
  },
  appIcon: {
    width: 90, height: 90,
    borderRadius: RADIUS.xl,
  },
  versionBadge: {
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  tagRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: SPACING.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  tag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },

  // Developer card
  devCard: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48, height: 48,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  devBadge: {
    width: 36, height: 36,
    borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
  },

  // Social icon row — like the uploaded image
  socialCard: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.xl,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  iconBtnWrap: {
    alignItems: 'center',
  },
  bigIconBox: {
    width: 72, height: 72,
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xxxl,
    marginBottom: SPACING.xs,
  },
});

export default AboutScreen;
