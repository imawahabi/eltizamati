import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useLayout } from '@/hooks/useLayout';

interface ProgressBarProps {
  progress: number; // 0 to 100
  height?: number;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  style?: any;
}

export function ProgressBar({ 
  progress,
  height = 8,
  color,
  backgroundColor,
  showLabel = false,
  label,
  animated = true,
  style 
}: ProgressBarProps) {
  const { colors } = useTheme();
  const { isRTL } = useLayout();
  
  const styles = createStyles(colors, isRTL, height);
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: progress,
        duration: 500,
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(progress);
    }
  }, [progress, animated]);
  
  const progressColor = color || colors.primary;
  const trackColor = backgroundColor || colors.surfaceVariant;
  
  return (
    <View style={[styles.container, style]}>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {label || `${Math.round(progress)}%`}
          </Text>
        </View>
      )}
      <View style={[styles.track, { backgroundColor: trackColor }]}>
        <Animated.View
          style={[
            styles.progress,
            {
              backgroundColor: progressColor,
              width: animatedValue.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp',
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

function createStyles(colors: any, isRTL: boolean, height: number) {
  return StyleSheet.create({
    container: {
      width: '100%',
    },
    labelContainer: {
      marginBottom: 8,
      alignItems: isRTL ? 'flex-end' : 'flex-start',
    },
    label: {
      fontSize: 12,
      fontFamily: 'Cairo-Medium',
      color: colors.textSecondary,
      textAlign: isRTL ? 'right' : 'left',
    },
    track: {
      height,
      borderRadius: height / 2,
      overflow: 'hidden',
    },
    progress: {
      height: '100%',
      borderRadius: height / 2,
    },
  });
}
