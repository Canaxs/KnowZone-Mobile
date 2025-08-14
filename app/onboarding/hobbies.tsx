import { router } from 'expo-router';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useOnboardingStore } from '../../stores/onboardingStore';

const HOBBY_CATEGORIES = [
  { display: 'Spor yapmak', value: 'Spor', icon: '⚽' },
  { display: 'Teknoloji ile ilgilenmek', value: 'Teknoloji', icon: '💻' },
  { display: 'Bilim okumak', value: 'Bilim', icon: '🔬' },
  { display: 'Tarih araştırmak', value: 'Tarih', icon: '🏛️' },
  { display: 'Dizi izlemek', value: 'Dizi', icon: '📺' },
  { display: 'Müzik dinlemek', value: 'Müzik', icon: '🎵' },
  { display: 'Film izlemek', value: 'Film', icon: '🎬' },
  { display: 'Uzay hakkında öğrenmek', value: 'Uzay', icon: '🚀' }
];

export default function HobbiesScreen() {
  const { hobbies, setHobbies } = useOnboardingStore();
  const [selectedCategory, setSelectedCategory] = useState<string>(hobbies[0] || '');

  const toggleCategory = (categoryValue: string) => {
    const isSelected = hobbies.includes(categoryValue);
    if (isSelected) {
      // Kategoriyi kaldır
      const newHobbies = hobbies.filter(h => h !== categoryValue);
      setHobbies(newHobbies);
    } else {
      // Kategoriyi ekle
      const newHobbies = [...hobbies, categoryValue];
      setHobbies(newHobbies);
    }
  };

  return (
    <View className="flex-1 bg-white px-6 pt-36">
      {/* Başlık ve açıklama */}
      <Text className="text-lg font-semibold text-gray-900 mb-1">Hangi alanlara ilgin var?</Text>
      <Text className="text-base text-gray-500 mb-8">İlgilendiğin kategorileri seç</Text>
      
      {/* Kategori kutucukları */}
      <View className="flex-row flex-wrap justify-center mb-8">
        {HOBBY_CATEGORIES.map((category) => {
          const isSelected = hobbies.includes(category.value);
          return (
            <TouchableOpacity
              key={category.value}
              className={`px-6 py-4 m-2 rounded-2xl border-2 ${
                isSelected
                  ? 'bg-logoBlack border-logoBlack' 
                  : 'bg-white border-gray-300'
              }`}
              onPress={() => toggleCategory(category.value)}
              activeOpacity={0.8}
            >
              <View className="items-center">
                <Text className="text-2xl mb-1">{category.icon}</Text>
                <Text className={`text-center font-semibold text-sm ${
                  isSelected ? 'text-white' : 'text-gray-700'
                }`}>
                  {category.display}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      
      {/* Seçim durumu */}
      <Text className={`text-center text-sm mb-4 ${
        hobbies.length > 0 ? 'text-green-600' : 'text-red-500'
      }`}>
        {hobbies.length > 0
          ? `${hobbies.length} kategori seçildi` 
          : 'Devam etmek için en az bir kategori seç'
        }
      </Text>
      {/* Devam Et butonu */}
      <TouchableOpacity
        className={`p-4 rounded-full mt-5 ${
          hobbies.length > 0 ? 'bg-logoBlack' : 'bg-gray-300'
        }`}
        onPress={() => router.push('/onboarding/idealperson')}
        disabled={hobbies.length === 0}
      >
        <Text className="text-white text-center font-bold text-base">
          Devam et
        </Text>
      </TouchableOpacity>
      {/* Stepper dots ve ileri/geri oklar en altta */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingBottom: 32, paddingTop: 8, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => router.back()} disabled={false} style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
          <Text style={{ fontSize: 36, color: '#9ca3af', fontWeight: 'bold' }}>‹</Text>
        </TouchableOpacity>
        {/* Stepper dots */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 8 }}>
          {[0,1,2,3,4].map((i) => (
            <View
              key={i}
              style={{ width: 8, height: 8, borderRadius: 4, marginHorizontal: 4, backgroundColor: i === 2 ? '#111827' : '#d1d5db' }}
            />
          ))}
        </View>
        <TouchableOpacity
          onPress={() => router.push('/onboarding/idealperson')}
          disabled={hobbies.length === 0}
          style={{ paddingHorizontal: 16, paddingVertical: 8 }}
        >
          <Text style={{ fontSize: 36, color: hobbies.length > 0 ? '#111827' : '#d1d5db', fontWeight: 'bold' }}>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 