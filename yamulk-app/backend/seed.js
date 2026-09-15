import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Destination from './Models/destinationModel.js';
import { destinations } from '../frontend/src/data/mockData.js';

dotenv.config();

const MONGO_URI = process.env.MONGOOSEURI || "mongodb://localhost:27017/yamulk";
const SUPABASE_URL = process.env.SUPABASE_URL;
const BUCKET = 'destination-images';
const TOTAL_PHOTOS = 5;

// Supabase folder name for each destination
const FOLDER_MAP = {
  'Mirissa Beach':          'mirissa',
  'Diyaluma Falls':         'diyaluma',
  'Ella Rock':              'ella',
  'Sigiriya Rock Fortress': 'sigiriya',
  'Anuradhapura':           'anuradhapura',
  'Polonnaruwa':            'polonnaruwa',
  'Nilaveli Beach':         'nilaweli',
  "Adam's Peak (Sri Pada)": 'adamspeak',
};

function buildImageUrls(folder) {
  if (!SUPABASE_URL || !folder) return [];
  return Array.from({ length: TOTAL_PHOTOS }, (_, i) =>
    `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${folder}/${folder}-${i + 1}.jpg`
  );
}

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    await Destination.deleteMany({});
    console.log("Cleared existing destinations.");

    const destinationsToInsert = destinations.map((d, index) => {
      const location = `${d.name}, ${d.province}, Sri Lanka`;
      const folder = FOLDER_MAP[d.name];
      const imageURLs = buildImageUrls(folder);

      return {
        name: d.name,
        category: d.category,
        province: d.province,
        description: d.description,
        imageURLs,
        location,
        latitude: d.lat || d.latitude || 0,
        longitude: d.lng || d.longitude || 0,
        averageRating: d.rating || 0,
        estimatedCost: d.costPerDay || 0,
        popularity: destinations.length - index,
        distance: d.distance,
        emoji: d.emoji,
        color: d.color,
        tags: d.tags || [],
        nearby: {
          hotels: d.nearby?.hotels || [],
          restaurants: d.nearby?.restaurants || [],
          attractions: d.nearby?.attractions || [],
        },
        photos: d.photos || [],
        bestTime: d.bestTime,
        highlights: d.highlights || [],
      };
    });

    const inserted = await Destination.insertMany(destinationsToInsert);
    console.log(`Successfully seeded ${inserted.length} destinations with images and coordinates.`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
