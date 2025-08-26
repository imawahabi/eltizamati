import React from 'react';
import { View, Pressable, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'gradient' | 'glass' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
  xl: 'p-6',
};

const variantStyles = {
  default: 'bg-white shadow-card',
  gradient: '',
  glass: 'bg-white/85 backdrop-blur-md',
  bordered: 'bg-white border border-muted-200',
};

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  onPress,
  disabled = false,
  className = '',
  ...props
}) => {
  const cardClasses = `
    rounded-2xl
    ${variantStyles[variant]}
    ${paddingClasses[padding]}
    ${disabled ? 'opacity-50' : ''}
    ${className}
  `.trim();

  if (variant === 'gradient') {
    const content = (
      <LinearGradient
        colors={['#FFFFFF', '#F7F9FC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className={`rounded-2xl ${paddingClasses[padding]} ${disabled ? 'opacity-50' : ''}`}
      >
        {children}
      </LinearGradient>
    );

    if (onPress) {
      return (
        <Pressable onPress={onPress} disabled={disabled}>
          {content}
        </Pressable>
      );
    }
    return content;
  }

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        className={cardClasses}
        {...props}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View className={cardClasses} {...props}>
      {children}
    </View>
  );
};
