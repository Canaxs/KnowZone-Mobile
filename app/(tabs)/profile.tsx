import { LinearGradient } from 'expo-linear-gradient';
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
      iconBgColor: '#3B82F6', // Mavi
      onPress: () => router.push('/settings/account'),
    },
    {
      id: '2',
      title: 'Bildirimler',
      icon: 'bell.fill',
      iconBgColor: '#F59E0B', // Turuncu
      onPress: () => router.push('/settings/notifications'),
    },
    {
      id: '3',
      title: 'Gizlilik & Güvenlik',
      icon: 'lock.fill',
      iconBgColor: '#10B981', // Yeşil
      onPress: () => router.push('/settings/privacy'),
    },
    {
      id: '4',
      title: 'Yardım & Destek',
      icon: 'questionmark.circle.fill',
      iconBgColor: '#8B5CF6', // Mor
      onPress: () => router.push('/settings/help'),
    },
    {
      id: '5',
      title: 'Hakkında',
      icon: 'info.circle.fill',
      iconBgColor: '#6B7280', // Gri
      onPress: () => router.push('/settings/about'),
    },
    {
      id: '6',
      title: 'Çıkış Yap',
      icon: 'rectangle.portrait.and.arrow.right.fill',
      iconBgColor: '#EF4444', // Kırmızı
      onPress: () => handleLogout(),
    },
  ];

  const renderProfileOption = (option: ProfileOption, index: number) => (
    <Animated.View
      key={option.id}
      entering={FadeInUp.delay(index * 100).springify()}
      className="mx-4 mb-2"
    >
      <TouchableOpacity 
        className="flex-row items-center py-4 px-5 bg-white rounded-xl"
        onPress={option.onPress}
        activeOpacity={0.7}
        style={{
          minHeight: 44,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
          borderWidth: 1,
          borderColor: '#F1F5F9',
        }}
      >
        <View 
          className="w-12 h-12 rounded-xl justify-center items-center mr-4"
          style={{ 
            backgroundColor: option.iconBgColor,
            shadowColor: option.iconBgColor,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <IconSymbol size={22} name={option.icon} color="white" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-medium text-gray-900">{option.title}</Text>
        </View>
        <View className="w-8 h-8 rounded-full bg-gray-100 justify-center items-center">
          <IconSymbol size={16} name="chevron.right" color="#94A3B8" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <Animated.View 
      entering={FadeInLeft.springify()}
      className="flex-1"
      style={{ backgroundColor: '#F8FAFC' }}
    >
      {/* Header */}
      <View className="pb-4 px-4" style={{ paddingTop: Platform.OS === 'ios' ? 60 : 48 }}>
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
          className="mx-4 mt-4 mb-5"
        >
          <LinearGradient
            colors={['#3a3d40', '#606163']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 12,
              padding: 16,
              shadowColor: '#6A11CB',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <View className="flex-row items-center">
              <View 
                className="w-16 h-16 rounded-full justify-center items-center mr-4"
                style={{
                  borderWidth: 3,
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }}
              >
                <Text className="text-3xl">{user?.gender === 'MALE' ? '👨' : '👩'}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-white mb-2">
                  {user?.username || 'Kullanıcı'}
                </Text>
                <Text className="text-sm text-gray-200 mb-4" style={{ color: '#E2E8F0' }}>
                  {user?.email || 'email@example.com'}
                </Text>
                <TouchableOpacity 
                  className="bg-white py-3 px-5 rounded-xl flex justify-center items-center"
                  activeOpacity={0.8}
                  style={{ 
                    minHeight: 44, 
                    minWidth: 44,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <Text className="text-gray-900 font-semibold text-sm text-center">
                    Profili Düzenle
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Profile Options */}
        <View className="pt-2 pb-6">
          {profileOptions.map((option, index) => renderProfileOption(option, index))}
        </View>
        
        {/* Footer 
        <Animated.View 
          entering={FadeInUp.delay(600).springify()}
          className="mx-4 mb-8"
        >
          <View 
            className="bg-white rounded-xl py-4 px-5"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
              borderWidth: 1,
              borderColor: '#F1F5F9',
            }}
          >
            <Text className="text-center text-xs text-gray-500 mb-1">KnowZone</Text>
            <Text className="text-center text-xs text-gray-400">Version 1.0.0</Text>
          </View>
        </Animated.View>
        */}
      </ScrollView>
    </Animated.View>
  );
}