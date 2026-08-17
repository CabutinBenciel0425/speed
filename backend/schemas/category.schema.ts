import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Name of the category is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  displayOrder: z.coerce.number().default(0),
});

export const createCategorySchema = categorySchema.pick({
  name: true,
  description: true,
  displayOrder: true,
});

export const categoryUpdateSchema = categorySchema.partial({
  name: true,
  slug: true,
  description: true,
  displayOrder: true,
});

export type CategoryInput = z.infer<typeof createCategorySchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
