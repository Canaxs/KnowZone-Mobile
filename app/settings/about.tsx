import { IconSymbol } from '@/components/ui/IconSymbol';
import { Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface AboutOption {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  iconBgColor: string;
  onPress: () => void;
}

export default function AboutScreen() {
  const aboutOptions: AboutOption[] = [
    {
      id: '1',
      title: 'Uygulama Versiyonu',
      subtitle: 'v1.0.0',
      icon: 'info.circle.fill',
      iconBgColor: '#6B7280',
      onPress: () => console.log('Version'),
    },
    {
      id: '2',
      title: 'Gizlilik Politikası',
      subtitle: 'Veri kullanımı ve gizlilik',
      icon: 'hand.raised.fill',
      iconBgColor: '#10B981',
      onPress: () => console.log('Privacy Policy'),
    },
    {
      id: '3',
      title: 'Kullanım Şartları',
      subtitle: 'Uygulama kullanım koşulları',
      icon: 'doc.text.fill',
      iconBgColor: '#3B82F6',
      onPress: () => console.log('Terms of Service'),
    },
    {
      id: '4',
      title: 'Lisans',
      subtitle: 'MIT License',
      icon: 'doc.plaintext.fill',
      iconBgColor: '#8B5CF6',
      onPress: () => console.log('License'),
    },
  ];

  const openWebsite = () => {
    Linking.openURL('https://knowzone.com');
  };

  return (
    <View className="flex-1 bg-gray-50">

      <ScrollView className="flex-1 px-4 py-6">
        {/* App Info Card */}
        <Animated.View
          entering={FadeInUp.delay(100)}
          className="bg-white rounded-xl p-6 mb-6 items-center"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <View className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl items-center justify-center mb-4">
            <Text className="text-4xl">🚀</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2">KnowZone</Text>
          <Text className="text-gray-600 text-center mb-4">
            Yeni bağlantılar kurun, ortak ilgi alanlarınızı keşfedin
          </Text>
          <TouchableOpacity
            className="bg-gray-100 py-2 px-4 rounded-lg"
            activeOpacity={0.7}
            onPress={openWebsite}
          >
            <Text className="text-gray-700 font-medium text-sm">
              knowzone.com
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* About Options */}
        {aboutOptions.map((option, index) => (
          <Animated.View
            key={option.id}
            entering={FadeInUp.delay((index + 2) * 100)}
            className="mb-3"
          >
            <TouchableOpacity
              className="bg-white rounded-xl p-4 flex-row items-center"
              activeOpacity={0.7}
              onPress={option.onPress}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              {/* Icon */}
              <View 
                className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: option.iconBgColor }}
              >
                <IconSymbol name={option.icon} size={20} color="white" />
              </View>

              {/* Content */}
              <View className="flex-1">
                <Text className="text-gray-900 font-semibold text-base mb-1">
                  {option.title}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {option.subtitle}
                </Text>
              </View>

              {/* Arrow */}
              <IconSymbol name="chevron.right" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </Animated.View>
        ))}

        {/* Developer Info */}
        <Animated.View
          entering={FadeInUp.delay(700)}
          className="mt-6 bg-gray-100 rounded-xl p-6"
        >
          <View className="items-center">
            <Text className="text-gray-700 font-medium text-center mb-2">
              Geliştirici
            </Text>
            <Text className="text-gray-600 text-center text-sm">
              KnowZone Development Team
            </Text>
            <Text className="text-gray-500 text-center text-xs mt-1">
              © 2024 KnowZone. Tüm hakları saklıdır.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}