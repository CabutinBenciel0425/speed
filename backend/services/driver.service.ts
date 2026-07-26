import cloudinary from "../config/cloudinary.js";
import { DEFAULT_DRIVER_AVATAR } from "../config/constants.js";
import Driver from "../models/driver.model.js";
import User from "../models/user.model.js";
import type { UpdateDriverInputWithImage } from "../types/types.js";
import { NotFoundError } from "../utils/errors.js";
import { extractPublicIdFromUrl } from "../utils/extractPublicIdFromUrl.js";
import { imageUpload } from "../utils/imageUpload.js";

export const updateDriverProfile = async (
  { vehicleType, plateNumber, avatar }: UpdateDriverInputWithImage,
  userId: string,
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError("User");
  }

  const driverProfile = await Driver.findOne({ user: user._id });

  if (!driverProfile) {
    throw new NotFoundError("Driver profile");
  }

  if (avatar) {
    if (
      driverProfile.avatar &&
      driverProfile.avatar !== DEFAULT_DRIVER_AVATAR
    ) {
      const publicId = extractPublicIdFromUrl(driverProfile.avatar);
      if (publicId) {
        const result = await cloudinary.uploader.destroy(publicId);
        if (result.result !== "ok") {
          console.warn(
            `Cloudinary cleanup failed for ${publicId}: ${result.result}`,
          );
        }
      }
    }
    const cloudinaryImageUrl = await imageUpload(avatar, "driver");

    driverProfile.avatar = cloudinaryImageUrl;
  }

  if (vehicleType) {
    driverProfile.vehicleType = vehicleType;
  }
  if (plateNumber) {
    driverProfile.plateNumber = plateNumber;
  }

  await driverProfile.save();

  return driverProfile;
};
