'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RegionData } from '../types';
import { useTheme } from '../hooks/useTheme';
import { INFRAESTRUCTURA_CRITICA } from '../data/infrastructureData';
import { PERU_DEPARTAMENTOS } from '../data/mockData';

export type MapLayerMode = 'riesgo' | 'precip' | 'focos' | 'mef';
export type TimeWindow = '24h' | '7d' | '30d';

interface PeruInteractiveMapProps {
  departamentos: Record<string, RegionData>;
  selectedDeptoKey: string;
  onSelectDepto: (key: string) => void;
  mapMode?: MapLayerMode;
  macroRegion?: string;
  timeWindow?: TimeWindow;
  showHospitals?: boolean;
  showBridges?: boolean;
  showShelters?: boolean;
}

const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const TILE_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTR = '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap';

const CENTER_PERU: [number, number] = [-9.19, -75.015];

const MACRO_CENTERS: Record<string, { center: [number, number]; zoom: number }> = {
  todas: { center: [-9.19, -75.015], zoom: 5 },
  norte: { center: [-5.8, -79.2], zoom: 7 },
  sierra_sur: { center: [-14.5, -72.0], zoom: 6.5 },
  selva: { center: [-5.5, -74.5], zoom: 6 },
  costa_centro: { center: [-13.5, -76.5], zoom: 6.5 }
};

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

type MarkerVisual = { color: string; radius: number; prob: number; precip: number; focos: number };

// Calcula color, tamaño y valores de cada marcador segun la capa activa y la ventana temporal.
function getMarkerVisual(data: RegionData, mapMode: MapLayerMode, timeWindow: TimeWindow): MarkerVisual {
  const precip = timeWindow === '30d'
    ? (data.precip30d ?? 0)
    : timeWindow === '7d'
      ? (data.precip7d ?? 0)
      : (data.precip24h ?? 0);
  const focos = data.focos30d ?? 0;
  const pct = data.pctEjecucion || 0;
  const prob = data.prob;

  if (mapMode === 'precip') {
    const radius = Math.max(10, Math.min(28, Math.round(precip / (timeWindow === '30d' ? 12 : timeWindow === '7d' ? 5 : 2)) + 8));
    return { color: '#0284c7', radius, prob, precip, focos };
  }
  if (mapMode === 'focos') {
    const radius = Math.max(10, Math.min(28, Math.round(focos / 4) + 8));
    return { color: '#ea580c', radius, prob, precip, focos };
  }
  if (mapMode === 'mef') {
    const radius = Math.max(10, Math.min(28, Math.round(pct / 4)));
    const color = pct >= 75 ? '#10b981' : pct >= 60 ? '#0284c7' : '#eab308';
    return { color, radius, prob, precip, focos };
  }
  const color = prob >= 65 ? '#dc2626' : prob >= 55 ? '#ea580c' : prob >= 45 ? '#d97706' : prob >= 35 ? '#0284c7' : '#10b981';
  const radius = Math.max(12, Math.min(26, Math.round(prob / 3.2)));
  return { color, radius, prob, precip, focos };
}

function selectedStyle(isSel: boolean, dark: boolean): L.PathOptions {
  return {
    fillOpacity: isSel ? 0.95 : dark ? 0.85 : 0.75,
    color: isSel ? (dark ? '#38bdf8' : '#0f172a') : (dark ? '#0c1833' : '#ffffff'),
    weight: isSel ? 3.5 : 1.8
  };
}

// Contenido del popup de un departamento (Leaflet vive fuera de React, se arma como DOM).
function buildDeptPopup(
  data: RegionData,
  key: string,
  v: MarkerVisual,
  timeWindow: TimeWindow,
  dark: boolean,
  onAnalyze: (key: string) => void
): HTMLElement {
  const el = document.createElement('div');
  el.className = `p-3 space-y-2.5 min-w-[230px] font-sans ${dark ? 'text-slate-100' : 'text-slate-800'}`;
  el.innerHTML = `
    <div class="flex items-center justify-between border-b pb-1.5 border-slate-200 dark:border-slate-700">
      <h4 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
        <span class="material-symbols-outlined text-xs text-sky-600">location_on</span>
        ${data.name}
      </h4>
      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase shadow-xs" style="background-color:${v.color}">${data.tag}</span>
    </div>
    <div class="grid grid-cols-2 gap-2 text-xs">
      <div class="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
        <span class="text-slate-500 dark:text-slate-400 block text-[10px]">Riesgo SAT:</span>
        <span class="font-extrabold text-sm" style="color:${v.color}">${v.prob}%</span>
      </div>
      <div class="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
        <span class="text-slate-500 dark:text-slate-400 block text-[10px]">Emergencias:</span>
        <span class="font-bold">${(data.emergencias ?? 0).toLocaleString()}</span>
      </div>
      <div class="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
        <span class="text-slate-500 dark:text-slate-400 block text-[10px]">Lluvia (${timeWindow}):</span>
        <span class="font-semibold text-sky-600 dark:text-sky-400">${v.precip} mm</span>
      </div>
      <div class="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
        <span class="text-slate-500 dark:text-slate-400 block text-[10px]">Focos Calor (30d):</span>
        <span class="font-semibold text-amber-600 dark:text-amber-400">${v.focos}</span>
      </div>
    </div>
  `;
  const btn = document.createElement('button');
  btn.className = 'w-full py-1.5 text-xs bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold transition-colors mt-1 cursor-pointer flex items-center justify-center gap-1 shadow-xs';
  btn.innerHTML = '<span>Analizar Región</span><span class="material-symbols-outlined text-xs">arrow_forward</span>';
  btn.addEventListener('click', () => onAnalyze(key));
  el.appendChild(btn);
  return el;
}

// Contenido del popup de un elemento de infraestructura critica.
function buildInfraPopupHtml(
  item: typeof INFRAESTRUCTURA_CRITICA[number],
  dark: boolean
): string {
  const isHosp = item.tipo === 'hospital';
  const isBridge = item.tipo === 'puente';
  const iconSymbol = isHosp ? 'H' : isBridge ? 'P' : 'A';
  const prob = PERU_DEPARTAMENTOS[item.departamento]?.prob ?? 0;
  const estado = prob >= 55 ? 'critico' : prob >= 45 ? 'alerta' : 'operativo';
  const estadoClass = estado === 'critico' ? 'bg-red-600' : estado === 'alerta' ? 'bg-amber-600' : 'bg-emerald-600';
  return `
    <div class="p-3 space-y-2 max-w-[260px] font-sans ${dark ? 'text-slate-100' : 'text-slate-800'}">
      <div class="flex items-center gap-2 border-b pb-1.5 border-slate-200 dark:border-slate-700">
        <span class="text-lg">${iconSymbol}</span>
        <div>
          <h4 class="font-bold text-xs text-slate-900 dark:text-white leading-tight">${item.nombre}</h4>
          <span class="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">${item.entidad}</span>
        </div>
      </div>
      <div class="space-y-1 text-xs">
        <div class="flex justify-between items-center bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-lg text-[11px]">
          <span class="text-slate-500 dark:text-slate-400">Estado:</span>
          <span class="font-bold uppercase text-[10px] px-2 py-0.5 rounded-md text-white ${estadoClass}">${estado}</span>
        </div>
        <p class="text-[11px] text-slate-600 dark:text-slate-300 font-medium"><b>Capacidad:</b> ${item.capacidad}</p>
        <p class="text-[10px] text-slate-500 dark:text-slate-400 italic">${item.descripcion}</p>
        <div class="pt-1 border-t border-slate-200 dark:border-slate-700 text-[10px] text-sky-700 dark:text-sky-400 font-bold">Tel: ${item.contacto}</div>
      </div>
    </div>
  `;
}

// Mapa nacional con Leaflet imperativo: controla el ciclo de vida y limpia la instancia al
// desmontar, evitando el error "Map container is already initialized" de react-leaflet bajo
// React StrictMode / HMR.
export default function PeruInteractiveMap({
  departamentos,
  selectedDeptoKey,
  onSelectDepto,
  mapMode = 'riesgo',
  macroRegion = 'todas',
  timeWindow = '24h',
  showHospitals = false,
  showBridges = false,
  showShelters = false
}: PeruInteractiveMapProps) {
  const { theme } = useTheme();
  const [isClientDark, setIsClientDark] = useState<boolean>(false);

  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const deptLayerRef = useRef<L.LayerGroup | null>(null);
  const infraLayerRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef<Record<string, L.CircleMarker>>({});
  const baseRadiusRef = useRef<Record<string, number>>({});

  // Refs de valores que cambian pero que no deben forzar el rearmado de marcadores.
  const selectedRef = useRef(selectedDeptoKey);
  const onSelectRef = useRef(onSelectDepto);
  selectedRef.current = selectedDeptoKey;
  onSelectRef.current = onSelectDepto;

  // Sincronizar modo oscuro con la clase .dark del <html>.
  useEffect(() => {
    const checkDark = () => setIsClientDark(document.documentElement.classList.contains('dark') || theme === 'dark');
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [theme]);

  // Montaje unico del mapa y sus capas.
  useEffect(() => {
    if (!elRef.current || mapRef.current) return;
    const dark = document.documentElement.classList.contains('dark');
    const map = L.map(elRef.current, { center: CENTER_PERU, zoom: 5, scrollWheelZoom: true });
    mapRef.current = map;
    tileRef.current = L.tileLayer(dark ? TILE_DARK : TILE_LIGHT, { attribution: TILE_ATTR, maxZoom: 18 }).addTo(map);
    deptLayerRef.current = L.layerGroup().addTo(map);
    infraLayerRef.current = L.layerGroup().addTo(map);
    return () => {
      map.remove();
      mapRef.current = null;
      tileRef.current = null;
      deptLayerRef.current = null;
      infraLayerRef.current = null;
      markersRef.current = {};
    };
  }, []);

  // Cambiar los tiles al alternar el tema.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (tileRef.current) map.removeLayer(tileRef.current);
    tileRef.current = L.tileLayer(isClientDark ? TILE_DARK : TILE_LIGHT, { attribution: TILE_ATTR, maxZoom: 18 }).addTo(map);
  }, [isClientDark]);

  // (Re)dibujar los marcadores de departamentos cuando cambia la capa, la ventana o el tema.
  useEffect(() => {
    const layer = deptLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    markersRef.current = {};
    baseRadiusRef.current = {};

    Object.entries(departamentos).forEach(([key, data]) => {
      const coords = DEPT_COORDS[key] || CENTER_PERU;
      const v = getMarkerVisual(data, mapMode, timeWindow);
      const isSel = key === selectedRef.current;
      baseRadiusRef.current[key] = v.radius;

      const marker = L.circleMarker(coords, {
        radius: isSel ? v.radius + 5 : v.radius,
        fillColor: v.color,
        ...selectedStyle(isSel, isClientDark)
      });
      marker.on('click', () => onSelectRef.current(key));
      marker.bindPopup(
        buildDeptPopup(data, key, v, timeWindow, isClientDark, (k) => onSelectRef.current(k)),
        { className: 'custom-leaflet-popup' }
      );
      marker.addTo(layer);
      markersRef.current[key] = marker;
      if (isSel) marker.bringToFront();
    });
  }, [departamentos, mapMode, timeWindow, isClientDark]);

  // Resaltar el departamento seleccionado sin rearmar todos los marcadores.
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([key, marker]) => {
      const isSel = key === selectedDeptoKey;
      const base = baseRadiusRef.current[key] ?? 12;
      marker.setRadius(isSel ? base + 5 : base);
      marker.setStyle(selectedStyle(isSel, isClientDark));
      if (isSel) marker.bringToFront();
    });
    const map = mapRef.current;
    if (map) {
      const t = setTimeout(() => map.invalidateSize(), 200);
      return () => clearTimeout(t);
    }
  }, [selectedDeptoKey, isClientDark]);

  // (Re)dibujar la infraestructura critica segun los toggles activos.
  useEffect(() => {
    const layer = infraLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    INFRAESTRUCTURA_CRITICA
      .filter((item) =>
        (item.tipo === 'hospital' && showHospitals) ||
        (item.tipo === 'puente' && showBridges) ||
        (item.tipo === 'albergue' && showShelters)
      )
      .forEach((item) => {
        const isHosp = item.tipo === 'hospital';
        const isBridge = item.tipo === 'puente';
        const color = isHosp ? '#059669' : isBridge ? '#d97706' : '#7c3aed';
        L.circleMarker([item.lat, item.lng], {
          radius: 8,
          fillColor: color,
          fillOpacity: 0.95,
          color: isClientDark ? '#ffffff' : '#0f172a',
          weight: 2.2
        })
          .bindPopup(buildInfraPopupHtml(item, isClientDark), { className: 'custom-leaflet-popup' })
          .addTo(layer);
      });
  }, [showHospitals, showBridges, showShelters, isClientDark]);

  // Recentrar el mapa al cambiar de macrorregion.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const config = MACRO_CENTERS[macroRegion] || MACRO_CENTERS.todas;
    map.flyTo(config.center, config.zoom, { duration: 1.2 });
  }, [macroRegion]);

  return (
    <div className={`w-full h-[540px] rounded-3xl overflow-hidden shadow-sm border transition-colors duration-300 relative z-0 ${
      isClientDark ? 'border-slate-800 bg-[#060d1f]' : 'border-slate-200 bg-slate-50'
    }`}>

      {/* Floating Map Legend & Status HUD */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-1.5 pointer-events-none">
        <div className={`px-3 py-1.5 rounded-xl backdrop-blur-md shadow-md border text-xs font-bold flex items-center gap-2 ${
          isClientDark ? 'bg-slate-900/85 text-white border-slate-700' : 'bg-white/90 text-slate-800 border-slate-200'
        }`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>
            {`Monitoreo SAT (${timeWindow === '24h' ? 'Últimas 24h' : timeWindow === '7d' ? 'Últimos 7 Días' : 'Últimos 30 Días'})`}
          </span>
        </div>

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

      <div ref={elRef} className="w-full h-full" style={{ background: isClientDark ? '#060d1f' : '#f8fafc' }} />
    </div>
  );
}
