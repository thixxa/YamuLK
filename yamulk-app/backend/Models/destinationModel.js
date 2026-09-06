import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Destination name is required"], trim: true, maxlength: 150 },
    category: { type: String, required: true, trim: true },
    province: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    imageURLs: { type: [String], default: [] },
    location: { type: String, required: true, trim: true },
    latitude: { type: Number },
    longitude: { type: Number },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    estimatedCost: { type: Number, required: true, min: 0 },
    popularity: { type: Number, default: 0, min: 0 },
    
    // Additional fields for frontend integration
    distance: { type: String, trim: true },
    emoji: { type: String },
    color: { type: String },
    tags: { type: [String], default: [] },
    nearby: {
      hotels: { type: [String], default: [] },
      restaurants: { type: [String], default: [] },
      attractions: { type: [String], default: [] },
    },
    photos: { type: [String], default: [] },
    bestTime: { type: String, trim: true },
    highlights: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

const Destination = mongoose.model("Destination", destinationSchema);

export default Destination;