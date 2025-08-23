import * as Location from 'expo-location';
import { LocationUpdateRequest, matchesAPI } from './api';

class BackgroundLocationService {
  private timer: number | null = null;
  private isRunning = false;
  private userId: number | null = null;
  private updateInterval = 300000; // 5 dakika
  private toastStore: any = null;

  setToastStore(store: any) {
    this.toastStore = store;
  }

  start(userId: number) {
    if (this.isRunning) return;
    
    this.userId = userId;
    this.isRunning = true;
    
    // Hemen bir kez çalıştır
    this.updateLocation();
    
    // Timer'ı başlat
    this.timer = setInterval(() => {
      this.updateLocation();
    }, this.updateInterval);
    
    console.log('Background location service started');
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    console.log('Background location service stopped');
  }

  private async updateLocation() {
    if (!this.userId) return;
    
    try {
      const location = await this.getCurrentLocation();
      if (!location) return;
    
      const locationData: LocationUpdateRequest = {
        latitude: location.latitude,
        longitude: location.longitude
      };
      
      const response = await matchesAPI.updateLocation(locationData);
      console.log('Background location updated successfully');
      
      if (response === true) {
        console.log('Match found! Showing success toast');
        if (this.toastStore) {
          this.toastStore.showToast('🎉 Yeni eşleşme bulundu!', 'success');
        }
      } else if (response === false) {
        console.log('No match found in nearby area');
        // False durumunda toast gösterme, sadece log
      }
    } catch (error) {
      console.error('Error updating background location:', error);
      
      if (this.toastStore) {
        this.toastStore.showToast('Konum güncellenirken hata oluştu', 'error');
      }
    }
  }

  private async getCurrentLocation() {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        if (newStatus !== 'granted') {
          return null;
        }
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
        distanceInterval: 50,
      });
      
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };
    } catch (error) {
      console.error('Error getting background location:', error);
      return null;
    }
  }
}

export const backgroundLocationService = new BackgroundLocationService();