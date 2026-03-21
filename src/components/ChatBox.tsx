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
    expression?: Mood;
    structuredData?: any;
};

export type Mood = "idle" | "listening" | "thinking" | "responding" | "happy" | "greeting" | "explaining" | "excited" | "joking" | "mistake" | "proud";

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

// --- Structured Message Components ---

const RecipeMessage = ({ data }: { data: any }) => (
    <div className="space-y-4">
        <div>
            <h3 className="text-xl font-black text-slate-800 leading-tight">🍲 {data.title}</h3>
            <p className="text-sm text-slate-500 mt-1 italic">{data.description}</p>
        </div>
        
        {Array.isArray(data.ingredients) && (
            <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">🧾 Ingredients</h4>
                <ul className="space-y-1">
                    {data.ingredients.map((item: string, i: number) => (
                        <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                            <span className="text-orange-400">•</span> {item}
                        </li>
                    ))}
                </ul>
            </div>
        )}

        {Array.isArray(data.steps) && (
            <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">👨‍🍳 Steps</h4>
                <ol className="space-y-2">
                    {data.steps.map((step: string, i: number) => (
                        <li key={i} className="text-sm text-slate-700 flex gap-3">
                            <span className="font-bold text-orange-500">{i + 1}.</span>
                            <span>{step}</span>
                        </li>
                    ))}
                </ol>
            </div>
        )}

        {data.tip && (
            <div className="p-3 rounded-2xl bg-orange-50 border border-orange-100/50">
                <p className="text-sm text-orange-800 leading-relaxed">
                    <span className="font-bold mr-1">✨ Tip:</span> {data.tip}
                </p>
            </div>
        )}
    </div>
);

const ExplanationMessage = ({ data }: { data: any }) => (
    <div className="space-y-3">
        <h3 className="text-lg font-black text-slate-800">🥖 {data.title}</h3>
        <p className="text-[15px] text-slate-700 leading-relaxed font-medium">{data.description}</p>
        
        {data.insight && (
            <div className="border-l-4 border-slate-200 pl-4 py-1">
                <p className="text-sm text-slate-600 leading-relaxed italic">{data.insight}</p>
            </div>
        )}

        {data.tip && (
            <div className="p-3 rounded-2xl bg-blue-50/50 border border-blue-100/50">
                <p className="text-sm text-blue-900">
                    <span className="font-bold mr-1">🍷 Pro Tip:</span> {data.tip}
                </p>
            </div>
        )}
    </div>
);

const GreetingMessage = ({ data }: { data: any }) => (
    <div className="space-y-3">
        <p className="text-[15px] text-slate-800 leading-relaxed">{data.content}</p>
        {data.tip && (
            <div className="p-2 px-4 rounded-full bg-slate-100 text-xs text-slate-500 inline-block">
                ✨ {data.tip}
            </div>
        )}
    </div>
);

// --- Main ChatBox Component ---

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

    const scrollRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const welcomeText = t("chat_welcome")
            .replace("{displayName}", displayName)
            .replace("{topic}", topic);
            
        setMessages([
            { 
                id: "1", 
                sender: "agent", 
                text: welcomeText,
                structuredData: { type: "greeting", content: welcomeText },
                expression: "greeting" 
            }
        ]);
        onMoodChange("greeting");
        setTimeout(() => onMoodChange("idle"), 4000);
    }, [language, agentName, topic]);

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

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { id: Date.now().toString(), sender: "user", text: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput("");
        setLoading(true);
        onMoodChange("thinking");

        try {
            const res = await fetch("/api/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    agent: agentName,
                    messages: newMessages.map(msg => ({
                        role: msg.sender === "user" ? "user" : "assistant",
                        content: msg.text
                    })),
                    context,
                    language
                })
            });

            if (!res.ok) throw new Error("Failed to fetch response");

            const data = await res.json();
            const rawReply = data.reply;
            
            let structuredData = null;
            try {
                structuredData = JSON.parse(rawReply);
            } catch (e) {
                console.error("Failed to parse AI response as JSON:", e);
                structuredData = { type: "fallback", content: rawReply };
            }

            const agentMessage: Message = {
                id: Date.now().toString(),
                sender: "agent",
                text: rawReply,
                structuredData,
                expression: structuredData?.type === 'recipe' ? 'proud' : 
                          structuredData?.type === 'explanation' ? 'explaining' : 
                          structuredData?.type === 'greeting' ? 'greeting' : 'happy'
            };

            setMessages((prev) => [...prev, agentMessage]);
            onMoodChange(agentMessage.expression as Mood);
            setTimeout(() => onMoodChange("idle"), 5000);
        } catch (error) {
            console.error("Chat Error:", error);
            onMoodChange("mistake");
            setMessages((prev) => [...prev, {
                id: Date.now().toString(),
                sender: "agent",
                text: t("chat_error"),
                expression: "mistake"
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full flex flex-col h-full bg-transparent overflow-hidden">
            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 p-5 overflow-y-auto space-y-6 scroll-smooth">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} items-start gap-3 w-full`}
                        >
                            {msg.sender === "agent" && (
                                <div className="relative w-10 h-10 rounded-full ring-2 ring-orange-400 bg-white shadow-md overflow-hidden flex-shrink-0 -mt-1">
                                    <Image
                                        src={agentName === 'pierre' 
                                            ? `/characters/pierre/${msg.expression || 'idle'}.png` 
                                            : `/characters/${agentName}_${msg.expression || 'happy'}.png`
                                        }
                                        alt={displayName}
                                        fill
                                        className="object-cover scale-125"
                                        onError={(e) => {
                                            const target = e.target as any;
                                            target.src = agentName === 'pierre' ? '/characters/pierre/idle.png' : `/characters/${agentName}_happy.png`;
                                        }}
                                    />
                                </div>
                            )}

                            <div className={`max-w-[85%] p-5 rounded-[2rem] shadow-sm ${
                                msg.sender === "user"
                                ? "bg-slate-800 text-white rounded-br-none"
                                : "bg-white text-slate-800 border border-slate-100 rounded-bl-none overflow-hidden"
                            }`}>
                                {msg.sender === "user" ? (
                                    <p className="text-[15px] leading-relaxed">{msg.text}</p>
                                ) : (
                                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        {msg.structuredData?.type === "recipe" ? (
                                            <RecipeMessage data={msg.structuredData} />
                                        ) : msg.structuredData?.type === "explanation" ? (
                                            <ExplanationMessage data={msg.structuredData} />
                                        ) : msg.structuredData?.type === "greeting" ? (
                                            <GreetingMessage data={msg.structuredData} />
                                        ) : (
                                            <p className="text-[15px] leading-relaxed">{msg.text}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start items-start gap-3">
                        <div className="relative w-10 h-10 rounded-full ring-2 ring-orange-200 bg-white shadow-sm overflow-hidden flex-shrink-0 animate-pulse">
                            <Image
                                src={`/characters/${agentName}_thinking.png`}
                                alt={displayName}
                                fill
                                className="object-cover scale-125 opacity-50"
                            />
                        </div>
                        <div className="bg-white p-4 rounded-3xl rounded-bl-none shadow-sm flex gap-1 items-center px-6 border border-slate-100/50">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
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
                    placeholder={t("chat_placeholder").replace("{shortName}", shortName).replace("{topic}", topic)}
                    className="flex-1 outline-none px-6 py-3.5 rounded-full border border-slate-200 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 bg-slate-50 text-slate-800 transition-all text-sm font-medium"
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <motion.button
                    onClick={handleSend}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!input.trim() || loading}
                    className={`${agentColor} text-white p-3.5 rounded-full hover:shadow-lg transition-all disabled:opacity-50`}
                >
                    <Send className="w-5 h-5" />
                </motion.button>
            </div>
        </div>
    );
}
