"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import Image from "next/image";

type Message = {
    id: string;
    sender: "user" | "agent";
    text: string;
};

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
    "pierre": "🍳",
    "claire": "🎨",
    "louis": "📜",
    "marie": "🗺️"
};

export default function ChatBox({ agentName, topic, agentColor }: { agentName: string, topic: string, agentColor: string }) {
    const displayName = displayNames[agentName] || agentName;
    const shortName = shortNames[agentName] || agentName;
    const thinkingIcon = thinkingIcons[agentName] || "💭";

    const [messages, setMessages] = useState<Message[]>([
        { id: "1", sender: "agent", text: `Bonjour! I am ${displayName}. Ask me anything about ${topic}.` }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { id: Date.now().toString(), sender: "user", text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage.text, agentName })
            });

            if (!res.ok) {
                throw new Error("Failed to fetch response");
            }

            const data = await res.json();
            const agentMessage: Message = { id: (Date.now() + 1).toString(), sender: "agent", text: data.reply };
            setMessages((prev) => [...prev, agentMessage]);
        } catch (error) {
            console.error("Chat Error:", error);
            const errorMessage: Message = { id: (Date.now() + 1).toString(), sender: "agent", text: "Sorry, I couldn't respond right now. Please try again." };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass rounded-2xl w-full max-w-lg h-[400px] flex flex-col overflow-hidden shadow-xl shadow-slate-200">
            <div className={`${agentColor} p-4 text-white font-bold flex items-center justify-center gap-3`}>
                {agentName === "pierre" && (
                    <Image src="/images/chef_mascot_thinking.png" alt="Chef Pierre" width={32} height={32} className="w-8 h-8 rounded-full border border-white/50 bg-white/20 object-cover scale-150" />
                )}
                <span>Chat with {displayName}</span>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-white/50">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === "user" ? "bg-slate-800 text-white rounded-tr-sm" : "bg-slate-200 text-slate-900 rounded-tl-sm"}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start animate-pulse">
                        <div className="bg-slate-200 text-slate-500 p-3 rounded-2xl rounded-tl-sm text-sm">
                            {shortName} is thinking… {thinkingIcon}
                        </div>
                    </div>
                )}
            </div>
            <div className="p-4 bg-white border-t border-slate-100 flex gap-2 items-center">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Ask about ${topic}...`}
                    className="flex-1 outline-none px-4 py-2 rounded-full border border-slate-200 focus:border-slate-400 bg-slate-50 text-slate-800 transition-colors"
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className={`${agentColor} text-white p-2 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50`}
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
