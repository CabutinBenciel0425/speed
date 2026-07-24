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
  location: z
    .object({
      type: z.string().optional(),
      coordinates: z.array(z.coerce.number()),
    })
    .optional(),
  landmark: z.string().optional(),
  instructions: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export const addressInputSchema = addressSchema.pick({
  label: true,
  recipientName: true,
  phoneNumber: true,
  street: true,
  barangay: true,
  city: true,
  province: true,
  location: true,
  landmark: true,
  instructions: true,
});

export const updateSchemaInput = addressSchema.partial({
  label: true,
  recipientName: true,
  phoneNumber: true,
  street: true,
  barangay: true,
  city: true,
  province: true,
  location: true,
  landmark: true,
});

export const toggleIsDefaultInput = addressSchema.pick({ isDefault: true });

export type AddressInput = z.infer<typeof addressSchema>;
export type UpdateAddressInput = z.infer<typeof updateSchemaInput>;
