import axios from "@/lib/axios"
import { useAuthStore } from "@/store/authStore"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

type LogoutResult = {
  success: boolean
  message: string
}

const logout = async () => {
  const res = await axios.post<LogoutResult>("/auth/logout")

  return res
}

export const useLogout = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: logout,
    onSuccess: (response) => {
      toast.success(response.data.message)

      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
      useAuthStore.getState().logout()

      localStorage.removeItem("auth-storage")
      localStorage.removeItem("address-storage")
    },
    onError: () => {
      toast.error("Something went wrong. Please try again later.")
    },
  })
}
