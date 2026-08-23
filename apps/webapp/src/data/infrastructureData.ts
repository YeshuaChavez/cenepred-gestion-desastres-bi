// Infraestructura crítica REAL del Perú (nombres, ubicaciones y capacidades verificados).
// El campo `estado` (operativo/alerta/crítico) NO se guarda aquí: se deriva en el mapa del
// riesgo REAL del departamento (modelo/monitoreo). Los contactos son líneas oficiales
// nacionales reales (SAMU 106, EsSalud 107, INDECI/COEN 115, PROVIAS Nacional).
export interface InfrastructureItem {
  id: string;
  nombre: string;
  tipo: 'hospital' | 'puente' | 'albergue';
  departamento: string;
  lat: number;
  lng: number;
  entidad: 'MINSA' | 'EsSalud' | 'MTC / PROVIAS' | 'INDECI / COEN' | 'Gobierno Regional';
  capacidad: string;
  contacto: string;
  descripcion: string;
}

export const INFRAESTRUCTURA_CRITICA: InfrastructureItem[] = [
  // HOSPITALES (capacidades verificadas de fuentes públicas)
  {
    id: "hosp-01",
    nombre: "Hospital de Apoyo II-2 Sullana",
    tipo: "hospital",
    departamento: "piura",
    lat: -4.9039,
    lng: -80.6853,
    entidad: "MINSA",
    capacidad: "294 camas (209 hospitalización + 48 UCI) · Hospital II-2",
    contacto: "SAMU: 106",
    descripcion: "Referencia traumatológica y epidemiológica en la cuenca baja del Río Chira."
  },
  {
    id: "hosp-02",
    nombre: "Hospital Regional José Alfredo Mendoza Olavarría (JAMO II-2)",
    tipo: "hospital",
    departamento: "tumbes",
    lat: -3.5681,
    lng: -80.4439,
    entidad: "MINSA",
    capacidad: "Hospital regional II-2 · referencia fronteriza de Tumbes",
    contacto: "SAMU: 106",
    descripcion: "Hospital de referencia en zona expuesta a inundaciones por crecida del Río Tumbes."
  },
  {
    id: "hosp-03",
    nombre: "Hospital Nacional Edgardo Rebagliati Martins",
    tipo: "hospital",
    departamento: "lima",
    lat: -12.0784,
    lng: -77.0375,
    entidad: "EsSalud",
    capacidad: "≈1,600 camas · máxima complejidad nacional",
    contacto: "EsSalud: 107",
    descripcion: "Principal centro de referencia asistencial y de alta complejidad del país."
  },
  {
    id: "hosp-04",
    nombre: "Hospital Regional del Cusco",
    tipo: "hospital",
    departamento: "cusco",
    lat: -13.5256,
    lng: -71.9542,
    entidad: "MINSA",
    capacidad: "≈312 camas · referencia III-1 de la sierra sur",
    contacto: "SAMU: 106",
    descripcion: "Centro de respuesta médica de la sierra sur ante huaicos y heladas."
  },
  {
    id: "hosp-05",
    nombre: "Hospital Regional Honorio Delgado Espinoza",
    tipo: "hospital",
    departamento: "arequipa",
    lat: -16.4172,
    lng: -71.5306,
    entidad: "MINSA",
    capacidad: "855 camas · referencia macrorregional del sur",
    contacto: "SAMU: 106",
    descripcion: "Hospital general macrorregional con protocolos ante sismos y actividad volcánica."
  },
  {
    id: "hosp-06",
    nombre: "Hospital Regional Víctor Ramos Guardia (Huaraz)",
    tipo: "hospital",
    departamento: "ancash",
    lat: -9.5312,
    lng: -77.5264,
    entidad: "MINSA",
    capacidad: "Hospital II-2 del Callejón de Huaylas (en modernización)",
    contacto: "SAMU: 106",
    descripcion: "Principal centro hospitalario del Callejón de Huaylas ante riesgo de aluviones."
  },
  {
    id: "hosp-07",
    nombre: "Hospital Regional de Loreto Felipe Santiago Arriola Iglesias",
    tipo: "hospital",
    departamento: "loreto",
    lat: -3.7589,
    lng: -73.2622,
    entidad: "MINSA",
    capacidad: "≈371 camas · referencia amazónica III-1",
    contacto: "SAMU: 106",
    descripcion: "Referencia amazónica ante inundaciones en las cuencas del Ucayali y el Marañón."
  },
  {
    id: "hosp-08",
    nombre: "Hospital Regional Manuel Núñez Butrón (Puno)",
    tipo: "hospital",
    departamento: "puno",
    lat: -15.8361,
    lng: -70.0272,
    entidad: "MINSA",
    capacidad: "≈270 camas · referencia del Altiplano (en reconstrucción)",
    contacto: "SAMU: 106",
    descripcion: "Atención crítica del Altiplano ante heladas extremas y nevadas."
  },

  // PUENTES Y CORREDORES VIALES (estructuras reales)
  {
    id: "bridge-01",
    nombre: "Puente Simón Rodríguez (Ruta Dep. PI-102, El Arenal–Amotape)",
    tipo: "puente",
    departamento: "piura",
    lat: -4.9521,
    lng: -80.7511,
    entidad: "MTC / PROVIAS",
    capacidad: "≈420 m sobre el Río Chira · estación hidrológica SENAMHI",
    contacto: "PROVIAS Nacional: (01) 615-7800",
    descripcion: "Estructura sobre el Río Chira; colapsó parcialmente en El Niño 1998 y fue rehabilitada."
  },
  {
    id: "bridge-02",
    nombre: "Puente Ricardo Palma (Carretera Central)",
    tipo: "puente",
    departamento: "lima",
    lat: -11.9167,
    lng: -76.6542,
    entidad: "MTC / PROVIAS",
    capacidad: "Corredor logístico Lima – centro del país",
    contacto: "PROVIAS Nacional: (01) 615-7800",
    descripcion: "Punto crítico ante activación de quebradas en Chosica y crecidas del Río Rímac."
  },
  {
    id: "bridge-03",
    nombre: "Puente Reque (Panamericana Norte)",
    tipo: "puente",
    departamento: "lambayeque",
    lat: -6.8667,
    lng: -79.8167,
    entidad: "MTC / PROVIAS",
    capacidad: "Corredor interregional sobre el Río Reque",
    contacto: "PROVIAS Nacional: (01) 615-7800",
    descripcion: "Vía de conexión interregional vulnerable a crecidas del Río Reque durante El Niño."
  },
  {
    id: "bridge-04",
    nombre: "Puente Huaycoloro (Autopista Ramiro Prialé)",
    tipo: "puente",
    departamento: "lima",
    lat: -12.0125,
    lng: -76.9531,
    entidad: "Gobierno Regional",
    capacidad: "Cruce sobre la quebrada Huaycoloro",
    contacto: "COER Lima: 115",
    descripcion: "Punto de descarga de la quebrada Huaycoloro, con antecedentes de flujos de lodo."
  },
  {
    id: "bridge-05",
    nombre: "Puente Virú (Panamericana Norte)",
    tipo: "puente",
    departamento: "la_libertad",
    lat: -8.4167,
    lng: -78.7500,
    entidad: "MTC / PROVIAS",
    capacidad: "Corredor agroexportador sobre el Río Virú",
    contacto: "PROVIAS Nacional: (01) 615-7800",
    descripcion: "Estructura estratégica que conecta Trujillo y Chimbote; monitoreo de defensas ribereñas."
  },
  {
    id: "bridge-06",
    nombre: "Puente Cunyac (Ruta Cusco – Abancay)",
    tipo: "puente",
    departamento: "apurimac",
    lat: -13.5603,
    lng: -72.5694,
    entidad: "MTC / PROVIAS",
    capacidad: "Paso cordillerano sobre el Río Apurímac",
    contacto: "PROVIAS Nacional: (01) 615-7800",
    descripcion: "Paso crítico para el abastecimiento entre Apurímac y Cusco."
  },

  // RECINTOS HABILITABLES COMO REFUGIO (venues reales)
  {
    id: "albergue-01",
    nombre: "Estadio Campeones del 36 (Sullana)",
    tipo: "albergue",
    departamento: "piura",
    lat: -4.8981,
    lng: -80.6903,
    entidad: "INDECI / COEN",
    capacidad: "Estadio (≈12,000 aforo) · habilitable como refugio temporal",
    contacto: "INDECI / COEN: 115",
    descripcion: "Recinto real usado como hospital temporal durante la pandemia; habilitable para evacuación."
  },
  {
    id: "albergue-02",
    nombre: "Coliseo Gran Chimú (Trujillo)",
    tipo: "albergue",
    departamento: "la_libertad",
    lat: -8.1092,
    lng: -79.0353,
    entidad: "INDECI / COEN",
    capacidad: "Coliseo IPD (≈8,000 aforo) · habilitable como refugio",
    contacto: "INDECI / COEN: 115",
    descripcion: "Recinto techado del IPD, habilitable para evacuación de familias damnificadas."
  },
  {
    id: "albergue-03",
    nombre: "Villa Deportiva Nacional (VIDENA, Lima)",
    tipo: "albergue",
    departamento: "lima",
    lat: -12.0792,
    lng: -77.0019,
    entidad: "INDECI / COEN",
    capacidad: "Complejo deportivo nacional · nodo logístico de emergencia",
    contacto: "INDECI / COEN: 115",
    descripcion: "Complejo deportivo nacional apto como nodo logístico ante sismo de gran magnitud."
  },
  {
    id: "albergue-04",
    nombre: "Coliseo Casa de la Juventud (Cusco)",
    tipo: "albergue",
    departamento: "cusco",
    lat: -13.5283,
    lng: -71.9611,
    entidad: "Gobierno Regional",
    capacidad: "Coliseo techado · habilitable como refugio altoandino",
    contacto: "INDECI / COEN: 115",
    descripcion: "Espacio protegido para refugio de poblaciones altoandinas ante heladas."
  },
  {
    id: "albergue-05",
    nombre: "Estadio Mariscal Cáceres (Tumbes)",
    tipo: "albergue",
    departamento: "tumbes",
    lat: -3.5714,
    lng: -80.4561,
    entidad: "INDECI / COEN",
    capacidad: "Estadio IPD (≈12,000 aforo) · habilitable como refugio",
    contacto: "INDECI / COEN: 115",
    descripcion: "Recinto deportivo habilitable como refugio ante lluvias e inundaciones."
  },
  {
    id: "albergue-06",
    nombre: "Coliseo Arequipa",
    tipo: "albergue",
    departamento: "arequipa",
    lat: -16.4022,
    lng: -71.5342,
    entidad: "INDECI / COEN",
    capacidad: "Coliseo techado · habilitable como refugio temporal",
    contacto: "INDECI / COEN: 115",
    descripcion: "Instalación habilitable para atención humanitaria tras sismos o erupciones."
  }
];
