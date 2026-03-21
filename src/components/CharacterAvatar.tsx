"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export type Mood = "idle" | "listening" | "thinking" | "responding" | "happy" | "greeting" | "explaining" | "excited" | "joking" | "mistake" | "proud";

interface CharacterAvatarProps {
  agentName: string;
  mood: Mood;
  color?: string;
  displayName?: string;
  isHero?: boolean;
}

const expressionMap: Record<string, Partial<Record<Mood, string>>> = {
  pierre: {
    idle: "/characters/pierre/idle.png",
    listening: "/characters/pierre/idle.png",
    thinking: "/characters/pierre/thinking.png",
    happy: "/characters/pierre/excited.png",
    greeting: "/characters/pierre/greeting.png",
    explaining: "/characters/pierre/explaining.png",
    excited: "/characters/pierre/excited.png",
    joking: "/characters/pierre/joking.png",
    mistake: "/characters/pierre/mistake.png",
    proud: "/characters/pierre/proud.png",
  },
  claire: {
    idle: "/characters/claire_neutral.png",
    listening: "/characters/claire_happy.png",
    thinking: "/characters/claire_thinking.png",
    happy: "/characters/claire_happy.png",
  },
  louis: {
    idle: "/characters/louis_neutral.png",
    listening: "/characters/louis_happy.png",
    thinking: "/characters/louis_thinking.png",
    happy: "/characters/louis_happy.png",
  },
  marie: {
    idle: "/characters/marie_neutral.png",
    listening: "/characters/marie_happy.png",
    thinking: "/characters/marie_thinking.png",
    happy: "/characters/marie_happy.png",
  },
};

export default function CharacterAvatar({ agentName, mood, color = "bg-blue-500", displayName = "", isHero = false }: CharacterAvatarProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 4000 + Math.random() * 3000);

    return () => clearInterval(blinkInterval);
  }, []);

  const currentImage = expressionMap[agentName]?.[mood] || `/characters/${agentName}_neutral.png`;

  return (
    <div className="relative flex items-center justify-center p-4 group overflow-visible">
      {/* Background Glow */}
      <motion.div
        className={`absolute inset-0 rounded-full blur-[80px] opacity-15 ${color}`}
        animate={{
          scale: mood === "thinking" ? [1, 1.2, 1] : 1,
          opacity: mood === "thinking" ? [0.15, 0.3, 0.15] : 0.15,
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Floating Animation Wrapper */}
      <motion.div
        animate={{
          y: mood === "thinking" ? [0, -10, 0] : [0, -15, 0],
          rotate: mood === "listening" ? [0, 2, 0] : 0,
        }}
        transition={{
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        }}
        className="relative z-10"
      >
        {/* Breathing Animation Wrapper */}
        <motion.div
          animate={{
            scale: mood === "idle" ? [1, 1.02, 1] : 1,
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          whileHover={{ scale: 1.05 }}
          className="relative"
        >
          {/* Continuous Particles */}
          {mounted && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`absolute w-3 h-3 rounded-full blur-md opacity-30 ${color}`}
                  animate={{
                    x: [Math.random() * 160 - 80, Math.random() * 160 - 80],
                    y: [Math.random() * 160 - 80, Math.random() * 160 - 80],
                    scale: [1, 1.5, 1],
                    opacity: [0.15, 0.3, 0.15],
                  }}
                  transition={{
                    duration: 5 + Math.random() * 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    left: `${30 + Math.random() * 40}%`,
                    top: `${30 + Math.random() * 40}%`,
                  }}
                />
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={mood}
              initial={{ opacity: 0, scale: 0.8, y: 10, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10, rotate: 5 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 20
              }}
              className={`relative overflow-hidden ${isHero ? 'w-[450px] h-[450px]' : 'w-72 h-72 md:w-96 md:h-96'}`}
            >
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image
                  src={currentImage}
                  alt={displayName}
                  fill
                  className={`object-contain pointer-events-none scale-110 drop-shadow-[0_10px_30px_rgba(0,0,0,0.15)] ${isBlinking ? 'brightness-95' : ''}`}
                  style={agentName === 'pierre' ? { mixBlendMode: 'screen' } : {}}
                  priority
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Status Badge */}
          {!isHero && (
            <motion.div 
              className={`absolute -bottom-8 left-1/2 -translate-x-1/2 px-8 py-3 rounded-full border border-white/40 backdrop-blur-xl font-black text-xs text-white shadow-2xl flex items-center gap-3 ${color} uppercase tracking-[0.2em] z-20`}
              animate={{
                y: [0, -8, 0],
                scale: mood === "thinking" ? [1, 1.05, 1] : 1,
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="relative flex items-center justify-center">
                <span className="absolute w-3 h-3 rounded-full bg-white opacity-40 animate-ping" />
                <span className="relative w-2 h-2 rounded-full bg-white" />
              </div>
              <span>{t(mood as any) || mood}</span>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Thinking Bubble / Interaction Elements */}
      {mood === "thinking" && !isHero && (
        <motion.div
  initial={{ opacity: 0, scale: 0 }}
  animate={{ opacity: 1, scale: 1 }}
  className="absolute -top-10 right-0 bg-white shadow-xl rounded-full p-4 border border-slate-100"
>
  <span className="text-2xl">💡</span>
</motion.div>
      )}
    </div>
  );
}
