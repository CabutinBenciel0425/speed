interface OperatingHours {
  isOpen: boolean
  openHour: number
  openMinute: number
  closeHour: number
  closeMinute: number
}

export const isMerchantOpen = (hours: OperatingHours): boolean => {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  const openMinutes = hours.openHour * 60 + hours.openMinute
  const closeMinutes = hours.closeHour * 60 + hours.closeMinute

  if (closeMinutes < openMinutes) {
    return currentMinutes >= openMinutes || currentMinutes < closeMinutes
  }

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes
}

export const formatTime = (hour: number, minute: number): string => {
  const ampm = hour >= 12 ? "PM" : "AM"
  const h = hour % 12 || 12
  const m = minute.toString().padStart(2, "0")
  return `${h}:${m} ${ampm}`
}

export const formatOperatingHours = (hours: OperatingHours): string => {
  if (!hours.isOpen) {
    return "Closed"
  }

  const open = formatTime(hours.openHour, hours.openMinute)
  const close = formatTime(hours.closeHour, hours.closeMinute)
  return `${open} – ${close}`
}
