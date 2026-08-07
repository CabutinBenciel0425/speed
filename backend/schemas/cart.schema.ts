import { z } from "zod";

export const itemSchema = z.object({
  product: z.string(),
  quantity: z.number(),
  notes: z.string().optional(),
  payment: z.enum(["Cash", "QRPh"]),
});

export const cartSchema = z.object({
  items: z.array(itemSchema),
});

export type addToCartInput = z.infer<typeof itemSchema>;
