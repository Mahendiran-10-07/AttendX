import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSettings } from '../utils/storage';

const ThemeContext = createContext();

const SETTINGS_KEY = '@attetrack_settings';

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light'); // default to light for new users
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const settings = await getSettings();
      setTheme(settings.theme || 'light'); // light for fresh installs
      setLoaded(true);
    })();
  }, []);

  // Instant toggle — no async read, just update state + fire-and-forget save
  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      // Read current settings from storage and update theme key only
      AsyncStorage.getItem(SETTINGS_KEY).then(raw => {
        const current = raw ? JSON.parse(raw) : {};
        AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...current, theme: next }));
      });
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark', loaded }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
