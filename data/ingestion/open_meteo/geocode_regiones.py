"""Resuelve lat/lon reales de la capital de cada región del Perú vía la API de geocodificación
de Open-Meteo, y las guarda en regiones_coordenadas.json (versionado: es dato de referencia
estable, no un resultado de ingesta).

Uso:
    python geocode_regiones.py
"""

from __future__ import annotations

import json
import time
from pathlib import Path

import requests

from regiones_peru import REGIONES_CAPITALES

GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
OUTPUT_PATH = Path(__file__).parent / "regiones_coordenadas.json"


def geocode_capital(capital: str) -> dict:
    response = requests.get(
        GEOCODING_URL,
        params={"name": capital, "country": "PE", "count": 5},
        timeout=30,
    )
    response.raise_for_status()
    results = response.json().get("results", [])
    peru_results = [r for r in results if r.get("country_code") == "PE"]
    if not peru_results:
        raise LookupError(f"No se encontró en Perú un resultado de geocodificación para '{capital}'")
    # Preferir el resultado con mayor población (normalmente la capital real, no un homónimo menor)
    peru_results.sort(key=lambda r: r.get("population", 0), reverse=True)
    return peru_results[0]


def main() -> None:
    resultado = []
    for region, capital in REGIONES_CAPITALES:
        match = geocode_capital(capital)
        resultado.append(
            {
                "region": region,
                "capital": capital,
                "latitud": match["latitude"],
                "longitud": match["longitude"],
                "admin1_geocoding": match.get("admin1"),
            }
        )
        print(f"{region} ({capital}) -> {match['latitude']}, {match['longitude']}")
        time.sleep(0.2)  # cortesía con la API pública

    OUTPUT_PATH.write_text(
        json.dumps(resultado, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"\nGuardado en {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
