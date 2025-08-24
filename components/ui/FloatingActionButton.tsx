import React from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useLayout } from '@/hooks/useLayout';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary';
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  style?: any;
  disabled?: boolean;
}

export function FloatingActionButton({ 
  onPress,
  icon,
  size = 'medium',
  variant = 'primary',
  position = 'bottom-right',
  style,
  disabled = false
}: FloatingActionButtonProps) {
  const { colors } = useTheme();
  const { isRTL } = useLayout();
  
  const styles = createStyles(colors, isRTL);
  const scaleValue = React.useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };
  
  return (
    <Animated.View
      style={[
        styles.container,
        styles[position],
        { transform: [{ scale: scaleValue }] },
        style
      ]}
    >
      <TouchableOpacity
        style={[
          styles.fab,
          styles[size],
          styles[variant],
          disabled && styles.disabled
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.8}
      >
        {icon}
      </TouchableOpacity>
    </Animated.View>
  );
}

function createStyles(colors: any, isRTL: boolean) {
  return StyleSheet.create({
    container: {
      position: 'absolute',
      zIndex: 1000,
    },
    
    // Positions
    'bottom-right': {
      bottom: 24,
      right: isRTL ? undefined : 24,
      left: isRTL ? 24 : undefined,
    },
    'bottom-left': {
      bottom: 24,
      left: isRTL ? undefined : 24,
      right: isRTL ? 24 : undefined,
    },
    'bottom-center': {
      bottom: 24,
      alignSelf: 'center',
    },
    
    fab: {
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 6,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,
    },
    
    // Sizes
    small: {
      width: 48,
      height: 48,
    },
    medium: {
      width: 56,
      height: 56,
    },
    large: {
      width: 64,
      height: 64,
    },
    
    // Variants
    primary: {
      backgroundColor: colors.primary,
    },
    secondary: {
      backgroundColor: colors.secondary,
    },
    
    disabled: {
      opacity: 0.5,
      elevation: 0,
      shadowOpacity: 0,
    },
  });
}
