"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { 
    ArrowLeft, Volume2, BookText, Trophy, Star, Sparkles, 
    MessageCircle, Zap, Flame, Timer, Puzzle, CheckCircle2,
    RotateCcw, ChevronRight, Play, Info, ListFilter, Layout,
    PenTool, GraduationCap
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import ChatBox, { ChatBoxHandle } from "@/components/ChatBox";
import CharacterAvatar, { Mood } from "@/components/CharacterAvatar";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import FloatingEmojis from "@/components/FloatingEmojis";

// --- Word Database ---
const WORD_POOL = {
    beginner: [
        { fr: "BONJOUR", en: "Hello", phonetic: "bon-zhoor", example: "Bonjour Madame!", tip: "The most important word in France. Local pride!" },
        { fr: "MERCI", en: "Thank you", phonetic: "mehr-see", example: "Merci beaucoup!", tip: "Always say it after being served." },
        { fr: "SALUT", en: "Hi / Bye", phonetic: "sa-loo", example: "Salut mon ami!", tip: "Informal. Use it with friends." },
        { fr: "PARDON", en: "Excuse me", phonetic: "par-don", example: "Pardon, monsieur.", tip: "Crucial for navigating busy streets." },
    ],
    intermediate: [
        { fr: "ENCHANTE", en: "Nice to meet you", phonetic: "on-shon-tay", example: "Enchanté de vous voir.", tip: "Say this when introduced to someone." },
        { fr: "AUREVOIR", en: "Goodbye", phonetic: "oh ruh-vwar", example: "Au revoir, à demain!", tip: "Standard formal ending to a convo." },
        { fr: "SILVOUSPLAIT", en: "Please", phonetic: "see voo play", example: "S'il vous plaît, aidez-moi.", tip: "Never forget the 'S'il vous plaît'." },
    ],
    advanced: [
        { fr: "COMMENTCAVA", en: "How are you?", phonetic: "ko-mon sa va", example: "Salut! Comment ça va?", tip: "Casual check-in. Usually answered with 'Ça va'." },
        { fr: "JEMAPPELLE", en: "My name is", phonetic: "zhuh ma-pel", example: "Je m'appelle Claire.", tip: "The best way to start your introduction." },
        { fr: "BONSOIR", en: "Good evening", phonetic: "bon-swar", example: "Bonsoir tout le monde!", tip: "Use this after 6:00 PM." },
    ]
};

// --- Grammar Content ---
const GRAMMAR_DATA = {
    verbs: [
        { verb: "ÊTRE", je: "suis", tu: "es", il: "est", nous: "sommes", vous: "êtes", ils: "sont" },
        { verb: "AVOIR", je: "ai", tu: "as", il: "a", nous: "avons", vous: "avez", ils: "ont" },
        { verb: "ALLER", je: "vais", tu: "vas", il: "va", nous: "allons", vous: "allez", ils: "vont" },
    ],
    possessive: [
        { en: "my", m: "mon", f: "ma", p: "mes" },
        { en: "your", m: "ton", f: "ta", p: "tes" },
        { en: "his/her", m: "son", f: "sa", p: "ses" },
    ],
    demonstrative: [
        { type: "this (m)", word: "ce", example: "ce livre" },
        { type: "this (f)", word: "cette", example: "cette table" },
        { type: "these", word: "ces", example: "ces livres" },
    ],
    articles: [
        { type: "Definite", m: "le", f: "la", p: "les" },
        { type: "Indefinite", m: "un", f: "une", p: "des" },
    ]
};

// --- Animations ---
const spring = { type: "spring", damping: 20, stiffness: 300 };
const shake = {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.4 }
};

const SectionWrapper = ({ children, id, className = "", z = "z-10" }: { children: React.ReactNode, id: string, className?: string, z?: string }) => (
    <motion.section
        id={id}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className={`w-full relative ${z} ${className}`}
    >
        {children}
    </motion.section>
);

export default function ClaireStudio() {
    const { t, language, setLanguage } = useLanguage();
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: containerRef });
    
    // --- Game State ---
    const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("beginner");
    const [correctCount, setCorrectCount] = useState(0);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [streak, setStreak] = useState(0);
    const [combo, setCombo] = useState(1);
    const [timeLeft, setTimeLeft] = useState(15);
    const [isTimerActive, setIsTimerActive] = useState(false);
    
    // --- UI State ---
    const [guess, setGuess] = useState("");
    const [feedback, setFeedback] = useState<null | { isCorrect: boolean, msg: string }>(null);
    const [mood, setMood] = useState<Mood>("happy");
    const [score, setScore] = useState(0);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [speakingWord, setSpeakingWord] = useState<string | null>(null);
    const chatRef = useRef<ChatBoxHandle>(null);

    // --- Dynamic Word Logic ---
    const currentWord = useMemo(() => {
        return WORD_POOL[difficulty][currentWordIndex % WORD_POOL[difficulty].length];
    }, [difficulty, currentWordIndex]);

    const [shuffledTiles, setShuffledTiles] = useState<string[]>([]);
    useEffect(() => {
        setShuffledTiles([...currentWord.fr.split("")].sort(() => Math.random() - 0.5));
    }, [currentWord]);

    // Timer Logic
    useEffect(() => {
        let timer: any;
        if (isTimerActive && timeLeft > 0 && !feedback) {
            timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0 && !feedback) {
            handleCheck(true);
        }
        return () => clearInterval(timer);
    }, [isTimerActive, timeLeft, feedback]);

    const handleMoodChange = useCallback((m: Mood) => setMood(m), []);

    const speak = (text: string) => {
        if (!window.speechSynthesis) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "fr-FR";
        utterance.rate = 0.85; 
        utterance.onstart = () => setSpeakingWord(text);
        utterance.onend = () => setSpeakingWord(null);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    };

    const triggerClaireTeaching = (word: string) => {
        if (chatRef.current) {
            setIsChatOpen(true);
            chatRef.current.addLocalMessage({
                id: Date.now().toString(),
                sender: "agent",
                text: `Let's practice the word "${word}"! Repeat after me. 🥖`,
                expression: "happy",
            });
        }
    };

    const handleSpeak = (word: string) => {
        speak(word);
        triggerClaireTeaching(word);
        setMood("happy");
    };

    const handleCheck = (isTimeout = false) => {
        const isCorrect = guess.toUpperCase() === currentWord.fr;
        
        if (isCorrect && !isTimeout) {
            const timeBonus = isTimerActive ? timeLeft * 10 : 0;
            const points = (100 * combo) + timeBonus;
            
            setScore(prev => prev + points);
            setCorrectCount(prev => prev + 1);
            setStreak(prev => prev + 1);
            if (streak > 0 && streak % 3 === 0) setCombo(prev => prev + 1);
            
            setFeedback({ isCorrect: true, msg: "Parfait ! 🎉 Great job!" });
            setMood("happy");
            speak(currentWord.fr);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2500);

            if (correctCount + 1 >= 8) setDifficulty("advanced");
            else if (correctCount + 1 >= 4) setDifficulty("intermediate");
        } else {
            setFeedback({ isCorrect: false, msg: "Not quite! Try again 😊" });
            setMood("thinking");
            setStreak(0);
            setCombo(1);
        }
    };

    const nextWord = () => {
        setCurrentWordIndex(prev => prev + 1);
        setGuess("");
        setFeedback(null);
        setTimeLeft(15);
        setMood("listening");
    };

    const toggleTimer = () => {
        setIsTimerActive(!isTimerActive);
        setTimeLeft(15);
    };

    const heroContentY = useTransform(scrollYProgress, [0, 0.2], ["0%", "20%"]);

    return (
        <main ref={containerRef} className="bg-[#fdfeff] text-slate-900 min-h-screen selection:bg-blue-100 overflow-x-hidden relative">
            <FloatingEmojis />
            
            {/* [ NAVIGATION ] */}
            <nav className="fixed top-0 inset-x-0 h-20 z-[100] flex items-center justify-between px-8 bg-white/80 backdrop-blur-2xl border-b border-slate-100">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl group-hover:rotate-12 transition-all">
                            <ArrowLeft className="w-5 h-5" />
                        </div>
                        <span className="font-black text-xl text-slate-900 tracking-tight">France<span className="text-blue-600">AI</span></span>
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
                        <Trophy className="w-4 h-4 text-orange-400" />
                        <span className="text-sm font-black text-slate-700">{score.toLocaleString()} <span className="text-[10px] opacity-40">EXP</span></span>
                    </div>
                    {streak > 0 && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1 bg-orange-500 text-white px-4 py-2.5 rounded-2xl shadow-lg border-b-4 border-orange-700">
                            <Flame className="w-4 h-4 fill-white" />
                            <span className="text-xs font-black">{streak}</span>
                        </motion.div>
                    )}
                    <LanguageToggle />
                </div>
            </nav>

            <div className="relative pt-24 z-0">
                {/* [ HERO BANNERS ] */}
                <div className="max-w-7xl mx-auto px-6 mb-8 pt-8">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] p-6 lg:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                        <div className="relative z-10 flex items-center gap-6">
                            <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-lg flex items-center justify-center text-white border border-white/30 shadow-inner">
                                <Star className="w-8 h-8 fill-white" />
                            </div>
                            <div>
                                <h4 className="text-white text-xs font-black uppercase tracking-[0.3em] opacity-80 mb-1">Daily Challenge</h4>
                                <h3 className="text-white text-3xl font-black tracking-tight">Master "Enchanté" today!</h3>
                            </div>
                        </div>
                        <Link href="#learning-grid" className="relative z-10 bg-white text-blue-600 px-8 py-4 rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
                            Accept +500 XP
                        </Link>
                    </div>
                </div>

                {/* [ HERO SPLIT ] */}
                <section className="relative min-h-[60vh] w-full flex items-center justify-center px-6 lg:px-20 py-12 z-0">
                    <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 text-center lg:text-left">
                        <motion.div style={{ y: heroContentY }} className="space-y-8 relative z-10">
                            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                                <div className="flex items-center gap-1">
                                    <div className={`w-2 h-2 rounded-full ${difficulty === 'beginner' ? 'bg-green-500' : difficulty === 'intermediate' ? 'bg-orange-500' : 'bg-red-500'} animate-pulse`} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{difficulty} LEVEL</span>
                                </div>
                            </div>
                            <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.85]">
                                {t("claire_atelier_title")} <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 italic">{t("claire_atelier_subtitle")}</span>
                            </h1>
                            <p className="text-xl text-slate-500 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
                                Join our 100% interactive classroom. Build words, play games, and master French phonetics.
                            </p>
                        </motion.div>

                        <div className="relative flex justify-center lg:justify-end z-0">
                             <AnimatePresence mode="wait">
                                {!isChatOpen && (
                                    <motion.div 
                                        key="claire-avatar-learning"
                                        initial={{ opacity: 0, scale: 0.8 }} 
                                        animate={{ opacity: 1, scale: 1 }} 
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="relative"
                                    >
                                        <CharacterAvatar agentName="claire" mood={mood} isHero={true} color="bg-blue-500" />
                                    </motion.div>
                                )}
                             </AnimatePresence>
                        </div>
                    </div>
                </section>

                {/* [ SECTION 1: WORD BUILDER ] */}
                <SectionWrapper id="learning-grid" className="max-w-7xl mx-auto pb-24 px-6 z-10">
                    <div className="bg-white rounded-[4rem] p-8 md:p-16 shadow-[0_25px_100px_rgba(30,50,150,0.06)] border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute top-8 right-8 z-20">
                            <button onClick={toggleTimer} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isTimerActive ? 'bg-orange-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
                                <Timer className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex flex-col items-center text-center w-full max-w-4xl">
                            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm mb-6">
                                <BookText className="w-8 h-8" />
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight uppercase">{t("claire_word_builder_title")}</h2>
                            <p className="text-slate-400 font-bold text-sm uppercase mb-12 tracking-widest">Construct: "{currentWord.en}"</p>
                            
                            {isTimerActive && (
                                <div className="w-full max-w-md h-2 bg-slate-100 rounded-full mb-12 overflow-hidden">
                                    <motion.div animate={{ width: `${(timeLeft / 15) * 100}%` }} className={`h-full ${timeLeft < 5 ? 'bg-red-500' : 'bg-orange-400'} transition-all`} />
                                </div>
                            )}

                            <div className="flex flex-wrap justify-center gap-4 mb-12">
                                {shuffledTiles.map((char, i) => (
                                    <motion.button key={`${currentWord.fr}-${i}`} layout whileHover={{ y: -8, scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9 }} onClick={() => { setGuess(prev => prev + char); setMood("listening"); }} className="w-16 h-20 bg-white rounded-3xl shadow-xl border-b-8 border-slate-100 flex items-center justify-center text-4xl font-black text-blue-600 hover:border-blue-200 transition-all font-mono">
                                        {char}
                                    </motion.button>
                                ))}
                            </div>

                            <motion.div animate={feedback && !feedback.isCorrect ? shake : {}} className={`w-full max-w-2xl p-8 rounded-[3rem] border-4 border-dashed transition-all mb-12 relative ${feedback?.isCorrect ? 'border-green-300 bg-green-50/50' : feedback ? 'border-red-200 bg-red-50/50' : 'border-slate-100 bg-slate-50/20'}`}>
                                <div className="text-5xl font-black tracking-[0.4em] text-blue-900 font-mono uppercase min-h-[5rem] flex items-center justify-center">
                                    {guess || <span className="text-slate-200 text-lg opacity-80 tracking-widest italic font-sans animate-pulse">Select letters...</span>}
                                </div>
                                {guess && <button onClick={() => setGuess("")} className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xl hover:rotate-90 transition-transform">✕</button>}
                            </motion.div>

                            <div className="flex gap-4 w-full max-w-xl">
                                {!feedback?.isCorrect && (
                                    <button onClick={() => handleCheck()} className="flex-1 bg-blue-600 text-white font-black py-5 rounded-[2.5rem] text-xl shadow-2xl hover:bg-black transition-all active:scale-95 uppercase tracking-widest flex items-center justify-center gap-2">
                                        {t("claire_verify_results")} <ChevronRight className="w-5 h-5" />
                                    </button>
                                )}
                                {feedback?.isCorrect && (
                                    <button onClick={nextWord} className="flex-1 bg-indigo-600 text-white font-black py-5 rounded-[2.5rem] text-xl shadow-2xl hover:bg-black transition-all active:scale-95 uppercase tracking-widest flex items-center justify-center gap-3">
                                        {t("claire_next")} <Play className="w-5 h-5 fill-white" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Smart Feedback Panel (Same as before) */}
                        <AnimatePresence>
                            {feedback?.isCorrect && (
                                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl mt-16 pt-16 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <FeedbackCard icon={<Volume2 />} title="Pronunciation" content={`"${currentWord.phonetic}"`} color="bg-blue-50" textColor="text-blue-900" action={() => speak(currentWord.fr)} actionLabel="Listen Again 🔊" />
                                    <FeedbackCard icon={<MessageCircle />} title="Usage Example" content={`"${currentWord.example}"`} color="bg-slate-50" textColor="text-slate-700" />
                                    <FeedbackCard icon={<Info />} title="Claire's Tip" content={currentWord.tip} color="bg-indigo-50" textColor="text-indigo-900" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </SectionWrapper>

                {/* [ SECTION 2: VOCABULARY CARDS ] */}
                <SectionWrapper id="vocab-section" className="max-w-7xl mx-auto py-16 px-6">
                    <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-6">
                            <ListFilter className="w-6 h-6" />
                        </div>
                        <h3 className="text-4xl font-black text-slate-800 tracking-tight uppercase mb-4">{t("claire_vocab_daily")}</h3>
                        <p className="text-slate-500 font-medium">{t("claire_vocab_subtitle")}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {WORD_POOL.beginner.map((w, idx) => (
                            <VocabCard key={idx} word={{ fr: w.fr, en: w.en, phonetic: w.phonetic }} isSpeaking={speakingWord === w.fr} onSpeak={handleSpeak} onShow={() => setMood("happy")} />
                        ))}
                    </div>
                </SectionWrapper>

                {/* [ SECTION 3: CROSSWORD GAME ] */}
                <SectionWrapper id="crossword-section" className="max-w-7xl mx-auto py-16 px-6 border-t border-slate-100">
                    <div className="bg-white rounded-[4rem] p-10 md:p-16 shadow-[0_30px_120px_rgba(0,0,0,0.03)] border border-slate-100">
                         <div className="flex flex-col items-center text-center mb-16">
                            <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm mb-6">
                                <Puzzle className="w-8 h-8" />
                            </div>
                            <h3 className="text-4xl font-black text-slate-800 tracking-tight uppercase">{t("claire_crossword_title")}</h3>
                        </div>
                        <CrosswordSection onComplete={() => { setMood("happy"); setScore(prev => prev + 1000); }} />
                    </div>
                </SectionWrapper>

                {/* [ SECTION 4: GRAMMAR TABLES ] */}
                <SectionWrapper id="grammar-section" className="max-w-7xl mx-auto py-16 px-6 border-t border-slate-100">
                    <div className="flex flex-col items-center text-center mb-16">
                        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm mb-6">
                            <GraduationCap className="w-8 h-8" />
                        </div>
                        <h3 className="text-4xl font-black text-slate-800 tracking-tight uppercase">{t("claire_grammar_title")}</h3>
                    </div>
                    <GrammarSection />
                </SectionWrapper>

                {/* [ CHAT & SUCCESS POPUPS ] */}
                <FloatingChat isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} mood={mood} handleMoodChange={handleMoodChange} chatRef={chatRef} />
                <SuccessOverlay show={showSuccess} count={correctCount} />
            </div>
        </main>
    );
}

// --- Sub-Components ---

function FeedbackCard({ icon, title, content, color, textColor, action, actionLabel }: { icon: any, title: string, content: string, color: string, textColor: string, action?: any, actionLabel?: string }) {
    return (
        <div className={`p-8 rounded-[2.5rem] ${color} text-left border border-black/5 flex flex-col justify-between shadow-sm`}>
            <div>
                <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 text-slate-600">
                    {icon}
                </div>
                <h4 className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-2">{title}</h4>
                <p className={`text-lg font-bold ${textColor} leading-relaxed`}>{content}</p>
            </div>
            {action && <button onClick={action} className="mt-6 text-xs font-black text-blue-600 underline text-left">{actionLabel}</button>}
        </div>
    );
}

function CrosswordSection({ onComplete }: { onComplete: () => void }) {
    const { t } = useLanguage();
    const grid = [
        ["B", "O", "N", "J", "O", "U", "R"],
        [" ", " ", " ", " ", " ", " ", " "],
        [" ", "M", "E", "R", "C", "I", " "],
        [" ", " ", " ", " ", " ", " ", " "],
        ["S", "A", "L", "U", "T", " ", " "],
        [" ", " ", " ", " ", " ", " ", " "],
        ["P", "A", "R", "D", "O", "N", " "],
    ];

    const [userGrid, setUserGrid] = useState<string[][]>(grid.map(row => row.map(cell => cell === " " ? " " : "")));
    const [hintUsed, setHintUsed] = useState(0);

    const handleInput = (r: number, c: number, val: string) => {
        const newGrid = [...userGrid];
        newGrid[r][c] = val.toUpperCase().charAt(0);
        setUserGrid(newGrid);

        if (newGrid.every((row, ri) => row.every((cell, ci) => cell === " " || cell === grid[ri][ci]))) {
            onComplete();
        }
    };

    const revealLetter = () => {
        const emptyCells: [number, number][] = [];
        grid.forEach((row, r) => row.forEach((cell, c) => {
            if (cell !== " " && userGrid[r][c] === "") emptyCells.push([r, c]);
        }));
        if (emptyCells.length > 0) {
            const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            handleInput(r, c, grid[r][c]);
            setHintUsed(prev => prev + 1);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-12 flex justify-center pb-8 border-b border-slate-50 mb-8">
                 <div className="flex gap-4">
                    <button onClick={() => setUserGrid(grid.map(row => row.map(cell => cell === " " ? " " : "")))} className="px-6 py-3 rounded-2xl bg-slate-50 text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center gap-2">
                        <RotateCcw className="w-4 h-4" /> Reset
                    </button>
                    <button onClick={revealLetter} className="px-6 py-3 rounded-2xl bg-indigo-50 text-indigo-600 font-bold text-xs uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center gap-2">
                        <Star className="w-4 h-4" /> {t("claire_reveal_letter")}
                    </button>
                 </div>
            </div>

            <div className="lg:col-span-7 flex justify-center">
                <div className="grid gap-2 border-8 border-slate-50 p-6 rounded-[3rem] bg-white shadow-inner">
                    {grid.map((row, r) => (
                        <div key={r} className="flex gap-2">
                            {row.map((cell, c) => (
                                cell === " " ? <div key={c} className="w-12 h-12" /> : (
                                    <motion.input 
                                        key={c}
                                        value={userGrid[r][c]}
                                        onChange={(e) => handleInput(r, c, e.target.value)}
                                        maxLength={1}
                                        whileFocus={{ scale: 1.1, zIndex: 10 }}
                                        className={`w-12 h-12 rounded-xl text-center text-lg font-black shadow-sm transition-all border-2 ${userGrid[r][c] === grid[r][c] ? 'border-green-400 bg-green-50 text-green-600' : 'border-slate-100 bg-white text-slate-700 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50'}`}
                                    />
                                )
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 relative">
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-white rounded-2xl shadow-md flex items-center justify-center">
                        <Info className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h4 className="font-black text-slate-800 mb-6 uppercase tracking-tight italic">Horitonzal Clues</h4>
                    <ul className="space-y-4">
                        <ClueItem num={1} text="The standard morning greeting (7 letters)" />
                        <ClueItem num={2} text="Short version of 'Thank you' (5 letters)" />
                        <ClueItem num={3} text="Friendly 'Hi' or 'Bye' (5 letters)" />
                        <ClueItem num={4} text="Used when saying 'Excuse me' (6 letters)" />
                    </ul>
                </div>

                <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Claire's Helper</p>
                            <p className="text-sm font-bold leading-relaxed mt-1 italic">"{t("claire_hint_claire")}"</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ClueItem({ num, text }: { num: number, text: string }) {
    return (
        <li className="flex gap-4">
            <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 text-[10px] font-black flex items-center justify-center shrink-0 mt-1">{num}</span>
            <p className="text-sm font-bold text-slate-600 leading-snug">{text}</p>
        </li>
    );
}

function GrammarSection() {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState("verbs");

    const tabs = [
        { id: "verbs", label: t("claire_verbs"), icon: <PenTool className="w-4 h-4" />, desc: t("claire_verbs_desc") },
        { id: "possessive", label: t("claire_possessive"), icon: <Layout className="w-4 h-4" />, desc: t("claire_poss_desc") },
        { id: "demonstrative", label: t("claire_demonstrative"), icon: <ChevronRight className="w-4 h-4" />, desc: t("claire_demon_desc") },
        { id: "articles", label: t("claire_articles"), icon: <BookText className="w-4 h-4" />, desc: t("claire_art_desc") },
    ];

    return (
        <div className="w-full">
            {/* Tab Navigation */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-8 py-4 rounded-3xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 border shadow-sm ${activeTab === tab.id ? 'bg-blue-600 text-white border-blue-600 shadow-xl scale-105' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-[3.5rem] p-8 md:p-12 shadow-[0_40px_100px_rgba(0,0,0,0.04)] border border-slate-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                    <GraduationCap className="w-64 h-64 text-blue-900" />
                </div>
                
                <div className="mb-10 text-center md:text-left">
                    <h4 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">{tabs.find(t => t.id === activeTab)?.label}</h4>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{tabs.find(t => t.id === activeTab)?.desc}</p>
                </div>

                <div className="overflow-x-auto pb-4 scrollbar-hide">
                    {activeTab === 'verbs' && <VerbsTable />}
                    {activeTab === 'possessive' && <PossessiveTable />}
                    {activeTab === 'demonstrative' && <DemonstrativeTable />}
                    {activeTab === 'articles' && <ArticlesTable />}
                </div>
            </div>
        </div>
    );
}

function VerbsTable() {
    return (
        <table className="w-full text-left min-w-[600px]">
            <thead>
                <tr className="border-b border-slate-100">
                    <th className="py-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Verb Title</th>
                    <th className="py-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Je</th>
                    <th className="py-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Tu</th>
                    <th className="py-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Il/Elle</th>
                    <th className="py-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Nous</th>
                    <th className="py-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Vous</th>
                    <th className="py-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Ils/Elles</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
                {GRAMMAR_DATA.verbs.map((v, i) => (
                    <tr key={i} className="group hover:bg-blue-50/30 transition-colors">
                        <td className="py-6 font-black text-blue-600 text-xl tracking-tight italic">{v.verb}</td>
                        <td className="py-6 font-bold text-slate-700">{v.je}</td>
                        <td className="py-6 font-bold text-slate-700">{v.tu}</td>
                        <td className="py-6 font-bold text-slate-700 underline decoration-blue-200 decoration-4">{v.il}</td>
                        <td className="py-6 font-bold text-slate-700">{v.nous}</td>
                        <td className="py-6 font-bold text-slate-700 underline decoration-indigo-200 decoration-4">{v.vous}</td>
                        <td className="py-6 font-bold text-slate-700">{v.ils}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function PossessiveTable() {
    return (
        <table className="w-full text-left min-w-[400px]">
            <thead>
                <tr className="border-b border-slate-100">
                    <th className="py-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">English</th>
                    <th className="py-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Masculine</th>
                    <th className="py-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Feminine</th>
                    <th className="py-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Plural</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
                {GRAMMAR_DATA.possessive.map((p, i) => (
                    <tr key={i} className="group hover:bg-orange-50/30 transition-colors">
                        <td className="py-6 font-black text-slate-400 tracking-tight italic uppercase text-xs">{p.en}</td>
                        <td className="py-6 font-bold text-slate-700 text-lg">{p.m}</td>
                        <td className="py-6 font-bold text-slate-700 text-lg">{p.f}</td>
                        <td className="py-6 font-bold text-orange-600 text-lg">{p.p}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function DemonstrativeTable() {
    return (
        <table className="w-full text-left min-w-[400px]">
            <thead>
                <tr className="border-b border-slate-100">
                    <th className="py-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Type</th>
                    <th className="py-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Word</th>
                    <th className="py-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Example</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
                {GRAMMAR_DATA.demonstrative.map((d, i) => (
                    <tr key={i} className="group hover:bg-purple-50/30 transition-colors">
                        <td className="py-6 font-black text-slate-400 tracking-tight italic uppercase text-xs">{d.type}</td>
                        <td className="py-6 font-bold text-purple-600 text-lg">{d.word}</td>
                        <td className="py-6 font-medium text-slate-700 italic">"{d.example}"</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function ArticlesTable() {
    return (
        <table className="w-full text-left min-w-[400px]">
            <thead>
                <tr className="border-b border-slate-100">
                    <th className="py-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Type</th>
                    <th className="py-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Masculine</th>
                    <th className="py-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Feminine</th>
                    <th className="py-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Plural</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
                {GRAMMAR_DATA.articles.map((a, i) => (
                    <tr key={i} className="group hover:bg-green-50/30 transition-colors">
                        <td className="py-6 font-black text-green-600 tracking-tight italic uppercase text-xs">{a.type}</td>
                        <td className="py-6 font-bold text-slate-700 text-lg">{a.m}</td>
                        <td className="py-6 font-bold text-slate-700 text-lg">{a.f}</td>
                        <td className="py-6 font-bold text-slate-700 text-lg">{a.p}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function FloatingChat({ isChatOpen, setIsChatOpen, mood, handleMoodChange, chatRef }: any) {
    return (
        <div className="fixed bottom-6 right-6 z-[2000]">
            <AnimatePresence mode="wait">
                {isChatOpen ? (
                    <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }} className="w-[340px] sm:w-[420px] h-[650px] bg-white rounded-[3.5rem] shadow-[0_40px_120px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden flex flex-col mb-4 ring-1 ring-slate-100 relative">
                        <div className="p-8 bg-blue-600 text-white flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-3xl border-2 border-white/20 overflow-hidden bg-black flex-shrink-0 relative">
                                    <Image src={mood === 'thinking' ? '/characters/claire_thinking.png' : '/characters/claire_happy.png'} alt="Claire" fill className="object-cover scale-150" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-black text-lg tracking-tight">Teacher Claire</span>
                                    <span className="text-[10px] opacity-60 font-black uppercase tracking-[0.2em] leading-none">Interactive Lab</span>
                                </div>
                            </div>
                            <button onClick={() => setIsChatOpen(false)} className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl">✕</button>
                        </div>
                        <div className="flex-1 overflow-hidden bg-white">
                            <ChatBox agentName="claire" topic="French language coach" agentColor="bg-blue-600" onMoodChange={handleMoodChange} ref={chatRef} />
                        </div>
                    </motion.div>
                ) : (
                    <motion.button initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, -10, 10, 0] }} whileHover={{ scale: 1.1, rotate: 12 }} whileTap={{ scale: 0.9 }} onClick={() => setIsChatOpen(true)} className="w-20 h-20 rounded-[2.5rem] bg-blue-600 shadow-2xl flex items-center justify-center text-white border-4 border-white relative z-[2000] group">
                        <div className="absolute -inset-2 rounded-[3.5rem] bg-blue-600/30 animate-pulse" />
                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-black border-2 border-blue-400 group-hover:border-white transition-all">
                                <Image src="/characters/claire_happy.png" alt="Claire" fill className="object-cover scale-150 rotate-6" />
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}

function SuccessOverlay({ show, count }: { show: boolean, count: number }) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[3000] flex items-center justify-center pointer-events-none bg-blue-950/20 backdrop-blur-3xl">
                    <motion.div initial={{ scale: 0.5, rotate: -20, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} className="bg-white p-24 rounded-[5rem] shadow-[0_100px_200px_rgba(0,0,0,0.4)] text-center border-[20px] border-blue-50 relative">
                        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-blue-600 rounded-full border-[10px] border-white flex items-center justify-center shadow-2xl">
                            <Trophy className="w-20 h-20 text-white" />
                        </div>
                        <h2 className="text-8xl font-black text-slate-900 tracking-tighter mb-4 italic uppercase">Gagné !</h2>
                        <p className="text-2xl font-bold text-blue-600 uppercase tracking-[0.4em]">Level Up: +{count * 100} XP</p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function VocabCard({ word, onShow, onSpeak, isSpeaking }: { word: any, onShow: () => void, onSpeak: (word: string) => void, isSpeaking: boolean }) {
    const [isFlipped, setIsFlipped] = useState(false);
    return (
        <div className="group h-44 [perspective:1000px] cursor-pointer" onClick={() => { setIsFlipped(!isFlipped); onShow(); }}>
            <motion.div animate={{ rotateY: isFlipped ? 180 : 0 }} className="relative w-full h-full [transform-style:preserve-3d] transition-transform duration-700">
                <div className={`absolute inset-0 bg-white rounded-[2.5rem] shadow-xl border-2 flex flex-col items-center justify-center p-8 [backface-visibility:hidden] ${isSpeaking ? 'border-blue-500 bg-blue-50/20' : 'border-slate-50'}`}>
                    <span className="text-3xl font-black text-slate-800 tracking-tight">{word.fr}</span>
                    <button className={`mt-6 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isSpeaking ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-50 text-blue-600'}`} onClick={(e) => { e.stopPropagation(); onSpeak(word.fr); }}><Volume2 className="w-5 h-5" /></button>
                </div>
                <div className="absolute inset-0 bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col items-center justify-center text-white text-center">
                    <span className="text-2xl font-black mb-3 italic">"{word.en}"</span>
                    <div className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-widest">{word.phonetic}</div>
                </div>
            </motion.div>
        </div>
    );
}
