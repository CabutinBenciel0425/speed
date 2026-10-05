import { z } from "zod";

const formBoolean = z.preprocess(
  (value) => (typeof value === "string" ? value === "true" : value),
  z.boolean(),
);
const formStringArray = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : value.split(",");
  } catch {
    return value.split(",");
  }
}, z.array(z.string()));

export const productSchema = z.object({
  category: z.string(),
  name: z.string().min(2, "Product name must be atleast 2 characters long"),
  description: z.string().optional(),
  price: z.coerce.number().min(0).max(100000),
  preparationTime: z.coerce.number().min(0).max(600), //600minutes or 10hours
  ingredients: formStringArray,
  tags: formStringArray,
  isAvailable: formBoolean,
  isFeatured: formBoolean,
});

export const productSchemaUpdate = productSchema
  .pick({
    category: true,
    name: true,
    description: true,
    price: true,
    preparationTime: true,
    ingredients: true,
    tags: true,
    isAvailable: true,
    isFeatured: true,
  })
  .partial();

export type UpdateProductInput = z.infer<typeof productSchemaUpdate>;
export type ProductInput = z.infer<typeof productSchema>;
