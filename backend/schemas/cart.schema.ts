import { z } from "zod";

export const itemSchema = z.object({
  product: z.string(),
  quantity: z.number(),
  notes: z.string().optional(),
});

export const cartSchema = z.object({
  items: z.array(itemSchema),
});

export type addToCartInput = z.infer<typeof itemSchema>;
