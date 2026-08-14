import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CENEPRED — Centro Nacional de Estimación, Prevención y Reducción del Riesgo de Desastres',
  description: 'Plataforma Ejecutiva de Decision Intelligence para la estimación de riesgo dinámico ante emergencias climáticas en el Perú. CENEPRED.',
  icons: {
    icon: '/images/logo_cenepred.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-slate-50 text-slate-900 font-body-md antialiased selection:bg-sky-500/20">
        {children}
      </body>
    </html>
  );
}
