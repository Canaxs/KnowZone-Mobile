import { create } from 'zustand';

type Gender = 'MALE' | 'FEMALE';

interface OnboardingStore {
  hobbies: string[];
  interests: string[];
  idealPerson: string[];
  gender: Gender | null;
  setHobbies: (hobbies: string[]) => void;
  setInterests: (interests: string[]) => void;
  setIdealPerson: (idealPerson: string[]) => void;
  setGender: (gender: Gender) => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  hobbies: [],
  interests: [],
  idealPerson: [],
  gender: null,
  setHobbies: (hobbies) => set({ hobbies }),
  setInterests: (interests) => set({ interests }),
  setIdealPerson: (idealPerson) => set({ idealPerson }),
  setGender: (gender) => set({ gender }),
  resetOnboarding: () => set({ hobbies: [], interests: [], idealPerson: [] , gender: null}),
})); 