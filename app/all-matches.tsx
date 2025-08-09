import { IconSymbol } from '@/components/ui/IconSymbol';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, Modal, Platform, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { matchesAPI, MatchResponse } from '../lib/api';
import { useAuthStore } from '../stores/authStore';

const { width } = Dimensions.get('window');

interface MatchedUser {
  id: string;
  matchPercentage: number;
  gradientColors: string[];
  name: string;
  age: number;
  location: string;
  lastActive: string;
  interests: string[];
  matchData?: MatchResponse;
}

export default function AllMatchesScreen() {
  const { user } = useAuthStore();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedMatch, setSelectedMatch] = useState<MatchedUser | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [matchedUsers, setMatchedUsers] = useState<MatchedUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    ['#FD79A8', '#FDCB6E'],
    ['#00B894', '#00CEC9'],
    ['#74B9FF', '#0984E3'],
    ['#FAB1A0', '#E17055'],
    ['#A29BFE', '#6C5CE7'],
    ['#FF7675', '#FD79A8'],
  ];

  // Fetch matches from API
  const fetchMatches = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const matches = await matchesAPI.getUserMatches(user.id);
      
      const formattedMatches: MatchedUser[] = matches.map((match, index) => ({
        id: match.id.toString(),
        matchPercentage: Math.round(match.compatibilityScore),
        gradientColors: gradientColors[index % gradientColors.length],
        name: `Kullanıcı ${match.id}`, // API'den gelen gerçek kullanıcı adı olacak
        age: 24, // API'den gelecek
        location: 'İzmir', // API'den gelecek
        lastActive: '2 dk önce', // API'den gelecek
        interests: match.keywords || ['Genel'], // API'den gelen keywords
        matchData: match,
      }));
      
      setMatchedUsers(formattedMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
      Alert.alert('Hata', 'Eşleşmeler yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load matches on component mount
  useEffect(() => {
    fetchMatches();
  }, [user?.id]);

  const handleCardPress = (match: MatchedUser) => {
    setSelectedMatch(match);
    setIsModalVisible(true);
  };

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
            <Text className="text-xl font-bold text-gray-800 text-center">Tüm Eşleşmeler</Text>
            <Text className="text-gray-500 text-sm text-center">{matchedUsers.length} eşleşme bulundu</Text>
          </View>
          <View className="w-8" />
        </View>

        {/* Filter buttons */}
        <View className="flex-row space-x-2">
          <TouchableOpacity 
            onPress={() => setSelectedFilter('all')}
            style={{
              flex: 1,
              backgroundColor: selectedFilter === 'all' ? '#000000' : 'rgba(255, 255, 255, 0.9)',
              paddingVertical: 8,
              borderRadius: 12,
              margin:5,
              borderWidth: 1,
              borderColor: selectedFilter === 'all' ? '#000000' : 'rgba(0, 0, 0, 0.1)',
            }}
          >
            <Text style={{
              color: selectedFilter === 'all' ? '#ffffff' : '#000000',
              textAlign: 'center',
              fontSize: 12,
              fontWeight: '600',
            }}>
              Tümü
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setSelectedFilter('online')}
            style={{
              flex: 1,
              backgroundColor: selectedFilter === 'online' ? '#000000' : 'rgba(255, 255, 255, 0.9)',
              paddingVertical: 8,
              borderRadius: 12,
              margin:5,
              borderWidth: 1,
              borderColor: selectedFilter === 'online' ? '#000000' : 'rgba(0, 0, 0, 0.1)',
            }}
          >
            <Text style={{
              color: selectedFilter === 'online' ? '#ffffff' : '#000000',
              textAlign: 'center',
              fontSize: 12,
              fontWeight: '600',
            }}>
              Çevrimiçi
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setSelectedFilter('recent')}
            style={{
              flex: 1,
              backgroundColor: selectedFilter === 'recent' ? '#000000' : 'rgba(255, 255, 255, 0.9)',
              paddingVertical: 8,
              borderRadius: 12,
              margin:5,
              borderWidth: 1,
              borderColor: selectedFilter === 'recent' ? '#000000' : 'rgba(0, 0, 0, 0.1)',
            }}
          >
            <Text style={{
              color: selectedFilter === 'recent' ? '#ffffff' : '#000000',
              textAlign: 'center',
              fontSize: 12,
              fontWeight: '600',
            }}>
              Yeni
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* All Matches Grid */}
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
            onRefresh={fetchMatches}
            tintColor="#667eea"
            colors={['#667eea']}
            progressViewOffset={Platform.OS === 'ios' ? 60 : 80}
            progressBackgroundColor="transparent"
          />
        }
      >
        {isLoading ? (
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
            flexWrap: 'wrap', 
            paddingHorizontal: 16, 
            paddingTop: 16,
            paddingLeft: 16,
            paddingRight: 16,
          }}>
            {matchedUsers.map((item, index) => (
              <Animated.View
                key={item.id}
                entering={FadeInUp.delay(index * 50).springify()}
                style={{ width: (width - 48) / 2, marginBottom: 20}}
              >
                <TouchableOpacity
                  onPress={() => handleCardPress(item)}
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
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Match Detail Modal */}
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
    </View>
  );
} 