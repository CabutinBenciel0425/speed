import type { Address } from "@/types/address"
import type { AddressFormValues } from "../types/address"

export function getDefaultAddressValues(address?: Address): AddressFormValues {
  return {
    label: address?.label ?? "",
    recipientName: address?.recipientName ?? "",
    phoneNumber: address?.phoneNumber ?? "",

    houseOrUnitNumber: address?.houseOrUnitNumber ?? "",
    street: address?.street ?? "",
    landmark: address?.landmark ?? "",

    region: address?.region ?? "",
    province: address?.province ?? "",
    city: address?.city ?? "",
    barangay: address?.barangay ?? "",

    isDefault: address?.isDefault ?? false,
  }
}

export const ADDRESS_STEP_FIELDS = [
  ["label"],
  ["phoneNumber"],
  [
    "houseOrUnitNumber",
    "street",
    "landmark",
    "region",
    "province",
    "city",
    "barangay",
  ],
  [],
] as const
