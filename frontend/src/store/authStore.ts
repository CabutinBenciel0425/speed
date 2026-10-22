import type { User, ValidRole } from "@/types/user"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AuthStore {
  user: User | null
  activeRole: ValidRole | null
  isAuthenticated: boolean
  isVerified: boolean
  isLoading: boolean
  setAuth: (user: User, activeRole?: ValidRole) => void
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

      setAuth: (user, activeRole) => {
        const roles = Array.from(
          new Set(
            user.role.map((role) =>
              (role as string) === "User" ? "Customer" : role,
            ),
          ),
        ) as ValidRole[]
        const normalizedActiveRole =
          (activeRole as string | undefined) === "User"
            ? "Customer"
            : activeRole

        set({
          user: { ...user, role: roles },
          activeRole:
            normalizedActiveRole ?? (roles.length === 1 ? roles[0] : null),
          isAuthenticated: true,
          isVerified: user.isVerified,
          isLoading: false,
        })
      },
      setActiveRole: (role) => set({ activeRole: role }),
      setVerified: (isVerified) => set({ isVerified }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () =>
        set({
          user: null,
          activeRole: null,
          isAuthenticated: false,
          isVerified: false,
          isLoading: false,
        }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        activeRole: state.activeRole,
        isAuthenticated: state.isAuthenticated,
        isVerified: state.isVerified,
      }),
    },
  ),
)
