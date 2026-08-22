import type { VerifyEmailInput } from "@/features/auth/types/auth"
import { useMutation } from "@tanstack/react-query"
import axios from "@/lib/axios"
import { toast } from "sonner"
import type { EmailVerificationResult } from "../types/emailVerification"

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: verifyEmail,
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message)
      }
    },
    onError: () => {
      toast.error("Something went wrong. Please try again later.")
    },
  })
}

const verifyEmail = async (
  email: VerifyEmailInput
): Promise<EmailVerificationResult> => {
  const { data } = await axios.post("/auth/send-code", email)

  return data
}
