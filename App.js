import 'react-native-gesture-handler';
import React from 'react';
import { View } from 'react-native';
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
import { COLORS } from './constants/theme';

const AppContent = () => {
  const { isDark, loaded: themeLoaded } = useTheme();
  const C = isDark ? COLORS.dark : COLORS.light;

  const [fontsLoaded] = useFonts({
    Inter_400Regular, Inter_500Medium,
    Inter_600SemiBold, Inter_700Bold,
  });

  // While fonts/theme are loading, show a blank screen
  // (native Android splash from app.json is still visible during this time)
  if (!fontsLoaded || !themeLoaded) {
    return <View style={{ flex: 1, backgroundColor: C.bg }} />;
  }

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
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
