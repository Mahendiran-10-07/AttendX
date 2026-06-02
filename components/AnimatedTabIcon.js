import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * AnimatedTabIcon — plays a unique animation every time a tab is focused.
 *
 * animType:
 *  'smoke'  — Home: house puffs + 3 smoke particles rise
 *  'roll'   — Mark: tick spins forward 360° like a rolling stamp
 *  'tear'   — Calendar: calendar jolts/wobbles like a page tearing off
 *  'spin'   — Timetable: grid spins 360° in circular motion
 *  'flip'   — Subjects: scaleX collapses twice like book pages turning
 */
const AnimatedTabIcon = ({ iconName, color, size, focused, animType }) => {
  const main = useRef(new Animated.Value(0)).current;
  const p1   = useRef(new Animated.Value(0)).current;
  const p2   = useRef(new Animated.Value(0)).current;
  const p3   = useRef(new Animated.Value(0)).current;

  // ─── Trigger on every focus ───────────────────────────────────
  useEffect(() => {
    if (focused) {
      play();
    }
  }, [focused]);

  const play = () => {
    // Always reset before playing
    main.setValue(0);

    if (animType === 'smoke') {
      p1.setValue(0);
      p2.setValue(0);
      p3.setValue(0);

      Animated.parallel([
        Animated.spring(main, {
          toValue: 1,
          tension: 120,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(p1, { toValue: 1, duration: 650, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.delay(110),
          Animated.timing(p2, { toValue: 1, duration: 580, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.delay(220),
          Animated.timing(p3, { toValue: 1, duration: 520, useNativeDriver: true }),
        ]),
      ]).start(() => {
        p1.setValue(0);
        p2.setValue(0);
        p3.setValue(0);
      });
    } else {
      Animated.timing(main, {
        toValue: 1,
        duration: duration[animType] ?? 420,
        useNativeDriver: true,
      }).start();
    }
  };

  const duration = { roll: 420, tear: 400, spin: 540, flip: 480 };

  // ─── Per-type transform ───────────────────────────────────────
  const iconStyle = () => {
    switch (animType) {

      case 'smoke':
        return {
          transform: [
            { scale: main.interpolate({
                inputRange:  [0,   0.3,  0.6,  0.8,  1],
                outputRange: [1,   1.4,  0.85, 1.1,  1],
              }),
            },
            { translateY: main.interpolate({
                inputRange:  [0, 0.4, 1],
                outputRange: [0, -6,  0],
              }),
            },
          ],
        };

      case 'roll':
        // Checkmark rolls forward like a stamp — rotate + squish mid-spin
        return {
          transform: [
            { rotate: main.interpolate({
                inputRange:  [0,       0.5,      0.85,     1],
                outputRange: ['0deg', '200deg', '340deg', '360deg'],
              }),
            },
            { scale: main.interpolate({
                inputRange:  [0,  0.25, 0.5, 0.75, 1],
                outputRange: [1,  0.9,  0.65, 0.9, 1],
              }),
            },
          ],
        };

      case 'tear':
        // Calendar tears: jerk diagonally with wobble
        return {
          transform: [
            { translateY: main.interpolate({
                inputRange:  [0,    0.15, 0.3,  0.5,  0.7,  0.85, 1],
                outputRange: [0,   -5,    7,   -4,    3,   -1,    0],
              }),
            },
            { translateX: main.interpolate({
                inputRange:  [0,  0.2,  0.4,  0.6,  0.8,  1],
                outputRange: [0,   4,   -5,    3,   -1,    0],
              }),
            },
            { rotate: main.interpolate({
                inputRange:  [0,       0.2,     0.45,    0.65,   0.85,   1],
                outputRange: ['0deg', '-10deg', '8deg', '-5deg', '2deg', '0deg'],
              }),
            },
          ],
        };

      case 'spin':
        // Timetable: full smooth 360 rotation
        return {
          transform: [
            { rotate: main.interpolate({
                inputRange:  [0,       0.7,       1],
                outputRange: ['0deg', '300deg', '360deg'],
              }),
            },
            { scale: main.interpolate({
                inputRange:  [0,  0.45, 1],
                outputRange: [1,  1.18, 1],
              }),
            },
          ],
        };

      case 'flip':
        // Subjects: scaleX collapses to thin strip → back → again (2 page flips)
        return {
          transform: [
            { scaleX: main.interpolate({
                inputRange:  [0,   0.18, 0.38, 0.56, 0.76, 1],
                outputRange: [1,   0.08, 1,    0.08, 1,    1],
              }),
            },
            { scale: main.interpolate({
                inputRange:  [0, 0.18, 0.38, 0.56, 0.76, 1],
                outputRange: [1,  1.1, 1,    1.1,  1,    1],
              }),
            },
          ],
        };

      default:
        return {};
    }
  };

  // ─── Smoke particle helper ────────────────────────────────────
  const particle = (anim, dx) => ({
    opacity: anim.interpolate({
      inputRange:  [0, 0.15, 0.6, 1],
      outputRange: [0, 0.8,  0.4, 0],
    }),
    transform: [
      { translateY: anim.interpolate({
          inputRange:  [0,  1],
          outputRange: [0, -24],
        }),
      },
      { translateX: anim.interpolate({
          inputRange:  [0,   0.5,       1],
          outputRange: [dx, dx * 0.4, dx * 1.6],
        }),
      },
      { scale: anim.interpolate({
          inputRange:  [0,   0.4, 1],
          outputRange: [0.3, 1,   0.15],
        }),
      },
    ],
  });

  return (
    <View style={styles.wrap}>
      {/* Smoke particles — Home only */}
      {animType === 'smoke' && (
        <>
          <Animated.View style={[styles.dot, { backgroundColor: color }, particle(p1, -5)]} />
          <Animated.View style={[styles.dot, { backgroundColor: color }, particle(p2,  0)]} />
          <Animated.View style={[styles.dot, { backgroundColor: color }, particle(p3,  5)]} />
        </>
      )}

      {/* Icon */}
      <Animated.View style={iconStyle()}>
        <Ionicons name={iconName} size={size} color={color} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    width: 30,
    height: 30,
  },
  dot: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 3,
    top: 4,
  },
});

export default AnimatedTabIcon;
