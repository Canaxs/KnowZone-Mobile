import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useOnboardingStore } from '../../stores/onboardingStore';

const MAX_HOBBIES = 5;

export default function HobbiesScreen() {
  const { hobbies, setHobbies } = useOnboardingStore();
  const [inputText, setInputText] = useState('');
  const lastAddedIndex = useRef<number | null>(null);

  const addHobby = () => {
    if (inputText.trim() && hobbies.length < MAX_HOBBIES && !hobbies.includes(inputText.trim())) {
      const newHobbies = [...hobbies, inputText.trim()];
      setHobbies(newHobbies);
      setInputText('');
      lastAddedIndex.current = hobbies.length;
    }
  };

  const removeHobby = (hobby: string) => {
    const newHobbies = hobbies.filter(i => i !== hobby);
    setHobbies(newHobbies);
  };

  const anim = useRef(new Animated.Value(0));
  useEffect(() => {
    if (lastAddedIndex.current !== null) {
      anim.current.setValue(0);
      Animated.timing(anim.current, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start();
    }
  }, [lastAddedIndex.current]);

  return (
    <View className="flex-1 bg-white px-6 pt-12">
      {/* Başlık ve açıklama */}
      <Text className="text-lg font-semibold text-gray-900 mb-1">Boş zamanlarında ne yapmaktan keyif alırsın?</Text>
      <Text className="text-base text-gray-500 mb-6">(Örn: Akşamları dizi izlemek, yürüyüş yapmak, gitar çalmak)</Text>
      {/* Input ve + tuşu */}
      <View className="flex-row mb-5">
        <TextInput
          className="flex-1 border border-gray-300 rounded-full px-4 py-3 mr-3 bg-white"
          placeholder="Bir hobi ekle..."
          placeholderTextColor="#9ca3af"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={addHobby}
          editable={hobbies.length < MAX_HOBBIES}
        />
        <TouchableOpacity
          className={`w-12 h-12 rounded-full justify-center items-center ${inputText.trim() && hobbies.length < MAX_HOBBIES ? 'bg-logoBlack' : 'bg-gray-300'}`}
          onPress={addHobby}
          disabled={!inputText.trim() || hobbies.length >= MAX_HOBBIES}
        >
          <Text className="text-white text-2xl font-bold">+</Text>
        </TouchableOpacity>
      </View>
      {/* Kutucuklar */}
      <View className="flex-row flex-wrap mb-2">
        {hobbies.map((hobby, index) => {
          if (index === lastAddedIndex.current) {

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
                  onPress={() => removeHobby(hobby)}
                  activeOpacity={0.8}
                >
                  <Text className="text-white mr-2 font-medium">{hobby}</Text>
                  <Text className="text-white text-lg font-bold">×</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          } else {
            return (
              <TouchableOpacity
                key={index}
                className={`flex-row items-center px-4 py-2 m-1 rounded-full bg-logoBlack shadow-sm`}
                style={{ minWidth: 80 }}
                onPress={() => removeHobby(hobby)}
                activeOpacity={0.8}
              >
                <Text className="text-white mr-2 font-medium">{hobby}</Text>
                <Text className="text-white text-lg font-bold">×</Text>
              </TouchableOpacity>
            );
          }
        })}
        {/* Boş kutucuklar (max 5) */}
        {Array.from({ length: MAX_HOBBIES - hobbies.length }).map((_, i) => (
          <View key={i + hobbies.length} className="px-4 py-2 m-1 rounded-full bg-gray-100 border border-gray-200" style={{ minWidth: 80 }} />
        ))}
      </View>
      {/* Uyarı ve sayaç */}
      <Text className={`text-center text-sm mt-2 ${hobbies.length < 3 ? 'text-red-500' : 'text-gray-400'}`}>{
        hobbies.length < 3
          ? `Devam etmek için ${3 - hobbies.length} kategori daha seç.`
          : `${hobbies.length}/5 Seçildi`
      }</Text>
      {/* Devam Et butonu */}
      <TouchableOpacity
        className={`p-4 rounded-full mt-5 ${
          hobbies.length >= 3 ? 'bg-logoBlack' : 'bg-gray-300'
        }`}
        onPress={() => router.push('/onboarding/idealperson')}
        disabled={hobbies.length < 3}
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
              style={{ width: 8, height: 8, borderRadius: 4, marginHorizontal: 4, backgroundColor: i === 1 ? '#111827' : '#d1d5db' }}
            />
          ))}
        </View>
        <TouchableOpacity
          onPress={() => router.push('/onboarding/idealperson')}
          disabled={hobbies.length < 3}
          style={{ paddingHorizontal: 16, paddingVertical: 8 }}
        >
          <Text style={{ fontSize: 36, color: hobbies.length >= 3 ? '#111827' : '#d1d5db', fontWeight: 'bold' }}>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 