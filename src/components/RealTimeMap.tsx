"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

// Fix for default marker icons in Leaflet + Next.js
const customIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

function RecenterMap({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, 6, { animate: true });
    }, [center, map]);
    return null;
}

interface RealTimeMapProps {
    activeCity: { name: string, id: string };
    onCityClick: (cityId: string) => void;
}

const CITY_COORDS: Record<string, [number, number]> = {
    paris: [48.8566, 2.3522],
    lyon: [45.7640, 4.8357],
    nice: [43.7102, 7.2620],
    marseille: [43.2965, 5.3698],
};

export default function RealTimeMap({ activeCity, onCityClick }: RealTimeMapProps) {
    const center = CITY_COORDS[activeCity.id] || CITY_COORDS.paris;

    return (
        <div className="w-full h-full relative z-0">
            <MapContainer
                center={center}
                zoom={6}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%", borderRadius: "inherit" }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {Object.entries(CITY_COORDS).map(([id, pos]) => (
                    <Marker 
                        key={id} 
                        position={pos} 
                        icon={customIcon}
                        eventHandlers={{
                            click: () => onCityClick(id),
                        }}
                    >
                        <Popup>
                            <div className="font-bold text-slate-900 border-b border-emerald-100 pb-1 mb-1 uppercase tracking-tighter italic">
                                {id.toUpperCase()}
                            </div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">
                                Destination Explore
                            </div>
                        </Popup>
                    </Marker>
                ))}
                
                <RecenterMap center={center} />
            </MapContainer>
        </div>
    );
}
