import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInLeft, FadeInUp } from 'react-native-reanimated';

import { IconSymbol } from '@/components/ui/IconSymbol';

interface ProfileOption {
  id: string;
  title: string;
  icon: string;
  iconBgColor: string;
  onPress: () => void;
}

export default function ProfileScreen() {
  const profileOptions: ProfileOption[] = [
    {
      id: '1',
      title: 'Hesap Ayarları',
      icon: 'person.fill',
      iconBgColor: '#3B82F6', // Mavi
      onPress: () => console.log('Account Settings'),
    },
    {
      id: '2',
      title: 'Bildirimler',
      icon: 'bell.fill',
      iconBgColor: '#F59E0B', // Turuncu
      onPress: () => console.log('Notifications'),
    },
    {
      id: '3',
      title: 'Yardım & Destek',
      icon: 'questionmark.circle.fill',
      iconBgColor: '#8B5CF6', // Mor
      onPress: () => console.log('Help & Support'),
    },
    {
      id: '4',
      title: 'Hakkında',
      icon: 'info.circle.fill',
      iconBgColor: '#10B981', // Yeşil
      onPress: () => console.log('About'),
    },
    {
      id: '5',
      title: 'Çıkış Yap',
      icon: 'rectangle.portrait.and.arrow.right.fill',
      iconBgColor: '#EF4444', // Kırmızı
      onPress: () => console.log('Logout'),
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
      <View className="pt-12 pb-4 px-5">
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
                <Text className="text-lg font-semibold text-gray-900 mb-1">Jenny Wilson</Text>
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