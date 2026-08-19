import { useMutation } from "@tanstack/react-query"
import type { LoginInput } from "../types/auth"
import axios from "@/lib/axios"
import { toast } from "sonner"
import { useAuthStore } from "@/store/authStore"

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth)
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (response) => {
      toast.success("Login successfully")

      if (!response.requiresRoleSelection) {
        const user = response.data

        setAuth(user)

        sessionStorage.removeItem("refreshFailed")
      }
    },
    onError: () => {
      toast.error("Something went wrong. Please try again later.")
    },
  })
}

const loginUser = async (payload: LoginInput) => {
  try {
    const res = await axios.post("auth/login", payload)

    return res.data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
  }
}
