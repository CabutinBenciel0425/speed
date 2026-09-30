import type { AddressLabel } from "@/types/address"

export interface AddressFormValues {
  label: AddressLabel | ""
  recipientName: string
  phoneNumber: string

  houseOrUnitNumber: string
  street: string
  landmark: string

  region: string
  province: string
  city: string
  barangay: string

  isDefault: boolean
}
