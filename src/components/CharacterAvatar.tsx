"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export type Mood = "idle" | "listening" | "thinking" | "responding" | "happy" ;

interface CharacterAvatarProps {
  agentName: string;
  mood: Mood;
  color?: string;
  displayName?: string;
  isHero?: boolean;
}

const expressionMap: Record<string, Record<Mood, string>> = {
  pierre: {
    idle: "/characters/pierre_neutral.png",
    listening: "/characters/pierre_happy.png",
    thinking: "/characters/pierre_thinking.png",
    responding: "/characters/pierre_happy.png",
    happy: "/characters/pierre_happy.png",
  },
  claire: {
    idle: "/characters/claire_neutral.png",
    listening: "/characters/claire_happy.png",
    thinking: "/characters/claire_thinking.png",
    responding: "/characters/claire_neutral.png",
    happy: "/characters/claire_happy.png",
  },
  louis: {
    idle: "/characters/louis_neutral.png",
    listening: "/characters/louis_happy.png",
    thinking: "/characters/louis_thinking.png",
    responding: "/characters/louis_happy.png",
    happy: "/characters/louis_happy.png",
  },
  marie: {
    idle: "/characters/marie_neutral.png",
    listening: "/characters/marie_happy.png",
    thinking: "/characters/marie_thinking.png",
    responding: "/characters/marie_neutral.png",
    happy: "/characters/marie_happy.png",
  },
};

export default function CharacterAvatar({ agentName, mood, color = "bg-blue-500", displayName = "", isHero = false }: CharacterAvatarProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { t, language } = useLanguage();

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

  // Special case for Pierre: if mood is happy/idle we use the full-body original mascot (if it's already copied)
  // Actually, for the "large presence" the user mentioned "large character avatar", maybe I should use the full-body Pierre for Pierre's page specifically.
  // But Pierre's large mascot may look weird if others are Memojis.
  // Let's stick with the user's intent to keep them visually alive and interactive.

  return (
    <div className="relative flex items-center justify-center p-8 group">
      {/* Background Glow */}
      <motion.div
        className={`absolute inset-0 rounded-full blur-[100px] opacity-20 ${color}`}
        animate={{
          scale: mood === "thinking" ? [1, 1.2, 1] : 1,
          opacity: mood === "thinking" ? [0.2, 0.4, 0.2] : 0.2,
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
          {/* Continuous Particles (Floating Orbs) */}
          {mounted && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`absolute w-4 h-4 rounded-full blur-md opacity-40 ${color}`}
                  animate={{
                    x: [Math.random() * 200 - 100, Math.random() * 200 - 100],
                    y: [Math.random() * 200 - 100, Math.random() * 200 - 100],
                    scale: [1, 1.5, 1],
                    opacity: [0.2, 0.4, 0.2],
                  }}
                  transition={{
                    duration: 5 + Math.random() * 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                  }}
                />
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={mood}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ duration: 0.4 }}
              className={`relative ${isHero ? 'w-full h-full' : 'w-72 h-72 md:w-96 md:h-96'}`}
            >
              {/* Special Image Handling for Pierre (Full-body) */}
              <Image
                src={agentName === 'pierre' && (mood === 'idle' || mood === 'happy' || mood === 'responding') ? '/characters/pierre.png' : currentImage}
                alt={displayName}
                fill
                className={`object-contain pointer-events-none drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] ${isBlinking ? 'brightness-95' : ''}`}
                priority
              />
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
