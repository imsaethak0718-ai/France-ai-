"use client";

import { useState } from "react";
import { Send } from "lucide-react";

type Message = {
    id: string;
    sender: "user" | "agent";
    text: string;
};

export default function ChatBox({ agentName, topic, agentColor }: { agentName: string, topic: string, agentColor: string }) {
    const [messages, setMessages] = useState<Message[]>([
        { id: "1", sender: "agent", text: `Bonjour! I am ${agentName}. Ask me anything about ${topic}.` }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMessage: Message = { id: Date.now().toString(), sender: "user", text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        // Simulated AI Response
        setTimeout(() => {
            let responseText = "That's a fantastic question!";
            if (agentName.includes("Pierre")) {
                responseText = "Ah, French cuisine! You must try Coq au Vin or a freshly baked croissant.";
            } else if (agentName.includes("Claire")) {
                responseText = "To greet someone in French, say 'Bonjour' during the day, and 'Bonsoir' in the evening!";
            } else if (agentName.includes("Louis")) {
                responseText = "The Eiffel Tower is magnificent, but don't miss a walk along the Seine river.";
            } else if (agentName.includes("Marie")) {
                responseText = "The French Revolution in 1789 forever changed the course of our history.";
            }

            const agentMessage: Message = { id: (Date.now() + 1).toString(), sender: "agent", text: responseText };
            setMessages((prev) => [...prev, agentMessage]);
            setLoading(false);
        }, 1200);
    };

    return (
        <div className="glass rounded-2xl w-full max-w-lg h-[400px] flex flex-col overflow-hidden shadow-xl shadow-slate-200">
            <div className={`${agentColor} p-4 text-white font-bold text-center`}>
                Chat with {agentName}
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
                            Thinking...
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
