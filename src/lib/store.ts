import { create } from "zustand";

interface User {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: string;
  isVerified: boolean;
  avatarUrl: string | null;
  location: string | null;
}

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthModalOpen: boolean;
  authModalTab: "login" | "register";
  openAuthModal: (tab?: "login" | "register") => void;
  closeAuthModal: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  isAuthModalOpen: false,
  authModalTab: "login",
  openAuthModal: (tab = "login") =>
    set({ isAuthModalOpen: true, authModalTab: tab }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
}));
