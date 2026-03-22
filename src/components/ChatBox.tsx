"use client";

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Send, User, Volume2, RefreshCw } from "lucide-react";
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
    "marie": "Historian Marie",
    "amelie": "Amélie the Artist"
};

const shortNames: Record<string, string> = {
    "pierre": "Chef Pierre",
    "claire": "Claire",
    "louis": "Louis",
    "marie": "Marie",
    "amelie": "Amélie"
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

const LessonMessage = ({ data }: { data: any }) => (
    <div className="space-y-4">
        <div>
            <h3 className="text-xl font-black text-slate-800 leading-tight">📘 {data?.title || "Lesson"}</h3>
            <p className="text-sm text-slate-600 font-medium mt-1 italic">{data?.description || data?.content || ""}</p>
        </div>
        
        {data?.pronunciation && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50/50 border border-blue-100/50">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0">
                    <Volume2 className="w-4 h-4" />
                </div>
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400">Pronunciation</h4>
                    <p className="text-sm font-bold text-blue-900">{data.pronunciation}</p>
                </div>
            </div>
        )}

        {data?.example && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Usage Example</h4>
                <p className="text-[15px] font-medium text-slate-800 italic">{data.example}</p>
            </div>
        )}

        {data?.tip && (
            <div className="p-3 rounded-2xl border-2 border-dashed border-blue-100 bg-white/50">
                <p className="text-sm text-blue-800">
                    {data.tip}
                </p>
            </div>
        )}
    </div>
);

const GreetingMessage = ({ data, agentName }: { data: any, agentName: string }) => (
    <div className="space-y-3">
        <p className="text-[15px] text-slate-800 leading-relaxed font-medium">
            {data?.content || data}
        </p>
        {data?.tip && (
            <div className="p-2 px-4 rounded-full bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 inline-block">
                ✨ {data.tip}
            </div>
        )}
    </div>
);

// --- Main ChatBox Component ---

export interface ChatBoxHandle {
    sendMessage: (text: string) => void;
    addLocalMessage: (message: Partial<Message>) => void;
}

interface ChatBoxProps {
    agentName: string;
    topic: string;
    agentColor: string;
    context?: any;
    onMoodChange?: (mood: Mood) => void;
    customSystemPrompt?: string;
}

const ChatBox = forwardRef<ChatBoxHandle, ChatBoxProps>(({
    agentName,
    topic,
    agentColor,
    context = {},
    onMoodChange = () => {},
    customSystemPrompt
}, ref) => {
    const { t, language } = useLanguage();
    const displayName = displayNames[agentName] || agentName;
    const shortName = shortNames[agentName] || agentName;

    const scrollRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    useEffect(() => {
        const customWelcomeKey = `${agentName}_chat_welcome`;
        const defaultWelcome = t("chat_welcome")
            .replace("{displayName}", displayName)
            .replace("{topic}", topic);
        
        const welcomeText = t(customWelcomeKey) !== customWelcomeKey 
            ? t(customWelcomeKey) 
            : defaultWelcome;
            
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
    }, [language, agentName, topic, displayName, onMoodChange, t]);

    useEffect(() => {
        if (input.trim()) {
            onMoodChange("listening");
        } else if (!loading) {
            onMoodChange("idle");
        }
    }, [input, loading, onMoodChange]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
        sendMessage: (text: string) => {
            handleSend(text);
        },
        addLocalMessage: (msg: Partial<Message>) => {
            setMessages(prev => [
                ...prev,
                {
                    id: Date.now().toString(),
                    sender: msg.sender || "agent",
                    text: msg.text || "",
                    expression: msg.expression || "happy",
                    structuredData: msg.structuredData
                }
            ]);
        }
    }));

    const handleSend = async (overrideText?: string) => {
        const textToSend = overrideText || input;
        if (!textToSend.trim() || loading) return;

        const userMsg: Message = { id: Date.now().toString(), sender: "user", text: textToSend };
        const newMessages = [...messages, userMsg]; // Create newMessages array including the current user message
        setMessages(newMessages);
        if (!overrideText) setInput(""); // Clear input only if it's not an external send
        setLoading(true);
        onMoodChange("thinking");

        console.log(`Sending message to agent: ${agentName}`, { textToSend, messagesCount: newMessages.length });

        try {
            const res = await fetch("/api/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    agent: agentName,
                    messages: newMessages.map(msg => ({ // Use the newMessages array here
                        role: msg.sender === "user" ? "user" : "assistant",
                        content: msg.text
                    })),
                    context: { // Include topic in context
                        topic,
                        ...context
                    },
                    language,
                    customSystemPrompt
                })
            });

            if (!res.ok) throw new Error("Failed to fetch response");

            const data = await res.json();
            const rawReply = data.reply;
            
            let structuredData = null;
            try {
                // More robust JSON extraction
                const jsonMatch = rawReply.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    structuredData = JSON.parse(jsonMatch[0]);
                } else {
                    structuredData = JSON.parse(rawReply);
                }
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
        <div className="w-full flex flex-col h-full bg-white relative z-10 overflow-hidden shadow-inner">
            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 p-5 overflow-y-auto space-y-6 scroll-smooth bg-white relative z-0">
                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} items-start gap-3 w-full`}
                        >
                            {msg.sender === "agent" && (
                                <div className={`relative w-8 h-8 rounded-full ring-1 ${agentName === 'pierre' ? 'ring-orange-400' : 'ring-blue-400'} bg-black shadow-md overflow-hidden flex-shrink-0`}>
                                    <Image
                                        src={
                                            agentName === 'pierre' 
                                                ? `/characters/pierre/${msg.expression || 'idle'}.png` 
                                                : msg.expression === 'thinking' ? `/characters/${agentName}/thinking.png` :
                                                  msg.expression === 'happy' || msg.expression === 'greeting' ? `/characters/${agentName}/happy.png` :
                                                  `/characters/${agentName}/idle.png`
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

                            <div className={`max-w-[85%] p-4 rounded-[2rem] shadow-sm ${
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
                                        ) : msg.structuredData?.type === "lesson" || (agentName === 'claire' && msg.sender === 'agent') ? (
                                            <LessonMessage data={msg.structuredData || { title: "Lesson", description: msg.text }} />
                                        ) : msg.structuredData?.type === "greeting" || msg.structuredData?.type === "error" ? (
                                            <GreetingMessage data={msg.structuredData} agentName={agentName} />
                                        ) : (
                                            <p className="text-[15px] leading-relaxed">{msg.text}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                {/* Quick Interactive Suggestions */}
                {messages.length === 1 && agentName === 'claire' && (
                    <div className="px-6 py-3 flex gap-2">
                        <button onClick={() => handleSend("Bonjour !")} className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full bg-blue-100 text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white transition-all">Say "Bonjour"</button>
                        <button onClick={() => handleSend("Comment ça va ?")} className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-800 hover:text-white transition-all">Ask "How are you?"</button>
                    </div>
                )}
            </AnimatePresence>

                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start items-start gap-3">
                        <div className="relative w-8 h-8 rounded-full ring-1 ring-orange-200 bg-white shadow-sm overflow-hidden flex-shrink-0 animate-pulse">
                            <Image
                                src={`/characters/${agentName}/thinking.png`}
                                alt={displayName}
                                fill
                                className="object-cover scale-125 opacity-50"
                            />
                        </div>
                        <div className="bg-white/80 backdrop-blur-md p-5 rounded-[2rem] rounded-bl-none shadow-sm flex flex-col gap-3 border border-orange-100/50 min-w-[200px]">
                            <div className="flex items-center gap-3">
                                <motion.span 
                                    animate={{ rotate: [0, 15, -15, 0] }}
                                    transition={{ repeat: Infinity, duration: 1 }}
                                    className="text-xl"
                                >
                                    {agentName === 'pierre' ? '🍳' : agentName === 'claire' ? '📘' : agentName === 'louis' ? '📍' : '🏛️'}
                                </motion.span>
                                <span className="text-sm font-bold text-slate-800 tracking-tight">{displayName} is {agentName === 'pierre' ? 'cooking' : 'thinking'}...</span>
                            </div>
                            <div className="flex gap-1.5 h-1 items-end overflow-hidden">
                                <motion.div 
                                    animate={{ height: ["20%", "100%", "40%"] }}
                                    transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                                    className="w-1 bg-orange-400 rounded-full"
                                />
                                <motion.div 
                                    animate={{ height: ["40%", "20%", "100%"] }}
                                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                                    className="w-1 bg-orange-300 rounded-full"
                                />
                                <motion.div 
                                    animate={{ height: ["100%", "40%", "60%"] }}
                                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                                    className="w-1 bg-orange-400 rounded-full"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Gamification Progress */}
            <AnimatePresence>
                {agentName === 'pierre' && messages.filter(m => m.structuredData?.type === 'recipe').length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="px-6 py-2 bg-orange-50/80 border-t border-orange-100 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-orange-900">Your Culinary Journey</span>
                            <span className="px-2 py-0.5 rounded-full bg-orange-200 text-[10px] font-black uppercase tracking-widest text-orange-800">
                                {messages.filter(m => m.structuredData?.type === 'recipe').length} Recipes
                            </span>
                        </div>
                        <div className="flex gap-1">
                            {messages.filter(m => m.structuredData?.type === 'recipe').length >= 1 && <span title="Pastry Beginner" className="text-lg">🥐</span>}
                            {messages.filter(m => m.structuredData?.type === 'recipe').length >= 3 && <span title="Master Chef" className="text-lg">👨‍🍳</span>}
                        </div>
                    </motion.div>
                )}
                {agentName === 'claire' && messages.filter(m => m.structuredData?.type === 'lesson').length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="px-6 py-2 bg-blue-50/80 border-t border-blue-100 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-blue-900">Linguistic Progress</span>
                            <span className="px-2 py-0.5 rounded-full bg-blue-200 text-[10px] font-black uppercase tracking-widest text-blue-800">
                                {messages.filter(m => m.structuredData?.type === 'lesson').length} Lessons
                            </span>
                        </div>
                        <div className="flex gap-1">
                            {messages.filter(m => m.structuredData?.type === 'lesson').length >= 1 && <span title="Word Learner" className="text-lg">📘</span>}
                            {messages.filter(m => m.structuredData?.type === 'lesson').length >= 3 && <span title="Conversationalist" className="text-lg">🗣️</span>}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input */}
            <div className="p-4 bg-white/90 backdrop-blur-md border-t border-slate-100 flex gap-3 items-center relative z-10">
                <div className="flex-1 relative group">
                    <input
                        type="text"
                        autoFocus
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={
                            t(`${agentName}_chat_placeholder`) !== `${agentName}_chat_placeholder` 
                                ? t(`${agentName}_chat_placeholder`) 
                                : t("chat_placeholder").replace("{shortName}", shortName).replace("{topic}", topic)
                        }
                        className={`w-full outline-none px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 bg-slate-50 shadow-inner text-slate-800 transition-all text-sm font-medium pr-12 ${
                            agentName === 'pierre' ? 'focus:border-orange-400 focus:ring-orange-50' : 'focus:border-blue-400 focus:ring-blue-50'
                        }`}
                        onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-focus-within:opacity-100 transition-opacity">
                        <span className="text-[10px] font-bold text-slate-400">⏎</span>
                    </div>
                </div>
                <motion.button
                    onClick={() => handleSend()}
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 20px -5px rgba(249,115,22,0.3)" }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!input.trim() || loading}
                    className={`${agentColor} text-white p-4 rounded-2xl hover:brightness-110 shadow-lg transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center`}
                >
                    {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </motion.button>
            </div>
        </div>
    );
});

export default ChatBox;
