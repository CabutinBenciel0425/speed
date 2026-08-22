import { z } from "zod"

export const verificationCodeSchema = z.object({
  email: z.email("Invalid email format"),
  code: z.string().length(6),
})
