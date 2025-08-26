import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from './Typography';
import { Card } from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  onPress?: () => void;
  className?: string;
}

const variantStyles = {
  default: {
    iconBg: 'bg-primary-100',
    iconColor: '#0B63FF',
    trendColor: '#10B981',
  },
  success: {
    iconBg: 'bg-success-100',
    iconColor: '#10B981',
    trendColor: '#10B981',
  },
  warning: {
    iconBg: 'bg-warning-100',
    iconColor: '#F59E0B',
    trendColor: '#F59E0B',
  },
  danger: {
    iconBg: 'bg-danger-100',
    iconColor: '#EF4444',
    trendColor: '#EF4444',
  },
  info: {
    iconBg: 'bg-info-100',
    iconColor: '#3B82F6',
    trendColor: '#3B82F6',
  },
};

const trendIcons = {
  up: 'trending-up',
  down: 'trending-down',
  neutral: 'remove',
} as const;

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconColor,
  trend,
  trendValue,
  variant = 'default',
  onPress,
  className = '',
}) => {
  const styles = variantStyles[variant];
  const finalIconColor = iconColor || styles.iconColor;

  const content = (
    <View className="flex-row items-center justify-between">
      <View className="flex-1">
        <Typography variant="caption" className="text-text-secondary mb-1">
          {title}
        </Typography>
        
        <Typography variant="h3" className="text-text-primary font-cairo-bold mb-1">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Typography>
        
        {subtitle && (
          <Typography variant="caption" className="text-text-tertiary">
            {subtitle}
          </Typography>
        )}
        
        {trend && trendValue && (
          <View className="flex-row items-center mt-2">
            <Ionicons 
              name={trendIcons[trend]} 
              size={12} 
              color={styles.trendColor} 
            />
            <Typography 
              variant="caption" 
              className="ml-1"
              style={{ color: styles.trendColor }}
            >
              {trendValue}
            </Typography>
          </View>
        )}
      </View>
      
      {icon && (
        <View className={`w-12 h-12 rounded-xl ${styles.iconBg} items-center justify-center`}>
          <Ionicons name={icon} size={24} color={finalIconColor} />
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <Card padding="md" className={className}>
          {content}
        </Card>
      </TouchableOpacity>
    );
  }

  return (
    <Card padding="md" className={className}>
      {content}
    </Card>
  );
};

// Preset stat cards for common use cases
export const SalaryStatCard: React.FC<{ 
  value: number; 
  hidden?: boolean; 
  onPress?: () => void;
}> = ({ value, hidden = false, onPress }) => (
  <StatCard
    title="الراتب الشهري"
    value={hidden ? '••• •••' : `${value.toLocaleString()} د.ك`}
    icon="wallet"
    variant="default"
    onPress={onPress}
  />
);

export const CommitmentsStatCard: React.FC<{ 
  value: number; 
  count: number;
  hidden?: boolean; 
  onPress?: () => void;
}> = ({ value, count, hidden = false, onPress }) => (
  <StatCard
    title="إجمالي الالتزامات"
    value={hidden ? '••• •••' : `${value.toLocaleString()} د.ك`}
    subtitle={`${count} التزام نشط`}
    icon="card"
    variant="warning"
    onPress={onPress}
  />
);

export const RemainingBalanceStatCard: React.FC<{ 
  value: number; 
  percentage: number;
  hidden?: boolean; 
  onPress?: () => void;
}> = ({ value, percentage, hidden = false, onPress }) => (
  <StatCard
    title="المبلغ المتبقي"
    value={hidden ? '••• •••' : `${value.toLocaleString()} د.ك`}
    subtitle={`${percentage}% من الراتب`}
    icon="trending-up"
    variant="success"
    trend={percentage > 20 ? 'up' : percentage > 10 ? 'neutral' : 'down'}
    trendValue={`${percentage}%`}
    onPress={onPress}
  />
);

export const PaymentsStatCard: React.FC<{ 
  completed: number; 
  upcoming: number;
  onPress?: () => void;
}> = ({ completed, upcoming, onPress }) => (
  <StatCard
    title="الدفعات"
    value={completed}
    subtitle={`${upcoming} دفعة قادمة`}
    icon="checkmark-circle"
    variant="success"
    onPress={onPress}
  />
);

export const DebtRatioStatCard: React.FC<{ 
  ratio: number;
  onPress?: () => void;
}> = ({ ratio, onPress }) => {
  const getVariant = (ratio: number) => {
    if (ratio <= 25) return 'success';
    if (ratio <= 40) return 'warning';
    return 'danger';
  };

  const getStatus = (ratio: number) => {
    if (ratio <= 25) return 'ممتاز';
    if (ratio <= 40) return 'جيد';
    return 'مرتفع';
  };

  return (
    <StatCard
      title="نسبة الدين إلى الدخل"
      value={`${ratio}%`}
      subtitle={getStatus(ratio)}
      icon="analytics"
      variant={getVariant(ratio)}
      trend={ratio <= 25 ? 'up' : ratio <= 40 ? 'neutral' : 'down'}
      onPress={onPress}
    />
  );
};
