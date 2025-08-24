import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useLayout } from '@/hooks/useLayout';
import { X } from 'lucide-react-native';

interface ChipProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'filled';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium';
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  onDelete?: () => void;
  icon?: React.ReactNode;
  style?: any;
}

export function Chip({ 
  children, 
  variant = 'default',
  color = 'primary',
  size = 'medium',
  selected = false,
  disabled = false,
  onPress,
  onDelete,
  icon,
  style 
}: ChipProps) {
  const { colors } = useTheme();
  const { isRTL, getIconDirection } = useLayout();
  
  const styles = createStyles(colors, isRTL);
  
  const chipStyle = [
    styles.chip,
    styles[variant],
    styles[color],
    styles[size],
    selected && styles.selected,
    disabled && styles.disabled,
    style
  ];
  
  const textStyle = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${color}Text`],
    styles[`${size}Text`],
    selected && styles.selectedText,
    disabled && styles.disabledText,
  ];
  
  const Component = onPress ? TouchableOpacity : View;
  
  return (
    <Component
      style={chipStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {icon && (
          <View style={styles.iconContainer}>
            {icon}
          </View>
        )}
        <Text style={textStyle}>{children}</Text>
        {onDelete && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={onDelete}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X 
              size={size === 'small' ? 12 : 14} 
              color={disabled ? colors.textDisabled : colors.textSecondary}
              style={{ transform: [{ scaleX: getIconDirection() }] }}
            />
          </TouchableOpacity>
        )}
      </View>
    </Component>
  );
}

function createStyles(colors: any, isRTL: boolean) {
  return StyleSheet.create({
    chip: {
      borderRadius: 16,
      alignSelf: 'flex-start',
      overflow: 'hidden',
    },
    
    content: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    
    // Variants
    default: {
      backgroundColor: colors.surfaceVariant,
      borderWidth: 1,
      borderColor: colors.border,
    },
    outlined: {
      backgroundColor: 'transparent',
      borderWidth: 1,
    },
    filled: {
      borderWidth: 0,
    },
    
    // Colors
    primary: {},
    secondary: {},
    success: {},
    warning: {},
    error: {},
    
    // Sizes
    small: {
      borderRadius: 12,
    },
    medium: {
      borderRadius: 16,
    },
    
    // States
    selected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    disabled: {
      opacity: 0.5,
    },
    
    // Icon
    iconContainer: {
      marginRight: isRTL ? 0 : 6,
      marginLeft: isRTL ? 6 : 0,
    },
    
    // Delete button
    deleteButton: {
      marginLeft: isRTL ? 0 : 6,
      marginRight: isRTL ? 6 : 0,
      padding: 2,
    },
    
    // Text styles
    text: {
      fontFamily: 'Cairo-Medium',
      textAlign: isRTL ? 'right' : 'left',
    },
    
    // Variant text
    defaultText: {
      color: colors.text,
    },
    outlinedText: {
      color: colors.text,
    },
    filledText: {
      color: colors.textInverse,
    },
    
    // Color text
    primaryText: {},
    secondaryText: {},
    successText: {},
    warningText: {},
    errorText: {},
    
    // Size text
    smallText: {
      fontSize: 12,
    },
    mediumText: {
      fontSize: 14,
    },
    
    // State text
    selectedText: {
      color: colors.textInverse,
    },
    disabledText: {
      color: colors.textDisabled,
    },
  });
}
