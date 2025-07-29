import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface MatchedUser {
  id: string;
  matchPercentage: number;
  gradientColors: string[];
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
  const matchedUsers: MatchedUser[] = [
    {
      id: '1',
      matchPercentage: 95,
      gradientColors: ['#667eea', '#764ba2'],
    },
    {
      id: '2',
      matchPercentage: 87,
      gradientColors: ['#f093fb', '#f5576c'],
    },
    {
      id: '3',
      matchPercentage: 92,
      gradientColors: ['#4facfe', '#00f2fe'],
    },
    {
      id: '4',
      matchPercentage: 89,
      gradientColors: ['#43e97b', '#38f9d7'],
    },
  ];

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

  return (
    <View className="flex-1" style={{ backgroundColor: '#f8fafc' }}>
      {/* Content */}
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Modern Glassmorphism Header */}
        <View style={{ 
          paddingTop: 50, 
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
              <Text className="text-2xl font-bold text-gray-800 text-center">12</Text>
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
              <Text className="text-2xl font-bold text-gray-800 text-center">89%</Text>
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
          <View className="flex-row flex-wrap justify-between">
            {matchedUsers.map((item, index) => (
              <View
                key={item.id}
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
              </View>
            ))}
          </View>
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
    </View>
  );
} 