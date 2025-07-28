import { Tabs } from 'expo-router';
import { useRef } from 'react';
import { Animated, Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  
  const animatedValues = {
    matches: useRef(new Animated.Value(1)).current,
    index: useRef(new Animated.Value(1)).current,
    profile: useRef(new Animated.Value(1)).current,
  };

  const animateIcon = (animatedValue: Animated.Value, toValue: number) => {
    Animated.timing(animatedValue, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        animation: 'fade',
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: 'white',
            borderTopWidth: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -5 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 10,
            height: 90,
            paddingBottom: 20,
            paddingTop: 10,
            paddingHorizontal: 20,
          },
          default: {
            backgroundColor: 'white',
            borderTopWidth: 0,
            elevation: 10,
            height: 90,
            paddingBottom: 20,
            paddingTop: 10,
            paddingHorizontal: 20,
          },
        }),
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarItemStyle: {
          flex: 1,
        },
      }}>

      <Tabs.Screen
        name="matches"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => {
            return (
              <Animated.View style={{ 
                height: 50, 
                width: 50, 
                justifyContent: 'center', 
                alignItems: 'center',
                transform: [{ scale: animatedValues.matches }],
              }}>
                <IconSymbol 
                  size={focused ? 36 : 34} 
                  name="style"
                  color={focused ? '#000' : '#D1D5DB'} 
                />
              </Animated.View>
            );
          },
        }}
        listeners={{
          focus: () => animateIcon(animatedValues.matches, 1.1),
          blur: () => animateIcon(animatedValues.matches, 1),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <Animated.View style={{ 
              height: 50, 
              width: 50,
              top: 10, 
              justifyContent: 'center', 
              alignItems: 'center',
              transform: [{ scale: animatedValues.index }]
            }}>
              <IconSymbol 
                size={focused ? 36 : 34} 
                name="bubble.left.and.bubble.right.fill" 
                color={focused ? 'white' : '#D1D5DB'} 
              />
            </Animated.View>
          ),
          tabBarButton: (props) => (
            <HapticTab
              {...props}
              style={{
                backgroundColor: '#000',
                borderRadius: 40,
                width: 80,
                height: 80,
                marginTop: -40,
                marginBottom: 10,
                zIndex: 20,
                alignSelf: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 12,
                justifyContent: 'center',
                alignItems: 'center',
                paddingTop: 0,
              }}
            />
          ),
        }}
        listeners={{
          focus: () => animateIcon(animatedValues.index, 1.1),
          blur: () => animateIcon(animatedValues.index, 1),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <Animated.View style={{ 
              height: 50, 
              width: 50, 
              justifyContent: 'center', 
              alignItems: 'center',
              transform: [{ scale: animatedValues.profile }],
            }}>
              <IconSymbol 
                size={focused ? 36 : 34} 
                name="person.circle.fill" 
                color={focused ? '#000' : '#D1D5DB'} 
              />
            </Animated.View>
          ),
        }}
        listeners={{
          focus: () => animateIcon(animatedValues.profile, 1.1),
          blur: () => animateIcon(animatedValues.profile, 1),
        }}
      />
    </Tabs>
  );
}
