export type AdminNotificationType =
  | "ADMIN_NEW_ORDER"
  | "ADMIN_NEW_MERCHANT"
  | "ADMIN_NEW_DRIVER"
  | "ADMIN_NEW_REVIEW"

export type AdminNotification = {
  _id: string
  targetId: string
  targetType: "Admin"
  type: AdminNotificationType
  title: string
  message: string
  order: string | null
  isRead: boolean
  createdAt: string
}

export type AdminNotificationList = {
  notifications: AdminNotification[]
  unreadCount: number
}
