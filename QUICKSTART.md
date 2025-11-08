# Quick Start Guide

This guide will help you get the TalkToToyota application up and running quickly.

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Firebase account created
- [ ] Auth0 account created
- [ ] ElevenLabs API key
- [ ] OpenRouter API key

## Step-by-Step Setup

### 1. Clone and Install

```bash
# Install all dependencies
npm run install:all
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database
4. Go to Project Settings → General → Your apps → Web app
5. Copy the Firebase config values
6. Create `frontend/.env` and add:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```
7. Deploy Firestore rules:
   ```bash
   firebase deploy --only firestore:rules
   ```
8. Import seed data from `database/seed-data.json` into Firestore `vehicles` collection

### 3. Auth0 Setup

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Create a new Application (Single Page Application)
3. Configure:
   - Allowed Callback URLs: `http://localhost:8080`
   - Allowed Logout URLs: `http://localhost:8080`
   - Allowed Web Origins: `http://localhost:8080`
4. Copy credentials to `frontend/.env`:
   ```env
   VITE_AUTH0_DOMAIN=your_domain.auth0.com
   VITE_AUTH0_CLIENT_ID=your_client_id
   VITE_AUTH0_AUDIENCE=your_audience (optional)
   ```

### 4. Backend API Setup

Create `backend/.env`:
```env
PORT=3001
NODE_ENV=development
APP_URL=http://localhost:8080
OPENROUTER_API_KEY=your_openrouter_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
```

### 5. Run the Application

```bash
# Start both frontend and backend
npm run dev

# Or start them separately:
npm run dev:frontend  # Frontend on http://localhost:8080
npm run dev:backend   # Backend on http://localhost:3001
```

## Testing the Setup

1. Open `http://localhost:8080` in your browser
2. You should see the Toyota vehicle catalog
3. Click on "Voice Assistant" or "Chat" tab
4. Try asking: "Show me hybrid vehicles under $30,000"

## Troubleshooting

### Firebase Connection Issues
- Verify your Firebase config in `frontend/.env`
- Check that Firestore is enabled in Firebase Console
- Ensure vehicles collection exists with seed data

### Auth0 Issues
- Verify callback URLs are correctly configured
- Check that your Auth0 domain and client ID are correct

### Backend API Issues
- Ensure backend is running on port 3001
- Check that API keys are set in `backend/.env`
- Verify CORS is enabled (should be by default)

### Voice Features Not Working
- Check browser permissions for microphone access
- Verify ElevenLabs API key is valid
- Check browser console for errors

## Next Steps

- Customize the AI system prompt in `backend/src/services/ai.ts`
- Add more vehicle data to Firestore
- Customize the voice settings in ElevenLabs
- Add user authentication flows
- Implement conversation history storage
