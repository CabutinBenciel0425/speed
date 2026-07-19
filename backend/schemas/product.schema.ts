import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Product name must be atleast 2 characters long"),
  description: z.string().optional(),
  price: z.number().min(0).max(100000),
});

export type ProductInput = z.infer<typeof productSchema>;
