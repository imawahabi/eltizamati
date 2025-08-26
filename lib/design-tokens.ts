// Design System Tokens - As per project specification
export const Colors = {
  // Primary Gradient (trust + finance)
  primary: {
    700: '#0B63FF', // نَفَس أزرق داكن
    500: '#2C9BF0', // أزرق متوسط
    300: '#8FD3FF', // أزرق فاتح
  },
  
  // Accent / Success (money & growth)
  success: {
    600: '#28A745', // أخضر واضح
    400: '#7DE3A0', // أخضر فاتح للتقدم
  },
  
  // Info / Analytics
  info: {
    500: '#2C9BF0', // معلومات
    300: '#8FD3FF', // معلومات فاتحة
  },
  
  // Warnings / Alerts
  warning: {
    500: '#FFAA00', // تنبيه غير طارئ
  },
  
  danger: {
    500: '#E74C3C', // متأخر/سلبي
  },
  
  // Neutrals (خلفيات ونصوص)
  bg: '#FFFFFF', // خلفية رئيسية
  surface: '#F7F9FC', // بطاقات
  muted: {
    600: '#6B7280', // نص فرعي
  },
  text: {
    900: '#0F1724', // نص أساسي
  },
};

// Gradients
export const Gradients = {
  primary: ['#0B63FF', '#2C9BF0', '#8FD3FF'],
  success: ['#28A745', '#7DE3A0'],
  info: ['#2C9BF0', '#8FD3FF'],
  warning: ['#FFAA00', '#FFD700'],
  primaryAngle: '135deg',
};

// Typography - Cairo font family
export const Typography = {
  fontFamily: 'Cairo',
  sizes: {
    display: 32, // App Title
    h1: 24,
    h2: 20,
    body: 18, // Increased for Arabic
    small: 14,
    caption: 12,
  },
  weights: {
    regular: '400',
    semibold: '600',
    bold: '700',
  },
};

// Spacing system
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

// Border radius
export const BorderRadius = {
  small: 8,
  medium: 12,
  large: 24,
};

// Touch targets
export const TouchTargets = {
  minimum: 44, // Apple HIG minimum
};

// Shadow presets
export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Status colors mapping
export const StatusColors = {
  completed: Colors.success[600],
  pending: Colors.warning[500],
  overdue: Colors.danger[500],
  active: Colors.primary[500],
};

// DTI (Debt-to-Income) color mapping
export const DTIColors = {
  good: Colors.success[600], // <25%
  warning: Colors.warning[500], // 25-40%
  danger: Colors.danger[500], // >40%
};
