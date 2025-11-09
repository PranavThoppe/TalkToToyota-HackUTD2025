import { Message } from "@/components/chat/ChatInterface";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div
      className={`flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      } mb-4`}
    >
      {message.role === "assistant" && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4"/>
            <path d="M12 8h.01"/>
          </svg>
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-xl p-4 shadow-sm transition-all duration-200 hover:shadow-md ${
          message.role === "user"
            ? "bg-primary text-primary-foreground ml-12"
            : "bg-card border border-border/50 text-foreground"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
        <p
          className={`text-xs mt-2 ${
            message.role === "user"
              ? "text-primary-foreground/70"
              : "text-muted-foreground"
          }`}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
      {message.role === "user" && (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ml-2">
          <span className="text-primary-foreground text-sm font-medium">You</span>
        </div>
      )}
    </div>
  );
}
