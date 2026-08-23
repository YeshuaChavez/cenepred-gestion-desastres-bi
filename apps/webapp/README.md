# Aplicación web · CENEPRED · Alerta Temprana de Riesgo Dinámico

Portal web del Sistema de Alerta Temprana de CENEPRED. Presenta el riesgo de desastres por departamento, el monitoreo diario, el histórico de emergencias, la estimación predictiva de riesgo y el seguimiento del presupuesto de prevención, con un asistente analítico y alertas automáticas.

Construido con **Next.js 14** (App Router), **React 18**, **Tailwind CSS**, **Leaflet** (mapa) y **Recharts** (gráficos).

## Qué incluye

Seis vistas alimentadas con datos reales de la plataforma:

- **Inicio:** panorama nacional y mapa de riesgo por departamento.
- **Monitoreo Diario:** clima, sismos y focos de calor recientes por región.
- **Histórico y Tendencias:** serie de emergencias 2012 a 2023.
- **Riesgo Predictivo:** nivel de riesgo estimado por región, factores que lo explican y generación de diagnósticos ejecutivos.
- **Comparativo Regional:** contraste entre departamentos.
- **Presupuesto de Prevención:** ejecución de la inversión en prevención por gobierno regional.

Además:

- **Asistente analítico** flotante que responde en lenguaje natural sobre regiones, riesgo y presupuesto.
- **Alertas automáticas** de riesgo Alto y Crítico por Telegram y correo (se despachan solas, sin acción manual).
- **Mapa interactivo** con infraestructura crítica real (hospitales, puentes y albergues).
- **Diseño responsive** y modo claro/oscuro.

## Correrlo en local

```bash
npm install
npm run dev        # http://localhost:3000
```

Crea un archivo `.env.local` con las claves que usan las rutas API (asistente, generador de diagnósticos y bot de alertas). Toma `.env.example` como referencia. Sin esas claves, la app funciona igual pero esas funciones caen a un modo de respaldo.

Otros comandos:

```bash
npm run build      # build de producción (salida standalone)
npm run start      # sirve el build
npx tsc --noEmit   # chequeo de tipos
```

## Datos

Las vistas se alimentan de `src/data/realData.json`, un agregado de datos reales que el pipeline regenera automáticamente cada día y publica en el repositorio; el despliegue se actualiza solo al detectar ese cambio. No hay datos inventados: las series históricas provienen del registro oficial de emergencias.

## Despliegue

La aplicación se despliega en **Vercel**, conectada al repositorio: cada push a la rama principal genera un nuevo despliegue. La app usa salida `standalone` de Next.js, por lo que también puede empaquetarse en contenedor (ver el `Dockerfile` de esta carpeta).
