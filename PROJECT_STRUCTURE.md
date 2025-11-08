# Project Structure Overview

This document provides a detailed overview of the TalkToToyota project structure.

## Directory Structure

```
TalkToToyota-HackUTD2025/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── ui/          # shadcn/ui components (buttons, cards, etc.)
│   │   │   ├── vehicles/    # Vehicle-related components
│   │   │   │   └── VehicleList.tsx
│   │   │   ├── voice/       # Voice assistant components
│   │   │   │   ├── VoiceButton.tsx
│   │   │   │   └── VoiceAssistant.tsx
│   │   │   ├── chat/        # Chat interface components
│   │   │   │   ├── ChatInterface.tsx
│   │   │   │   └── MessageBubble.tsx
│   │   │   ├── VehicleCard.tsx
│   │   │   ├── CategoryTabs.tsx
│   │   │   └── SearchBar.tsx
│   │   ├── services/        # External service integrations
│   │   │   ├── firebase.ts  # Firebase/Firestore configuration
│   │   │   ├── auth0.ts     # Auth0 configuration
│   │   │   └── api.ts       # Backend API client
│   │   ├── hooks/           # Custom React hooks
│   │   │   ├── useVoice.ts  # Voice recognition and TTS
│   │   │   ├── useFirebase.ts # Firebase data fetching
│   │   │   └── use-toast.ts
│   │   ├── types/           # TypeScript type definitions
│   │   │   └── vehicle.ts   # Vehicle interface
│   │   ├── pages/           # Page components
│   │   │   ├── Index.tsx    # Main page
│   │   │   └── NotFound.tsx
│   │   ├── lib/             # Utility functions
│   │   │   └── utils.ts
│   │   ├── App.tsx          # Root component
│   │   └── main.tsx         # Entry point
│   ├── public/              # Static assets
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── backend/                  # Node.js/Express backend
│   ├── src/
│   │   ├── routes/          # API routes
│   │   │   ├── voice.ts     # Voice/TTS endpoints
│   │   │   └── ai.ts        # AI conversation endpoints
│   │   ├── services/        # Business logic
│   │   │   ├── elevenlabs.ts # ElevenLabs TTS integration
│   │   │   ├── openrouter.ts # OpenRouter API (AI conversations)
│   │   │   └── ai.ts        # AI conversation logic
│   │   ├── config/          # Configuration
│   │   │   └── env.ts       # Environment variables
│   │   └── index.ts         # Express app entry point
│   ├── package.json
│   └── tsconfig.json
│
├── database/                 # Firebase configuration
│   ├── firestore.rules      # Firestore security rules
│   ├── seed-data.json       # Initial vehicle data
│   └── README.md            # Database setup instructions
│
├── package.json              # Root package.json (workspace management)
├── README.md                 # Main project README
├── QUICKSTART.md            # Quick start guide
└── .gitignore               # Git ignore rules
```

## Key Files and Their Purposes

### Frontend

#### Components
- **VehicleCard.tsx**: Displays individual vehicle information
- **VehicleList.tsx**: Grid layout for multiple vehicles
- **VoiceAssistant.tsx**: Full voice interaction component with AI
- **VoiceButton.tsx**: Simple button to toggle voice listening
- **ChatInterface.tsx**: Text-based chat with AI
- **SearchBar.tsx**: Search input with AI-powered filtering
- **CategoryTabs.tsx**: Category navigation tabs

#### Services
- **firebase.ts**: Firebase initialization and Firestore connection
- **auth0.ts**: Auth0 authentication configuration
- **api.ts**: Backend API client functions

#### Hooks
- **useVoice.ts**: Web Speech API integration for speech-to-text and TTS
- **useFirebase.ts**: Firebase data fetching hooks

#### Types
- **vehicle.ts**: Vehicle data structure definition

### Backend

#### Routes
- **voice.ts**: 
  - `POST /api/voice/speak` - Convert text to speech (ElevenLabs)
- **ai.ts**: 
  - `POST /api/ai/conversation` - Get AI conversation response

#### Services
- **elevenlabs.ts**: ElevenLabs TTS API integration
- **openrouter.ts**: OpenRouter API integration (placeholder for future use)
- **ai.ts**: AI conversation generation using OpenRouter/Claude

### Database

- **firestore.rules**: Security rules for Firestore
- **seed-data.json**: Initial vehicle data to import

## Data Flow

### Voice Interaction Flow
1. User clicks "Start Listening"
2. Browser Web Speech API captures audio
3. Speech is converted to text (client-side)
4. Text is sent to backend `/api/ai/conversation`
5. Backend calls OpenRouter API with vehicle context
6. AI response is returned to frontend
7. Frontend calls backend `/api/voice/speak` with response text
8. Backend calls ElevenLabs API to generate speech
9. Audio is streamed back to frontend and played

### Vehicle Data Flow
1. Frontend calls `useVehicles()` hook
2. Hook queries Firestore `vehicles` collection
3. Data is filtered by category and search query
4. Vehicles are displayed in grid layout

### Chat Interaction Flow
1. User types message in chat interface
2. Message is sent to backend `/api/ai/conversation`
3. Backend generates AI response
4. Response is displayed in chat interface

## Environment Variables

### Frontend (.env)
- `VITE_FIREBASE_*`: Firebase configuration
- `VITE_AUTH0_*`: Auth0 configuration
- `VITE_API_BASE_URL`: Backend API URL

### Backend (.env)
- `PORT`: Server port (default: 3001)
- `OPENROUTER_API_KEY`: OpenRouter API key
- `ELEVENLABS_API_KEY`: ElevenLabs API key
- `ELEVENLABS_VOICE_ID`: ElevenLabs voice ID

## Technology Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Firebase SDK
- Auth0 React SDK
- Web Speech API (browser-native)

### Backend
- Node.js
- Express
- TypeScript
- ElevenLabs SDK
- OpenRouter API (via Axios)

### Database
- Firebase Firestore

## Development Workflow

1. **Frontend Development**: Work in `frontend/` directory
2. **Backend Development**: Work in `backend/` directory
3. **Database Setup**: Use `database/` files for Firestore configuration
4. **Running**: Use `npm run dev` to start both frontend and backend

## Adding New Features

### Adding a New Vehicle Field
1. Update `frontend/src/types/vehicle.ts`
2. Update Firestore seed data if needed
3. Update components that display vehicle data

### Adding a New API Endpoint
1. Create route in `backend/src/routes/`
2. Create service in `backend/src/services/` if needed
3. Add client function in `frontend/src/services/api.ts`
4. Use in frontend components

### Adding a New UI Component
1. Create component in `frontend/src/components/`
2. Use shadcn/ui components for styling
3. Import and use in pages
