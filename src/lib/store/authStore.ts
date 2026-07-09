// Design Ref: §9.4 Application layer — client-side auth state (Zustand)

import { create } from 'zustand';

import type { Profile, SchoolProfile } from '@/types/domain';

type AuthState = {
  profile: Profile | null;
  schoolProfile: SchoolProfile | null;
  setProfile: (profile: Profile | null) => void;
  setSchoolProfile: (schoolProfile: SchoolProfile | null) => void;
  updateCredits: (credits: number) => void;
  reset: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  profile: null,
  schoolProfile: null,
  setProfile: (profile) => set({ profile }),
  setSchoolProfile: (schoolProfile) => set({ schoolProfile }),
  updateCredits: (credits) =>
    set((state) => (state.profile ? { profile: { ...state.profile, credits } } : state)),
  reset: () => set({ profile: null, schoolProfile: null }),
}));

export const hasSchoolProfile = (state: AuthState) => state.schoolProfile !== null;
