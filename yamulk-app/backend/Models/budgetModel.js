import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
      unique: true,
    },
    transport: {
      type: Number,
      default: 0,
      min: 0,
    },
    accommodation: {
      type: Number,
      default: 0,
      min: 0,
    },
    food: {
      type: Number,
      default: 0,
      min: 0,
    },
    other: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    userBudget: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["under-budget", "on-budget", "over-budget"],
      default: "under-budget",
    },
  },
  {
    timestamps: true,
  }
);

budgetSchema.pre("validate", function (next) {
  this.totalCost =
    this.transport +
    this.accommodation +
    this.food +
    this.other;

  if (this.totalCost > this.userBudget) {
    this.status = "over-budget";
  } else if (this.totalCost === this.userBudget) {
    this.status = "on-budget";
  } else {
    this.status = "under-budget";
  }

  next();
});

const Budget = mongoose.model("Budget", budgetSchema);

export default Budget;