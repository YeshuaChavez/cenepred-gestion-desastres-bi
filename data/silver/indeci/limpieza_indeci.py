"""Limpia y estandariza el histórico de emergencias de INDECI (Bronze -> Silver).

Lee los 12 shapefiles anuales (2012-2023) ya descargados en data/bronze/indeci/local_data/,
los concatena, estandariza nombres de campo y tipos, valida reglas de calidad equivalentes a
las de Great Expectations (sección 4.4 del informe: completitud de campos clave ≥ 98%,
consistencia de Ubigeo, sin duplicados), y escribe el resultado limpio.

No construye aún el modelo dimensional (esa es tarea de Gold): esto es solo la capa Silver,
"datos limpios y estandarizados a un grano común" (sección 5.2 del informe). El campo
`severidad` (derivado) tampoco se calcula aquí, se calcula en Gold a partir de estos campos ya
limpios.

Uso:
    python limpieza_indeci.py
"""

from __future__ import annotations

import json
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from tempfile import TemporaryDirectory

import geopandas as gpd
import pandas as pd

BRONZE_DIR = Path(__file__).parent.parent.parent / "bronze" / "indeci" / "local_data"
OUTPUT_DIR = Path(__file__).parent / "local_data"

# Mapeo de columnas crudas del shapefile de INDECI a nombres estandarizados (ver sección 5.4
# del informe, actualizada con los campos granulares reales de severidad).
COLUMN_RENAME = {
    "ide_sinpad": "emergencia_id",
    "cod_ubigeo": "ubigeo",
    "departamen": "departamento",
    "provincia": "provincia",
    "distrito": "distrito",
    "region": "region_natural",
    "fenomeno": "tipo_fenomeno",
    "safecta": "cantidad_afectados",
    "sdamni": "cantidad_damnificados",
    "sfalle": "cantidad_fallecidos",
    "slesi": "cantidad_lesionados",
    "sdesa": "cantidad_desaparecidos",
    "safectaviv": "viviendas_afectadas",
    "sdestruviv": "viviendas_destruidas",
    "num_posx": "longitud",
    "num_posy": "latitud",
}

CAMPOS_CLAVE = ["fecha", "ubigeo", "emergencia_id"]
META_COMPLETITUD_MINIMA = 0.98  # sección 11.1 del informe

# Algunos años del shapefile de INDECI traen el nombre de departamento con la letra acentuada
# corrupta (verificado: no es un problema de encoding elegible - se probó latin1, cp1252, utf-8
# e iso-8859-1 y todos fallan igual; el carácter de reemplazo ni siquiera es consistente entre
# años, a veces sale como U+FFFD y a veces como la vocal acentuada real). Por eso la corrección
# usa una expresión regular con "." (cualquier carácter) en la posición de la vocal acentuada,
# en vez de comparar contra un valor exacto — así corrige el caso corrupto y el caso ya bien
# acentuado con la misma regla. Los 4 nombres con acento están en la lista canónica de 25
# regiones (ver data/ingestion/open_meteo/regiones_peru.py).
CORRECCION_DEPARTAMENTO = {
    r"^APUR.MAC$": "APURIMAC",
    r"^HU.NUCO$": "HUANUCO",
    r"^JUN.N$": "JUNIN",
    r"^SAN MART.N$": "SAN MARTIN",
}

# Mismo problema de bytes corruptos que en CORRECCION_DEPARTAMENTO, pero en tipo_fenomeno (73
# valores distintos encontrados, varios de ellos la misma categoría partida en dos por el
# carácter dañado, ej. "DEFORESTACION" y "DEFORESTACI.N" contados por separado). Se unifica sin
# tilde (consistente con el resto de campos de texto, que tampoco llevan tilde tras el .upper()).
CORRECCION_TIPO_FENOMENO = {
    r"^SEQU.AS$": "SEQUIAS",
    r"^D.FICIT H.DRICO$": "DEFICIT HIDRICO",
    r"^INUNDACI.N POR DESBORDE DE RIO$": "INUNDACION POR DESBORDE DE RIO",
    r"^TORMENTAS EL.CTRICAS$": "TORMENTAS ELECTRICAS",
    r"^INUNDACI.N POR DESBORDE DE CANALES$": "INUNDACION POR DESBORDE DE CANALES",
    r"^REPTACI.N$": "REPTACION",
    r"^TEMPESTADES EL.CTRICAS$": "TEMPESTADES ELECTRICAS",
    r"^OTROS PELIGROS ANTR.PICOS$": "OTROS PELIGROS ANTROPICOS",
    r"^OTROS PELIGROS HIDROMETEOROL.GICOS Y OCEANOGR.FICOS$": (
        "OTROS PELIGROS HIDROMETEOROLOGICOS Y OCEANOGRAFICOS"
    ),
    r"^DESERTIFICACI.N$": "DESERTIFICACION",
    r"^INUNDACI.N POR DESBORDE LAGO O LAGUNA$": "INUNDACION POR DESBORDE LAGO O LAGUNA",
    r"^INUNDACI.N POR DESBORDE EN LA RUPTURA DE DIQUES$": (
        "INUNDACION POR DESBORDE EN LA RUPTURA DE DIQUES"
    ),
    r"^DEGLACIACI.N$": "DEGLACIACION",
    r"^ACCI\. DE TRANSPORTE MEDIO A.REO$": "ACCI. DE TRANSPORTE MEDIO AEREO",
    r"^ACCI\. DE TRANSPORTE MEDIO ACUATICO MAR.TIMO$": (
        "ACCI. DE TRANSPORTE MEDIO ACUATICO MARITIMO"
    ),
    r"^DEFORESTACI.N$": "DEFORESTACION",
}


def _leer_shapefile_de_zip(zip_path: Path) -> gpd.GeoDataFrame:
    with TemporaryDirectory() as tmp:
        with zipfile.ZipFile(zip_path) as z:
            z.extractall(tmp)
        shp_files = list(Path(tmp).glob("*.shp"))
        if not shp_files:
            raise FileNotFoundError(f"No se encontró un .shp dentro de {zip_path}")
        gdf = gpd.read_file(shp_files[0])
        # Los shapefiles de 2018, 2022 y 2023 usan nombres de columna en MAYÚSCULAS (o mixtos en
        # 2023: "Fecha", "Departamen"), a diferencia del resto de años que usan minúsculas. Sin
        # esta normalización, el rename posterior no los reconoce y esos años quedan con todos
        # los campos clave en NaN de forma silenciosa (se detectó porque 3 años completos
        # "desaparecían" del resultado final sin ningún error).
        gdf.columns = [c.lower() if c != "geometry" else c for c in gdf.columns]
        # geopandas cierra el archivo fuente al leer, así que es seguro salir del TemporaryDirectory
        return gdf.copy()


def cargar_historico() -> gpd.GeoDataFrame:
    zips = sorted(BRONZE_DIR.glob("indeci_*.zip"))
    if not zips:
        raise FileNotFoundError(f"No hay archivos indeci_*.zip en {BRONZE_DIR}")

    partes = []
    for zip_path in zips:
        gdf = _leer_shapefile_de_zip(zip_path)
        gdf["anio_archivo"] = zip_path.stem.replace("indeci_", "")
        partes.append(gdf)

    return gpd.GeoDataFrame(pd.concat(partes, ignore_index=True), crs=partes[0].crs)


def limpiar(gdf: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
    # Completitud real del ID oficial de SINPAD, medida ANTES de limpiar/renombrar: algunos años
    # (2018, 2022, 2023) traen filas con ide_sinpad nulo. Si se mide después de cualquier arreglo,
    # el reporte de calidad terminaría ocultando el problema real de la fuente.
    completitud_id_sinpad_cruda = gdf["ide_sinpad"].notna().mean()

    gdf = gdf.rename(columns=COLUMN_RENAME)

    # Fecha: el origen usa DD/MM/YYYY como texto.
    gdf["fecha"] = pd.to_datetime(gdf["fecha"], format="%d/%m/%Y", errors="coerce")

    # Ubigeo: estandarizar a string de 6 dígitos con cero a la izquierda (regla de la sección 4.4).
    gdf["ubigeo"] = gdf["ubigeo"].astype(str).str.strip().str.zfill(6)

    # Texto: mayúsculas y sin espacios extremos, consistente entre años.
    for col in ["departamento", "provincia", "distrito", "region_natural", "tipo_fenomeno"]:
        gdf[col] = gdf[col].astype(str).str.strip().str.upper()

    # Corregir nombres con la letra acentuada corrupta (ver CORRECCION_DEPARTAMENTO/TIPO_FENOMENO).
    gdf["departamento"] = gdf["departamento"].replace(CORRECCION_DEPARTAMENTO, regex=True)
    gdf["tipo_fenomeno"] = gdf["tipo_fenomeno"].replace(CORRECCION_TIPO_FENOMENO, regex=True)

    # Separar filas sin id oficial de SINPAD (emergencia_id nulo). Verificado empíricamente:
    # en 2018/2022/2023 estas filas vienen completamente vacías (fecha, ubigeo, fenómeno y
    # todos los conteos de daño en NaN; solo conservan una coordenada de geometría) — son filas
    # placeholder/basura del shapefile de origen, no emergencias reales, así que se descartan
    # en vez de conservarlas con un id inventado.
    con_id = gdf[gdf["emergencia_id"].notna()].copy()
    sin_id = gdf[gdf["emergencia_id"].isna()].copy()

    campos_negocio = ["fecha", "ubigeo", "tipo_fenomeno", "cantidad_afectados"]
    sin_id_con_datos = sin_id[sin_id[campos_negocio].notna().any(axis=1)]
    filas_vacias_descartadas = len(sin_id) - len(sin_id_con_datos)
    if len(sin_id_con_datos) > 0:
        # Si alguna vez aparecen filas sin id oficial pero CON datos reales, no se descartan
        # silenciosamente: se conservan con un id sintético para no perder información real.
        sin_id_con_datos = sin_id_con_datos.reset_index(drop=True)
        sin_id_con_datos["emergencia_id"] = [
            f"SIN_ID_{i:06d}" for i in range(len(sin_id_con_datos))
        ]
        sin_id_con_datos["emergencia_id_generado"] = True

    # Deduplicar por emergencia_id (id oficial de SINPAD) entre las filas que sí lo tienen.
    antes = len(con_id)
    con_id = con_id.drop_duplicates(subset="emergencia_id")
    duplicados_removidos = antes - len(con_id)

    # emergencia_id llega como float (ej. 117516.0) desde el shapefile; se castea a string de
    # enteros para que sea del mismo tipo que los ids sintéticos "SIN_ID_xxxxxx" y no falle al
    # escribir a Parquet con un tipo de columna mixto.
    con_id["emergencia_id"] = con_id["emergencia_id"].astype("int64").astype(str)
    con_id["emergencia_id_generado"] = False

    gdf = pd.concat([con_id, sin_id_con_datos], ignore_index=True)

    columnas_finales = [
        "emergencia_id", "emergencia_id_generado", "fecha", "anio_archivo", "ubigeo",
        "departamento", "provincia", "distrito", "region_natural", "tipo_fenomeno",
        "cantidad_afectados", "cantidad_damnificados", "cantidad_fallecidos",
        "cantidad_lesionados", "cantidad_desaparecidos", "viviendas_afectadas",
        "viviendas_destruidas", "longitud", "latitud", "geometry",
    ]
    gdf = gdf[columnas_finales]
    gdf.attrs["duplicados_removidos"] = duplicados_removidos
    gdf.attrs["filas_vacias_descartadas"] = filas_vacias_descartadas
    gdf.attrs["completitud_id_sinpad_cruda"] = completitud_id_sinpad_cruda
    return gdf


def validar_calidad(gdf: gpd.GeoDataFrame) -> dict:
    resultado = {"total_filas": len(gdf), "reglas": []}

    for campo in CAMPOS_CLAVE:
        if campo == "emergencia_id":
            # La completitud real de este campo se mide sobre el id oficial de SINPAD antes de
            # generar ids sinteticos para las filas que no lo traian (ver limpiar()); medirla
            # despues ocultaria el hueco real de la fuente, ya que todas las filas quedan con
            # un id no nulo (real o generado) al final del proceso.
            completitud = gdf.attrs["completitud_id_sinpad_cruda"]
        else:
            completitud = gdf[campo].notna().mean()
        ok = completitud >= META_COMPLETITUD_MINIMA
        resultado["reglas"].append(
            {
                "regla": f"completitud_{campo}",
                "meta": META_COMPLETITUD_MINIMA,
                "valor": round(completitud, 4),
                "ok": bool(ok),
            }
        )

    ubigeo_valido = gdf["ubigeo"].str.match(r"^\d{6}$").mean()
    resultado["reglas"].append(
        {
            "regla": "consistencia_ubigeo_formato",
            "meta": 1.0,
            "valor": round(ubigeo_valido, 4),
            "ok": bool(round(ubigeo_valido, 6) >= 1.0),
        }
    )

    resultado["duplicados_removidos"] = int(gdf.attrs.get("duplicados_removidos", 0))
    resultado["filas_vacias_descartadas"] = int(gdf.attrs.get("filas_vacias_descartadas", 0))
    resultado["nota"] = (
        "La completitud de emergencia_id se mide sobre el total crudo (incluyendo filas "
        "vacías descartadas), por eso puede fallar el umbral aunque el dataset Silver final "
        "quede 100% completo: refleja un problema real de calidad en la fuente (INDECI), no "
        "del proceso de limpieza."
    )
    resultado["todas_las_reglas_ok"] = all(r["ok"] for r in resultado["reglas"])
    return resultado


def main() -> None:
    gdf_crudo = cargar_historico()
    print(f"Cargados {len(gdf_crudo)} registros crudos de {gdf_crudo['anio_archivo'].nunique()} años.")

    gdf_limpio = limpiar(gdf_crudo)
    reporte = validar_calidad(gdf_limpio)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    parquet_path = OUTPUT_DIR / "indeci_emergencias_2012_2023.parquet"
    gdf_limpio.to_parquet(parquet_path)

    reporte_path = OUTPUT_DIR / "indeci_calidad.json"
    reporte["fecha_procesamiento_utc"] = datetime.now(timezone.utc).isoformat()
    reporte_path.write_text(json.dumps(reporte, ensure_ascii=False, indent=2), encoding="utf-8")

    print(
        f"Registros limpios: {len(gdf_limpio)} "
        f"(duplicados removidos: {reporte['duplicados_removidos']}, "
        f"filas vacías descartadas: {reporte['filas_vacias_descartadas']})"
    )
    print(f"Guardado en {parquet_path}")
    print(f"Reporte de calidad: {reporte_path}")
    for regla in reporte["reglas"]:
        estado = "OK" if regla["ok"] else "FALLA"
        print(f"  [{estado}] {regla['regla']}: {regla['valor']} (meta {regla['meta']})")


if __name__ == "__main__":
    main()
