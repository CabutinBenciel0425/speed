import { create } from "domain";
import { z } from "zod";

export const orderSchema = z.object({
  merchant: z.string(),
  orderNumber: z.string(),
  items: z.array(
    z.object({
      productName: z.string(),
      quantity: z.coerce.number(),
      unitPrice: z.coerce.number(),
      subtotal: z.coerce.number(),
      notes: z.string().optional(),
    }),
  ),
  deliveryAddress: z.object({
    street: z.string(),
    barangay: z.string(),
    city: z.string(),
    province: z.string(),
    location: z.array(z.coerce.number()),
  }),
  payment: z.object({
    method: z.enum(["Cash", "Card", "GCash", "Maya"]),
    status: z.enum(["Pending", "Paid", "Cancelled"]).default("Pending"),
    transactionId: z.string(),
  }),
  pricing: z.object({
    subtotal: z.number(),
    deliveryFee: z.number(),
    total: z.number(),
  }),
  //   status: z.enum([
  //     "Pending",
  //     "Preparing",
  //     "ReadyForPickup",
  //     "PickedUp",
  //     "OnTheWay",
  //     "Delivered",
  //     "Cancelled",
  //     "Rejected",
  //   ]),
  customerNote: z.string().optional(),
  estimatedPreparationTime: z.date(),
  estimatedDeliveryTime: z.date(),
  driverAssignedAt: z.date(),
  driverArrivedAtMerchantAt: z.date(),
  preparingAt: z.date(),
  readyForPickupAt: z.date(),
  pickedUpAt: z.date(),
  deliveredAt: z.date(),
  rejectedAt: z.date(),
  cancelledAt: z.date(),
  cancellationReason: z.string(),
});

export const createOrderSchema = orderSchema.pick({
  merchant: true,
  items: true,
  payment: true,
  pricing: true,
  customerNote: true,
});

export type createOrderInput = z.infer<typeof createOrderSchema>;

//create order schema

//change the toggleDefaultAddress from array.map to for...of loop
