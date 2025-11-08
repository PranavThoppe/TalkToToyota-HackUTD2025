const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

interface TranscriptionResponse {
  transcription: string;
}

interface AIResponse {
  response: string;
}

interface ConversationRequest {
  message: string;
  context?: {
    vehicles?: any[];
    currentCategory?: string;
    userPreferences?: Record<string, any>;
  };
  conversationHistory?: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
}

// Note: Transcription is now handled client-side using Web Speech API
// This function is kept for potential future server-side transcription needs
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  // If needed, you can implement server-side transcription here
  // For now, this is a placeholder
  throw new Error("Client-side transcription should be used via Web Speech API");
}

// Get AI conversation response
export async function getAIResponse(request: ConversationRequest): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/conversation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Backend API returned ${response.status}: ${response.statusText}`);
    }

    const data: AIResponse = await response.json();
    return data.response;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
      throw new Error("Backend server is not running. Please start the backend server or configure the API URL.");
    }
    throw error;
  }
}

// Convert text to speech using ElevenLabs
export async function textToSpeech(text: string, voiceId?: string): Promise<Blob> {
  try {
    const response = await fetch(`${API_BASE_URL}/voice/speak`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, voiceId }),
    });

    if (!response.ok) {
      throw new Error(`TTS API returned ${response.status}: ${response.statusText}`);
    }

    return await response.blob();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
      throw new Error("Backend server is not running. Voice features require the backend server.");
    }
    throw error;
  }
}

// Health check
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL.replace("/api", "")}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
