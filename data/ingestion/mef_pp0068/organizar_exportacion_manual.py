"""Organiza en Bronze las exportaciones manuales de Consulta Amigable (MEF) para el PP0068.

A diferencia de las demás fuentes (INDECI, Open-Meteo, USGS, NASA FIRMS, ONI), esta no tiene una
API ni un dataset abierto descargable de forma programática (ver sección de evaluación de fuentes
del informe): el Portal de Datos Abiertos del MEF solo publica el detalle transaccional completo
del gasto público (~7-10 GB por año, sin filtrar por programa presupuestal), y "Consulta Amigable"
(apps5.mineco.gob.pe/transparencia/Navegador) es un navegador ASP.NET WebForms sin API, que exige
filtrar y exportar a mano: Año -> "¿En qué se gasta?" -> Programas Presupuestales -> 0068 ->
"¿Dónde se gasta?" -> Departamento -> Exportar.

Por qué NO se automatiza el scraping (decisión, no descuido): se verificó (2026-08) que el portal
está detrás de Imperva Incapsula (bot-protection / WAF): tanto default.aspx como Navegar.aspx
devuelven recursos de Incapsula (_Incapsula_Resource). Automatizar la extracción sin intervención
exigiría evadir esa detección de bots, lo que no se hace. Además, el presupuesto del PP0068 es un
dato ANUAL (no diario), de modo que el pipeline diario no lo necesita en tiempo real: exportarlo a
mano una vez al año, con su sesión de navegador real, es el proceso correcto y suficiente. Este
script hace que ese paso anual sea rápido y verificable (valida el filtro PP0068, los 25
departamentos y el año, y reporta la cobertura), pero la descarga en sí es deliberadamente manual.

Cada exportación llega como un archivo con extensión .xls que en realidad es una tabla HTML (no
un binario de Excel real) — se preserva tal cual en Bronze, sin transformar el formato. Este
script solo mueve esos archivos exportados manualmente a data/bronze/mef_pp0068/local_data/,
extrayendo el año real desde el encabezado de la propia tabla (más confiable que el nombre de
archivo que asigna el navegador, que es un número arbitrario) y generando su manifest.json.

Uso (después de exportar manualmente cada año y colocar los .xls en ORIGEN_MANUAL):
    python organizar_exportacion_manual.py
"""

from __future__ import annotations

import json
import re
import shutil
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

# Carpeta donde se van dejando las exportaciones manuales antes de organizarlas (por defecto, la
# raíz de data/bronze/, que es donde caen si se copian directo desde la descarga del navegador).
ORIGEN_MANUAL = Path(__file__).parent.parent.parent / "bronze"
OUTPUT_DIR = Path(__file__).parent.parent.parent / "bronze" / "mef_pp0068" / "local_data"

FUENTE = "MEF - Consulta Amigable (Programa Presupuestal 0068 PREVAED, por departamento)"
URL_ORIGEN = "https://apps5.mineco.gob.pe/transparencia/Navegador/default.aspx"

VENTANA_ANIOS = range(2012, 2024)  # 2012-2023, igual que el resto del proyecto


def _extraer_anio(xls_path: Path) -> int:
    tablas = pd.read_html(xls_path)
    encabezado = str(tablas[0].iloc[0, 0])
    match = re.search(r"A.o de Ejecuci.n:\s*(\d{4})", encabezado)
    if not match:
        raise ValueError(f"No se pudo extraer el año del encabezado de {xls_path.name}")
    return int(match.group(1))


def _validar_contenido(xls_path: Path) -> None:
    tablas = pd.read_html(xls_path)
    categoria = str(tablas[1].iloc[1, 0])
    if "0068" not in categoria:
        raise ValueError(f"{xls_path.name} no está filtrado al PP0068 (encontrado: {categoria!r})")
    tabla_departamentos = tablas[3]
    if len(tabla_departamentos) != 25:
        raise ValueError(
            f"{xls_path.name}: se esperaban 25 departamentos, se encontraron {len(tabla_departamentos)}"
        )


def organizar() -> list[dict]:
    archivos = sorted(ORIGEN_MANUAL.glob("*.xls"))
    if not archivos:
        return []

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    resultado = []
    anios_vistos = set()

    for archivo in archivos:
        anio = _extraer_anio(archivo)
        _validar_contenido(archivo)

        if anio in anios_vistos:
            raise ValueError(f"Año {anio} duplicado (ya procesado otro archivo para ese año)")
        anios_vistos.add(anio)

        nombre_final = f"mef_pp0068_{anio}.xls"
        destino = OUTPUT_DIR / nombre_final
        shutil.move(str(archivo), str(destino))

        manifest = {
            "fuente": FUENTE,
            "anio": anio,
            "url_origen": URL_ORIGEN,
            "descarga_manual": True,
            "nota": (
                "Sin API/dataset programático disponible (ver docstring). Exportado a mano desde "
                "el navegador: Año -> ¿En qué se gasta? -> Programas Presupuestales -> 0068 -> "
                "¿Dónde se gasta? -> Departamento -> Exportar."
            ),
            "fecha_registro_utc": datetime.now(timezone.utc).isoformat(),
            "archivo_local": nombre_final,
        }
        manifest_path = OUTPUT_DIR / f"mef_pp0068_{anio}.manifest.json"
        manifest_path.write_text(
            json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        resultado.append(manifest)

    return resultado


def _anios_ya_organizados() -> list[int]:
    """Escanea Bronze (no solo lo procesado en esta corrida) para saber la cobertura real total,
    ya que este script se corre una vez por año a medida que se van exportando manualmente."""
    return sorted(
        json.loads(m.read_text(encoding="utf-8"))["anio"]
        for m in OUTPUT_DIR.glob("mef_pp0068_*.manifest.json")
    )


def main() -> None:
    resultado = organizar()
    print(f"Organizados {len(resultado)} archivos nuevos en {OUTPUT_DIR}")

    anios_totales = _anios_ya_organizados()
    anios_faltantes = sorted(set(VENTANA_ANIOS) - set(anios_totales))

    print(f"Años cubiertos en total: {anios_totales}")
    if anios_faltantes:
        print(f"Años FALTANTES en la ventana 2012-2023: {anios_faltantes}")
        print("\nPara cada año faltante, exporta a mano desde tu navegador (sesión real):")
        print(f"  1. Abre {URL_ORIGEN}")
        for anio in anios_faltantes:
            print(
                f"  2. Año {anio} -> ¿En qué se gasta? -> Programas Presupuestales -> 0068 "
                f"-> ¿Dónde se gasta? -> Departamento -> Exportar"
            )
        print(f"  3. Copia los .xls a {ORIGEN_MANUAL} y vuelve a correr este script.")
    else:
        print("Ventana 2012-2023 completa.")


if __name__ == "__main__":
    main()
