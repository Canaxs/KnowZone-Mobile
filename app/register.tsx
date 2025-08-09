import { Feather, FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Dimensions, Easing, Image, Keyboard, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../stores/authStore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const TOP_HEIGHT = SCREEN_HEIGHT * 0.25;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.75;
const KEYBOARD_ANIMATION_OFFSET = SCREEN_HEIGHT * 0.13;

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const keyboardAnimation = useRef(new Animated.Value(0)).current;
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const { register } = useAuthStore();

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Hata', 'Geçerli bir e-posta adresi girin');
      return;
    }

    setIsLoading(true);
    try {
      await register(username, email, password);
    } catch (error: any) {
      Alert.alert(
        'Kayıt Hatası', 
        error.response?.data?.message || 'Kayıt olurken bir hata oluştu'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyboardShow = (event: any) => {
    const keyboardHeight = event.endCoordinates.height;
    setKeyboardHeight(keyboardHeight);
  
    Animated.timing(keyboardAnimation, {
      toValue: 1,
      duration: 350, 
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic), 
    }).start();
  };

  const handleKeyboardHide = () => {
    Animated.timing(keyboardAnimation, {
      toValue: 0,
      duration: 350, 
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic), 
    }).start();
  };

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', handleKeyboardShow);
    const keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', handleKeyboardHide);

    return () => {
      keyboardWillShowListener?.remove();
      keyboardWillHideListener?.remove();
    };
  }, []);


  return (
    <View className="flex-1 bg-[#f5f5f5]">
      <Animated.ScrollView
        contentContainerStyle={{ minHeight: '100%' }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
        style={{
          transform: [{
            translateY: keyboardAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -KEYBOARD_ANIMATION_OFFSET], 
            })
          }]
        }}
        >
      {/* Üstte sade gri alan ve ortada kullanıcı ikon */}
      <View style={{ height: TOP_HEIGHT, width: '100%', backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Arka plan görseli */}
        <Image
          source={require('../assets/images/map3.png')}
          style={{ position: 'absolute', width: '100%', height: '100%', resizeMode: 'cover' }}
        />
        <View style={{ position: 'absolute', backgroundColor: '#000', opacity: 0.35, width: '100%', height: '100%' }} />
      </View>
      {/* Sol üstte şık geri tuşu */}
      <View style={{ position: 'absolute', top: 50, left: 10, zIndex: 200 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            backgroundColor: 'rgba(255,255,255,0.85)',
            borderRadius: 24,
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 4,
          }}
          activeOpacity={0.7}
        >
          <Feather name="chevron-left" size={32} color="#222" />
        </TouchableOpacity>
      </View>
      {/* Alt beyaz kart */}
        <View
          className="bg-white rounded-t-3xl px-8 pt-8 pb-4 shadow-2xl z-10"
          style={{ height: CARD_HEIGHT, position: 'absolute', bottom: 0, left: 0, right: 0 }}
        >
          <View className='absolute items-center justify-center z-30' style={{left: '48.5%'}}>
            <View className="bg-white rounded-full p-4 shadow-lg" style={{marginTop: -36 }}>
              <Feather name="user-plus" size={40} color="#ef4444" />
            </View>
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2 text-center mt-5">Kayıt Ol</Text>
          <Text className="text-base text-gray-500 mb-6 text-center">KnowZone’a katıl, yeni insanlarla tanış ve bilgi paylaş!</Text>
          {/* İsim */}
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4 mb-4">
            <FontAwesome name="user-o" size={20} color="#9ca3af" />
            <TextInput
              className="flex-1 px-3 text-base text-gray-800"
              placeholder="İsim Soyisim"
              placeholderTextColor="#9ca3af"
              value={username}
              onChangeText={setUsername}
              style={{ textAlignVertical: 'center', height: 48 ,lineHeight: 17}}
              editable={!isLoading}
            />
          </View>
          {/* Email */}
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4 mb-4">
            <FontAwesome name="envelope-o" size={20} color="#9ca3af" />
            <TextInput
              className="flex-1 px-3 text-base text-gray-800"
              placeholder="E-posta adresi"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              style={{ textAlignVertical: 'center', height: 48 ,lineHeight: 17}}
              editable={!isLoading}
            />
          </View>
          {/* Şifre */}
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4 mb-4">
            <FontAwesome name="lock" size={22} color="#9ca3af" />
            <TextInput
              className="flex-1 px-3 text-base text-gray-800"
              placeholder="Şifre"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={{ textAlignVertical: 'center', height: 48 ,lineHeight: 17}}
              editable={!isLoading}
            />
          </View>
          {/* Şifre Tekrar */}
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4 mb-2">
            <FontAwesome name="lock" size={22} color="#9ca3af" />
            <TextInput
              className="flex-1 px-3 text-base text-gray-800"
              placeholder="Şifre Tekrar"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={{ textAlignVertical: 'center', height: 48 ,lineHeight: 17}}
              editable={!isLoading}
            />
          </View>
          {/* Kayıt Ol Butonu */}
          <TouchableOpacity 
            className={`rounded-2xl py-4 mb-4 mt-2 shadow-lg ${isLoading ? 'bg-gray-400' : 'bg-logoBlack'}`}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator color="white" size="small" />
                <Text className="text-white text-lg font-bold ml-2">Kayıt Olunuyor...</Text>
              </View>
            ) : (
              <Text className="text-white text-lg font-bold text-center">Kayıt Ol</Text>
            )}
          </TouchableOpacity>
          {/* Veya ile giriş */}
          <View className="flex-row items-center my-2">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-2 text-gray-400">veya ile kayıt ol</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>
          <View className="flex-row justify-center mb-4">
            <TouchableOpacity className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-2 mr-2 shadow-sm">
              <FontAwesome name="google" size={20} color="#ea4335" />
              <Text className="ml-2 text-gray-700 font-semibold">Google</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-2 ml-2 shadow-sm">
              <FontAwesome name="facebook" size={20} color="#1877f3" />
              <Text className="ml-2 text-gray-700 font-semibold">Facebook</Text>
            </TouchableOpacity>
          </View>
          {/* Login linki */}
          <View className="flex-row justify-center mt-2">
            <Text className="text-gray-400">Zaten hesabın var mı? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text className="text-green-600 font-semibold">Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        </View>
        </Animated.ScrollView>
    </View>
  );
} 