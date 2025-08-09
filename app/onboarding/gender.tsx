import { router } from 'expo-router';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useOnboardingStore } from '../../stores/onboardingStore';

type Gender = 'MALE' | 'FEMALE';

const genderOptions: { value: Gender; label: string; emoji: string }[] = [
  { value: 'MALE', label: 'Erkek', emoji: '♂️' },
  { value: 'FEMALE', label: 'Kadın', emoji: '♀️' }
];

export default function GenderScreen() {
  const { gender, setGender } = useOnboardingStore();
  const [selectedGender, setSelectedGender] = useState<Gender | null>(gender);

  const handleGenderSelect = (selectedValue: Gender) => {
    setSelectedGender(selectedValue);
    setGender(selectedValue);
  };

  return (
    <View className="flex-1 bg-white px-6 pt-36">
      <Text className="text-lg font-semibold text-gray-900 mb-1">Cinsiyetinizi seçin</Text>
      <Text className="text-base text-gray-500 mb-8">Bu bilgi profil eşleştirmelerinizde kullanılacaktır</Text>

      <View className="space-y-4 mb-8">
        {genderOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            className={`p-4 mt-2 rounded-xl border-2 flex-row items-center ${
              selectedGender === option.value 
                ? 'border-logoBlack bg-gray-50' 
                : 'border-gray-200 bg-white'
            }`}
            onPress={() => handleGenderSelect(option.value)}
            activeOpacity={0.7}
          >
            <Text className="text-2xl mr-4">{option.emoji}</Text>
            <Text className={`text-base font-medium ${
              selectedGender === option.value ? 'text-logoBlack' : 'text-gray-700'
            }`}>
              {option.label}
            </Text>
            {selectedGender === option.value && (
              <View className="ml-auto w-6 h-6 rounded-full bg-logoBlack justify-center items-center">
                <Text className="text-white text-xs">✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        className={`p-4 rounded-full mt-5 ${
          selectedGender ? 'bg-logoBlack' : 'bg-gray-300'
        }`}
        onPress={() => router.push('/onboarding/interests')}
        disabled={!selectedGender}
      >
        <Text className="text-white text-center font-bold text-base">
          Devam et
        </Text>
      </TouchableOpacity>

      {/* Stepper navigation */}
      <View style={{ 
        position: 'absolute', 
        left: 0, 
        right: 0, 
        bottom: 0, 
        paddingBottom: 32, 
        paddingTop: 8, 
        backgroundColor: 'white', 
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={{ paddingHorizontal: 16, paddingVertical: 8 }}
        >
          <Text style={{ fontSize: 36, color: '#9ca3af', fontWeight: 'bold' }}>‹</Text>
        </TouchableOpacity>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 8 }}>
          {[0,1,2,3,4].map((i) => (
            <View
              key={i}
              style={{ 
                width: 8, 
                height: 8, 
                borderRadius: 4, 
                marginHorizontal: 4, 
                backgroundColor: i === 0 ? '#111827' : '#d1d5db' 
              }}
            />
          ))}
        </View>
        
        <TouchableOpacity
          onPress={() => router.push('/onboarding/interests')}
          disabled={!selectedGender}
          style={{ paddingHorizontal: 16, paddingVertical: 8 }}
        >
          <Text style={{ 
            fontSize: 36, 
            color: selectedGender ? '#111827' : '#d1d5db', 
            fontWeight: 'bold' 
          }}>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}