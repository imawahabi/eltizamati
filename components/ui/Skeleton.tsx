import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
  animated?: boolean;
}

export function Skeleton({ 
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  animated = true
}: SkeletonProps) {
  const { colors } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (animated) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [animated]);
  
  const backgroundColor = animated
    ? animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.surfaceVariant, colors.border],
      })
    : colors.surfaceVariant;
  
  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
});

// Skeleton variants for common UI elements
export function SkeletonText({ lines = 1, style }: { lines?: number; style?: any }) {
  return (
    <View style={style}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={16}
          width={index === lines - 1 ? '70%' : '100%'}
          style={{ marginBottom: index < lines - 1 ? 8 : 0 }}
        />
      ))}
    </View>
  );
}

export function SkeletonCard({ style }: { style?: any }) {
  return (
    <View style={[{ padding: 16 }, style]}>
      <Skeleton height={20} width="60%" style={{ marginBottom: 12 }} />
      <SkeletonText lines={2} />
      <Skeleton height={32} width="40%" style={{ marginTop: 16 }} />
    </View>
  );
}
