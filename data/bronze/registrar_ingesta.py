"""Registra y cataloga en Bronze lo que las Functions de data/ingestion/ ya escribieron crudo.

Los archivos crudos en sí viven en data/bronze/{fuente}/local_data/ (representa localmente los
contenedores /bronze/indeci, /bronze/clima, /bronze/sismos, /bronze/incendios de ADLS Gen2);
data/ingestion/ contiene solo el código que los produce. Este script no transforma el contenido
original (esa es tarea de Silver): valida que cada archivo listado en un manifiesto de ingesta
realmente exista, calcula su tamaño y checksum, y produce un catálogo consolidado de metadatos
de ingesta (fecha, fuente, versión/checksum) para trazabilidad — ver sección 4.3 del informe
("Bronze: ... Registro de metadatos de ingesta (fecha, fuente, versión); sin transformación").

En producción, sobre Azure Databricks, este paso es el que registraría cada archivo como una
tabla Delta en /bronze y lo catalogaría en Microsoft Purview. Localmente, antes de tener esa
infraestructura, se limita a construir el catálogo como un JSON.

Uso:
    python registrar_ingesta.py
"""

from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

BRONZE_ROOT = Path(__file__).parent
OUTPUT_DIR = BRONZE_ROOT / "local_data"


def _sha256(path: Path, chunk_size: int = 1024 * 1024) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(chunk_size), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _find_manifiestos() -> list[Path]:
    return sorted(BRONZE_ROOT.glob("*/local_data/*.manifest.json"))


def registrar() -> list[dict]:
    catalogo = []
    for manifiesto_path in _find_manifiestos():
        manifiesto = json.loads(manifiesto_path.read_text(encoding="utf-8"))
        fuente_dir = manifiesto_path.parent.parent.name  # ej. "indeci", "open_meteo"
        archivo_path = manifiesto_path.parent / manifiesto["archivo_local"]

        if not archivo_path.exists():
            entrada = {
                "fuente_dir": fuente_dir,
                "archivo": manifiesto["archivo_local"],
                "estado": "FALTANTE",
                "manifiesto_original": manifiesto,
            }
        else:
            entrada = {
                "fuente_dir": fuente_dir,
                "archivo": manifiesto["archivo_local"],
                "estado": "REGISTRADO",
                "tamano_bytes": archivo_path.stat().st_size,
                "checksum_sha256": _sha256(archivo_path),
                "fecha_registro_bronze_utc": datetime.now(timezone.utc).isoformat(),
                "manifiesto_original": manifiesto,
            }
        catalogo.append(entrada)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    catalogo_path = OUTPUT_DIR / "catalogo_bronze.json"
    catalogo_path.write_text(json.dumps(catalogo, ensure_ascii=False, indent=2), encoding="utf-8")
    return catalogo


def main() -> None:
    catalogo = registrar()
    registrados = sum(1 for c in catalogo if c["estado"] == "REGISTRADO")
    faltantes = sum(1 for c in catalogo if c["estado"] == "FALTANTE")
    print(f"Catálogo Bronze: {registrados} archivos registrados, {faltantes} faltantes.")
    for entrada in catalogo:
        print(f"  [{entrada['estado']}] {entrada['fuente_dir']}/{entrada['archivo']}")


if __name__ == "__main__":
    main()
