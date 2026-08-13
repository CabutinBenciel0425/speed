import type { z } from "zod"
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  selectRoleSchema,
  signupSchema,
  updateSchema,
  userSchema,
} from "../schemas/authSchema"

export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type UpdateInput = z.infer<typeof updateSchema>
export type UserInput = z.infer<typeof userSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ValidUserRoleInput = z.infer<typeof selectRoleSchema>

export type HandleSubmitRegisterType = (data: SignupInput) => void
export type FormRegisterType = (data: SignupInput) => SignupInput

export type HandleSubmitLoginType = (data: LoginInput) => void
export type FormLoginType = (data: LoginInput) => LoginInput

export type LoginResponse =
  | {
      success: true
      requiresRoleSelection: true
      roles: string[]
    }
  | {
      success: true
      requiresRoleSelection: false
      message: string
      data: UserType
    }

export type UserType = {
  success: boolean
  message: string
  data: {
    id: string
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    role: string[]
    isVerified: boolean
  }
}
