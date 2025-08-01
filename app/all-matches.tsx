import { IconSymbol } from '@/components/ui/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
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
                style={{ width: (width - 48) / 2, marginBottom: 16 }}
              >
                <TouchableOpacity
                  onPress={() => handleCardPress(item)}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: 20,
                    padding: 16,
                    height: 120,
                    borderWidth: 1,
                    margin: 5,
                    borderColor: 'rgba(255, 255, 255, 0.9)',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    elevation: 4,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
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
                    <Text className="text-white text-2xl font-bold">{item.matchPercentage}%</Text>
                  </LinearGradient>
                  <Text className="text-gray-600 text-sm font-medium">Eşleşme</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Match Detail Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <Pressable 
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => setIsModalVisible(false)}
        >
          <Pressable 
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 24,
              padding: 24,
              margin: 20,
              width: width - 40,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.25,
              shadowRadius: 20,
              elevation: 10,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Match Card in Modal */}
            {selectedMatch && (
              <View style={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: 20,
                padding: 20,
                height: 140,
                borderWidth: 1,
                margin: 5,
                borderColor: 'rgba(255, 255, 255, 0.9)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 4,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 24,
              }}>
                <LinearGradient
                  colors={selectedMatch.gradientColors as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 8,
                  }}
                >
                  <Text className="text-white text-3xl font-bold">{selectedMatch.matchPercentage}%</Text>
                </LinearGradient>
                <Text className="text-gray-600 text-base font-medium">Eşleşme</Text>
              </View>
            )}

            {/* Action Buttons */}
            <View className="flex-row space-x-3 w-full">
              <TouchableOpacity 
                onPress={handleReject}
                style={{
                  flex: 1,
                  backgroundColor: '#ff4757',
                  paddingVertical: 14,
                  borderRadius: 16,
                  alignItems: 'center',
                  shadowColor: '#ff4757',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  margin: 5,
                  elevation: 6,
                }}
              >
                <Text className="text-white font-bold text-base">Reddet</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleAccept}
                style={{
                  flex: 1,
                  backgroundColor: '#2ed573',
                  paddingVertical: 14,
                  borderRadius: 16,
                  alignItems: 'center',
                  shadowColor: '#2ed573',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  margin: 5,
                  elevation: 6,
                }}
              >
                <Text className="text-white font-bold text-base">Kabul Et</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
} 