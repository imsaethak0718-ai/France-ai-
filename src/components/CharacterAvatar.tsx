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
    idle: "/characters/claire/idle.png",
    listening: "/characters/claire/idle.png",
    thinking: "/characters/claire/thinking.png",
    happy: "/characters/claire/happy.png",
    greeting: "/characters/claire/happy.png",
    explaining: "/characters/claire/idle.png",
  },
  louis: {
    idle: "/characters/louis/idle.png",
    listening: "/characters/louis/idle.png",
    thinking: "/characters/louis/thinking.png",
    happy: "/characters/louis/happy.png",
    greeting: "/characters/louis/happy.png",
  },
  marie: {
    idle: "/characters/marie/idle.png",
    listening: "/characters/marie/idle.png",
    thinking: "/characters/marie/thinking.png",
    happy: "/characters/marie/happy.png",
    greeting: "/characters/marie/happy.png",
  },
  amelie: {
    idle: "/characters/amelie/idle.png",
    listening: "/characters/amelie/idle.png",
    thinking: "/characters/amelie/thinking.png",
    happy: "/characters/amelie/happy.png",
    greeting: "/characters/amelie/happy.png",
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

  const currentImage = expressionMap[agentName]?.[mood] || `/characters/${agentName}.png`;

  return (
    <div className={`relative flex items-center justify-center p-4 group ${isHero ? 'w-full' : 'w-48 h-48 md:w-56 md:h-56'}`}>
      {/* Background Glow */}
      <motion.div
        className={`absolute inset-0 rounded-full ${isHero ? 'blur-[80px]' : 'blur-[40px]'} opacity-20 ${color}`}
        animate={{
          scale: mood === "thinking" ? [1, 1.15, 1] : 1,
          opacity: mood === "thinking" ? [0.2, 0.4, 0.2] : 0.2,
        }}
        transition={{ duration: 3, repeat: Infinity }}
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
        className="relative z-10 w-full h-full flex items-center justify-center"
      >
        {/* Breathing Animation Wrapper */}
        <motion.div
          animate={{
            scale: mood === "idle" ? [1, 1.02, 1] : 1,
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          whileHover={{ 
            scale: 1.05,
            filter: "drop-shadow(0 0 25px rgba(255,255,255,0.15))" 
          }}
          className="relative w-full h-full flex items-center justify-center cursor-pointer transition-all duration-500"
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
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="w-full h-full flex items-center justify-center relative"
            >
              <div className={`relative overflow-hidden ${isHero ? 'w-64 h-64 sm:w-80 sm:h-80 md:w-[420px] md:h-[420px]' : 'w-40 h-40 md:w-48 md:h-48'} rounded-full bg-black shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] ring-4 ring-white/10 group-hover:ring-white/20 transition-all`}>
                <Image
                  src={currentImage}
                  alt={displayName}
                  fill
                  className="object-cover pointer-events-none scale-105 drop-shadow-2xl"
                  style={{
                    backgroundColor: 'black'
                  }}
                  priority
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_40%,black_90%)] pointer-events-none" />
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}
