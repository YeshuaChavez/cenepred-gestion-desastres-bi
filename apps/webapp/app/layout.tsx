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
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                darkMode: "class",
                theme: {
                  extend: {
                    colors: {
                      "on-surface-variant": "#3e484f",
                      "primary-fixed": "#c4e7ff",
                      "surface-container-low": "#f2f4f6",
                      "tertiary-fixed-dim": "#7bd1fa",
                      "surface-bright": "#f7f9fb",
                      "surface-container": "#eceef0",
                      "on-tertiary-fixed": "#001e2b",
                      "surface-dim": "#d8dadc",
                      "outline-variant": "#bdc8d1",
                      "on-background": "#191c1e",
                      "inverse-on-surface": "#eff1f3",
                      "inverse-surface": "#2d3133",
                      "on-tertiary-container": "#004961",
                      "error-container": "#ffdad6",
                      "surface-container-lowest": "#ffffff",
                      "secondary-fixed-dim": "#bec6e0",
                      "on-secondary": "#ffffff",
                      "on-primary-fixed": "#001e2c",
                      "surface-variant": "#e0e3e5",
                      "on-surface": "#191c1e",
                      "on-primary-container": "#004965",
                      "tertiary-fixed": "#c0e8ff",
                      "on-secondary-container": "#5c647a",
                      "tertiary-container": "#64bbe3",
                      "surface-container-high": "#e6e8ea",
                      "surface-tint": "#00668a",
                      "on-error-container": "#93000a",
                      "on-error": "#ffffff",
                      "secondary-container": "#dae2fd",
                      "secondary-fixed": "#dae2fd",
                      "background": "#f8fafc",
                      "surface-container-highest": "#e0e3e5",
                      "primary-fixed-dim": "#7bd0ff",
                      "on-secondary-fixed": "#131b2e",
                      "on-tertiary": "#ffffff",
                      "on-tertiary-fixed-variant": "#004d66",
                      "outline": "#6e7980",
                      "on-secondary-fixed-variant": "#3f465c",
                      "on-primary-fixed-variant": "#004c69",
                      "error": "#ba1a1a",
                      "tertiary": "#006686",
                      "primary-container": "#38bdf8",
                      "primary": "#00668a",
                      "on-primary": "#ffffff",
                      "secondary": "#565e74",
                      "inverse-primary": "#7bd0ff",
                      "surface": "#f8fafc"
                    },
                    fontFamily: {
                      sans: ["Outfit", "sans-serif"],
                      mono: ["JetBrains Mono", "monospace"]
                    }
                  }
                }
              }
            `,
          }}
        />
      </head>
      <body className="bg-background font-sans text-on-surface antialiased selection:bg-sky-500/20 overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
