import { IconSymbol } from '@/components/ui/IconSymbol';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useAuthStore } from '../../stores/authStore';

interface AccountOption {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  iconBgColor: string;
  onPress: () => void;
}

export default function AccountScreen() {
  const { user } = useAuthStore();
  
  const accountOptions: AccountOption[] = [
    {
      id: '1',
      title: 'Profil Bilgileri',
      subtitle: 'Ad, kullanıcı adı ve e-posta',
      icon: 'person.fill',
      iconBgColor: '#3B82F6',
      onPress: () => console.log('Profile Info'),
    },
    {
      id: '2',
      title: 'Şifre Değiştir',
      subtitle: 'Hesap güvenliği',
      icon: 'lock.fill',
      iconBgColor: '#10B981',
      onPress: () => console.log('Change Password'),
    },
    {
      id: '3',
      title: 'Hesap Sil',
      subtitle: 'Kalıcı olarak hesabı kaldır',
      icon: 'trash.fill',
      iconBgColor: '#EF4444',
      onPress: () => console.log('Delete Account'),
    },
  ];

  const renderAccountOption = (option: AccountOption, index: number) => (
    <Animated.View
      key={option.id}
      entering={FadeInUp.delay(index * 100).springify()}
      className="mx-4 mb-3"
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
          <Text className="text-base font-medium text-gray-900 mb-1">{option.title}</Text>
          <Text className="text-sm text-gray-500">{option.subtitle}</Text>
        </View>
        <View className="w-8 h-8 rounded-full bg-gray-100 justify-center items-center">
          <IconSymbol size={16} name="chevron.right" color="#94A3B8" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: '#F8FAFC' }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <Animated.View 
          entering={FadeInUp.delay(200).springify()}
          className="mx-4 mt-4 mb-6"
        >
          <View 
            className="bg-white rounded-2xl py-6 px-5"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 5,
              borderWidth: 1,
              borderColor: '#F1F5F9',
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
                <View className="bg-gray-100 py-2 px-4 rounded-lg">
                  <Text className="text-gray-600 font-medium text-sm text-center">Aktif Hesap</Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Account Options */}
        <View className="pt-2 pb-6">
          {accountOptions.map((option, index) => renderAccountOption(option, index))}
        </View>
      </ScrollView>
    </View>
  );
}
