import { useState } from "react";
import {
  LuMessageCircle as MessageCircle,
  LuSend as Send,
  LuLoaderCircle as Loader2,
  LuX as X,
} from "react-icons/lu";
import { Button } from "@/features/common/components/ui/button";
import { Input } from "@/features/common/components/ui/input";
// Keeps the reply's line breaks and turns **text** into bold
function renderMessageText(text) {
  return (
    <div className="whitespace-pre-line">
      {text
        .split(/\*\*(.+?)\*\*/g)
        .map((part, i) =>
          i % 2 === 1 ? <strong key={i}>{part}</strong> : part,
        )}
    </div>
  );
}
export function AssistantChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! Ask me anything about data structures, algorithms, or complexities.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const sendMessage = async () => {
    if (!input.trim() || isSending) return;
    const question = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setIsSending(true);
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Unable to answer right now.");
      }
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.reply ?? "I don't have information on that yet.",
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            error instanceof Error
              ? `I ran into an issue: ${error.message}`
              : "I ran into an issue answering that question.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-80 sm:w-96 rounded-2xl border border-border bg-background shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
            <div>
              <p className="text-sm font-semibold">DSA Copilot</p>
              <p className="text-xs text-muted-foreground">
                Answers powered by curated algorithm notes
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 max-h-80 overflow-y-auto px-4 py-3 space-y-3 text-sm">
            {messages.map((message, index) => (
              <div
                className={`rounded-lg px-3 py-2 ${
                  message.role === "assistant"
                    ? "bg-muted text-foreground"
                    : "bg-primary/10 text-foreground ml-8"
                }`}
                key={`${message.role}-${index}`}
              >
                {renderMessageText(message.text)}
              </div>
            ))}
            {isSending && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Thinking...
              </div>
            )}
          </div>
          <div className="border-t border-border p-3">
            <form
              className="flex items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage();
              }}
            >
              <Input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about an algorithm..."
                className="text-sm!"
              />
              <Button type="submit" size="icon" disabled={isSending}>
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
      <Button
        className="rounded-full! shadow-lg"
        size="lg"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        {isOpen ? "Close AI" : "Ask AI"}
      </Button>
    </div>
  );
}
