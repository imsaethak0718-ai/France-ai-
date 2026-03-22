"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { 
    ArrowLeft, MapPin, Building, Sparkles, Map as MapIcon, 
    Navigation, Compass, Luggage, Coffee, Utensils, Globe, 
    ChevronRight, Zap, Info, Landmark, Camera, Gem,
    Sun, CloudRain, Snowflake, Thermometer, Clock, Calendar,
    ListFilter, Bus, Train, Map as MetroIcon, Clock4,
    Ticket, ExternalLink, RefreshCw, Wallet, Heart, Timer
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import ChatBox, { ChatBoxHandle } from "@/components/ChatBox";
import CharacterAvatar, { Mood } from "@/components/CharacterAvatar";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import FloatingEmojis from "@/components/FloatingEmojis";
import dynamic from "next/dynamic";

const RealTimeMap = dynamic(() => import("@/components/RealTimeMap"), { 
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-100 flex items-center justify-center animate-pulse">Loading Map...</div>
});

const TransportMap = dynamic(() => import("@/components/TransportMap"), { 
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-100 flex items-center justify-center animate-pulse">Initializing Metro Map...</div>
});

// --- Data: Cities & Monuments ---
type City = {
    id: string;
    nameKey: string;
    categoryKey: string;
    descriptionKey: string;
    foodKey: string;
    bgImage: string;
    coords: { top: string, left: string };
    landmarks: { nameKey: string, type: string, gem: boolean, searchName: string }[];
    transport: {
        metro: { line: string, color: string, destination: string, tooltip: string }[];
        bus: { route: string, destination: string, platform: string }[];
        tram: { route: string, destination: string, platform: string, color: string }[];
    };
};

const CITIES: City[] = [
    { 
        id: "paris", 
        nameKey: "city_paris_name", 
        categoryKey: "city_paris_cat",
        descriptionKey: "city_paris_desc",
        foodKey: "city_paris_food", 
        bgImage: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1000",
        coords: { top: "30%", left: "48%" },
        landmarks: [
            { nameKey: "landmark_eiffel", type: "Landmark", gem: false, searchName: "Eiffel Tower" },
            { nameKey: "landmark_louvre", type: "Museum", gem: false, searchName: "Louvre Museum" },
            { nameKey: "landmark_rosiers", type: "Food", gem: true, searchName: "Rue des Rosiers Paris" },
            { nameKey: "landmark_plantee", type: "Nature", gem: true, searchName: "Promenade Plantée Paris" }
        ],
        transport: {
            metro: [
                { line: "1", color: "#FFCE00", destination: "Château de Vincennes", tooltip: "Louvre access" },
                { line: "6", color: "#6ECA97", destination: "Charles de Gaulle – Étoile", tooltip: "Eiffel view" }
            ],
            bus: [
                { route: "42", destination: "Eiffel Tower", platform: "Stop A" },
                { route: "69", destination: "Louvre Museum", platform: "Stop B" },
                { route: "72", destination: "Hôtel de Ville", platform: "Stop C" }
            ],
            tram: [
                { route: "T3a", destination: "Pont du Garigliano", platform: "Track 1", color: "#F28C00" }
            ]
        }
    },
    { 
        id: "lyon", 
        nameKey: "city_lyon_name", 
        categoryKey: "city_lyon_cat",
        descriptionKey: "city_lyon_desc",
        foodKey: "city_lyon_food", 
        bgImage: "https://images.unsplash.com/photo-1574621453289-53609f3ed192?auto=format&fit=crop&q=80&w=1000",
        coords: { top: "60%", left: "65%" },
        landmarks: [
            { nameKey: "landmark_fourviere", type: "Landmark", gem: false, searchName: "Basilique Notre-Dame de Fourvière" },
            { nameKey: "landmark_vieux_lyon", type: "History", gem: false, searchName: "Vieux Lyon" },
            { nameKey: "landmark_halles", type: "Food", gem: true, searchName: "Les Halles de Lyon" }
        ],
        transport: {
            metro: [{ line: "A", color: "#ED1C24", destination: "Perrache", tooltip: "Old Town" }],
            bus: [{ route: "C3", destination: "Gare Saint-Paul", platform: "Bus Lane 2" }],
            tram: [{ route: "T1", destination: "Debourg", platform: "Quai Sud", color: "#0072BC" }]
        }
    },
    { 
        id: "nice", 
        nameKey: "city_nice_name", 
        categoryKey: "city_nice_cat",
        descriptionKey: "city_nice_desc",
        foodKey: "city_nice_food", 
        bgImage: "https://images.unsplash.com/photo-1512411516053-ec064d7be08a?auto=format&fit=crop&q=80&w=1000",
        coords: { top: "85%", left: "80%" },
        landmarks: [
            { nameKey: "landmark_promenade", type: "Nature", gem: false, searchName: "Promenade des Anglais" },
            { nameKey: "landmark_castle", type: "Viewpoint", gem: false, searchName: "Castle Hill Nice" },
            { nameKey: "landmark_saleya", type: "Market", gem: true, searchName: "Cours Saleya Nice" }
        ],
        transport: {
            metro: [],
            bus: [{ route: "12", destination: "Promenade", platform: "Stop 4" }],
            tram: [{ route: "T2", destination: "Airport", platform: "Terminal 2", color: "#EC1C24" }]
        }
    },
    { 
        id: "marseille", 
        nameKey: "city_marseille_name", 
        categoryKey: "city_marseille_cat",
        descriptionKey: "city_marseille_desc",
        foodKey: "city_marseille_food", 
        bgImage: "https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&q=80&w=1000",
        coords: { top: "88%", left: "70%" },
        landmarks: [
            { nameKey: "landmark_vieux_port", type: "Landmark", gem: false, searchName: "Vieux-Port Marseille" },
            { nameKey: "landmark_garde", type: "History", gem: false, searchName: "Notre-Dame de la Garde" },
            { nameKey: "landmark_panier", type: "Culture", gem: true, searchName: "The Panier District" }
        ],
        transport: {
            metro: [{ line: "M1", color: "#0078C1", destination: "Vieux Port", tooltip: "Port Access" }],
            bus: [{ route: "60", destination: "Notre-Dame", platform: "Stop 1" }],
            tram: [{ route: "T1", destination: "Noailles", platform: "Underground", color: "#E30613" }]
        }
    }
];

// --- Components ---

const Section = ({ children, id, className = "" }: { children: React.ReactNode, id: string, className?: string }) => (
    <motion.section
        id={id}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className={`max-w-7xl mx-auto px-6 py-20 ${className}`}
    >
        {children}
    </motion.section>
);

const TransportTable = ({ city }: { city: City }) => {
    const { t } = useLanguage();
    const [refreshing, setRefreshing] = useState(false);
    const [mockTimes, setMockTimes] = useState<Record<string, string>>({});

    const generateTimes = useCallback(() => {
        const times: Record<string, string> = {};
        const now = new Date();
        [...city.transport.bus, ...city.transport.tram].forEach(item => {
            const minutes = Math.floor(Math.random() * 15) + 1;
            const arrival = new Date(now.getTime() + minutes * 60000);
            times[item.route] = `${arrival.getHours().toString().padStart(2, '0')}:${arrival.getMinutes().toString().padStart(2, '0')}`;
        });
        setMockTimes(times);
    }, [city]);

    useEffect(() => {
        generateTimes();
    }, [generateTimes]);

    const handleRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            generateTimes();
            setRefreshing(false);
        }, 1200);
    };

    return (
        <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-slate-100 overflow-hidden relative">
            <div className="flex items-center justify-between mb-8">
                <h4 className="font-black text-slate-900 uppercase tracking-tighter text-xl italic">{t("louis_live_timings")}</h4>
                <button 
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className={`p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-emerald-600 transition-all ${refreshing ? 'animate-spin' : ''}`}
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead>
                        <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <th className="px-6 py-3">{t("louis_route")}</th>
                            <th className="px-6 py-3">{t("louis_destination")}</th>
                            <th className="px-6 py-3">{t("louis_arrival")}</th>
                            <th className="px-6 py-3">{t("louis_platform")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...city.transport.bus, ...city.transport.tram].map((item) => (
                            <tr key={item.route} className="group hover:bg-emerald-50/50 transition-colors">
                                <td className="px-6 py-4 bg-slate-50 rounded-l-2xl border-y border-l border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-sm ${'color' in item ? '' : 'bg-emerald-600'}`} style={{ backgroundColor: 'color' in item ? (item as any).color : undefined }}>
                                            {item.route}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 bg-slate-50 border-y border-slate-100 font-black text-slate-800 uppercase italic text-sm">{item.destination}</td>
                                <td className="px-6 py-4 bg-slate-50 border-y border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="font-black text-emerald-600 tabular-nums">{mockTimes[item.route]}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 bg-slate-50 rounded-r-2xl border-y border-r border-slate-100 text-[10px] font-black uppercase text-slate-400">{item.platform}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default function LouisExplorer() {
    const { t, language } = useLanguage();
    const [mood, setMood] = useState<Mood>("idle");
    const [activeCity, setActiveCity] = useState(CITIES[0]);
    const [isLocalMode, setIsLocalMode] = useState(false);
    const [itinerary, setItinerary] = useState<any[] | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Chat Ref for programmatic messaging
    const chatRef = useRef<ChatBoxHandle>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    
    // Trip Planner State
    const [duration, setDuration] = useState(3);
    const [budget, setBudget] = useState("medium");
    const [interests, setInterests] = useState<string[]>(["culture"]);
    
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: containerRef });
    const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -50]);

    useEffect(() => {
        setMood("happy");
    }, []);

    const toggleInterest = (interest: string) => {
        setInterests(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]);
    };

    const handleGenerateTrip = () => {
        setIsGenerating(true);
        setMood("thinking");
        setItinerary(null);
        
        setTimeout(() => {
            const plan = [
                { day: 1, title: "Classic Impressions", morning: "Visit the Louvre Museum", afternoon: "Coffee at a hidden terrace in Le Marais", evening: "Seine river cruise sunset walk" },
                { day: 2, title: "Local Rhythms", morning: "Explore the Marché d'Aligre", afternoon: "Artisan walk in Montmartre", evening: "Traditional dinner near Notre-Dame" },
                { day: 3, title: "Modern Vibe", morning: "Centre Pompidou modern art", afternoon: "Shopping at Rue de Rivoli", evening: "Rooftop drinks at Belleville" },
            ];
            setItinerary(plan);
            setIsGenerating(false);
            setMood("happy");
        }, 2000);
    };

    const handleFindRouteAi = (from: string, to: string) => {
        if (!isChatOpen) setIsChatOpen(true);
        setTimeout(() => {
            chatRef.current?.sendMessage(`Louis, I need to get from ${from} to ${to} in ${t(activeCity.nameKey)}. What's the best way to travel? Tell me which metro, bus, or tram to take!`);
        }, 500);
    };

    const handleMoodChange = useCallback((m: Mood) => setMood(m), []);

    return (
        <main ref={containerRef} className="bg-slate-50 text-slate-900 min-h-screen overflow-x-hidden selection:bg-emerald-100 relative font-sans">
            <FloatingEmojis />
            
            {/* [ NAVIGATION ] */}
            <nav className="fixed top-0 inset-x-0 h-20 z-[100] flex items-center justify-between px-8 bg-white/80 backdrop-blur-2xl border-b border-white/40 shadow-sm">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xl group-hover:rotate-12 transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    <span className="font-black text-xl tracking-tight text-slate-900">France<span className="text-emerald-600">AI</span></span>
                </Link>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-6 mr-8">
                        {["Map", "Cities", "Planner", "Tips"].map(item => (
                            <Link key={item} href={`#${item.toLowerCase()}`} className="text-sm font-black text-slate-400 hover:text-emerald-600 transition-colors uppercase tracking-widest">
                                {t(`nav_${item.toLowerCase()}`)}
                            </Link>
                        ))}
                    </div>
                    <LanguageToggle />
                </div>
            </nav>

            {/* [ HERO SECTION ] */}
            <motion.section style={{ opacity: heroOpacity, y: heroY }} className="relative min-h-[90vh] flex items-center justify-center pt-24 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/white-diamond.png')] opacity-10 pointer-events-none" />
                <div className="max-w-7xl mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-center lg:text-left relative z-10">
                    <div className="space-y-8">
                        <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                            <Compass className="w-4 h-4 animate-spin-slow" />
                            <span className="text-xs font-black uppercase tracking-widest">{t("louis_tagline_hero")}</span>
                        </motion.div>
                        <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter">
                            {t("louis_hero_h1")} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">{t("louis_hero_h1_span")}</span>
                        </motion.h1>
                        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-xl text-slate-400 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            {t("louis_hero_p")}
                        </motion.p>
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                            <Link href="#map" className="px-10 py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-black transition-all hover:scale-105 active:scale-95">
                                {t("louis_start_exploring")}
                            </Link>
                            <Link href="#planner" className="px-10 py-5 bg-white text-emerald-600 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl border border-emerald-100 hover:shadow-2xl transition-all">
                                {t("louis_plan_trip")}
                            </Link>
                        </motion.div>
                    </div>
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1, ease: "easeOut" }} className="relative flex justify-center">
                        <div className="w-[400px] h-[400px] lg:w-[600px] lg:h-[600px] relative">
                             <CharacterAvatar agentName="louis" mood={mood} isHero={true} color="bg-emerald-500" />
                        </div>
                    </motion.div>
                </div>
            </motion.section>

            {/* [ INTERACTIVE MAP ] */}
            <Section id="map" className="relative">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-5xl font-black tracking-tighter uppercase italic text-slate-900 border-b-8 border-emerald-100 inline-block">{t("nav_map")}</h2>
                    <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.4em]">{t("choose_guide")}</p>
                </div>
                <div className="relative w-full aspect-[16/9] lg:aspect-[21/9] bg-white rounded-[4rem] shadow-[0_40px_100px_rgba(0,0,0,0.05)] border border-white p-6 overflow-hidden">
                    <div className="absolute inset-0 bg-emerald-50/20 backdrop-blur-sm" />
                    <div className="relative w-full h-full border-4 border-emerald-100/50 rounded-[3.5rem] overflow-hidden bg-white">
                        <RealTimeMap 
                            activeCity={{ ...activeCity, name: t(activeCity.nameKey) }} 
                            onCityClick={(cityId) => {
                                const city = CITIES.find(c => c.id === cityId);
                                if (city) {
                                    setActiveCity(city);
                                    setMood("happy");
                                }
                            }}
                        />
                    </div>
                </div>
            </Section>

            {/* [ CITY explorer ] */}
            <Section id="cities" className="pt-0">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
                    <div className="lg:col-span-12 flex flex-col items-center text-center space-y-6 mb-12">
                        <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic">{t("louis_landmarks_title")}: {t(activeCity.nameKey)}</h2>
                    </div>

                    <div className="lg:col-span-4 space-y-4">
                        {CITIES.map((city) => (
                            <button
                                key={city.id}
                                onClick={() => setActiveCity(city)}
                                className={`w-full p-6 rounded-[2.5rem] transition-all flex items-center justify-between group shadow-sm ${activeCity.id === city.id ? 'bg-emerald-600 text-white shadow-2xl scale-105' : 'bg-white text-slate-900 hover:bg-emerald-50'}`}
                            >
                                <div className="flex items-center gap-4 text-left">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${activeCity.id === city.id ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-emerald-100'}`}>
                                        <Landmark className={`w-6 h-6 ${activeCity.id === city.id ? 'text-white' : 'text-emerald-600'}`} />
                                    </div>
                                    <div>
                                        <h4 className="font-black uppercase tracking-tight text-xl">{t(city.nameKey)}</h4>
                                        <span className={`text-[10px] font-black uppercase tracking-widest opacity-60`}>{t(city.categoryKey)}</span>
                                    </div>
                                </div>
                                <ChevronRight className={`w-5 h-5 transition-transform ${activeCity.id === city.id ? 'rotate-10' : 'group-hover:translate-x-2'}`} />
                            </button>
                        ))}
                    </div>

                    <div className="lg:col-span-8">
                         <AnimatePresence mode="wait">
                            <motion.div
                                key={activeCity.id + language}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.4 }}
                                className="bg-white rounded-[4rem] p-10 md:p-16 shadow-[0_40px_120px_rgba(0,0,0,0.05)] border border-white relative overflow-hidden flex flex-col group/card"
                            >
                                <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.08] group-hover/card:opacity-15 transition-opacity duration-1000">
                                    <Image 
                                        src={activeCity.bgImage} 
                                        alt={t(activeCity.nameKey)} 
                                        fill 
                                        className="object-cover blur-[1px]"
                                    />
                                </div>

                                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                                     <div className="space-y-4 max-w-lg">
                                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">{t(activeCity.nameKey)} <span className="text-emerald-500 underline decoration-8 decoration-emerald-100">{t("louis_guide_suffix")}</span></h3>
                                        <p className="text-slate-500 font-medium text-lg leading-relaxed">{t(activeCity.descriptionKey)}</p>
                                     </div>
                                     <div className="w-full md:w-auto space-y-3">
                                        <div className="flex items-center gap-4 p-4 pe-8 bg-blue-50/50 rounded-3xl border border-blue-100/50 group hover:shadow-lg transition-all">
                                             <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                                                <Utensils className="w-6 h-6" />
                                             </div>
                                             <div>
                                                <h5 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">{t("ui_local_dish")}</h5>
                                                <p className="font-black text-slate-800 uppercase italic whitespace-nowrap">{t(activeCity.foodKey)}</p>
                                             </div>
                                        </div>
                                     </div>
                                </div>

                                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                     {activeCity.landmarks.filter(l => !l.gem || isLocalMode).map((lm, idx) => (
                                        <motion.div 
                                            key={lm.nameKey}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className={`p-6 rounded-3xl border flex items-center justify-between transition-all group/landmark ${lm.gem ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100 hover:shadow-md'}`}
                                        >
                                            <div className="absolute inset-0 opacity-0 group-hover/landmark:opacity-[0.03] transition-opacity overflow-hidden pointer-events-none rounded-3xl">
                                                 <Image src={activeCity.bgImage} alt="bg" fill className="object-cover" />
                                            </div>
                                            <div className="flex items-center gap-4 relative z-10">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${lm.gem ? 'bg-amber-500 text-white' : 'bg-white'}`}>
                                                    {lm.gem ? <Gem className="w-5 h-5" /> : <Camera className="w-5 h-5 text-slate-400" />}
                                                </div>
                                                <div>
                                                    <h5 className="font-black text-slate-800 uppercase tracking-tighter text-sm italic">{t(lm.nameKey)} {lm.gem && "✨"}</h5>
                                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{lm.type}</span>
                                                </div>
                                            </div>
                                            <Link 
                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lm.searchName)}`}
                                                target="_blank"
                                                className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm group-hover/landmark:scale-110 relative z-10"
                                                title={t("louis_open_maps")}
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </Link>
                                        </motion.div>
                                     ))}
                                </div>
                            </motion.div>
                         </AnimatePresence>
                    </div>
                </div>
            </Section>

            {/* [ REAL-WORLD TRANSPORT SYSTEM ] */}
            <Section id="transport">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-5xl font-black tracking-tighter uppercase italic text-slate-900">{t("louis_transport_title")}</h2>
                    <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.4em]">Official Metropolitan Transit & Route Planning</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                     <div className="lg:col-span-8 space-y-8">
                        <div className="h-[600px]">
                            <TransportMap 
                                activeCityId={activeCity.id} 
                                onFindRoute={handleFindRouteAi}
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Link href="https://www.ratp.fr/en" target="_blank" className="p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                                        <Ticket className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{t("louis_book_tickets")}</span>
                                </div>
                                <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                            </Link>
                            <Link href="https://www.sncf-connect.com/en-en/" target="_blank" className="p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
                                        <Train className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{t("louis_buy_bus")}</span>
                                </div>
                                <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                            </Link>
                            <Link href="https://citymapper.com" target="_blank" className="p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
                                        <Navigation className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{t("louis_view_pass")}</span>
                                </div>
                                <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                            </Link>
                        </div>
                     </div>
                     <div className="lg:col-span-4">
                        <TransportTable city={activeCity} />
                     </div>
                </div>
            </Section>

            {/* [ TRIP PLANNER ] */}
            <Section id="planner" className="relative">
                 <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                        <div className="space-y-12 sticky top-32">
                            <h2 className="text-7xl font-black text-slate-900 tracking-tighter leading-[0.85] italic uppercase">{t("ui_planner_title")}</h2>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                     <div className="flex items-center gap-2 text-slate-400">
                                        <Timer className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Duration</span>
                                     </div>
                                     <div className="flex gap-2 bg-white p-2 rounded-3xl border border-slate-100 shadow-sm">
                                        {[1, 3, 5, 7].map(d => (
                                            <button 
                                                key={d}
                                                onClick={() => setDuration(d)}
                                                className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all ${duration === d ? 'bg-emerald-600 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-400'}`}
                                            >
                                                {d}d
                                            </button>
                                        ))}
                                     </div>
                                </div>

                                <div className="space-y-4">
                                     <div className="flex items-center gap-2 text-slate-400">
                                        <Wallet className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Budget</span>
                                     </div>
                                     <div className="flex gap-2 bg-white p-2 rounded-3xl border border-slate-100 shadow-sm">
                                        {['low', 'medium', 'high'].map(b => (
                                            <button 
                                                key={b}
                                                onClick={() => setBudget(b)}
                                                className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all capitalize ${budget === b ? 'bg-emerald-600 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-400'}`}
                                            >
                                                {b}
                                            </button>
                                        ))}
                                     </div>
                                </div>

                                <div className="sm:col-span-2 space-y-4">
                                     <div className="flex items-center gap-2 text-slate-400">
                                        <Heart className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Interests</span>
                                     </div>
                                     <div className="flex flex-wrap gap-2">
                                        {['culture', 'food', 'nature', 'nightlife', 'history'].map(i => (
                                            <button 
                                                key={i}
                                                onClick={() => toggleInterest(i)}
                                                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${interests.includes(i) ? 'bg-slate-900 text-white' : 'bg-white border border-slate-100 text-slate-400'}`}
                                            >
                                                {i}
                                            </button>
                                        ))}
                                     </div>
                                </div>
                            </div>

                            <button 
                                onClick={handleGenerateTrip}
                                disabled={isGenerating}
                                className="w-full py-8 bg-black text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] hover:scale-105 transition-all flex items-center justify-center gap-4 relative overflow-hidden group"
                            >
                                {isGenerating ? (
                                    <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                                ) : (
                                    <Sparkles className="w-6 h-6 text-emerald-400 group-hover:rotate-12 transition-transform" />
                                )}
                                <span>{isGenerating ? "Consulting Louis..." : t("ui_planner_gen")}</span>
                            </button>
                        </div>

                        <div className="relative min-h-[600px]">
                            <AnimatePresence mode="wait">
                                {isGenerating ? (
                                    <motion.div 
                                        key="generating"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-6"
                                    >
                                        <div className="w-32 h-32 relative">
                                            <div className="absolute inset-0 bg-emerald-500/20 blur-3xl animate-pulse" />
                                            <Image src="/characters/louis_thinking.png" alt="Thinking" fill className="object-cover scale-150 animate-bounce" />
                                        </div>
                                        <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.4em] animate-pulse">Drafting your perfect trip...</p>
                                    </motion.div>
                                ) : itinerary ? (
                                    <motion.div 
                                        key="results"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-6"
                                    >
                                        {itinerary.map((day, idx) => (
                                            <motion.div 
                                                key={idx}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group/day"
                                            >
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black italic shadow-lg">
                                                            {day.day}
                                                        </div>
                                                        <h4 className="font-black text-slate-900 uppercase tracking-tighter text-xl italic">{day.title}</h4>
                                                    </div>
                                                    <div className="p-2 bg-slate-50 rounded-xl">
                                                        <Calendar className="w-4 h-4 text-slate-300" />
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-6">
                                                    {[
                                                        { label: "Matin", text: day.morning, icon: 'sun' },
                                                        { label: "Après-midi", text: day.afternoon, icon: 'coffee' },
                                                        { label: "Soir", text: day.evening, icon: 'moon' }
                                                    ].map((item, i) => (
                                                        <div key={i} className="flex gap-6 group/item">
                                                            <div className="w-1 h-12 rounded-full bg-slate-100 group-hover/item:bg-emerald-500 transition-colors shrink-0" />
                                                            <div>
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">{item.label}</span>
                                                                <p className="text-slate-600 font-medium">{item.text}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 bg-slate-100/50 rounded-[4rem] border-4 border-dashed border-slate-200">
                                        <Luggage className="w-16 h-16 text-slate-200 mb-6" />
                                        <p className="text-slate-400 font-black uppercase text-xs tracking-[0.4em] max-w-[200px]">Customize and click provide to see results!</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                 </div>
            </Section>

            {/* [ FOOTER ] */}
            <footer className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-[2rem] bg-emerald-600 flex items-center justify-center text-white shadow-xl">
                        <Compass className="w-8 h-8" />
                    </div>
                    <div>
                         <h4 className="font-black text-slate-900 uppercase tracking-tight text-xl italic">{t("ui_footer_name")}</h4>
                         <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t("ui_footer_est")}</p>
                    </div>
                </div>
            </footer>

            {/* [ FLOATING CHAT SYSTEM ] */}
            <div className="fixed bottom-6 right-6 z-[2000]">
                 <AnimatePresence mode="wait">
                    {isChatOpen ? (
                        <motion.div 
                            key="chat-window-louis"
                            initial={{ opacity: 0, scale: 0.9, y: 40 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.9, y: 40 }} 
                            className="w-[340px] sm:w-[420px] h-[650px] bg-white rounded-[3.5rem] shadow-[0_40px_120px_rgba(0,0,0,0.2)] border border-white overflow-hidden flex flex-col mb-4 ring-1 ring-slate-100 relative"
                        >
                            <div className="p-8 bg-emerald-600 text-white flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-3xl border-2 border-white/20 overflow-hidden bg-black flex-shrink-0 relative">
                                        <Image src={mood === 'thinking' ? '/characters/louis_thinking.png' : '/characters/louis_happy.png'} alt="Louis" fill className="object-cover scale-150" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-black text-lg tracking-tight">Guide Louis</span>
                                        <span className="text-[10px] opacity-60 font-black uppercase tracking-[0.2em] leading-none">Travel Expert</span>
                                    </div>
                                </div>
                                <button onClick={() => setIsChatOpen(false)} className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl">✕</button>
                            </div>
                            <div className="flex-1 overflow-hidden bg-emerald-50/20">
                                <ChatBox 
                                    ref={chatRef}
                                    agentName="louis" 
                                    topic="travel, navigation, landmarks in France" 
                                    agentColor="bg-emerald-600" 
                                    onMoodChange={handleMoodChange}
                                    context={{
                                        activeCity: t(activeCity.nameKey),
                                        isLocalMode: isLocalMode,
                                        systemInstructions: "Provide navigation-based answers with specific metro lines, stations, and estimated times."
                                    }}
                                />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.button 
                            key="chat-toggle-louis"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            whileHover={{ scale: 1.1, rotate: 12 }} 
                            whileTap={{ scale: 0.9 }} 
                            onClick={() => setIsChatOpen(true)} 
                            className="w-20 h-20 rounded-[2.5rem] bg-emerald-600 shadow-2xl flex items-center justify-center text-white border-4 border-white relative z-[2000] group"
                        >
                            <div className="absolute -inset-2 rounded-[3.5rem] bg-emerald-600/30 animate-pulse" />
                            <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-black border-2 border-emerald-400 group-hover:border-white transition-all">
                                 <Image src="/characters/louis_happy.png" alt="Louis" fill className="object-cover scale-150 rotate-6" />
                            </div>
                        </motion.button>
                    )}
                 </AnimatePresence>
            </div>
        </main>
    );
}

function PackingItem({ text, checked = false }: { text: string, checked?: boolean }) {
    return (
        <div className="flex items-center gap-3">
             <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${checked ? 'bg-emerald-600 border-emerald-600' : 'border-slate-200'}`}>
                {checked && <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-white"><polyline points="20 6 9 17 4 12"></polyline></motion.svg>}
             </div>
             <span className={`text-[10px] font-black uppercase tracking-widest ${checked ? 'text-slate-900' : 'text-slate-400'}`}>{text}</span>
        </div>
    );
}
