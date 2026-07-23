"""Las 25 regiones (departamentos) del Perú y su ciudad capital.

Sirve como lista de referencia para resolver un punto representativo (lat/lon) por región al
consultar Open-Meteo, ya que esa API requiere coordenadas puntuales, no polígonos administrativos.
Los nombres de región coinciden con el campo `departamen` observado en el shapefile de INDECI
(ver data/ingestion/indeci/).
"""

REGIONES_CAPITALES = [
    ("AMAZONAS", "Chachapoyas"),
    ("ANCASH", "Huaraz"),
    ("APURIMAC", "Abancay"),
    ("AREQUIPA", "Arequipa"),
    ("AYACUCHO", "Ayacucho"),
    ("CAJAMARCA", "Cajamarca"),
    ("CALLAO", "Callao"),
    ("CUSCO", "Cusco"),
    ("HUANCAVELICA", "Huancavelica"),
    ("HUANUCO", "Huánuco"),
    ("ICA", "Ica"),
    ("JUNIN", "Huancayo"),
    ("LA LIBERTAD", "Trujillo"),
    ("LAMBAYEQUE", "Chiclayo"),
    ("LIMA", "Lima"),
    ("LORETO", "Iquitos"),
    ("MADRE DE DIOS", "Puerto Maldonado"),
    ("MOQUEGUA", "Moquegua"),
    ("PASCO", "Cerro de Pasco"),
    ("PIURA", "Piura"),
    ("PUNO", "Puno"),
    ("SAN MARTIN", "Moyobamba"),
    ("TACNA", "Tacna"),
    ("TUMBES", "Tumbes"),
    ("UCAYALI", "Pucallpa"),
]
