import type { User, ValidRole } from "@/types/user"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AuthStore {
  user: User | null
  activeRole: ValidRole | null
  isAuthenticated: boolean
  isVerified: boolean
  isLoading: boolean
  setAuth: (user: User) => void
  setActiveRole: (role: ValidRole) => void
  setVerified: (isVerified: boolean) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      activeRole: null,
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
      setActiveRole: (role) => set({ activeRole: role }),
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
