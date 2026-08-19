import { useMutation } from "@tanstack/react-query"
import type { SignupInput } from "../types/auth"
import axios from "@/lib/axios"
import { toast } from "sonner"

export const useRegister = () => {
  return useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success("Account successfully created")
    },
    onError: () => {
      toast.error("Something went wrong. Please try again later.")
    },
  })
}

const registerUser = async (payload: SignupInput) => {
  try {
    const res = await axios.post("auth/sign-up/customer", payload)
    return res.data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
  }
}
