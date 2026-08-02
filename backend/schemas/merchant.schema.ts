import { z } from "zod";

const dayHoursSchema = z
  .object({
    isOpen: z.coerce.boolean().default(false),
    openHour: z.coerce.number().min(0).max(23).optional(),
    openMinute: z.coerce.number().min(0).max(59).optional(),
    closeHour: z.coerce.number().min(0).max(23).optional(),
    closeMinute: z.coerce.number().min(0).max(59).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isOpen) {
      // Required fields when isOpen is true
      const requiredFields = [
        "openHour",
        "openMinute",
        "closeHour",
        "closeMinute",
      ] as const;
      for (const field of requiredFields) {
        if (data[field] === undefined || data[field] === null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message: `${field} is required when restaurant is open`,
          });
        }
      }

      // Validate time order
      if (
        data.openHour !== undefined &&
        data.openMinute !== undefined &&
        data.closeHour !== undefined &&
        data.closeMinute !== undefined
      ) {
        const openMinutes = data.openHour * 60 + data.openMinute;
        const closeMinutes = data.closeHour * 60 + data.closeMinute;

        if (openMinutes >= closeMinutes) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["closeHour"],
            message: "Closing time must be after opening time",
          });
        }
      }
    }
  });

const operatingHoursSchema = z.object({
  Monday: dayHoursSchema,
  Tuesday: dayHoursSchema,
  Wednesday: dayHoursSchema,
  Thursday: dayHoursSchema,
  Friday: dayHoursSchema,
  Saturday: dayHoursSchema,
  Sunday: dayHoursSchema,
});

export const merchantSchema = z.object({
  merchantName: z
    .string()
    .min(2, "Merchant name must be atleast 2 characters long"),
  description: z.string().optional(),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^(\+63|0)[0-9]{10}$/, "Invalid Philippine phone number format"),
  address: z.object({
    location: z
      .object({
        type: z.enum(["Point"]).default("Point"),
        coordinates: z.array(z.coerce.number()),
      })
      .optional(),
    street: z.string().min(1, "Street is required"),
    barangay: z.string().min(1, "Barangay is required"),
    city: z.string().min(1, "City is required"),
    province: z.string().min(1, "Province is required"),
  }),
  operatingHours: operatingHoursSchema,
  minimumOrder: z.coerce.number().min(1),
  status: z.enum(["Pending", "Operating", "Closed"]).default("Pending"),
});

const merchantSignUpInput = merchantSchema.pick({
  merchantName: true,
  description: true,
  phoneNumber: true,
  address: true,
  operatingHours: true,
  minimumOrder: true,
});

export const merchantUpdateInput = merchantSchema
  .pick({
    merchantName: true,
    description: true,
    phoneNumber: true,
    address: true,
    operatingHours: true,
    minimumOrder: true,
  })
  .partial();

export type merchantInput = z.infer<typeof merchantSignUpInput>;
export type merchantUpdateInput = z.infer<typeof merchantUpdateInput>;
