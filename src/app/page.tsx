"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Utensils, BookOpen, MapPin, Hourglass, ArrowRight } from "lucide-react";

export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });

  // Parallax and fade effects for Section 1
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const textY = useTransform(scrollYProgress, [0, 0.2], ["0%", "150%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  const agents = [
    {
      id: "chef-pierre",
      name: "Chef Pierre",
      role: "Culinary Expert",
      description: "Master the art of French cuisine. Cook classic regional dishes and learn secret recipes.",
      icon: <Utensils className="w-10 h-10 text-orange-500" />,
      color: "from-orange-400 to-red-500",
      bgClass: "bg-orange-50",
      link: "/pierre",
      delay: 0.1,
    },
    {
      id: "teacher-claire",
      name: "Teacher Claire",
      role: "Language Guide",
      description: "Perfect your pronunciation and learn essential vocabulary for your French adventure.",
      icon: <BookOpen className="w-10 h-10 text-blue-500" />,
      color: "from-blue-400 to-cyan-500",
      bgClass: "bg-blue-50",
      link: "/claire",
      delay: 0.2,
    },
    {
      id: "guide-louis",
      name: "Guide Louis",
      role: "Travel Connoisseur",
      description: "Navigate the winding streets of Paris and uncover hidden gems across the country.",
      icon: <MapPin className="w-10 h-10 text-emerald-500" />,
      color: "from-emerald-400 to-green-500",
      bgClass: "bg-emerald-50",
      link: "/louis",
      delay: 0.3,
    },
    {
      id: "historian-marie",
      name: "Historian Marie",
      role: "Time Traveler",
      description: "Unravel the rich tapestry of French history, from the Revolution to the Renaissance.",
      icon: <Hourglass className="w-10 h-10 text-purple-500" />,
      color: "from-purple-400 to-pink-500",
      bgClass: "bg-purple-50",
      link: "/marie",
      delay: 0.4,
    },
  ];

  return (
    <main ref={containerRef} className="relative bg-[#020617] text-white min-h-screen overflow-x-hidden selection:bg-blue-500 selection:text-white">

      {/* SECTION 1 - OPENING SCENE */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Parallax Background */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{ y: bgY }}
        >
          <Image
            src="/images/paris_skyline.png"
            alt="Paris Skyline"
            fill
            className="object-cover object-bottom"
            priority
          />
          {/* French Flag Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/60 via-transparent to-red-900/60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent" />
        </motion.div>

        {/* Hero Text */}
        <motion.div
          className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center"
          style={{ y: textY, opacity: textOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-6 inline-flex items-center gap-3 px-6 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md"
          >
            <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-sm font-semibold tracking-widest uppercase">The Ultimate AI Experience</span>
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tight mb-6"
          >
            Bienvenue to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-red-400">
              France-AI
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-xl md:text-2xl text-slate-300 max-w-2xl font-light leading-relaxed"
          >
            Explore French culture, cuisine, language and history through immersive interactive journeys led by expert AI guides.
          </motion.p>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        >
          <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Scroll to Discover</span>
          <div className="w-[1px] h-12 bg-white/20 overflow-hidden">
            <motion.div
              animate={{ y: [0, 48, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-full h-1/2 bg-blue-400"
            />
          </div>
        </motion.div>
      </section>

      {/* SECTION 2 - DISCOVER FRANCE MAP SCENE */}
      <section className="relative w-full py-32 px-4 bg-[#020617] flex flex-col items-center overflow-hidden">
        <div className="max-w-6xl w-full mx-auto text-center mb-16 relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            A Country of <span className="text-blue-400 font-serif italic">Elegançe</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto"
          >
            From the lavender fields of Provence to the historic streets of Paris, embark on a digital journey across the diverse regions of France.
          </motion.p>
        </div>

        <div className="relative w-full max-w-5xl mx-auto aspect-square md:aspect-video rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/20 border border-white/10 group">
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Image
              src="/images/stylized_france_map.png"
              alt="Map of France"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[#020617]/20 group-hover:bg-transparent transition-colors duration-700" />
          </motion.div>

          {/* Floating Map Elements */}
          <FloatingElement delay={0} emoji="🍷" top="30%" left="25%" label="Bordeaux" />
          <FloatingElement delay={2} emoji="🥐" top="20%" left="50%" label="Paris" />
          <FloatingElement delay={1} emoji="🧀" top="60%" left="70%" label="Provence" />
          <FloatingElement delay={3} emoji="🥖" top="45%" left="40%" label="Lyon" />
        </div>
      </section>

      {/* SECTION 3 - MEET THE AI GUIDES */}
      <section className="relative w-full py-32 px-4 bg-slate-900 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl mix-blend-screen -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-red-600/20 rounded-full blur-3xl mix-blend-screen translate-x-1/2 translate-y-1/2" />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">Meet Your Local <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Guides</span></h2>
            <p className="text-xl text-slate-400">Four specialized AI personas waiting to show you around.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {agents.map((agent) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: agent.delay }}
              >
                <Link href={agent.link} className="block h-full">
                  <div className={`relative h-full rounded-3xl p-8 overflow-hidden bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 transition-all duration-500 group flex flex-col items-center text-center`}>

                    {/* Hover Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${agent.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                    <div className={`w-24 h-24 rounded-full flex items-center justify-center bg-slate-900 shadow-inner mb-6 group-hover:scale-110 transition-transform duration-500 relative z-10 border border-slate-700 group-hover:border-slate-500`}>
                      {agent.icon}
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2 relative z-10 group-hover:text-blue-300 transition-colors">{agent.name}</h3>
                    <p className={`text-xs font-bold uppercase tracking-widest mb-6 relative z-10 text-transparent bg-clip-text bg-gradient-to-r ${agent.color}`}>
                      {agent.role}
                    </p>

                    <p className="text-slate-400 leading-relaxed flex-grow relative z-10 group-hover:text-slate-300 transition-colors">
                      {agent.description}
                    </p>

                    <div className="mt-8 flex items-center justify-center w-12 h-12 rounded-full bg-slate-700/50 group-hover:bg-blue-600 transition-colors duration-300">
                      <ArrowRight className="w-5 h-5 text-white transform group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 - EXPLORE INTERACTIVE EXPERIENCES */}
      <section className="relative w-full py-32 px-4 bg-[#020617]">
        <div className="max-w-6xl mx-auto space-y-32">

          {/* Experience Block 1 */}
          <ExperienceBlock
            direction="left"
            title="Cook Like a Pro"
            subtitle="Cuisine Focus"
            description="Step into Chef Pierre's kitchen. Drag and drop authentic ingredients to recreate iconic regional dishes like Coq au Vin or a perfect Ratatouille. Learn the secrets of French gastronomy interactively."
            color="orange"
            agentLink="/pierre"
          />

          {/* Experience Block 2 */}
          <ExperienceBlock
            direction="right"
            title="Master the Language"
            subtitle="Linguistic Journey"
            description="Converse with Teacher Claire in real-time. Practice your pronunciation, learn common phrases, and understand the beautiful nuances of the French language through engaging dialogues."
            color="blue"
            agentLink="/claire"
          />

          {/* Experience Block 3 */}
          <ExperienceBlock
            direction="left"
            title="Wander Through Paris"
            subtitle="Virtual Exploration"
            description="Join Guide Louis on a beautifully crafted interactive map. Click to visit the Louvre, stroll down the Champs-Élysées, and discover the hidden stories of the City of Light."
            color="emerald"
            agentLink="/louis"
          />

        </div>
      </section>

      {/* SECTION 5 - CALL TO ACTION */}
      <section className="relative w-full min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#020617] to-blue-950 px-4">
        {/* Animated Background Elements */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: "120vh", x: Math.random() * 100 - 50 + "vw", rotate: 0, opacity: 0.1 }}
            animate={{
              y: "-20vh",
              x: Math.random() * 100 - 50 + "vw",
              rotate: 360,
              opacity: [0.1, 0.4, 0.1]
            }}
            transition={{
              duration: Math.random() * 10 + 15,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * -15
            }}
            className="absolute text-4xl select-none"
          >
            {["🥐", "🥖", "🍷", "🧀", "🎨", "🇫🇷"][i % 6]}
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-3xl glass p-12 md:p-20 rounded-[3rem] border border-white/20 bg-slate-900/40 backdrop-blur-xl shadow-2xl"
        >
          <h2 className="text-5xl md:text-7xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-white to-red-300">
            Prêt à Partir?
          </h2>
          <p className="text-xl md:text-2xl text-slate-300 mb-12 font-light">
            Your interactive French adventure is waiting. Dive in and explore the beauty of France today.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/pierre">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-blue-900 font-bold rounded-full text-lg shadow-lg hover:shadow-xl hover:shadow-white/20 transition-all w-full sm:w-auto"
              >
                Start Exploring
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}

// Helper component for floating map elements
function FloatingElement({ delay, emoji, top, left, label }: { delay: number, emoji: string, top: string, left: string, label: string }) {
  return (
    <motion.div
      animate={{ y: [0, -15, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
      className="absolute flex flex-col items-center gap-2 group z-20 cursor-pointer"
      style={{ top, left }}
    >
      <div className="w-12 h-12 md:w-16 md:h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl md:text-3xl border border-white/30 shadow-xl group-hover:scale-110 group-hover:bg-white/20 transition-all">
        {emoji}
      </div>
      <div className="px-3 py-1 bg-slate-900/80 backdrop-blur-sm rounded-full text-xs font-bold text-white border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {label}
      </div>
    </motion.div>
  );
}

// Helper component for interactive experience blocks
function ExperienceBlock({ direction, title, subtitle, description, color, agentLink }: any) {
  const isLeft = direction === "left";

  // Tailwind PurgeCSS safe mapping
  const colorMap: any = {
    orange: {
      bgSub: "bg-orange-500/10",
      textSub: "text-orange-400",
      borderSub: "border-orange-500/20",
      textHover: "group-hover:text-orange-400",
      gradient: "from-orange-900/40",
      overlay: "bg-orange-500",
      icon: "🍲"
    },
    blue: {
      bgSub: "bg-blue-500/10",
      textSub: "text-blue-400",
      borderSub: "border-blue-500/20",
      textHover: "group-hover:text-blue-400",
      gradient: "from-blue-900/40",
      overlay: "bg-blue-500",
      icon: "💬"
    },
    emerald: {
      bgSub: "bg-emerald-500/10",
      textSub: "text-emerald-400",
      borderSub: "border-emerald-500/20",
      textHover: "group-hover:text-emerald-400",
      gradient: "from-emerald-900/40",
      overlay: "bg-emerald-500",
      icon: "🗺️"
    }
  };

  const theme = colorMap[color] || colorMap.blue;

  return (
    <div className={`flex flex-col ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12 md:gap-24`}>
      {/* Content Side */}
      <motion.div
        initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="flex-1 space-y-6 text-center md:text-left"
      >
        <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold uppercase tracking-widest ${theme.bgSub} ${theme.textSub} border ${theme.borderSub}`}>
          {subtitle}
        </div>
        <h3 className="text-4xl md:text-5xl font-bold leading-tight">{title}</h3>
        <p className="text-xl text-slate-400 font-light leading-relaxed">
          {description}
        </p>
        <Link href={agentLink} className="inline-flex items-center gap-2 text-white font-semibold group mt-4">
          <span className="relative overflow-hidden">
            <span className="block transition-transform duration-300 group-hover:-translate-y-full">Enter Experience</span>
            <span className={`absolute inset-0 block ${theme.textSub} transition-transform duration-300 translate-y-full group-hover:translate-y-0`}>Enter Experience</span>
          </span>
          <ArrowRight className={`w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 ${theme.textHover}`} />
        </Link>
      </motion.div>

      {/* Visual Placeholder Side (Abstract aesthetic representation) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex-1 w-full"
      >
        <div className={`w-full aspect-square md:aspect-[4/3] rounded-[2.5rem] bg-gradient-to-br ${theme.gradient} to-slate-900 border ${theme.borderSub} shadow-2xl relative overflow-hidden group flex items-center justify-center`}>
          <div className={`absolute inset-0 ${theme.overlay} mix-blend-overlay opacity-20 group-hover:opacity-40 transition-opacity duration-700`} />
          {/* Abstract decorative circles */}
          <div className={`absolute -right-20 -top-20 w-64 h-64 ${theme.bgSub} rounded-full blur-3xl`} />
          <div className={`absolute -left-20 -bottom-20 w-64 h-64 bg-slate-500/20 rounded-full blur-3xl`} />

          <div className={`w-32 h-32 rounded-3xl bg-slate-900 border ${theme.borderSub} shadow-2xl flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform duration-500`}>
            <div className={`text-5xl`}>
              {theme.icon}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
