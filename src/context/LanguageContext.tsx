"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "fr";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // General
    "back": "Back",
    "switch_lang": "Français",
    "hero_title": "Experience France with AI",
    "hero_subtitle": "A personalized digital trip to the heart of French culture. Learn, cook, explore, and dive into history through your unique AI companions.",
    "explore_agents": "Explore Your AI companions",
    "choose_guide": "Choose your AI guide to start your journey",
    "cta_button": "Start Your Adventure",
    
    // Moods
    "idle": "Active",
    "thinking": "Thinking...",
    "happy": "Happy",
    "listening": "Listening",
    "responding": "Speaking",
    
    // Pierre
    "pierre_title": "Chef Pierre's Cuisine Lab",
    "pierre_desc": "Cook authentic French dishes with a Michelin-star AI chef. Choose a regional specialty, select the perfect ingredients, and master the art of the perfect plate.",
    "pierre_tagline": "Mastering the Art of French Flavor",
    "pierre_map_title": "Interactive Culinary Map",
    "pierre_map_subtitle": "Hover over the map pins to discover regional specialties, then click to cook!",
    "pierre_dishes_title": "Regional Dishes of France",
    "pierre_dishes_subtitle": "Select a famous regional dish from the French Flag to learn how to cook it!",
    "pierre_change": "Change Dish",
    "pierre_facts_title": "Culinary Facts fr 🧢",
    "pierre_fact1": "France produces over 1,500 different types of cheese. The cheese lovers get it 😭.",
    "pierre_fact2": "The word 'Chef' just means 'Boss' in French. Big boss energy.",
    "pierre_fact3": "A traditional French meal is at least three courses. We feast here.",
    "pierre_fact4": "Croissants aren't even originally from France, they're from Austria (the Kipferl). Mind blown 🤯.",
    "pierre_fact5": "It's illegal to throw away unsold food in French supermarkets. W policy.",
    "pierre_build_dish": "Build Your French Dish",
    "pierre_select_dish": "Select a Regional Dish",
    "pierre_ingredients": "The Mixing Pot",
    "pierre_cook": "L'Art de la Cuisine (Cook!)",
    "pierre_reset": "Cook Another Dish",
    "pierre_success": "Magnifique! You successfully cooked",
    "pierre_hint_wrong": "You added something Pierre didn't like! Keep going.",
    "pierre_hint_correct": "Perfect additions! Keep going.",
    
    // Claire
    "claire_title": "Teacher Claire's Learn French",
    "claire_desc": "Learn French through interactive word puzzles and friendly conversation. From basic greetings to common phrases, Claire makes learning effortless and fun.",
    "claire_tagline": "Mastering the Art of Conversation",
    "claire_word_builder": "Word Builder",
    "claire_scrambled_hint": "Unscramble the letters to form a French greeting:",
    "claire_check": "Check",
    "claire_vocab": "Vocabulary Cards",
    "claire_correct": "Correct! It means",
    "claire_wrong": "Almost! Try again.",
    "claire_next": "Next Word",
    "claire_chat_welcome": "Bonjour! I'm Claire 👩‍🏫 Let’s learn French together — try saying *bonjour*!",
    "claire_chat_placeholder": "Learn French with Claire...",
    "claire_atelier_title": "Digital Atelier",
    "claire_atelier_subtitle": "Teacher Claire 🥐",
    "claire_word_builder_title": "Constructeur de Mots",
    "claire_verify_results": "Verify Results",
    "claire_vocab_daily": "Archives de Vocabulaire",
    "claire_vocab_subtitle": "Review words you've already encountered in the atelier.",
    "claire_crossword_title": "🧩 Mini Game: Crossword",
    "claire_grammar_title": "📚 French Grammar Essentials",
    "claire_verbs": "Verbes",
    "claire_possessive": "Possessive Adjectives",
    "claire_demonstrative": "Demonstrative",
    "claire_articles": "Articles",
    "claire_verbs_desc": "Conjugate common verbs like Être, Avoir, and Aller.",
    "claire_poss_desc": "Master ownership in French with gender-specific adjectives.",
    "claire_demon_desc": "Point things out using Ce, Cette, and Ces.",
    "claire_art_desc": "The building blocks of French sentences.",
    "claire_hint_claire": "Think of how you greet someone in French 😊",
    "claire_reveal_letter": "Reveal Letter",
    "claire_check_crossword": "Check Answers",
    
    // Louis
    "louis_title": "Guide Louis's Explore Paris",
    "louis_desc": "Explore Paris's most famous landmarks and plan your perfect trip. From the Eiffel Tower to hidden gems, Louis is your energetic guide to the city of light.",
    "louis_tagline": "Mastering the Art of Exploration",
    "louis_landmarks_title": "Explore Landmarks",
    "louis_landmark_subtitle": "Click a landmark to learn more.",
    "louis_landmark1_name": "Eiffel Tower",
    "louis_landmark1_info": "The iconic iron lattice tower built for the 1889 World's Fair. Global cultural icon of France.",
    "louis_landmark2_name": "Louvre Museum",
    "louis_landmark2_info": "The world's largest art museum and a historic monument in Paris. Home to the Mona Lisa.",
    "louis_landmark3_name": "Notre Dame",
    "louis_landmark3_info": "A medieval Catholic cathedral famous for its French Gothic architecture.",
    "louis_landmark4_name": "Arc de Triomphe",
    "louis_landmark4_info": "Honors those who fought and died for France in the French Revolutionary and Napoleonic Wars.",
    "louis_itinerary_title": "Plan Your Day",
    "louis_itinerary_subtitle": "Need help organizing your trip to Paris?",
    "louis_generate": "Generate Perfect Itinerary",
    "louis_itinerary_ready": "Your Custom Itinerary",
    "louis_itinerary1": "Morning: Visit the Louvre",
    "louis_itinerary2": "Lunch: Café on the Seine",
    "louis_itinerary3": "Afternoon: Explore Montmartre",
    "louis_itinerary4": "Evening: Sunset at the Eiffel Tower",
    
    // Marie
    "marie_title": "Historian Marie's Time Travel",
    "marie_desc": "Step back in time and discover the events that shaped France. From kings and revolutions to modern icons, Marie brings French history to life through interactive storytelling.",
    "marie_tagline": "Mastering the Art of History",
    "marie_timeline_title": "Timeline Slider",
    "marie_timeline_subtitle": "Slide through time to discover major historical events.",
    "marie_event1_title": "Charlemagne Crowned",
    "marie_event1_desc": "800 AD: Charlemagne is crowned Holy Roman Emperor, uniting much of Western Europe.",
    "marie_event2_title": "Hundred Years' War",
    "marie_event2_desc": "1337-1453: Series of conflicts between France and England for the French throne.",
    "marie_event3_title": "French Revolution",
    "marie_event3_desc": "1789: The revolution led to the end of the monarchy and the rise of the Republic.",
    "marie_event4_title": "Eiffel Tower Completed",
    "marie_event4_desc": "1889: Built for the World's Fair, it became the symbol of modern France.",
    "marie_event5_title": "Liberation of Paris",
    "marie_event5_desc": "1944: The end of Nazi occupation during World War II.",
    "marie_game_title": "History Guessing Game",
    "marie_game_hint": "Who am I?",
    "marie_next_hint": "Next Hint",
    "marie_guess": "Guess",
    "marie_correct": "Correct! It was Napoleon Bonaparte.",
    "marie_wrong": "Not quite. Keep guessing or ask for a hint.",
    
    // Chat
    "chat_welcome": "Bonjour! I am {displayName}. Ask me anything about {topic}.",
    "chat_placeholder": "Ask {shortName} about {topic}...",
    "chat_error": "Désolé, I'm having trouble responding. Please try again!",
    "chat_with": "Chat with",
    "chat_companion": "companion",
    "chat_studio": "Studio",
    "chat_history": "Legendary Historian",
    "chat_guide": "Paris Explorer",
    "chat_culinary": "Culinary Legend",
  },
  fr: {
    // General
    "back": "Retour",
    "switch_lang": "English",
    "hero_title": "Découvrez la France avec l'IA",
    "hero_subtitle": "Un voyage numérique personnalisé au cœur de la culture française. Apprenez, cuisinez, explorez et plongez dans l'histoire grâce à vos compagnons IA uniques.",
    "explore_agents": "Explorez vos compagnons IA",
    "choose_guide": "Choisissez votre guide IA pour commencer votre voyage",
    "cta_button": "Commencer l'Aventure",
    
    // Moods
    "idle": "Actif",
    "thinking": "Réflexion...",
    "happy": "Souriant",
    "listening": "À l'écoute",
    "responding": "Réponse en cours",
    
    // Pierre
    "pierre_title": "Le Laboratoire Culinaire du Chef Pierre",
    "pierre_desc": "Cuisinez des plats français authentiques avec un chef IA étoilé au guide Michelin. Choisissez une spécialité régionale, sélectionnez les ingrédients parfaits et maîtrisez l'art de l'assiette parfaite.",
    "pierre_tagline": "Maîtriser l'Art des Saveurs Françaises",
    "pierre_map_title": "Carte Culinaire Interactive",
    "pierre_map_subtitle": "Survolez les points pour découvrir les spécialités, puis cliquez pour cuisiner !",
    "pierre_dishes_title": "Plats Régionaux de France",
    "pierre_dishes_subtitle": "Choisissez un plat célèbre pour apprendre à le cuisiner !",
    "pierre_change": "Changer de plat",
    "pierre_facts_title": "Faits Culinaires 🧢",
    "pierre_fact1": "La France produit plus de 1 500 types de fromages différents. Les amoureux du fromage savent 😭.",
    "pierre_fact2": "Le mot 'Chef' signifie simplement 'Patron'. Une énergie de patron.",
    "pierre_fact3": "Un repas français traditionnel comporte au moins trois plats. C'est un festin.",
    "pierre_fact4": "Les croissants ne viennent pas de France, mais d'Autriche (le Kipferl). Incroyable 🤯.",
    "pierre_fact5": "Il est illégal de jeter les invendus alimentaires en France. Belle politique.",
    "pierre_build_dish": "Créez votre plat français",
    "pierre_select_dish": "Sélectionnez un plat régional",
    "pierre_ingredients": "La Marmite (Ingrédients)",
    "pierre_cook": "L'Art de la Cuisine (Cuisiner !)",
    "pierre_reset": "Cuisiner un autre plat",
    "pierre_success": "Magnifique ! Vous avez réussi à cuisiner",
    "pierre_hint_wrong": "Vous avez ajouté quelque chose que Pierre n'a pas aimé ! Continuez.",
    "pierre_hint_correct": "Ajouts parfaits ! Continuez.",
    
    // Claire
    "claire_title": "Apprenez le français avec Claire",
    "claire_desc": "Apprenez le français grâce à des puzzles de mots interactifs et des conversations amicales. Des salutations de base aux phrases courantes, Claire rend l'apprentissage facile et amusant.",
    "claire_tagline": "Maîtriser l'Art de la Conversation",
    "claire_word_builder": "Constructeur de mots",
    "claire_scrambled_hint": "Démêlez les lettres pour former une salutation française :",
    "claire_check": "Vérifier",
    "claire_vocab": "Cartes de vocabulaire",
    "claire_correct": "Correct ! Cela signifie",
    "claire_wrong": "Presque ! Réessayez.",
    "claire_next": "Mot suivant",
    "claire_chat_welcome": "Bonjour ! Je suis Claire 👩‍🏫 Apprenons le français ensemble — essayez de dire *bonjour* !",
    "claire_chat_placeholder": "Apprendre le français avec Claire...",
    "claire_atelier_title": "Atelier Numérique",
    "claire_atelier_subtitle": "Professeur Claire 🥐",
    "claire_word_builder_title": "Constructeur de Mots",
    "claire_verify_results": "Vérifier les résultats",
    "claire_vocab_daily": "Archives de Vocabulaire",
    "claire_vocab_subtitle": "Révisez les mots que vous avez déjà rencontrés dans l'atelier.",
    "claire_crossword_title": "🧩 Mini-Jeu : Mots Croisés",
    "claire_grammar_title": "📚 L'Essentiel de la Grammaire",
    "claire_verbs": "Verbes",
    "claire_possessive": "Adjectifs Possessifs",
    "claire_demonstrative": "Démonstratifs",
    "claire_articles": "Articles",
    "claire_verbs_desc": "Conjuguez les verbes courants comme Être, Avoir et Aller.",
    "claire_poss_desc": "Maîtrisez la possession en français.",
    "claire_demon_desc": "Désignez des objets avec Ce, Cette et Ces.",
    "claire_art_desc": "Les piliers de la phrase française.",
    "claire_hint_claire": "Pensez à la façon dont vous saluez quelqu'un en français 😊",
    "claire_reveal_letter": "Révéler une lettre",
    "claire_check_crossword": "Vérifier les réponses",
    
    // Louis
    "louis_title": "Explorez Paris avec Louis",
    "louis_desc": "Explorez les monuments les plus célèbres de Paris et planifiez votre voyage parfait. De la Tour Eiffel aux joyaux cachés, Louis est votre guide énergique dans la ville lumière.",
    "louis_tagline": "Maîtriser l'Art de l'Exploration",
    "louis_landmarks_title": "Explorer les Monuments",
    "louis_landmark_subtitle": "Cliquez sur un monument pour en savoir plus.",
    "louis_landmark1_name": "Tour Eiffel",
    "louis_landmark1_info": "La tour emblématique construite pour l'Exposition Universelle de 1889. Symbole de la France.",
    "louis_landmark2_name": "Musée du Louvre",
    "louis_landmark2_info": "Le plus grand musée d'art au monde. Domicile de la Joconde.",
    "louis_landmark3_name": "Notre-Dame",
    "louis_landmark3_info": "Cathédrale médiévale célèbre pour son architecture gothique française.",
    "louis_landmark4_name": "Arc de Triomphe",
    "louis_landmark4_info": "Honore ceux qui ont combattu pour la France pendant la Révolution et l'Empire.",
    "louis_itinerary_title": "Planifiez votre journée",
    "louis_itinerary_subtitle": "Besoin d'aide pour organiser votre visite ?",
    "louis_generate": "Générer l'itinéraire parfait",
    "louis_itinerary_ready": "Votre itinéraire personnalisé",
    "louis_itinerary1": "Matin : Visite du Louvre",
    "louis_itinerary2": "Midi : Déjeuner sur la Seine",
    "louis_itinerary3": "Après-midi : Exploration de Montmartre",
    "louis_itinerary4": "Soir : Coucher de soleil à la Tour Eiffel",
    
    // Marie
    "marie_title": "Le Voyage dans le Temps de Marie",
    "marie_desc": "Remontez le temps et découvrez les événements qui ont façonné la France. Des rois et révolutions aux icônes modernes, Marie fait revivre l'histoire de France grâce à une narration interactive.",
    "marie_tagline": "Maîtriser l'Art de l'Histoire",
    "marie_timeline_title": "Curseur temporel",
    "marie_timeline_subtitle": "Naviguez dans le temps pour découvrir les grands événements historiques.",
    "marie_event1_title": "Sacre de Charlemagne",
    "marie_event1_desc": "800 : Charlemagne est couronné Empereur, unifiant l'Europe occidentale.",
    "marie_event2_title": "Guerre de Cent Ans",
    "marie_event2_desc": "1337-1453 : Conflits entre la France et l'Angleterre pour le trône.",
    "marie_event3_title": "Révolution Française",
    "marie_event3_desc": "1789 : Fin de la monarchie et naissance de la République.",
    "marie_event4_title": "Achèvement de la Tour Eiffel",
    "marie_event4_desc": "1889 : Symbole de la France moderne pour l'Exposition Universelle.",
    "marie_event5_title": "Libération de Paris",
    "marie_event5_desc": "1944 : Fin de l'occupation nazie pendant la Seconde Guerre mondiale.",
    "marie_game_title": "Jeu de Devinettes",
    "marie_game_hint": "Qui suis-je ?",
    "marie_next_hint": "Indice suivant",
    "marie_guess": "Deviner",
    "marie_correct": "Correct ! C'était Napoléon Bonaparte.",
    "marie_wrong": "Presque. Continuez à chercher ou demandez un indice.",
    
    // Chat
    "chat_welcome": "Bonjour ! Je suis {displayName}. Posez-moi vos questions sur {topic}.",
    "chat_placeholder": "Demandez à {shortName} sur {topic}...",
    "chat_error": "Désolé, j'ai du mal à répondre. Veuillez réessayer !",
    "chat_with": "Discuter avec",
    "chat_companion": "compagnon",
    "chat_studio": "Studio",
    "chat_history": "Historienne légendaire",
    "chat_guide": "Explorateur de Paris",
    "chat_culinary": "Légende culinaire",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
