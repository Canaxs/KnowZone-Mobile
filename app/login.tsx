import { Feather, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Image, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const TOP_HEIGHT = SCREEN_HEIGHT * 0.40;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.60;

export default function LoginScreen() {
  // Ping animasyonu için 3 halka
  const ping1 = useRef(new Animated.Value(0)).current;
  const ping2 = useRef(new Animated.Value(0)).current;
  const ping3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    function startPing(anim: any, delay: number) {
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]).start(() => startPing(anim, 0));
    }
    startPing(ping1, 0);
    startPing(ping2, 600);
    startPing(ping3, 1200);
  }, []);

  // Form state (dummy, backend entegrasyonu için güncellenecek)
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [remember, setRemember] = React.useState(false);

  return (
    <View className="flex-1 bg-[#f5f5f5]">
      {/* Üstte konum ve animasyonlu halkalar */}
      <View style={{ height: TOP_HEIGHT, width: '100%', position: 'relative', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
        {/* Map görseli */}
        <Image
          source={require('../assets/images/map2.png')}
          style={{ position: 'absolute', width: '100%', height: '100%', resizeMode: 'cover' }}
        />
        {/* Karartı overlay */}
        <View style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: '#000', opacity: 0.35}} />
      </View>
      {/* Sol üstte şık geri tuşu */}
      <View style={{ position: 'absolute', top: 15, left: 10, zIndex: 200 }}>
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View
          className="bg-white rounded-t-3xl px-8 pt-8 pb-4 shadow-2xl z-10"
          style={{ height: CARD_HEIGHT, position: 'absolute', bottom: 0, left: 0, right: 0 }}
        >
          <View className='absolute items-center justify-center' style={{left: '48.5%'}}>
              {/* Ping halkaları */}
            {[ping1, ping2, ping3].map((anim, i) => {
              const scale = anim.interpolate({ inputRange: [0, 0.2, 1], outputRange: [1, 1.5, 2.5] });
              const opacity = anim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.35, 0.15, 0] });
              return (
                <Animated.View
                  key={i}
                  style={{
                    position: 'absolute',
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    borderWidth: 2,
                    borderColor: '#ef4444',
                    opacity,
                    transform: [{ scale }],
                    marginTop: -35,
                  }}
                />
              );
            })}
            {/* Konum ikonu */}
            <View className="bg-white rounded-full p-4 shadow-lg" style={{marginTop: -36 }}>
              <MaterialIcons name="my-location" size={40} color="#ef4444" />
            </View>
        </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2 text-center mt-5">Giriş Yap</Text>
          <Text className="text-base text-gray-500 mb-6 text-center">KnowZone’a hoşgeldin! Ortak ilgi alanlarına sahip insanlarla tanışmak için giriş yap.</Text>
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
              style={{ textAlignVertical: 'center', height: 48 }}
            />
          </View>
          {/* Şifre */}
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4 mb-2">
            <FontAwesome name="lock" size={22} color="#9ca3af" />
            <TextInput
              className="flex-1 px-3 text-base text-gray-800"
              placeholder="Şifre"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={{ textAlignVertical: 'center', height: 48 }}
            />
          </View>
          {/* Beni Hatırla & Şifremi Unuttum */}
          <View className="flex-row justify-between items-center mb-6 mt-1">
            <TouchableOpacity className="flex-row items-center" onPress={() => setRemember(!remember)}>
              <View className={`w-5 h-5 rounded border border-gray-300 mr-2 ${remember ? 'bg-logoBlack border-logoBlack' : 'bg-white'}`}/>
              <Text className="text-gray-500 text-sm">Beni Hatırla</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text className="text-logoSilver text-sm font-semibold">Şifremi Unuttum?</Text>
            </TouchableOpacity>
          </View>
          {/* Giriş Yap Butonu */}
          <TouchableOpacity className="bg-logoBlack rounded-2xl py-4 mb-4 shadow-lg active:opacity-80" onPress={() => {}} activeOpacity={0.85}>
            <Text className="text-white text-lg font-bold text-center">Giriş Yap</Text>
          </TouchableOpacity>
          {/* Veya ile giriş */}
          <View className="flex-row items-center my-2">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-2 text-gray-400">veya ile giriş</Text>
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
          {/* Kayıt ol linki */}
          <View className="flex-row justify-center mt-2">
            <Text className="text-gray-400">Hesabın yok mu? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text className="text-logoGray font-semibold">Kayıt ol</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
