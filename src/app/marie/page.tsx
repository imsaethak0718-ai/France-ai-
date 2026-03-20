"use client";

import { useState } from "react";
import Link from "next/link";
import ChatBox from "@/components/ChatBox";
import { ArrowLeft, Calendar, ScrollText } from "lucide-react";
import Image from "next/image";
import CharacterAvatar, { Mood } from "@/components/CharacterAvatar";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import FloatingEmojis from "@/components/FloatingEmojis";

export default function MarieHistory() {
    const { t, language } = useLanguage();
    const [sliderValue, setSliderValue] = useState(1789);

    const getEvent = (year: number) => {
        if (year < 1000) return { title: t("marie_event1_title"), desc: t("marie_event1_desc") };
        if (year < 1500) return { title: t("marie_event2_title"), desc: t("marie_event2_desc") };
        if (year < 1800) return { title: t("marie_event3_title"), desc: t("marie_event3_desc") };
        if (year < 1900) return { title: t("marie_event4_title"), desc: t("marie_event4_desc") };
        return { title: t("marie_event5_title"), desc: t("marie_event5_desc") };
    };

    const currentEvent = getEvent(sliderValue);

    const hints = ["He was a French military and political leader.", "He rose to prominence during the French Revolution.", "He declared himself Emperor in 1804."];
    const [hintIndex, setHintIndex] = useState(0);
    const [guess, setGuess] = useState("");
    const [feedback, setFeedback] = useState("");
    const [mood, setMood] = useState<Mood>("idle");

    const checkGuess = () => {
        if (guess.toLowerCase().includes("napoleon")) {
            setFeedback(t("marie_correct"));
            setMood("happy");
        } else {
            setFeedback(t("marie_wrong"));
            setMood("idle");
        }
    };

    return (
        <div className="min-h-screen bg-purple-50/50 py-10 px-4 relative overflow-hidden">
            <FloatingEmojis />
            
            {/* Top Navigation */}
            <nav className="fixed top-6 right-6 z-50 flex items-center gap-4">
                <LanguageToggle />
            </nav>

            <div className="max-w-6xl mx-auto space-y-12 relative z-10">
                <header className="flex items-center gap-4">
                    <Link href="/" className="p-2 bg-white rounded-full shadow hover:scale-105 transition-transform border border-purple-100">
                        <ArrowLeft className="text-slate-600" />
                    </Link>
                    <h1 className="text-4xl font-bold text-purple-600 flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-full border-2 border-purple-200 bg-white overflow-hidden shadow-sm">
                            <Image src="/characters/marie_happy.png" alt="Historian Marie" fill className="object-cover scale-110" />
                        </div> {t("marie_title")}
                    </h1>
                </header>

                <section id="marie-history" className="grid grid-cols-1 xl:grid-cols-12 gap-10 pt-4">
                    {/* Character Presence */}
                    <div className="xl:col-span-4 hidden xl:flex flex-col items-center justify-center sticky top-24 h-fit">
                        <CharacterAvatar 
                            agentName="marie" 
                            mood={mood} 
                            color="bg-purple-500" 
                            displayName="Historian Marie" 
                        />
                    </div>

                    <div className="xl:col-span-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="space-y-8 flex flex-col justify-start">
                            <div className="glass rounded-3xl p-8 shadow-sm bg-white/40 backdrop-blur-md border border-white/40">
                                <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Calendar className="text-purple-500 w-6 h-6" /> {t("marie_timeline_title")}
                                </h2>
                                <p className="text-slate-600 mb-6 flex items-center justify-between">
                                    {t("marie_timeline_subtitle")}
                                </p>

                                <div className="mb-6 px-4">
                                    <input
                                        type="range"
                                        min="500"
                                        max="2000"
                                        value={sliderValue}
                                        onChange={(e) => {
                                            setSliderValue(Number(e.target.value));
                                            setMood("thinking");
                                        }}
                                        className="w-full accent-purple-600 h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-xs font-bold text-purple-400 mt-2">
                                        <span>500 AD</span>
                                        <span>1000 AD</span>
                                        <span>1500 AD</span>
                                        <span>2000 AD</span>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-inner">
                                    <h3 className="font-bold text-2xl text-purple-900 mb-2">{currentEvent.title}</h3>
                                    <p className="text-slate-700 leading-relaxed font-medium">"{currentEvent.desc}" - Marie</p>
                                </div>
                            </div>

                            <div className="glass rounded-3xl p-8 shadow-sm bg-white/40 backdrop-blur-md border border-white/40">
                                <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <ScrollText className="w-5 h-5 text-purple-500" /> {t("marie_game_title")}
                                </h2>
                                <p className="text-slate-600 mb-4 font-medium italic">{t("marie_game_hint")}</p>

                                <div className="bg-purple-50 p-4 rounded-xl mb-4 border-l-4 border-purple-400 text-slate-800 font-semibold shadow-inner">
                                    Hint {hintIndex + 1}: {hints[hintIndex]}
                                </div>

                                <div className="flex gap-2 mb-4">
                                    <button
                                        onClick={() => {
                                            setHintIndex((prev) => Math.min(prev + 1, hints.length - 1));
                                            setMood("thinking");
                                        }}
                                        className="text-sm font-bold text-purple-600 underline"
                                    >
                                        {t("marie_next_hint")}
                                    </button>
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={guess}
                                        onChange={(e) => {
                                            setGuess(e.target.value);
                                            setMood("listening");
                                        }}
                                        placeholder="Type historical figure"
                                        className="flex-1 px-4 py-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 font-bold text-slate-700 bg-white"
                                    />
                                    <button onClick={checkGuess} className="bg-purple-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors shadow-lg active:scale-95">{t("marie_guess")}</button>
                                </div>

                                {feedback && (
                                    <p className={`text-sm font-bold mt-3 ${feedback.includes('Correct') ? 'text-green-600' : 'text-red-500'}`}>{feedback}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col items-center lg:items-end">
                            <ChatBox
                                agentName="marie"
                                topic="French history, wars, and key figures"
                                agentColor="bg-purple-500"
                                onMoodChange={(m) => setMood(m)}
                                context={{
                                    currentYear: sliderValue,
                                    currentHistoricalEvent: currentEvent.title,
                                    eventDescription: currentEvent.desc
                                }}
                            />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
