import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Image, Text, TouchableOpacity, View } from 'react-native';

const steps = [
  {
    title: 'KnowZone’a Hoşgeldin!',
    description: 'Yapay zeka ile desteklenen sohbetler, konumuna göre eşleşmelerle hayat buluyor. KnowZone, sana en yakın ve en uyumlu insanları bir araya getiriyor.',
  },
  {
    title: 'Güvenli ve Kolay Eşleşme',
    description: 'Konumunu paylaş, hobilerini seç, sana en uygun kişileri bulalım.',
  },
  {
    title: 'Hemen Başla!',
    description: 'Giriş yap veya kayıt ol, KnowZone dünyasına katıl!',
  },
];

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOX_HEIGHT = 340; // normal kart yüksekliği
const BOX_HEIGHT_LARGE = SCREEN_HEIGHT * 0.5; // 3. aşamada kart yüksekliği

export default function WelcomeScreen() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1: ileri, -1: geri
  const anim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(1)).current;
  const cardAnim = useRef(new Animated.Value(0)).current; // 0: normal, 1: büyük kart
  const bgAnim = useRef(new Animated.Value(0)).current; // 0: normal, 1: karartılmış

  const animateStep = (dir: number, nextStep: number) => {
    setDirection(dir);
    // Sadece sıralı geçişlere izin ver
    if (Math.abs(nextStep - step) !== 1) return;
    const isButtonAnim = (step === 1 && nextStep === 2) || (step === 2 && nextStep === 1);
    if (isButtonAnim || (step === 0 && nextStep === 1) || (step === 1 && nextStep === 0)) {
      Animated.timing(buttonAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        // Önce içerik kaybolsun (fade/slide out)
        Animated.timing(anim, {
          toValue: dir * -1,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }).start(() => {
          // İçerik kaybolunca hemen yeni stepe geç
          setStep(nextStep);
          anim.setValue(dir); // yeni içerik için başa al
          // Kart ve arka plan animasyonunu başlat, içerik aynı anda fade/slide in
          Animated.parallel([
            Animated.timing(cardAnim, {
              toValue: nextStep === 2 ? 1 : 0,
              duration: 450,
              useNativeDriver: false,
              easing: Easing.out(Easing.ease),
            }),
            Animated.timing(bgAnim, {
              toValue: nextStep === 2 ? 1 : 0,
              duration: 450,
              useNativeDriver: false,
              easing: Easing.out(Easing.ease),
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
              easing: Easing.out(Easing.ease),
            }),
          ]).start(() => {
            buttonAnim.setValue(1);
          });
        });
      });
    }
  };

  const goNext = () => {
    if (step < steps.length - 1) {
      animateStep(1, step + 1);
    }
  };
  const goPrev = () => {
    if (step > 0) {
      animateStep(-1, step - 1);
    }
  };

  // Kart yüksekliği animasyonu
  const animatedCardHeight = cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [BOX_HEIGHT, BOX_HEIGHT_LARGE],
  });
  // Arka plan karartma
  const animatedBgOverlay = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  return (
    <View className="flex-1 bg-[#f5f5f5] justify-between items-center px-0 pt-16 pb-0">
      {/* Arka plan karartma */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#000',
          opacity: animatedBgOverlay,
          zIndex: 2,
        }}
      />
      {/* Logo */}
      <Image
        source={require('../assets/images/logo-transparent.png')}
        style={{ width: 350, height: 350, marginTop: 0, marginBottom: 0, zIndex: 1 }}
        resizeMode="contain"
      />
      {/* Beyaz Alan */}
      <Animated.View
        className="bg-white rounded-t-3xl shadow-lg px-0 pt-8 pb-10 items-center flex-grow"
        style={{
          height: animatedCardHeight,
          minHeight: animatedCardHeight,
          width: '100%',
          maxWidth: '100%',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          alignSelf: 'center',
          justifyContent: 'center',
          zIndex: 3,
        }}
      >
        <Animated.View
          style={{
            opacity: anim.interpolate({ inputRange: [-1, 0, 1], outputRange: [0, 1, 0] }),
            transform: [
              {
                translateX: anim.interpolate({
                  inputRange: [-1, 0, 1],
                  outputRange: [-60, 0, 60],
                }),
              },
            ],
            width: '100%',
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
            paddingHorizontal: 24,
          }}
        >
          <View className="flex-1 w-full justify-center items-center">
            <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
              {steps[step].title}
            </Text>
            <Text className="text-gray-600 text-base text-center mb-6">
              {steps[step].description}
            </Text>
            {/* Stepper dots ve ileri/geri */}
            <View className="flex-row justify-center items-center mb-6">
              <TouchableOpacity onPress={goPrev} className="px-4 py-2" disabled={step === 0}>
                <Text className={`text-4xl ${step === 0 ? 'text-gray-200' : 'text-gray-400'}`}>‹</Text>
              </TouchableOpacity>
              {steps.map((_, i) => (
                <View
                  key={i}
                  className={`w-2 h-2 mx-1 rounded-full ${i === step ? 'bg-logoBlack' : 'bg-gray-300'}`}
                />
              ))}
              <TouchableOpacity onPress={goNext} className="px-4 py-2" disabled={step === steps.length - 1}>
                <Text className={`text-4xl ${step === steps.length - 1 ? 'text-gray-200' : 'text-gray-400'}`}>›</Text>
              </TouchableOpacity>
            </View>
            {/* Butonlar */}
            <Animated.View
              style={{
                opacity: buttonAnim,
                transform: [
                  {
                    translateY: buttonAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [40, 0],
                    }),
                  },
                ],
                width: '100%',
              }}
            >
              {step < 2 ? (
                <TouchableOpacity
                  className="w-full bg-logoBlack rounded-2xl py-4 shadow-lg active:opacity-80"
                  onPress={goNext}
                  activeOpacity={0.85}
                >
                  <Text className="text-white text-lg font-bold text-center">Hadi Başlayalım!</Text>
                </TouchableOpacity>
              ) : (
                <View className="w-full">
                  <TouchableOpacity
                    className="bg-logoBlack rounded-2xl py-4 mb-4 shadow-lg active:opacity-80"
                    onPress={() => router.push('/login')}
                    activeOpacity={0.85}
                  >
                    <Text className="text-white text-lg font-bold text-center">Giriş Yap</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-logoSilver border border-logoSilver rounded-2xl py-4 shadow-md active:opacity-80"
                    onPress={() => router.push('/register')}
                    activeOpacity={0.85}
                  >
                    <Text className="text-black text-lg font-bold text-center">Kayıt Ol</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          </View>
        </Animated.View>
        {/* 3. aşamada en altta gri yazı */}
        {step === 2 && (
          <Text className="text-xs text-gray-400 text-center mt-6 px-4">
            Eğer yeni bir hesap oluşturuyorsan, <Text className="underline">Kullanım Koşulları</Text> ve <Text className="underline">Gizlilik Politikası</Text> geçerlidir.
          </Text>
        )}
      </Animated.View>
    </View>
  );
} 