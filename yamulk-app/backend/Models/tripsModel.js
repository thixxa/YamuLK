import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: true,
    },

    travelDate: {
      type: Date,
      required: true,
    },

    returnDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value >= this.travelDate;
        },
        message: "Return date must be on or after travel date",
      },
    },

    people: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    transportMode: {
      type: String,
      required: true,
      enum: [
        "Car",
        "Bus",
        "Train",
        "Motorcycle",
        "Bicycle",
        "Walk",
        "Other",
      ],
    },

    accommodationType: {
      type: String,
      required: true,
      trim: true,
    },

    totalBudget: {
      type: Number,
      required: true,
      min: 0,
    },

    specialNotes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    itinerary: {
      type: String,
      trim: true,
      default: "",
    },

    budgetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Budget",
      default: null,
    },

    status: {
      type: String,
      enum: ["planned", "ongoing", "completed", "cancelled"],
      default: "planned",
    },
  },
  {
    timestamps: true,
  }
);

const Trip = mongoose.model("Trip", tripSchema);

export default Trip;