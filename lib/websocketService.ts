import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { config } from './config';

export interface ChatMessage {
  messageId: string;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
  type: 'CHAT' | 'JOIN' | 'LEAVE' | 'MATCH_NOTIFICATION';
}

export interface MessageData {
  senderId: number;
  receiverId: number;
  content: string;
  type: 'CHAT' | 'SYSTEM' | 'JOIN';
}

class WebSocketService {
  private client: Client | null = null;
  private isConnected: boolean = false;
  private messageCallbacks: ((message: ChatMessage) => void)[] = [];
  private connectionCallbacks: ((connected: boolean) => void)[] = [];
  private userId: number | null = null;
  private otherUserId: number | null = null;

  async connect(userId: number, otherUserId: number): Promise<void> {
    this.userId = userId;
    this.otherUserId = otherUserId || null;
    
    this.client = new Client({
      webSocketFactory: () => new SockJS(config.WS_URL),
      debug: function (str) {
        console.log('STOMP Debug:', str);
      },
      onConnect: () => {
        console.log('Connected to WebSocket');
        this.isConnected = true;
        this.notifyConnectionChange(true);
        if (this.otherUserId) {
          this.subscribeToChatChannel();
        }
      },
      onDisconnect: () => {
        console.log('Disconnected from WebSocket');
        this.isConnected = false;
        this.notifyConnectionChange(false);
      },
      onStompError: error => {
        console.error('Stomp error:', error);
        this.isConnected = false;
        this.notifyConnectionChange(false);
      }
    });
    this.client.activate();

  }

  private subscribeToChatChannel(): void {
    if (!this.client || !this.userId || !this.otherUserId) return;

    // Tutarlı kanal adı oluştur: küçük ID'den büyük ID'ye
    const [smallerId, largerId] = [this.userId, this.otherUserId].sort((a, b) => a - b);
    const channelName = `chat-${smallerId}-${largerId}`;

    const subscription = this.client.subscribe(
      `/topic/${channelName}`,
      (message: Message) => {
        try {
          const chatMessage: ChatMessage = JSON.parse(message.body);
          console.log('Received message:', chatMessage);
          this.notifyMessageReceived(chatMessage);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      }
    );

    console.log('Subscribed to chat channel:', `/topic/${channelName}`);
  }

  async sendMessage(chatMessage: ChatMessage): Promise<void> {
    if (!this.client) {
      throw new Error('WebSocket client not initialized');
    }
    if (!this.client.connected) {
      throw new Error('There is no underlying STOMP connection');
    }

    try {
      console.log('Attempting to send message, isConnected:', this.isConnected);
      this.client.publish({
        destination: '/app/chat/sendMessage',
        body: JSON.stringify(chatMessage)
      });
      console.log('Message sent:', chatMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
    this.isConnected = false;
    this.userId = null;
    this.notifyConnectionChange(false);
  }

  // Event listeners
  onMessage(callback: (message: ChatMessage) => void): void {
    this.messageCallbacks.push(callback);
  }

  onConnectionChange(callback: (connected: boolean) => void): void {
    this.connectionCallbacks.push(callback);
  }

  private notifyMessageReceived(message: ChatMessage): void {
    this.messageCallbacks.forEach(callback => callback(message));
  }

  private notifyConnectionChange(connected: boolean): void {
    this.connectionCallbacks.forEach(callback => callback(connected));
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const websocketService = new WebSocketService();
