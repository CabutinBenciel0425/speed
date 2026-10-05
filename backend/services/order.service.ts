import mongoose, { type Types } from "mongoose";
import Order, { type IOrder } from "../models/order.model.js";
import Address from "../models/address.model.js";
import { ConflictError, NotFoundError } from "../utils/errors.js";
import Merchant from "../models/merchant.model.js";
import { recalculateCart } from "./cart.service.js";
import Cart from "../models/cart.model.js";
import { generateOrderNumber } from "../utils/generateOrderNumber.js";
import Driver from "../models/driver.model.js";
import { io } from "../server.js";
import { itemSchema } from "../schemas/cart.schema.js";
import Product, { type IProduct } from "../models/product.model.js";
import Payment from "../models/payment.model.js";
import { driverMatching } from "./driver.service.js";

type CartItemType = {
  product: Types.ObjectId;
  productName: string;
  image?: string | undefined;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes: string;
};

export type PreparedOrderDataType = {
  customer: Types.ObjectId;
  merchant: Types.ObjectId;
  orderNumber?: string;
  items: CartItemType[];
  deliveryAddress: {
    address: Types.ObjectId;
    street: string;
    barangay: string;
    city: string;
    province: string;
    location: {
      type: string;
      coordinates: number[];
    };
  };
  payment: {
    paymentId: Types.ObjectId | null;
    method: "Cash" | "QRPh";
    status: "Pending" | "Paid" | "Cancelled";
    transactionId: string | null;
  };
  pricing: {
    subtotal: number;
    serviceFee: number;
    discount: number;
    deliveryFee: number;
    total: number;
  };
  status:
    | "Pending"
    | "Preparing"
    | "ReadyForPickup"
    | "PickedUp"
    | "Delivered"
    | "Cancelled"
    | "Rejected";
  customerNote?: string;
  estimatedPreparationTime: number;
  estimatedDeliveryTime: number;
  driver: Types.ObjectId | null;
};

export const createOrderForCODService = async (userId: string) => {
  const preparedData = await prepareOrderData(userId);
  if (!preparedData) {
    throw new ConflictError("Cannot prepare the required data for the order");
  }
  const orderData = preparedData.orderData as PreparedOrderDataType;
  const payment = new Payment({
    customer: preparedData.orderData.customer,
    merchant: preparedData.orderData.merchant,
    cart: preparedData.cart._id,
    orderData: {
      items: preparedData.orderData.items,
      deliveryAddress: preparedData.orderData.deliveryAddress,
      pricing: preparedData.orderData.pricing,
      customerNote: preparedData.orderData.customerNote,
      estimatedPreparationTime: preparedData.orderData.estimatedPreparationTime,
      estimatedDeliveryTime: preparedData.orderData.estimatedDeliveryTime,
    },
    provider: "Manual",
    method: "Cash",
    amount: preparedData.orderData.pricing.total,
    status: "Pending",
    paymentIntentId: null,
    transactionId: null,
    paidAt: null,
    expiresAt: null,
    expiredAt: null,
    refundedAt: null,
  });

  await payment.save();

  orderData.payment.paymentId = payment._id;

  const newOrder = await createOrderFromPreparedData(
    orderData,
    preparedData.cart._id.toString(),
  );

  await driverMatching(newOrder._id.toString());

  return payment;
};

export const prepareOrderData = async (userId: string) => {
  await recalculateCart(userId);

  const cart = await Cart.findOne({ customer: userId }).populate(
    "items.product",
  );
  if (!cart) {
    throw new NotFoundError("Cart");
  }
  const merchant = await Merchant.findById(cart?.merchant);
  const address = await Address.findOne({ user: userId, isDefault: true });

  if (!merchant) {
    throw new NotFoundError("Merchant");
  }

  if (!address) {
    throw new ConflictError("There is no default address selected");
  }

  let orderItems: CartItemType[] = [];

  for (const item of cart.items) {
    const product = await Product.findById(item.product);
    if (!product) {
      throw new NotFoundError("Product");
    }
    orderItems.push({
      product: product._id,
      productName: product.name,
      image: product.image,
      quantity: item.quantity,
      unitPrice: product.price,
      subtotal: item.quantity * product.price,
      notes: item.note,
    });
  }

  return {
    orderData: {
      customer: cart.customer,
      merchant: cart.merchant,
      items: orderItems,
      deliveryAddress: cart.deliveryAddress,
      payment: {
        paymentId: null,
        method: cart?.payment?.method,
        status: "Pending",
        transactionId: null,
      },
      pricing: {
        subtotal: cart?.pricing?.subtotal,
        serviceFee: cart?.pricing?.serviceFee,
        discount: cart?.pricing?.discount,
        deliveryFee: cart?.pricing?.deliveryFee,
        total: cart?.pricing?.total,
      },
      status: "Pending",
      customerNote: cart.customerNote,
      estimatedPreparationTime: cart.estimatedPreparationTime,
      estimatedDeliveryTime: cart.estimatedDeliveryTime,
      driver: null,
    },
    cart,
    merchant,
    address,
  };
};

export const createOrderFromPreparedData = async (
  orderData: PreparedOrderDataType,
  cartId: string,
) => {
  const session = await mongoose.startSession();
  const newOrder = new Order(orderData);
  const paymentId = orderData.payment.paymentId;

  if (!paymentId) {
    throw new NotFoundError("Payment id");
  }

  try {
    await session.withTransaction(async () => {
      newOrder.orderNumber = generateOrderNumber();
      newOrder.payment.paymentId = paymentId;
      await newOrder.save({ session });
      await Cart.findByIdAndDelete(cartId).session(session);
    });
  } finally {
    await session.endSession();
  }

  return await newOrder.populate(["customer", "merchant"]);
};

export const cancelOrderServiceCustomer = async (
  orderId: string,
  userId: string,
  cancellationReason: string,
) => {
  const session = await mongoose.startSession();
  const order = await Order.findOne({ customer: userId, _id: orderId }).session(
    session,
  );

  if (!order) {
    throw new NotFoundError("Order");
  }

  const merchant = await Merchant.findById(order.merchant);

  if (!merchant) {
    throw new NotFoundError("Merchant");
  }

  const driver = order.driver
    ? await Driver.findById(order.driver).session(session)
    : null;

  const driverAlreadyAtMerchant =
    driver &&
    (driver.workingStatus === "ArrivedAtMerchant" ||
      driver.workingStatus === "Delivering");

  if (
    order.status === "Delivered" ||
    order.status === "Cancelled" ||
    driverAlreadyAtMerchant
  ) {
    throw new ConflictError("Order cannot be cancelled");
  }

  try {
    await session.withTransaction(async () => {
      order.payment.status = "Cancelled";
      order.status = "Cancelled";
      order.cancelledAt = new Date();
      order.cancelledBy = "Customer";
      order.cancellationReason = cancellationReason;
      await order.save({ session });
      if (driver) {
        driver.activeOrder = null;
        driver.workingStatus = "Available";
        driver.isAvailable = true;
        driver.cancelledDeliveries += 1;

        await driver.save({ session });
      }
    });
  } finally {
    await session.endSession();
  }

  if (driver) {
    io.to(`driver:${driver._id}`).emit("order:cancel");
  }

  io.to(`merchant:${merchant._id}`).emit("order:cancel");
  io.to(`customer:${order.customer}`).emit("order:cancel");

  return order;
};
