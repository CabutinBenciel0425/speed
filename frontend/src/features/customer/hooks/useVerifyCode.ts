import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "@/lib/axios"
import { toast } from "sonner"
import type {
  CodeVerificationResult,
  VerificationCodeInput,
} from "../types/emailVerification"
import { useAuthStore } from "@/store/authStore"

export const useVerifyCode = () => {
  const queryClient = useQueryClient()
  const setVerified = useAuthStore((state) => state.setVerified)
  return useMutation({
    mutationFn: verifyCode,
    onSuccess: () => {
      toast.success("Email verified successfully!")

      setVerified(true)

      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
    },
    onError: () => {
      toast.error("Something went wrong. Please try again later.")
    },
  })
}

const verifyCode = async ({
  code,
  email,
}: VerificationCodeInput): Promise<CodeVerificationResult> => {
  const { data } = await axios.post("/auth/verify-code", { email, code })

  return data.data
}
