# Database Setup

This directory contains Firebase Firestore configuration and seed data.

## Files

- `firestore.rules` - Firestore security rules
- `seed-data.json` - Initial vehicle data to import into Firestore

## Setup Instructions

### 1. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 2. Import Seed Data

1. Go to Firebase Console → Firestore Database
2. Create a collection named `vehicles`
3. Import the data from `seed-data.json` into the collection
4. Each vehicle document should have the vehicle `id` as the document ID

Alternatively, you can use a script to import the data programmatically.

## Firestore Structure

```
vehicles/
  ├── {vehicleId}/
  │   ├── id: string
  │   ├── name: string
  │   ├── price: number
  │   ├── msrp: number
  │   ├── category: string
  │   ├── type: string
  │   ├── badges: string[]
  │   └── image: string
```

## Security Rules

The Firestore rules allow:
- Authenticated users to read vehicles
- Only admins (via Admin SDK) can write vehicles
- Users can read/write their own preferences and conversation history
