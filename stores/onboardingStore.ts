import { create } from 'zustand';

interface OnboardingStore {
  hobbies: string[];
  interests: string[];
  idealPerson: string[];
  setHobbies: (hobbies: string[]) => void;
  setInterests: (interests: string[]) => void;
  setIdealPerson: (idealPerson: string[]) => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  hobbies: [],
  interests: [],
  idealPerson: [],
  setHobbies: (hobbies) => set({ hobbies }),
  setInterests: (interests) => set({ interests }),
  setIdealPerson: (idealPerson) => set({ idealPerson }),
  resetOnboarding: () => set({ hobbies: [], interests: [], idealPerson: [] }),
})); 