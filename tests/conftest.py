"""Hace importables los scripts de data/silver y data/gold en los tests.

No son un paquete Python instalable (son scripts standalone, ver data/README.md), así que cada
carpeta se agrega a sys.path para poder hacer `import limpieza_indeci`, `import dim_tiempo`, etc.
directamente, igual que hace data/quality/schemas.py con data/ingestion/open_meteo.
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent

for sub in [
    "data/silver/indeci",
    "data/silver/open_meteo",
    "data/silver/usgs",
    "data/silver/nasa_firms",
    "data/silver/noaa_oni",
    "data/silver/mef_pp0068",
    "data/gold",
]:
    sys.path.insert(0, str(ROOT / sub))
