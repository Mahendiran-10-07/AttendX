import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AttendanceProvider } from './context/AttendanceContext';
import AppNavigator from './navigation/AppNavigator';
import SplashIntro from './components/SplashIntro';
import { COLORS } from './constants/theme';

const AppContent = () => {
  const { isDark, loaded: themeLoaded } = useTheme();
  const C = isDark ? COLORS.dark : COLORS.light;

  const [fontsLoaded] = useFonts({
    Inter_400Regular, Inter_500Medium,
    Inter_600SemiBold, Inter_700Bold,
  });

  // showSplash: true = show the logo intro, false = show the app
  const [showSplash, setShowSplash] = useState(true);

  const isReady = fontsLoaded && themeLoaded;

  // While fonts/theme are loading, show nothing (native splash still visible)
  if (!isReady) return <View style={[styles.blank, { backgroundColor: C.bg }]} />;

  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}>
      {/* Main app always rendered behind the splash */}
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>

      {/* Splash overlay — sits on top, removes itself after animation */}
      {showSplash && (
        <SplashIntro
          bgColor={C.bg}
          accentColor={C.accent}
          onDone={() => setShowSplash(false)}
        />
      )}
    </View>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AttendanceProvider>
            <AppContent />
          </AttendanceProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1 },
  blank: { flex: 1 },
});
