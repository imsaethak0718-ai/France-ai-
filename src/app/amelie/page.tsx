"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import ChatBox from "@/components/ChatBox";
import { 
    ArrowLeft, Palette, Film, Music, Sparkles, Send, Play, Info, 
    Undo, Layers, Brush, ExternalLink, Quote, Star, MousePointer2, 
    HelpCircle, CheckCircle2, XCircle, Trophy, Lightbulb, Download, 
    ChevronRight, X, User
} from "lucide-react";
import Image from "next/image";
import CharacterAvatar, { Mood } from "@/components/CharacterAvatar";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import FloatingEmojis from "@/components/FloatingEmojis";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "paintings" | "films" | "music";

const MASTERPIECES = [
    {
        id: "guernica",
        title: "Guernica", artist: "Pablo Picasso", year: "1937",
        snippet: "/images/guernica_snippet.png",
        options: ["Guernica", "The Scream", "Starry Night", "Liberty Leading the People"],
        hint: "This artist loved fragmented, sharp cubist shapes. It's a monochromatic anti-war mural.",
        info: "Created in Paris for the World's Fair, it's one of the most powerful anti-war statements in history."
    },
    {
        id: "liberty",
        title: "Liberty Leading the People", artist: "Eugène Delacroix", year: "1830",
        snippet: "/images/liberty_snippet.png",
        options: ["Liberty Leading the People", "The Gleaners", "Impression Sunrise", "The Night Watch"],
        hint: "The central figure wears a Phrygian cap and leads a revolution with a tricolor flag.",
        info: "Commemorates the July Revolution of 1830, which led to the crowning of Louis-Philippe."
    },
    {
        id: "lilies",
        title: "Water Lilies", artist: "Claude Monet", year: "1919",
        snippet: "/images/lilies_snippet.png",
        options: ["Water Lilies", "The Starry Night", "Sunday Afternoon", "Composition VII"],
        hint: "The master of Impressionism painted these in his lush garden at Giverny.",
        info: "Part of a massive series of approximately 250 oil paintings capturing the light on his pond."
    }
];

const FILMS = [
    { id: "anatomy", title: "Anatomy of a Fall (Anatomie d'une chute)", year: "2023", poster: "/images/anatomy_poster.png", trailer: "https://www.youtube.com/watch?v=FUXawkH-ONM", desc: "A psychological thriller that won the Palme d'Or at Cannes." },
    { id: "taste", title: "The Taste of Things (La Passion de Dodin Bouffant)", year: "2023", poster: "/images/taste_poster.png", trailer: "https://www.youtube.com/watch?v=cKKCGtoIOVY", desc: "A beautiful exploration of love and French gourmet cuisine." },
    { id: "musketeers", title: "The Three Musketeers: D'Artagnan", year: "2023", poster: "/images/musketeers_poster.png", trailer: "https://www.youtube.com/watch?v=dlVpDcXQqag", desc: "A high-octane modern adaptation of Dumas' classic epic." },
    { id: "animal", title: "The Animal Kingdom (Le Règne animal)", year: "2023", poster: "/images/animal_kingdom_poster.png", trailer: "https://www.youtube.com/watch?v=qGvUkiUM7Nc", desc: "A visionary sci-fi tale of humanity's mysterious mutation." }
];

const SONGS = [
    { title: "La Vie En Rose", artist: "Edith Piaf", emoji: "🌹", link: "https://www.youtube.com/watch?v=0feNVUwQA8U", genre: "Chanson" },
    { title: "Alors on danse", artist: "Stromae", emoji: "🕺", link: "https://www.youtube.com/watch?v=VHoT4N43jK8", genre: "Synth-pop" },
    { title: "One More Time", artist: "Daft Punk", emoji: "🎧", link: "https://www.youtube.com/watch?v=FGBhQbmPwH8", genre: "French Touch" },
    { title: "Ne me quitte pas", artist: "Jacques Brel", emoji: "🎤", link: "https://www.youtube.com/watch?v=q_auKbaYstY", genre: "Chanson" }
];

export default function AmelieStudio() {
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab ] = useState<Tab>("paintings");
    const [mood, setMood] = useState<Mood>("happy");
    const [brushColor, setBrushColor] = useState("#FF4D8D");
    const [brushThickness, setBrushThickness] = useState(5);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chatRef = useRef<any>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [history, setHistory] = useState<string[]>([]);
    
    // Guess Game State
    const [currentPIdx, setCurrentPIdx] = useState(0);
    const [gameStatus, setGameStatus] = useState<"guessing" | "revealed">("guessing");
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isShaking, setIsShaking] = useState(false);
    const [wrongAttempts, setWrongAttempts] = useState(0);
    const [isHoveringImage, setIsHoveringImage] = useState(false);

    // Modal State
    const [modal, setModal] = useState<{ open: boolean; title: string; content: string; image?: string; link?: string }>({ open: false, title: "", content: "" });

    const currentPainting = MASTERPIECES[currentPIdx];

    useEffect(() => {
        saveState();
    }, []);

    useEffect(() => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                ctx.strokeStyle = brushColor;
                ctx.lineWidth = brushThickness;
                ctx.lineCap = 'round';
            }
        }
    }, [brushColor, brushThickness, activeTab]);

    const saveState = () => {
        if (canvasRef.current) setHistory(prev => [...prev.slice(-19), canvasRef.current!.toDataURL()]);
    };

    const undo = () => {
        if (history.length <= 1 || !canvasRef.current) return;
        const newH = [...history]; newH.pop();
        const last = newH[newH.length - 1];
        const img = new (window as any).Image();
        img.src = last;
        img.onload = () => {
            const ctx = canvasRef.current?.getContext('2d');
            ctx?.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
            ctx?.drawImage(img, 0, 0);
            setHistory(newH);
        };
    };

    const startDrawing = (e: any) => {
        const canvas = canvasRef.current; if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
        const ctx = canvas.getContext('2d'); ctx?.beginPath(); ctx?.moveTo(x, y);
        setIsDrawing(true); setMood("thinking");
    };

    const draw = (e: any) => {
        if (!isDrawing || !canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
        const ctx = canvasRef.current.getContext('2d'); ctx?.lineTo(x, y); ctx?.stroke();
    };

    const handleChoice = (opt: string) => {
        setSelectedOption(opt);
        if (opt === currentPainting.title) {
            setGameStatus("revealed"); setMood("excited");
            chatRef.current?.addLocalMessage({ text: `Formidable! 🎨 '${currentPainting.title}' by ${currentPainting.artist}. ${currentPainting.info}`, expression: "excited" });
        } else {
            setMood("mistake"); setIsShaking(true); setTimeout(() => setIsShaking(false), 500);
            setWrongAttempts(p => p + 1);
        }
    };

    const nextPainting = () => {
        setCurrentPIdx(p => (p + 1) % MASTERPIECES.length);
        setGameStatus("guessing"); setSelectedOption(null); setWrongAttempts(0);
    };

    const handleMoodChange = useCallback((m: Mood) => setMood(m), []);

    return (
        <div className="min-h-screen bg-[#FDF8F5] relative overflow-hidden selection:bg-rose-200 font-sans">
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            <FloatingEmojis />
            <nav className="fixed top-6 right-6 z-[110] flex gap-4"><LanguageToggle /></nav>

            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-10 relative z-10">
                <header className="flex flex-col lg:flex-row items-center justify-between gap-10 mb-12 border-b border-rose-100/50 pb-12">
                    <div className="flex items-center gap-8">
                        <div className="relative shrink-0 flex items-center justify-center">
                            <motion.div className="relative z-10 scale-[0.8] lg:scale-[1.1] transition-transform">
                                <CharacterAvatar agentName="amelie" mood={mood} color="bg-rose-500" displayName="Amélie" isHero={true} />
                                <div className="absolute -bottom-4 -right-2 bg-white p-2.5 rounded-2xl shadow-xl border border-rose-100 rotate-12 z-30"><Palette className="w-6 h-6 text-rose-500" /></div>
                            </motion.div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Link href="/" className="p-2 bg-white rounded-lg shadow-sm hover:scale-105 border border-rose-50"><ArrowLeft className="w-4 h-4 text-rose-400" /></Link>
                                <span className="px-3 py-1 rounded-full bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest shadow-lg">L'Atelier Créatif</span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-none">{t("amelie_title")}</h1>
                            <p className="text-base text-slate-400 font-medium max-w-md italic leading-tight">"{t("amelie_desc")}"</p>
                        </div>
                    </div>
                    <div className="bg-white/40 backdrop-blur-xl p-1.5 rounded-3xl border border-white/50 flex shrink-0">
                        {(["paintings", "films", "music"] as Tab[]).map((tab) => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`relative px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest z-10 ${activeTab === tab ? "text-white" : "text-rose-400"}`}>
                                {activeTab === tab && <motion.div layoutId="activeTab" className="absolute inset-0 bg-rose-500 rounded-2xl shadow-lg -z-10" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
                                <span className="flex items-center gap-2">{tab === 'paintings' ? <Palette className="w-3" /> : tab === 'films' ? <Film className="w-3" /> : <Music className="w-3" />} {t(`amelie_tab_${tab}`)}</span>
                            </button>
                        ))}
                    </div>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-10">
                        <AnimatePresence mode="wait">
                            <motion.div key={activeTab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
                                {activeTab === "paintings" && (
                                    <div className="space-y-10">
                                        <section className="glass rounded-[3.5rem] p-10 lg:p-14 bg-white/90 backdrop-blur-3xl border border-white shadow-2xl relative overflow-hidden">
                                            <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-14">
                                                <div className="flex-1 space-y-4">
                                                    <div className="w-16 h-1 bg-rose-500 rounded-full" />
                                                    <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-none">{t("amelie_painters_title")}</h2>
                                                    <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-xl">{t("amelie_painters_desc")}</p>
                                                </div>
                                                <div className="shrink-0 scale-110 lg:scale-[1.3] mr-10 transition-transform hover:scale-125 duration-500">
                                                    <CharacterAvatar agentName="amelie" mood="happy" color="bg-rose-500" displayName="Amélie" isHero={false} />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                                                {[
                                                    { 
                                                        name: t("amelie_artist_monet"), 
                                                        style: "Impressionism", 
                                                        image: "/images/lilies_snippet.png", 
                                                        desc: t("amelie_monet_desc"),
                                                        fact: t("amelie_monet_fact")
                                                    },
                                                    { 
                                                        name: "Eugène Delacroix", 
                                                        style: t("amelie_seek_help") === "Chercher de l'Aide" ? "Inspiration" : "Inspiration", 
                                                        image: "/images/liberty_snippet.png", 
                                                        desc: t("amelie_delacroix_desc"),
                                                        fact: t("amelie_delacroix_fact")
                                                    },
                                                    { 
                                                        name: t("amelie_artist_picasso"), 
                                                        style: "Cubism", 
                                                        image: "/images/guernica_snippet.png", 
                                                        desc: t("amelie_picasso_desc"),
                                                        fact: t("amelie_picasso_fact")
                                                    }
                                                ].map((painter, idx) => (
                                                    <motion.div 
                                                        key={painter.name}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        whileInView={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.15 }}
                                                        className="group bg-slate-50 border border-slate-100 p-6 rounded-[2.5rem] hover:bg-white hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer"
                                                        onClick={() => setModal({ open: true, title: painter.name, content: `${painter.desc} ${painter.fact}`, image: painter.image })}
                                                    >
                                                        <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden mb-6 shadow-lg">
                                                            <Image src={painter.image} alt={painter.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                        <div className="space-y-2 text-center">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">{painter.style}</span>
                                                            <h4 className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-rose-500 transition-colors">{painter.name}</h4>
                                                            <p className="text-xs text-slate-400 font-medium leading-relaxed">{painter.desc}</p>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>

                                            {/* Decorative Background Element */}
                                            <div className="absolute -bottom-20 -right-20 opacity-[0.03] pointer-events-none">
                                                <Palette className="w-[500px] h-[500px]" />
                                            </div>
                                        </section>

                                        <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <motion.div animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}} className={`glass rounded-[3rem] p-10 bg-white border-4 ${gameStatus === 'revealed' ? 'border-emerald-100 scale-[1.02]' : 'border-white'} shadow-xl transition-all duration-500`}>
                                                <div className="text-center mb-8">
                                                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{t("amelie_guess_painting")}</h3>
                                                    <p className="text-slate-400 text-sm">{t("amelie_guess_hint_hover")}</p>
                                                </div>
                                                <div 
                                                    onMouseEnter={() => setIsHoveringImage(true)} 
                                                    onMouseLeave={() => setIsHoveringImage(false)}
                                                    className="relative aspect-square rounded-[2rem] overflow-hidden border-8 border-stone-100 mb-8 bg-stone-100 group shadow-inner cursor-pointer"
                                                >
                                                    <Image src={currentPainting.snippet} alt="Snippet" fill className={`object-cover transition-all duration-700 ${gameStatus === 'guessing' && !isHoveringImage ? 'blur-3xl grayscale' : ''}`} />
                                                    {gameStatus === 'guessing' && !isHoveringImage && <div className="absolute inset-0 flex items-center justify-center"><div className="p-5 bg-white/20 backdrop-blur-md rounded-full border border-white/30 animate-pulse"><HelpCircle className="w-8 h-8 text-white" /></div></div>}
                                                    {gameStatus === 'revealed' && <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute bottom-4 left-4 right-4 p-5 bg-emerald-500 text-white rounded-2xl shadow-xl flex items-center justify-between"><div><p className="text-[10px] uppercase font-black opacity-80 mb-1">Found it!</p><p className="text-lg font-black">{currentPainting.title}</p></div><Trophy className="w-8 h-8 text-emerald-100" /></motion.div>}
                                                </div>
                                                <div className="grid grid-cols-2 gap-3 mb-6"> {currentPainting.options.map(o => <button key={o} onClick={() => handleChoice(o)} className={`py-4 px-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border-2 transition-all ${selectedOption === o ? (o === currentPainting.title ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' : 'bg-rose-100 border-rose-300 text-rose-600') : 'bg-white border-slate-50 text-slate-500 hover:border-rose-400 hover:text-rose-500 hover:shadow-md'}`} disabled={gameStatus === 'revealed'}>{o}</button>)} </div>
                                                <div className="flex gap-3">
                                                    <button onClick={() => chatRef.current?.sendMessage(`Give me a hint for this painting: '${currentPainting.hint}'`)} className="flex-1 py-4 bg-amber-50 text-amber-600 rounded-2xl font-black uppercase text-[10px] tracking-widest border-2 border-amber-100 hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"><Lightbulb className="w-4 h-4" /> {t("amelie_seek_help")}</button>
                                                    {gameStatus === 'revealed' && <button onClick={nextPainting} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2">{t("amelie_next")} <ChevronRight className="w-4 h-4" /></button>}
                                                </div>
                                            </motion.div>
                                            
                                            <div className="flex flex-col gap-6">
                                                <div className="bg-rose-500 rounded-[3rem] p-10 text-white flex flex-col justify-between shadow-2xl h-full relative overflow-hidden group">
                                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -top-10 -right-10 opacity-10"><Sparkles className="w-64 h-64" /></motion.div>
                                                    <div className="space-y-6 relative z-10"><div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20"> <Quote className="w-6 h-6" /> </div><h3 className="text-3xl font-black tracking-tighter leading-none">{t("amelie_explore_bios")}</h3><p className="text-lg italic font-medium opacity-90 leading-tight">Explore the souls behind French culture.</p></div>
                                                    <button onClick={() => setModal({ open: true, title: "French Art Legends", content: "From Monet's light-filled gardens to Picasso's revolutionary cubism, French art is a tapestry of innovation. Discover the stories behind the canvas." })} className="relative z-10 bg-white text-rose-600 font-black px-8 py-4 rounded-2xl shadow-xl flex items-center gap-3 text-xs uppercase tracking-widest hover:translate-x-2 transition-transform">{t("amelie_discover_story")} <ExternalLink className="w-4 h-4" /></button>
                                                </div>
                                                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl flex items-center gap-6 group cursor-pointer hover:shadow-2xl hover:border-rose-100 transition-all" onClick={() => setModal({ open: true, title: t("amelie_expert_tip"), content: "Always mix your secondary colors on the edge of the canvas. French Impressionists used unmixed primary colors close to each other to create a vibrating effect of light!" })}>
                                                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm"><Lightbulb className="w-8 h-8" /></div>
                                                    <div><h4 className="font-black text-lg text-slate-900">{t("amelie_expert_tip")}</h4><p className="text-xs text-slate-400 font-medium">Click for secret artistic advice.</p></div>
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                )}
                                {activeTab === "films" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {FILMS.map(f => (
                                            <div key={f.id} className="group relative h-[550px] rounded-[3.5rem] overflow-hidden shadow-2xl bg-black border border-slate-900">
                                                <Image src={f.poster} alt={f.title} fill className="object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000" />
                                                <div className="absolute inset-x-0 bottom-0 p-10 flex flex-col justify-end bg-gradient-to-t from-black via-black/40 to-transparent">
                                                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] mb-3">{f.year} FILM</span>
                                                    <h3 className="text-4xl font-black text-white mb-4 tracking-tighter leading-tight line-clamp-2">{f.title}</h3>
                                                    <div className="flex gap-4">
                                                        <Link href={f.trailer} target="_blank" className="flex-1 bg-white text-black font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-transform active:scale-95 group-hover:bg-rose-500 group-hover:text-white">Explore Scene <ExternalLink className="w-4 h-4" /></Link>
                                                        <Link href={f.trailer} target="_blank" className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:bg-white hover:text-black transition-all border border-white/20"><Play className="w-6 h-6 fill-current" /></Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {activeTab === "music" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {SONGS.map(m => (
                                            <div key={m.title} className="p-10 bg-white rounded-[3rem] border border-slate-100 shadow-xl flex flex-col justify-between h-[340px] hover:border-azure-400 hover:shadow-2xl transition-all group relative overflow-hidden">
                                                <div className="absolute bottom-0 right-0 p-8 scale-[3] opacity-[0.03] group-hover:opacity-10 transition-all">{m.emoji}</div>
                                                <div className="flex justify-between items-start relative z-10"><div className="w-16 h-16 bg-azure-500 text-white rounded-[1.2rem] flex items-center justify-center text-3xl shadow-lg shadow-azure-200 group-hover:rotate-6 transition-transform">{m.emoji}</div><Link href={m.link} target="_blank" className="p-5 bg-slate-50 rounded-full hover:bg-azure-500 hover:text-white transition-all shadow-sm"><Play className="w-6 h-6 fill-current" /></Link></div>
                                                <div className="relative z-10">
                                                    <h4 className="text-3xl font-black tracking-tighter text-slate-900 leading-none mb-2">{m.title}</h4>
                                                    <p className="text-xs font-black text-azure-500 uppercase tracking-widest">{m.artist} • {m.genre}</p>
                                                </div>
                                                <button onClick={() => chatRef.current?.sendMessage(`Tell me why '${m.title}' is iconic in French ${m.genre}.`)} className="relative z-10 text-[10px] font-black uppercase text-slate-400 tracking-widest hover:text-rose-500 text-left transition-colors flex items-center gap-2">{t("amelie_discover_story")} <ChevronRight className="w-3 h-3" /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="lg:col-span-4 space-y-8">
                        <section className="sticky top-24 space-y-8">
                            <div className="h-[740px] rounded-[3.5rem] overflow-hidden border border-rose-100 shadow-2xl bg-white flex flex-col">
                                <header className="p-8 border-b flex justify-between items-center bg-rose-50/10">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 relative shrink-0 flex items-center justify-center -ml-4">
                                            <div className="scale-[0.35]">
                                                <CharacterAvatar agentName="amelie" mood={mood} color="bg-rose-500" displayName="Amélie" isHero={false} />
                                            </div>
                                        </div>
                                        <div className="-ml-4">
                                            <h3 className="font-black text-slate-900 tracking-tighter text-lg">Atelier Companion</h3>
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Amélie is Live</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Star className="w-5 h-5 text-amber-400 opacity-20 hover:opacity-100 transition-opacity cursor-pointer" />
                                </header>
                                <div className="flex-grow overflow-hidden relative">
                                    <ChatBox ref={chatRef} agentName="amelie" topic="art and creativity" agentColor="bg-rose-500" onMoodChange={handleMoodChange} context={{ activeTab, gameStatus, currentP: currentPainting.title }} customSystemPrompt={`You are Amélie, the French Artist. Respond poetically. Current focus: ${activeTab}. Painting being guessed: ${currentPainting.title}. Be encouraging and provide vivid, short artistic insights about French culture.`} />
                                </div>
                            </div>
                        </section>
                    </div>
                </main>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {modal.open && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="bg-white rounded-[3.5rem] max-w-lg w-full overflow-hidden shadow-2xl ring-1 ring-white/20">
                            {modal.image && <div className="relative aspect-video"><Image src={modal.image} alt={modal.title} fill className="object-cover" /></div>}
                            <div className="p-12 space-y-8">
                                <div className="flex justify-between items-start"><h3 className="text-4xl font-black tracking-tighter text-slate-900">{modal.title}</h3><button onClick={() => setModal({ ...modal, open: false })} className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors"><X className="w-6 h-6 text-slate-500" /></button></div>
                                <p className="text-slate-600 font-medium leading-relaxed text-lg">{modal.content}</p>
                                <div className="flex gap-4">
                                    <button onClick={() => setModal({ ...modal, open: false })} className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl active:scale-95 transition-all">Close</button>
                                    {modal.link && <Link href={modal.link} target="_blank" className="flex-1 py-5 bg-rose-500 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-rose-200 text-center">Visit Site</Link>}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
