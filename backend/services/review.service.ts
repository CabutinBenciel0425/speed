import Driver, { type IDriver } from "../models/driver.model.js";
import Merchant, { type IMerchant } from "../models/merchant.model.js";
import Order, { type IOrder } from "../models/order.model.js";
import Review from "../models/review.model.js";
import User, { type IUser } from "../models/user.model.js";
import { ConflictError, NotFoundError } from "../utils/errors.js";
import { Types } from "mongoose";

type Reviewee = IDriver | IMerchant;
export type TargetType = "Driver" | "Merchant";

export const reviewCustomerToDriverService = async (
  rating: number,
  comment: string,
  userId: string,
  orderId: string,
) => {
  const targetType: TargetType = "Driver";
  if (!rating) {
    throw new ConflictError("Rating is not found");
  }

  const user = await User.findById<IUser>(userId);
  if (!user) throw new NotFoundError("User");

  const order = await Order.findById<IOrder>(orderId);
  if (!order) throw new NotFoundError("Order");

  const driver = await Driver.findById<IDriver>(order.driver);
  if (!driver) throw new NotFoundError("Driver");
  const reviewee: Reviewee = driver;

  if (user._id.toString() !== order.customer.toString()) {
    throw new ConflictError("User is not the customer of this order");
  }

  if (order.status !== "Delivered") {
    throw new ConflictError("User cannot add a review to an undelivered order");
  }

  const review = await createReview({
    user,
    rating,
    comment,
    reviewer: user,
    order,
    reviewee,
    targetType,
  });

  await updateAverageRating(review.reviewee.toString(), "Driver");

  await review.save();

  return review;
};

export const reviewCustomerToMerchantService = async (
  rating: number,
  comment: string,
  userId: string,
  orderId: string,
) => {
  const targetType: TargetType = "Merchant";
  if (!rating) {
    throw new ConflictError("Rating is not found");
  }

  const user = await User.findById<IUser>(userId);
  if (!user) throw new NotFoundError("User");

  const order = await Order.findById<IOrder>(orderId);
  if (!order) throw new NotFoundError("Order");

  const merchant = await Merchant.findById<IMerchant>(order.merchant);
  if (!merchant) throw new NotFoundError("Driver");
  const reviewee: Reviewee = merchant;

  if (user._id.toString() !== order.customer.toString()) {
    throw new ConflictError("User is not the customer of this order");
  }

  if (order.status !== "Delivered") {
    throw new ConflictError("User cannot add a review to an undelivered order");
  }

  const review = await createReview({
    user,
    rating,
    comment,
    reviewer: user,
    order,
    reviewee,
    targetType,
  });

  await updateAverageRating(review.reviewee.toString(), "Merchant");

  await review.save();

  return review;
};

const updateAverageRating = async (id: string, targetType: TargetType) => {
  const result = await Review.aggregate([
    { $match: { reviewee: new Types.ObjectId(id) } },
    {
      $group: {
        _id: null,
        avgValue: { $avg: "$rating" },
        ratingCount: { $sum: 1 },
      },
    },
  ]);

  const averageRating = result.length > 0 ? result[0].avgValue : 0;
  const ratingCount = result.length > 0 ? result[0].ratingCount : 0;

  if (targetType === "Driver") {
    await Driver.findByIdAndUpdate(id, {
      averageRating,
      ratingCount,
    });
  } else {
    await Merchant.findByIdAndUpdate(id, {
      averageRating,
      ratingCount,
    });
  }

  return averageRating;
};

const createReview = async ({
  user,
  rating,
  comment,
  reviewer,
  order,
  reviewee,
  targetType,
}: {
  user: IUser;
  rating: number;
  comment: string;
  reviewer: IUser;
  order: IOrder;
  reviewee: Reviewee;
  targetType: "Driver" | "Merchant";
}) => {
  const existingReview = await Review.findOne({
    order: order._id,
    reviewer: user._id,
    targetType,
  });

  if (existingReview) {
    throw new ConflictError("Already reviewed");
  }

  const newReview = new Review({
    order: order._id,
    reviewer: reviewer._id,
    reviewee: reviewee._id,
    targetType,
    rating,
    comment,
  });

  await newReview.save();
  return newReview.populate(["order", "reviewer", "reviewee"]);
};

export const getDriverReviewsService = async (user: IUser) => {
  const driver = await Driver.findOne({ user: user._id });

  if (!driver) {
    throw new NotFoundError("Driver");
  }

  const reviews = await Review.find({ reviewee: driver._id }).populate({
    path: "reviewer",
    select: "firstName lastName avatar",
  });

  return reviews;
};

export const getMerchantReviewsService = async (user: IUser) => {
  const merchant = await Merchant.findOne({ user: user._id });

  if (!merchant) {
    throw new NotFoundError("Merchant");
  }

  const reviews = await Review.find({ reviewee: merchant._id }).populate({
    path: "reviewer",
    select: "firstName lastName avatar",
  });

  return reviews;
};

export const getCustomerReviewsService = async (userId: string) => {
  const reviews = await Review.find({ reviewer: userId }).populate({
    path: "reviewer",
    select: "firstName lastName avatar",
  });

  return reviews;
};
