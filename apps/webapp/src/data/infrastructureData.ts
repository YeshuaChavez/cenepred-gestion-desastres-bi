export interface InfrastructureItem {
  id: string;
  nombre: string;
  tipo: 'hospital' | 'puente' | 'albergue';
  departamento: string;
  lat: number;
  lng: number;
  entidad: 'MINSA' | 'EsSalud' | 'MTC / PROVIAS' | 'INDECI / COEN' | 'Gobierno Regional';
  capacidad: string;
  estado: 'operativo' | 'alerta' | 'critico';
  contacto: string;
  descripcion: string;
}

export const INFRAESTRUCTURA_CRITICA: InfrastructureItem[] = [
  // 🏥 HOSPITALES Y CENTROS DE SALUD ESTRATÉGICOS
  {
    id: "hosp-01",
    nombre: "Hospital de Apoyo II-2 Sullana",
    tipo: "hospital",
    departamento: "piura",
    lat: -4.9039,
    lng: -80.6853,
    entidad: "MINSA",
    capacidad: "140 Camas • Unidad de Cuidados Intensivos",
    estado: "alerta",
    contacto: "Central COEN Salud: (01) 315-6600",
    descripcion: "Punto nodal de atención traumatológica y epidemiológica en cuenca baja del Río Chira."
  },
  {
    id: "hosp-02",
    nombre: "Hospital Regional José Alfredo Mendoza Olavarría (JAMO)",
    tipo: "hospital",
    departamento: "tumbes",
    lat: -3.5681,
    lng: -80.4439,
    entidad: "MINSA",
    capacidad: "110 Camas • Módulo de Aislamiento Infeccioso",
    estado: "critico",
    contacto: "Emergencias JAMO: (072) 522-441",
    descripcion: "Hospital de referencia fronterizo en zona de inundación por crecida del Río Tumbes."
  },
  {
    id: "hosp-03",
    nombre: "Hospital Nacional Edgardo Rebagliati Martins",
    tipo: "hospital",
    departamento: "lima",
    lat: -12.0784,
    lng: -77.0375,
    entidad: "EsSalud",
    capacidad: "1,200 Camas • Centro de Trauma Shock Nacional",
    estado: "operativo",
    contacto: "Central de Emergencias EsSalud: 107",
    descripcion: "Máximo centro de referencia asistencial y soporte médico de alta complejidad del país."
  },
  {
    id: "hosp-04",
    nombre: "Hospital Regional del Cusco",
    tipo: "hospital",
    departamento: "cusco",
    lat: -13.5256,
    lng: -71.9542,
    entidad: "MINSA",
    capacidad: "320 Camas • Base Helitransportada",
    estado: "operativo",
    contacto: "Central SAMU Cusco: 106",
    descripcion: "Centro de respuesta médica de la sierra sur para rescates en zonas de huaicos y heladas."
  },
  {
    id: "hosp-05",
    nombre: "Hospital Honorio Delgado Espinoza",
    tipo: "hospital",
    departamento: "arequipa",
    lat: -16.4172,
    lng: -71.5306,
    entidad: "MINSA",
    capacidad: "450 Camas • Banco de Sangre Macrorregional",
    estado: "operativo",
    contacto: "Emergencia Honorio Delgado: (054) 231-818",
    descripcion: "Hospital general macrorregional con protocolos de evacuación ante erupción volcánica y sismos."
  },
  {
    id: "hosp-06",
    nombre: "Hospital Regional Víctor Ramos Guardia",
    tipo: "hospital",
    departamento: "ancash",
    lat: -9.5312,
    lng: -77.5264,
    entidad: "MINSA",
    capacidad: "180 Camas • Centro Quirúrgico",
    estado: "alerta",
    contacto: "Central SAMU Huaraz: 106",
    descripcion: "Principal centro hospitalario en el Callejón de Huaylas ante riesgo de aluviones cordilleranos."
  },
  {
    id: "hosp-07",
    nombre: "Hospital Regional de Loreto Felipe Arriola Medina",
    tipo: "hospital",
    departamento: "loreto",
    lat: -3.7589,
    lng: -73.2622,
    entidad: "MINSA",
    capacidad: "260 Camas • Servicio Fluvial de Emergencias",
    estado: "operativo",
    contacto: "Central Emergencias Loreto: (065) 264-880",
    descripcion: "Referencia fluvial amazónica para atención médica de inundaciones en cuencas de los ríos Ucayali y Marañón."
  },
  {
    id: "hosp-08",
    nombre: "Hospital Regional Manuel Núñez Butrón",
    tipo: "hospital",
    departamento: "puno",
    lat: -15.8361,
    lng: -70.0272,
    entidad: "MINSA",
    capacidad: "210 Camas • Módulo para Neumonías e Hipotermia",
    estado: "alerta",
    contacto: "Emergencias Puno: (051) 351-010",
    descripcion: "Punto de atención crítica del Altiplano ante temporadas de heladas extremas y nevadas."
  },

  // 🌉 PUENTES Y CORREDORES VIALES VULNERABLES
  {
    id: "bridge-01",
    nombre: "Puente Simón Rodríguez (Carretera Panamericana Norte)",
    tipo: "puente",
    departamento: "piura",
    lat: -4.9521,
    lng: -80.7511,
    entidad: "MTC / PROVIAS",
    capacidad: "Longitud: 310m • Tránsito Pesado Interprovincial",
    estado: "critico",
    contacto: "PROVIAS Nacional: (01) 615-7800",
    descripcion: "Estructura sobre el Río Chira con socavación de estribos bajo caudales superiores a 1,200 m³/s."
  },
  {
    id: "bridge-02",
    nombre: "Puente Ricardo Palma (Carretera Central km 38)",
    tipo: "puente",
    departamento: "lima",
    lat: -11.9167,
    lng: -76.6542,
    entidad: "MTC / PROVIAS",
    capacidad: "Corredor Logístico Lima - Centro del País",
    estado: "alerta",
    contacto: "SUTRAN Alerta Vial: 0800-12345",
    descripcion: "Punto crítico ante activación de quebradas en Chosica y desbordes del Río Rímac."
  },
  {
    id: "bridge-03",
    nombre: "Puente Reque (Panamericana Norte km 756)",
    tipo: "puente",
    departamento: "lambayeque",
    lat: -6.8667,
    lng: -79.8167,
    entidad: "MTC / PROVIAS",
    capacidad: "Longitud: 180m • Doble Calzada",
    estado: "critico",
    contacto: "PROVIAS Zonal Lambayeque: (074) 227-190",
    descripcion: "Vía de conexión interregional vulnerable a crecidas extraordinarias del Río Reque durante El Niño."
  },
  {
    id: "bridge-04",
    nombre: "Puente Huaycoloro (Autopista Ramiro Prialé)",
    tipo: "puente",
    departamento: "lima",
    lat: -12.0125,
    lng: -76.9531,
    entidad: "Gobierno Regional",
    capacidad: "Puente Modular Tipo Bailey • 45m",
    estado: "alerta",
    contacto: "COER Lima Metropolitana: (01) 632-1300",
    descripcion: "Punto de descarga de la Quebrada Huaycoloro con antecedentes de colapso por flujos de lodo."
  },
  {
    id: "bridge-05",
    nombre: "Puente Virú (Panamericana Norte km 521)",
    tipo: "puente",
    departamento: "la_libertad",
    lat: -8.4167,
    lng: -78.7500,
    entidad: "MTC / PROVIAS",
    capacidad: "Longitud: 130m • Tránsito Agroexportador",
    estado: "alerta",
    contacto: "COER La Libertad: (044) 607-700",
    descripcion: "Estructura estratégica que comunica Trujillo y Chimbote con monitoreo de defensas ribereñas."
  },
  {
    id: "bridge-06",
    nombre: "Puente Cunyac (Ruta Cusco - Abancay)",
    tipo: "puente",
    departamento: "apurimac",
    lat: -13.5603,
    lng: -72.5694,
    entidad: "MTC / PROVIAS",
    capacidad: "Longitud: 95m sobre Río Apurímac",
    estado: "operativo",
    contacto: "PROVIAS Sur: (083) 321-450",
    descripcion: "Paso cordillerano crítico para el abastecimiento de víveres y combustibles entre Apurímac y Cusco."
  },

  // ⛺ CENTROS DE REFUGIO Y ALBERGUES OFICIALES INDECI
  {
    id: "albergue-01",
    nombre: "Albergue Temporal Estadio Campeones del 36",
    tipo: "albergue",
    departamento: "piura",
    lat: -4.8981,
    lng: -80.6903,
    entidad: "INDECI / COEN",
    capacidad: "2,500 Personas • 450 Carpas Térmicas • Red de Agua",
    estado: "operativo",
    contacto: "Centro de Operaciones de Emergencia Regional: 115",
    descripcion: "Centro de refugio habilitado por INDECI con grupos electrógenos, cocina comunitaria y tópicos de salud."
  },
  {
    id: "albergue-02",
    nombre: "Refugio Comunal Coliseo Cerrado Gran Chimú",
    tipo: "albergue",
    departamento: "la_libertad",
    lat: -8.1092,
    lng: -79.0353,
    entidad: "INDECI / COEN",
    capacidad: "1,800 Personas • Centro Logístico de Ayuda Humanitaria",
    estado: "operativo",
    contacto: "INDECI Zonal Norte: (044) 203-344",
    descripcion: "Zona segura techada para evacuación de familias damnificadas por desborde de quebradas San Ildefonso y El León."
  },
  {
    id: "albergue-03",
    nombre: "Albergue de Emergencia Villa Deportiva Nacional (VIDENA)",
    tipo: "albergue",
    departamento: "lima",
    lat: -12.0792,
    lng: -77.0019,
    entidad: "INDECI / COEN",
    capacidad: "5,000 Personas • Pista de Aterrizaje Helicópteros",
    estado: "operativo",
    contacto: "COEN Nacional: (01) 224-1685",
    descripcion: "Principal nodo logístico y albergue de respuesta inmediata ante sismo de gran magnitud en Lima y Callao."
  },
  {
    id: "albergue-04",
    nombre: "Albergue Temporal Coliseo Cerrado Casa de la Juventud",
    tipo: "albergue",
    departamento: "cusco",
    lat: -13.5283,
    lng: -71.9611,
    entidad: "Gobierno Regional",
    capacidad: "1,200 Personas • Cobertores Térmicos y Calefacción",
    estado: "operativo",
    contacto: "Defensa Civil Cusco: (084) 227-061",
    descripcion: "Espacio protegido para refugio de poblaciones altoandinas ante heladas y temporales de nieve."
  },
  {
    id: "albergue-05",
    nombre: "Centro de Refugio Estadio Mariscal Cáceres",
    tipo: "albergue",
    departamento: "tumbes",
    lat: -3.5714,
    lng: -80.4561,
    entidad: "INDECI / COEN",
    capacidad: "1,500 Personas • Planta Potabilizadora Móvil",
    estado: "alerta",
    contacto: "COER Tumbes: (072) 524-110",
    descripcion: "Albergue equipado con bombas de achique y módulos prefabricados para familias desplazadas por lluvias."
  },
  {
    id: "albergue-06",
    nombre: "Albergue Temporal Coliseo Arequipa",
    tipo: "albergue",
    departamento: "arequipa",
    lat: -16.4022,
    lng: -71.5342,
    entidad: "INDECI / COEN",
    capacidad: "2,000 Personas • Depósito Avanzado de Alimentos",
    estado: "operativo",
    contacto: "INDECI Dirección Desconcentrada Arequipa: (054) 254-411",
    descripcion: "Instalación acondicionada para atención humanitaria inmediata tras movimientos telúricos o erupciones."
  }
];
