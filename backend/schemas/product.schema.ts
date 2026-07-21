import { z } from "zod";

export const productSchema = z.object({
  category: z.string(),
  name: z.string().min(2, "Product name must be atleast 2 characters long"),
  description: z.string().optional(),
  price: z.number().min(0).max(100000),
  preparationTime: z.number().min(0).max(600), //600minutes or 10hours
  ingredients: z.array(z.string()),
  tags: z.array(z.string()),
  isAvailable: z.boolean(),
  isFeatured: z.boolean(),
});

const productSchemaUpdate = productSchema.partial({
  name: true,
  description: true,
  price: true,
  preparationTime: true,
  ingredients: true,
  tags: true,
});

export type UpdateProductInput = z.infer<typeof productSchemaUpdate>;
export type ProductInput = z.infer<typeof productSchema>;
