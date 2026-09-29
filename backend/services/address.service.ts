import type { HydratedDocument, QueryFilter } from "mongoose";
import Address, { type IAddress } from "../models/address.model.js";
import type { IUser } from "../models/user.model.js";
import type {
  AddressInput,
  UpdateAddressInput,
} from "../schemas/address.schema.js";
import type { AddressType } from "../types/types.js";
import { ConflictError, NotFoundError } from "../utils/errors.js";

export const createNewAddress = async (payload: AddressInput, user: IUser) => {
  const existingAddresses = await Address.find({ user: user._id });

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
    user: user._id,
    label: payload.label,
    recipientName: payload.recipientName,
    phoneNumber: payload.phoneNumber,
    houseOrUnitNumber: payload.houseOrUnitNumber,
    street: payload.street,
    barangay: payload.barangay,
    city: payload.city,
    province: payload.province,
    region: payload.region,
    location: {
      type: payload.location?.type || "Point",
      coordinates: payload.location?.coordinates,
    },
    landmark: payload.landmark,
    instructions: payload.instructions,
    isDefault: existingLabelsLength === 0,
  });

  await newAddress.save();

  return newAddress;
};

export const updateAddressDetails = async (
  user: HydratedDocument<IUser>,
  payload: UpdateAddressInput,
) => {
  const address = await Address.findOne({
    user: user._id,
    label: payload.label,
  } as QueryFilter<IAddress>);

  if (!address) {
    throw new NotFoundError("Address");
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

  if (payload.houseOrUnitNumber) {
    address.houseOrUnitNumber = payload.houseOrUnitNumber;
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

  if (payload.region) {
    address.region = payload.region;
  }

  if (payload.location) {
    address.location = {
      type: "Point",
      coordinates: payload.location.coordinates,
    };
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
  user: HydratedDocument<IUser>,
  addressType: AddressType,
) => {
  if (!addressType) {
    throw new NotFoundError("Address type");
  }

  const addresses = await Address.find({ user: user._id }).populate<"user">(
    "user",
  );

  const matchExists = addresses.some(
    (address) => address.label.toLowerCase() === addressType.toLowerCase(),
  );

  if (!matchExists) {
    throw new NotFoundError("Address");
  }

  await Promise.all(
    addresses.map((address) => {
      address.isDefault =
        address.label.toLowerCase() === addressType.toLowerCase();
      return address.save();
    }),
  );

  return addresses;
};

export const deleteUserAddress = async (
  user: HydratedDocument<IUser>,
  addressType: AddressType,
) => {
  if (!addressType) {
    throw new NotFoundError("Address type");
  }
  const formattedAddressType =
    addressType.charAt(0).toUpperCase() + addressType.slice(1);

  const address = await Address.findOneAndDelete({
    user: user._id,
    label: formattedAddressType,
  } as any);

  if (!address) {
    throw new NotFoundError("Address");
  }

  return address;
};
