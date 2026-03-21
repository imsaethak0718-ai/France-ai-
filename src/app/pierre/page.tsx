"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ChatBox from "@/components/ChatBox";
import { ArrowLeft, Utensils, CheckCircle2, RefreshCw, Map as MapIcon, ChevronDown } from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
import CharacterAvatar, { Mood } from "@/components/CharacterAvatar";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import FloatingEmojis from "@/components/FloatingEmojis";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

const FranceMap = dynamic(
    () => import("@/components/FranceMap").then((mod) => mod.default),
    { ssr: false }
);

type Dish = {
    id: string;
    name: string;
    region: string;
    flagColor: string;
    description: string;
    image: string;
    requiredIngredients: string[];
};

const DISHES: Dish[] = [
    {
        id: "french-onion-soup",
        name: "French Onion Soup",
        region: "Paris (Île-de-France)",
        flagColor: "bg-[#002395] text-white hover:bg-[#001e82]",
        description: "Rich onion soup topped with melted cheese and crusty bread.",
        image: "/images/french_onion_soup.png",
        requiredIngredients: ["🧅 Onion", "🧀 Cheese", "🥖 Baguette"],
    },
    {
        id: "coq-au-vin",
        name: "Coq au Vin",
        region: "Burgundy (Bourgogne)",
        flagColor: "bg-white text-slate-800 hover:bg-slate-50",
        description: "Chicken braised with red wine, mushrooms, and pearl onions.",
        image: "/images/coq_au_vin.png",
        requiredIngredients: ["🍗 Chicken", "🍷 Wine", "🍄 Mushroom", "🧅 Onion"],
    },
    {
        id: "ratatouille",
        name: "Ratatouille",
        region: "Provence",
        flagColor: "bg-[#ED2939] text-white hover:bg-[#d62432]",
        description: "A classic Provençal vegetable stew.",
        image: "/images/ratatouille.png",
        requiredIngredients: ["🍆 Eggplant", "🍅 Tomato", "🧅 Onion", "🌿 Herbs"],
    },
    {
        id: "quiche-lorraine",
        name: "Quiche Lorraine",
        region: "Lorraine",
        flagColor: "bg-[#002395] text-white hover:bg-[#001e82]",
        description: "A savory tart with a buttery crust filled with creamy egg and smoky bacon.",
        image: "/images/quiche_lorraine.png",
        requiredIngredients: ["🥚 Egg", "🥓 Bacon", "🧀 Cheese", "🥐 Pastry"],
    },
    {
        id: "bouillabaisse",
        name: "Bouillabaisse",
        region: "Marseille",
        flagColor: "bg-white text-slate-800 hover:bg-slate-50",
        description: "A traditional Provençal fish stew originating from the port city of Marseille.",
        image: "/images/bouillabaisse.png",
        requiredIngredients: ["🐟 Fish", "🍅 Tomato", "🌿 Herbs", "🧅 Onion"],
    },
    {
        id: "tartiflette",
        name: "Tartiflette",
        region: "Savoie",
        flagColor: "bg-[#ED2939] text-white hover:bg-[#d62432]",
        description: "A comforting baked dish made with potatoes, reblochon cheese, and lardons.",
        image: "/images/tartiflette.png",
        requiredIngredients: ["🥔 Potato", "🧀 Cheese", "🧅 Onion", "🥓 Bacon"],
    },
    {
        id: "tarte-tatin",
        name: "Tarte Tatin",
        region: "Centre-Val de Loire",
        flagColor: "bg-[#002395] text-white hover:bg-[#001e82]",
        description: "A famous pastry with caramelized apples baked upside-down in a buttery crust.",
        image: "/images/tarte_tatin.png",
        requiredIngredients: ["🍎 Apple", "🧈 Butter", "🥐 Pastry"],
    },
    {
        id: "cassoulet",
        name: "Cassoulet",
        region: "Occitanie",
        flagColor: "bg-white text-slate-800 hover:bg-slate-50",
        description: "A rich, slow-cooked casserole containing pork, sausage, and white beans.",
        image: "/images/cassoulet.png",
        requiredIngredients: ["🫘 Beans", "🥓 Bacon", "🍗 Chicken", "🌿 Herbs"],
    },
    {
        id: "crepes",
        name: "Crêpes",
        region: "Brittany",
        flagColor: "bg-[#ED2939] text-white hover:bg-[#d62432]",
        description: "Thin French pancakes folded and served with sweet or savory toppings.",
        image: "/images/crepes.png",
        requiredIngredients: ["🥚 Egg", "🥛 Milk", "🌾 Flour", "🧈 Butter"],
    },
];

const ALL_INGREDIENTS = [
    "🥖 Baguette", "🧀 Cheese", "🍗 Chicken", "🍷 Wine", "🧅 Onion", 
    "🌿 Herbs", "🍆 Eggplant", "🍅 Tomato", "🍄 Mushroom", "🥔 Potato", 
    "Carrot", "🧈 Butter", "🥚 Egg", "🥓 Bacon", "🐟 Fish", 
    "🍎 Apple", "🥐 Pastry", "🫘 Beans", "🥛 Milk", "🌾 Flour",
];

const INGREDIENT_HINTS: Record<string, string> = {
    "🍆 Eggplant": "A purple vegetable used in Mediterranean stews.",
    "🍅 Tomato": "A red, juicy fruit often used as a vegetable base.",
    "🧅 Onion": "A pungent bulb that makes you cry when cutting it.",
    "🌿 Herbs": "Green, aromatic leaves like thyme or rosemary.",
    "🍗 Chicken": "A common poultry meat.",
    "🍷 Wine": "A drink made from fermented grapes, used for cooking or drinking.",
    "🍄 Mushroom": "A fleshy fungus that grows in the woods.",
    "🧀 Cheese": "A dairy product made from milk curds.",
    "🥖 Baguette": "A long, thin loaf of French bread.",
    "🥔 Potato": "A starchy root vegetable.",
    "🥕 Carrot": "An orange root vegetable.",
    "🧈 Butter": "A solid dairy product used for cooking or baking.",
    "🥚 Egg": "Laid by chickens, an essential baking and binding ingredient.",
    "🥓 Bacon": "Smoky, salty cured meat from pork.",
    "🐟 Fish": "An aquatic animal, used as the base for many coastal stews.",
    "🍎 Apple": "A crisp, sweet fruit often baked into desserts.",
    "🥐 Pastry": "A buttery dough used to make crusts and tarts.",
    "🫘 Beans": "Small seeds, normally white beans for hearty stews.",
    "🥛 Milk": "A dairy liquid essential for batters.",
    "🌾 Flour": "Ground wheat used to make bread and pancakes."
};

const CHEF_QUOTES = [
    { text: "Cooking is an art, but all art requires knowing something about the techniques and materials.", author: "Julia Child" },
    { text: "A recipe has no soul. You, as the cook, must bring soul to the recipe.", author: "Thomas Keller" },
    { text: "Good food is the foundation of genuine happiness.", author: "Auguste Escoffier" },
    { text: "People who love to eat are always the best people.", author: "Julia Child" }
];

const ChefQuote = ({ quote, className = "" }: { quote: typeof CHEF_QUOTES[0]; className?: string }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        whileInView={{ opacity: 0.8, scale: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ opacity: 1, scale: 1.05 }}
        className={`glass-panel p-6 max-w-sm rounded-3xl border border-white/40 shadow-xl bg-white/20 backdrop-blur-md italic font-serif text-orange-950/80 ${className}`}
    >
        <p className="text-lg mb-2">“{quote.text}”</p>
        <p className="text-right text-sm font-bold opacity-60">— {quote.author}</p>
    </motion.div>
);

const SectionWrapper = ({ children, id, className = "" }: { children: React.ReactNode; id: string; className?: string }) => (
    <motion.section
        id={id}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`min-h-screen flex flex-col justify-center py-20 px-4 md:px-10 relative z-10 ${className}`}
    >
        {children}
    </motion.section>
);

export default function PierreLab() {
    const { t, language } = useLanguage();
    const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
    const [pot, setPot] = useState<string[]>([]);
    const [cookingState, setCookingState] = useState<"idle" | "cooking" | "success" | "fail">("idle");
    const [feedback, setFeedback] = useState("");
    const [mood, setMood] = useState<Mood>("idle");

    const [chefQuote, setChefQuote] = useState<string | null>(null);
    const [showWave, setShowWave] = useState(true);

    useEffect(() => {
        setMood("greeting");
        const timer = setTimeout(() => {
            setShowWave(false);
            setMood("idle");
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    const pierreReactions = [
        "Ready to cook something legendary?",
        "No cap, today we cook like Michelin stars ⭐",
        "Magnifique! Let's create some magic.",
        "Your culinary journey starts now!"
    ];

    const handlePierreClick = () => {
        const randomQuote = pierreReactions[Math.floor(Math.random() * pierreReactions.length)];
        setChefQuote(randomQuote);
        setMood("happy");
        setTimeout(() => setChefQuote(null), 4000);
    };

    const { scrollYProgress } = useScroll();
    const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

    const culinaryFacts = [
        t("pierre_fact1"),
        t("pierre_fact2"),
        t("pierre_fact3"),
        t("pierre_fact4"),
        t("pierre_fact5"),
    ];

    const handleToggleIngredient = (item: string) => {
        if (cookingState === "success") return;
        setCookingState("idle");
        setFeedback("");
        if (pot.includes(item)) {
            setPot(pot.filter((i) => i !== item));
        } else {
            setPot([...pot, item]);
        }
    };

    const handleCook = () => {
        if (!selectedDish) return;
        setCookingState("cooking");
        setFeedback("");
        setMood("thinking");

        setTimeout(() => {
            const isCorrectLength = pot.length === selectedDish.requiredIngredients.length;
            const hasAllIngredients = selectedDish.requiredIngredients.every((ing) => pot.includes(ing));

            if (isCorrectLength && hasAllIngredients) {
                setCookingState("success");
                setMood("happy");
            } else {
                setCookingState("fail");
                setMood("idle");

                const missingIngredients = selectedDish.requiredIngredients.filter(ing => !pot.includes(ing));
                const extraIngredients = pot.filter(ing => !selectedDish.requiredIngredients.includes(ing));

                if (extraIngredients.length > 0) {
                    setFeedback(`Non, non, non! "${extraIngredients[0]}" doesn't belong in this dish.`);
                } else if (missingIngredients.length > 0) {
                    const hint = INGREDIENT_HINTS[missingIngredients[0]];
                    setFeedback(`Hmm, you are missing something... Hint: ${hint}`);
                } else {
                    setFeedback("These aren't quite the right ingredients for this dish.");
                }
            }
        }, 1500);
    };

    const handleReset = () => {
        setSelectedDish(null);
        setPot([]);
        setCookingState("idle");
        setFeedback("");
    };

    return (
        <div className="relative min-h-screen bg-[#FFFBF0] overflow-x-hidden">
            <FloatingEmojis />
            
            {/* Immersive Background */}
            <motion.div 
                style={{ y: backgroundY }}
                className="fixed inset-0 z-0 pointer-events-none"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-orange-50/10 via-white/40 to-orange-50/10 z-10" />
                <Image 
                    src="/images/kitchen_bg.png" 
                    alt="French Kitchen" 
                    fill 
                    className="object-cover opacity-20 blur-sm scale-110"
                    priority
                />
            </motion.div>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-4 flex justify-between items-center pointer-events-none">
                <div className="pointer-events-auto">
                    <Link href="/" className="group p-3 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 flex items-center gap-2 hover:bg-orange-50 transition-all">
                        <ArrowLeft className="text-orange-600 transition-transform group-hover:-translate-x-1" />
                        <span className="font-bold text-orange-950 pr-2">Retour</span>
                    </Link>
                </div>
                <div className="pointer-events-auto flex items-center gap-4">
                    <LanguageToggle />
                </div>
            </nav>

            {/* Scroll Container */}
            <main className="relative z-10">
                {/* SECTION 1 — ENTRY (Hero) */}
                <SectionWrapper id="hero" className="items-center text-center max-w-7xl mx-auto flex lg:flex-row flex-col gap-16 overflow-visible">
                    <div className="flex-1 text-left order-2 lg:order-1 pt-10">
                         {/* Live Status Badge */}
                         <motion.div 
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-md rounded-full border border-orange-100 mb-8 shadow-sm"
                         >
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                            </span>
                            <span className="text-xs font-black uppercase tracking-widest text-orange-950">Chef Pierre is in the kitchen</span>
                         </motion.div>

                        <motion.h1 
                            initial={{ y: 20, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="text-6xl md:text-8xl font-black text-orange-950 mb-8 tracking-tight leading-[0.9] drop-shadow-sm"
                        >
                            {t("pierre_title")}
                        </motion.h1>

                        <motion.p 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-xl md:text-2xl text-orange-800 font-medium max-w-2xl mb-12 leading-relaxed opacity-90"
                        >
                            Bienvenue! Let{"'"}s embark on a legendary culinary journey through the heart of France.
                        </motion.p>
                        
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="flex flex-wrap items-center gap-8"
                        >
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => document.getElementById("discover")?.scrollIntoView({ behavior: "smooth" })}
                                className="px-10 py-5 bg-gradient-to-br from-orange-600 to-orange-500 text-white rounded-full font-black text-xl shadow-[0_20px_50px_rgba(234,88,12,0.3)] flex items-center gap-3 group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
                                Start Cooking 🍳
                            </motion.button>
                            
                            <div className="flex flex-col gap-1 text-orange-950/50 font-black uppercase text-[10px] tracking-widest">
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-[1.5px] bg-orange-200"></span>
                                    Paris vibes 🇫🇷
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-[1.5px] bg-orange-200"></span>
                                    Fresh ingredients only
                                </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2, duration: 1 }}
                            className="mt-16 flex items-center gap-2 text-orange-400 group cursor-pointer"
                            onClick={() => document.getElementById("discover")?.scrollIntoView({ behavior: "smooth" })}
                        >
                            <span className="font-black text-xs uppercase tracking-[0.2em] group-hover:tracking-[0.3em] transition-all">Explore Below</span>
                            <ChevronDown className="w-6 h-6 animate-bounce" />
                        </motion.div>
                    </div>

                    <div className="flex-1 relative order-1 lg:order-2 flex justify-center items-center py-10">
                        {/* Background Floating Food Emojis */}
                        <div className="absolute inset-0 pointer-events-none z-0 overflow-visible">
                             {["🥖", "🧀", "🍷", "🍳", "🍰", "🥐"].map((emoji, i) => (
                                 <motion.span
                                    key={i}
                                    initial={{ 
                                        x: (i % 2 === 0 ? 1 : -1) * (100 + i * 50), 
                                        y: (i % 3 === 0 ? 1 : -1) * (100 + i * 30), 
                                        opacity: 0,
                                        scale: 0.5
                                    }}
                                    animate={{ 
                                        y: [(i % 2 === 0 ? 1 : -1) * (100 + i * 30), (i % 2 === 0 ? 1 : -1) * (80 + i * 30), (i % 2 === 0 ? 1 : -1) * (100 + i * 30)], 
                                        x: [(i % 2 === 0 ? 1 : -1) * (100 + i * 50), (i % 2 === 0 ? 1 : -1) * (120 + i * 50), (i % 2 === 0 ? 1 : -1) * (100 + i * 50)],
                                        opacity: [0, 0.2, 0],
                                        scale: [0.5, 1, 0.5],
                                        rotate: [0, 10, 0]
                                    }}
                                    transition={{ 
                                        duration: 6 + i, 
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: i * 0.8
                                    }}
                                    className="absolute text-5xl"
                                 >
                                    {emoji}
                                 </motion.span>
                             ))}
                        </div>

                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3, duration: 1 }}
                            className="relative cursor-pointer group z-10 flex items-center justify-center min-h-[500px] w-full"
                            onClick={handlePierreClick}
                        >
                            {/* Pierre Big Memoji Display */}
                            <motion.div 
                                animate={{ 
                                    y: mood === "thinking" ? [0, -15, 0] : [0, -25, 0],
                                    rotate: [0, 1, -1, 0]
                                }}
                                transition={{ 
                                    duration: 5, 
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="relative z-10 scale-[1.2] lg:scale-[1.5] flex items-center justify-center overflow-visible"
                            >
                                <CharacterAvatar 
                                    agentName="pierre" 
                                    mood={mood} 
                                    color="bg-orange-500" 
                                    isHero={true}
                                />
                                
                                <AnimatePresence>
                                    {showWave && mood === "greeting" && (
                                        <motion.div 
                                            initial={{ rotate: 0, scale: 0, opacity: 0 }}
                                            animate={{ rotate: [0, 20, 0, 20, 0], scale: 1, opacity: 1 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                            transition={{ duration: 1.5 }}
                                            className="absolute -top-10 -right-10 text-8xl pointer-events-none drop-shadow-2xl z-30"
                                        >
                                            👋
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            {/* Speech Bubble */}
                            <AnimatePresence>
                                {chefQuote && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5, y: 20, x: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.5, y: 20 }}
                                        className="absolute -top-32 -left-20 z-20 glass-panel p-6 rounded-[2.5rem] shadow-2xl border-2 border-white/80 min-w-[280px] bg-white/90 backdrop-blur-xl"
                                    >
                                        <p className="font-black text-orange-950 italic text-lg leading-tight">“{chefQuote}”</p>
                                        <div className="absolute -bottom-3 left-20 w-8 h-8 bg-white/90 border-b-2 border-r-2 border-white/80 rotate-45" />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Decorative Dashed Arrow */}
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.3 }}
                                transition={{ delay: 1.5 }}
                                className="absolute -bottom-20 -left-20 hidden lg:block"
                            >
                                <svg width="150" height="150" viewBox="0 0 150 150" className="text-orange-950">
                                    <path 
                                        d="M10,130 C40,110 80,120 120,50" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                        strokeDasharray="8,8" 
                                    />
                                    <path d="M115,65 L120,50 L105,53" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                <span className="absolute bottom-4 left-10 font-black text-[10px] uppercase tracking-widest opacity-40">Tap the Chef!</span>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Floating Hero Quote */}
                    <ChefQuote 
                        quote={CHEF_QUOTES[0]} 
                        className="absolute bottom-10 right-0 hidden lg:block -rotate-3 z-30"
                    />
                </SectionWrapper>

                <div className="h-20 w-full flex items-center justify-center opacity-10">
                    <div className="h-[1px] w-full max-w-4xl bg-orange-900" />
                </div>

                {/* SECTION 2 — DISCOVER (Map) */}
                <SectionWrapper id="discover" className="max-w-[1600px] mx-auto overflow-visible px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
                        
                        {/* LEFT: FACTS PANEL */}
                        <motion.div 
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="lg:col-span-3 space-y-8"
                        >
                            <div className="glass-panel p-8 rounded-[2.5rem] border border-white/50 bg-white/40 shadow-xl ml-2">
                                <h3 className="text-2xl font-black text-orange-950 mb-6 flex items-center gap-3">
                                    <span className="text-3xl">✨</span> {t("pierre_facts_title")}
                                </h3>
                                <ul className="space-y-6">
                                    {culinaryFacts.map((fact, i) => (
                                        <li key={i} className="text-sm font-bold text-orange-950 leading-relaxed opacity-80 flex gap-3">
                                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0" />
                                            {fact}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <ChefQuote quote={CHEF_QUOTES[1]} className="mx-auto rotate-2" />
                        </motion.div>

                        {/* CENTER: MAP (WIDE) */}
                        <motion.div 
                            initial={{ opacity: 0, y: 100 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="lg:col-span-6 flex flex-col items-center gap-8"
                        >
                            <div className="text-center mb-2">
                                <h2 className="text-5xl font-black text-orange-950 mb-3">{t("pierre_map_title")}</h2>
                                <p className="text-lg text-orange-800 font-medium">{t("pierre_map_subtitle")}</p>
                            </div>
                            
                            {/* Map Styled as Kitchen Counter with Parallax */}
                            <motion.div 
                                style={{ 
                                    y: useTransform(scrollYProgress, [0.1, 0.4], [30, -30]) 
                                }}
                                whileHover={{ 
                                    y: -40, 
                                    boxShadow: "0 40px 80px rgba(251,146,60,0.2)",
                                    borderColor: "rgba(251,146,60,0.3)"
                                }}
                                className="w-full max-w-[1200px] bg-white/60 backdrop-blur-xl rounded-[3.5rem] p-6 md:p-10 shadow-[0_20px_60px_rgba(251,146,60,0.1)] border border-white/80 relative overflow-hidden group transition-all duration-500"
                            >
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 via-orange-200 to-orange-400 opacity-60" />
                                <FranceMap
                                    onSelectDish={(dishId: string) => {
                                        const dish = DISHES.find((d) => d.id === dishId);
                                        if (dish) {
                                            setSelectedDish(dish);
                                            setMood("happy");
                                        }
                                        document.getElementById("cooking-lab")?.scrollIntoView({ behavior: "smooth" });
                                    }}
                                />
                            </motion.div>
                        </motion.div>

                        {/* RIGHT: CHATBOX PANEL CONTAINER */}
                        <motion.div 
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="lg:col-span-3 space-y-8"
                        >
                            <div className="sticky top-24 mr-2">
                                <div className="glass-panel group relative bg-white/80 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-white/80 overflow-hidden w-full h-[600px] flex flex-col">
                                    {/* PREMIUM HEADER - KEEP THIS ONLY */}
                                    <div className="px-6 py-5 border-b border-slate-100/50 flex items-center justify-between bg-white/40 sticky top-0 z-20">
                                        <div className="flex items-center gap-4">
                                            {/* Apple-style Avatar */}
                                            <div className="relative w-11 h-11 rounded-full overflow-hidden ring-2 ring-orange-400/60 bg-white shadow-sm ring-offset-2 ring-offset-white">
                                                <Image 
                                                    src="/characters/pierre/idle.png" 
                                                    alt="Chef Pierre" 
                                                    fill 
                                                    className="object-cover scale-125" 
                                                    onError={(e) => {
                                                        const target = e.target as any;
                                                        target.src = "/characters/pierre_happy.png";
                                                    }}
                                                />
                                            </div>
                                            
                                            {/* Text Content */}
                                            <div className="flex flex-col">
                                                <h4 className="font-black text-slate-900 text-[17px] tracking-tight leading-none">
                                                    Chef Pierre
                                                </h4>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-[10px] font-black tracking-[0.15em] text-slate-400 uppercase leading-none">
                                                        En Cuisine
                                                    </span>
                                                    <span className="flex h-2 w-2 relative">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 min-h-0 bg-slate-50/20">
                                        <ChatBox
                                            agentName="pierre"
                                            topic="French cuisine and ingredients"
                                            agentColor="bg-orange-500"
                                            onMoodChange={(m) => setMood(m)}
                                            context={{
                                                selectedDish: selectedDish ? {
                                                    name: selectedDish.name,
                                                    ingredients: selectedDish.requiredIngredients,
                                                    region: selectedDish.region,
                                                    description: selectedDish.description
                                                } : null,
                                                potIngredients: pot
                                            }}
                                        />
                                    </div>
                                </div>
                                <ChefQuote quote={CHEF_QUOTES[2]} className="mt-8 mx-auto -rotate-2" />
                            </div>
                        </motion.div>

                    </div>
                </SectionWrapper>

                {/* SECTION 3 — CHOOSE DISH */}
                <SectionWrapper id="dishes" className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-black text-orange-950 mb-2">{t("pierre_dishes_title")}</h2>
                        <p className="text-lg text-orange-800 font-medium">{t("pierre_dishes_subtitle")}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {DISHES.map((dish, idx) => (
                            <motion.button
                                key={dish.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ 
                                    scale: 1.05, 
                                    rotate: 1, 
                                    y: -10,
                                    borderColor: "rgba(251, 146, 60, 0.5)",
                                    boxShadow: "0 20px 40px rgba(251, 146, 60, 0.3)"
                                }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setSelectedDish(dish);
                                    setMood("happy");
                                    document.getElementById("cooking-lab")?.scrollIntoView({ behavior: "smooth" });
                                }}
                                className={`flex flex-col items-center p-8 rounded-[2.5rem] shadow-xl border-4 border-white/40 transition-all group relative overflow-hidden ${dish.flagColor} min-h-[420px]`}
                            >
                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                
                                <div className="w-40 h-40 relative mb-8 rounded-full overflow-hidden shadow-2xl border-8 border-white group-hover:scale-110 transition-transform duration-500 bg-white">
                                    <Image src={dish.image} alt={dish.name} fill className="object-cover" />
                                </div>
                                
                                <h3 className="text-3xl font-black mb-2 tracking-tight line-clamp-1">{dish.name}</h3>
                                <span className="px-4 py-1.5 bg-black/10 backdrop-blur-md rounded-full text-sm font-black uppercase tracking-widest mb-4">
                                    {dish.region}
                                </span>
                                <p className="text-sm font-medium leading-relaxed opacity-90 line-clamp-3">
                                    {dish.description}
                                </p>

                                <div className="mt-auto pt-6 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2 translate-y-4 group-hover:translate-y-0 text-xs font-black uppercase tracking-widest bg-white/20 px-6 py-2.5 rounded-full">
                                    Cook This <Utensils className="w-4 h-4" />
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </SectionWrapper>

                {/* SECTION 4 — COOKING LAB */}
                <SectionWrapper id="cooking-lab" className="max-w-7xl mx-auto">
                    <div className="bg-white/40 backdrop-blur-2xl rounded-[3.5rem] p-8 md:p-14 border border-white/60 shadow-[0_30px_80px_rgba(0,0,0,0.06)] relative overflow-hidden">
                        
                        <div className="absolute top-10 left-10 opacity-10 pointer-events-none">
                            <Utensils className="w-32 h-32 text-orange-950" />
                        </div>

                        {/* Steam Animation Elements */}
                        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-white/30 to-transparent pointer-events-none opacity-40 blur-3xl animate-pulse" />
                        
                        <div className="relative z-10">
                            {!selectedDish ? (
                                <div className="flex flex-col items-center text-center py-20">
                                    <div className="w-32 h-32 bg-orange-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                        <Utensils className="w-16 h-16 text-orange-400" />
                                    </div>
                                    <h3 className="text-3xl font-black text-orange-900 mb-2">Ready to cook?</h3>
                                    <p className="text-orange-800 font-medium">Select a dish from the map or the list above to start your culinary adventure!</p>
                                </div>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="grid grid-cols-1 lg:grid-cols-2 gap-16"
                                >
                                    {/* Lab Interface */}
                                    <div className="space-y-8">
                                        <div>
                                            <div className="flex justify-between items-center mb-6">
                                                <h2 className="text-4xl font-black text-orange-950 leading-tight">
                                                    {language === 'en' ? "Cuisinons" : "Cuisinons"} <span className="text-orange-600 block">{selectedDish.name}</span>
                                                </h2>
                                                <motion.button 
                                                    whileHover={{ rotate: 180 }}
                                                    onClick={handleReset} 
                                                    className="p-3 bg-white rounded-2xl shadow-md border border-orange-100 text-orange-500 hover:bg-orange-50 transition-colors"
                                                >
                                                    <RefreshCw className="w-6 h-6" />
                                                </motion.button>
                                            </div>
                                            
                                            <p className="text-orange-900 font-medium mb-8">
                                                {language === 'en' 
                                                    ? `Select carefully... this dish needs exactly ${selectedDish.requiredIngredients.length} ingredients.` 
                                                    : `Sélectionnez avec soin... ce plat a besoin de ${selectedDish.requiredIngredients.length} ingrédients exactement.`}
                                            </p>

                                            <div className="flex flex-wrap gap-2 mb-8">
                                                {ALL_INGREDIENTS.map((item) => {
                                                    const isSelected = pot.includes(item);
                                                    return (
                                                        <motion.button
                                                            key={item}
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => handleToggleIngredient(item)}
                                                            className={`px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-wider transition-all border-2 ${
                                                                isSelected
                                                                    ? "bg-orange-600 text-white border-orange-700 shadow-lg scale-110 z-10"
                                                                    : "bg-white text-orange-900 border-orange-100 hover:border-orange-300"
                                                            }`}
                                                        >
                                                            {item}
                                                        </motion.button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cooking Pot Area */}
                                    <div className="flex flex-col h-full">
                                        <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-[2.5rem] border border-orange-200 p-8 flex-1 flex flex-col items-center justify-center relative group min-h-[400px]">
                                            {/* Decorative Steam */}
                                            {cookingState === "cooking" && (
                                                <div className="absolute inset-0 pointer-events-none">
                                                    {[...Array(5)].map((_, i) => (
                                                        <motion.div
                                                            key={i}
                                                            initial={{ y: "80%", opacity: 0, x: `${40 + Math.random() * 20}%` }}
                                                            animate={{ y: "-10%", opacity: [0, 0.4, 0], scale: [1, 2] }}
                                                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                                                            className="absolute w-8 h-8 rounded-full bg-white/60 blur-xl"
                                                        />
                                                    ))}
                                                </div>
                                            )}

                                            <AnimatePresence mode="wait">
                                                {cookingState === "cooking" ? (
                                                    <motion.div 
                                                        key="cooking"
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0 }}
                                                        className="text-center"
                                                    >
                                                        <div className="relative">
                                                            <div className="text-8xl mb-6 animate-bounce">🍲</div>
                                                            <motion.div 
                                                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                                className="absolute -inset-4 bg-orange-400/20 blur-3xl rounded-full z-[-1]"
                                                            />
                                                        </div>
                                                        <p className="text-2xl font-black text-orange-900 tracking-tight">Chef Pierre is cooking...</p>
                                                    </motion.div>
                                                ) : cookingState === "success" ? (
                                                    <motion.div 
                                                        key="success"
                                                        initial={{ scale: 0.8, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        className="text-center"
                                                    >
                                                        <div className="w-56 h-56 relative mx-auto mb-8 rounded-full border-8 border-orange-400 overflow-hidden shadow-2xl">
                                                            <Image src={selectedDish.image} alt="Dish" fill className="object-cover" />
                                                        </div>
                                                        <h3 className="text-4xl font-black text-orange-600 mb-2">Magnifique!</h3>
                                                        <p className="font-bold text-orange-900 mb-8 px-4">You cooked the perfect {selectedDish.name}!</p>
                                                        <motion.button 
                                                            whileHover={{ scale: 1.05 }}
                                                            onClick={handleReset}
                                                            className="bg-orange-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-orange-700 transition-colors"
                                                        >
                                                            Cook Another?
                                                        </motion.button>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div key="idle" className="w-full text-center">
                                                        <div className="flex flex-wrap gap-4 justify-center mb-10 min-h-[100px] items-center">
                                                            {pot.length === 0 ? (
                                                                <p className="text-orange-950/30 font-black text-3xl italic tracking-tighter">Ton chaudron est vide...</p>
                                                            ) : (
                                                                pot.map((ing, i) => (
                                                                    <motion.span 
                                                                        key={ing}
                                                                        initial={{ scale: 0, rotate: -20 }}
                                                                        animate={{ scale: 1, rotate: 0 }}
                                                                        className="text-5xl drop-shadow-lg"
                                                                    >
                                                                        {ing.split(" ")[0]}
                                                                    </motion.span>
                                                                ))
                                                            )}
                                                        </div>
                                                        
                                                        {pot.length > 0 && (
                                                            <motion.button
                                                                whileHover={{ scale: 1.02, y: -2 }}
                                                                whileTap={{ scale: 0.98 }}
                                                                onClick={handleCook}
                                                                className="w-full max-w-sm bg-orange-600 text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-orange-200 hover:bg-orange-700 transition-all text-xl uppercase tracking-widest"
                                                            >
                                                                Cook {selectedDish.name.split(' ')[0]}!
                                                            </motion.button>
                                                        )}

                                                        {cookingState === "fail" && (
                                                            <motion.div 
                                                                initial={{ y: 10, opacity: 0 }}
                                                                animate={{ y: 0, opacity: 1 }}
                                                                className="mt-6 p-4 bg-red-50 border-2 border-red-100 rounded-2xl text-red-900 font-bold"
                                                            >
                                                                {feedback}
                                                            </motion.div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </SectionWrapper>

                {/* Final Footer Spacer with Quote */}
                <div className="h-80 flex items-center justify-center relative overflow-hidden">
                    <ChefQuote quote={CHEF_QUOTES[3]} className="scale-110 shadow-2xl z-20" />
                    <div className="absolute inset-0 bg-gradient-to-t from-orange-100/40 to-transparent pointer-events-none" />
                </div>
            </main>
        </div>
    );
}
