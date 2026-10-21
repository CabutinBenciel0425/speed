import { z } from "zod";

export const reviewschema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(1).max(1000),
});

export const updateReviewSchema = reviewschema
  .partial()
  .refine(
    (data) => data.rating !== undefined || data.comment !== undefined,
    "Provide a rating or comment to update",
  );

export const reviewVisibilitySchema = z.object({ isHidden: z.boolean() });

export type reviewInput = z.infer<typeof reviewschema>;
