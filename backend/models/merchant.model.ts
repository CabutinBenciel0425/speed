import mongoose, { model, Schema } from "mongoose";

export const merchantSchema = new Schema({
  owner: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  merchantName: {
    type: String,
    required: [true, "Merchant name is required"],
    unique: [true, "This merchant name is taken"],
    min: [2, "Merchant name must be atleast 2 character long"],
  },
  desciption: {
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
    mapCoordinates: {
      lat: {
        type: Number,
      },
      lng: {
        type: Number,
      },
    },
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    instructions: {
      type: String,
    },
  },
  operatingHours: {
    Monday: {
      isOpen: Boolean,
      openHour: {
        type: Number,
        min: 0,
        max: 23,
        required: function () {
          return this.isOpen === true;
        },
      },
      openMinute: {
        type: Number,
        min: 0,
        max: 59,
        required: function () {
          return this.isOpen === true;
        },
      },
      closeHour: {
        type: Number,
        min: 0,
        max: 23,
        required: function () {
          return this.isOpen === true;
        },
      },
      closeMinute: {
        type: Number,
        min: 0,
        max: 59,
        required: function () {
          return this.isOpen === true;
        },
      },
    },
    Tuesday: {
      isOpen: Boolean,
      openHour: {
        type: Number,
        min: 0,
        max: 23,
        required: function () {
          return this.isOpen === true;
        },
      },
      openMinute: {
        type: Number,
        min: 0,
        max: 59,
        required: function () {
          return this.isOpen === true;
        },
      },
      closeHour: {
        type: Number,
        min: 0,
        max: 23,
        required: function () {
          return this.isOpen === true;
        },
      },
      closeMinute: {
        type: Number,
        min: 0,
        max: 59,
        required: function () {
          return this.isOpen === true;
        },
      },
    },
    Wednesday: {
      isOpen: Boolean,
      openHour: {
        type: Number,
        min: 0,
        max: 23,
        required: function () {
          return this.isOpen === true;
        },
      },
      openMinute: {
        type: Number,
        min: 0,
        max: 59,
        required: function () {
          return this.isOpen === true;
        },
      },
      closeHour: {
        type: Number,
        min: 0,
        max: 23,
        required: function () {
          return this.isOpen === true;
        },
      },
      closeMinute: {
        type: Number,
        min: 0,
        max: 59,
        required: function () {
          return this.isOpen === true;
        },
      },
    },
    Thursday: {
      isOpen: Boolean,
      openHour: {
        type: Number,
        min: 0,
        max: 23,
        required: function () {
          return this.isOpen === true;
        },
      },
      openMinute: {
        type: Number,
        min: 0,
        max: 59,
        required: function () {
          return this.isOpen === true;
        },
      },
      closeHour: {
        type: Number,
        min: 0,
        max: 23,
        required: function () {
          return this.isOpen === true;
        },
      },
      closeMinute: {
        type: Number,
        min: 0,
        max: 59,
        required: function () {
          return this.isOpen === true;
        },
      },
    },
    Friday: {
      isOpen: Boolean,
      openHour: {
        type: Number,
        min: 0,
        max: 23,
        required: function () {
          return this.isOpen === true;
        },
      },
      openMinute: {
        type: Number,
        min: 0,
        max: 59,
        required: function () {
          return this.isOpen === true;
        },
      },
      closeHour: {
        type: Number,
        min: 0,
        max: 23,
        required: function () {
          return this.isOpen === true;
        },
      },
      closeMinute: {
        type: Number,
        min: 0,
        max: 59,
        required: function () {
          return this.isOpen === true;
        },
      },
    },
    Saturday: {
      isOpen: Boolean,
      openHour: {
        type: Number,
        min: 0,
        max: 23,
        required: function () {
          return this.isOpen === true;
        },
      },
      openMinute: {
        type: Number,
        min: 0,
        max: 59,
        required: function () {
          return this.isOpen === true;
        },
      },
      closeHour: {
        type: Number,
        min: 0,
        max: 23,
        required: function () {
          return this.isOpen === true;
        },
      },
      closeMinute: {
        type: Number,
        min: 0,
        max: 59,
        required: function () {
          return this.isOpen === true;
        },
      },
    },
    Sunday: {
      isOpen: Boolean,
      openHour: {
        type: Number,
        min: 0,
        max: 23,
        required: function () {
          return this.isOpen === true;
        },
      },
      openMinute: {
        type: Number,
        min: 0,
        max: 59,
        required: function () {
          return this.isOpen === true;
        },
      },
      closeHour: {
        type: Number,
        min: 0,
        max: 23,
        required: function () {
          return this.isOpen === true;
        },
      },
      closeMinute: {
        type: Number,
        min: 0,
        max: 59,
        required: function () {
          return this.isOpen === true;
        },
      },
    },
  },
  deliveryFee: {
    type: Number,
    required: true,
  },
  minimumOrder: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Operating", "Closed"],
  },
});

const Merchant = model("Merchant", merchantSchema);
export default Merchant;
