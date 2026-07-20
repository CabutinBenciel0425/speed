import Address from "../models/address.model.js";
import type {
  AddressInput,
  UpdateAddressInput,
} from "../schemas/address.schema.js";
import type { AddressType } from "../types/types.js";
import { ConflictError, NotFoundError } from "../utils/errors.js";

export const createNewAddress = async (
  payload: AddressInput,
  userId: string,
) => {
  const existingAddresses = await Address.find({ user: userId });

  const existingLabels = existingAddresses.map((addr) => addr.label);

  const existingLabelsLength = new Set(existingLabels).size;

  if (existingLabelsLength >= 3) {
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
      latitude: payload.mapCoordinates?.latitude,
      longitude: payload.mapCoordinates?.longitude,
    },
    landmark: payload.landmark,
    instructions: payload.instructions,
    isDefault: existingLabelsLength === 0,
  });

  await newAddress.save();

  console.log(newAddress);

  return newAddress;
};

export const updateAddressDetails = async (
  userId: string,
  payload: UpdateAddressInput,
) => {
  const address = await Address.findOne({
    user: userId,
    label: payload.label,
  } as any);

  if (!address) {
    throw new NotFoundError("Address not found");
  }

  if (payload.label) {
    address.label = payload.label;
  }

  if (payload.recipientName) {
    address.recipientName = payload.recipientName;
  }

  if (payload.phoneNumber) {
    address.phoneNumber = payload.phoneNumber;
  }
  if (payload.street) {
    address.street = payload.street;
  }

  if (payload.barangay) {
    address.barangay = payload.barangay;
  }

  if (payload.city) {
    address.city = payload.city;
  }

  if (payload.province) {
    address.province = payload.province;
  }

  if (payload.mapCoordinates) {
    address.mapCoordinates = payload.mapCoordinates;
  }

  if (payload.landmark) {
    address.landmark = payload.landmark;
  }

  if (payload.instructions) {
    address.instructions = payload.instructions;
  }

  await address.save();

  return address;
};

export const toggleDefaultAddress = async (
  userId: string,
  addressType: AddressType,
) => {
  const addresses = await Address.find({ user: userId });

  if (!addressType) {
    throw new NotFoundError("Address type is undefined");
  }

  addresses.map((address) => {
    if (address.label.toLowerCase() === addressType.toLowerCase()) {
      address.isDefault = true;
    }
    if (address.label.toLowerCase() !== addressType.toLowerCase()) {
      address.isDefault = false;
    }
  });

  return addresses;
};
