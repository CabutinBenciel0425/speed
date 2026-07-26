import { z } from "zod";

const driverBaseSchema = z.object({
  vehicleType: z.enum(["Motorcycle", "Bicycle"]),
  plateNumber: z
    .string()
    .trim()
    .toUpperCase()
    .min(6, "Plate number must be at least 6 characters.")
    .max(8, "Plate number cannot exceed 8 characters.")
    .regex(/^[A-Z0-9]+$/, "Only letters and numbers are allowed.")
    .optional(),
});

export const driverSchema = driverBaseSchema.superRefine((data, ctx) => {
  if (data.vehicleType === "Motorcycle" && !data.plateNumber) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["plateNumber"],
      message: "Plate number is required when vehicle is a Motorcycle.",
    });
  }
});

export const updateDriverSchema = driverBaseSchema
  .pick({
    vehicleType: true,
    plateNumber: true,
  })
  .partial()
  .superRefine((data, ctx) => {
    if (data.vehicleType === "Motorcycle" && data.plateNumber !== undefined) {
      if (!data.plateNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["plateNumber"],
          message: "Plate number cannot be empty when vehicle is a Motorcycle.",
        });
      }
    }
  });

export type DriverInput = z.infer<typeof driverSchema>;
export type DriverUpdateInput = z.infer<typeof updateDriverSchema>;
