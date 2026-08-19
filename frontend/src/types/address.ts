export interface Address {
  _id: string
  user: string
  label: AddressLabel
  recipientName?: string
  phoneNumber: string
  street: string
  barangay: string
  city: string
  province: string
  location: {
    type: "Point"
    coordinates?: number[]
  }
  landmark?: string
  instructions?: string
  isDefault?: boolean
}

export type AddressLabel = "Home" | "Work" | "Other"
