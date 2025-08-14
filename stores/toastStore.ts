import { create } from 'zustand';

interface ToastState {
  isVisible: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  isVisible: false,
  message: '',
  type: 'success',
  showToast: (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    set({ isVisible: true, message, type });
  },
  hideToast: () => {
    set({ isVisible: false });
  },
}));
