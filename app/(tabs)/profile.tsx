import { Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInLeft, FadeInUp } from 'react-native-reanimated';
import { useAuthStore } from '../../stores/authStore';

import { IconSymbol } from '@/components/ui/IconSymbol';

interface ProfileOption {
  id: string;
  title: string;
  icon: string;
  iconBgColor: string;
  onPress: () => void;
}

export default function ProfileScreen() {
  const { user, logout, clearAllData } = useAuthStore();
  
  const handleLogout = async () => {
    try {
      await clearAllData();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const profileOptions: ProfileOption[] = [
    {
      id: '1',
      title: 'Hesap Ayarları',
      icon: 'person.fill',
      iconBgColor: '#1f2937', 
      onPress: () => console.log('Account Settings'),
    },
    {
      id: '2',
      title: 'Bildirimler',
      icon: 'bell.fill',
      iconBgColor: '#374151', 
      onPress: () => console.log('Notifications'),
    },
    {
      id: '3',
      title: 'Yardım & Destek',
      icon: 'questionmark.circle.fill',
      iconBgColor: '#6b7280', 
      onPress: () => console.log('Help & Support'),
    },
    {
      id: '4',
      title: 'Hakkında',
      icon: 'info.circle.fill',
      iconBgColor: '#9ca3af',
      onPress: () => console.log('About'),
    },
    {
      id: '5',
      title: 'Çıkış Yap',
      icon: 'rectangle.portrait.and.arrow.right.fill',
      iconBgColor: '#EF4444', 
      onPress: () => handleLogout(),
    },
  ];

  const renderProfileOption = (option: ProfileOption, index: number) => (
    <Animated.View
      key={option.id}
      entering={FadeInUp.delay(index * 100).springify()}
      className="mx-3 mb-2"
    >
      <TouchableOpacity 
        className="flex-row items-center py-4 px-5 bg-gray-50 rounded-xl"
        onPress={option.onPress}
        activeOpacity={0.7}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View 
          className="w-12 h-12 rounded-xl justify-center items-center mr-4"
          style={{ 
            backgroundColor: option.iconBgColor,
            shadowColor: option.iconBgColor,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <IconSymbol size={22} name={option.icon} color="white" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">{option.title}</Text>
        </View>
        <View className="w-8 h-8 rounded-full bg-gray-200 justify-center items-center">
          <IconSymbol size={16} name="chevron.right" color="#6b7280" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <Animated.View 
      entering={FadeInLeft.springify()}
      className="flex-1 bg-white"
    >
      {/* Header */}
      <View className="pb-4 px-5" style={{ paddingTop: Platform.OS === 'ios' ? 60 : 48 }}>
        <View className="flex-row items-center justify-between">
          <TouchableOpacity className="w-8">
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-gray-900 flex-1 text-center">Ayarlar</Text>
          <View className="w-8" />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <Animated.View 
          entering={FadeInUp.delay(200).springify()}
          className="mx-3 mt-4 mb-6"
        >
          <View 
            className="bg-gray-50 rounded-2xl py-6 px-5"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <View className="flex-row items-center">
              <View 
                className="w-16 h-16 bg-gray-200 rounded-full justify-center items-center mr-4">
                <Text className="text-2xl">{user?.gender === 'MALE' ? '👨' : '👩'}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-900 mb-1">
                  {user?.username || 'Kullanıcı'}
                </Text>
                <Text className="text-sm text-gray-500 mb-3">
                  {user?.email || 'email@example.com'}
                </Text>
                <TouchableOpacity 
                  className="bg-gray-800 py-2 px-4 rounded-lg"
                  activeOpacity={0.8}
                >
                  <Text className="text-white font-medium text-sm text-center">Profili Düzenle</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Profile Options */}
        <View className="pt-2 pb-6">
          {profileOptions.map((option, index) => renderProfileOption(option, index))}
        </View>
        
        {/* Footer */}
        <Animated.View 
          entering={FadeInUp.delay(600).springify()}
          className="mx-3 mb-8"
        >
          <View className="bg-gray-50 rounded-xl py-4 px-5">
            <Text className="text-center text-xs text-gray-500 mb-1">KnowZone</Text>
            <Text className="text-center text-xs text-gray-400">Version 1.0.0</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </Animated.View>
  );
} 