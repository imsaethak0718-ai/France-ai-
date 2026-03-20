"use client";

import { useState } from "react";
import Link from "next/link";
import ChatBox from "@/components/ChatBox";
import { ArrowLeft, Utensils, CheckCircle2, RefreshCw, Map } from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
import CharacterAvatar, { Mood } from "@/components/CharacterAvatar";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import FloatingEmojis from "@/components/FloatingEmojis";

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
    "🥖 Baguette",
    "🧀 Cheese",
    "🍗 Chicken",
    "🍷 Wine",
    "🧅 Onion",
    "🌿 Herbs",
    "🍆 Eggplant",
    "🍅 Tomato",
    "🍄 Mushroom",
    "🥔 Potato",
    "🥕 Carrot",
    "🧈 Butter",
    "🥚 Egg",
    "🥓 Bacon",
    "🐟 Fish",
    "🍎 Apple",
    "🥐 Pastry",
    "🫘 Beans",
    "🥛 Milk",
    "🌾 Flour",
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

export default function PierreLab() {
    const { t, language } = useLanguage();
    const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
    const [pot, setPot] = useState<string[]>([]);
    const [cookingState, setCookingState] = useState<"idle" | "cooking" | "success" | "fail">("idle");
    const [feedback, setFeedback] = useState("");
    const [mood, setMood] = useState<Mood>("idle");

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

                // Intelligent Hinting Logic
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
        <div className="min-h-screen bg-orange-50/50 py-10 px-4 relative overflow-hidden">
            <FloatingEmojis />
            
            {/* Top Navigation */}
            <nav className="fixed top-6 right-6 z-50 flex items-center gap-4">
                <LanguageToggle />
            </nav>

            <div className="max-w-6xl mx-auto space-y-12 relative z-10">
                <header className="flex items-center gap-4">
                    <Link href="/" className="p-2 bg-white rounded-full shadow hover:scale-105 transition-transform border border-orange-100">
                        <ArrowLeft className="text-slate-600" />
                    </Link>
                    <h1 className="text-4xl font-bold text-orange-600 flex items-center gap-3">
                        <div className="relative w-16 h-16 rounded-full border-2 border-orange-200 bg-white shadow-md overflow-hidden">
                            <Image src="/characters/pierre_happy.png" alt="Chef Pierre" fill className="object-cover scale-110" /> 
                        </div> {t("pierre_title")}
                    </h1>
                </header>

                <section className="w-full">
                    <div className="glass rounded-3xl p-8 shadow-sm bg-white/40 backdrop-blur-md border border-white/40">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Map className="w-6 h-6 text-orange-500" /> {t("pierre_map_title")}
                        </h2>
                        <p className="text-slate-600 mb-6">{t("pierre_map_subtitle")}</p>

                        <FranceMap
                            onSelectDish={(dishId: string) => {
                                const dish = DISHES.find((d) => d.id === dishId);
                                if (dish) setSelectedDish(dish);

                                document
                                    .getElementById("cooking-lab")
                                    ?.scrollIntoView({ behavior: "smooth" });
                            }}
                        />

                    </div>
                </section>

                <section id="cooking-lab" className="grid grid-cols-1 xl:grid-cols-12 gap-10 pt-4">
                    {/* Character Presence */}
                    <div className="xl:col-span-4 hidden xl:flex flex-col items-center justify-center sticky top-24 h-fit">
                        <CharacterAvatar 
                            agentName="pierre" 
                            mood={mood} 
                            color="bg-orange-500" 
                            displayName="Chef Pierre" 
                        />
                    </div>

                    <div className="xl:col-span-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="space-y-8">
                            <div className="glass rounded-3xl p-8 shadow-sm">
                                {!selectedDish ? (
                                    <>
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="relative w-16 h-16 rounded-full border-2 border-orange-200 bg-white overflow-hidden shadow-md">
                                                <Image src="/characters/pierre_happy.png" alt="Chef Pierre" fill className="object-cover scale-110" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-slate-800 mb-1">{t("pierre_dishes_title")}</h2>
                                                <p className="text-slate-600">{t("pierre_dishes_subtitle")}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full min-h-[400px] rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
                                            {DISHES.map((dish) => (
                                                <button
                                                    key={dish.id}
                                                    onClick={() => {
                                                        setSelectedDish(dish);
                                                        setMood("happy");
                                                    }}
                                                    className={`flex flex-col items-center justify-center p-6 text-center transition-all duration-300 group ${dish.flagColor}`}
                                                >
                                                    <div className="w-24 h-24 relative mb-4 rounded-full overflow-hidden shadow-2xl border-4 border-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 bg-white">
                                                        <Image src={dish.image} alt={dish.name} fill className="object-cover" />
                                                    </div>
                                                    <h3 className="font-bold text-2xl mb-1 drop-shadow-sm">{dish.name}</h3>
                                                    <span className="text-xs font-bold uppercase tracking-widest opacity-90 mb-3 bg-black/10 px-3 py-1 rounded-full">{dish.region}</span>
                                                    <p className="text-sm opacity-95 font-medium leading-relaxed max-w-[200px]">{dish.description}</p>

                                                    <div className="mt-6 uppercase text-xs font-bold tracking-widest bg-black/20 px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                                        Cook This <Utensils className="w-3 h-3" />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-2xl font-bold text-slate-800">
                                                {language === 'en' ? "Let's cook" : "Cuisinons"} <span className="text-orange-600">{selectedDish.name}</span>!
                                            </h2>
                                            <button onClick={handleReset} className="text-sm text-slate-500 hover:text-orange-600 flex items-center gap-1 font-medium bg-white px-3 py-1.5 rounded-full shadow-sm">
                                                <RefreshCw className="w-4 h-4" /> {t("pierre_change")}
                                            </button>
                                        </div>

                                        {cookingState !== "success" ? (
                                            <>
                                                <p className="text-slate-600 mb-4">
                                                    {language === 'en' ? `Add the correct ingredients to the pot. (Hint: this dish requires ${selectedDish.requiredIngredients.length} main ingredients).` : `Ajoutez les bons ingrédients dans la marmite. (Indice : ce plat nécessite ${selectedDish.requiredIngredients.length} ingrédients principaux).`}
                                                </p>

                                                <div className="flex flex-wrap gap-2 mb-8">
                                                    {ALL_INGREDIENTS.map((item) => {
                                                        const isSelected = pot.includes(item);
                                                        return (
                                                            <button
                                                                key={item}
                                                                onClick={() => {
                                                                    handleToggleIngredient(item);
                                                                    setMood("listening");
                                                                }}
                                                                className={`px-4 py-2 shadow-sm border rounded-full font-medium transition-colors ${isSelected
                                                                    ? "bg-orange-500 text-white border-orange-600 scale-105"
                                                                    : "bg-white text-slate-700 border-orange-100 hover:bg-orange-50 hover:border-orange-300"
                                                                    }`}
                                                            >
                                                                {item}
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                <div className="bg-orange-100/50 border border-orange-200 rounded-2xl p-6 min-h-[240px] flex flex-col items-center justify-center text-center relative overflow-hidden">
                                                    {cookingState === "cooking" ? (
                                                        <div className="flex flex-col items-center animate-pulse">
                                                            <span className="text-6xl mb-4 animate-bounce">🍲</span>
                                                            <p className="text-orange-800 font-bold text-lg">{language === 'en' ? 'Chef Pierre is cooking...' : 'Chef Pierre cuisine...'}</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {pot.length === 0 ? (
                                                                <p className="text-orange-900/40 font-semibold mb-2">Your pot is empty.</p>
                                                            ) : (
                                                                <div className="flex flex-wrap gap-3 justify-center mb-6">
                                                                    {pot.map((d) => (
                                                                        <span key={d} className="text-4xl animate-in zoom-in spin-in-12">
                                                                            {d.split(" ")[0]}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {pot.length > 0 && (
                                                                <button
                                                                    onClick={handleCook}
                                                                    className="mt-auto w-full bg-orange-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-orange-700 hover:shadow-lg transition-all active:scale-95"
                                                                >
                                                                    {language === 'en' ? `Cook ${selectedDish.name}!` : `Cuisiner le ${selectedDish.name} !`}
                                                                </button>
                                                            )}

                                                            {cookingState === "fail" && (
                                                                <p className="mt-4 text-red-500 font-bold animate-in slide-in-from-top-2 bg-red-100 p-3 rounded-xl border border-red-200">
                                                                    {feedback}
                                                                </p>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="bg-white border text-center border-orange-100 rounded-2xl p-8 shadow-sm flex flex-col items-center animate-in zoom-in duration-500">
                                                <div className="w-48 h-48 relative rounded-full overflow-hidden shadow-2xl border-4 border-white mb-6">
                                                    <Image src={selectedDish.image} alt={selectedDish.name} fill className="object-cover" />
                                                </div>
                                                <h3 className="text-3xl font-bold text-orange-600 mb-2 flex items-center justify-center gap-2">
                                                    <CheckCircle2 className="w-8 h-8" /> Magnifique!
                                                </h3>
                                                <p className="text-slate-700 font-medium mb-6">
                                                    You successfully cooked <span className="font-bold">{selectedDish.name}</span>! Chef Pierre is very proud.
                                                </p>
                                                <button
                                                    onClick={handleReset}
                                                    className="bg-orange-100 text-orange-700 px-6 py-3 rounded-xl font-bold hover:bg-orange-200 transition-colors"
                                                >
                                                    {t("pierre_reset")}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col items-center lg:items-end gap-8 h-full">
                            <ChatBox
                                agentName="pierre"
                                topic="French cuisine, recipes, and ingredients"
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

                            <div className="glass rounded-3xl p-8 shadow-sm bg-gradient-to-br from-orange-100 to-orange-50 w-full max-w-lg flex flex-col h-[600px] lg:h-auto lg:flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="relative w-16 h-16 rounded-full border-2 border-orange-200 bg-white overflow-hidden shadow-md flex-shrink-0">
                                        <Image src="/characters/pierre_thinking.png" alt="Chef Pierre" fill className="object-cover scale-110" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-orange-900 mb-1">{t("pierre_facts_title")}</h2>
                                        <p className="text-orange-800 font-medium italic">No cap, did you know?</p>
                                    </div>
                                </div>
                                <ul className="space-y-4 overflow-y-auto pr-2 flex-1 scrollbar-thin scrollbar-thumb-orange-200 scrollbar-track-transparent">
                                    {culinaryFacts.map((fact, i) => (
                                        <li key={i} className="flex items-start gap-2 text-slate-700 text-sm">
                                            <span className="text-orange-500 font-bold text-lg">✨</span>
                                            {fact}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>
            </div >
        </div >
    );
}
