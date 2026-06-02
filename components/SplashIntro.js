import React, { useEffect, useRef } from 'react';
import {
  View, Image, StyleSheet, Animated, Easing, Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const LOGO_SIZE = 110; // size of the rounded square

/**
 * SplashIntro
 * Shows the AttendX logo for ~1 second on app launch, then calls onDone().
 *
 * Props:
 *   onDone()  — called when the exit animation finishes
 *   bgColor   — background colour (pass C.bg from theme)
 *   accentColor — border / glow colour
 */
const SplashIntro = ({ onDone, bgColor = '#F5F5EF', accentColor = '#5C8B6E' }) => {
  // ── Animations ────────────────────────────────────────────────
  const scaleAnim  = useRef(new Animated.Value(0.6)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const glowAnim   = useRef(new Animated.Value(0)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Entrance: scale + fade in
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 70,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 2. Hold for 800ms
      setTimeout(() => {
        // 3. Exit: fade entire screen out
        Animated.timing(exitOpacity, {
          toValue: 0,
          duration: 300,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }).start(() => onDone());
      }, 800);
    });
  }, []);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.25],
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgColor, opacity: exitOpacity }]}>

      {/* Soft background glow behind the logo */}
      <Animated.View
        style={[
          styles.bgGlow,
          { backgroundColor: accentColor, opacity: glowOpacity },
        ]}
      />

      {/* Logo card */}
      <Animated.View
        style={[
          styles.logoCard,
          {
            borderColor: accentColor + '40',
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* App name below */}
      <Animated.Text
        style={[
          styles.appName,
          { color: accentColor, opacity: opacityAnim },
        ]}
      >
        AttendX
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  bgGlow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
  },
  logoCard: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: 28,          // rounded square
    borderWidth: 1.5,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    // Soft shadow
    shadowColor: '#5C8B6E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  logo: {
    width: LOGO_SIZE * 0.72,
    height: LOGO_SIZE * 0.72,
  },
  appName: {
    marginTop: 20,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 2,
  },
});

export default SplashIntro;
