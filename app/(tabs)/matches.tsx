import { IconSymbol } from '@/components/ui/IconSymbol';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, Modal, Platform, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { groupsAPI, LocationUpdateRequest, matchesAPI, MatchResponse } from '../../lib/api';
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
  currentMembers: number;
  maxMembers: number;
  groupCreationType: string;
}

export default function MatchesScreen() {
  const { user } = useAuthStore();
  const [matchedUsers, setMatchedUsers] = useState<MatchedUser[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [averageMatchPercentage, setAverageMatchPercentage] = useState(0);
  
  // Modal state'leri ekle
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchedUser | null>(null);

  // Grup modal state'leri
  const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

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
      //await updateUserLocation();
      
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

      fetchGroups();

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

  // Grup state'leri
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);

  // Grup verilerini backend'den getir
  const fetchGroups = async () => {
    setIsLoadingGroups(true);
    try {
      const location = await getCurrentLocation();
      if (location) {
        const nearbyGroups = await groupsAPI.getNearbyGroups(location.latitude, location.longitude);
        
        const formattedGroups: Group[] = nearbyGroups.map((group, index) => ({
          id: group.id.toString(),
          title: group.name,
          description: group.description,
          memberCount: group.currentMembers,
          gradientColors: gradientColors[index % gradientColors.length],
          icon: getGroupIcon(group.groupCreationType),
          category: getGroupTypeInTurkish(group.groupCreationType),
          location: `${group.region.city}, ${group.region.name}`,
          startTime: formatTime(group.startTime),
          endTime: formatTime(group.endTime),
          isActive: group.isActive,
          currentMembers: group.currentMembers,
          maxMembers: group.maxMembers,
          groupCreationType: group.groupCreationType,
        }));
        
        setGroups(formattedGroups);
      }
      else {
        Alert.alert('Hata', 'Gruplar yüklenirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      Alert.alert('Hata', 'Gruplar yüklenirken bir hata oluştu.');
    } finally {
      setIsLoadingGroups(false);
    }
  };

  // Grup ikonunu belirle
  const getGroupIcon = (groupType: string): string => {
    switch (groupType) {
      case 'DAILY_SCHEDULE':
        return '📅';
      case 'DEMAND_BASED':
        return '⚡';
      default:
        return '��';
    }
  };

  // Grup tipini Türkçe'ye çevir
  const getGroupTypeInTurkish = (groupType: string): string => {
    switch (groupType) {
      case 'DAILY_SCHEDULE':
        return 'Günlük Program';
      case 'DEMAND_BASED':
        return 'Talep Bazlı';
      default:
        return 'Grup';
    }
  };

  // Zaman formatını düzenle
  const formatTime = (dateTimeString: string): string => {
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } catch (error) {
      return 'N/A';
    }
  };

  // Grupları konuma göre güncelle
  const updateGroupsByLocation = async () => {
    await fetchGroups();
  };

  // Grup katılım işlemi
  const handleJoinGroup = async (groupId: string) => {
    try {
      await groupsAPI.joinGroup(parseInt(groupId));
      Alert.alert('Başarılı', 'Gruba başarıyla katıldınız!');
      // Grupları yenile
      await fetchGroups();
    } catch (error) {
      console.error('Error joining group:', error);
      Alert.alert('Hata', 'Gruba katılırken bir hata oluştu.');
    }
  };

  // Grup detayına git
  const handleGroupPress = (group: Group) => {
    // Sadece aktif gruplarda modal aç
    if (group.isActive) {
      setSelectedGroup(group);
      setIsGroupModalVisible(true);
    }
  };

  // Component mount'ta grupları getir
  useEffect(() => {
    fetchGroups();
  }, []);



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
              <View className="flex-row items-center mb-1">
                <Text className="text-2xl font-bold text-gray-800 mr-2">Eşleşmeler</Text>
                <Text className="text-2xl mb-1">🎯</Text>
              </View>
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
            
            {/* Action Buttons Container */}
            <View className="flex-row space-x-2">
              
              {/* View All Matches Button */}
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
                  <Text className="text-white font-semibold mr-1 text-sm">Keşfet</Text>
                  <IconSymbol name="arrow.right" size={18} color="white" />
                </View>
              </TouchableOpacity>
            </View>
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
            <View style={{
              flexDirection: 'row',
            }}>
              {matchedUsers.map((item, index) => (
                <View
                  key={item.id}
                  style={{ width: (width - 48) / 2, marginBottom: 20}}
                >
                  <TouchableOpacity
                    onPress={() => handleMatchPress(item)}
                    activeOpacity={0.9}
                    style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: 16,
                      padding: 0,
                      height: 230,
                      marginHorizontal: 6,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.3,
                      shadowRadius: 20,
                      elevation: 15,
                      borderWidth: 2,
                      borderColor: item.matchPercentage >= 80 ? '#1f2937' : 
                                  item.matchPercentage >= 60 ? '#374151' : 
                                  item.matchPercentage >= 40 ? '#6b7280' : '#9ca3af',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Card Header with Corner Design */}
                    <View style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 30,
                      backgroundColor: item.matchPercentage >= 80 ? '#1f2937' : 
                                     item.matchPercentage >= 60 ? '#374151' : 
                                     item.matchPercentage >= 40 ? '#6b7280' : '#9ca3af',
                    }}>
                      <Text style={{
                        color: '#ffffff',
                        fontSize: 10,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        marginTop: 8,
                        letterSpacing: 1,
                      }}>
                        {item.matchPercentage >= 80 ? 'EFSANEVİ' : 
                         item.matchPercentage >= 60 ? 'DESTANSI' : 
                         item.matchPercentage >= 40 ? 'NADİR' : 'YAYGIN'}
                      </Text>
                    </View>

                    {/* Corner Suit Symbols */}
                    <View style={{ position: 'absolute', top: 8, left: 8, zIndex: 2 }}>
                      <Text style={{ fontSize: 12, color: '#ffffff' }}>♠</Text>
                    </View>
                    <View style={{ position: 'absolute', bottom: 8, right: 8, zIndex: 2, transform: [{ rotate: '180deg' }] }}>
                      <Text style={{ fontSize: 12, color: '#000' }}>♠</Text>
                    </View>

                    {/* Main Content */}
                    <View style={{
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingTop: 10,
                    }}>
                      {/* Avatar Placeholder */}
                      <View style={{
                        width: 50,
                        height: 50,
                        borderRadius: 27.5,
                        backgroundColor: '#e2e8f0',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 35,
                        borderWidth: 2,
                        borderColor: 'gray',
                        shadowColor: 'gray',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.5,
                        shadowRadius: 8,
                        elevation: 8,
                      }}>
                        <Text style={{ fontSize: 22 }}>🃤</Text>
                      </View>

                      {/* Match Percentage with Circular Progress */}
                      <View style={{
                        position: 'relative',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 30,
                      }}>
                        {/* Background Circle */}
                        <View style={{
                          width: 50,
                          height: 50,
                          borderRadius: 32.5,
                          borderWidth: 4,
                          borderColor: '#e2e8f0',
                          position: 'absolute',
                        }} />
                        
                        {/* Progress Circle */}
                        <View style={{
                          width: 50,
                          height: 50,
                          borderRadius: 32.5,
                          borderWidth: 4,
                          borderColor: item.matchPercentage >= 80 ? '#1f2937' : 
                                     item.matchPercentage >= 60 ? '#374151' : 
                                     item.matchPercentage >= 40 ? '#6b7280' : '#9ca3af',
                          borderTopColor: 'transparent',
                          borderRightColor: item.matchPercentage >= 50 ? (item.matchPercentage >= 80 ? '#1f2937' : 
                                           item.matchPercentage >= 60 ? '#374151' : '#6b7280') : 'transparent',
                          borderBottomColor: item.matchPercentage >= 25 ? (item.matchPercentage >= 80 ? '#1f2937' : 
                                            item.matchPercentage >= 60 ? '#374151' : 
                                            item.matchPercentage >= 40 ? '#6b7280' : '#9ca3af') : 'transparent',
                          borderLeftColor: item.matchPercentage >= 75 ? (item.matchPercentage >= 80 ? '#1f2937' : '#374151') : 'transparent',
                          transform: [{ rotate: '-90deg' }],
                          position: 'absolute',
                        }} />

                        {/* Percentage Text */}
                        <Text style={{
                          color: '#1e293b',
                          fontSize: 15,
                          fontWeight: 'bold',
                          textShadowColor: 'rgba(0,0,0,0.1)',
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 1,
                        }}>
                          {item.matchPercentage}%
                        </Text>
                      </View>

                      {/* Match Label */}
                      <Text style={{
                        color: '#64748b',
                        fontSize: 11,
                        fontWeight: '600',
                        letterSpacing: 0.5,
                        textTransform: 'uppercase',
                      }}>
                        Eşleşme Bulundu
                      </Text>
                    </View>

                    {/* Subtle pattern overlay */}
                    <View style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      borderRadius: 16,
                    }} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Groups Section */}
        <View className="px-4 pb-12">
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-xl font-bold text-gray-800">Yakındaki Gruplar</Text>
              <Text className="text-gray-500 text-sm">Konumunuza yakın aktif gruplar</Text>
            </View>
            <TouchableOpacity 
              onPress={() => router.push('/past-groups')}
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
                <Text className="text-white font-semibold mr-1 text-sm">Geçmiş</Text>
                <IconSymbol name="arrow.right" size={18} color="white" />
              </View>
            </TouchableOpacity>
          </View>
          
          {isLoadingGroups ? (
            <View className="flex-1 justify-center items-center py-8">
              <Text className="text-gray-500 text-sm">Gruplar yükleniyor...</Text>
            </View>
          ) : groups.length === 0 ? (
            <View className="flex-1 justify-center items-center py-8">
              <Text className="text-gray-400 text-lg mb-2">🤷‍♂️</Text>
              <Text className="text-gray-500 text-base text-center mb-1">Yakınızda aktif bir grup yok</Text>
              <Text className="text-gray-400 text-sm text-center">Daha sonra tekrar kontrol edin veya konumunuzu güncelleyin</Text>
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
                  <TouchableOpacity
                    onPress={() => handleGroupPress(item)}
                    activeOpacity={0.8}
                    disabled={!item.isActive}
                  >
                    <View style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.8)' ,
                      borderRadius: 20,
                      padding: 20,
                      height: 140,
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.9)',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.08 ,
                      shadowRadius: 12,
                      elevation: 4,
                      opacity: 1,
                    }}>
                    {/* Header with icon and status */}
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center flex-1">
                        <Text className="text-2xl mr-3">{item.icon}</Text>
                        <View className="flex-1">
                          <Text className={`font-bold text-base ${item.isActive ? 'text-gray-800' : 'text-gray-500'}`} numberOfLines={1}>{item.title}</Text>
                          <Text className={`text-sm ${item.isActive ? 'text-gray-500' : 'text-gray-400'}`} numberOfLines={1}>{item.location}</Text>
                        </View>
                      </View>
                      <View className="flex-row items-center space-x-2">
                        {/* Status indicator */}
                        <View style={{
                          backgroundColor: 'rgba(34, 197, 94, 0.1)' ,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 8,
                        }}>
                          <Text style={{
                            color: '#22c55e' ,
                            fontSize: 10,
                            fontWeight: 'bold',
                          }}>
                            AKTİF
                          </Text>
                        </View>
                      </View>
                    </View>
                    
                    {/* Description and time */}
                    <Text className={`text-sm mb-3 ${item.isActive ? 'text-gray-600' : 'text-gray-400'}`} numberOfLines={2}>
                      {item.description}
                    </Text>
                    
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Text className={`text-sm mr-4 text-gray-500 `}>🕐 {item.startTime}-{item.endTime}</Text>
                      </View>
                      
                      <View className="flex-row items-center">
                        <View className="mr-3">
                          <Text className={`text-sm text-right text-gray-500 `}>
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
                          onPress={() => handleJoinGroup(item.id)}
                          style={{
                            backgroundColor: '#000000' ,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 8,
                          }}
                          disabled={!item.isActive}
                        >
                          <Text className="text-white text-sm font-medium">
                            Katıl
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    </View>
                  </TouchableOpacity>
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
          <View className="flex-1 bg-gray-200 bg-opacity-10 justify-center items-center px-4">
            <View 
              className="bg-white rounded-3xl p-8 w-full max-w-sm"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 20 },
                shadowOpacity: 0.3,
                shadowRadius: 30,
                elevation: 20
              }}
            >
              
              {/* Close button */}
              <TouchableOpacity 
                onPress={() => setIsModalVisible(false)}
                className="absolute top-2 right-4 z-10">
                <Text className="text-black text-3xl font-bold">×</Text>
              </TouchableOpacity>

              {/* Main content */}
              <View className="mt-8">
                {/* Icon */}
                <View className="items-center mb-6">
                  <View 
                    className="w-20 h-20 rounded-full justify-center bg-white items-center border border-gray-500 shadow-[rgba(0,0,15,0.5)_5px_5px_4px_1px] shadow-gray-400 mb-4">
                    <Text className="text-3xl">🃤</Text>
                  </View>
                  
                  <Text className="text-2xl font-bold text-gray-800 mb-2">
                    Yeni Eşleşme!
                  </Text>
                  <Text className="text-gray-500 text-center">
                    Harika bir eşleşme bulduk
                  </Text>
                </View>

                {/* Match details */}
                {selectedMatch && (
                  <View className="mb-8">
                    {/* Compatibility score */}
                    <View className="bg-gray-50 rounded-2xl p-4 mb-4">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-gray-700 font-semibold">Uyumluluk Oranı</Text>
                        <Text className="text-2xl font-bold text-gray-600">
                          {selectedMatch.matchPercentage}%
                        </Text>
                      </View>
                      <View className="w-full bg-gray-200 rounded-full h-3">
                        <View 
                          className="bg-gray-700 h-3 rounded-full"
                          style={{ width: `${selectedMatch.matchPercentage}%` }}
                        />
                      </View>
                    </View>

                    {/* Common topic */}
                    {selectedMatch.matchData?.commonTopic && (
                      <View className="bg-gray-50 rounded-2xl p-4">
                        <View className="flex-row items-center mb-2">
                          <Text className="text-lg mr-2">💬</Text>
                          <Text className="text-gray-700 font-semibold">Ortak Konu</Text>
                        </View>
                        <Text className="text-gray-600 text-center">
                          "{selectedMatch.matchData.commonTopic}"
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Action buttons */}
                <View className="space-y-3">
                  <TouchableOpacity 
                    onPress={handleAccept}
                    className="w-full py-4 rounded-2xl bg-black"
                    activeOpacity={0.8}
                  >
                    <Text className="text-white font-bold text-center text-lg">
                      Kabul Et
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={handleReject}
                    className="w-full py-4 mt-3 rounded-2xl bg-gray-300"
                    activeOpacity={0.8}
                  >
                    <Text className="text-gray-600 font-semibold text-center text-lg">
                      Reddet
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Cancel button */}
                <TouchableOpacity 
                  onPress={() => setIsModalVisible(false)}
                  className="mt-4 py-3"
                >
                  <Text className="text-gray-400 text-center font-medium">
                    Daha sonra karar ver
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Grup Modal component'i */}
        <Modal
          visible={isGroupModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsGroupModalVisible(false)}
        >
          <View className="flex-1 bg-gray-200 bg-opacity-10 justify-center items-center px-4">
            <View 
              className="bg-white rounded-3xl p-8 w-full max-w-sm"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 20 },
                shadowOpacity: 0.3,
                shadowRadius: 30,
                elevation: 20
              }}
            >
              
              {/* Close button */}
              <TouchableOpacity 
                onPress={() => setIsGroupModalVisible(false)}
                className="absolute top-2 right-4 z-10">
                <Text className="text-black text-3xl font-bold">×</Text>
              </TouchableOpacity>

              {/* Main content */}
              <View className="mt-8">
                {/* Icon */}
                <View className="items-center mb-6">
                  <View 
                    className="w-20 h-20 rounded-full justify-center bg-white items-center border border-gray-500 shadow-[rgba(0,0,15,0.5)_5px_5px_4px_1px] shadow-gray-400 mb-4">
                    <Text className="text-3xl">{selectedGroup?.icon || '👥'}</Text>
                  </View>
                  
                  <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">
                    {selectedGroup?.title || 'Grup Detayı'}
                  </Text>
                  <Text className="text-gray-500 text-center">
                    {selectedGroup?.category || 'Grup'}
                  </Text>
                  <Text className="text-gray-400 text-center text-sm mt-1">
                    {selectedGroup?.groupCreationType === 'DAILY_SCHEDULE' 
                      ? 'Otomatik oluşturulan günlük grup' 
                      : selectedGroup?.groupCreationType === 'DEMAND_BASED' 
                      ? 'Yoğun olunan bölgelerde otomatik oluşturulan grup'
                      : ''}
                  </Text>
                </View>

                {/* Group details */}
                {selectedGroup && (
                  <View className="mb-8">
                    {/* Description */}
                    <View className="bg-gray-50 rounded-2xl p-4 mb-4">
                      <View className="flex-row items-center mb-2">
                        <Text className="text-lg mr-2">📝</Text>
                        <Text className="text-gray-700 font-semibold">Açıklama</Text>
                      </View>
                      <Text className="text-gray-600 text-center">
                        {selectedGroup.description}
                      </Text>
                    </View>

                    {/* Location and Time */}
                    <View className="bg-gray-50 rounded-2xl p-4 mb-4">
                      <View className="flex-row items-center mb-2">
                        <Text className="text-lg mr-2">📍</Text>
                        <Text className="text-gray-700 font-semibold">Konum & Zaman</Text>
                      </View>
                      <Text className="text-gray-600 text-center mb-2">
                        {selectedGroup.location}
                      </Text>
                      <Text className="text-gray-600 text-center">
                        🕐 {selectedGroup.startTime} - {selectedGroup.endTime}
                      </Text>
                    </View>

                    {/* Members Info */}
                    <View className="bg-gray-50 rounded-2xl p-4">
                      <View className="flex-row items-center mb-2">
                        <Text className="text-lg mr-2">👥</Text>
                        <Text className="text-gray-700 font-semibold">Üye Bilgileri</Text>
                      </View>
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-gray-600">
                          {selectedGroup.currentMembers}/{selectedGroup.maxMembers} üye
                        </Text>
                      </View>
                      <View className="w-full bg-gray-200 rounded-full h-3">
                        <View 
                          className="bg-blue-500 h-3 rounded-full"
                          style={{ width: `${(selectedGroup.currentMembers / selectedGroup.maxMembers) * 100}%` }}
                        />
                      </View>
                      

                    </View>
                  </View>
                )}

                {/* Action buttons */}
                <View className="space-y-3">
                  <TouchableOpacity 
                    onPress={() => {
                      if (selectedGroup) {
                        handleJoinGroup(selectedGroup.id);
                        setIsGroupModalVisible(false);
                      }
                    }}
                    disabled={!selectedGroup?.isActive}
                    className={`w-full py-4 rounded-2xl ${selectedGroup?.isActive ? 'bg-black' : 'bg-gray-300'}`}
                    activeOpacity={0.8}
                  >
                    <Text className={`font-bold text-center text-lg ${selectedGroup?.isActive ? 'text-white' : 'text-gray-600'}`}>
                      {selectedGroup?.isActive ? 'Gruba Katıl' : 'Grup Kapalı'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Cancel button */}
                <TouchableOpacity 
                  onPress={() => setIsGroupModalVisible(false)}
                  className="mt-4 py-3"
                >
                  <Text className="text-gray-400 text-center font-medium">
                    Kapat
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
} 