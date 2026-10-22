const socketUrl = import.meta.env.VITE_SOCKET_URL

export default function getSocketUrl() {
  if (socketUrl) return socketUrl
  return import.meta.env.DEV ? "http://localhost:5050" : undefined
}
