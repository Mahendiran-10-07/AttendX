import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { TYPOGRAPHY } from '../constants/theme';

const CircularProgress = ({
  size = 100,
  strokeWidth = 10,
  percentage = 0,
  color = '#6C63FF',
  bgColor = 'rgba(108,99,255,0.15)',
  textColor = '#FFFFFF',
  showLabel = true,
  labelStyle,
  sublabel,
  sublabelStyle,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const gradId = `grad_${color.replace('#', '')}`;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity="1" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.7" />
          </LinearGradient>
        </Defs>
        {/* Background track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      {showLabel && (
        <View style={{ alignItems: 'center' }}>
          <Text style={[TYPOGRAPHY.h3, { color: textColor }, labelStyle]}>
            {percentage}%
          </Text>
          {sublabel && (
            <Text style={[TYPOGRAPHY.tiny, { color: textColor, opacity: 0.7 }, sublabelStyle]}>
              {sublabel}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

export default CircularProgress;
