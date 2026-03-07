"use client";

import { useState } from "react";
import Link from "next/link";
import ChatBox from "@/components/ChatBox";
import { ArrowLeft, MapPin, Building, Sparkles } from "lucide-react";

export default function LouisExplorer() {
    const landmarks = [
        { name: "Eiffel Tower", icon: <Building className="w-8 h-8 text-slate-800" />, info: "The iconic iron lattice tower built for the 1889 World's Fair. It is the global cultural icon of France and one of the most recognizable structures in the world." },
        { name: "Louvre Museum", icon: <Building className="w-8 h-8 text-slate-800" />, info: "The world's largest art museum and a historic monument in Paris. Home to the Mona Lisa and the Venus de Milo." },
        { name: "Notre Dame", icon: <Building className="w-8 h-8 text-slate-800" />, info: "A medieval Catholic cathedral on the Île de la Cité, famous for its French Gothic architecture." },
        { name: "Arc de Triomphe", icon: <Building className="w-8 h-8 text-slate-800" />, info: "One of the most famous monuments in Paris, standing at the western end of the Champs-Élysées, honoring those who fought and died for France." },
    ];

    const [selectedLandmark, setSelectedLandmark] = useState(landmarks[0]);
    const [itinerary, setItinerary] = useState<string[]>([]);
    const [itineraryReady, setItineraryReady] = useState(false);

    const generateItinerary = () => {
        setItinerary(["Morning: Visit the Louvre", "Lunch: Café on the Seine", "Afternoon: Explore Montmartre", "Evening: Sunset at the Eiffel Tower"]);
        setItineraryReady(true);
    };

    return (
        <div className="min-h-screen bg-emerald-50/50 py-10 px-4">
            <div className="max-w-6xl mx-auto space-y-12">
                <header className="flex items-center gap-4">
                    <Link href="/" className="p-2 bg-white rounded-full shadow hover:scale-105 transition-transform">
                        <ArrowLeft className="text-slate-600" />
                    </Link>
                    <h1 className="text-4xl font-bold text-emerald-600 flex items-center gap-3">
                        <MapPin className="w-10 h-10" /> Guide Louis's Paris Explorer
                    </h1>
                </header>

                <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-8 flex flex-col justify-start">
                        <div className="glass rounded-3xl p-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Building className="text-emerald-500 w-6 h-6" /> Explore Landmarks
                            </h2>
                            <p className="text-slate-600 mb-6 flex items-center justify-between">
                                Click a landmark to learn more.
                                <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold">Paris Interactive Map</span>
                            </p>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                {landmarks.map(lm => (
                                    <button
                                        key={lm.name}
                                        onClick={() => setSelectedLandmark(lm)}
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

                        <div className="glass rounded-3xl p-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">Plan Your Day</h2>
                            <p className="text-slate-600 mb-4">Need help organizing your trip to Paris?</p>
                            {!itineraryReady ? (
                                <button onClick={generateItinerary} className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm flex justify-center gap-2 items-center">
                                    <Sparkles className="w-5 h-5" /> Generate Perfect Itinerary
                                </button>
                            ) : (
                                <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl">
                                    <h3 className="font-bold text-emerald-900 mb-3 text-lg">Your Custom Itinerary</h3>
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
                        <ChatBox agentName="Guide Louis" topic="landmarks, navigation, and Paris travel tips" agentColor="bg-emerald-500" />
                    </div>
                </section>
            </div>
        </div>
    );
}
