// import type { AddressLabel } from "@/types/address"

import { z } from "zod"

// export interface AddressFormValues {
//   label: AddressLabel | ""
//   recipientName: string
//   phoneNumber: string

//   houseOrUnitNumber: string
//   street: string
//   landmark: string
//   instructions: string

//   region: string
//   province: string
//   city: string
//   barangay: string
//   location: {
//     type: "Point"
//     coordinates?: [number, number]
//   }

//   isDefault: boolean
// }

export const addressSchema = z.object({
  label: z.enum(["Home", "Work", "Other"]),
  recipientName: z.string().optional(),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^(\+63|0)[0-9]{10}$/, "Invalid Philippine phone number format"),
  houseOrUnitNumber: z.string(),
  street: z.string(),
  barangay: z.string(),
  city: z.string(),
  province: z.string(),
  region: z.string(),
  location: z
    .object({
      type: z.string().optional(),
      coordinates: z.tuple([z.number(), z.number()]),
    })
    .optional(),
  landmark: z.string(),
  instructions: z.string().optional(),
  isDefault: z.boolean().default(false),
})

export const addressInputSchema = addressSchema.pick({
  label: true,
  recipientName: true,
  phoneNumber: true,
  houseOrUnitNumber: true,
  street: true,
  barangay: true,
  city: true,
  province: true,
  region: true,
  location: true,
  landmark: true,
  instructions: true,
  isDefault: true,
})

export const updateSchemaInput = addressSchema.partial({
  label: true,
  recipientName: true,
  phoneNumber: true,
  houseOrUnitNumber: true,
  street: true,
  barangay: true,
  city: true,
  province: true,
  region: true,
  location: true,
  landmark: true,
})

export const toggleIsDefaultInput = addressSchema.pick({ isDefault: true })

export type AddressInput = z.infer<typeof addressSchema>
export type AddressFormValues = AddressInput
export type UpdateAddressInput = z.infer<typeof updateSchemaInput>
