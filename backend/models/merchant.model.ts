import mongoose, { model, Schema, Document, Types } from "mongoose";

export interface IMerchant extends Document {
  owner: Types.ObjectId;
  merchantName: string;
  description?: string;
  phoneNumber: string;
  logo: string;
  banner: string;
  address: {
    location: {
      type: string;
      coordinates: number[];
    };
    street: string;
    barangay: string;
    city: string;
    province: string;
  };
  operatingHours: {
    Monday: {
      isOpen: boolean;
      openHour: number;
      openMinute: number;
      closeHour: number;
      closeMinute: number;
    };
    Tuesday: {
      isOpen: boolean;
      openHour: number;
      openMinute: number;
      closeHour: number;
      closeMinute: number;
    };
    Wednesday: {
      isOpen: boolean;
      openHour: number;
      openMinute: number;
      closeHour: number;
      closeMinute: number;
    };
    Thursday: {
      isOpen: boolean;
      openHour: number;
      openMinute: number;
      closeHour: number;
      closeMinute: number;
    };
    Friday: {
      isOpen: boolean;
      openHour: number;
      openMinute: number;
      closeHour: number;
      closeMinute: number;
    };
    Saturday: {
      isOpen: boolean;
      openHour: number;
      openMinute: number;
      closeHour: number;
      closeMinute: number;
    };
    Sunday: {
      isOpen: boolean;
      openHour: number;
      openMinute: number;
      closeHour: number;
      closeMinute: number;
    };
  };
  minimumOrder: number;
  status: "Pending" | "Approved" | "Rejected" | "Open" | "Closed" | "Suspended";
  completedOrders: number;
  totalRevenue: number;
  ratingCount: number;
  averageRating: number;
}

export const merchantSchema = new Schema<IMerchant>(
  {
    owner: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    merchantName: {
      type: String,
      required: [true, "Merchant name is required"],
      unique: [true, "This merchant name is taken"],
      min: [2, "Merchant name must be atleast 2 character long"],
    },
    description: {
      type: String,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
    },
    logo: {
      type: String,
      required: [true, "Logo is required"],
    },
    banner: {
      type: String,
    },
    address: {
      location: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number],
          required: true,
          index: "2dsphere",
          validate: {
            validator: function (v: number[] | undefined): v is number[] {
              if (!v) return false;
              if (v.length !== 2) return false;

              const lng = v[0];
              const lat = v[1];

              return (
                typeof lng === "number" &&
                typeof lat === "number" &&
                lng >= -180 &&
                lng <= 180 &&
                lat >= -90 &&
                lat <= 90
              );
            },
            message:
              "Coordinates must be [longitude latitude] with valid ranges",
          },
        },
      },

      street: {
        type: String,
        required: true,
      },
      barangay: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      province: {
        type: String,
        required: true,
      },
    },
    operatingHours: {
      Monday: {
        isOpen: {
          type: Boolean,
          required: function (this: any) {
            return this.status === "Open";
          },
        },
        openHour: {
          type: Number,
          min: 0,
          max: 23,
          required: function (this: any) {
            return this.operatingHours.Monday.isOpen === true;
          },
        },
        openMinute: {
          type: Number,
          min: 0,
          max: 59,
          required: function (this: any) {
            return this.operatingHours.Monday.isOpen === true;
          },
        },
        closeHour: {
          type: Number,
          min: 0,
          max: 23,
          required: function (this: any) {
            return this.operatingHours.Monday.isOpen === true;
          },
        },
        closeMinute: {
          type: Number,
          min: 0,
          max: 59,
          required: function (this: any) {
            return this.operatingHours.Monday.isOpen === true;
          },
        },
      },
      Tuesday: {
        isOpen: {
          type: Boolean,
          required: function (this: any) {
            return this.status === "Open";
          },
        },
        openHour: {
          type: Number,
          min: 0,
          max: 23,
          required: function (this: any) {
            return this.operatingHours.Tuesday.isOpen === true;
          },
        },
        openMinute: {
          type: Number,
          min: 0,
          max: 59,
          required: function (this: any) {
            return this.operatingHours.Tuesday.isOpen === true;
          },
        },
        closeHour: {
          type: Number,
          min: 0,
          max: 23,
          required: function (this: any) {
            return this.operatingHours.Tuesday.isOpen === true;
          },
        },
        closeMinute: {
          type: Number,
          min: 0,
          max: 59,
          required: function (this: any) {
            return this.operatingHours.Tuesday.isOpen === true;
          },
        },
      },
      Wednesday: {
        isOpen: {
          type: Boolean,
          required: function (this: any) {
            return this.status === "Open";
          },
        },
        openHour: {
          type: Number,
          min: 0,
          max: 23,
          required: function (this: any) {
            return this.operatingHours.Wednesday.isOpen === true;
          },
        },
        openMinute: {
          type: Number,
          min: 0,
          max: 59,
          required: function (this: any) {
            return this.operatingHours.Wednesday.isOpen === true;
          },
        },
        closeHour: {
          type: Number,
          min: 0,
          max: 23,
          required: function (this: any) {
            return this.operatingHours.Wednesday.isOpen === true;
          },
        },
        closeMinute: {
          type: Number,
          min: 0,
          max: 59,
          required: function (this: any) {
            return this.operatingHours.Wednesday.isOpen === true;
          },
        },
      },
      Thursday: {
        isOpen: {
          type: Boolean,
          required: function (this: any) {
            return this.status === "Open";
          },
        },
        openHour: {
          type: Number,
          min: 0,
          max: 23,
          required: function (this: any) {
            return this.operatingHours.Thursday.isOpen === true;
          },
        },
        openMinute: {
          type: Number,
          min: 0,
          max: 59,
          required: function (this: any) {
            return this.operatingHours.Thursday.isOpen === true;
          },
        },
        closeHour: {
          type: Number,
          min: 0,
          max: 23,
          required: function (this: any) {
            return this.operatingHours.Thursday.isOpen === true;
          },
        },
        closeMinute: {
          type: Number,
          min: 0,
          max: 59,
          required: function (this: any) {
            return this.operatingHours.Thursday.isOpen === true;
          },
        },
      },
      Friday: {
        isOpen: {
          type: Boolean,
          required: function (this: any) {
            return this.status === "Open";
          },
        },
        openHour: {
          type: Number,
          min: 0,
          max: 23,
          required: function (this: any) {
            return this.operatingHours.Friday.isOpen === true;
          },
        },
        openMinute: {
          type: Number,
          min: 0,
          max: 59,
          required: function (this: any) {
            return this.operatingHours.Friday.isOpen === true;
          },
        },
        closeHour: {
          type: Number,
          min: 0,
          max: 23,
          required: function (this: any) {
            return this.operatingHours.Friday.isOpen === true;
          },
        },
        closeMinute: {
          type: Number,
          min: 0,
          max: 59,
          required: function (this: any) {
            return this.operatingHours.Friday.isOpen === true;
          },
        },
      },
      Saturday: {
        isOpen: {
          type: Boolean,
          required: function (this: any) {
            return this.status === "Open";
          },
        },
        openHour: {
          type: Number,
          min: 0,
          max: 23,
          required: function (this: any) {
            return this.operatingHours.Saturday.isOpen === true;
          },
        },
        openMinute: {
          type: Number,
          min: 0,
          max: 59,
          required: function (this: any) {
            return this.operatingHours.Saturday.isOpen === true;
          },
        },
        closeHour: {
          type: Number,
          min: 0,
          max: 23,
          required: function (this: any) {
            return this.operatingHours.Saturday.isOpen === true;
          },
        },
        closeMinute: {
          type: Number,
          min: 0,
          max: 59,
          required: function (this: any) {
            return this.operatingHours.Saturday.isOpen === true;
          },
        },
      },
      Sunday: {
        isOpen: {
          type: Boolean,
          required: function (this: any) {
            return this.status === "Open";
          },
        },
        openHour: {
          type: Number,
          min: 0,
          max: 23,
          required: function (this: any) {
            return this.operatingHours.Sunday.isOpen === true;
          },
        },
        openMinute: {
          type: Number,
          min: 0,
          max: 59,
          required: function (this: any) {
            return this.operatingHours.Sunday.isOpen === true;
          },
        },
        closeHour: {
          type: Number,
          min: 0,
          max: 23,
          required: function (this: any) {
            return this.operatingHours.Sunday.isOpen === true;
          },
        },
        closeMinute: {
          type: Number,
          min: 0,
          max: 59,
          required: function (this: any) {
            return this.operatingHours.Sunday.isOpen === true;
          },
        },
      },
    },
    minimumOrder: {
      type: Number,
      required: true,
      min: [0, "Minimum order cannot be a negative number"],
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Open", "Closed", "Suspended"],
      default: "Pending",
    },
    completedOrders: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
      min: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  { timestamps: true },
);

merchantSchema.index({
  "address.location": "2dsphere",
});

const Merchant = model<IMerchant>("Merchant", merchantSchema);
export default Merchant;
