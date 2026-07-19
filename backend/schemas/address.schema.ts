import { z } from "zod";

export const addressSchema = z.object({
  label: z.enum(["Home", "Work", "Other"]),
  recipientName: z.string().optional(),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^(\+63|0)[0-9]{10}$/, "Invalid Philippine phone number format"),
  street: z.string(),
  barangay: z.string(),
  city: z.string(),
  province: z.string(),
  mapCoordinates: z
    .object({
      lat: z.coerce.number(),
      lng: z.coerce.number(),
    })
    .optional(),
  landmark: z.string().optional(),
  instructions: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;
