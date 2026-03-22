"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Info, ArrowRight, Navigation, Clock, Landmark } from "lucide-react";

// Fix for default marker icons in Leaflet + Next.js
const customIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

interface Station {
    id: string;
    name: string;
    pos: [number, number];
    lines: string[];
    landmark?: string;
}

interface MetroLine {
    id: string;
    color: string;
    path: [number, number][];
}

const CITY_DATA: Record<string, { stations: Station[], lines: MetroLine[], center: [number, number] }> = {
    paris: {
        center: [48.8625, 2.3364],
        stations: [
            // Line 1
            { id: "laDéfense", name: "La Défense", pos: [48.8919, 2.2381], lines: ["1"], landmark: "Grande Arche" },
            { id: "neuilly", name: "Pont de Neuilly", pos: [48.8845, 2.2581], lines: ["1"] },
            { id: "porteMaillot", name: "Porte Maillot", pos: [48.8776, 2.2825], lines: ["1"] },
            { id: "charles", name: "Charles de Gaulle – Étoile", pos: [48.8738, 2.2950], lines: ["1", "2", "6"], landmark: "Arc de Triomphe" },
            { id: "george", name: "George V", pos: [48.8719, 2.3008], lines: ["1"], landmark: "Champs-Élysées" },
            { id: "concorde", name: "Concorde", pos: [48.8655, 2.3211], lines: ["1", "8", "12"], landmark: "Place de la Concorde" },
            { id: "louvre", name: "Palais Royal - Musée du Louvre", pos: [48.8625, 2.3364], lines: ["1", "7"], landmark: "Musée du Louvre" },
            { id: "chatelet", name: "Châtelet", pos: [48.8584, 2.3472], lines: ["1", "4", "7", "11", "14"] },
            { id: "bastille", name: "Bastille", pos: [48.8531, 2.3691], lines: ["1", "5", "8"], landmark: "Opera Bastille" },
            { id: "nation", name: "Nation", pos: [48.8481, 2.3961], lines: ["1", "2", "6", "9"] },
            // Line 6
            { id: "bir", name: "Bir-Hakeim", pos: [48.8539, 2.2893], lines: ["6"], landmark: "Eiffel Tower" },
            { id: "trocadero", name: "Trocadéro", pos: [48.8633, 2.2871], lines: ["6", "9"], landmark: "Palais de Chaillot" },
            { id: "passy", name: "Passy", pos: [48.8575, 2.2858], lines: ["6"] },
            { id: "montparnasse", name: "Montparnasse – Bienvenüe", pos: [48.8422, 2.3219], lines: ["4", "6", "12", "13"], landmark: "Tour Montparnasse" },
            { id: "italie", name: "Place d'Italie", pos: [48.8314, 2.3556], lines: ["5", "6", "7"] },
            // Line 4
            { id: "gareDunord", name: "Gare du Nord", pos: [48.8809, 2.3553], lines: ["4", "5"], landmark: "Gare du Nord" },
            { id: "cite", name: "Cité", pos: [48.8557, 2.3471], lines: ["4"], landmark: "Notre-Dame" },
            { id: "saintMichel", name: "Saint-Michel", pos: [48.8533, 2.3444], lines: ["4"], landmark: "Saint-Michel Fountain" },
            { id: "dentert", name: "Denfert-Rochereau", pos: [48.8342, 2.3323], lines: ["4", "6"], landmark: "Catacombs" }
        ],
        lines: [
            { id: "1", color: "#FFCE00", path: [[48.8919, 2.2381], [48.8845, 2.2581], [48.8776, 2.2825], [48.8738, 2.2950], [48.8719, 2.3008], [48.8655, 2.3211], [48.8625, 2.3364], [48.8584, 2.3472], [48.8531, 2.3691], [48.8481, 2.3961]] },
            { id: "6", color: "#6ECA97", path: [[48.8738, 2.2950], [48.8633, 2.2871], [48.8575, 2.2858], [48.8539, 2.2893], [48.8422, 2.3219], [48.8314, 2.3556]] },
            { id: "4", color: "#BD0078", path: [[48.8809, 2.3553], [48.8584, 2.3472], [48.8557, 2.3471], [48.8533, 2.3444], [48.8342, 2.3323]] }
        ]
    },
    lyon: {
        center: [45.7578, 4.8322],
        stations: [
            // Line A
            { id: "perrache", name: "Perrache", pos: [45.7485, 4.8258], lines: ["A", "T1", "T2"], landmark: "Gare de Lyon-Perrache" },
            { id: "ampere", name: "Ampère – Victor Hugo", pos: [45.7535, 4.8295], lines: ["A"] },
            { id: "bellecour", name: "Bellecour", pos: [45.7578, 4.8322], lines: ["A", "D"], landmark: "Place Bellecour" },
            { id: "cordeliers", name: "Cordeliers", pos: [45.7634, 4.8358], lines: ["A"], landmark: "Rue de la République" },
            { id: "hotelDeVille", name: "Hôtel de Ville – Louis Pradel", pos: [45.7675, 4.8357], lines: ["A", "C"], landmark: "Opera de Lyon" },
            { id: "foch", name: "Foch", pos: [45.7686, 4.8425], lines: ["A"] },
            { id: "massena", name: "Masséna", pos: [45.7712, 4.8475], lines: ["A"] },
            { id: "charpennes", name: "Charpennes – Charles Hernu", pos: [45.7705, 4.8634], lines: ["A", "B", "T1", "T4"] },
            // Line D
            { id: "vieuxLyon", name: "Vieux Lyon – Cathédrale St-Jean", pos: [45.7602, 4.8268], lines: ["D"], landmark: "Vieux Lyon" },
            { id: "guillotiere", name: "Guillotière – Gabriel Péri", pos: [45.7552, 4.8425], lines: ["D", "T1"] },
            { id: "saxe", name: "Saxe – Gambetta", pos: [45.7538, 4.8488], lines: ["B", "D"] },
            { id: "garibaldi", name: "Garibaldi", pos: [45.7513, 4.8556], lines: ["D"] },
            { id: "grangeBlanche", name: "Grange Blanche", pos: [45.7431, 4.8787], lines: ["D", "T2", "T5"], landmark: "Lumière Museum" }
        ],
        lines: [
            { id: "A", color: "#ED1C24", path: [[45.7485, 4.8258], [45.7535, 4.8295], [45.7578, 4.8322], [45.7634, 4.8358], [45.7675, 4.8357], [45.7686, 4.8425], [45.7712, 4.8475], [45.7705, 4.8634]] },
            { id: "D", color: "#00A651", path: [[45.7602, 4.8268], [45.7578, 4.8322], [45.7552, 4.8425], [45.7538, 4.8488], [45.7513, 4.8556], [45.7431, 4.8787]] }
        ]
    },
    nice: {
        center: [43.6961, 7.2718],
        stations: [
            // Line T1
            { id: "henri", name: "Henri Sappia", pos: [43.7314, 7.2482], lines: ["T1"] },
            { id: "valrose", name: "Valrose Université", pos: [43.7161, 7.2652], lines: ["T1"] },
            { id: "liberation", name: "Libération", pos: [43.7081, 7.2635], lines: ["T1"], landmark: "Gare du Sud" },
            { id: "thiers", name: "Thiers (Gare SNCF)", pos: [43.7042, 7.2631], lines: ["T1"], landmark: "Nice Ville Station" },
            { id: "jeanMedecin", name: "Jean Médecin", pos: [43.7011, 7.2672], lines: ["T1", "T2"], landmark: "Nice Etoile" },
            { id: "massena", name: "Place Masséna", pos: [43.6961, 7.2718], lines: ["T1"], landmark: "Place Masséna" },
            { id: "opera", name: "Opéra - Vieille Ville", pos: [43.6958, 7.2745], lines: ["T1"], landmark: "Old Nice" },
            { id: "garibaldiNice", name: "Garibaldi", pos: [43.7011, 7.2801], lines: ["T1", "T2"], landmark: "MAMAC Museum" },
            { id: "acropolis", name: "Acropolis", pos: [43.7042, 7.2821], lines: ["T1"] },
            { id: "pasteur", name: "Hôpital Pasteur", pos: [43.7221, 7.2851], lines: ["T1"] },
            // Line T2
            { id: "port", name: "Port Lympia", pos: [43.6925, 7.2858], lines: ["T2"], landmark: "Vieux Port de Nice" },
            { id: "alsace", name: "Alsace-Lorraine", pos: [43.6985, 7.2581], lines: ["T2"] },
            { id: "airport1", name: "Aéroport Terminal 1", pos: [43.6651, 7.2151], lines: ["T2"], landmark: "Nice Airport" }
        ],
        lines: [
            { id: "T1", color: "#EC1C24", path: [[43.7314, 7.2482], [43.7161, 7.2652], [43.7081, 7.2635], [43.7042, 7.2631], [43.7011, 7.2672], [43.6961, 7.2718], [43.6958, 7.2745], [43.7011, 7.2801], [43.7042, 7.2821], [43.7221, 7.2851]] },
            { id: "T2", color: "#0071BC", path: [[43.6925, 7.2858], [43.7011, 7.2801], [43.7011, 7.2672], [43.6985, 7.2581], [43.6651, 7.2151]] }
        ]
    },
    marseille: {
        center: [43.2965, 5.3763],
        stations: [
            // Line M1
            { id: "laRose", name: "La Rose", pos: [43.3377, 5.4358], lines: ["M1"] },
            { id: "malpassé", name: "Malpassé", pos: [43.3261, 5.4192], lines: ["M1"] },
            { id: "cinqAvenues", name: "Cinq Avenues - Longchamp", pos: [43.3039, 5.3951], lines: ["M1"], landmark: "Palais Longchamp" },
            { id: "stcharles", name: "St Charles", pos: [43.3027, 5.3804], lines: ["M1", "M2"], landmark: "Gare de Marseille-Saint-Charles" },
            { id: "colbert", name: "Colbert - Hôtel de Région", pos: [43.2995, 5.3745], lines: ["M1"] },
            { id: "vieuxport", name: "Vieux-Port", pos: [43.2965, 5.3763], lines: ["M1"], landmark: "Vieux-Port" },
            { id: "estrangin", name: "Estrangin - Préfecture", pos: [43.2911, 5.3795], lines: ["M1"] },
            { id: "castellane", name: "Castellane", pos: [43.2852, 5.3845], lines: ["M1", "M2", "T3"], landmark: "Place Castellane" },
            { id: "baille", name: "Baille", pos: [43.2861, 43.2861], lines: ["M1"] }, // Fixing coords
            { id: "laTimone", name: "La Timone", pos: [43.2895, 43.3985], lines: ["M1"], landmark: "Timone Hospital" }, // Fixing coords
            { id: "bailleFix", name: "Baille", pos: [43.2861, 5.3939], lines: ["M1"] },
            { id: "timoneFix", name: "La Timone", pos: [43.2895, 43.4022], lines: ["M1"] }, // Still looks off, let's refine
            { id: "stMarguerite", name: "Sainte-Marguerite Dromel", pos: [43.2691, 5.4051], lines: ["M2"], landmark: "Stade Vélodrome" },
            { id: "rondPoint", name: "Rond-Point du Prado", pos: [43.2721, 5.3921], lines: ["M2"], landmark: "Prado Beaches" },
            { id: "noailles", name: "Noailles", pos: [43.2971, 5.3815], lines: ["M2", "T1", "T2"] },
            { id: "joliette", name: "Joliette", pos: [43.3045, 5.3668], lines: ["M2"], landmark: "Les Docks" }
        ],
        lines: [
            { id: "M1", color: "#0078C1", path: [[43.3377, 5.4358], [43.3261, 5.4192], [43.3039, 5.3951], [43.3027, 5.3804], [43.2995, 5.3745], [43.2965, 5.3763], [43.2911, 5.3795], [43.2852, 5.3845]] },
            { id: "M2", color: "#E30613", path: [[43.3045, 5.3668], [43.3027, 5.3804], [43.2971, 5.3815], [43.2852, 5.3845], [43.2721, 5.3921], [43.2691, 5.4051]] }
        ]
    }
};

// Clean up Marseille Timone/Baille duplicates
CITY_DATA.marseille.stations = CITY_DATA.marseille.stations.filter(s => !["baille", "laTimone", "timoneFix"].includes(s.id));
CITY_DATA.marseille.stations.push({ id: "laTimoneReal", name: "La Timone", pos: [43.2905, 5.4015], lines: ["M1"] });
CITY_DATA.marseille.stations.push({ id: "bailleReal", name: "Baille", pos: [43.2861, 5.3931], lines: ["M1"] });

function RecenterMap({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, 14, { animate: true });
    }, [center, map]);
    return null;
}

export default function TransportMap({ activeCityId, onFindRoute }: { activeCityId: string, onFindRoute?: (from: string, to: string) => void }) {
    const data = CITY_DATA[activeCityId] || CITY_DATA.paris;
    const [selectedStation, setSelectedStation] = useState<Station | null>(null);
    const [route, setRoute] = useState<[number, number][] | null>(null);
    const [fromStation, setFromStation] = useState("");
    const [toStation, setToStation] = useState("");

    const center = data.center;

    useEffect(() => {
        setRoute(null);
        setSelectedStation(null);
        setFromStation("");
        setToStation("");
    }, [activeCityId]);

    const handleFindRoute = () => {
        if (fromStation && toStation) {
            const s1 = data.stations.find(s => s.name === fromStation);
            const s2 = data.stations.find(s => s.name === toStation);
            if (s1 && s2) {
                setRoute([s1.pos, s2.pos]);
                if (onFindRoute) {
                    onFindRoute(fromStation, toStation);
                }
            }
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-xl">
            {/* [ Route Builder Header ] */}
            <div className="p-8 bg-slate-50 border-b border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2 relative">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">From Station</label>
                    <div className="relative">
                        <select 
                            value={fromStation}
                            onChange={(e) => setFromStation(e.target.value)}
                            className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold appearance-none cursor-pointer pr-12 text-slate-700"
                        >
                            <option value="">Select Station</option>
                            {data.stations.sort((a,b) => a.name.localeCompare(b.name)).map(s => (
                                <option key={s.id} value={s.name}>{s.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                    </div>
                </div>
                <div className="space-y-2 relative">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">To Destination</label>
                    <div className="relative">
                        <select 
                            value={toStation}
                            onChange={(e) => setToStation(e.target.value)}
                            className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold appearance-none cursor-pointer pr-12 text-slate-700"
                        >
                            <option value="">Select Destination</option>
                            {data.stations.sort((a,b) => a.name.localeCompare(b.name)).map(s => (
                                <option key={s.id} value={s.name}>{s.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={handleFindRoute}
                    className="h-[52px] bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                >
                    <Navigation className="w-4 h-4" />
                    Find My Route
                </button>
            </div>

            {/* [ Map Area ] */}
            <div className="flex-1 relative min-h-[400px]">
                <MapContainer
                    center={center}
                    zoom={14}
                    style={{ height: "100%", width: "100%" }}
                    zoomControl={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* Render Metro Lines */}
                    {data.lines.map(line => (
                        <Polyline 
                            key={line.id} 
                            positions={line.path} 
                            color={line.color} 
                            weight={8} 
                            opacity={0.8}
                        >
                            <Popup>Line {line.id}</Popup>
                        </Polyline>
                    ))}

                    {/* Render Route if calculated */}
                    {route && (
                        <Polyline 
                            positions={route} 
                            color="#3b82f6" 
                            weight={12} 
                            dashArray="10, 20" 
                            opacity={1}
                        />
                    )}

                    {/* Render Stations as Nodes */}
                    {data.stations.map(station => (
                        <Marker 
                            key={station.id} 
                            position={station.pos} 
                            icon={customIcon}
                            eventHandlers={{
                                click: () => setSelectedStation(station),
                            }}
                        >
                            <Popup>
                                <div className="p-2 space-y-2 min-w-[200px]">
                                    <h4 className="font-black text-slate-900 uppercase tracking-tight leading-none">{station.name}</h4>
                                    <div className="flex gap-1">
                                        {station.lines.map(l => {
                                            const lineObj = data.lines.find(ld => ld.id === l);
                                            return (
                                                <span key={l} className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-sm" style={{ backgroundColor: lineObj?.color || '#ccc' }}>
                                                    {l}
                                                </span>
                                            );
                                        })}
                                    </div>
                                    {station.landmark && (
                                        <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-xl border border-emerald-100">
                                            <Landmark className="w-3 h-3 text-emerald-600" />
                                            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">{station.landmark} nearby</span>
                                        </div>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    <RecenterMap center={center} />
                </MapContainer>

                {/* Info Card Overlay when station selected */}
                <AnimatePresence>
                    {selectedStation && (
                        <motion.div 
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="absolute bottom-8 left-8 z-[1000] w-72 bg-white/90 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-2xl border border-white"
                        >
                            <button onClick={() => setSelectedStation(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900">✕</button>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-black text-slate-900 uppercase tracking-tighter leading-tight italic">{selectedStation.name}</h4>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lines Served</span>
                                    <div className="flex gap-2">
                                        {selectedStation.lines.map(l => {
                                            const lineObj = data.lines.find(ld => ld.id === l);
                                            return (
                                                <div key={l} className="flex items-center gap-2 px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lineObj?.color || '#ccc' }} />
                                                    <span className="text-[10px] font-black text-slate-900 uppercase">{l}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                {route && (
                                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-blue-600">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Est: 14 Mins</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Navigation className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">4 Stops</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
