"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { 
    ArrowLeft, Volume2, BookText, Trophy, Star, Sparkles, 
    MessageCircle, Zap, Flame, Timer, Puzzle, CheckCircle2,
    RotateCcw, ChevronRight, Play, Info
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

// --- Animations ---
const spring = { type: "spring", damping: 20, stiffness: 300 };
const shake = {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.4 }
};

// --- Helper Functions ---
const shuffleWord = (word: string) => {
    return word.split('').sort(() => Math.random() - 0.5).join(' ');
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
    const { t, language } = useLanguage();
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: containerRef });
    
    // --- Game State ---
    const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("beginner");
    const [correctCount, setCorrectCount] = useState(0);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [isCrosswordMode, setIsCrosswordMode] = useState(false);
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

    const scrambledLetters = useMemo(() => {
        return currentWord.fr.split("");
    }, [currentWord]);

    // Letter shuffling for the tiles
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
            handleCheck(true); // Auto-check as wrong if time runs out
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

            // Leveling Up
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
                                Digital Atelier <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 italic">Teacher Claire 🥐</span>
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

                {/* [ THE WORD BUILDER / CROSSWORD SYSTEM ] */}
                <SectionWrapper id="learning-grid" className="max-w-7xl mx-auto pb-24 px-6 z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-12">
                            <div className="bg-white rounded-[4rem] p-8 md:p-16 shadow-[0_25px_100px_rgba(30,50,150,0.06)] border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden">
                                
                                {/* Game Controls */}
                                <div className="absolute top-8 right-8 flex gap-3 z-20">
                                   <button onClick={toggleTimer} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isTimerActive ? 'bg-orange-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
                                       <Timer className="w-5 h-5" />
                                   </button>
                                   <button onClick={() => { setIsCrosswordMode(!isCrosswordMode); setFeedback(null); }} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isCrosswordMode ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                                       <Puzzle className="w-5 h-5" />
                                   </button>
                                </div>

                                <div className="absolute top-8 left-8 z-20">
                                    <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                                        <Zap className="w-4 h-4 text-blue-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Combo x{combo}</span>
                                    </div>
                                </div>

                                <motion.div key={isCrosswordMode ? 'crossword' : 'builder'} className="w-full flex flex-col items-center">
                                    {!isCrosswordMode ? (
                                        <div className="flex flex-col items-center text-center w-full max-w-4xl">
                                            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm mb-6">
                                                <BookText className="w-8 h-8" />
                                            </div>
                                            <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight uppercase">Constructeur de Mots</h2>
                                            <p className="text-slate-400 font-bold text-sm uppercase mb-12 tracking-widest">Construct: "{currentWord.en}"</p>
                                            
                                            {/* Timer Bar */}
                                            {isTimerActive && (
                                                <div className="w-full max-w-md h-2 bg-slate-100 rounded-full mb-12 overflow-hidden">
                                                    <motion.div 
                                                        animate={{ width: `${(timeLeft / 15) * 100}%` }} 
                                                        className={`h-full ${timeLeft < 5 ? 'bg-red-500' : 'bg-orange-400'} transition-all`}
                                                    />
                                                </div>
                                            )}

                                            {/* Word Tiles */}
                                            <div className="flex flex-wrap justify-center gap-4 mb-12">
                                                {shuffledTiles.map((char, i) => (
                                                    <motion.button
                                                        key={`${currentWord.fr}-${i}`}
                                                        layout
                                                        whileHover={{ y: -8, scale: 1.1, rotate: 5 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => { setGuess(prev => prev + char); setMood("listening"); }}
                                                        className="w-16 h-20 bg-white rounded-3xl shadow-xl border-b-8 border-slate-100 flex items-center justify-center text-4xl font-black text-blue-600 hover:border-blue-200 transition-all font-mono"
                                                    >
                                                        {char}
                                                    </motion.button>
                                                ))}
                                            </div>

                                            {/* Input Area */}
                                            <motion.div 
                                                animate={feedback && !feedback.isCorrect ? shake : {}}
                                                className={`w-full max-w-2xl p-8 rounded-[3rem] border-4 border-dashed transition-all mb-12 relative ${feedback?.isCorrect ? 'border-green-300 bg-green-50/50' : feedback ? 'border-red-200 bg-red-50/50' : 'border-slate-100 bg-slate-50/20'}`}
                                            >
                                                <div className="text-5xl font-black tracking-[0.4em] text-blue-900 font-mono uppercase min-h-[5rem] flex items-center justify-center">
                                                    {guess || <span className="text-slate-200 text-lg opacity-80 tracking-widest italic font-sans animate-pulse">Select letters...</span>}
                                                </div>
                                                {guess && <button onClick={() => setGuess("")} className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xl hover:rotate-90 transition-transform">✕</button>}
                                                
                                                {feedback?.isCorrect && (
                                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-xl">
                                                        Excellent ! +{100 * combo} XP
                                                    </motion.div>
                                                )}
                                            </motion.div>

                                            <div className="flex gap-4 w-full max-w-xl">
                                                {!feedback?.isCorrect && (
                                                    <button onClick={() => handleCheck()} className="flex-1 bg-blue-600 text-white font-black py-5 rounded-[2.5rem] text-xl shadow-2xl hover:bg-black transition-all active:scale-95 uppercase tracking-widest group">
                                                        Verify Answer <ChevronRight className="w-5 h-5 inline group-hover:translate-x-2 transition-transform" />
                                                    </button>
                                                )}
                                                {feedback?.isCorrect && (
                                                    <button onClick={nextWord} className="flex-1 bg-indigo-600 text-white font-black py-5 rounded-[2.5rem] text-xl shadow-2xl hover:bg-black transition-all active:scale-95 uppercase tracking-widest flex items-center justify-center gap-3">
                                                        Next Word <Play className="w-5 h-5 fill-white" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <CrosswordGame onComplete={() => { setMood("happy"); setScore(prev => prev + 1000); }} />
                                    )}
                                </motion.div>

                                {/* [ SMART FEEDBACK PANEL ] */}
                                <AnimatePresence>
                                    {feedback?.isCorrect && (
                                        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl mt-16 pt-16 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="p-8 rounded-[2.5rem] bg-blue-50 text-left border border-blue-100 flex flex-col justify-between">
                                                <div>
                                                    <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white mb-4">
                                                        <Volume2 className="w-5 h-5" />
                                                    </div>
                                                    <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Pronunciation</h4>
                                                    <p className="text-2xl font-black text-blue-900 italic">"{currentWord.phonetic}"</p>
                                                </div>
                                                <button onClick={() => speak(currentWord.fr)} className="mt-6 text-xs font-black text-blue-600 underline text-left">Listen Again 🔊</button>
                                            </div>

                                            <div className="p-8 rounded-[2.5rem] bg-slate-50 text-left border border-slate-100">
                                                <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-white mb-4">
                                                    <MessageCircle className="w-5 h-5" />
                                                </div>
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Usage Example</h4>
                                                <p className="text-lg font-bold text-slate-700 leading-relaxed italic">"{currentWord.example}"</p>
                                            </div>

                                            <div className="p-8 rounded-[2.5rem] bg-indigo-50 text-left border border-indigo-100">
                                                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mb-4">
                                                    <Info className="w-5 h-5" />
                                                </div>
                                                <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">Claire's Tip</h4>
                                                <p className="text-sm font-bold text-indigo-900 leading-relaxed">{currentWord.tip}</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* [ CLAIRE FEEDBACK POPUP ] */}
                                <AnimatePresence>
                                    {feedback && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.8, x: 20 }}
                                            animate={{ opacity: 1, scale: 1, x: 0 }}
                                            className="absolute bottom-8 right-8 max-w-[240px] p-6 bg-slate-900 text-white rounded-[2rem] shadow-2xl z-20 pointer-events-none"
                                        >
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-8 h-8 rounded-full overflow-hidden bg-white border-2 border-white/20">
                                                    <Image src="/characters/claire_happy.png" alt="Claire" fill className="object-cover scale-150" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Claire</span>
                                            </div>
                                            <p className="text-sm font-black italic">"{feedback.msg}"</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* [ VOCABULARY SIDEBAR ] */}
                        <div className="lg:col-span-12 space-y-12 pt-16 mt-16 border-t border-slate-100">
                            <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-12">
                                <h3 className="text-4xl font-black text-slate-800 tracking-tight uppercase mb-4">Archives de Vocabulaire</h3>
                                <p className="text-slate-500 font-medium">Review words you've already encountered in the atelier.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {WORD_POOL.beginner.map((w, idx) => (
                                    <VocabCard key={idx} word={{ fr: w.fr, en: w.en, phonetic: w.phonetic }} isSpeaking={speakingWord === w.fr} onSpeak={handleSpeak} onShow={() => setMood("happy")} />
                                ))}
                            </div>
                        </div>
                    </div>
                </SectionWrapper>

                {/* [ FLOATING CHAT SYSTEM ] */}
                <div className="fixed bottom-6 right-6 z-[2000]">
                    <AnimatePresence mode="wait">
                        {isChatOpen ? (
                            <motion.div 
                                key="chat-window-claire"
                                initial={{ opacity: 0, scale: 0.9, y: 40 }} 
                                animate={{ opacity: 1, scale: 1, y: 0 }} 
                                exit={{ opacity: 0, scale: 0.9, y: 40 }} 
                                className="w-[340px] sm:w-[420px] h-[650px] bg-white rounded-[3.5rem] shadow-[0_40px_120px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden flex flex-col mb-4 ring-1 ring-slate-100 relative"
                            >
                                <div className="p-8 bg-blue-600 text-white flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-3xl border-2 border-white/20 overflow-hidden bg-black flex-shrink-0 relative">
                                            <Image 
                                                src={mood === 'thinking' ? '/characters/claire_thinking.png' : '/characters/claire_happy.png'} 
                                                alt="Claire" fill className="object-cover scale-150" 
                                            />
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
                            <motion.button 
                                key="chat-toggle-claire"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
                                whileHover={{ scale: 1.1, rotate: 12 }} 
                                whileTap={{ scale: 0.9 }} 
                                onClick={() => setIsChatOpen(true)} 
                                className="w-20 h-20 rounded-[2.5rem] bg-blue-600 shadow-2xl flex items-center justify-center text-white border-4 border-white relative z-[2000] group"
                            >
                                <div className="absolute -inset-2 rounded-[3.5rem] bg-blue-600/30 animate-pulse" />
                                <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-black border-2 border-blue-400 group-hover:border-white transition-all">
                                     <Image src="/characters/claire_happy.png" alt="Claire" fill className="object-cover scale-150 rotate-6" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black">1</div>
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <AnimatePresence>
                {showSuccess && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[3000] flex items-center justify-center pointer-events-none bg-blue-950/20 backdrop-blur-3xl">
                        <motion.div 
                            initial={{ scale: 0.5, rotate: -20, opacity: 0 }} 
                            animate={{ scale: 1, rotate: 0, opacity: 1 }} 
                            className="bg-white p-24 rounded-[5rem] shadow-[0_100px_200px_rgba(0,0,0,0.4)] text-center border-[20px] border-blue-50 relative"
                        >
                            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-blue-600 rounded-full border-[10px] border-white flex items-center justify-center shadow-2xl">
                                <Trophy className="w-20 h-20 text-white" />
                            </div>
                            <h2 className="text-8xl font-black text-slate-900 tracking-tighter mb-4 italic">INCROYABLE !</h2>
                            <p className="text-2xl font-bold text-blue-600 uppercase tracking-[0.4em]">Level Up: +{correctCount * 100} XP</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}

// --- Crossword Mini-Game Component ---
function CrosswordGame({ onComplete }: { onComplete: () => void }) {
    const grid = [
        ["B", "O", "N", "J", "O", "U", "R"],
        [" ", " ", " ", " ", " ", " ", " "],
        [" ", "M", "E", "R", "C", "I", " "],
        [" ", " ", " ", " ", " ", " ", " "],
        ["S", "A", "L", "U", "T", " ", " "],
    ];

    const [userGrid, setUserGrid] = useState<string[][]>(grid.map(row => row.map(cell => cell === " " ? " " : "")));

    const handleInput = (r: number, c: number, val: string) => {
        const newGrid = [...userGrid];
        newGrid[r][c] = val.toUpperCase().charAt(0);
        setUserGrid(newGrid);

        // Simple validation check (lazy)
        const isFinished = newGrid.every((row, ri) => row.every((cell, ci) => cell === " " || cell === grid[ri][ci]));
        if (isFinished) onComplete();
    };

    return (
        <div className="flex flex-col items-center">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 mb-8">
                <Puzzle className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Crossword Mode Alpha</span>
            </div>
            
            <div className="grid gap-2 mb-12">
                {grid.map((row, r) => (
                    <div key={r} className="flex gap-2">
                        {row.map((cell, c) => (
                            cell === " " ? <div key={c} className="w-14 h-14" /> : (
                                <input 
                                    key={c}
                                    value={userGrid[r][c]}
                                    onChange={(e) => handleInput(r, c, e.target.value)}
                                    maxLength={1}
                                    className={`w-14 h-14 bg-white rounded-xl shadow-inner border-2 text-center text-xl font-black transition-all ${userGrid[r][c] === grid[r][c] ? 'border-green-400 bg-green-50 text-green-700' : 'border-slate-100 focus:border-blue-400 focus:ring-4 focus:ring-blue-50'}`}
                                />
                            )
                        ))}
                    </div>
                ))}
            </div>

            <div className="text-left w-full max-w-md bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                <h4 className="font-black text-slate-800 mb-4 uppercase tracking-tighter">Horizontal Clues</h4>
                <ul className="space-y-3 text-sm font-bold text-slate-500">
                    <li>1. The standard greeting for anyone (7 letters)</li>
                    <li>2. Short version of thanks (5 letters)</li>
                    <li>3. Friendly catch-all greeting (5 letters)</li>
                </ul>
            </div>
        </div>
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
