"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type FranceMapProps = {
    onSelectDish: (dishId: string) => void;
};

// Fix Leaflet's default icon path issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const paris: [number, number] = [48.8566, 2.3522];
const burgundy: [number, number] = [47.0525, 4.3837];
const provence: [number, number] = [43.9352, 6.0679];
const lorraine: [number, number] = [48.6921, 6.1844];
const marseille: [number, number] = [43.2965, 5.3698];
const savoie: [number, number] = [45.5646, 5.9178];
const centre: [number, number] = [47.5939, 1.4282];
const occitanie: [number, number] = [43.6047, 1.4442]; // Toulouse
const brittany: [number, number] = [48.1173, -1.6778]; // Rennes


export default function FranceMap({ onSelectDish }: FranceMapProps) {
    return (
        <MapContainer
            center={[46.603354, 1.888334]}
            zoom={6}
            style={{ height: "350px", width: "100%", borderRadius: "16px", zIndex: 0 }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={paris}>
                <Popup>
                    Paris – French Onion Soup
                    <br />
                    <button onClick={() => onSelectDish("french-onion-soup")} className="font-bold text-orange-600 underline">
                        Cook this dish
                    </button>
                </Popup>
            </Marker>

            <Marker position={burgundy}>
                <Popup>
                    Burgundy – Coq au Vin
                    <br />
                    <button onClick={() => onSelectDish("coq-au-vin")} className="font-bold text-orange-600 underline">
                        Cook this dish
                    </button>
                </Popup>
            </Marker>

            <Marker position={provence}>
                <Popup>
                    Provence – Ratatouille
                    <br />
                    <button onClick={() => onSelectDish("ratatouille")} className="font-bold text-orange-600 underline">
                        Cook this dish
                    </button>
                </Popup>
            </Marker>

            <Marker position={lorraine}>
                <Popup>
                    Lorraine – Quiche Lorraine
                    <br />
                    <button onClick={() => onSelectDish("quiche-lorraine")} className="font-bold text-orange-600 underline">
                        Cook this dish
                    </button>
                </Popup>
            </Marker>

            <Marker position={marseille}>
                <Popup>
                    Marseille – Bouillabaisse
                    <br />
                    <button onClick={() => onSelectDish("bouillabaisse")} className="font-bold text-orange-600 underline">
                        Cook this dish
                    </button>
                </Popup>
            </Marker>

            <Marker position={savoie}>
                <Popup>
                    Savoie – Tartiflette
                    <br />
                    <button onClick={() => onSelectDish("tartiflette")} className="font-bold text-orange-600 underline">
                        Cook this dish
                    </button>
                </Popup>
            </Marker>

            <Marker position={centre}>
                <Popup>
                    Centre-Val de Loire – Tarte Tatin
                    <br />
                    <button onClick={() => onSelectDish("tarte-tatin")} className="font-bold text-orange-600 underline">
                        Cook this dish
                    </button>
                </Popup>
            </Marker>

            <Marker position={occitanie}>
                <Popup>
                    Occitanie – Cassoulet
                    <br />
                    <button onClick={() => onSelectDish("cassoulet")} className="font-bold text-orange-600 underline">
                        Cook this dish
                    </button>
                </Popup>
            </Marker>

            <Marker position={brittany}>
                <Popup>
                    Brittany – Crêpes
                    <br />
                    <button onClick={() => onSelectDish("crepes")} className="font-bold text-orange-600 underline">
                        Cook this dish
                    </button>
                </Popup>
            </Marker>
        </MapContainer>
    );
}
