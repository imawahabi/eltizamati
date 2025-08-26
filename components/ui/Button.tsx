import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface ButtonProps {
  title?: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  rounded?: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  className?: string;
  textClassName?: string;
  haptic?: boolean;
  children?: React.ReactNode;
}

const sizeClasses = {
  sm: 'px-3 py-2',
  md: 'px-5 py-3',
  lg: 'px-6 py-4',
  xl: 'px-8 py-5',
};

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

const variantClasses = {
  primary: 'bg-primary-600 active:bg-primary-700',
  secondary: 'bg-surface border border-primary-200 active:bg-primary-50',
  success: 'bg-success-600 active:bg-success-700',
  danger: 'bg-danger-500 active:bg-danger-600',
  ghost: 'bg-transparent active:bg-muted-100',
  gradient: '',
};

const textVariantClasses = {
  primary: 'text-white',
  secondary: 'text-primary-600',
  success: 'text-white',
  danger: 'text-white',
  ghost: 'text-primary-600',
  gradient: 'text-white',
};

const roundedClasses = {
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
};

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  rounded = 'xl',
  className = '',
  textClassName = '',
  haptic = true,
  children,
}) => {
  const handlePress = async () => {
    if (disabled || loading) return;
    
    if (haptic) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    onPress();
  };

  const buttonContent = (
    <View className="flex-row items-center justify-center">
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'secondary' || variant === 'ghost' ? '#0B63FF' : '#FFFFFF'}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <View className="mr-2">{icon}</View>
          )}
          {children || (
            <Text
              className={`font-cairo-semibold ${textSizeClasses[size]} ${textVariantClasses[variant]} ${textClassName}`}
            >
              {title}
            </Text>
          )}
          {icon && iconPosition === 'right' && (
            <View className="ml-2">{icon}</View>
          )}
        </>
      )}
    </View>
  );

  const buttonClasses = `
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${roundedClasses[rounded]}
    ${fullWidth ? 'w-full' : ''}
    ${disabled ? 'opacity-50' : ''}
    ${className}
  `.trim();

  if (variant === 'gradient') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        className={fullWidth ? 'w-full' : ''}
      >
        <LinearGradient
          colors={['#0B63FF', '#2C9BF0', '#8FD3FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className={`${sizeClasses[size]} ${roundedClasses[rounded]} ${disabled ? 'opacity-50' : ''}`}
        >
          {buttonContent}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      className={buttonClasses}
    >
      {buttonContent}
    </TouchableOpacity>
  );
};
