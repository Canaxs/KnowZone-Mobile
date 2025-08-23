import { IconSymbol } from '@/components/ui/IconSymbol';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface HelpOption {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  iconBgColor: string;
  onPress: () => void;
}

export default function HelpScreen() {
  const helpOptions: HelpOption[] = [
    {
      id: '1',
      title: 'Sık Sorulan Sorular',
      subtitle: 'Genel sorular ve cevaplar',
      icon: 'questionmark.circle.fill',
      iconBgColor: '#8B5CF6',
      onPress: () => console.log('FAQ'),
    },
    {
      id: '2',
      title: 'İletişim',
      subtitle: 'Destek ekibi ile iletişim',
      icon: 'envelope.fill',
      iconBgColor: '#3B82F6',
      onPress: () => console.log('Contact'),
    },
    {
      id: '3',
      title: 'Kullanım Kılavuzu',
      subtitle: 'Uygulama kullanım talimatları',
      icon: 'book.fill',
      iconBgColor: '#10B981',
      onPress: () => console.log('User Guide'),
    },
    {
      id: '4',
      title: 'Geri Bildirim',
      subtitle: 'Öneri ve şikayetleriniz',
      icon: 'message.fill',
      iconBgColor: '#F59E0B',
      onPress: () => console.log('Feedback'),
    },
  ];

  return (
    <View className="flex-1 bg-gray-50">

      <ScrollView className="flex-1 px-4 py-6">
        {/* Help Options */}
        {helpOptions.map((option, index) => (
          <Animated.View
            key={option.id}
            entering={FadeInUp.delay(index * 100)}
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

        {/* Contact Info Card */}
        <Animated.View
          entering={FadeInUp.delay(500)}
          className="mt-6 bg-blue-50 rounded-xl p-6"
        >
          <View className="items-center">
            <View className="w-16 h-16 bg-blue-500 rounded-full items-center justify-center mb-4">
              <IconSymbol name="phone.fill" size={24} color="white" />
            </View>
            <Text className="text-blue-900 font-semibold text-lg mb-2">
              Acil Destek
            </Text>
            <Text className="text-blue-700 text-center mb-4">
              Sorun yaşıyorsanız hemen bizimle iletişime geçin
            </Text>
            <TouchableOpacity
              className="bg-blue-500 py-3 px-6 rounded-xl"
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-center">
                İletişime Geç
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}