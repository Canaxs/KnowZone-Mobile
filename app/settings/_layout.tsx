import { IconSymbol } from '@/components/ui/IconSymbol';
import { router, Stack } from 'expo-router';
import { Platform, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="account" 
        options={{
          header: () => (
            <View style={{ 
              paddingTop: Platform.OS === 'ios' ? 60 : 48,
              paddingBottom: 16,
              paddingHorizontal: 16,
              backgroundColor: '#F8FAFC',
              borderBottomWidth: 1,
              borderBottomColor: '#F1F5F9',
            }}>
              <View className="flex-row items-center justify-between">
                <TouchableOpacity className="w-8" onPress={() => router.back()}>
                  <IconSymbol name="chevron.left" size={20} color="#6B7280" />
                </TouchableOpacity>
                <Text className="text-xl font-semibold text-gray-900 flex-1 text-center">Hesap Ayarları</Text>
                <View className="w-8" />
              </View>
            </View>
          ),
        }}
      />
      <Stack.Screen 
        name="notifications" 
        options={{
          header: () => (
            <View style={{ 
              paddingTop: Platform.OS === 'ios' ? 60 : 48,
              paddingBottom: 16,
              paddingHorizontal: 16,
              backgroundColor: '#F8FAFC',
              borderBottomWidth: 1,
              borderBottomColor: '#F1F5F9',
            }}>
              <View className="flex-row items-center justify-between">
                <TouchableOpacity className="w-8" onPress={() => router.back()}>
                  <IconSymbol name="chevron.left" size={20} color="#6B7280" />
                </TouchableOpacity>
                <Text className="text-xl font-semibold text-gray-900 flex-1 text-center">Bildirimler</Text>
                <View className="w-8" />
              </View>
            </View>
          ),
        }}
      />
      <Stack.Screen 
        name="privacy" 
        options={{
          header: () => (
            <View style={{ 
              paddingTop: Platform.OS === 'ios' ? 60 : 48,
              paddingBottom: 16,
              paddingHorizontal: 16,
              backgroundColor: '#F8FAFC',
              borderBottomWidth: 1,
              borderBottomColor: '#F1F5F9',
            }}>
              <View className="flex-row items-center justify-between">
                <TouchableOpacity className="w-8" onPress={() => router.back()}>
                  <IconSymbol name="chevron.left" size={20} color="#6B7280" />
                </TouchableOpacity>
                <Text className="text-xl font-semibold text-gray-900 flex-1 text-center">Gizlilik & Güvenlik</Text>
                <View className="w-8" />
              </View>
            </View>
          ),
        }}
      />
      <Stack.Screen 
        name="help" 
        options={{
          header: () => (
            <View style={{ 
              paddingTop: Platform.OS === 'ios' ? 60 : 48,
              paddingBottom: 16,
              paddingHorizontal: 16,
              backgroundColor: '#F8FAFC',
              borderBottomWidth: 1,
              borderBottomColor: '#F1F5F9',
            }}>
              <View className="flex-row items-center justify-between">
                <TouchableOpacity className="w-8" onPress={() => router.back()}>
                  <IconSymbol name="chevron.left" size={20} color="#6B7280" />
                </TouchableOpacity>
                <Text className="text-xl font-semibold text-gray-900 flex-1 text-center">Yardım & Destek</Text>
                <View className="w-8" />
              </View>
            </View>
          ),
        }}
      />
      <Stack.Screen 
        name="about" 
        options={{
          header: () => (
            <View style={{ 
              paddingTop: Platform.OS === 'ios' ? 60 : 48,
              paddingBottom: 16,
              paddingHorizontal: 16,
              backgroundColor: '#F8FAFC',
              borderBottomWidth: 1,
              borderBottomColor: '#F1F5F9',
            }}>
              <View className="flex-row items-center justify-between">
                <TouchableOpacity className="w-8" onPress={() => router.back()}>
                  <IconSymbol name="chevron.left" size={20} color="#6B7280" />
                </TouchableOpacity>
                <Text className="text-xl font-semibold text-gray-900 flex-1 text-center">Hakkında</Text>
                <View className="w-8" />
              </View>
            </View>
          ),
        }}
      />
    </Stack>
  );
}
