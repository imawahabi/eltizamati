import React, { forwardRef, useState } from 'react';
import { TextInput, View, Text, TextInputProps, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface InputProps extends Omit<TextInputProps, 'className'> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  variant?: 'default' | 'filled' | 'outlined' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'md' | 'lg' | 'xl' | '2xl' | 'full';
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  type?: 'text' | 'password' | 'email' | 'number';
}

const sizeClasses = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-base',
  lg: 'px-5 py-4 text-lg',
};

const variantClasses = {
  default: 'bg-surface border border-muted-200 focus:border-primary-500',
  filled: 'bg-muted-100 border border-transparent focus:bg-surface focus:border-primary-500',
  outlined: 'bg-transparent border-2 border-muted-300 focus:border-primary-500',
  ghost: 'bg-transparent border-b-2 border-muted-200 focus:border-primary-500 rounded-none',
};

const roundedClasses = {
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

export const Input = forwardRef<TextInput, InputProps>((
  {
    label,
    error,
    hint,
    icon,
    iconPosition = 'right',
    variant = 'default',
    size = 'md',
    rounded = 'xl',
    containerClassName = '',
    labelClassName = '',
    inputClassName = '',
    type = 'text',
    secureTextEntry,
    ...props
  },
  ref
) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleTogglePassword = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowPassword(!showPassword);
  };

  const inputClasses = `
    ${sizeClasses[size]}
    ${variant !== 'ghost' ? roundedClasses[rounded] : ''}
    font-cairo-regular
    text-text-primary
    ${error ? 'border-danger-500' : variantClasses[variant]}
    ${isFocused ? 'shadow-sm' : ''}
    ${inputClassName}
  `.trim();

  const isPasswordField = type === 'password' || secureTextEntry;

  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && (
        <Text
          className={`text-sm font-cairo-medium text-text-secondary mb-2 ${labelClassName}`}
        >
          {label}
        </Text>
      )}
      
      <View className="relative">
        {icon && iconPosition === 'left' && (
          <View className="absolute left-3 top-0 bottom-0 justify-center z-10">
            {icon}
          </View>
        )}
        
        <TextInput
          ref={ref}
          className={`
            ${inputClasses}
            ${icon && iconPosition === 'left' ? 'pl-12' : ''}
            ${icon && iconPosition === 'right' ? 'pr-12' : ''}
            ${isPasswordField ? 'pr-12' : ''}
          `}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={isPasswordField && !showPassword}
          keyboardType={type === 'email' ? 'email-address' : type === 'number' ? 'numeric' : 'default'}
          autoCapitalize={type === 'email' ? 'none' : props.autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {icon && iconPosition === 'right' && !isPasswordField && (
          <View className="absolute right-3 top-0 bottom-0 justify-center">
            {icon}
          </View>
        )}
        
        {isPasswordField && (
          <Pressable
            onPress={handleTogglePassword}
            className="absolute right-3 top-0 bottom-0 justify-center"
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color="#9CA3AF"
            />
          </Pressable>
        )}
      </View>
      
      {hint && !error && (
        <Text className="text-xs font-cairo-regular text-text-tertiary mt-1">
          {hint}
        </Text>
      )}
      
      {error && (
        <Text className="text-xs font-cairo-regular text-danger-500 mt-1">
          {error}
        </Text>
      )}
    </View>
  );
});
