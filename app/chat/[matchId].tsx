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
import { chatAPI, matchesAPI, MatchResponse } from '../../lib/api';
import { ChatMessage, websocketService } from '../../lib/websocketService';
import { useAuthStore } from '../../stores/authStore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ChatScreen() {
  const { matchId } = useLocalSearchParams();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [otherUserId, setOtherUserId] = useState<number | null>(null);
  const [match, setMatch] = useState<MatchResponse | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Keyboard animation - Dinamik yükseklik
  const keyboardAnimation = useRef(new Animated.Value(0)).current;
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [listKeyboardHeight, setListKeyboardHeight] = useState(0);

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

  // Ana useEffect: Match bilgilerini al, chat geçmişini yükle ve WebSocket bağlantısını kur
  useEffect(() => {
    if (!user?.id || !matchId) return;

    const initializeChat = async () => {
      try {
        // 1. Match bilgilerini al ve diğer kullanıcının ID'sini bul
        const match = await matchesAPI.getMatchById(Number(matchId));
        const otherUserId = match.user1Id === user.id ? match.user2Id : match.user1Id;
        setOtherUserId(otherUserId);
        setMatch(match);

        // 2. Chat geçmişini yükle
        setIsLoading(true);
        const history = await chatAPI.getChatHistory(user.id, otherUserId);
        setMessages(history);
        setIsLoading(false);

        // 3. WebSocket bağlantısını kur
        await websocketService.connect(user.id, otherUserId);
        setIsConnected(true);

        // 4. Mesaj dinleyicilerini ekle
        websocketService.onMessage((message) => {
          setMessages(prev => [...prev, message]);
        });

        websocketService.onConnectionChange((connected) => {
          setIsConnected(connected);
        });

      } catch (error) {
        console.error('Error initializing chat:', error);
        Alert.alert('Hata', 'Chat başlatılırken bir hata oluştu.');
        setIsLoading(false);
      }
    };

    initializeChat();

    // Cleanup
    return () => {
      websocketService.disconnect();
    };
  }, [user?.id, matchId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user?.id || !otherUserId || !isConnected) return;

    setIsSending(true);
    try {
      const chatMessage = {
        messageId: Date.now().toString(), // Geçici ID
        senderId: user.id,
        receiverId: otherUserId,
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
        type: 'CHAT' as const
      };

      console.log(chatMessage);

      // WebSocket ile mesaj gönder
      await websocketService.sendMessage(chatMessage);
      
      // Mesajı local state'e ekleme - sadece WebSocket'ten gelen mesajları dinle
      setNewMessage('');

      // Mesaj listesini en alta kaydır
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Hata', 'Mesaj gönderilirken bir hata oluştu.');
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMyMessage = item.senderId === user?.id;
    
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
            {item.content}
          </Text>
          <Text 
            className={`text-xs mt-1 ${
              isMyMessage ? 'text-blue-100' : 'text-gray-500'
            }`}
          >
            {new Date(item.timestamp).toLocaleTimeString('tr-TR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
      </View>
    );
  };

  const formatScore = (score: number): string => {
    return `${score.toFixed(1)}%`;
  };


  return (
    <View className="flex-1 bg-white">
      {/* Header - Sabit ve üstte */}
      <View 
        className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200"
        style={{ 
          paddingTop: Platform.OS === 'ios' ? 60 : 48,
          zIndex: 1000, // Header'ı en üstte tut
          backgroundColor: 'white' // Arka plan rengi
        }}
      >
        <TouchableOpacity 
          onPress={() => router.back()}
          className="p-2 absolute left-2 top-[60px]"
          activeOpacity={0.7}
        >
          <IconSymbol size={30} name="chevron.left" color="black" />
        </TouchableOpacity>
        
        <View className="flex-1 items-center">
          <Text className="text-lg font-semibold text-gray-900">
            {match?.compatibilityScore ? formatScore(match.compatibilityScore) : 'Eşleşme'}
          </Text>
          <View>
            <Text className='text-sm text-gray-500'>
              {match?.commonTopic || 'Uzayda Yaşam Var Mı ?' }
            </Text>
          </View>
          {/* 
          <View className="flex-row items-center">
            <View className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <Text className="text-sm text-gray-500">
              {isConnected ? 'Çevrimiçi' : 'Bağlantı yok'}
            </Text>
          </View>
          */}
        </View>
        <View className="absolute right-4 top-[65px] space-x-2">
          <TouchableOpacity 
            className="bg-blue-500 rounded-full p-2"
            activeOpacity={0.7}
          >
            <IconSymbol size={20} name="checkmark.seal.fill" color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity>
            <IconSymbol size={24} name="ellipsis.vertical" color="#374151" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity>
          <IconSymbol size={24} name="ellipsis.vertical" color="#374151" />
        </TouchableOpacity>
      </View>

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
            <Text className="text-gray-500 mt-2">Mesajlar yükleniyor...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.messageId}
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
            placeholder="Mesajınızı yazın..."
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