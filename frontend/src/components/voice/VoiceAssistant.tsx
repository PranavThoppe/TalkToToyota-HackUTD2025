import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, Loader2 } from "lucide-react";
import { useVoice } from "@/hooks/useVoice";
import { getAIResponse, textToSpeech } from "@/services/api";
import { Vehicle } from "@/types/vehicle";

interface VoiceAssistantProps {
  vehicles: Vehicle[];
  currentCategory?: string;
  className?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function VoiceAssistant({
  vehicles,
  currentCategory,
  className,
}: VoiceAssistantProps) {
  const [isActive, setIsActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: "user" | "assistant" | "system"; content: string }>
  >([]);

  const { isListening, isProcessing, transcript, startListening, stopListening, speak } =
    useVoice({
      onTranscript: async (transcriptText) => {
        if (!isActive) return;

        // Add user message
        const userMessage: Message = {
          role: "user",
          content: transcriptText,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);

        // Add to conversation history
        const newHistory = [
          ...conversationHistory,
          { role: "user" as const, content: transcriptText },
        ];
        setConversationHistory(newHistory);

        try {
          // Get AI response
          const aiResponse = await getAIResponse({
            message: transcriptText,
            context: {
              vehicles,
              currentCategory,
            },
            conversationHistory: newHistory,
          });

          // Add AI message
          const assistantMessage: Message = {
            role: "assistant",
            content: aiResponse,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);

          // Update conversation history
          setConversationHistory([
            ...newHistory,
            { role: "assistant" as const, content: aiResponse },
          ]);

          // Speak the response
          try {
            await speak(aiResponse);
          } catch (speakError) {
            console.warn("Could not speak response:", speakError);
            // Continue even if speech fails
          }

          // Note: With continuous mode, recognition should continue automatically
          // But we restart if it stopped (handled in useVoice hook's onend)
        } catch (error) {
          console.error("Error getting AI response:", error);
          const errorMsg = error instanceof Error ? error.message : "Unknown error";
          const errorMessage: Message = {
            role: "assistant",
            content: errorMsg.includes("Backend server is not running")
              ? "⚠️ Backend server is not running. Please start the backend server to use voice features."
              : `Error: ${errorMsg}`,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
        }
      },
      onError: (error) => {
        console.error("Voice error:", error);
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        const errorMessage: Message = {
          role: "assistant",
          content: `Voice error: ${errorMsg}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      },
    });

  const toggleAssistant = () => {
    if (isActive) {
      setIsActive(false);
      stopListening();
    } else {
      setIsActive(true);
      startListening();
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Voice Assistant</span>
          <Button
            onClick={toggleAssistant}
            variant={isActive ? "destructive" : "default"}
            size="sm"
          >
            {isListening || isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isActive ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
            <span className="ml-2">{isActive ? "Stop" : "Start"}</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isActive && (
            <div className="text-sm text-muted-foreground">
              {isListening && !isProcessing && "🎤 Listening..."}
              {isProcessing && "⏳ Processing..."}
            </div>
          )}
          {transcript && (
            <div className="p-2 bg-muted rounded">
              <p className="text-sm font-medium">You said:</p>
              <p className="text-sm">{transcript}</p>
            </div>
          )}
          {messages.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-2 rounded ${
                    message.role === "user"
                      ? "bg-primary/10 text-right"
                      : "bg-muted text-left"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
