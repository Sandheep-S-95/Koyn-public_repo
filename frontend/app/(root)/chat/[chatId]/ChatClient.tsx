"use client";

import { useState, useRef, useEffect } from "react";
import { Send, AlertTriangle } from "lucide-react";
import StockCard from "@/components/chat/StockCard";
import PriceChart from "@/components/chat/PriceChart";
import ComparisonTable from "@/components/chat/ComparisonTable";
import MarketOverview from "@/components/chat/MarketOverview";
import Watchlist from "@/components/chat/Watchlist";
import ActionButtons from "@/components/chat/ActionButtons";
import MetricGrid from "@/components/chat/MetricGrid";
import AlertBanner from "@/components/chat/AlertBanner";
import TechnicalGauge from "@/components/chat/TechnicalGauge";
import NewsFeed from "@/components/chat/NewsFeed";
import { saveMessageToChat, renameChat } from "@/lib/actions/chat.actions";
import { useRouter } from "next/navigation";

// The maximum number of messages allowed per chat to prevent excessive context size
const MAX_MESSAGES = 30;

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatClient({ 
  chatId, 
  initialMessages,
  email
}: { 
  chatId: string;
  initialMessages: Message[];
  email: string;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isLimitReached = messages.length >= MAX_MESSAGES;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent, presetQuery?: string) => {
    e?.preventDefault();
    const query = presetQuery || input;
    if (!query.trim() || isLoading || isLimitReached) return;

    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: query }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Save user message to DB
      await saveMessageToChat(chatId, email, "user", query);

      // If this is the very first message in the chat, rename it!
      if (messages.length === 0) {
        const title = query.length > 30 ? query.substring(0, 30) + "..." : query;
        await renameChat(chatId, email, title);
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) throw new Error("Failed to fetch response");

      const data = await res.json();
      const assistantRawContent = JSON.stringify(data);

      setMessages((prev) => [...prev, { role: "assistant", content: assistantRawContent }]);
      
      // Save AI message to DB
      await saveMessageToChat(chatId, email, "assistant", assistantRawContent);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: JSON.stringify({ message: "An error occurred while generating the response." }) }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderComponent = (comp: any, idx: number) => {
    switch (comp.type) {
      case "STOCK_CARD": return <StockCard key={idx} {...comp} />;
      case "PRICE_CHART": return <PriceChart key={idx} {...comp} />;
      case "COMPARISON_TABLE": return <ComparisonTable key={idx} {...comp} />;
      case "MARKET_OVERVIEW": return <MarketOverview key={idx} {...comp} />;
      case "WATCHLIST": return <Watchlist key={idx} {...comp} />;
      case "METRIC_GRID": return <MetricGrid key={idx} {...comp} />;
      case "ALERT_BANNER": return <AlertBanner key={idx} {...comp} />;
      case "TECHNICAL_GAUGE": return <TechnicalGauge key={idx} {...comp} />;
      case "NEWS_FEED": return <NewsFeed key={idx} {...comp} />;
      case "ACTION_BUTTONS": 
        return <ActionButtons key={idx} {...comp} onSelect={(query) => handleSubmit(undefined, query)} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full bg-[#050505] overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-center text-muted-foreground flex-col">
            <h2 className="text-xl text-white mb-2">How can I help you today?</h2>
            <p className="max-w-md">Ask me to analyze a stock, check market trends, or review a watchlist.</p>
            <div className="flex gap-2 flex-wrap justify-center mt-6">
              {["Analyze TSLA", "Market Overview", "AAPL vs MSFT"].map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleSubmit(undefined, preset)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-sm border border-white/10 transition-colors text-white"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => {
          let parsed;
          if (m.role === "assistant") {
            try { parsed = JSON.parse(m.content); } catch (e) { parsed = { message: m.content }; }
          }

          return (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-3xl w-full ${m.role === "user" ? "bg-primary/20 border border-primary/30 text-white rounded-2xl p-4 ml-auto max-w-fit" : ""}`}>
                {m.role === "user" ? (
                  <p>{m.content}</p>
                ) : (
                  <div className="space-y-4">
                    {parsed?.message && (
                      <div className="text-white bg-white/5 border border-white/10 p-4 rounded-xl">
                        {parsed.message}
                      </div>
                    )}
                    <div className="grid gap-4">
                      {parsed?.components?.map((c: any, cIdx: number) => renderComponent(c, cIdx))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-muted-foreground animate-pulse">
              Analyzing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 bg-[#0A0A0A]">
        {isLimitReached ? (
          <div className="flex flex-col items-center justify-center p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            <AlertTriangle className="mb-2" size={24} />
            <p className="text-center font-medium">Chat limit reached.</p>
            <p className="text-center text-sm opacity-80 mb-4">To ensure optimal performance and AI context, please start a new chat.</p>
            <button 
              onClick={() => router.push('/chat')}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium transition-colors"
            >
              Start New Chat
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Koyn AI about stocks, markets, or analysis..."
              className="w-full bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all pr-16 shadow-inner shadow-black/50"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 p-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        )}
        <p className="text-center text-xs text-muted-foreground mt-3">
          AI can make mistakes. Consider verifying important information before trading.
        </p>
      </div>
    </div>
  );
}
