const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

interface TranscriptionResponse {
  transcription: string;
}

export interface FinancingState {
  creditScore?: number;
  downPayment?: number;
  loanTermMonths?: number;
  tradeInValue?: number;
  salesTaxRate?: number;
  isComplete?: boolean;
}

export interface FinancingAlternative {
  description: string;
  monthlyPayment: number;
  loanTermMonths?: number;
  downPayment?: number;
  savings?: number;
  totalCostChange?: number;
  amountFinanced?: number;
  totalCost?: number;
  apr?: number;
  type?: "base" | "longer-term" | "higher-down" | "shorter-term";
}

export interface FinancingResults {
  monthlyPayment: number;
  apr: number;
  totalInterest: number;
  totalCost: number;
  amountFinanced: number;
  recommendation: string;
  alternatives: FinancingAlternative[];
}

export interface AIResponsePayload {
  response: string;
  financingState?: FinancingState;
  financingResults?: FinancingResults | null;
  conversationHistory?: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
}

interface ConversationRequest {
  message: string;
  context?: {
    vehicles?: any[];
    currentCategory?: string;
    selectedVehicle?: any;
    selectedVehicles?: any[];
    isComparison?: boolean;
    userPreferences?: Record<string, any>;
    financingState?: FinancingState;
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
export async function getAIResponse(request: ConversationRequest): Promise<AIResponsePayload> {
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

    const data: AIResponsePayload = await response.json();
    return data;
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
