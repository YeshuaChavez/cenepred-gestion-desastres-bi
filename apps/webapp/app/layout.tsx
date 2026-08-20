import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CENEPRED | Gestión del Riesgo de Desastres',
  description: 'Plataforma Nacional de Prevención y Gestión del Riesgo de Desastres en el Perú. Monitoreo satelital en tiempo real e indicadores del CENEPRED.',
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
      </head>
      <body className="bg-background font-sans text-on-surface antialiased selection:bg-sky-500/20 overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
