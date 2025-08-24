import { I18nManager } from 'react-native';
import { useSettingsStore } from '@/stores/settings';
import { useEffect } from 'react';

export function useLayout() {
  const { language } = useSettingsStore();
  const isRTL = language === 'ar';

  useEffect(() => {
    // Force RTL/LTR based on language
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(isRTL);
  }, [isRTL]);

  // Direction-aware flex directions
  const flexDirection = {
    row: isRTL ? 'row-reverse' as const : 'row' as const,
    rowReverse: isRTL ? 'row' as const : 'row-reverse' as const,
  };

  // Direction-aware positioning
  const position = {
    left: isRTL ? 'right' as const : 'left' as const,
    right: isRTL ? 'left' as const : 'right' as const,
    marginLeft: isRTL ? 'marginRight' as const : 'marginLeft' as const,
    marginRight: isRTL ? 'marginLeft' as const : 'marginRight' as const,
    paddingLeft: isRTL ? 'paddingRight' as const : 'paddingLeft' as const,
    paddingRight: isRTL ? 'paddingLeft' as const : 'paddingRight' as const,
  };

  // Text alignment
  const textAlign = {
    left: isRTL ? 'right' as const : 'left' as const,
    right: isRTL ? 'left' as const : 'right' as const,
    start: isRTL ? 'right' as const : 'left' as const,
    end: isRTL ? 'left' as const : 'right' as const,
  };

  // Icon direction helper
  const getIconDirection = (iconName: string) => {
    const reversibleIcons = ['ArrowLeft', 'ArrowRight', 'ChevronLeft', 'ChevronRight'];
    if (reversibleIcons.includes(iconName) && isRTL) {
      return iconName.replace('Left', 'Temp').replace('Right', 'Left').replace('Temp', 'Right');
    }
    return iconName;
  };

  return {
    isRTL,
    flexDirection,
    position,
    textAlign,
    getIconDirection,
  };
}
