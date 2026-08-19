import { useMutation } from "@tanstack/react-query"
import axios from "@/lib/axios"
import { toast } from "sonner"
import { useAuthStore } from "@/store/authStore"

const selectRole = async (role: string) => {
  try {
    const res = await axios.post("auth/select-role", { activeRole: role })
    return res.data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
  }
}

export const useSelectRole = () => {
  const setAuth = useAuthStore((state) => state.setAuth)
  return useMutation({
    mutationFn: selectRole,
    onSuccess: (response) => {
      toast.success("Role selected successfully")
      const user = response.data

      setAuth(user)

      sessionStorage.removeItem("refreshFailed")
    },
    onError: () => {
      toast.error("Failed to select role")
    },
  })
}
