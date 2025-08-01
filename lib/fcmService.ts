import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { api } from './api';

class FCMService {
  async registerForPushNotifications() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Bildirim izni verilmedi');
        return null;
      }
      
      try {
        token = (await Notifications.getExpoPushTokenAsync({
          projectId: 'test-project-id', // Geçici test ID
        })).data;
      } catch (error) {
        console.error('Error getting push token:', error);
        return null;
      }
    } else {
      console.log('Fiziksel cihaz gerekli');
      return null;
    }

    return token;
  }

  async sendTokenToServer(userId: number, token: string) {
    try {
      await api.put(`/user/${userId}/fcm-token`, token);
      console.log('FCM token sent to server');
    } catch (error) {
      console.error('Error sending FCM token:', error);
    }
  }

  setupNotificationHandlers() {
    // Uygulama açıkken gelen bildirimler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Bildirime tıklandığında
    Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log('Notification clicked:', data);
      
      // Eşleşme sayfasına yönlendir
      if (data?.type === 'NEW_MATCH') {
        // Router ile yönlendirme
        // router.push('/matches');
      }
    });
  }
}

export const fcmService = new FCMService(); 