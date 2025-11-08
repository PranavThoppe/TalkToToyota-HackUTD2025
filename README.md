# TalkToToyota - HackUTD 2025

A conversational AI car salesman application featuring voice interaction, intelligent vehicle recommendations, and real-time chat capabilities.

## 🚀 Features

- **Voice Assistant**: Interactive voice AI using ElevenLabs and OpenRouter APIs
- **Chat Interface**: Text-based conversation with AI car salesman
- **Vehicle Database**: Firebase Firestore integration for vehicle data
- **Smart Search**: AI-powered vehicle search and filtering
- **Authentication**: Auth0 integration for user management
- **Modern UI**: Built with React, TypeScript, Tailwind CSS, and shadcn/ui

## 📁 Project Structure

```
TalkToToyota-HackUTD2025/
├── frontend/          # React/TypeScript frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/          # shadcn/ui components
│   │   │   ├── vehicles/    # Vehicle-related components
│   │   │   ├── voice/       # Voice assistant components
│   │   │   └── chat/        # Chat interface components
│   │   ├── services/        # Firebase, Auth0, API clients
│   │   ├── hooks/           # Custom React hooks
│   │   ├── types/           # TypeScript type definitions
│   │   └── pages/           # Page components
│   └── package.json
│
├── backend/           # Node.js/Express backend API
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── services/        # ElevenLabs, OpenRouter, AI services
│   │   └── config/          # Configuration files
│   └── package.json
│
├── database/          # Firebase configuration
│   ├── firestore.rules      # Firestore security rules
│   └── seed-data.json       # Initial vehicle data
│
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account
- Auth0 account
- ElevenLabs API key
- OpenRouter API key

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
npm install --workspace=frontend

# Install backend dependencies
npm install --workspace=backend
```

Or use the convenience script:

```bash
npm run install:all
```

### 2. Configure Environment Variables

#### Frontend (.env file in `frontend/` directory)

Create `frontend/.env`:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Auth0 Configuration
VITE_AUTH0_DOMAIN=your_auth0_domain
VITE_AUTH0_CLIENT_ID=your_auth0_client_id
VITE_AUTH0_AUDIENCE=your_auth0_audience

# Backend API
VITE_API_BASE_URL=http://localhost:3001/api
```

#### Backend (.env file in `backend/` directory)

Create `backend/.env`:

```env
# Server Configuration
PORT=3001
NODE_ENV=development
APP_URL=http://localhost:8080

# OpenRouter API (for AI conversations and transcriptions)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# ElevenLabs API (for text-to-speech)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
```

### 3. Setup Firebase

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Copy your Firebase config to `frontend/.env`
4. Deploy Firestore rules:
   ```bash
   firebase deploy --only firestore:rules
   ```
5. Import seed data from `database/seed-data.json` into Firestore `vehicles` collection

### 4. Setup Auth0

1. Create an Auth0 account at [Auth0](https://auth0.com/)
2. Create a new application (Single Page Application)
3. Configure allowed callback URLs, logout URLs, and web origins
4. Copy your Auth0 credentials to `frontend/.env`

### 5. Run the Application

#### Development Mode (both frontend and backend)

```bash
npm run dev
```

#### Run Frontend Only

```bash
npm run dev:frontend
```

#### Run Backend Only

```bash
npm run dev:backend
```

The frontend will be available at `http://localhost:8080`
The backend API will be available at `http://localhost:3001`

## 📝 API Endpoints

### Backend API

- `GET /health` - Health check endpoint
- `POST /api/voice/transcribe` - Transcribe audio to text
- `POST /api/voice/speak` - Convert text to speech
- `POST /api/ai/conversation` - Get AI conversation response

## 🔧 Technologies Used

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Firebase SDK
- Auth0 React SDK
- Framer Motion
- React Query

### Backend
- Node.js
- Express
- TypeScript
- ElevenLabs SDK
- OpenRouter API
- Axios

### Database
- Firebase Firestore

## 🎯 Features in Development

- [ ] Extended vehicle specifications
- [ ] User preferences storage
- [ ] Conversation history
- [ ] Vehicle comparison feature
- [ ] Advanced search filters
- [ ] Image uploads for vehicles

## 📄 License

ISC

## 👥 Contributors

HackUTD 2025 Team

## 🤝 Contributing

This is a hackathon project. Feel free to fork and modify as needed!

## 📞 Support

For issues or questions, please open an issue on GitHub.