'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RegionData } from '../types';

// Fix Leaflet default icon issues in Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export type MapLayerMode = 'riesgo' | 'precip' | 'focos' | 'mef';

interface PeruInteractiveMapProps {
  departamentos: Record<string, RegionData>;
  selectedDeptoKey: string;
  onSelectDepto: (key: string) => void;
  mapMode?: MapLayerMode;
  macroRegion?: string;
}

const MACRO_CENTERS: Record<string, { center: [number, number]; zoom: number }> = {
  todas: { center: [-9.19, -75.015], zoom: 5 },
  norte: { center: [-5.8, -79.2], zoom: 7 },
  sierra_sur: { center: [-14.5, -72.0], zoom: 6.5 },
  selva: { center: [-5.5, -74.5], zoom: 6 },
  costa_centro: { center: [-13.5, -76.5], zoom: 6.5 }
};

function MapViewController({ macroRegion, selectedDeptoKey }: { macroRegion: string; selectedDeptoKey: string }) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map, selectedDeptoKey]);

  useEffect(() => {
    const config = MACRO_CENTERS[macroRegion] || MACRO_CENTERS.todas;
    map.flyTo(config.center, config.zoom, { duration: 1.2 });
  }, [map, macroRegion]);

  return null;
}

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
  "tacna": [-18.0066, -70.2443],
  "ucayali": [-8.3791, -74.5539],
  "pasco": [-10.6675, -76.2561],
  "huancavelica": [-12.7826, -74.9727],
  "amazonas": [-6.2317, -77.8690],
  "madre_de_dios": [-12.5933, -69.1891],
  "callao": [-12.0565, -77.1181]
};

export default function PeruInteractiveMap({
  departamentos,
  selectedDeptoKey,
  onSelectDepto,
  mapMode = 'riesgo',
  macroRegion = 'todas'
}: PeruInteractiveMapProps) {
  const centerPeru: [number, number] = [-9.19, -75.015];

  const getMarkerProps = (data: RegionData) => {
    const precip = data.precipitacionMm || 0;
    const focos = data.focosCalor || 0;
    const pct = data.pctEjecucion || 0;

    if (mapMode === 'precip') {
      const radius = Math.max(10, Math.min(28, Math.round(precip / 5)));
      return { color: '#0284c7', radius, label: `${precip} mm 24h` };
    }
    if (mapMode === 'focos') {
      const radius = Math.max(10, Math.min(28, Math.round(focos / 4)));
      return { color: '#ea580c', radius, label: `${focos} focos` };
    }
    if (mapMode === 'mef') {
      const radius = Math.max(10, Math.min(28, Math.round(pct / 4)));
      const color = pct >= 75 ? '#10b981' : pct >= 60 ? '#0284c7' : '#eab308';
      return { color, radius, label: `${pct}% devengado` };
    }
    // Default mode: riesgo SAT
    const prob = data.prob;
    const color = prob >= 65 ? '#dc2626' : prob >= 55 ? '#ea580c' : prob >= 45 ? '#d97706' : prob >= 35 ? '#0284c7' : '#10b981';
    const radius = Math.max(12, Math.min(26, Math.round(prob / 3.2)));
    return { color, radius, label: `${prob}% riesgo` };
  };

  return (
    <div className="w-full h-[480px] rounded-2xl overflow-hidden shadow-xs border border-slate-200 bg-slate-50 relative z-0">
      <MapContainer
        center={centerPeru}
        zoom={5}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ height: '480px', width: '100%', background: '#f8fafc' }}
      >
        <MapViewController macroRegion={macroRegion} selectedDeptoKey={selectedDeptoKey} />

        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={18}
        />

        {Object.entries(departamentos).map(([key, data]) => {
          const coords = DEPT_COORDS[key] || centerPeru;
          const isSelected = key === selectedDeptoKey;
          const { color, radius } = getMarkerProps(data);

          return (
            <CircleMarker
              key={key}
              center={coords}
              radius={isSelected ? radius + 5 : radius}
              pathOptions={{
                fillColor: color,
                fillOpacity: isSelected ? 0.95 : 0.75,
                color: isSelected ? '#0f172a' : '#ffffff',
                weight: isSelected ? 3.5 : 1.8
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
                    className="w-full py-1.5 text-[11px] bg-slate-900 text-white rounded-md font-semibold hover:bg-sky-700 transition-colors mt-1 cursor-pointer"
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
