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
├── frontend/                # React + Vite app and serverless API
│   ├── api/                 # Vercel functions deployed at /api/*
│   ├── server/              # Shared API logic (Axios, ElevenLabs, financing calcs)
│   ├── src/                 # SPA source (components, pages, hooks, etc.)
│   └── package.json
│
├── database/                # Firebase configuration and seed data
│   ├── firestore.rules
│   └── seed-data.json
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
npm install             # installs workspace tooling
npm install --workspace=frontend
```

Or run the convenience script:

```bash
npm run install:all
```

### 2. Configure Environment Variables

Create `frontend/.env` (used by both the SPA and the serverless functions):

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

# API credentials
VITE_API_BASE_URL=http://localhost:3001/api   # optional for local dev; defaults to /api in production
OPENROUTER_API_KEY=your_openrouter_api_key_here

ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
APP_URL=http://localhost:5173
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

#### Development Mode

- **Frontend only (default Vite dev server)**  
  ```bash
  npm run dev
  ```  
  The SPA runs at `http://localhost:5173`.

- **Frontend + API (uses Vercel CLI)**  
  ```bash
  npm run vercel:dev
  ```  
  Requires `vercel` CLI. This mirrors the production deployment: the SPA is served at `http://localhost:3000` with the API available at `http://localhost:3000/api/*`.

If you prefer running the SPA on `localhost:5173` while hitting the serverless API, set `VITE_API_BASE_URL=http://localhost:3000/api` and run `vercel dev` in another terminal.

## 📝 API Endpoints

### Serverless API (deployed with the frontend)

- `GET /api` - API index + metadata
- `GET /api/health` - Health check
- `POST /api/voice/speak` - Convert text to speech
- `POST /api/ai/conversation` - AI conversation with financing state
- `POST /api/ai/checkout` - Checkout-specific AI assistant
- `POST /api/finance/calculate` - Financing calculator
- `GET /api/finance/apr-estimate/:creditScore` - Quick APR estimate by credit score

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

### Serverless API
- Vercel Functions (@vercel/node)
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