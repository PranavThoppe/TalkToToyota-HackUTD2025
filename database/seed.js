// Script to seed Firestore with vehicle data
// Usage: node seed.js (requires Firebase Admin SDK)

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
// Make sure to set GOOGLE_APPLICATION_CREDENTIALS environment variable
// or pass service account key directly
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : require(process.env.GOOGLE_APPLICATION_CREDENTIALS || './serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// Read seed data
const seedData = JSON.parse(
  readFileSync(join(__dirname, 'seed-data.json'), 'utf8')
);

async function seedDatabase() {
  console.log('Starting database seed...');
  
  const batch = db.batch();
  let count = 0;

  for (const vehicle of seedData) {
    const vehicleRef = db.collection('vehicles').doc(vehicle.id);
    batch.set(vehicleRef, vehicle);
    count++;
  }

  await batch.commit();
  console.log(`✅ Successfully seeded ${count} vehicles to Firestore!`);
}

seedDatabase()
  .then(() => {
    console.log('Seed completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
  });
