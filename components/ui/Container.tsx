import React from 'react';
import { View, ScrollView, ViewProps, ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ContainerProps extends ViewProps {
  safe?: boolean;
  scroll?: boolean;
  scrollProps?: ScrollViewProps;
}

export const Container: React.FC<ContainerProps> = ({
  safe = true,
  scroll = false,
  scrollProps,
  children,
  className = '',
  ...props
}) => {
  const containerClasses = `flex-1 bg-white ${className}`;

  const content = (
    <>
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          {...scrollProps}
        >
          {children}
        </ScrollView>
      ) : (
        <View className={containerClasses} {...props}>
          {children}
        </View>
      )}
    </>
  );

  if (safe) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        {content}
      </SafeAreaView>
    );
  }

  return content;
};
