import { IconSymbol } from '@/components/ui/IconSymbol';
import { useState } from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface PrivacyOption {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  iconBgColor: string;
  hasToggle: boolean;
}

export default function PrivacyScreen() {
  const [locationSharing, setLocationSharing] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [dataAnalytics, setDataAnalytics] = useState(false);
  const [thirdPartySharing, setThirdPartySharing] = useState(false);
  
  const privacyOptions: PrivacyOption[] = [
    {
      id: '1',
      title: 'Konum Paylaşımı',
      subtitle: 'Yakındaki kullanıcıları göster',
      icon: 'location.fill',
      iconBgColor: '#10B981',
      hasToggle: true,
    },
    {
      id: '2',
      title: 'Profil Görünürlüğü',
      subtitle: 'Profilinizi diğer kullanıcılara göster',
      icon: 'eye.fill',
      iconBgColor: '#8B5CF6',
      hasToggle: true,
    },
    {
      id: '3',
      title: 'Veri Analizi',
      subtitle: 'Anonim kullanım verilerini paylaş',
      icon: 'chart.bar.fill',
      iconBgColor: '#F59E0B',
      hasToggle: true,
    },
    {
      id: '4',
      title: 'Üçüncü Taraf Paylaşımı',
      subtitle: 'Verileri ortaklarla paylaş',
      icon: 'network',
      iconBgColor: '#6B7280',
      hasToggle: true,
    },
  ];

  const getToggleValue = (id: string) => {
    switch (id) {
      case '1': return locationSharing;
      case '2': return profileVisibility;
      case '3': return dataAnalytics;
      case '4': return thirdPartySharing;
      default: return false;
    }
  };

  const setToggleValue = (id: string, value: boolean) => {
    switch (id) {
      case '1': setLocationSharing(value); break;
      case '2': setProfileVisibility(value); break;
      case '3': setDataAnalytics(value); break;
      case '4': setThirdPartySharing(value); break;
    }
  };

  const renderPrivacyOption = (option: PrivacyOption, index: number) => (
    <Animated.View
      key={option.id}
      entering={FadeInUp.delay(index * 100).springify()}
      className="mx-4 mb-3"
    >
      <View 
        className="flex-row items-center py-4 px-5 bg-white rounded-xl"
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
        {option.hasToggle ? (
          <Switch
            value={getToggleValue(option.id)}
            onValueChange={(value) => setToggleValue(option.id, value)}
            trackColor={{ false: '#E5E7EB', true: '#10B981' }}
            thumbColor={getToggleValue(option.id) ? '#FFFFFF' : '#FFFFFF'}
          />
        ) : (
          <View className="w-8 h-8 rounded-full bg-gray-100 justify-center items-center">
            <IconSymbol size={16} name="chevron.right" color="#94A3B8" />
          </View>
        )}
      </View>
    </Animated.View>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: '#F8FAFC' }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Info */}
        <Animated.View 
          entering={FadeInUp.delay(200).springify()}
          className="mx-4 mt-4 mb-6"
        >
          <View 
            className="bg-green-50 rounded-2xl py-6 px-5"
            style={{
              borderWidth: 1,
              borderColor: '#D1FAE5',
            }}
          >
            <View className="flex-row items-center">
              <View 
                className="w-12 h-12 bg-green-100 rounded-full justify-center items-center mr-4">
                <IconSymbol size={24} name="lock.fill" color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-green-900 mb-1">
                  Gizlilik & Güvenlik
                </Text>
                <Text className="text-sm text-green-700">
                  Verilerinizi nasıl paylaşmak istediğinizi kontrol edin
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Privacy Options */}
        <View className="pt-2 pb-6">
          {privacyOptions.map((option, index) => renderPrivacyOption(option, index))}
        </View>
      </ScrollView>
    </View>
  );
}
