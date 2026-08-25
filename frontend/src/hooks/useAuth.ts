import axios from "@/lib/axios"
import { useAuthStore } from "@/store/authStore"
import type { User } from "@/types/user"
import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"

const fetchCurrentUser = async (): Promise<User | null> => {
  try {
    const { data } = await axios.get("/auth/profile")
    return data.data
  } catch (error) {
    console.log(error)
    return null
  }
}

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isVerified,
    isLoading,
    setAuth,
    setVerified,
    setLoading,
  } = useAuthStore()

  const {
    data,
    isLoading: isQueryLoading,
    isError,
  } = useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
    retry: false,
  })

  useEffect(() => {
    if (isQueryLoading) return

    if (!isError && data) {
      setAuth(data)
      setVerified(data.isVerified)
    } else {
      setLoading(false)
    }
  }, [data, isQueryLoading, isError, setAuth, setVerified, setLoading])

  useEffect(() => {
    if (!isQueryLoading) {
      setLoading(false)
    }
  }, [isQueryLoading, setLoading])

  return {
    user,
    isAuthenticated,
    isVerified,
    setVerified,
    isLoading: isLoading || isQueryLoading,
  }
}
