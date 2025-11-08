import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useVoice } from "@/hooks/useVoice";

interface VoiceButtonProps {
  onTranscript?: (transcript: string) => void;
  onError?: (error: Error) => void;
  className?: string;
}

export default function VoiceButton({ onTranscript, onError, className }: VoiceButtonProps) {
  const { isListening, isProcessing, startListening, stopListening } = useVoice({
    onTranscript,
    onError,
  });

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isProcessing}
      className={className}
      variant={isListening ? "destructive" : "default"}
    >
      {isProcessing ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isListening ? (
        <MicOff className="h-5 w-5" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
      <span className="ml-2">
        {isProcessing ? "Processing..." : isListening ? "Stop Listening" : "Start Listening"}
      </span>
    </Button>
  );
}
