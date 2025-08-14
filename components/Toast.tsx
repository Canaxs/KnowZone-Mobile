import React, { useEffect, useRef } from 'react';
import { Animated, Text } from 'react-native';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onHide?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'success', 
  duration = 3000,
  onHide 
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Toast'u göster
    const showAnimation = Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]);

    showAnimation.start();

    // Belirli süre sonra gizle
    const timer = setTimeout(() => {
      hideToast();
    }, duration);

    return () => {
      clearTimeout(timer);
      showAnimation.stop();
    };
  }, [duration]);

  const hideToast = () => {
    const hideAnimation = Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]);

    hideAnimation.start(() => {
      onHide?.();
    });
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'info': return '#3b82f6';
      default: return '#10b981';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return '🎉';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return '🎉';
    }
  };

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        backgroundColor: getBackgroundColor(),
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        transform: [{ translateY }],
        opacity,
        zIndex: 9999,
      }}
    >
      <Text style={{ fontSize: 20, marginRight: 8 }}>{getIcon()}</Text>
      <Text style={{ 
        color: 'white', 
        fontSize: 16, 
        fontWeight: '600',
        flex: 1 
      }}>
        {message}
      </Text>
    </Animated.View>
  );
};
