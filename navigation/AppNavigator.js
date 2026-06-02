import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/HomeScreen';
import MarkScreen from '../screens/MarkScreen';
import TimetableScreen from '../screens/TimetableScreen';
import SubjectsScreen from '../screens/SubjectsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CalendarScreen from '../screens/CalendarScreen';
import AnimatedTabIcon from '../components/AnimatedTabIcon';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Each tab: icon names + unique animation type
const TAB_ITEMS = [
  {
    name: 'Home',
    icon: 'home',
    iconOutline: 'home-outline',
    animType: 'smoke',       // House floats up with smoke particles
    component: HomeScreen,
  },
  {
    name: 'Mark',
    icon: 'checkbox',
    iconOutline: 'checkbox-outline',
    animType: 'roll',        // Tick rolls/spins like a stamp
    component: MarkScreen,
  },
  {
    name: 'Calendar',
    icon: 'calendar',
    iconOutline: 'calendar-outline',
    animType: 'tear',        // Calendar page tears off
    component: CalendarScreen,
  },
  {
    name: 'Timetable',
    icon: 'grid',
    iconOutline: 'grid-outline',
    animType: 'spin',        // Cubes spin 360 in circular motion
    component: TimetableScreen,
  },
  {
    name: 'Subjects',
    icon: 'book',
    iconOutline: 'book-outline',
    animType: 'flip',        // Book pages flip (scaleX oscillation)
    component: SubjectsScreen,
  },
];

const TabNavigator = () => {
  const { isDark } = useTheme();
  const C = isDark ? COLORS.dark : COLORS.light;
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const item = TAB_ITEMS.find(t => t.name === route.name);
        return {
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <AnimatedTabIcon
              iconName={focused ? item.icon : item.iconOutline}
              color={color}
              size={22}
              focused={focused}
              animType={item.animType}
            />
          ),
          tabBarActiveTintColor: C.accent,
          tabBarInactiveTintColor: C.textMuted,
          tabBarStyle: {
            backgroundColor: C.tabBar,
            borderTopColor: C.tabBarBorder,
            borderTopWidth: 1,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
            paddingTop: 8,
            height: 60 + (insets.bottom > 0 ? insets.bottom : 8),
            overflow: 'visible',
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontFamily: 'Inter_500Medium',
            marginTop: 2,
          },
        };
      }}
    >
      {TAB_ITEMS.map(item => (
        <Tab.Screen
          key={item.name}
          name={item.name}
          component={item.component}
        />
      ))}
    </Tab.Navigator>
  );
};

const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Main" component={TabNavigator} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
  </Stack.Navigator>
);

export default AppNavigator;
