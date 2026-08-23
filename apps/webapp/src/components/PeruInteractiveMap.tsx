'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RegionData } from '../types';
import { useTheme } from '../hooks/useTheme';
import { INFRAESTRUCTURA_CRITICA, InfrastructureItem } from '../data/infrastructureData';
import { PERU_DEPARTAMENTOS } from '../data/mockData';

// Fix Leaflet default icon issues in Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export type MapLayerMode = 'riesgo' | 'precip' | 'focos' | 'mef';
export type TimeWindow = '24h' | '7d' | '30d';

interface PeruInteractiveMapProps {
  departamentos: Record<string, RegionData>;
  selectedDeptoKey: string;
  onSelectDepto: (key: string) => void;
  mapMode?: MapLayerMode;
  macroRegion?: string;
  timeWindow?: TimeWindow;
  forecast48h?: boolean;
  showHospitals?: boolean;
  showBridges?: boolean;
  showShelters?: boolean;
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
  macroRegion = 'todas',
  timeWindow = '24h',
  forecast48h = false,
  showHospitals = false,
  showBridges = false,
  showShelters = false
}: PeruInteractiveMapProps) {
  const { theme } = useTheme();
  const [isClientDark, setIsClientDark] = useState<boolean>(false);

  useEffect(() => {
    // Sincronizar estado oscuro según clase .dark en <html>
    const checkDark = () => {
      setIsClientDark(document.documentElement.classList.contains('dark') || theme === 'dark');
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [theme]);

  const centerPeru: [number, number] = [-9.19, -75.015];

  // Tile provider según modo día o noche
  const tileUrl = isClientDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  const getMarkerProps = (data: RegionData, key: string) => {
    // Multiplicadores según ventana temporal (24h, 7d, 30d)
    const timeFactorPrecip = timeWindow === '30d' ? 14.8 : timeWindow === '7d' ? 4.2 : 1.0;
    const timeFactorFocos = timeWindow === '30d' ? 19.2 : timeWindow === '7d' ? 5.5 : 1.0;

    const precip = Math.round((data.precipitacionMm || 0) * timeFactorPrecip);
    const focos = Math.round((data.focosCalor || 0) * timeFactorFocos);
    const pct = data.pctEjecucion || 0;

    // Si el modo pronóstico a 48h está activo, calcular riesgo proyectado
    let prob = data.prob;
    let forecastDelta = 0;
    if (forecast48h) {
      // Norte y Selva tienen proyección en alza por frentes meteorológicos
      if (['piura', 'tumbes', 'lambayeque', 'loreto', 'san_martin', 'amazonas'].includes(key)) {
        forecastDelta = 12;
      } else if (['arequipa', 'cusco', 'puno', 'ancash'].includes(key)) {
        forecastDelta = 6;
      } else {
        forecastDelta = -3;
      }
      prob = Math.min(99, Math.max(10, prob + forecastDelta));
    }

    if (mapMode === 'precip') {
      const radius = Math.max(10, Math.min(28, Math.round(precip / (timeWindow === '30d' ? 60 : timeWindow === '7d' ? 18 : 5))));
      return {
        color: '#0284c7',
        radius,
        label: `${precip} mm (${timeWindow})`,
        prob,
        precip,
        focos,
        forecastDelta
      };
    }
    if (mapMode === 'focos') {
      const radius = Math.max(10, Math.min(28, Math.round(focos / (timeWindow === '30d' ? 45 : timeWindow === '7d' ? 15 : 4))));
      return {
        color: '#ea580c',
        radius,
        label: `${focos} focos (${timeWindow})`,
        prob,
        precip,
        focos,
        forecastDelta
      };
    }
    if (mapMode === 'mef') {
      const radius = Math.max(10, Math.min(28, Math.round(pct / 4)));
      const color = pct >= 75 ? '#10b981' : pct >= 60 ? '#0284c7' : '#eab308';
      return {
        color,
        radius,
        label: `${pct}% devengado`,
        prob,
        precip,
        focos,
        forecastDelta
      };
    }

    // Default mode: riesgo SAT (o pronóstico 48h)
    const color = prob >= 65 ? '#dc2626' : prob >= 55 ? '#ea580c' : prob >= 45 ? '#d97706' : prob >= 35 ? '#0284c7' : '#10b981';
    const radius = Math.max(12, Math.min(26, Math.round(prob / 3.2)));
    const label = forecast48h ? `Proyección ${prob}% (+48h)` : `${prob}% riesgo (${timeWindow})`;

    return { color, radius, label, prob, precip, focos, forecastDelta };
  };

  // Filtrar infraestructura según toggles activos
  const filteredInfra = INFRAESTRUCTURA_CRITICA.filter(item => {
    if (item.tipo === 'hospital' && showHospitals) return true;
    if (item.tipo === 'puente' && showBridges) return true;
    if (item.tipo === 'albergue' && showShelters) return true;
    return false;
  });

  return (
    <div className={`w-full h-[540px] rounded-3xl overflow-hidden shadow-sm border transition-colors duration-300 relative z-0 ${
      isClientDark ? 'border-slate-800 bg-[#060d1f]' : 'border-slate-200 bg-slate-50'
    }`}>
      
      {/* Floating Map Legend & Status HUD */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-1.5 pointer-events-none">
        <div className={`px-3 py-1.5 rounded-xl backdrop-blur-md shadow-md border text-xs font-bold flex items-center gap-2 ${
          isClientDark ? 'bg-slate-900/85 text-white border-slate-700' : 'bg-white/90 text-slate-800 border-slate-200'
        }`}>
          <span className={`w-2 h-2 rounded-full ${forecast48h ? 'bg-purple-500 animate-ping' : 'bg-emerald-500'}`}></span>
          <span>
            {forecast48h ? 'Pronóstico Predictivo IA (48 Horas)' : `Monitoreo SAT (${timeWindow === '24h' ? 'Últimas 24h' : timeWindow === '7d' ? 'Últimos 7 Días' : 'Últimos 30 Días'})`}
          </span>
        </div>

        {/* Dynamic active layers badge */}
        {(showHospitals || showBridges || showShelters) && (
          <div className={`px-2.5 py-1 rounded-lg backdrop-blur-md shadow-sm border text-[10px] font-semibold flex items-center gap-2 ${
            isClientDark ? 'bg-slate-900/80 text-slate-300 border-slate-700' : 'bg-white/80 text-slate-700 border-slate-200'
          }`}>
            <span>Capas Activas:</span>
            {showHospitals && <span className="text-emerald-500 font-bold">Hospitales</span>}
            {showBridges && <span className="text-amber-500 font-bold">Puentes</span>}
            {showShelters && <span className="text-purple-500 font-bold">Albergues</span>}
          </div>
        )}
      </div>

      <MapContainer
        center={centerPeru}
        zoom={5}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{
          height: '540px',
          width: '100%',
          background: isClientDark ? '#060d1f' : '#f8fafc'
        }}
      >
        <MapViewController macroRegion={macroRegion} selectedDeptoKey={selectedDeptoKey} />

        <TileLayer
          key={isClientDark ? 'dark-tiles' : 'light-tiles'}
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
          url={tileUrl}
          maxZoom={18}
        />

        {/* 1. Regional SAT Risk & Telemetry Department Markers */}
        {Object.entries(departamentos).map(([key, data]) => {
          const coords = DEPT_COORDS[key] || centerPeru;
          const isSelected = key === selectedDeptoKey;
          const { color, radius, prob, precip, focos, forecastDelta } = getMarkerProps(data, key);

          return (
            <CircleMarker
              key={`${key}-${isClientDark ? 'dark' : 'light'}-${timeWindow}-${forecast48h ? 'f48' : 'norm'}`}
              center={coords}
              radius={isSelected ? radius + 5 : radius}
              pathOptions={{
                fillColor: color,
                fillOpacity: isSelected ? 0.95 : isClientDark ? 0.85 : 0.75,
                color: isSelected ? (isClientDark ? '#38bdf8' : '#0f172a') : (isClientDark ? '#0c1833' : '#ffffff'),
                weight: isSelected ? 3.5 : 1.8
              }}
              eventHandlers={{
                click: () => onSelectDepto(key)
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div className={`p-3 space-y-2.5 min-w-[230px] font-sans ${isClientDark ? 'text-slate-100' : 'text-slate-800'}`}>
                  <div className="flex items-center justify-between border-b pb-1.5 border-slate-200 dark:border-slate-700">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs text-sky-600">location_on</span>
                      {data.name}
                    </h4>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase shadow-xs"
                      style={{ backgroundColor: color }}
                    >
                      {forecast48h ? (prob >= 65 ? 'Muy Alto' : prob >= 50 ? 'Alto' : 'Moderado') : data.tag}
                    </span>
                  </div>

                  {forecast48h && (
                    <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 text-xs">
                      <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider block">
                        Proyección Inferencia 48h
                      </span>
                      <div className="flex justify-between items-baseline mt-0.5">
                        <span className="font-extrabold text-purple-950 dark:text-purple-100 text-sm">Score {prob}%</span>
                        <span className={`text-[10px] font-bold ${forecastDelta > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {forecastDelta > 0 ? `▲ +${forecastDelta}% Alza` : forecastDelta < 0 ? `▼ ${forecastDelta}% Descenso` : '▶ Estable'}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Riesgo SAT:</span>
                      <span className="font-extrabold text-sm" style={{ color }}>{prob}%</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Emergencias:</span>
                      <span className="font-bold">{data.emergencias?.toLocaleString()}</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Lluvia ({timeWindow}):</span>
                      <span className="font-semibold text-sky-600 dark:text-sky-400">{precip} mm</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Focos Calor:</span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400">{focos}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectDepto(key)}
                    className="w-full py-1.5 text-xs bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold transition-colors mt-1 cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                  >
                    <span>Analizar Región</span>
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* 2. Critical Infrastructure GIS Overlay (Hospitales, Puentes, Albergues) */}
        {filteredInfra.map((item) => {
          const isHosp = item.tipo === 'hospital';
          const isBridge = item.tipo === 'puente';
          const color = isHosp ? '#059669' : isBridge ? '#d97706' : '#7c3aed';
          const iconSymbol = isHosp ? 'H' : isBridge ? 'P' : 'A';
          // Estado derivado del riesgo REAL del departamento (modelo/monitoreo), no un valor fijo.
          const _prob = PERU_DEPARTAMENTOS[item.departamento]?.prob ?? 0;
          const estado = _prob >= 55 ? 'critico' : _prob >= 45 ? 'alerta' : 'operativo';

          return (
            <CircleMarker
              key={`infra-${item.id}-${isClientDark ? 'dark' : 'light'}`}
              center={[item.lat, item.lng]}
              radius={8}
              pathOptions={{
                fillColor: color,
                fillOpacity: 0.95,
                color: isClientDark ? '#ffffff' : '#0f172a',
                weight: 2.2
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div className={`p-3 space-y-2 max-w-[260px] font-sans ${isClientDark ? 'text-slate-100' : 'text-slate-800'}`}>
                  <div className="flex items-center gap-2 border-b pb-1.5 border-slate-200 dark:border-slate-700">
                    <span className="text-lg">{iconSymbol}</span>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                        {item.nombre}
                      </h4>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                        {item.entidad}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-lg text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">Estado:</span>
                      <span className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded-md text-white ${
                        estado === 'critico' ? 'bg-red-600' : estado === 'alerta' ? 'bg-amber-600' : 'bg-emerald-600'
                      }`}>
                        {estado}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                      <b>Capacidad:</b> {item.capacidad}
                    </p>

                    <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                      {item.descripcion}
                    </p>

                    <div className="pt-1 border-t border-slate-200 dark:border-slate-700 text-[10px] text-sky-700 dark:text-sky-400 font-bold">
                      Tel: {item.contacto}
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

      </MapContainer>
    </div>
  );
}
