"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Volume2, BookText } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import ChatBox from "@/components/ChatBox";
import CharacterAvatar, { Mood } from "@/components/CharacterAvatar";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import FloatingEmojis from "@/components/FloatingEmojis";

export default function ClaireStudio() {
    const { t, language } = useLanguage();
    
    const words = [
        { fr: "Bonjour", en: "Good morning / Hello" },
        { fr: "Merci", en: "Thank you" },
        { fr: "S'il vous plaît", en: "Please" },
        { fr: "Au revoir", en: "Goodbye" },
        { fr: "Enchanté", en: "Nice to meet you" },
        { fr: "Comment allez-vous ?", en: "How are you?" },
        { fr: "Pardon", en: "Excuse me" },
        { fr: "Santé !", en: "Cheers!" },
    ];

    const scrambledChallengeList = [
        { scrambled: "R U B O O N J", correct: "BONJOUR", meaning: "Hello" },
        { scrambled: "I R E M C", correct: "MERCI", meaning: "Thank you" },
        { scrambled: "A D O P N R", correct: "PARDON", meaning: "Excuse me" },
        { scrambled: "A L S U T", correct: "SALUT", meaning: "Hi / Bye" },
        { scrambled: "H A T C", correct: "CHAT", meaning: "Cat" },
        { scrambled: "I N V", correct: "VIN", meaning: "Wine" },
        { scrambled: "P I A N", correct: "PAIN", meaning: "Bread" },
    ];

    const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
    const currentChallenge = scrambledChallengeList[currentChallengeIndex];
    
    const [guess, setGuess] = useState("");
    const [feedback, setFeedback] = useState("");
    const [mood, setMood] = useState<Mood>("idle");

    const checkWord = () => {
        if (guess.toUpperCase() === currentChallenge.correct) {
            setFeedback(`${t("claire_correct")} ${currentChallenge.meaning}.`);
            setMood("happy");
        } else {
            setFeedback(t("claire_wrong"));
            setMood("idle");
        }
    };

    const nextWord = () => {
        setCurrentChallengeIndex((prev: number) => (prev + 1) % scrambledChallengeList.length);
        setGuess("");
        setFeedback("");
        setMood("idle");
    };

    return (
        <div className="min-h-screen bg-blue-50/50 py-10 px-4 relative overflow-hidden">
            <FloatingEmojis />
            
            {/* Top Navigation */}
            <nav className="fixed top-6 right-6 z-50 flex items-center gap-4">
                <LanguageToggle />
            </nav>

            <div className="max-w-6xl mx-auto space-y-12 relative z-10">
                <header className="flex items-center gap-4">
                    <Link href="/" className="p-2 bg-white rounded-full shadow hover:scale-105 transition-transform border border-blue-100">
                        <ArrowLeft className="text-slate-600" />
                    </Link>
                    <h1 className="text-4xl font-bold text-blue-600 flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-full border-2 border-blue-200 bg-white overflow-hidden shadow-sm">
                            <Image src="/characters/claire_happy.png" alt="Teacher Claire" fill className="object-cover scale-110" />
                        </div> {t("claire_title")}
                    </h1>
                </header>

                <section id="claire-studio" className="grid grid-cols-1 xl:grid-cols-12 gap-10 pt-4">
                    {/* Character Presence */}
                    <div className="xl:col-span-4 hidden xl:flex flex-col items-center justify-center sticky top-24 h-fit">
                        <CharacterAvatar 
                            agentName="claire" 
                            mood={mood} 
                            color="bg-blue-500" 
                            displayName="Teacher Claire" 
                        />
                    </div>

                    <div className="xl:col-span-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <div className="glass rounded-3xl p-8 shadow-sm bg-white/40 backdrop-blur-md border border-white/40">
                                <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <BookText className="text-blue-500 w-6 h-6" /> {t("claire_word_builder")}
                                </h2>
                                <p className="text-slate-600 mb-6">{t("claire_scrambled_hint")}</p>

                                <div className="text-3xl font-mono tracking-[0.5em] text-center bg-blue-100/50 py-6 rounded-2xl text-blue-900 border border-blue-200 mb-6 shadow-inner">
                                    {currentChallenge.scrambled}
                                </div>

                                <div className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        value={guess}
                                        onChange={(e) => {
                                            setGuess(e.target.value);
                                            setMood("listening");
                                        }}
                                        placeholder="Type your guess here"
                                        className="flex-1 px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 font-bold uppercase tracking-widest text-slate-700 bg-white shadow-sm"
                                    />
                                    <button onClick={checkWord} className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg active:scale-95">{t("claire_check")}</button>
                                </div>
                                {feedback && (
                                    <div className="flex items-center justify-between mt-2">
                                        <p className={`text-sm font-bold ${feedback.includes(t("claire_correct")) ? 'text-green-600' : 'text-red-500'}`}>{feedback}</p>
                                        {feedback.includes(t("claire_correct")) && (
                                            <button onClick={nextWord} className="text-blue-600 font-bold text-sm underline">{t("claire_next")} →</button>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="glass rounded-3xl p-8 shadow-sm bg-white/40 backdrop-blur-md border border-white/40">
                                <h2 className="text-2xl font-bold text-slate-800 mb-4">{t("claire_vocab")}</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    {words.map((w, idx) => (
                                        <motion.div 
                                            key={idx} 
                                            whileHover={{ y: -5, scale: 1.02 }}
                                            onClick={() => setMood("happy")}
                                            className="bg-white/80 border border-slate-100 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all group cursor-pointer"
                                        >
                                            <span className="text-xl font-bold text-slate-800 mb-1">{w.fr}</span>
                                            <span className="text-sm text-slate-500 font-medium mb-3">{w.en}</span>
                                            <button className="text-blue-500 bg-blue-50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Volume2 className="w-4 h-4" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                        <div className="flex flex-col items-center lg:items-end">
                            <ChatBox
                                agentName="claire"
                                topic="French vocabulary, grammar, and greetings"
                                agentColor="bg-blue-500"
                                onMoodChange={(m: Mood) => setMood(m)}
                                context={{
                                    currentActivity: "Word Builder",
                                    scrambledWord: currentChallenge.scrambled,
                                    lastFeedback: feedback
                                }}
                            />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
