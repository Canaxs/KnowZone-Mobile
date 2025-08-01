import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, Modal, Platform, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { LocationUpdateRequest, matchesAPI, MatchResponse } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';

const { width } = Dimensions.get('window');

interface MatchedUser {
  id: string;
  matchPercentage: number;
  gradientColors: string[];
  matchData?: MatchResponse;
}

interface Group {
  id: string;
  title: string;
  description: string;
  memberCount: number;
  gradientColors: string[];
  icon: string;
  category: string;
  location: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  distance: string;
  currentMembers: number;
  maxMembers: number;
}

export default function MatchesScreen() {
  const { user } = useAuthStore();
  const [matchedUsers, setMatchedUsers] = useState<MatchedUser[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [averageMatchPercentage, setAverageMatchPercentage] = useState(0);
  
  // Modal state'leri ekle
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchedUser | null>(null);

  // Gradient colors for match cards
  const gradientColors = [
    ['#667eea', '#764ba2'],
    ['#f093fb', '#f5576c'],
    ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'],
    ['#fa709a', '#fee140'],
    ['#a8edea', '#fed6e3'],
    ['#ff9a9e', '#fecfef'],
    ['#ffecd2', '#fcb69f'],
  ];

  // Fetch matches from API
  const fetchMatches = async () => {
    if (!user?.id) return;
    
    setIsLoadingMatches(true);
    try {
      // Önce konumu güncelle, sonra eşleşmeleri getir
      await updateUserLocation();
      
      const matches = await matchesAPI.getUserMatches(user.id);
      
      const formattedMatches: MatchedUser[] = matches.slice(0, 4).map((match, index) => ({
        id: match.id.toString(),
        matchPercentage: Math.round(match.compatibilityScore),
        gradientColors: gradientColors[index % gradientColors.length],
        matchData: match,
      }));
      
      // Ortalama eşleşme yüzdesini hesapla
      if (formattedMatches.length > 0) {
        const totalPercentage = formattedMatches.reduce((sum, match) => sum + match.matchPercentage, 0);
        const average = Math.round(totalPercentage / formattedMatches.length);
        setAverageMatchPercentage(average);
      } else {
        setAverageMatchPercentage(0);
      }
      
      setMatchedUsers(formattedMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
      Alert.alert('Hata', 'Eşleşmeler yüklenirken bir hata oluştu.');
    } finally {
      setIsLoadingMatches(false);
    }
  };

  // Load matches on component mount
  useEffect(() => {
    fetchMatches();
  }, [user?.id]);

  const getCurrentLocation = async () => {
    try {
      // Konum izni kontrol et
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        // İzin yoksa iste
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        if (newStatus !== 'granted') {
          Alert.alert('Hata', 'Konum izni gerekli!');
          return null;
        }
      }
      
      // Mevcut konumu al
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      });
      
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Hata', 'Konum alınırken bir hata oluştu.');
      return null;
    }
  };

  // Location update function
  const updateUserLocation = async () => {
    if (!user?.id) return;
    
    try {
      const location = await getCurrentLocation();
      if (!location) return;
    
      const locationData: LocationUpdateRequest = {
        latitude: location.latitude,
        longitude: location.longitude
      };
      await matchesAPI.updateLocation(locationData);
      console.log('Location updated successfully');
    } catch (error) {
      console.error('Error updating location:', error);
      Alert.alert('Hata', 'Konum güncellenirken bir hata oluştu.');
    }
  };

  const [groups, setGroups] = useState<Group[]>([
    {
      id: '1',
      title: 'İzmir Kordon Buluşması',
      description: 'Kordon\'da kahve ve sohbet',
      memberCount: 1247,
      gradientColors: ['#667eea', '#764ba2'],
      icon: '☕',
      category: 'Casual',
      location: 'İzmir, Kordon',
      startTime: '14:00',
      endTime: '18:00',
      isActive: true,
      distance: '0.5 km',
      currentMembers: 12,
      maxMembers: 20,
    },
    {
      id: '2',
      title: 'İzmir Alsancak Tech Meetup',
      description: 'Teknoloji tutkunları buluşması',
      memberCount: 892,
      gradientColors: ['#f093fb', '#f5576c'],
      icon: '💻',
      category: 'Tech',
      location: 'İzmir, Alsancak',
      startTime: '19:00',
      endTime: '22:00',
      isActive: true,
      distance: '1.2 km',
      currentMembers: 8,
      maxMembers: 15,
    },
    {
      id: '3',
      title: 'İzmir Bornova Üniversite',
      description: 'Üniversite öğrencileri buluşması',
      memberCount: 567,
      gradientColors: ['#4facfe', '#00f2fe'],
      icon: '🎓',
      category: 'Education',
      location: 'İzmir, Bornova',
      startTime: '16:00',
      endTime: '20:00',
      isActive: false,
      distance: '2.1 km',
      currentMembers: 5,
      maxMembers: 12,
    },
    {
      id: '4',
      title: 'İzmir Karşıyaka Spor',
      description: 'Spor ve fitness tutkunları',
      memberCount: 734,
      gradientColors: ['#43e97b', '#38f9d7'],
      icon: '🏃‍♂️',
      category: 'Sports',
      location: 'İzmir, Karşıyaka',
      startTime: '07:00',
      endTime: '09:00',
      isActive: true,
      distance: '3.5 km',
      currentMembers: 15,
      maxMembers: 25,
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const updateGroupsByLocation = () => {
    setIsLoading(true);
    setTimeout(() => {

      const shouldShowGroups = Math.random() > 0.3; 
      
      if (shouldShowGroups) {
        setGroups(prevGroups => prevGroups.map(group => ({
          ...group,
          isActive: Math.random() > 0.4, 
          currentMembers: Math.floor(Math.random() * group.maxMembers) + 1,
        })));
      } else {
        setGroups([]); 
      }
      setIsLoading(false);
    }, 1000);
  };

  // Handle functions ekle
  const handleAccept = async () => {
    if (!selectedMatch?.matchData) return;
    
    try {
      await matchesAPI.respondToMatch(selectedMatch.matchData.id, true);
      Alert.alert('Başarılı', 'Eşleşme kabul edildi!');
      setIsModalVisible(false);
      setSelectedMatch(null);
      fetchMatches(); // Listeyi yenile
    } catch (error) {
      Alert.alert('Hata', 'Eşleşme yanıtlanırken bir hata oluştu.');
    }
  };

  const handleReject = async () => {
    if (!selectedMatch?.matchData) return;
    
    try {
      await matchesAPI.respondToMatch(selectedMatch.matchData.id, false);
      Alert.alert('Bilgi', 'Eşleşme reddedildi.');
      setIsModalVisible(false);
      setSelectedMatch(null);
      fetchMatches(); // Listeyi yenile
    } catch (error) {
      Alert.alert('Hata', 'Eşleşme yanıtlanırken bir hata oluştu.');
    }
  };

  // Match card'a tıklama fonksiyonu
  const handleMatchPress = (match: MatchedUser) => {
    setSelectedMatch(match);
    setIsModalVisible(true);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: '#f8fafc' }}>
      {/* Content */}
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        className="flex-1"
        contentContainerStyle={{ 
          paddingBottom: 100,
          flexGrow: 1
        }}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingMatches}
            onRefresh={fetchMatches}
            tintColor="#667eea"
            colors={['#667eea']}
            progressViewOffset={Platform.OS === 'ios' ? 60 : 80}
            progressBackgroundColor="transparent"
          />
        }
      >
        {/* Modern Glassmorphism Header */}
        <View style={{ 
          paddingTop: Platform.OS === 'ios' ? 60 : 50, 
          paddingBottom: 20, 
          paddingHorizontal: 20,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(0, 0, 0, 0.05)',
        }}>
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-2xl font-bold text-gray-800 mb-1">Eşleşmeler</Text>
              <Text className="text-gray-500 text-sm">Yeni bağlantılar keşfet</Text>
            </View>
          </View>
          
          {/* Glassmorphism Stats Cards */}
          <View className="flex-row justify-between space-x-3">
            <View style={{
              flex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.8)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}>
              <Text className="text-2xl font-bold text-gray-800 text-center">{matchedUsers.length}</Text>
              <Text className="text-gray-500 text-sm text-center">Eşleşme</Text>
            </View>
            <View style={{
              flex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.8)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}>
              <Text className="text-2xl font-bold text-gray-800 text-center">{matchedUsers.length}</Text>
              <Text className="text-gray-500 text-sm text-center">Yeni</Text>
            </View>
            <View style={{
              flex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.8)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}>
              <Text className="text-2xl font-bold text-gray-800 text-center">{averageMatchPercentage}%</Text>
              <Text className="text-gray-500 text-sm text-center">Ortalama</Text>
            </View>
          </View>
        </View>

        {/* Matches Section */}
        <View className="px-4 py-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-gray-800">Son Eşleşmeler</Text>
            <TouchableOpacity 
              onPress={() => router.push('/all-matches')}
              style={{
                backgroundColor: '#000000',
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, 0.1)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <View className="flex-row items-center">
                <Text className="text-white font-semibold mr-1 text-sm">Tümünü Gör</Text>
                <Text className="text-white text-sm">→</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          {/* Glassmorphism Match Cards */}
          {isLoadingMatches ? (
            <View className="flex-1 justify-center items-center py-8">
              <Text className="text-gray-500 text-sm">Eşleşmeler yükleniyor...</Text>
            </View>
          ) : matchedUsers.length === 0 ? (
            <View className="flex-1 justify-center items-center py-8">
              <Text className="text-gray-400 text-lg mb-2">🤷‍♂️</Text>
              <Text className="text-gray-500 text-base text-center mb-1">Henüz eşleşmeniz yok</Text>
              <Text className="text-gray-400 text-sm text-center">Yeni eşleşmeler için bekleyin</Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {matchedUsers.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleMatchPress(item)}
                  style={{
                    width: (width - 60) / 2,
                    marginBottom: 16,
                  }}
                >
                  <View style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: 20,
                    padding: 20,
                    height: 120,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.9)',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    elevation: 4,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <LinearGradient
                      colors={item.gradientColors as [string, string]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        borderRadius: 16,
                        padding: 12,
                        marginBottom: 8,
                      }}
                    >
                      <Text className="text-white text-2xl font-bold">
                        {item.matchPercentage}%
                      </Text>
                    </LinearGradient>
                    <Text className="text-gray-600 text-sm font-medium">
                      Eşleşme
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Groups Section */}
        <View className="px-4 pb-12">
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-xl font-bold text-gray-800">Yakındaki Gruplar</Text>
              <Text className="text-gray-500 text-sm">İzmir bölgesinde aktif gruplar</Text>
            </View>
            <TouchableOpacity 
              onPress={updateGroupsByLocation}
              style={{
                backgroundColor: '#000000',
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, 0.1)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <View className="flex-row items-center">
                <Text className="text-white font-semibold mr-1 text-sm">Güncelle</Text>
                <Text className="text-white text-sm">📍</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          {isLoading ? (
            <View className="flex-1 justify-center items-center">
              <Text className="text-gray-500 text-sm">Yakındaki gruplar yükleniyor...</Text>
            </View>
          ) : groups.length === 0 ? (
            <View className="flex-1 justify-center items-center py-8">
              <Text className="text-gray-400 text-lg mb-2">🤷‍♂️</Text>
              <Text className="text-gray-500 text-base text-center mb-1">Yakınızda aktif bir grup yok</Text>
              <Text className="text-gray-400 text-sm text-center">Daha sonra tekrar kontrol edin</Text>
            </View>
          ) : (
            <View className="space-y-4">
              {groups.map((item, index) => (
                <View
                  key={item.id}
                  style={{
                    width: '100%',
                    marginBottom: 16,
                  }}
                >
                  <View style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: 20,
                    padding: 20,
                    height: 140,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.9)',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    elevation: 4,
                  }}>
                    {/* Header with icon and status */}
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center flex-1">
                        <Text className="text-2xl mr-3">{item.icon}</Text>
                        <View className="flex-1">
                          <Text className="text-gray-800 font-bold text-base" numberOfLines={1}>{item.title}</Text>
                          <Text className="text-gray-500 text-sm" numberOfLines={1}>{item.location}</Text>
                        </View>
                      </View>
                      <View style={{
                        backgroundColor: item.isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 8,
                        marginLeft: 8,
                      }}>
                        <Text style={{
                          color: item.isActive ? '#22c55e' : '#ef4444',
                          fontSize: 10,
                          fontWeight: 'bold',
                        }}>
                          {item.isActive ? 'AKTİF' : 'PASİF'}
                        </Text>
                      </View>
                    </View>
                    
                    {/* Description and time */}
                    <Text className="text-gray-600 text-sm mb-3" numberOfLines={2}>
                      {item.description}
                    </Text>
                    
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Text className="text-gray-500 text-sm mr-4">🕐 {item.startTime}-{item.endTime}</Text>
                        <Text className="text-gray-500 text-sm">📍 {item.distance}</Text>
                      </View>
                      
                      <View className="flex-row items-center">
                        <View className="mr-3">
                          <Text className="text-gray-500 text-sm text-right">
                            {item.currentMembers}/{item.maxMembers} üye
                          </Text>
                          <View style={{
                            width: 60,
                            height: 4,
                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                            borderRadius: 2,
                            marginTop: 2,
                          }}>
                            <View style={{
                              width: (item.currentMembers / item.maxMembers) * 60,
                              height: 4,
                              backgroundColor: '#667eea',
                              borderRadius: 2,
                            }} />
                          </View>
                        </View>
                        <TouchableOpacity 
                          style={{
                            backgroundColor: item.isActive ? '#000000' : 'rgba(0, 0, 0, 0.3)',
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 8,
                          }}
                          disabled={!item.isActive}
                        >
                          <Text className="text-white text-sm font-medium">
                            {item.isActive ? 'Katıl' : 'Kapalı'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

        {/* Modal component'i ekle */}
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View className="flex-1 bg-black bg-opacity-50 justify-center items-center px-4">
            <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
              <Text className="text-xl font-bold text-center mb-4">
                Eşleşme Detayları
              </Text>
              
              {selectedMatch && (
                <View className="mb-6">
                  <Text className="text-gray-600 text-center mb-2">
                    Uyumluluk Oranı: {selectedMatch.matchPercentage}%
                  </Text>
                  {selectedMatch.matchData?.commonTopic && (
                    <Text className="text-gray-600 text-center mb-2">
                      Ortak Konu: {selectedMatch.matchData.commonTopic}
                    </Text>
                  )}
                </View>
              )}
              
              <Text className="text-gray-600 text-center mb-6">
                Bu eşleşmeyi kabul etmek istiyor musunuz?
              </Text>
              
              <View className="flex-row space-x-3 w-full">
                <TouchableOpacity 
                  onPress={handleReject}
                  style={{
                    flex: 1,
                    backgroundColor: '#ef4444',
                    paddingVertical: 12,
                    borderRadius: 8,
                    alignItems: 'center'
                  }}
                >
                  <Text className="text-white font-semibold">Reddet</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={handleAccept}
                  style={{
                    flex: 1,
                    backgroundColor: '#10b981',
                    paddingVertical: 12,
                    borderRadius: 8,
                    alignItems: 'center'
                  }}
                >
                  <Text className="text-white font-semibold">Kabul Et</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                onPress={() => setIsModalVisible(false)}
                className="mt-4 py-2"
              >
                <Text className="text-gray-500 text-center">İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
} 