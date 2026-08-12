import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { RegionData } from '../types';

interface PeruInteractiveMapProps {
  departamentos: Record<string, RegionData>;
  selectedDeptoKey: string;
  onSelectDepto: (key: string) => void;
}

// Coordinates map for the 25 departments of Peru
const DEPT_COORDS: Record<string, [number, number]> = {
  "piura": [-5.1945, -80.6328],
  "tumbes": [-3.5669, -80.4515],
  "lambayeque": [-6.7011, -79.9061],
  "apurimac": [-13.6339, -72.8814],
  "lima": [-12.0464, -77.0428],
  "arequipa": [-16.4090, -71.5375],
  "cajamarca": [-7.1638, -78.5003],
  "cusco": [-13.5320, -71.9675],
  "la_libertad": [-8.1160, -79.0300],
  "loreto": [-3.7491, -73.2538],
  "ancash": [-9.5261, -77.5289],
  "ayacucho": [-13.1588, -74.2239],
  "puno": [-15.8402, -70.0219],
  "san_martin": [-6.4854, -76.3686],
  "junin": [-11.1581, -75.9934],
  "huanuco": [-9.9306, -76.2422],
  "ica": [-14.0678, -75.7286],
  "moquegua": [-17.1983, -70.9357],
  "tacna": [-18.0066, -70.2463],
  "ucayali": [-8.3791, -74.5539],
  "pasco": [-10.6675, -76.2561],
  "huancavelica": [-12.7826, -74.9727],
  "amazonas": [-6.2317, -77.8690],
  "madre_de_dios": [-12.5933, -69.1891],
  "callao": [-12.0565, -77.1181]
};

export default function PeruInteractiveMap({ departamentos, selectedDeptoKey, onSelectDepto }: PeruInteractiveMapProps) {
  // Center of Peru map
  const centerPeru: [number, number] = [-9.19, -75.015];

  const getColorByProb = (prob: number) => {
    if (prob >= 78) return '#dc2626'; // Red
    if (prob >= 65) return '#ea580c'; // Orange
    if (prob >= 50) return '#d97706'; // Amber
    if (prob >= 35) return '#0284c7'; // Sky Blue
    return '#10b981'; // Emerald Green
  };

  return (
    <div className="w-full h-full min-h-[460px] rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 bg-white relative z-0">
      <MapContainer
        center={centerPeru}
        zoom={5}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[460px]"
        style={{ background: '#f8fafc' }}
      >
        {/* CartoDB Voyager Light Tiles (Modern, clean, crisp light map) */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {Object.entries(departamentos).map(([key, data]) => {
          const coords = DEPT_COORDS[key] || centerPeru;
          const isSelected = key === selectedDeptoKey;
          const color = getColorByProb(data.prob);
          const radius = Math.max(10, Math.min(24, Math.round(data.prob / 4)));

          return (
            <CircleMarker
              key={key}
              center={coords}
              radius={isSelected ? radius + 4 : radius}
              pathOptions={{
                fillColor: color,
                fillOpacity: isSelected ? 0.9 : 0.7,
                color: isSelected ? '#0f172a' : '#ffffff',
                weight: isSelected ? 3 : 1.5
              }}
              eventHandlers={{
                click: () => onSelectDepto(key)
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-2 space-y-2 min-w-[200px] text-slate-800 font-sans">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                    <h4 className="font-bold text-sm text-slate-900">{data.name}</h4>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase"
                      style={{ backgroundColor: color }}
                    >
                      {data.tag}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Riesgo SAT:</span>
                      <span className="font-extrabold text-sm" style={{ color }}>{data.prob}%</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Emergencias:</span>
                      <span className="font-bold">{data.emergencias?.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Lluvia Acum:</span>
                      <span className="font-semibold">{data.precipitacionMm} mm</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Gasto MEF:</span>
                      <span className="font-semibold">{data.pctEjecucion}%</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onSelectDepto(key)}
                    className="w-full py-1 text-[11px] bg-slate-900 text-white rounded font-semibold hover:bg-sky-700 transition-colors mt-1"
                  >
                    Ver Informe Regional
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
