import { IconSymbol } from '@/components/ui/IconSymbol';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, Modal, Platform, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { groupsAPI } from '../lib/api';
import { useAuthStore } from '../stores/authStore';

const { width } = Dimensions.get('window');

interface PastGroup {
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
  groupCreationType: string;
  createdAt: Date;
  timeAgo: string;
  status: 'expired';
}

export default function PastGroupsScreen() {
  const { user } = useAuthStore();
  const [selectedGroup, setSelectedGroup] = useState<PastGroup | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [allGroups, setAllGroups] = useState<PastGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Gradient colors for group cards
  const gradientColors = [
    ['#667eea', '#764ba2'],
    ['#f093fb', '#f5576c'],
    ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'],
    ['#fa709a', '#fee140'],
    ['#a8edea', '#fed6e3'],
    ['#ff9a9e', '#fecfef'],
    ['#ffecd2', '#fcb69f'],
    ['#FD79A8', '#FDCB6E'],
    ['#00B894', '#00CEC9'],
    ['#74B9FF', '#0984E3'],
    ['#FAB1A0', '#E17055'],
    ['#A29BFE', '#6C5CE7'],
    ['#FF7675', '#FD79A8'],
  ];

  // Get user's current location
  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Konum İzni', 'Konum izni verilmedi. Yakındaki gruplar gösterilemeyecek.');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setUserLocation({ latitude, longitude });
      return { latitude, longitude };
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Konum Hatası', 'Konum alınamadı. Yakındaki gruplar gösterilemeyecek.');
      return null;
    }
  };

  // Calculate time ago
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInDays > 0) {
      return `${diffInDays} gün önce`;
    } else if (diffInHours > 0) {
      return `${diffInHours} saat önce`;
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes} dakika önce`;
    } else {
      return 'Az önce';
    }
  };

  // Get group icon
  const getGroupIcon = (groupType: string): string => {
    switch (groupType) {
      case 'DAILY_SCHEDULE':
        return '📅';
      case 'DEMAND_BASED':
        return '⚡';
      default:
        return '👥';
    }
  };

  // Get group type in Turkish
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

  // Format time
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

  // Fetch nearby inactive groups from API
  const fetchGroups = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // Önce kullanıcının konumunu al
      const location = await getUserLocation();
      
      if (!location) {
        // Konum alınamadıysa eski yöntemi kullan (tüm grupları getir ve filtrele)
        const allGroupsData = await groupsAPI.getAllActiveGroups();
        const expiredGroups = allGroupsData.filter(group => {
          const endTime = new Date(group.endTime);
          const now = new Date();
          return endTime < now && !group.isActive;
        });
        
        const formattedGroups: PastGroup[] = expiredGroups.map((group, index) => {
          const createdAt = new Date(group.createdAt);
          
          return {
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
            distance: 'N/A',
            currentMembers: group.currentMembers,
            maxMembers: group.maxMembers,
            groupCreationType: group.groupCreationType,
            createdAt,
            timeAgo: getTimeAgo(createdAt),
            status: 'expired',
          };
        });
        
        setAllGroups(formattedGroups);
        return;
      }

      // Yeni API'yi kullanarak yakındaki pasif grupları getir
      const nearbyInactiveGroups = await groupsAPI.getNearbyInactiveGroups(location.latitude, location.longitude);
      
      const formattedGroups: PastGroup[] = nearbyInactiveGroups.map((group, index) => {
        const createdAt = new Date(group.createdAt);
        
        return {
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
          distance: 'Yakında',
          currentMembers: group.currentMembers,
          maxMembers: group.maxMembers,
          groupCreationType: group.groupCreationType,
          createdAt,
          timeAgo: getTimeAgo(createdAt),
          status: 'expired',
        };
      });
      
      setAllGroups(formattedGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
      Alert.alert('Hata', 'Gruplar yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load groups on component mount
  useEffect(() => {
    fetchGroups();
  }, [user?.id]);

  const handleCardPress = (group: PastGroup) => {
    setSelectedGroup(group);
    setIsModalVisible(true);
  };

  return (
    <View className="flex-1" 
    style={{ backgroundColor: '#f8fafc',}}>
      {/* Modern Header */}
      <View style={{ 
        paddingTop: Platform.OS === 'ios' ? 60 : 48 ,
        paddingBottom: 20, 
        paddingHorizontal: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
      }}>
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <IconSymbol size={24} name="chevron.left" color="#374151" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-800 text-center">Süresi Dolan Gruplar</Text>
            <Text className="text-gray-500 text-sm text-center">
              {userLocation ? `${allGroups.length} grup bulundu` : 'Konum alınıyor...'}
            </Text>
          </View>
          <View className="w-8" />
        </View>
      </View>

      {/* All Groups Grid */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: 100,
          flexGrow: 1
        }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchGroups}
            tintColor="#667eea"
            colors={['#667eea']}
            progressViewOffset={Platform.OS === 'ios' ? 60 : 80}
            progressBackgroundColor="transparent"
          />
        }
      >
        {isLoading ? (
          <View className="flex-1 justify-center items-center py-8">
            <Text className="text-gray-500 text-sm">Gruplar yükleniyor...</Text>
          </View>
        ) : allGroups.length === 0 ? (
          <View className="flex-1 justify-center items-center py-8">
            <Text className="text-gray-400 text-lg mb-2">🤷‍♂️</Text>
            <Text className="text-gray-500 text-base text-center mb-1">
              Yakında süresi dolan grubunuz yok
            </Text>
            <Text className="text-gray-400 text-sm text-center">
              {userLocation ? 'Bu bölgede süresi dolan grup bulunamadı' : 'Konum izni verilmediği için gruplar gösterilemiyor'}
            </Text>
          </View>
        ) : (
          <View style={{ 
            flexDirection: 'row', 
            flexWrap: 'wrap', 
            paddingHorizontal: 16, 
            paddingTop: 16,
            paddingLeft: 16,
            paddingRight: 16,
          }}>
            {allGroups.map((item, index) => (
              <Animated.View
                key={item.id}
                entering={FadeInUp.delay(index * 50).springify()}
                style={{ width: (width - 50) / 2, marginBottom: 20}}
              >
                <TouchableOpacity
                  onPress={() => handleCardPress(item)}
                  activeOpacity={0.9}
                  style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: 16,
                    padding: 0,
                    height: 280, // Increased height for group info
                    marginHorizontal: 6,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 20,
                    elevation: 15,
                    borderWidth: 2,
                    borderColor: '#f59e0b',
                    overflow: 'hidden',
                  }}
                >
                   {/* Status Badge */}
                   <View style={{
                     position: 'absolute',
                     top: 8,
                     right: 8,
                     backgroundColor: '#f59e0b',
                     paddingHorizontal: 8,
                     paddingVertical: 4,
                     borderRadius: 12,
                     zIndex: 3,
                   }}>
                     <Text style={{
                       color: '#ffffff',
                       fontSize: 8,
                       fontWeight: 'bold',
                       textShadowColor: 'rgba(0,0,0,0.8)',
                       textShadowOffset: { width: 1, height: 1 },
                       textShadowRadius: 2,
                     }}>
                       SÜRE DOLDU
                     </Text>
                   </View>

                  {/* Card Header with Corner Design */}
                  <View style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 30,
                    backgroundColor: '#f59e0b',
                  }}>
                    <Text style={{
                      color: '#ffffff',
                      fontSize: 10,
                      fontWeight: 'bold',
                      textAlign: 'center',
                      marginTop: 8,
                      letterSpacing: 1,
                    }}>
                      SÜRE
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
                    {/* Group Icon */}
                    <View style={{
                      width: 50,
                      height: 50,
                      borderRadius: 27.5,
                      backgroundColor: '#e2e8f0',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: 25,
                      borderWidth: 2,
                      borderColor: 'gray',
                      shadowColor: 'gray',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.5,
                      shadowRadius: 8,
                      elevation: 8,
                    }}>
                      <Text style={{ fontSize: 22 }}>{item.icon}</Text>
                    </View>

                    {/* Group Title */}
                    <Text style={{
                      color: '#1e293b',
                      fontSize: 14,
                      fontWeight: 'bold',
                      textAlign: 'center',
                      marginBottom: 15,
                      paddingHorizontal: 10,
                      lineHeight: 18,
                    }} numberOfLines={2}>
                      {item.title}
                    </Text>

                    {/* Group Category */}
                    <Text style={{
                      color: '#64748b',
                      fontSize: 11,
                      fontWeight: '600',
                      letterSpacing: 0.5,
                      textTransform: 'uppercase',
                      marginBottom: 15,
                    }}>
                      {item.category}
                    </Text>

                    {/* Members Info */}
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 15,
                    }}>
                      <Text style={{
                        color: '#6b7280',
                        fontSize: 12,
                        fontWeight: '500',
                      }}>
                        👥 {item.currentMembers}/{item.maxMembers}
                      </Text>
                    </View>

                    {/* Time Info */}
                    <Text style={{
                      color: '#6b7280',
                      fontSize: 11,
                      fontWeight: '500',
                      textAlign: 'center',
                      paddingHorizontal: 10,
                    }}>
                      🕐 {item.startTime} - {item.endTime}
                    </Text>
                  </View>

                  {/* Time Info at Bottom */}
                  <View style={{
                    position: 'absolute',
                    bottom: 12,
                    left: 12,
                    right: 12,
                    zIndex: 3,
                  }}>
                    <Text style={{
                      color: '#6b7280',
                      fontSize: 11,
                      fontWeight: '500',
                      textAlign: 'center',
                      textShadowColor: 'rgba(255,255,255,0.8)',
                      textShadowOffset: { width: 0.5, height: 0.5 },
                      textShadowRadius: 1,
                    }}>
                      {item.timeAgo}
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
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Group Detail Modal */}
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
                  <Text className="text-3xl">{selectedGroup?.icon || '👥'}</Text>
                </View>
                
                <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">
                  {selectedGroup?.title || 'Grup Detayı'}
                </Text>
                <Text className="text-gray-500 text-center">
                  {selectedGroup?.category || 'Grup'}
                </Text>
                <Text className="text-gray-400 text-center text-sm mt-1">
                  Süresi dolan grup
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
                      <Text className="text-gray-600">
                        📅 {selectedGroup.timeAgo}
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

              {/* Close button */}
              <TouchableOpacity 
                onPress={() => setIsModalVisible(false)}
                className="w-full py-4 rounded-2xl bg-gray-300"
                activeOpacity={0.8}
              >
                <Text className="text-gray-600 font-bold text-center text-lg">
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