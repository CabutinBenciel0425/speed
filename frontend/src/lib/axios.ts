// File: frontend/src/lib/axios.ts
import { useAuthStore } from "@/store/authStore"
import axios, { type InternalAxiosRequestConfig, AxiosError } from "axios"
import { queryClient } from "./queryClient"

const getBaseURL = () => {
  if (import.meta.env.DEV) {
    return "http://localhost:5050/api/v1"
  }
  return import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "/api/v1"
}

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
})

let isRefreshing = false

let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (error: unknown) => void
}> = []

const processQueue = (error: unknown | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error)
    }

    const authState = useAuthStore.getState()
    if (!authState.isAuthenticated && !authState.isLoading) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then(() => axiosInstance(originalRequest))
        .catch((err) => Promise.reject(err))
    }

    isRefreshing = true

    try {
      await axiosInstance.post("/auth/refresh")

      processQueue(null)

      return axiosInstance(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError)
      useAuthStore.getState().logout()
      queryClient.setQueryData(["currentUser"], null)
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default axiosInstance
