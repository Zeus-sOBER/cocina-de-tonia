"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { askAssistant } from "@/lib/actions/assistant";
import { Send, Loader2, Bot, User, Mic, MicOff, Volume2 } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function useSpeechRecognition(lang: string) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = lang;
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const result = event.results[event.results.length - 1];
        setTranscript(result[0].transcript);
      };

      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, [lang]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return { isListening, transcript, isSupported, startListening, stopListening };
}

function speakText(text: string, lang: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

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
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { isListening, transcript, isSupported, startListening, stopListening } =
    useSpeechRecognition("es-US");

  const suggestions = [
    t("suggestions.todayOrders"),
    t("suggestions.lowStock"),
    t("suggestions.weekSpending"),
    t("suggestions.topDish"),
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update input field with speech transcript in real-time
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  async function handleSend(question?: string) {
    const text = question || input.trim();
    if (!text || isLoading) return;

    if (isListening) stopListening();

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const result = await askAssistant(text);

    const assistantMsg: Message = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: result.answer || result.error || t("error"),
    };
    setMessages((prev) => [...prev, assistantMsg]);
    setIsLoading(false);

    // Auto-speak the response
    if (result.answer) {
      speakText(result.answer, "es-US");
    }

    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSpeak(msgId: string, text: string) {
    if (speakingId === msgId) {
      window.speechSynthesis?.cancel();
      setSpeakingId(null);
    } else {
      setSpeakingId(msgId);
      speakText(text, "es-US");
      // Clear speaking state when done
      const checkDone = setInterval(() => {
        if (!window.speechSynthesis?.speaking) {
          setSpeakingId(null);
          clearInterval(checkDone);
        }
      }, 200);
    }
  }

  function handleMicToggle() {
    if (isListening) {
      stopListening();
      // Auto-send if we have transcript
      if (input.trim()) {
        setTimeout(() => handleSend(), 200);
      }
    } else {
      startListening();
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

            <div className="flex flex-col gap-1 max-w-[80%]">
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] rounded-br-md"
                    : "bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] rounded-bl-md"
                }`}
              >
                {msg.content}
              </div>

              {/* Speak button for assistant messages */}
              {msg.role === "assistant" && msg.id !== "welcome" && (
                <button
                  onClick={() => handleSpeak(msg.id, msg.content)}
                  className="self-start ml-1 p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors"
                  title={t("listen")}
                >
                  <Volume2
                    size={14}
                    className={speakingId === msg.id ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}
                  />
                </button>
              )}
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

        {/* Listening indicator */}
        {isListening && (
          <div className="flex justify-center">
            <div className="px-4 py-2 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium animate-pulse flex items-center gap-2">
              <Mic size={16} /> {t("listening")}
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
          {/* Mic button */}
          {isSupported && (
            <button
              onClick={handleMicToggle}
              disabled={isLoading}
              className={`w-12 h-12 rounded-full flex items-center justify-center
                         disabled:opacity-50 disabled:cursor-not-allowed
                         active:scale-95 transition-all touch-target ${
                           isListening
                             ? "bg-red-500 text-white animate-pulse"
                             : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)]"
                         }`}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          )}

          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? t("listening") : t("placeholder")}
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
