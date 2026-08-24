'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '../hooks/useTheme';

interface Props {
  lat: number;
  lng: number;
  name: string;
  color: string;
}

const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const TILE_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

// Mapa localizador con Leaflet imperativo (evita el error "Map container is already
// initialized" de react-leaflet bajo StrictMode/HMR, al controlar el ciclo de vida y
// limpiar la instancia en el desmontaje).
export default function RegionLocatorMap({ lat, lng, name, color }: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const haloRef = useRef<L.CircleMarker | null>(null);
  const pinRef = useRef<L.CircleMarker | null>(null);
  const { theme } = useTheme();

  // Montaje único
  useEffect(() => {
    if (!elRef.current || mapRef.current) return;
    const map = L.map(elRef.current, {
      zoomControl: false, attributionControl: false, dragging: false,
      scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false, touchZoom: false,
    }).setView([lat, lng], 6);
    mapRef.current = map;
    tileRef.current = L.tileLayer(theme === 'dark' ? TILE_DARK : TILE_LIGHT).addTo(map);
    haloRef.current = L.circleMarker([lat, lng], { radius: 16, weight: 0, fillColor: color, fillOpacity: 0.18 }).addTo(map);
    pinRef.current = L.circleMarker([lat, lng], { radius: 7, color: '#ffffff', weight: 2, fillColor: color, fillOpacity: 1 })
      .addTo(map)
      .bindTooltip(name, { permanent: true, direction: 'top', offset: [0, -6] });
    return () => { map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Actualizar posición / color / nombre
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo([lat, lng], 6, { duration: 0.7 });
    haloRef.current?.setLatLng([lat, lng]).setStyle({ fillColor: color });
    pinRef.current?.setLatLng([lat, lng]).setStyle({ fillColor: color });
    pinRef.current?.unbindTooltip().bindTooltip(name, { permanent: true, direction: 'top', offset: [0, -6] });
  }, [lat, lng, name, color]);

  // Cambiar tiles al alternar tema
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (tileRef.current) map.removeLayer(tileRef.current);
    tileRef.current = L.tileLayer(theme === 'dark' ? TILE_DARK : TILE_LIGHT).addTo(map);
  }, [theme]);

  return <div ref={elRef} className="w-full h-full" />;
}
