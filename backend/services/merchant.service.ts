import mongoose, { type QueryFilter } from "mongoose";
import Order from "../models/order.model.js";
import { ConflictError, NotFoundError } from "../utils/errors.js";
import Merchant, { type IMerchant } from "../models/merchant.model.js";
import Driver from "../models/driver.model.js";
import { io } from "../server.js";
import User, { type IUser } from "../models/user.model.js";
import { buildQuery } from "../utils/buildQuery.js";
import type { merchantUpdateInput } from "../schemas/merchant.schema.js";
import { extractPublicIdFromUrl } from "../utils/extractPublicIdFromUrl.js";
import cloudinary from "../config/cloudinary.js";
import { imageUpload } from "../utils/imageUpload.js";
import MerchantFavorite from "../models/merchantFavorite.model.js";
import { ApiError } from "../utils/apiError.js";
import { userInfo } from "node:os";

export const merchantRejectOrder = async (orderId: string, userId: string) => {
  const session = await mongoose.startSession();
  const isOrderValid = await validateMerchantOrder(orderId, userId);

  if (!isOrderValid) {
    throw new ConflictError("There is some error. Check the console");
  }

  const order = await Order.findById(orderId).session(session);
  if (!order) {
    throw new NotFoundError("Order");
  }

  const driver = await Driver.findById(order.driver).session(session);
  if (!driver) {
    throw new NotFoundError("Driver");
  }

  try {
    await session.withTransaction(async () => {
      order.status = "Rejected";
      order.rejectedAt = new Date();
      order.cancelledBy = "Merchant";
      order.cancelledAt = new Date();
      driver.activeOrder = null;
      driver.isAvailable = true;
      driver.workingStatus = "Available";

      await order.save({ session });
      await driver.save({ session });
    });
  } finally {
    await session.endSession();
  }

  const driverId = order.driver ? order.driver.toString() : null;
  const customerId = order.customer ? order.customer.toString() : null;

  if (driverId) io.to(`driver:${driverId}`).emit("order:rejected");
  if (customerId) io.to(`customer:${customerId}`).emit("order:rejected");

  return order;
};

export const merchantAcceptOrder = async (orderId: string, userId: string) => {
  const user = await User.findById(userId);
  const order = await Order.findById(orderId);
  if (!user) {
    throw new NotFoundError("User");
  }
  if (!order) {
    throw new NotFoundError("Order");
  }

  order.merchantReceivedAt = new Date();
  order.preparingAt = new Date();
  order.status = "Preparing";

  await order.save();

  io.to(`customer:${order.customer.toString()}`).emit("order:preparing");

  return order;
};

export const merchantPreparingOrder = async (
  orderId: string,
  userId: string,
) => {
  const user = await User.findById(userId);
  const order = await Order.findById(orderId);
  if (!user) {
    throw new NotFoundError("User");
  }
  if (!order) {
    throw new NotFoundError("Order");
  }

  order.merchantReceivedAt = new Date();
  order.status = "Preparing";

  await order.save();

  io.to(`customer:${order.customer.toString()}`).emit("order:preparing");

  return order;
};

export const merchantReadyOrder = async (orderId: string, userId: string) => {
  const isOrderValid = await validateMerchantOrder(orderId, userId);

  if (!isOrderValid) {
    throw new ConflictError("There is some error. Check the console");
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new NotFoundError("Order");
  }

  const driver = await Driver.findById(order.driver);
  if (!driver) {
    throw new NotFoundError("Driver");
  }

  order.status = "ReadyForPickup";
  order.readyForPickupAt = new Date();
  await order.save();

  io.to(`driver:${driver._id.toString()}`).emit("order:ready");

  return order;
};

const validateMerchantOrder = async (orderId: string, userId: string) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new NotFoundError("Order");
  }

  const merchant = await Merchant.findOne({ owner: userId });
  if (!merchant) {
    throw new NotFoundError("Merchant");
  }

  if (order.merchant.toString() !== merchant._id.toString()) {
    throw new ConflictError("This order doesn't belong to this merchant");
  }

  if (order.driver === null) {
    throw new ConflictError("Order must have assigned driver first");
  }

  if (order.status !== "Pending") {
    throw new ConflictError("Order's status should be 'Pending' first");
  }

  if (order.acceptedAt === null) {
    throw new ConflictError("Order must have assigned driver first");
  }

  if (order.rejectedAt !== null) {
    throw new ConflictError("Order is rejected already");
  }

  if (order.cancelledBy !== null) {
    throw new ConflictError("Order is cancelled already");
  }

  if (order.cancelledAt !== null) {
    throw new ConflictError("Order is cancelled already");
  }

  if (order.pickedUpAt !== null) {
    throw new ConflictError("Order already picked up");
  }

  if (order.deliveredAt !== null) {
    throw new ConflictError("Order already picked up");
  }

  if (order.merchantReceivedAt === null) {
    throw new ConflictError("Merchant haven't received the order yet");
  }

  if (order.driverAssignedAt === null) {
    throw new ConflictError("Order must have assigned driver first");
  }

  if (order.payment.method !== "Cash" && order.payment.transactionId === null) {
    throw new ConflictError(
      "Order payment method is not cash but no transaction id found",
    );
  }

  return true;
};

export const getMerchantsService = async (payload: any) => {
  const queryData = buildQuery(payload);

  const allowedSorts = [
    "merchantName",
    "-merchantName",
    "status",
    "-status",
    "ratingCount",
    "-ratingCount",
    "averageRating",
    "-averageRating",
  ];

  const sort = allowedSorts.includes(queryData.sort)
    ? queryData.sort
    : "-merchantName";

  if (queryData.search) {
    queryData.filter.$or = [
      {
        merchantName: {
          $regex: queryData.search,
          $options: "i",
        },
      },
      {
        description: {
          $regex: queryData.search,
          $options: "i",
        },
      },
    ];
  }

  const docs = await Merchant.find(queryData.filter)
    .select("-password")
    .sort(sort)
    .select(queryData.select)
    .skip(queryData.skip)
    .limit(queryData.limit);

  const limitedDocs = docs.map((doc) => ({
    name: doc.merchantName,
    description: doc.description,
    phoneNumber: doc.phoneNumber,
    logo: doc.logo,
    banner: doc.banner,
    address: doc.address,
    operatingHours: doc.operatingHours,
    ratingCount: doc.ratingCount,
    averageRating: doc.averageRating,
  }));

  const total = await Merchant.countDocuments(queryData.filter);

  return { limitedDocs, total, queryData };
};

export const getMerchantProductsService = async (
  payload: any,
  merchantId: string,
) => {
  const queryData = buildQuery(payload);
  const allowedSorts = [
    "ratingAverage",
    "-ratingAverage",
    "price",
    "-price",
    "createdAt",
    "-createdAt",
    "name",
    "-name",
  ];

  const sort = allowedSorts.includes(queryData.sort)
    ? queryData.sort
    : "-ratingAverage";

  const filter: any = {
    merchant: merchantId,
    ...queryData.filter,
  };

  if (queryData.search) {
    filter.name = {
      $regex: queryData.search,
      $options: "i",
    };
  }

  const docs = await Merchant.find(queryData.filter)
    .sort(sort)
    .select(queryData.select)
    .skip(queryData.skip)
    .limit(queryData.limit);

  const total = await Merchant.countDocuments(queryData.filter);

  return { docs, total, queryData };
};

export const updateMerchantProfileService = async (
  user: IUser,
  merchantId: string,
  payload: merchantUpdateInput,
  logo: Express.Multer.File | undefined,
  banner: Express.Multer.File | undefined,
) => {
  const merchant = await Merchant.findOne({
    owner: user._id,
    _id: merchantId,
  }).populate("owner");

  if (!merchant) {
    throw new NotFoundError("Merchant");
  }

  const updateData: Partial<IMerchant> = {};

  if (payload?.merchantName !== undefined) {
    updateData.merchantName = payload.merchantName;
  }

  if (payload?.description !== undefined) {
    updateData.description = payload.description;
  }

  if (payload?.phoneNumber !== undefined) {
    updateData.phoneNumber = payload.phoneNumber;
  }

  if (payload?.address !== undefined) {
    updateData.address = {
      ...payload.address,
      location: payload.address.location ?? {
        type: "Point",
        coordinates: [0, 0],
      },
    };
  }

  if (payload?.operatingHours !== undefined) {
    updateData.operatingHours =
      payload.operatingHours as IMerchant["operatingHours"];
  }

  if (payload?.minimumOrder !== undefined) {
    updateData.minimumOrder = payload.minimumOrder;
  }

  if (logo) {
    if (merchant.logo) {
      const publicId = extractPublicIdFromUrl(merchant.logo);
      if (publicId) {
        const result = await cloudinary.uploader.destroy(publicId);
        if (result.result !== "ok") {
          console.warn(
            `Cloudinary cleanup failed for ${publicId}: ${result.result}`,
          );
        }
      }
    }
    const cloudinaryImageUrl = await imageUpload(logo, "merchant/logo");
    updateData.logo = cloudinaryImageUrl;
  }

  if (banner) {
    if (merchant.banner) {
      const publicId = extractPublicIdFromUrl(merchant.banner);
      if (publicId) {
        const result = await cloudinary.uploader.destroy(publicId);
        if (result.result !== "ok") {
          console.warn(
            `Cloudinary cleanup failed for ${publicId}: ${result.result}`,
          );
        }
      }
    }
    const cloudinaryImageUrl = await imageUpload(banner, "merchant/banner");
    updateData.banner = cloudinaryImageUrl; // ✅ Fixed: was logo before
  }

  const updatedMerchant = await Merchant.findByIdAndUpdate(
    merchant._id,
    {
      $set: updateData,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedMerchant) {
    throw new ConflictError(
      "Cannot update the details. Please try again later",
    );
  }

  return updatedMerchant;
};

export const toggleMerchantFavoriteService = async (
  user: IUser,
  merchantId: string,
) => {
  const merchant = await Merchant.findById(merchantId);

  if (!merchant) {
    throw new NotFoundError("Merchant");
  }

  const favoriteExist = await MerchantFavorite.findOne({
    user: user._id,
    merchant: merchant._id,
  });

  if (favoriteExist) {
    const result = await deleteMerchantFavoriteService(
      user._id.toString(),
      merchant._id.toString(),
    );

    return result;
  }

  const merchantFavorite = new MerchantFavorite({
    user: user._id,
    merchant: merchant._id,
  });

  await merchantFavorite.save();

  return merchantFavorite;
};

export const deleteMerchantFavoriteService = async (
  userId: string,
  merchantId: string,
) => {
  const result = await MerchantFavorite.findOneAndDelete({
    user: userId,
    merchant: merchantId,
  });

  if (!result) {
    throw new ApiError(500, "Unable to delete favorite merchant");
  }

  return "Merchant successfully removed as favorite";
};

export const getMerchantFavoritesService = async (user: IUser) => {
  const favorites = await MerchantFavorite.find({ user: user._id });

  if (favorites.length === 0) {
    return [];
  }

  return favorites;
};
