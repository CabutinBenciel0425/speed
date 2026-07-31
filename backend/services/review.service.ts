import Driver, { type IDriver } from "../models/driver.model.js";
import Merchant, { type IMerchant } from "../models/merchant.model.js";
import Order, { type IOrder } from "../models/order.model.js";
import Review from "../models/review.model.js";
import User, { type IUser } from "../models/user.model.js";
import { ConflictError, NotFoundError } from "../utils/errors.js";

type Reviewee = IDriver | IMerchant;

export const reviewCustomerToTargetService = async (
  rating: number,
  comment: string,
  userId: string,
  orderId: string,
  targetType: "Driver" | "Merchant",
) => {
  if (!rating) {
    throw new ConflictError("Rating is not found");
  }

  const user = await User.findById<IUser>(userId);
  if (!user) throw new NotFoundError("User");

  const order = await Order.findById<IOrder>(orderId);
  if (!order) throw new NotFoundError("Order");

  let reviewee: Reviewee;
  if (targetType === "Driver") {
    const driver = await Driver.findById<IDriver>(order.driver);
    if (!driver) throw new NotFoundError("Driver");
    reviewee = driver;
  } else {
    const merchant = await Merchant.findById<IMerchant>(order.merchant);
    if (!merchant) throw new NotFoundError("Merchant");
    reviewee = merchant;
  }

  if (user._id.toString() !== order.customer.toString()) {
    throw new ConflictError("User is not the customer of this order");
  }

  if (order.status !== "Delivered") {
    throw new ConflictError("User cannot add a review to an undelivered order");
  }

  const review = await createReview({
    rating,
    comment,
    reviewer: user,
    order,
    reviewee,
    targetType,
  });

  return review;
};

const createReview = async ({
  rating,
  comment,
  reviewer,
  order,
  reviewee,
  targetType,
}: {
  rating: number;
  comment: string;
  reviewer: IUser;
  order: IOrder;
  reviewee: Reviewee;
  targetType: "Driver" | "Merchant";
}) => {
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
