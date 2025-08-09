import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Platform, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInLeft, FadeInUp, SlideInRight, SlideOutRight } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { matchesAPI, MatchResponse } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';

interface ChatUser {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  isOnline?: boolean;
  lastSeen?: string;
  matchData?: MatchResponse;
}

export default function ChatScreen() {
  const { user } = useAuthStore();
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('messages');
  const [acceptedMatches, setAcceptedMatches] = useState<ChatUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const params = useLocalSearchParams();

  // Eşleşmiş kullanıcıları getir
  const fetchAcceptedMatches = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const matches = await matchesAPI.getUserAcceptedMatches(user.id);
      
      const chatUsers: ChatUser[] = matches.map((match) => {
        // Diğer kullanıcının ID'sini bul
        const otherUserId = match.user1Id === user.id ? match.user2Id : match.user1Id;
        
        return {
          id: match.id.toString(),
          name: `%${Math.round(match.compatibilityScore)} Eşleşme`,
          lastMessage: 'Uzayda Yaşam Var Mı ?',
          timestamp: new Date(match.createdAt).toLocaleTimeString('tr-TR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          isOnline: true,
          matchData: match,
        };
      });
      
      setAcceptedMatches(chatUsers);
    } catch (error) {
      console.error('Error fetching accepted matches:', error);
      Alert.alert('Hata', 'Eşleşmeler yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  // Chat'e git
  const handleChatPress = (chatUser: ChatUser) => {
    if (chatUser.matchData) {
      router.push(`/chat/${chatUser.matchData.id}` as any);
    }
  };

  const openFriends = () => {
    setIsFriendsOpen(true);
  };

  const closeFriends = () => {
    setIsFriendsOpen(false);
  };

  useEffect(() => {
    fetchAcceptedMatches();
  }, [user?.id]);

  useEffect(() => {
    if (params.openFriends === 'true') {
      setIsFriendsOpen(true);
    } else {
      setIsFriendsOpen(false);
    }
  }, [params.openFriends]);

  const renderChatItem = ({ item, index }: { item: ChatUser; index: number }) => (
    <Animated.View
      entering={FadeInUp.delay(index * 100).springify()}
    >
      <LinearGradient
        colors={['#FBFBFB', '#F2F2F2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          marginHorizontal: 16,
          marginBottom: 8,
          borderRadius: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
          elevation: 1,
        }}
      >
        <TouchableOpacity 
          className="flex-row items-center py-4 px-4"
          onPress={() => handleChatPress(item)}
        >
          <View className="mr-4 relative">
            <View 
              className="w-14 h-14 rounded-full justify-center items-center"
              style={{ backgroundColor: getAvatarColor(item.name) }}
            >
              <Text className="text-3xl">
                {getAvatarEmoji(item.name)}
              </Text>
            </View>
            {/* Online/Offline Status Indicator */}
            <View 
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                item.isOnline ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
          </View>
          
          <View className="flex-1">
            <View className="flex-row justify-between items-center mb-2">
              <View className="flex-row items-center flex-1">
                <Text className="text-base font-semibold text-gray-900 mr-2">
                  {item.name}
                </Text>
                {!item.isOnline && item.lastSeen && (
                  <Text className="text-xs text-gray-400">
                    {item.lastSeen}
                  </Text>
                )}
              </View>
              <Text className="text-xs text-gray-500">
                {item.timestamp}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="flex-1 text-sm text-gray-600 mr-3" numberOfLines={1}>
                {item.lastMessage}
              </Text>
              {item.unreadCount ? (
                <View className="bg-red-500 rounded-full min-w-5 h-5 justify-center items-center">
                  <Text className="text-xs font-bold text-white">
                    {item.unreadCount}
                  </Text>
                </View>
              ) : (
                <View className="w-6 h-6 justify-center items-center">
                  <Text className="text-green-500 text-lg">✓</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );

  const renderFriendItem = ({ item, index }: { item: ChatUser; index: number }) => (
    <Animated.View
      entering={SlideInRight.delay(index * 50).springify()}
    >
      <TouchableOpacity className="flex-row items-center py-3 px-4 mb-2 mx-4 bg-white rounded-2xl shadow-sm"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View className="mr-4 relative">
          <View 
            className="w-12 h-12 rounded-full justify-center items-center"
            style={{ backgroundColor: getAvatarColor(item.name) }}
          >
            <Text className="text-xl">
              {getAvatarEmoji(item.name)}
            </Text>
          </View>
          {/* Online/Offline Status Indicator for Friends */}
          <View 
            className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
              item.isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
            {item.name}
          </Text>
          {!item.isOnline && item.lastSeen && (
            <Text className="text-xs text-gray-400">
              {item.lastSeen}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const getAvatarColor = (name: string) => {
    const colors = ['#bbf5c8', '#d6ceff', '#c2ecf5', '#d9d3f3', '#febab6', '#d9d9d9', '#d9d9d9', '#d9d9d9'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const renderEmptyState = () => (
    <Animated.View 
      entering={FadeInUp.delay(200).springify()}
      className="flex-1 justify-center items-center px-8"
    >
      <View className="w-24 h-24 rounded-full bg-gray-100 justify-center items-center mb-6">
      <Text style={{ fontSize: 22 }}>👤</Text>
      </View>
      
      <Text className="text-xl font-semibold text-gray-700 text-center mb-2">
        Henüz mesajınız yok
      </Text>
      
      <Text className="text-base text-gray-500 text-center mb-8 leading-6">
        Yeni arkadaşlar ekleyerek sohbet etmeye başlayın veya mevcut arkadaşlarınızla iletişime geçin
      </Text>
      
      <TouchableOpacity className="bg-black px-8 py-4 rounded-full">
        <Text className="text-white font-semibold text-center">
          İlk Mesajınızı Gönderin
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const getAvatarEmoji = (name: string) => {
    return user?.gender === 'MALE' ? '👩' : '👨'
  };

  return (
    <Animated.View 
      entering={FadeInLeft.springify()}
      className="flex-1 bg-white"
    >
      {/* Top Bar - New Header with Tabs */}
      <LinearGradient
        colors={['#FFFFFF', '#F3F4F6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ 
          paddingTop: Platform.OS === 'ios' ? 60 : 30,
          paddingBottom: 16,
          paddingHorizontal: 16,
          borderBottomWidth: 0,
          borderBottomColor: '#E5E7EB'
        }}
      >
        {/* Header with Avatar, Tabs, and Notification - All in one row */}
        <View className="flex-row justify-between items-center">
          {/* Left - Avatar */}
          <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center">
            <Text className="text-white text-lg">{user?.gender === 'MALE' ? '👨' : '👩'}</Text>
          </View>
          
          {/* Center - Tab Navigation */}
          <View className="flex-row bg-gray-100 rounded-full p-0">
            <TouchableOpacity 
              className={`px-9 py-3 rounded-full ${activeTab === 'messages' ? 'bg-black' : 'bg-transparent'}`}
              onPress={() => setActiveTab('messages')}
            >
              <Text 
                className={`text-sm font-medium ${activeTab === 'messages' ? 'text-white' : 'text-gray-600'}`}
                style={{ fontFamily: 'Inter' }}
              >
                Mesajlar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className={`px-9 py-3 rounded-full ${activeTab === 'groups' ? 'bg-black' : 'bg-transparent'}`}
              onPress={() => setActiveTab('groups')}
            >
              <Text 
                className={`text-sm font-medium ${activeTab === 'groups' ? 'text-white' : 'text-gray-600'}`}
                style={{ fontFamily: 'Inter' }}
              >
                Gruplar
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Right - Notification Icon */}
          <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-200 justify-center items-center">
            <IconSymbol size={18} name="notifications-fill" color="#6B7280" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Chat List or Empty State */}
      <LinearGradient
        colors={['#FFFFFF', '#F3F4F6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1 }}
      >
        {acceptedMatches.length > 0 ? (
          <FlatList
            data={acceptedMatches}
            renderItem={renderChatItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingTop: 10, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          renderEmptyState()
        )}
      </LinearGradient>
      
      {/* Floating Action Button */}
      <Animated.View
        entering={FadeInUp.delay(500).springify()}
      >
        <TouchableOpacity className="absolute right-5 bottom-30 w-14 h-14 rounded-full bg-red-500 justify-center items-center shadow-lg">
          <IconSymbol size={24} name="plus" color="white" />
        </TouchableOpacity>
      </Animated.View>

      {/* Friends Sidebar Overlay */}
      {isFriendsOpen && (
        <TouchableOpacity 
          className="absolute inset-0 bg-black bg-opacity-50 z-10"
          onPress={closeFriends} 
        />
      )}

      {/* Friends Sidebar */}
      {isFriendsOpen && (
        <Animated.View 
          entering={SlideInRight.springify()}
          exiting={SlideOutRight.springify()}
          className="absolute top-0 right-0 w-1/2 h-full bg-white z-20 shadow-lg"
        >
          <View className="flex-row justify-between items-center px-3 py-4 pt-20 border-b border-gray-200">
            <ThemedText className="text-lg font-bold">Arkadaşlar</ThemedText>
            <TouchableOpacity 
              className="w-8 h-8 rounded-full bg-gray-100 justify-center items-center"
              onPress={closeFriends}
            >
              <ThemedText className="text-sm text-gray-600">✕</ThemedText>
            </TouchableOpacity>
          </View>
          
          <View className="flex-1 bg-white">
            <FlatList
              data={acceptedMatches} // Use acceptedMatches for friends
              renderItem={renderFriendItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingTop: 10, paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
}
