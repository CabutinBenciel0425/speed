import Address from "../../models/address.model";

export const addAddress = async (
  label: "Home" | "Work" | "Other",
  overrides: Record<string, unknown> = {},
) => {
  return Address.create({
    user: "user123",
    label: label,
    recipientName: "Test One",
    phoneNumber: "09912345678",
    houseOrUnitNumber: "Building 4 Unit 104",
    street: "FTI MRB Habitat",
    barangay: "Western Bicutan",
    city: "City of Taguig",
    province: "Metro Manila",
    region: "NCR",
    location: {
      type: "Point",
      coordinates: [121.04321103781386, 14.508571097884666],
    },
    landmark: "Near Hospital",
    instructions: "Just ring the doorbell",
    isDefault: false,
    ...overrides,
  });
};
