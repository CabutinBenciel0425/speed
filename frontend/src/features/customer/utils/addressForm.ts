import type { Address } from "@/types/address"
import type { AddressInput } from "../types/address"

export function getDefaultAddressValues(address?: Address): AddressInput {
  const coords = address?.location?.coordinates
  const hasValidCoords = Array.isArray(coords) && coords.length === 2
  return {
    label: address?.label ?? "Home",
    recipientName: address?.recipientName ?? "",
    phoneNumber: address?.phoneNumber ?? "",

    houseOrUnitNumber: address?.houseOrUnitNumber ?? "",
    street: address?.street ?? "",
    landmark: address?.landmark ?? "",
    instructions: address?.instructions ?? "",
    region: address?.region ?? "",
    province: address?.province ?? "",
    city: address?.city ?? "",
    barangay: address?.barangay ?? "",
    location: hasValidCoords
      ? { type: "Point", coordinates: [coords[0], coords[1]] }
      : undefined,

    isDefault: address?.isDefault ?? false,
  }
}

export const ADDRESS_STEP_FIELDS = [
  ["label"],
  ["phoneNumber"],
  ["houseOrUnitNumber", "street", "region", "province", "city", "barangay"],
  ["landmark", "instructions"],
  [],
] as const
