"use client";

import React from "react";
import { motion } from "framer-motion";

const emojis = ["🥖", "🧀", "🍷", "🥐", "⛲️", "🏰", "🗼", "🎨", "🎭", "👒", "🇫🇷", "🥖", "🥐", "🍮"];

const FloatingEmoji = ({ emoji, index }: { emoji: string; index: number }) => {
  const randomX = Math.random() * 100;
  const randomDelay = Math.random() * 20;
  const randomDuration = 15 + Math.random() * 20;
  const randomSize = 20 + Math.random() * 30;

  return (
    <motion.div
      initial={{ y: "110vh", x: `${randomX}vw`, opacity: 0 }}
      animate={{
        y: "-10vh",
        opacity: [0, 0.4, 0.6, 0.4, 0],
        x: [`${randomX}vw`, `${randomX + (Math.random() * 10 - 5)}vw`],
      }}
      transition={{
        duration: randomDuration,
        repeat: Infinity,
        delay: randomDelay,
        ease: "linear",
      }}
      className="fixed pointer-events-none z-0"
      style={{ fontSize: randomSize }}
    >
      {emoji}
    </motion.div>
  );
};

const FloatingEmojis = () => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0 opacity-40">
      {emojis.map((emoji, i) => (
        <FloatingEmoji key={i} emoji={emoji} index={i} />
      ))}
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />
    </div>
  );
};

export default FloatingEmojis;
