import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useOnboardingStore } from '../../stores/onboardingStore';

const MAX_PERSONALITY = 5;

export default function IdealPersonScreen() {
  const { idealPerson, setIdealPerson } = useOnboardingStore();
  const [inputText, setInputText] = useState('');
  const lastAddedIndex = idealPerson.length - 1;
  
  const addTrait = () => {
    if (inputText.trim() && idealPerson.length < MAX_PERSONALITY && !idealPerson.includes(inputText.trim())) {
      const newIdealPerson = [...idealPerson, inputText.trim()];
      setIdealPerson(newIdealPerson);
      setInputText('');
    }
  };

  const removeTrait = (trait: string) => {
    const newIdealPerson = idealPerson.filter(i => i !== trait);
    setIdealPerson(newIdealPerson);
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
    <View className="flex-1 bg-white px-6 pt-36">
      {/* Başlık ve açıklama */}
      <Text className="text-lg font-semibold text-gray-900 mb-1">Birlikte vakit geçirmekten keyif alacağın biri nasıl olmalı?</Text>
      <Text className="text-base text-gray-500 mb-6">(Örn: Mizah anlayışı yüksek, kitap okumayı seven, açık fikirli)</Text>
      {/* Input ve + tuşu */}
      <View className="flex-row mb-5">
        <TextInput
          className="flex-1 border border-gray-300 rounded-full px-4 py-3 mr-3 bg-white"
          placeholder="Bir özellik ekle..."
          placeholderTextColor="#9ca3af"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={addTrait}
          editable={idealPerson.length < MAX_PERSONALITY}
        />
        <TouchableOpacity
          className={`w-12 h-12 rounded-full justify-center items-center ${inputText.trim() && idealPerson.length < MAX_PERSONALITY ? 'bg-logoBlack' : 'bg-gray-300'}`}
          onPress={addTrait}
          disabled={!inputText.trim() || idealPerson.length >= MAX_PERSONALITY}
        >
          <Text className="text-white text-2xl font-bold">+</Text>
        </TouchableOpacity>
      </View>
      {/* Kutucuklar */}
      <View className="flex-row flex-wrap mb-2">
        {idealPerson.map((trait, index) => {
          if (index === lastAddedIndex) {

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
                  onPress={() => removeTrait(trait)}
                  activeOpacity={0.8}
                >
                  <Text className="text-white mr-2 font-medium">{trait}</Text>
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
                onPress={() => removeTrait(trait)}
                activeOpacity={0.8}
              >
                <Text className="text-white mr-2 font-medium">{trait}</Text>
                <Text className="text-white text-lg font-bold">×</Text>
              </TouchableOpacity>
            );
          }
        })}
        {/* Boş kutucuklar (max 5) */}
        {Array.from({ length: MAX_PERSONALITY - idealPerson.length }).map((_, i) => (
          <View key={i + idealPerson.length} className="px-4 py-2 m-1 rounded-full bg-gray-100 border border-gray-200" style={{ minWidth: 80 }} />
        ))}
      </View>
      {/* Uyarı ve sayaç */}
      <Text className={`text-center text-sm mt-2 ${idealPerson.length < 3 ? 'text-red-500' : 'text-gray-400'}`}>{
        idealPerson.length < 3
          ? `Devam etmek için ${3 - idealPerson.length} özellik daha seç.`
          : `${idealPerson.length}/5 Seçildi`
      }</Text>
      {/* Devam Et butonu */}
      <TouchableOpacity
        className={`p-4 rounded-full mt-5 ${
          idealPerson.length >= 3 ? 'bg-logoBlack' : 'bg-gray-300'
        }`}
        onPress={() => router.push('/onboarding/location')}
        disabled={idealPerson.length < 3}
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
              style={{ width: 8, height: 8, borderRadius: 4, marginHorizontal: 4, backgroundColor: i === 3 ? '#111827' : '#d1d5db' }}
            />
          ))}
        </View>
        <TouchableOpacity
          onPress={() => router.push('/onboarding/location')}
          disabled={idealPerson.length < 3}
          style={{ paddingHorizontal: 16, paddingVertical: 8 }}
        >
          <Text style={{ fontSize: 36, color: idealPerson.length >= 3 ? '#111827' : '#d1d5db', fontWeight: 'bold' }}>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 