/**
 * updateImageURLs.js
 * ─────────────────────────────────────────────────────────────────────────────
 * One-time script: builds Supabase photo URLs and saves them to MongoDB.
 *
 * HOW TO RUN:
 *   node updateImageURLs.js
 *
 * URL pattern used:
 *   <SUPABASE_URL>/storage/v1/object/public/destination-images/<folder>/<folder>-1.jpg
 *
 * Edit FOLDER_MAP below if your folder names differ.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Destination from './Models/destinationModel.js';

dotenv.config();

const MONGO_URI = process.env.MONGOOSEURI;
const SUPABASE_URL = process.env.SUPABASE_URL;
const BUCKET = 'destination-images';
const TOTAL_PHOTOS = 5; // each destination has 5 photos

// ── FOLDER MAP ───────────────────────────────────────────────────────────────
// Key   = exact destination name in MongoDB
// Value = folder name inside Supabase bucket
// ─────────────────────────────────────────────────────────────────────────────
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

// ── Helper: build 5 photo URLs for a given folder ────────────────────────────
const CACHE_BUST = Date.now(); // changes every time the script runs
function buildUrls(folder) {
  return Array.from({ length: TOTAL_PHOTOS }, (_, i) =>
    `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${folder}/${folder}-${i + 1}.jpg?v=${CACHE_BUST}`
  );
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  const destinations = await Destination.find({});
  console.log(`📍 Found ${destinations.length} destinations in MongoDB\n`);

  let updatedCount = 0;

  for (const dest of destinations) {
    const folder = FOLDER_MAP[dest.name];

    if (!folder) {
      console.log(`⚠️  "${dest.name}" — not in FOLDER_MAP, skipping`);
      continue;
    }

    const urls = buildUrls(folder);

    console.log(`✅ "${dest.name}" → folder "${folder}"`);
    urls.forEach(u => console.log(`   ${u}`));

    await Destination.findByIdAndUpdate(dest._id, {
      $set: { imageURLs: urls },
    });

    console.log(`   💾 MongoDB updated!\n`);
    updatedCount++;
  }

  console.log('─'.repeat(60));
  console.log(`✅ Done! Updated ${updatedCount} / ${destinations.length} destinations.`);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Script error:', err);
  process.exit(1);
});
