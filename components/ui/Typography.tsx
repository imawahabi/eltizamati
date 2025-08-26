import React from 'react';
import { Text, TextProps } from 'react-native';

interface TypographyProps extends TextProps {
  variant?: 'display' | 'h1' | 'h2' | 'h3' | 'body-lg' | 'body' | 'body-sm' | 'caption' | 'tiny';
  color?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'success' | 'danger' | 'warning';
  weight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'black';
  align?: 'left' | 'center' | 'right';
}

const variantClasses = {
  'display': 'text-[32px] leading-[44px]',
  'h1': 'text-[24px] leading-[32px]',
  'h2': 'text-[20px] leading-[28px]',
  'h3': 'text-[18px] leading-[26px]',
  'body-lg': 'text-[18px] leading-[28px]',
  'body': 'text-[16px] leading-[24px]',
  'body-sm': 'text-[14px] leading-[20px]',
  'caption': 'text-[12px] leading-[16px]',
  'tiny': 'text-[10px] leading-[14px]',
};

const colorClasses = {
  'primary': 'text-text-primary',
  'secondary': 'text-text-secondary',
  'tertiary': 'text-text-tertiary',
  'inverse': 'text-text-inverse',
  'success': 'text-success-600',
  'danger': 'text-danger-500',
  'warning': 'text-warning-500',
};

const weightClasses = {
  'light': 'font-cairo-light',
  'regular': 'font-cairo-regular',
  'medium': 'font-cairo-medium',
  'semibold': 'font-cairo-semibold',
  'bold': 'font-cairo-bold',
  'black': 'font-cairo-black',
};

const alignClasses = {
  'left': 'text-left',
  'center': 'text-center',
  'right': 'text-right',
};

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color = 'primary',
  weight = 'regular',
  align = 'right',
  className = '',
  children,
  ...props
}) => {
  const defaultWeight = variant === 'display' || variant === 'h1' ? 'bold' : 
                       variant === 'h2' || variant === 'h3' ? 'semibold' : 'regular';
  
  const finalWeight = weight || defaultWeight;
  
  const classes = `
    ${variantClasses[variant]}
    ${colorClasses[color]}
    ${weightClasses[finalWeight]}
    ${alignClasses[align]}
    ${className}
  `.trim();

  return (
    <Text className={classes} {...props}>
      {children}
    </Text>
  );
};
