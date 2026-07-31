import { z } from "zod";

export const reviewschema = z.object({
  rating: z.number(),
  comment: z.string().optional(),
});

export type reviewInput = z.infer<typeof reviewschema>;
