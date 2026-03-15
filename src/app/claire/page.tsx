"use client";

import { useState } from "react";
import Link from "next/link";
import ChatBox from "@/components/ChatBox";
import { ArrowLeft, BookOpen, Volume2, BookText } from "lucide-react";

export default function ClaireStudio() {
    const words = [
        { fr: "Bonjour", en: "Good morning / Hello" },
        { fr: "Merci", en: "Thank you" },
        { fr: "S'il vous plaît", en: "Please" },
        { fr: "Au revoir", en: "Goodbye" },
    ];

    const scrambledWord = "R U B O O N J";
    const [guess, setGuess] = useState("");
    const [feedback, setFeedback] = useState("");

    const checkWord = () => {
        if (guess.toUpperCase() === "BONJOUR") {
            setFeedback("Correct! It means Hello.");
        } else {
            setFeedback("Almost! Try again.");
        }
    };

    return (
        <div className="min-h-screen bg-blue-50/50 py-10 px-4">
            <div className="max-w-6xl mx-auto space-y-12">
                <header className="flex items-center gap-4">
                    <Link href="/" className="p-2 bg-white rounded-full shadow hover:scale-105 transition-transform">
                        <ArrowLeft className="text-slate-600" />
                    </Link>
                    <h1 className="text-4xl font-bold text-blue-600 flex items-center gap-3">
                        <BookOpen className="w-10 h-10" /> Teacher Claire's Learn French
                    </h1>
                </header>

                <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-8 flex flex-col justify-start">
                        <div className="glass rounded-3xl p-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <BookText className="text-blue-500 w-6 h-6" /> Word Builder
                            </h2>
                            <p className="text-slate-600 mb-6">Unscramble the letters to form a French greeting:</p>

                            <div className="text-3xl font-mono tracking-[0.5em] text-center bg-blue-100/50 py-6 rounded-2xl text-blue-900 border border-blue-200 mb-6">
                                {scrambledWord}
                            </div>

                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={guess}
                                    onChange={(e) => setGuess(e.target.value)}
                                    placeholder="Type your guess here"
                                    className="flex-1 px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 font-bold uppercase tracking-widest text-slate-700 bg-white"
                                />
                                <button onClick={checkWord} className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-sm">Check</button>
                            </div>
                            {feedback && (
                                <p className={`text-sm font-bold mt-2 ${feedback.includes('Correct') ? 'text-green-600' : 'text-red-500'}`}>{feedback}</p>
                            )}
                        </div>

                        <div className="glass rounded-3xl p-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">Vocabulary Cards</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {words.map((w, idx) => (
                                    <div key={idx} className="bg-white border border-slate-100 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm hover:shadow hover:-translate-y-1 transition-all group">
                                        <span className="text-xl font-bold text-slate-800 mb-1">{w.fr}</span>
                                        <span className="text-sm text-slate-500 font-medium mb-3">{w.en}</span>
                                        <button className="text-blue-500 bg-blue-50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Volume2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center lg:items-end">
                        <ChatBox agentName="claire" topic="French vocabulary, grammar, and greetings" agentColor="bg-blue-500" />
                    </div>
                </section>
            </div>
        </div>
    );
}
