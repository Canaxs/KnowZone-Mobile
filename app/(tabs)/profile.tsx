import { router } from 'expo-router';
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
  const { user, logout } = useAuthStore();
  
  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const profileOptions: ProfileOption[] = [
    {
      id: '1',
      title: 'Hesap Ayarları',
      icon: 'person.fill',
      iconBgColor: '#3B82F6', 
      onPress: () => console.log('Account Settings'),
    },
    {
      id: '2',
      title: 'Bildirimler',
      icon: 'bell.fill',
      iconBgColor: '#F59E0B', 
      onPress: () => console.log('Notifications'),
    },
    {
      id: '3',
      title: 'Yardım & Destek',
      icon: 'questionmark.circle.fill',
      iconBgColor: '#8B5CF6', 
      onPress: () => console.log('Help & Support'),
    },
    {
      id: '4',
      title: 'Hakkında',
      icon: 'info.circle.fill',
      iconBgColor: '#10B981',
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
    >
      <TouchableOpacity className="flex-row items-center py-4 px-5" onPress={option.onPress}>
        <View 
          className="w-12 h-12 rounded-full justify-center items-center mr-4"
          style={{ backgroundColor: option.iconBgColor }}
        >
          <IconSymbol size={24} name={option.icon} color="white" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">{option.title}</Text>
        </View>
        <IconSymbol size={20} name="chevron.right" color="#9CA3AF" />
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
            <IconSymbol size={24} name="chevron.left" color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-gray-900 flex-1 text-center">Ayarlar</Text>
          <View className="w-8" />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <Animated.View 
          entering={FadeInUp.delay(200).springify()}
          className="mx-3 mt-4 mb-4"
        >
          <View className="bg-gray-50 rounded-full py-6 px-5">
            <View className="flex-row items-center">
              <View className="w-16 h-16 rounded-full bg-gray-300 justify-center items-center mr-4">
                <Text className="text-2xl">👨</Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900 mb-1">
                  {user?.username || 'Kullanıcı'}
                </Text>
                <Text className="text-sm text-gray-500 mb-2">
                  {user?.email || 'email@example.com'}
                </Text>
                <TouchableOpacity>
                  <Text className="text-blue-600 font-medium">Profili Düzenle</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Profile Options */}
        <View className="pt-2">
          {profileOptions.map((option, index) => renderProfileOption(option, index))}
        </View>
      </ScrollView>
    </Animated.View>
  );
} 