"use client";

import { useState } from "react";
import Link from "next/link";
import ChatBox from "@/components/ChatBox";
import { ArrowLeft, Hourglass, Calendar, ScrollText } from "lucide-react";

export default function MarieHistory() {
    const [sliderValue, setSliderValue] = useState(1789);

    const getEvent = (year: number) => {
        if (year < 1000) return { title: "Charlemagne Crowned", desc: "800 AD: Charlemagne is crowned Holy Roman Emperor, uniting much of Western Europe." };
        if (year < 1500) return { title: "Hundred Years' War", desc: "1337-1453: Series of conflicts waged from 1337 to 1453 between the House of Plantagenet and the House of Valois." };
        if (year < 1800) return { title: "French Revolution", desc: "1789: The revolution led to the end of the monarchy and the rise of Napoleon Bonaparte." };
        if (year < 1900) return { title: "Eiffel Tower Completed", desc: "1889: Built as the entrance to the 1889 World's Fair, celebrating the centennial of the French Revolution." };
        return { title: "World War II Liberation", desc: "1944: The Liberation of Paris took place during World War II, ending the Nazi occupation." };
    };

    const currentEvent = getEvent(sliderValue);

    const hints = ["He was a French military and political leader.", "He rose to prominence during the French Revolution.", "He declared himself Emperor in 1804."];
    const [hintIndex, setHintIndex] = useState(0);
    const [guess, setGuess] = useState("");
    const [feedback, setFeedback] = useState("");

    const checkGuess = () => {
        if (guess.toLowerCase().includes("napoleon")) {
            setFeedback("Correct! It was Napoleon Bonaparte.");
        } else {
            setFeedback("Not quite. Keep guessing or ask for a hint.");
        }
    };

    return (
        <div className="min-h-screen bg-purple-50/50 py-10 px-4">
            <div className="max-w-6xl mx-auto space-y-12">
                <header className="flex items-center gap-4">
                    <Link href="/" className="p-2 bg-white rounded-full shadow hover:scale-105 transition-transform">
                        <ArrowLeft className="text-slate-600" />
                    </Link>
                    <h1 className="text-4xl font-bold text-purple-600 flex items-center gap-3">
                        <Hourglass className="w-10 h-10" /> Historian Marie's Time Travel
                    </h1>
                </header>

                <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-8 flex flex-col justify-start">
                        <div className="glass rounded-3xl p-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Calendar className="text-purple-500 w-6 h-6" /> Timeline Slider
                            </h2>
                            <p className="text-slate-600 mb-6 flex items-center justify-between">
                                Slide through time to discover major historical events.
                            </p>

                            <div className="mb-6 px-4">
                                <input
                                    type="range"
                                    min="500"
                                    max="2000"
                                    value={sliderValue}
                                    onChange={(e) => setSliderValue(Number(e.target.value))}
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

                        <div className="glass rounded-3xl p-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <ScrollText className="w-5 h-5 text-purple-500" /> History Guessing Game
                            </h2>
                            <p className="text-slate-600 mb-4 font-medium italic">"Who am I?"</p>

                            <div className="bg-purple-50 p-4 rounded-xl mb-4 border-l-4 border-purple-400 text-slate-800 font-semibold shadow-inner">
                                Hint {hintIndex + 1}: {hints[hintIndex]}
                            </div>

                            <div className="flex gap-2 mb-4">
                                <button
                                    onClick={() => setHintIndex((prev) => Math.min(prev + 1, hints.length - 1))}
                                    className="text-sm font-bold text-purple-600 underline"
                                >
                                    Next Hint
                                </button>
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={guess}
                                    onChange={(e) => setGuess(e.target.value)}
                                    placeholder="Type historical figure"
                                    className="flex-1 px-4 py-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 font-bold text-slate-700 bg-white"
                                />
                                <button onClick={checkGuess} className="bg-purple-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors shadow-sm">Guess</button>
                            </div>

                            {feedback && (
                                <p className={`text-sm font-bold mt-3 ${feedback.includes('Correct') ? 'text-green-600' : 'text-red-500'}`}>{feedback}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col items-center lg:items-end">
                        <ChatBox agentName="Historian Marie" topic="French history, wars, and key figures" agentColor="bg-purple-500" />
                    </div>
                </section>
            </div>
        </div>
    );
}
