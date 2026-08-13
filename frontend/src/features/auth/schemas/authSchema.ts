import { z } from "zod"

export const userSchema = z.object({
  firstName: z.string().min(1, "Firstname is required"),
  lastName: z.string().min(1, "Lastname is required"),
  email: z.email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be atleast 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),

  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^(\+63|0)[0-9]{10}$/, "Invalid Philippine phone number format"),
  role: z.enum(["Customer", "Merchant", "Driver", "Admin"]).default("Customer"),
  isVerified: z.boolean(),
})

export const signupSchema = userSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  password: true,
  phoneNumber: true,
})

export const loginSchema = z.object({
  email: z.email("Invalid email format"),
  password: z.string().min(8, "Password must be atleast 8 characters"),
})

export const updateSchema = userSchema.partial()

export const forgotPasswordSchema = z.object({
  email: z.email("Invalid email format"),
})

export const resetPasswordSchema = z.object({
  email: z.email("Invalid email format"),
  code: z.string().length(6, "Code must be 6 digits"),
  password: z
    .string()
    .min(8, "Password must be atleast 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
})

export const selectRoleSchema = z.enum([
  "Customer",
  "Merchant",
  "Driver",
  "Admin",
])
