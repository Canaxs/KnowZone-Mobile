import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Platform, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInLeft, FadeInUp, SlideInRight, SlideOutRight } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { GroupResponse, groupsAPI, matchesAPI, MatchResponse } from '../../lib/api';
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

interface UserGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  maxMembers: number;
  category: string;
  location: string;
  startTime: string;
  endTime: string;
  groupData: GroupResponse;
}

export default function ChatScreen() {
  const { user } = useAuthStore();
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('messages');
  const [acceptedMatches, setAcceptedMatches] = useState<ChatUser[]>([]);
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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
          lastMessage: match.commonTopic || 'Uzayda Yaşam Var Mı ?',
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

  // Grup detaylarına git
  const handleGroupPress = (userGroup: UserGroup) => {
    Alert.alert(
      'Grup Detayları',
      `${userGroup.name}\n\n${userGroup.description}\n\nKonum: ${userGroup.location}\nSaat: ${userGroup.startTime} - ${userGroup.endTime}\nÜyeler: ${userGroup.memberCount}/${userGroup.maxMembers}`,
      [
        { text: 'Kapat', style: 'cancel' },
        { 
          text: 'Gruba Git', 
          onPress: () => {
            // Grup chat sayfasına yönlendirS
            router.push(`/group-chat/${userGroup.id}` as any);
          }
        }
      ]
    );
  };

  // Grup mesajlarına git
  const handleGroupMessagePress = (userGroup: UserGroup) => {
    // Grup chat sayfasına git
    router.push(`/group-chat/${userGroup.id}` as any);
  };

  // Kullanıcının gruplarını getir
  const fetchUserGroups = async () => {
    if (!user?.id) return;
    
    try {
      const groups = await groupsAPI.getUserGroups();
      
      const formattedGroups: UserGroup[] = groups.map((group) => {
        return {
          id: group.id.toString(),
          name: group.name,
          description: group.description,
          memberCount: group.currentMembers,
          maxMembers: group.maxMembers,
          category: getGroupTypeInTurkish(group.groupCreationType),
          location: `${group.region.city}, ${group.region.name}`,
          startTime: formatTime(group.startTime),
          endTime: formatTime(group.endTime),
          groupData: group,
        };
      });
      
      setUserGroups(formattedGroups);
    } catch (error) {
      console.error('Error fetching user groups:', error);
      Alert.alert('Hata', 'Gruplar yüklenirken bir hata oluştu.');
    }
  };

  // Grup türünü Türkçe'ye çevir
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

  // Zamanı formatla
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

  // Refresh fonksiyonu
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Her iki tab için de verileri yenile
      await Promise.all([
        fetchAcceptedMatches(),
        fetchUserGroups()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
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
    fetchUserGroups();
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
      <TouchableOpacity 
        className="mx-4 mb-3"
        onPress={() => handleChatPress(item)}
        style={{ minHeight: 44 }}
      >
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            paddingTop: 14,
            paddingBottom: 14,
            paddingRight: 16,
            paddingLeft: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 4,
            borderWidth: 1,
            borderColor: '#F1F5F9',
          }}
        >
          <View className="flex-row items-center">
            {/* Avatar with border */}
            <View className="mr-4">
              <View 
                className="w-14 h-14 rounded-full justify-center items-center"
                style={{ 
                  backgroundColor: getAvatarColor(item.name),
                  borderWidth: 2,
                  borderColor: '#E5E7EB',
                }}
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
            
            {/* Content */}
            <View className="flex-1 mr-3">
              <View className="mb-2">
                <Text className="text-base font-bold text-gray-900 mb-1">
                  {item.name}
                </Text>
                <Text className="text-sm text-gray-600" numberOfLines={2}>
                  {item.lastMessage}
                </Text>
              </View>
            </View>
            
            {/* Right side - Time and Read status */}
            <View className="items-end justify-between" style={{ minHeight: 44 }}>
              <Text className="text-xs text-gray-500 mb-2">
                {item.timestamp}
              </Text>
              {item.unreadCount ? (
                <View className="bg-red-500 rounded-full min-w-5 h-5 justify-center items-center">
                  <Text className="text-xs font-bold text-white">
                    {item.unreadCount}
                  </Text>
                </View>
              ) : (
                <View className="w-4 h-4 justify-center items-center">
                  <Text className="text-green-500 text-sm">✓</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderGroupItem = ({ item, index }: { item: UserGroup; index: number }) => (
    <Animated.View
      entering={FadeInUp.delay(index * 100).springify()}
    >
      <View className="mx-4 mb-3">
        {/* Grup Ana Kartı */}
        <TouchableOpacity 
          className="bg-white rounded-2xl p-3 shadow-sm mb-1"
          onPress={() => router.push(`/group-chat/${item.id}` as any)}
          style={{ minHeight: 44 }}
        >
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-blue-100 justify-center items-center mr-4">
              <Text className="text-xl">{item.category === 'Günlük Program' ? '📅' : '⚡'}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
                {item.name}
              </Text>
              <Text className="text-sm text-gray-500" numberOfLines={1}>
                {item.category} • {item.location}
              </Text>
              <Text className="text-xs text-gray-400 mt-1">
                👥 {item.memberCount}/{item.maxMembers} üye
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderFriendItem = ({ item, index }: { item: ChatUser; index: number }) => (
    <Animated.View
      entering={SlideInRight.delay(index * 50).springify()}
    >
      <TouchableOpacity 
        className="mx-4 mb-3 bg-white rounded-2xl"
        style={{
          padding: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
          minHeight: 44,
        }}
      >
        <View className="flex-row items-center">
          <View className="mr-4 relative">
            <View 
              className="w-12 h-12 rounded-full justify-center items-center"
              style={{ 
                backgroundColor: getAvatarColor(item.name),
                borderWidth: 2,
                borderColor: '#E5E7EB',
              }}
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
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const getAvatarColor = (name: string) => {
    const colors = ['#bbf5c8', '#d6ceff', '#c2ecf5', '#d9d3f3', '#febab6', '#d9d9d9', '#d9d9d9', '#d9d9d9'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const renderEmptyState = () => {
    if (activeTab === 'messages') {
      return (
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
    } else {
      return (
        <Animated.View 
          entering={FadeInUp.delay(200).springify()}
          className="flex-1 justify-center items-center px-8"
        >
          <View className="w-24 h-24 rounded-full bg-gray-100 justify-center items-center mb-6">
            <Text style={{ fontSize: 22 }}>👥</Text>
          </View>
          
          <Text className="text-xl font-semibold text-gray-700 text-center mb-2">
            Henüz grubunuz yok
          </Text>
          
          <Text className="text-base text-gray-500 text-center mb-8 leading-6">
            Yeni gruplar oluşturun veya mevcut gruplara katılarak sosyalleşmeye başlayın
          </Text>
          
          <TouchableOpacity className="bg-black px-8 py-4 rounded-full">
            <Text className="text-white font-semibold text-center">
              Gruba Katılın
            </Text>
          </TouchableOpacity>
        </Animated.View>
      );
    }
  };

  const getAvatarEmoji = (name: string) => {
    return user?.gender === 'MALE' ? '👩' : '��'
  };

  return (
    <Animated.View 
      entering={FadeInLeft.springify()}
      className="flex-1 bg-white"
    >
      {/* Top Bar - New Header with Tabs */}
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ 
          paddingTop: Platform.OS === 'ios' ? 60 : 30,
          paddingBottom: 16,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#F1F5F9'
        }}
      >
        {/* Header with Avatar, Tabs, and Notification - All in one row */}
        <View className="flex-row justify-between items-center">
          {/* Left - Avatar */}
          <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center">
            <Text className="text-white text-lg">{user?.gender === 'MALE' ? '👨' : '��'}</Text>
          </View>
          
          {/* Center - Tab Navigation */}
          <View 
            className="flex-row bg-gray-100 rounded-full p-0"
            style={{
              borderRadius: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <TouchableOpacity 
              className="px-6 py-3 rounded-full"
              onPress={() => setActiveTab('messages')}
              style={{ minHeight: 40, minWidth: 44 }}
            >
              {activeTab === 'messages' ? (
                <LinearGradient
                  colors={['#3a3d40', '#606163']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: 20,
                  }}
                />
              ) : null}
              <Text 
                className={`text-sm font-medium ${activeTab === 'messages' ? 'text-white' : 'text-gray-600'}`}
                style={{ fontFamily: 'Inter' }}
              >
                Mesajlar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="px-6 py-3 rounded-full"
              onPress={() => setActiveTab('groups')}
              style={{ minHeight: 40, minWidth: 44 }}
            >
              {activeTab === 'groups' ? (
                <LinearGradient
                  colors={['#3a3d40', '#606163']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: 20,
                  }}
                />
              ) : null}
              <Text 
                className={`text-sm font-medium ${activeTab === 'groups' ? 'text-white' : 'text-gray-600'}`}
                style={{ fontFamily: 'Inter' }}
              >
                Gruplar
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Right - Notification Icon */}
          <TouchableOpacity 
            className="w-10 h-10 rounded-full bg-gray-200 opacity-60 justify-center items-center"
            style={{ minHeight: 44, minWidth: 44 }}
          >
            <IconSymbol size={18} name="notifications-fill" color="#6B7280" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content based on active tab */}
      <View className="flex-1 bg-gray-50">
        {activeTab === 'messages' ? (
          // Messages Tab
          acceptedMatches.length > 0 ? (
            <FlatList
              data={acceptedMatches}
              renderItem={renderChatItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingTop: 12, paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#667eea"
                  colors={['#667eea']}
                  progressViewOffset={Platform.OS === 'ios' ? 60 : 80}
                  progressBackgroundColor="transparent"
                />
              }
            />
          ) : (
            renderEmptyState()
          )
        ) : (
          // Groups Tab
          userGroups.length > 0 ? (
            <FlatList
              data={userGroups}
              renderItem={renderGroupItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingTop: 12, paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#667eea"
                  colors={['#667eea']}
                  progressViewOffset={Platform.OS === 'ios' ? 60 : 80}
                  progressBackgroundColor="transparent"
                />
              }
            />
          ) : (
            renderEmptyState()
          )
        )}
      </View>
      
      {/* Floating Action Button */}
      <Animated.View
        entering={FadeInUp.delay(500).springify()}
      >
        <TouchableOpacity 
          className="absolute right-5 bottom-30 w-14 h-14 rounded-full justify-center items-center"
          style={{ minHeight: 44, minWidth: 44 }}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#6A11CB', '#2575FC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 28,
              shadowColor: '#6A11CB',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
            }}
          />
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