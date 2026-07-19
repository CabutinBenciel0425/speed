import Address from "../models/address.model.js";
import type { AddressInput } from "../schemas/address.schema.js";
import { ConflictError } from "../utils/errors.js";

export const createNewAddress = async (
  payload: AddressInput,
  userId: string,
) => {
  const existingAddresses = await Address.find({ user: userId });

  const existingLabels = existingAddresses.map((addr) => addr.label);

  if (new Set(existingLabels).size >= 3) {
    throw new ConflictError("You've used all your address types");
  }

  if (existingLabels.includes(payload.label)) {
    throw new ConflictError(
      `You have an existing address in the type ${payload.label}`,
    );
  }

  const newAddress = new Address({
    user: userId,
    label: payload.label,
    recipientName: payload.recipientName,
    phoneNumber: payload.phoneNumber,
    street: payload.street,
    barangay: payload.barangay,
    city: payload.city,
    province: payload.province,
    mapCoordinates: {
      latitude: payload.mapCoordinates?.lat,
      longitude: payload.mapCoordinates?.lng,
    },
    landmark: payload.landmark,
    instructions: payload.instructions,
  });

  await newAddress.save();

  console.log(newAddress);

  return newAddress;
};
