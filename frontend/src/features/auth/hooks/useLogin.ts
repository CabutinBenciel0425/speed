import { useMutation } from "@tanstack/react-query"
import type { LoginInput } from "../types/auth"
import axios from "@/lib/axios"
import { toast } from "sonner"

export const useLogin = () => {
  return useMutation({
    mutationFn: loginUser,
    onSuccess: () => {
      toast.success("Login successfully")
    },
    onError: () => {
      toast.error("Something went wrong. Please try again later.")
    },
  })
}

const loginUser = async (payload: LoginInput) => {
  const res = await axios.post("auth/login", payload)

  return res.data
}
