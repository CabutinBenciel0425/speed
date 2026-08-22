import type { z } from "zod"
import { verificationCodeSchema } from "../schemas/emailVerificationSchema"
import type { User } from "@/types/user"

export type EmailVerificationResult = {
  success: boolean
  message: string
}

export type CodeVerificationResult = {
  success: boolean
  message: string
  data: User
}

export type VerificationCodeInput = z.infer<typeof verificationCodeSchema>
