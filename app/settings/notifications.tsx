import { IconSymbol } from '@/components/ui/IconSymbol';
import { useState } from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface NotificationOption {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  iconBgColor: string;
  hasToggle: boolean;
}

export default function NotificationsScreen() {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [matchNotifications, setMatchNotifications] = useState(true);
  const [groupNotifications, setGroupNotifications] = useState(true);
  
  const notificationOptions: NotificationOption[] = [
    {
      id: '1',
      title: 'Push Bildirimleri',
      subtitle: 'Uygulama bildirimleri',
      icon: 'bell.fill',
      iconBgColor: '#F59E0B',
      hasToggle: true,
    },
    {
      id: '2',
      title: 'E-posta Bildirimleri',
      subtitle: 'E-posta ile bilgilendirme',
      icon: 'envelope.fill',
      iconBgColor: '#8B5CF6',
      hasToggle: true,
    },
    {
      id: '3',
      title: 'Eşleşme Bildirimleri',
      subtitle: 'Yeni eşleşme bildirimleri',
      icon: 'heart.fill',
      iconBgColor: '#EF4444',
      hasToggle: true,
    },
    {
      id: '4',
      title: 'Grup Bildirimleri',
      subtitle: 'Grup aktiviteleri',
      icon: 'person.3.fill',
      iconBgColor: '#10B981',
      hasToggle: true,
    },
  ];

  const getToggleValue = (id: string) => {
    switch (id) {
      case '1': return pushNotifications;
      case '2': return emailNotifications;
      case '3': return matchNotifications;
      case '4': return groupNotifications;
      default: return false;
    }
  };

  const setToggleValue = (id: string, value: boolean) => {
    switch (id) {
      case '1': setPushNotifications(value); break;
      case '2': setEmailNotifications(value); break;
      case '3': setMatchNotifications(value); break;
      case '4': setGroupNotifications(value); break;
    }
  };

  const renderNotificationOption = (option: NotificationOption, index: number) => (
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
            trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
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
            className="bg-blue-50 rounded-2xl py-6 px-5"
            style={{
              borderWidth: 1,
              borderColor: '#DBEAFE',
            }}
          >
            <View className="flex-row items-center">
              <View 
                className="w-12 h-12 bg-blue-100 rounded-full justify-center items-center mr-4">
                <IconSymbol size={24} name="bell.fill" color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-blue-900 mb-1">
                  Bildirim Ayarları
                </Text>
                <Text className="text-sm text-blue-700">
                  Hangi bildirimleri almak istediğinizi seçin
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Notification Options */}
        <View className="pt-2 pb-6">
          {notificationOptions.map((option, index) => renderNotificationOption(option, index))}
        </View>
      </ScrollView>
    </View>
  );
}
