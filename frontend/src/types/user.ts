export type ValidRole = "Customer" | "Merchant" | "Driver" | "Admin"

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  role: ValidRole[]
  avatar: string
  isVerified: true
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}
