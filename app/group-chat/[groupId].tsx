import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Easing,
    FlatList,
    Keyboard,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { groupChatAPI, GroupResponse, groupsAPI } from '../../lib/api';
import { GroupChatMessage, websocketService } from '../../lib/websocketService';
import { useAuthStore } from '../../stores/authStore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function GroupChatScreen() {
  const { groupId } = useLocalSearchParams();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<GroupChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [group, setGroup] = useState<GroupResponse | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Header expansion state
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
  const headerHeightAnimation = useRef(new Animated.Value(120)).current;
  const headerOpacityAnimation = useRef(new Animated.Value(0)).current;
  const headerMarginAnimation = useRef(new Animated.Value(40)).current;

  // Keyboard animation - Dinamik yükseklik
  const keyboardAnimation = useRef(new Animated.Value(0)).current;
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [listKeyboardHeight, setListKeyboardHeight] = useState(0);

  const toggleHeaderExpansion = () => {
    const newExpandedState = !isHeaderExpanded;
    setIsHeaderExpanded(newExpandedState);
    
    Animated.parallel([
      Animated.timing(headerHeightAnimation, {
        toValue: newExpandedState ? 200 : 120,
        duration: 300,
        useNativeDriver: false,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(headerOpacityAnimation, {
        toValue: newExpandedState ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(headerMarginAnimation, {
        toValue: newExpandedState ? 0 : 40,
        duration: 300,
        useNativeDriver: false,
        easing: Easing.out(Easing.cubic),
      })
    ]).start();
  };

  const handleKeyboardShow = (event: any) => {
    const keyboardHeight = event.endCoordinates.height;
    setKeyboardHeight(keyboardHeight);
    setListKeyboardHeight(keyboardHeight);
    
    Animated.timing(keyboardAnimation, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  };

  const handleKeyboardHide = (event: any) => {
    setListKeyboardHeight(0);
    Animated.timing(keyboardAnimation, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic), 
    }).start(() => {
      setKeyboardHeight(0);
    });
  };

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', handleKeyboardShow);
    const keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', handleKeyboardHide);

    return () => {
      keyboardWillShowListener?.remove();
      keyboardWillHideListener?.remove();
    };
  }, []);

  // Ana useEffect: Grup bilgilerini al, chat geçmişini yükle ve WebSocket bağlantısını kur
  useEffect(() => {
    if (!user?.id || !groupId) return;

    const initializeGroupChat = async () => {
      try {
        // 1. Grup bilgilerini al
        const groupData = await groupsAPI.getGroupById(Number(groupId));
        setGroup(groupData);

        // 2. Chat geçmişini yükle (grup chat için)
        setIsLoading(true);
        const history = await groupChatAPI.getGroupChatHistory(Number(groupId));
        setMessages(history);
        setIsLoading(false);

        // 3. WebSocket bağlantısını kur (grup chat için)
        await websocketService.connectToGroup(user.id, Number(groupId));
        setIsConnected(true);

        // 4. Mesaj dinleyicilerini ekle
        websocketService.onGroupMessage((message) => {
          setMessages(prev => [...prev, message]);
        });

        websocketService.onConnectionChange((connected) => {
          setIsConnected(connected);
        });

      } catch (error) {
        console.error('Error initializing group chat:', error);
        Alert.alert('Hata', 'Grup chat başlatılırken bir hata oluştu.');
        setIsLoading(false);
      }
    };

    initializeGroupChat();

    // Cleanup
    return () => {
      websocketService.disconnectFromGroup();
    };
  }, [user?.id, groupId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user?.id || !groupId) return;

    setIsSending(true);
    try {
      const chatMessage: GroupChatMessage = {
        userId: user.id,
        groupId: Number(groupId),
        message: newMessage.trim(),
        type: 'CHAT'
      };


      // WebSocket ile grup mesajı gönder
      await websocketService.sendGroupMessage(chatMessage);
      
      console.log('Message sent successfully via WebSocket');
      
      // Mesajı local state'e ekle (geçici olarak)
      setMessages(prev => [...prev, chatMessage]);
      setNewMessage('');

      // Mesaj listesini en alta kaydır
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (error) {
      console.error('Error sending group message:', error);
      Alert.alert('Hata', 'Mesaj gönderilirken bir hata oluştu.');
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({ item }: { item: GroupChatMessage }) => {
    const isMyMessage = item.userId === user?.id;
    
    return (
      <View className={`flex-row ${isMyMessage ? 'justify-end' : 'justify-start'} mb-3 px-4`}>
        <View 
          className={`max-w-[70%] px-4 py-3 rounded-2xl ${
            isMyMessage 
              ? 'bg-blue-500 rounded-br-md' 
              : 'bg-gray-200 rounded-bl-md'
          }`}
        >
          <Text 
            className={`text-sm ${
              isMyMessage ? 'text-white' : 'text-gray-800'
            }`}
          >
            {item.message}
          </Text>
          <Text 
            className={`text-xs mt-1 ${
              isMyMessage ? 'text-blue-100' : 'text-gray-500'
            }`}
          >
            {new Date().toLocaleTimeString('tr-TR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
      </View>
    );
  };

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

  return (
    <View className="flex-1 bg-white">
      {/* Header - Genişleyebilir ve animasyonlu */}
      <Animated.View 
        className="flex-row items-center justify-between border-b border-gray-200 px-4 py-3"
        style={{ 
          height: headerHeightAnimation,
          paddingTop: Platform.OS === 'ios' ? 60 : 48,
          zIndex: 1000,
          backgroundColor: 'white',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {/* Back button - Sol taraf */}
        <TouchableOpacity 
          onPress={() => router.back()}
          className="p-2"
          activeOpacity={0.7}
        >
          <IconSymbol size={30} name="chevron.left" color="black" />
        </TouchableOpacity>
        
        {/* Header content - Orta kısım, tıklanabilir */}
        <TouchableOpacity 
          onPress={toggleHeaderExpansion}
          className="flex-1 items-center"
          activeOpacity={0.8}
        >
          <Animated.View className="flex-row items-center justify-center"
            style={{
              marginTop: headerMarginAnimation
            }}
          >
            <View className="w-8 h-8 rounded-full bg-blue-100 justify-center items-center mr-2">
              <Text className="text-lg">
                {group ? getGroupIcon(group.groupCreationType) : '👥'}
              </Text>
            </View>
            <Text className="text-lg font-semibold text-gray-900">
              {group?.name || 'Grup'}
            </Text>
          </Animated.View>
          
          {/* Expandable details - Animasyonlu opacity */}
          <Animated.View 
            style={{ 
              opacity: headerOpacityAnimation,
              marginTop: 2,
              alignItems: 'center'
            }}
          >
            <Text className='text-sm text-gray-500 text-center'>
              {group ? `${getGroupTypeInTurkish(group.groupCreationType)} • ${group.region.city}` : 'Grup bilgileri yükleniyor...'}
            </Text>
            <View className="flex-row items-center justify-center mt-2">
              <Text className="text-xs text-gray-400">
                👥 {group?.currentMembers || 0}/{group?.maxMembers || 0} üye
              </Text>
              <Text className="text-xs text-gray-400 mx-2">•</Text>
              <Text className="text-xs text-gray-400">
                🕐 {group ? formatTime(group.startTime) : 'N/A'} - {group ? formatTime(group.endTime) : 'N/A'}
              </Text>
            </View>
          </Animated.View>
        </TouchableOpacity>

        {/* Right buttons - Sağ taraf */}
        <View className="flex-row space-x-2">
          <TouchableOpacity 
            className="bg-blue-500 rounded-full p-2"
            activeOpacity={0.7}
          >
            <IconSymbol size={20} name="person.2.fill" color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity>
            <IconSymbol size={24} name="ellipsis.vertical" color="#374151" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Messages ve Input - Birlikte animasyonlu (WhatsApp gibi) */}
      <Animated.View 
         className="flex-1"
         style={{
           transform: [{
             translateY: keyboardAnimation.interpolate({
               inputRange: [0, 1],
               outputRange: [0, -keyboardHeight], // Dinamik klavye yüksekliği kullan
             })
           }],
           zIndex: 1 ,
           paddingBottom: 15
         }}
       >
        {/* Messages */}
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-gray-500 mt-2">Grup mesajları yükleniyor...</Text>
          </View>
        ) : messages.length === 0 ? (
          <View className="flex-1 justify-center items-center px-8">
            <View className="w-24 h-24 rounded-full bg-gray-100 justify-center items-center mb-6">
              <Text style={{ fontSize: 22 }}>👥</Text>
            </View>
            
            <Text className="text-xl font-semibold text-gray-700 text-center mb-2">
              Henüz grup mesajı yok
            </Text>
            
            <Text className="text-base text-gray-500 text-center mb-8 leading-6">
              İlk mesajı göndererek grup sohbetini başlatın
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.message}
            className="flex-1"
            contentContainerStyle={{ 
              paddingVertical: 16
            }}
            contentInset={{
              top: listKeyboardHeight,
              bottom: 0,
              left: 0,
              right: 0
            }}
            inverted={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Input - Mesaj listesi ile birlikte hareket eder */}
        <View className="flex-row items-center px-4 py-3 border-t border-gray-200">
          <TextInput
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-3"
            placeholder="Grup mesajınızı yazın..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
            editable={isConnected}
          />
          
          <TouchableOpacity 
            onPress={sendMessage}
            disabled={!newMessage.trim() || isSending || !isConnected}
            className={`w-10 h-10 rounded-full justify-center items-center ${
              newMessage.trim() && !isSending && isConnected ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <IconSymbol size={20} name="paperplane.fill" color="white" />
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}