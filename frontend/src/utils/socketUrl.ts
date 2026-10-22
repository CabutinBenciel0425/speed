const socketUrl = import.meta.env.VITE_SOCKET_URL?.trim()
const apiUrl = import.meta.env.VITE_API_URL?.trim()

export default function getSocketUrl() {
  if (socketUrl) return socketUrl
  if (import.meta.env.DEV) return "http://localhost:5050"

  // In production the API and static site may be hosted on different origins.
  // Reuse the API origin so Socket.IO connects to the server that emits offers.
  if (apiUrl) {
    try {
      return new URL(apiUrl, window.location.origin).origin
    } catch {
      // Fall through to same-origin when the API URL is malformed.
    }
  }

  return window.location.origin
}
