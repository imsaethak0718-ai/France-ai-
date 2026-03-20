"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ChatBox from "@/components/ChatBox";
import { ArrowLeft, MapPin, Building, Sparkles } from "lucide-react";
import Image from "next/image";
import CharacterAvatar, { Mood } from "@/components/CharacterAvatar";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import FloatingEmojis from "@/components/FloatingEmojis";

export default function LouisExplorer() {
    const { t, language } = useLanguage();
    
    const landmarks = [
        { name: t("louis_landmark1_name"), icon: <Building className="w-8 h-8 text-emerald-600" />, info: t("louis_landmark1_info") },
        { name: t("louis_landmark2_name"), icon: <Building className="w-8 h-8 text-emerald-600" />, info: t("louis_landmark2_info") },
        { name: t("louis_landmark3_name"), icon: <Building className="w-8 h-8 text-emerald-600" />, info: t("louis_landmark3_info") },
        { name: t("louis_landmark4_name"), icon: <Building className="w-8 h-8 text-emerald-600" />, info: t("louis_landmark4_info") },
    ];

    const [selectedLandmark, setSelectedLandmark] = useState(landmarks[0]);
    const [itinerary, setItinerary] = useState<string[]>([]);
    const [itineraryReady, setItineraryReady] = useState(false);
    const [mood, setMood] = useState<Mood>("idle");

    useEffect(() => {
        setSelectedLandmark(landmarks[0]);
    }, [language]);

    const generateItinerary = () => {
        setMood("thinking");
        setTimeout(() => {
            setItinerary([
                t("louis_itinerary1"),
                t("louis_itinerary2"),
                t("louis_itinerary3"),
                t("louis_itinerary4"),
            ]);
            setItineraryReady(true);
            setMood("happy");
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-emerald-50/50 py-10 px-4 relative overflow-hidden">
            <FloatingEmojis />
            
            {/* Top Navigation */}
            <nav className="fixed top-6 right-6 z-50 flex items-center gap-4">
                <LanguageToggle />
            </nav>

            <div className="max-w-6xl mx-auto space-y-12 relative z-10">
                <header className="flex items-center gap-4">
                    <Link href="/" className="p-2 bg-white rounded-full shadow hover:scale-105 transition-transform border border-emerald-100">
                        <ArrowLeft className="text-slate-600" />
                    </Link>
                    <h1 className="text-4xl font-bold text-emerald-600 flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-full border-2 border-emerald-200 bg-white overflow-hidden shadow-sm">
                            <Image src="/characters/louis_happy.png" alt="Guide Louis" fill className="object-cover scale-110" />
                        </div> {t("louis_title")}
                    </h1>
                </header>

                <section id="louis-explorer" className="grid grid-cols-1 xl:grid-cols-12 gap-10 pt-4">
                    {/* Character Presence */}
                    <div className="xl:col-span-4 hidden xl:flex flex-col items-center justify-center sticky top-24 h-fit">
                        <CharacterAvatar 
                            agentName="louis" 
                            mood={mood} 
                            color="bg-emerald-500" 
                            displayName="Guide Louis" 
                        />
                    </div>

                    <div className="xl:col-span-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="space-y-8 flex flex-col justify-start">
                            <div className="glass rounded-3xl p-8 shadow-sm bg-white/40 backdrop-blur-md border border-white/40">
                                <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Building className="text-emerald-500 w-6 h-6" /> {t("louis_landmarks_title")}
                                </h2>
                                <p className="text-slate-600 mb-6 flex items-center justify-between">
                                    {t("louis_landmark_subtitle")}
                                    <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold">Paris Interactive Map</span>
                                </p>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    {landmarks.map(lm => (
                                        <button
                                            key={lm.name}
                                            onClick={() => {
                                                setSelectedLandmark(lm);
                                                setMood("happy");
                                            }}
                                            className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all border ${selectedLandmark.name === lm.name ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-slate-200 bg-white hover:bg-slate-50 shadow-sm'}`}
                                        >
                                            {lm.icon}
                                            <span className="font-semibold text-slate-800 text-sm">{lm.name}</span>
                                        </button>
                                    ))}
                                </div>

                                {selectedLandmark && (
                                    <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-inner">
                                        <h3 className="font-bold text-xl text-emerald-900 mb-2 flex items-center gap-2">
                                            {selectedLandmark.icon} {selectedLandmark.name}
                                        </h3>
                                        <p className="text-slate-700 leading-relaxed font-medium">"{selectedLandmark.info}" - Louis</p>
                                    </div>
                                )}
                            </div>

                            <div className="glass rounded-3xl p-8 shadow-sm bg-white/40 backdrop-blur-md border border-white/40">
                                <h2 className="text-2xl font-bold text-slate-800 mb-4">{t("louis_itinerary_title")}</h2>
                                <p className="text-slate-600 mb-4">{t("louis_itinerary_subtitle")}</p>
                                {!itineraryReady ? (
                                    <button onClick={generateItinerary} className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg flex justify-center gap-2 items-center active:scale-95">
                                        <Sparkles className="w-5 h-5" /> {t("louis_generate")}
                                    </button>
                                ) : (
                                    <div className="bg-emerald-50/80 border-l-4 border-emerald-500 p-6 rounded-r-xl shadow-inner">
                                        <h3 className="font-bold text-emerald-900 mb-4 text-lg">{t("louis_itinerary_ready")}</h3>
                                        <ul className="space-y-3">
                                            {itinerary.map((item, idx) => (
                                                <li key={idx} className="flex gap-3 text-sm font-semibold text-slate-700 items-start">
                                                    <span className="bg-emerald-200 text-emerald-800 w-6 h-6 flex justify-center items-center rounded-full text-xs shrink-0">{idx + 1}</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col items-center lg:items-end">
                            <ChatBox
                                agentName="louis"
                                topic="landmarks, navigation, and Paris travel tips"
                                agentColor="bg-emerald-500"
                                onMoodChange={(m) => setMood(m)}
                                context={{
                                    selectedLandmark: selectedLandmark?.name,
                                    landmarkInfo: selectedLandmark?.info,
                                    plannedItinerary: itineraryReady ? itinerary : "Not generated yet"
                                }}
                            />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
