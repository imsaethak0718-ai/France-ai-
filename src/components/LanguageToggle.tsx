"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Languages } from "lucide-react";
import { motion } from "framer-motion";

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setLanguage(language === "en" ? "fr" : "en")}
      className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full border border-slate-200 shadow-sm text-slate-700 font-bold hover:shadow-md transition-all group"
    >
      <Languages className="w-5 h-5 text-blue-500 group-hover:rotate-12 transition-transform" />
      <span>{t("switch_lang")}</span>
    </motion.button>
  );
}
