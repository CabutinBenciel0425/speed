export type AdminSection =
  | "users"
  | "merchants"
  | "drivers"
  | "orders"
  | "products"
  | "reviews"
  | "categories"

export type AdminRecord = Record<string, unknown> & { _id: string }

export type AdminSummary = {
  totalCustomer: number
  totalMerchants: number
  totalDrivers: number
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  cancelledOrders: number
  totalProducts: number
  totalCategories: number
  totalRevenue: number
}

export type AdminListResponse = {
  success: boolean
  data: AdminRecord[]
  pagination: { total: number; page: number; limit: number; pages: number }
}
