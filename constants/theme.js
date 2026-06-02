// AtteTrack Design System — Warm Green Theme
export const COLORS = {
  dark: {
    bg: '#000000',           // Pure black
    bgSecondary: '#0D0D0D',
    card: '#111111',
    cardElevated: '#1C1C1C',
    border: '#272727',
    text: '#F5F5F5',
    textSecondary: '#AAAAAA',
    textMuted: '#666666',
    accent: '#6BAA6A',       // Sage green
    accentLight: '#85C484',
    accentBg: 'rgba(107,170,106,0.15)',
    present: '#4CAF50',
    presentBg: 'rgba(76,175,80,0.15)',
    absent: '#EF5350',
    absentBg: 'rgba(239,83,80,0.15)',
    holiday: '#FFA726',
    holidayBg: 'rgba(255,167,38,0.15)',
    warning: '#FF7043',
    warningBg: 'rgba(255,112,67,0.15)',
    danger: '#EF5350',
    success: '#4CAF50',
    tabBar: '#111111',
    tabBarBorder: '#272727',
  },
  light: {
    bg: '#F5F2EC',           // Warm cream
    bgSecondary: '#EDE9DF',
    card: '#FFFFFF',
    cardElevated: '#FAF8F4',
    border: '#E5DFD3',
    text: '#1A1A1A',
    textSecondary: '#5A5550',
    textMuted: '#9A9590',
    accent: '#5B8C5A',       // Sage green
    accentLight: '#4A7849',
    accentBg: 'rgba(91,140,90,0.12)',
    present: '#388E3C',
    presentBg: 'rgba(56,142,60,0.12)',
    absent: '#D32F2F',
    absentBg: 'rgba(211,47,47,0.12)',
    holiday: '#E65100',
    holidayBg: 'rgba(230,81,0,0.12)',
    warning: '#E65100',
    warningBg: 'rgba(230,81,0,0.12)',
    danger: '#D32F2F',
    success: '#388E3C',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E5DFD3',
  },
};

export const TYPOGRAPHY = {
  h1: { fontSize: 28, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  h2: { fontSize: 22, fontFamily: 'Inter_700Bold', letterSpacing: -0.3 },
  h3: { fontSize: 18, fontFamily: 'Inter_600SemiBold', letterSpacing: -0.2 },
  h4: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  body: { fontSize: 15, fontFamily: 'Inter_400Regular' },
  bodyMedium: { fontSize: 15, fontFamily: 'Inter_500Medium' },
  small: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  smallMedium: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  tiny: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  caption: { fontSize: 12, fontFamily: 'Inter_400Regular' },
};

export const SPACING = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32,
};

export const RADIUS = {
  sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, full: 9999,
};

export const SHADOWS = {
  dark: {
    small: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 4 },
    medium: { shadowColor: '#6BAA6A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 6 },
  },
  light: {
    small: { shadowColor: '#8B7355', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
    medium: { shadowColor: '#5B8C5A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 6 },
  },
};

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const HOURS_PER_DAY = 5;
export const DEFAULT_TARGET = 75;
