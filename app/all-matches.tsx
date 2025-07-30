import { IconSymbol } from '@/components/ui/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Dimensions, FlatList, Modal, Platform, Pressable, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

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
}

export default function AllMatchesScreen() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedMatch, setSelectedMatch] = useState<MatchedUser | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const matchedUsers: MatchedUser[] = [
    {
      id: '1',
      matchPercentage: 95,
      gradientColors: ['#667eea', '#764ba2'],
      name: 'Ayşe',
      age: 24,
      location: 'İzmir, Kordon',
      lastActive: '2 dk önce',
      interests: ['Kahve', 'Seyahat', 'Müzik'],
    },
    {
      id: '2',
      matchPercentage: 87,
      gradientColors: ['#f093fb', '#f5576c'],
      name: 'Zeynep',
      age: 26,
      location: 'İzmir, Alsancak',
      lastActive: '5 dk önce',
      interests: ['Teknoloji', 'Kitap', 'Yoga'],
    },
    {
      id: '3',
      matchPercentage: 92,
      gradientColors: ['#4facfe', '#00f2fe'],
      name: 'Elif',
      age: 23,
      location: 'İzmir, Bornova',
      lastActive: '1 dk önce',
      interests: ['Spor', 'Film', 'Fotoğraf'],
    },
    {
      id: '4',
      matchPercentage: 89,
      gradientColors: ['#43e97b', '#38f9d7'],
      name: 'Merve',
      age: 25,
      location: 'İzmir, Karşıyaka',
      lastActive: '10 dk önce',
      interests: ['Sanat', 'Dans', 'Kahve'],
    },
    {
      id: '5',
      matchPercentage: 91,
      gradientColors: ['#FD79A8', '#FDCB6E'],
      name: 'Deniz',
      age: 27,
      location: 'İzmir, Konak',
      lastActive: '3 dk önce',
      interests: ['Müzik', 'Seyahat', 'Yemek'],
    },
    {
      id: '6',
      matchPercentage: 73,
      gradientColors: ['#00B894', '#00CEC9'],
      name: 'Selin',
      age: 22,
      location: 'İzmir, Buca',
      lastActive: '15 dk önce',
      interests: ['Kitap', 'Yoga', 'Doğa'],
    },
    {
      id: '7',
      matchPercentage: 88,
      gradientColors: ['#74B9FF', '#0984E3'],
      name: 'Büşra',
      age: 24,
      location: 'İzmir, Çiğli',
      lastActive: '7 dk önce',
      interests: ['Teknoloji', 'Spor', 'Film'],
    },
    {
      id: '8',
      matchPercentage: 69,
      gradientColors: ['#FAB1A0', '#E17055'],
      name: 'Gizem',
      age: 26,
      location: 'İzmir, Bayraklı',
      lastActive: '20 dk önce',
      interests: ['Sanat', 'Müzik', 'Kahve'],
    },
    {
      id: '9',
      matchPercentage: 84,
      gradientColors: ['#A29BFE', '#6C5CE7'],
      name: 'Esra',
      age: 23,
      location: 'İzmir, Gaziemir',
      lastActive: '4 dk önce',
      interests: ['Dans', 'Film', 'Seyahat'],
    },
    {
      id: '10',
      matchPercentage: 76,
      gradientColors: ['#FF7675', '#FD79A8'],
      name: 'Melis',
      age: 25,
      location: 'İzmir, Narlıdere',
      lastActive: '12 dk önce',
      interests: ['Yoga', 'Kitap', 'Doğa'],
    },
    {
      id: '11',
      matchPercentage: 89,
      gradientColors: ['#00B894', '#00CEC9'],
      name: 'İrem',
      age: 24,
      location: 'İzmir, Urla',
      lastActive: '1 dk önce',
      interests: ['Yemek', 'Seyahat', 'Fotoğraf'],
    },
    {
      id: '12',
      matchPercentage: 71,
      gradientColors: ['#74B9FF', '#0984E3'],
      name: 'Sude',
      age: 26,
      location: 'İzmir, Foça',
      lastActive: '8 dk önce',
      interests: ['Spor', 'Müzik', 'Teknoloji'],
    },
  ];

  const handleCardPress = (match: MatchedUser) => {
    setSelectedMatch(match);
    setIsModalVisible(true);
  };

  const handleAccept = () => {
    setIsModalVisible(false);
    setSelectedMatch(null);
  };

  const handleReject = () => {
    setIsModalVisible(false);
    setSelectedMatch(null);
  };

  const renderMatchCard = ({ item, index }: { item: MatchedUser; index: number }) => (
    <Animated.View
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
          margin:5,
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
  );

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
      <FlatList
        data={matchedUsers}
        renderItem={renderMatchCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ 
          paddingHorizontal: 16, 
          paddingTop: 16, 
          paddingBottom: 100,
          paddingLeft: 16,
          paddingRight: 16,
        }}
        showsVerticalScrollIndicator={false}
      />

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