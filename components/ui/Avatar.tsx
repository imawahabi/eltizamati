import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useLayout } from '@/hooks/useLayout';

interface AvatarProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  source?: { uri: string } | number;
  fallback?: string;
  backgroundColor?: string;
  textColor?: string;
  style?: any;
}

export function Avatar({ 
  size = 'medium',
  source,
  fallback,
  backgroundColor,
  textColor,
  style 
}: AvatarProps) {
  const { colors } = useTheme();
  const { isRTL } = useLayout();
  
  const styles = createStyles(colors, isRTL);
  
  const avatarStyle = [
    styles.avatar,
    styles[size],
    backgroundColor && { backgroundColor },
    style
  ];
  
  const textStyle = [
    styles.text,
    styles[`${size}Text`],
    textColor && { color: textColor }
  ];
  
  if (source) {
    return (
      <View style={avatarStyle}>
        <Image source={source} style={styles.image} />
      </View>
    );
  }
  
  return (
    <View style={avatarStyle}>
      <Text style={textStyle}>
        {fallback ? fallback.charAt(0).toUpperCase() : '?'}
      </Text>
    </View>
  );
}

function createStyles(colors: any, isRTL: boolean) {
  return StyleSheet.create({
    avatar: {
      borderRadius: 999,
      backgroundColor: colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    
    // Sizes
    small: {
      width: 32,
      height: 32,
    },
    medium: {
      width: 40,
      height: 40,
    },
    large: {
      width: 56,
      height: 56,
    },
    xlarge: {
      width: 80,
      height: 80,
    },
    
    image: {
      width: '100%',
      height: '100%',
      borderRadius: 999,
    },
    
    text: {
      fontFamily: 'Cairo-Bold',
      color: colors.text,
      textAlign: 'center',
    },
    
    // Text sizes
    smallText: {
      fontSize: 14,
    },
    mediumText: {
      fontSize: 16,
    },
    largeText: {
      fontSize: 20,
    },
    xlargeText: {
      fontSize: 28,
    },
  });
}
