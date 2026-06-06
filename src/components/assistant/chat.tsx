"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { askAssistant } from "@/lib/actions/assistant";
import { Send, Loader2, Bot, User } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function Chat() {
  const t = useTranslations("assistant");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: t("welcome"),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const suggestions = [
    t("suggestions.todayOrders"),
    t("suggestions.lowStock"),
    t("suggestions.weekSpending"),
    t("suggestions.topDish"),
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(question?: string) {
    const text = question || input.trim();
    if (!text || isLoading) return;

    // Add user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Call assistant
    const result = await askAssistant(text);

    const assistantMsg: Message = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: result.answer || result.error || t("error"),
    };
    setMessages((prev) => [...prev, assistantMsg]);
    setIsLoading(false);

    // Refocus input
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const showSuggestions = messages.length <= 1 && !isLoading;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={16} className="text-[var(--primary-foreground)]" />
              </div>
            )}

            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)] rounded-br-md"
                  : "bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] rounded-bl-md"
              }`}
            >
              {msg.content}
            </div>

            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-[var(--muted)] flex items-center justify-center flex-shrink-0 mt-1">
                <User size={16} className="text-[var(--muted-foreground)]" />
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-2 justify-start">
            <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
              <Bot size={16} className="text-[var(--primary-foreground)]" />
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl rounded-bl-md px-4 py-3">
              <Loader2 size={18} className="animate-spin text-[var(--primary)]" />
            </div>
          </div>
        )}

        {/* Suggestions */}
        {showSuggestions && (
          <div className="flex flex-wrap gap-2 pt-2">
            {suggestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="px-3 py-2 rounded-full text-sm font-medium
                           bg-[var(--muted)] text-[var(--foreground)]
                           hover:bg-[var(--border)] transition-colors
                           touch-target"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[var(--border)] bg-[var(--card)] px-4 py-3 pb-safe">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("placeholder")}
            rows={1}
            className="flex-1 px-4 py-3 rounded-xl border border-[var(--border)]
                       bg-[var(--background)] text-[var(--foreground)] text-base
                       focus:outline-none focus:ring-2 focus:ring-[var(--primary)]
                       placeholder:text-[var(--muted-foreground)]
                       resize-none touch-target"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="w-12 h-12 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)]
                       flex items-center justify-center
                       disabled:opacity-50 disabled:cursor-not-allowed
                       hover:opacity-90 active:scale-95 transition-all
                       touch-target"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
