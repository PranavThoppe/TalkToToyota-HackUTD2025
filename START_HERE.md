# 🚀 Quick Start Guide

## The Problem You're Seeing

If you see "Cannot GET /" when accessing `http://localhost:3001`, that's because:
- **Port 3001** = Backend API server (just JSON responses, not a website)
- **Port 8080** = Frontend website (the actual UI you see in the browser)

## How to Run the Application

### Option 1: Run Both Servers (Recommended)

Open **TWO terminal windows**:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
You should see: `🚀 Server running on http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
You should see: `Local: http://localhost:8080`

### Option 2: Run from Root (Windows)

```bash
# Terminal 1
npm run dev:backend

# Terminal 2 (new terminal)
npm run dev:frontend
```

## Access the Application

1. **Open your browser**
2. **Go to:** `http://localhost:8080` (NOT port 3001!)
3. You should see the Toyota vehicle catalog

## What Each Server Does

- **Backend (port 3001)**: 
  - Handles AI conversations
  - Converts text to speech (ElevenLabs)
  - Provides API endpoints
  - **Don't open this in your browser** - it's just an API

- **Frontend (port 8080)**:
  - The actual website
  - Shows vehicles, search, voice/chat features
  - **This is what you open in your browser**

## Troubleshooting

### Still seeing blank screen?
1. Check the browser console (F12) for errors
2. Make sure both servers are running
3. Clear browser cache (Ctrl+Shift+R)
4. Check that port 8080 is not already in use

### Backend not starting?
- Make sure you're in the `backend` directory
- Run `npm install` in the backend directory if you haven't
- Check that port 3001 is not already in use

### Frontend not starting?
- Make sure you're in the `frontend` directory  
- Run `npm install` in the frontend directory if you haven't
- Check that port 8080 is not already in use

## Next Steps

Once both servers are running:
1. Open `http://localhost:8080` in your browser
2. You should see the vehicle catalog with JSON data (no Firebase needed)
3. Voice/Chat features will show helpful errors if backend isn't configured
4. To use AI features, you'll need to set up API keys in `backend/.env`
