import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Text, TextInput, TouchableOpacity, View } from 'react-native';

const MAX_INTERESTS = 5;

export default function InterestsScreen() {
  const [interests, setInterests] = useState<string[]>([]);
  const [inputText, setInputText] = useState('');
  const [lastAddedIndex, setLastAddedIndex] = useState<number | null>(null);

  const addInterest = () => {
    if (inputText.trim() && interests.length < MAX_INTERESTS && !interests.includes(inputText.trim())) {
      setInterests([...interests, inputText.trim()]);
      setLastAddedIndex(interests.length); // yeni eklenen index
      setInputText('');
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const anim = useRef(new Animated.Value(0));
  useEffect(() => {
    if (lastAddedIndex !== null) {
      anim.current.setValue(0);
      Animated.timing(anim.current, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start();
    }
  }, [lastAddedIndex]);

  return (
    <View className="flex-1 bg-white px-6 pt-12">
      {/* Geri tuşu ve başlık */}
      <Text className="text-lg font-semibold text-gray-900 mb-1">Seni en iyi tanımlayan 5 kelime nedir?</Text>
      <Text className="text-base text-gray-500 mb-6">(Örn: Macera sever, içe dönük, yaratıcı)</Text>
      {/* Input ve + tuşu */}
      <View className="flex-row mb-5">
        <TextInput
          className="flex-1 border border-gray-300 rounded-full px-4 py-3 mr-3 bg-white"
          placeholder="Bir ilgi alanı ekle..."
          placeholderTextColor="#9ca3af"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={addInterest}
          editable={interests.length < MAX_INTERESTS}
        />
        <TouchableOpacity
          className={`w-12 h-12 rounded-full justify-center items-center ${inputText.trim() && interests.length < MAX_INTERESTS ? 'bg-logoBlack' : 'bg-gray-300'}`}
          onPress={addInterest}
          disabled={!inputText.trim() || interests.length >= MAX_INTERESTS}
        >
          <Text className="text-white text-2xl font-bold">+</Text>
        </TouchableOpacity>
      </View>
      {/* Kutucuklar */}
      <View className="flex-row flex-wrap mb-2">
        {interests.map((interest, index) => {
          if (index === lastAddedIndex) {
            // Animasyonlu kutucuk
            return (
              <Animated.View
                key={index}
                style={{
                  opacity: anim.current,
                  transform: [{ scale: anim.current.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }],
                }}
              >
                <TouchableOpacity
                  className={`flex-row items-center px-4 py-2 m-1 rounded-full bg-logoBlack shadow-sm`}
                  style={{ minWidth: 80 }}
                  onPress={() => removeInterest(interest)}
                  activeOpacity={0.8}
                >
                  <Text className="text-white mr-2 font-medium">{interest}</Text>
                  <Text className="text-white text-lg font-bold">×</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          } else {
            // Normal kutucuk
            return (
              <TouchableOpacity
                key={index}
                className={`flex-row items-center px-4 py-2 m-1 rounded-full bg-logoBlack shadow-sm`}
                style={{ minWidth: 80 }}
                onPress={() => removeInterest(interest)}
                activeOpacity={0.8}
              >
                <Text className="text-white mr-2 font-medium">{interest}</Text>
                <Text className="text-white text-lg font-bold">×</Text>
              </TouchableOpacity>
            );
          }
        })}
        {/* Boş kutucuklar (max 5) */}
        {Array.from({ length: MAX_INTERESTS - interests.length }).map((_, i) => (
          <View key={i + interests.length} className="px-4 py-2 m-1 rounded-full bg-gray-100 border border-gray-200" style={{ minWidth: 80 }} />
        ))}
      </View>
      {/* Uyarı ve sayaç */}
      <Text className={`text-center text-sm mt-2 ${interests.length < 3 ? 'text-red-500' : 'text-gray-400'}`}>{
        interests.length < 3
          ? `Devam etmek için ${3 - interests.length} kategori daha seç.`
          : `${interests.length}/5 Seçildi`
      }</Text>
      {/* Devam Et butonu */}
      <TouchableOpacity
        className={`p-4 rounded-full mt-5 ${
          interests.length >= 3 ? 'bg-logoBlack' : 'bg-gray-300'
        }`}
        onPress={() => router.push('/onboarding/hobbies')}
        disabled={interests.length < 3}
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
          {[0,1,2,3].map((i) => (
            <View
              key={i}
              style={{ width: 8, height: 8, borderRadius: 4, marginHorizontal: 4, backgroundColor: i === 0 ? '#111827' : '#d1d5db' }}
            />
          ))}
        </View>
        <TouchableOpacity
          onPress={() => router.push('/onboarding/hobbies')}
          disabled={interests.length < 3}
          style={{ paddingHorizontal: 16, paddingVertical: 8 }}
        >
          <Text style={{ fontSize: 36, color: interests.length >= 3 ? '#111827' : '#d1d5db', fontWeight: 'bold' }}>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 