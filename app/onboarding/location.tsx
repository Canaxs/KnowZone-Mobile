import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export default function LocationPermissionScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [completeLoading, setCompleteLoading] = useState(false);

  const handleLocationPermission = async () => {
    setLoading(true);
    setError('');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setPermissionGranted(true);
      } else {
        setError('Konum izni verilmedi. Lütfen izin vererek devam edin.');
      }
    } catch (e) {
      setError('Konum izni alınırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setCompleteLoading(true);
    setError('');
    try {
      // TODO: Onboarding verilerini context veya global state'ten al
      // Şimdilik dummy veri ile simüle edelim
      const onboardingData = {
        interests: ['Teknoloji', 'Müzik', 'Spor'],
        hobbies: ['Yüzmek', 'Kitap Okumak', 'Yemek Yapmak'],
        idealPerson: ['Mizah anlayışı yüksek', 'Kitap okumayı seven', 'Açık fikirli'],
        location: 'user-location-coords',
      };
      // Simüle: 1sn bekle
      await new Promise(res => setTimeout(res, 1000));
      // Burada gerçek backend isteği yapılacak (fetch/axios ile)
      // await fetch('/api/onboarding', { method: 'POST', body: JSON.stringify(onboardingData) })
      router.push('/');
    } catch (e) {
      setError('Veriler gönderilirken bir hata oluştu.');
    } finally {
      setCompleteLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white justify-center items-center px-6">
      <View className="items-center mb-8">
        <View className="bg-blue-100 rounded-full p-6 mb-4">
          <MaterialIcons name="my-location" size={64} color="#2563eb" />
        </View>
        <Text className="text-2xl font-bold text-center mb-2">Konum İzni Gerekli</Text>
        <Text className="text-gray-600 text-center mb-4">Uygulamayı kullanabilmek için konum izni vermen gerekiyor. Konumun, sana en yakın ve en uygun kişileri bulmamıza yardımcı olacak.</Text>
      </View>
      {!permissionGranted ? (
        <TouchableOpacity
          className="bg-blue-500 p-4 rounded-full w-full"
          onPress={handleLocationPermission}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text className="text-white text-center font-bold text-base">
            {loading ? 'İzin Alınıyor...' : 'Konum İznini Ver'}
          </Text>
        </TouchableOpacity>
      ) : (
        <>
          <Text className="text-green-600 text-center font-bold mb-4">Konum izni başarıyla alındı!</Text>
          <TouchableOpacity
            className="bg-logoBlack p-4 rounded-full w-full"
            onPress={handleComplete}
            disabled={completeLoading}
            activeOpacity={0.85}
          >
            <Text className="text-white text-center font-bold text-base">
              {completeLoading ? 'Tamamlanıyor...' : 'Tamamla'}
            </Text>
          </TouchableOpacity>
        </>
      )}
      {error ? (
        <Text className="text-red-500 text-center mt-3">{error}</Text>
      ) : null}
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
              style={{ width: 8, height: 8, borderRadius: 4, marginHorizontal: 4, backgroundColor: i === 3 ? '#111827' : '#d1d5db' }}
            />
          ))}
        </View>
      </View>
    </View>
  );
} 