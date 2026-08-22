import type { User } from "@/types/user"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isVerified: boolean
  isLoading: boolean
  setAuth: (user: User) => void
  setVerified: (isVerified: boolean) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isVerified: false,
      isLoading: true,

      setAuth: (user) =>
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        }),
      setVerified: (isVerified) => set({ isVerified }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isVerified: state.isVerified,
      }),
    }
  )
)
