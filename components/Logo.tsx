import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CreditCard, TrendingUp } from 'lucide-react-native';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  variant?: 'primary' | 'white' | 'dark';
}

export default function Logo({ 
  size = 'medium', 
  showText = true, 
  variant = 'primary' 
}: LogoProps) {
  const dimensions = {
    small: { width: 32, height: 32, fontSize: 12, textSize: 14 },
    medium: { width: 48, height: 48, fontSize: 16, textSize: 18 },
    large: { width: 80, height: 80, fontSize: 24, textSize: 24 },
  };

  const colors = {
    primary: {
      gradient: ['#007AFF', '#5856D6'],
      text: '#007AFF',
      icon: '#fff',
    },
    white: {
      gradient: ['#fff', '#f8f9fa'],
      text: '#007AFF',
      icon: '#007AFF',
    },
    dark: {
      gradient: ['#2c3e50', '#34495e'],
      text: '#fff',
      icon: '#fff',
    },
  };

  const currentSize = dimensions[size];
  const currentColors = colors[variant];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={currentColors.gradient as [string, string]}
        style={[
          styles.logoContainer,
          {
            width: currentSize.width,
            height: currentSize.height,
          },
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.iconContainer}>
          <CreditCard 
            size={currentSize.fontSize} 
            color={currentColors.icon} 
            strokeWidth={2}
          />
          <TrendingUp 
            size={currentSize.fontSize * 0.7} 
            color={currentColors.icon} 
            strokeWidth={2.5}
            style={styles.trendIcon}
          />
        </View>
      </LinearGradient>
      
      {showText && (
        <Text 
          style={[
            styles.logoText, 
            { 
              fontSize: currentSize.textSize,
              color: currentColors.text,
            }
          ]}
        >
          إلتزاماتي
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  logoContainer: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  logoText: {
    fontFamily: 'Cairo-Bold',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});
