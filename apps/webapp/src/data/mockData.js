export const LOGO_CENEPRED = "https://lh3.googleusercontent.com/aida-public/AB6AXuDVmjmpjymZJ7JDI7MSb12X3KHSUHwg4tvVHBLw8D5EBio7RAakaXl2sTKfwatTWyZ_t84mdN2mbixH91NAVKoVVGKvzl7bkxQBqAwcGi77pUZQ4gmoQV_C80RZYoWjydnS2F6eW7gb6qUGUuNupE5gdwLsro9w2-GYbYvX_M-b5QRHa3HtX09GxorFrGuUu_zziZm-G6jx5FczvkUbMfz9nTPtwe2vm7piPrkP59EfihE4Ia2W-T_Ang";
export const PROFILE_AVATAR = "https://lh3.googleusercontent.com/aida-public/AB6AXuD8jz68D6Jdn2vrp2B1EXhtnnZetQZ-L18u9Z-kSluvQ4urv9dJ4x6m-21X1df2W8MLcQDAzH4Jy3v96OXlIVXUpDIuJMwoJD72UuQ9OXxgsvOR6zXTH-YuXlLDTKtulsA5__uk6ow2_PTbxPk-Z3EJ_G7rc4F-VyV0XxQ2T9yBuCmOhA7OtLcMZOJmqmCh-lTXg1cHt2wqAVvp60TxJbXeTXNzM7UjTPix1BrE_Ob8TCnjkolocvJnIA";

export const PERU_DEPARTAMENTOS = {
  "piura": {
    name: "Piura",
    prob: 78,
    tag: "Crítico",
    tagColor: "error",
    needleDeg: 50,
    shap: [
      { name: "Lluvia 7d (mm)", val: "+24.5", pct: 80, color: "#ba1a1a" },
      { name: "Anomalía Climática", val: "+12.3", pct: 45, color: "#006686" },
      { name: "Historial SINPAD", val: "+8.1", pct: 30, color: "#565e74" },
      { name: "Focos Calor", val: "+2.0", pct: 10, color: "#94a3b8" }
    ]
  },
  "tumbes": {
    name: "Tumbes",
    prob: 82,
    tag: "Muy Alto",
    tagColor: "error",
    needleDeg: 60,
    shap: [
      { name: "Precipitación 7d", val: "+28.1", pct: 85, color: "#ba1a1a" },
      { name: "Desborde de Ríos", val: "+15.4", pct: 50, color: "#006686" },
      { name: "Historial Emergencias", val: "+7.2", pct: 25, color: "#565e74" },
      { name: "Sismos Cercanos", val: "+1.5", pct: 8, color: "#94a3b8" }
    ]
  },
  "lambayeque": {
    name: "Lambayeque",
    prob: 74,
    tag: "Muy Alto",
    tagColor: "error",
    needleDeg: 40,
    shap: [
      { name: "Lluvias en Cuenca Alta", val: "+21.0", pct: 70, color: "#ba1a1a" },
      { name: "Anomalía Térmica", val: "+10.8", pct: 40, color: "#006686" },
      { name: "Vulnerabilidad Urbana", val: "+9.0", pct: 32, color: "#565e74" },
      { name: "Focos de Calor", val: "+1.8", pct: 9, color: "#94a3b8" }
    ]
  },
  "apurimac": {
    name: "Apurímac",
    prob: 88,
    tag: "Alto",
    tagColor: "tertiary",
    needleDeg: 70,
    shap: [
      { name: "Focos de Calor Activos", val: "+32.4", pct: 90, color: "#006686" },
      { name: "Historial Heladas/Friajes", val: "+18.2", pct: 55, color: "#ba1a1a" },
      { name: "Sismos Cercanos (USGS)", val: "+5.1", pct: 20, color: "#565e74" },
      { name: "Precipitación 7d", val: "+2.3", pct: 10, color: "#94a3b8" }
    ]
  },
  "lima": {
    name: "Lima",
    prob: 65,
    tag: "Medio",
    tagColor: "secondary",
    needleDeg: 15,
    shap: [
      { name: "Densidad Poblacional", val: "+19.2", pct: 60, color: "#565e74" },
      { name: "Lluvias Cuenca Rímac", val: "+11.5", pct: 40, color: "#006686" },
      { name: "Histórico Huaycos", val: "+8.4", pct: 30, color: "#ba1a1a" },
      { name: "Sismos Recientes", val: "+3.1", pct: 12, color: "#94a3b8" }
    ]
  },
  "arequipa": {
    name: "Arequipa",
    prob: 52,
    tag: "Medio",
    tagColor: "secondary",
    needleDeg: -10,
    shap: [
      { name: "Actividad Sísmica (USGS)", val: "+16.8", pct: 55, color: "#565e74" },
      { name: "Déficit Hídrico", val: "+9.2", pct: 35, color: "#006686" },
      { name: "Focos de Calor", val: "+4.1", pct: 15, color: "#ba1a1a" },
      { name: "Lluvias Estacionales", val: "+1.2", pct: 5, color: "#94a3b8" }
    ]
  },
  "cajamarca": {
    name: "Cajamarca",
    prob: 45,
    tag: "Moderado",
    tagColor: "secondary",
    needleDeg: -25,
    shap: [
      { name: "Precipitación Acumulada", val: "+12.4", pct: 42, color: "#006686" },
      { name: "Pendiente Terreno", val: "+8.1", pct: 28, color: "#565e74" },
      { name: "Focos de Calor", val: "+3.2", pct: 12, color: "#ba1a1a" },
      { name: "Sismos 7d", val: "+0.8", pct: 4, color: "#94a3b8" }
    ]
  }
};

export const TABLAS_MEF_DEPARTAMENTO = [
  { depto: "Piura", pim: "245.3", ejec: "22.4%", pct: 22.4, riesgo: "Muy Alto", estado: "warning", alertMsg: "Alerta: Baja ejecución vs Alto Riesgo" },
  { depto: "Lambayeque", pim: "180.1", ejec: "35.2%", pct: 35.2, riesgo: "Muy Alto", estado: "priority_high", alertMsg: "Riesgo extremo con ejecución baja" },
  { depto: "Tumbes", pim: "95.4", ejec: "18.5%", pct: 18.5, riesgo: "Alto", estado: "warning", alertMsg: "Baja ejecución presupuestal" },
  { depto: "La Libertad", pim: "210.8", ejec: "68.1%", pct: 68.1, riesgo: "Alto", estado: "check_circle", alertMsg: "Ejecución alineada" },
  { depto: "Lima Provincias", pim: "155.2", ejec: "52.4%", pct: 52.4, riesgo: "Medio", estado: "info", alertMsg: "Ejecución media" }
];

export const PLIEGOS_EJECUTORES = [
  { nombre: "MINDEF - Ejército", monto: "S/ 450M (82%)", pct: 82, color: "bg-emerald-500" },
  { nombre: "MINSA - DIGESA", monto: "S/ 210M (75%)", pct: 75, color: "bg-emerald-500" },
  { nombre: "MTC - Provias", monto: "S/ 680M (68%)", pct: 68, color: "bg-secondary" },
  { nombre: "ANA", monto: "S/ 120M (45%)", pct: 45, color: "bg-tertiary" },
  { nombre: "INDECI", monto: "S/ 150M (28%)", pct: 28, color: "bg-error", isAlert: true }
];
