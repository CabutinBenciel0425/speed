import axios from "@/lib/axios"
import { useAuthStore } from "@/store/authStore"
import type { User } from "@/types/user"
import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"

type CurrentSession = { user: User; activeRole: User["role"][number] }

const fetchCurrentUser = async (): Promise<CurrentSession | null> => {
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
    activeRole,
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
    enabled: isLoading || isAuthenticated,
  })

  useEffect(() => {
    if (isQueryLoading) return

    if (!isError && data) {
      setAuth(data.user, data.activeRole)
      setVerified(data.user.isVerified)
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
    activeRole,
    isAuthenticated,
    isVerified,
    setVerified,
    isLoading: isLoading || isQueryLoading,
  }
}
