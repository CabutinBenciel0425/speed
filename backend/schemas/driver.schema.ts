import { z } from "zod";

export const driverSchema = z
  .object({
    vehicleType: z.enum(["Motorcycle", "Bicycle"]),

    plateNumber: z
      .string()
      .trim()
      .toUpperCase()
      .min(6, "Plate number must be at least 6 characters.")
      .max(8, "Plate number cannot exceed 8 characters.")
      .regex(/^[A-Z0-9]+$/, "Only letters and numbers are allowed.")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.vehicleType === "Motorcycle") {
      if (!data.plateNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["plateNumber"],
          message: "Plate number is required.",
        });
        return;
      }
    }
  });

export type DriverInput = z.infer<typeof driverSchema>;
