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

export interface GroupChatMessage {
  userId: number;
  groupId: number;
  message: string;
  type: 'CHAT';
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
  private groupMessageCallbacks: ((message: GroupChatMessage) => void)[] = [];
  private connectionCallbacks: ((connected: boolean) => void)[] = [];
  private userId: number | null = null;
  private otherUserId: number | null = null;
  private currentGroupId: number | null = null;

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

  async connectToGroup(userId: number, groupId: number): Promise<void> {
    this.userId = userId;
    this.currentGroupId = groupId;
    
    if (!this.client) {
      this.client = new Client({
        webSocketFactory: () => new SockJS(config.WS_URL),
        debug: function (str) {
          console.log('STOMP Debug:', str);
        },
        onConnect: () => {
          console.log('Connected to WebSocket for group chat');
          this.isConnected = true;
          this.notifyConnectionChange(true);
          this.subscribeToGroupChannel();
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
    } else if (this.client.connected) {
      this.subscribeToGroupChannel();
    }
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

  private subscribeToGroupChannel(): void {
    if (!this.client || !this.userId || !this.currentGroupId) return;

    const channelName = `group-chat-${this.currentGroupId}`;

    const subscription = this.client.subscribe(
      `/topic/${channelName}`,
      (message: Message) => {
        try {
          const groupChatMessage: GroupChatMessage = JSON.parse(message.body);
          console.log('Received group message:', groupChatMessage);
          this.notifyGroupMessageReceived(groupChatMessage);
        } catch (error) {
          console.error('Error parsing group message:', error);
        }
      }
    );

    console.log('Subscribed to group chat channel:', `/topic/${channelName}`);
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

  async sendGroupMessage(groupChatMessage: GroupChatMessage): Promise<void> {
    if (!this.client) {
      throw new Error('WebSocket client not initialized');
    }
    if (!this.client.connected) {
      throw new Error('There is no underlying STOMP connection');
    }

    try {
      console.log('Attempting to send group message, isConnected:', this.isConnected);
      this.client.publish({
        destination: '/app/group-chat/sendMessage',
        body: JSON.stringify(groupChatMessage)
      });
      console.log('Group message sent:', groupChatMessage);
    } catch (error) {
      console.error('Error sending group message:', error);
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
    this.otherUserId = null;
    this.currentGroupId = null;
    this.notifyConnectionChange(false);
  }

  disconnectFromGroup(): void {
    this.currentGroupId = null;
    // Keep the WebSocket connection active for other uses
  }

  // Event listeners
  onMessage(callback: (message: ChatMessage) => void): void {
    this.messageCallbacks.push(callback);
  }

  onGroupMessage(callback: (message: GroupChatMessage) => void): void {
    this.groupMessageCallbacks.push(callback);
  }

  onConnectionChange(callback: (connected: boolean) => void): void {
    this.connectionCallbacks.push(callback);
  }

  private notifyMessageReceived(message: ChatMessage): void {
    this.messageCallbacks.forEach(callback => callback(message));
  }

  private notifyGroupMessageReceived(message: GroupChatMessage): void {
    this.groupMessageCallbacks.forEach(callback => callback(message));
  }

  private notifyConnectionChange(connected: boolean): void {
    this.connectionCallbacks.forEach(callback => callback(connected));
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const websocketService = new WebSocketService();
