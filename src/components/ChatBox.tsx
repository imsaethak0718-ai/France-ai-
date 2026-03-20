"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

type Message = {
    id: string;
    sender: "user" | "agent";
    text: string;
    expression?: "happy" | "neutral" | "thinking";
};

export type Mood = "idle" | "listening" | "thinking" | "responding" | "happy" ;

const displayNames: Record<string, string> = {
    "pierre": "Chef Pierre",
    "claire": "Teacher Claire",
    "louis": "Guide Louis",
    "marie": "Historian Marie"
};

const shortNames: Record<string, string> = {
    "pierre": "Chef Pierre",
    "claire": "Claire",
    "louis": "Louis",
    "marie": "Marie"
};

const thinkingIcons: Record<string, string> = {
    "pierre": "👨‍🍳",
    "claire": "👩‍🏫",
    "louis": "👨‍ voyage",
    "marie": "📜"
};

export default function ChatBox({
    agentName,
    topic,
    agentColor,
    context = {},
    onMoodChange = () => {}
}: {
    agentName: string,
    topic: string,
    agentColor: string,
    context?: any,
    onMoodChange?: (mood: Mood) => void
}) {
    const { t, language } = useLanguage();
    const displayName = displayNames[agentName] || agentName;
    const shortName = shortNames[agentName] || agentName;
    const thinkingIcon = thinkingIcons[agentName] || "💭";

    const scrollRef = useRef<HTMLDivElement>(null);

    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        setMessages([
            { 
                id: "1", 
                sender: "agent", 
                text: t("chat_welcome")
                    .replace("{displayName}", displayName)
                    .replace("{topic}", topic), 
                expression: "happy" 
            }
        ]);
    }, [language, agentName, topic]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (input.trim()) {
            onMoodChange("listening");
        } else if (!loading) {
            onMoodChange("idle");
        }
    }, [input, loading]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const getExpression = (text: string): "happy" | "neutral" | "thinking" => {
        const lowerText = text.toLowerCase();
        if (lowerText.includes("bonjour") || lowerText.includes("hello") || lowerText.includes("welcome") || lowerText.includes("great") || lowerText.includes("perfect") || lowerText.includes("!") || lowerText.includes("magnifique") || lowerText.includes("bravo")) {
            return "happy";
        }
        return "neutral";
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { id: Date.now().toString(), sender: "user", text: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput("");
        setLoading(true);
        onMoodChange("thinking");

        // Convert messages to history format for API
        const history = newMessages.map(msg => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.text
        }));

        try {
            const res = await fetch("/api/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    agent: agentName,
                    messages: history,
                    context,
                    language
                })
            });

            if (!res.ok) {
                throw new Error("Failed to fetch response");
            }

            const data = await res.json();
            const text = data.reply;
            const expression = getExpression(text);
            const agentMessage: Message = {
                id: (Date.now() + 1).toString(),
                sender: "agent",
                text: text,
                expression
            };
            setMessages((prev) => [...prev, agentMessage]);
            onMoodChange(expression === "happy" ? "happy" : "responding");
            
            // Revert to idle after response
            setTimeout(() => onMoodChange("idle"), 5000);
        } catch (error) {
            console.error("Chat Error:", error);
            onMoodChange("idle");
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                sender: "agent",
                text: t("chat_error"),
                expression: "neutral"
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass rounded-3xl w-full max-w-lg h-[500px] flex flex-col overflow-hidden shadow-2xl shadow-slate-900/10 border border-slate-200/50 bg-white/80 backdrop-blur-xl">
            {/* Header */}
            <div className={`${agentColor} p-4 text-white font-bold flex items-center justify-between gap-3 shadow-lg relative z-10`}>
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full border-2 border-white/30 bg-white/20 overflow-hidden shadow-inner">
                        <Image
                            src={`/characters/${agentName}_${loading ? 'thinking' : 'happy'}.png`}
                            alt={displayName}
                            fill
                            className="object-cover scale-110"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-black tracking-tight leading-none mb-1">{t("chat_with")}</span>
                        <span className="text-lg leading-none">{displayName}</span>
                    </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/50 scroll-smooth">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} items-end gap-3`}
                        >
                            {msg.sender === "agent" && (
                                <motion.div
                                    className="relative w-10 h-10 rounded-full border border-slate-200 bg-white shadow-sm overflow-hidden flex-shrink-0"
                                    whileHover={{ scale: 1.1 }}
                                >
                                    <Image
                                        src={`/characters/${agentName}_${msg.expression || 'neutral'}.png`}
                                        alt={displayName}
                                        fill
                                        className="object-cover scale-110"
                                    />
                                </motion.div>
                            )}

                            <div className={`max-w-[75%] p-4 rounded-3xl shadow-sm ${
                                msg.sender === "user"
                                ? "bg-slate-800 text-white rounded-br-none"
                                : "bg-white text-slate-800 border border-slate-100 rounded-bl-none"
                            }`}>
                                <p className="text-[15px] leading-relaxed">
                                    {msg.text}
                                </p>
                            </div>

                            {msg.sender === "user" && (
                                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 flex-shrink-0">
                                    <User className="w-5 h-5" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start items-end gap-3"
                    >
                        <div className="relative w-10 h-10 rounded-full border border-slate-200 bg-white shadow-sm overflow-hidden flex-shrink-0">
                            <Image
                                src={`/characters/${agentName}_thinking.png`}
                                alt={displayName}
                                fill
                                className="object-cover scale-110"
                            />
                        </div>
                        <div className="bg-white border border-slate-100 text-slate-400 p-4 rounded-3xl rounded-bl-none text-sm flex items-center gap-2 shadow-sm">
                            <span className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                            </span>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100 flex gap-2 items-center relative z-10">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t("chat_placeholder")
                        .replace("{shortName}", shortName)
                        .replace("{topic}", topic)}
                    className="flex-1 outline-none px-5 py-3 rounded-full border border-slate-200 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 bg-slate-50 text-slate-800 transition-all text-sm"
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <motion.button
                    onClick={handleSend}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!input.trim() || loading}
                    className={`${agentColor} text-white p-3 rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:grayscale`}
                >
                    <Send className="w-5 h-5" />
                </motion.button>
            </div>
        </div>
    );
}
