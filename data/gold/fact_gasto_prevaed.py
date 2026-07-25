"""Construye FACT_GASTO_PREVAED (Silver -> Gold): grano = región x año.

Solo para el panel de Impacto Socioeconómico del dashboard (sección 9.5 del informe) — a
diferencia de FACT_EMERGENCIAS y FACT_MONITOREO_DIARIO, esta tabla no alimenta ningún modelo de
ML (ver evaluación: el grano anual la vuelve redundante con `tasa_hist_region_mes` a nivel diario,
y hay riesgo de causalidad invertida — el gasto sigue al riesgo ya conocido, no lo predice).

No se une a DIM_TIEMPO por `fecha_id`: el dato de MEF es agregado por año, no por día, y forzar un
FK a un día arbitrario (ej. 1 de enero) daría una falsa sensación de precisión diaria que no
existe en la fuente. En su lugar, `anio` queda como atributo directo (coincide con la columna
`anio` que ya tiene DIM_TIEMPO, pero sin pretender ser una fecha puntual).

Requiere haber corrido antes dim_region.py.

Uso:
    python fact_gasto_prevaed.py
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

GOLD_DIR = Path(__file__).parent / "local_data"
MEF_SILVER = (
    Path(__file__).parent.parent / "silver" / "mef_pp0068" / "local_data"
    / "mef_pp0068_gasto_2012_2023.parquet"
)


def construir() -> pd.DataFrame:
    mef = pd.read_parquet(MEF_SILVER)
    dim_region = pd.read_parquet(GOLD_DIR / "dim_region.parquet")[["region_id", "departamento"]]

    df = mef.merge(dim_region, on="departamento", how="left")

    columnas = [
        "region_id", "anio", "monto_pia", "monto_pim", "monto_certificado",
        "monto_comprometido_anual", "monto_devengado", "monto_girado", "avance_pct",
    ]
    return df[columnas]


def validar_calidad(df: pd.DataFrame) -> dict:
    resultado = {"total_filas": len(df), "reglas": []}

    for campo in ["region_id", "anio", "monto_devengado"]:
        completitud = df[campo].notna().mean()
        resultado["reglas"].append(
            {
                "regla": f"completitud_{campo}",
                "meta": 1.0,
                "valor": round(completitud, 4),
                "ok": bool(round(completitud, 6) >= 1.0),
            }
        )

    grano_unico = not df.duplicated(subset=["region_id", "anio"]).any()
    resultado["grano_region_anio_unico"] = bool(grano_unico)

    montos_no_negativos = bool((df["monto_devengado"].dropna() >= 0).all())
    resultado["montos_devengados_no_negativos"] = montos_no_negativos

    resultado["todas_las_reglas_ok"] = bool(
        all(r["ok"] for r in resultado["reglas"]) and grano_unico and montos_no_negativos
    )
    return resultado


def main() -> None:
    df = construir()
    reporte = validar_calidad(df)

    parquet_path = GOLD_DIR / "fact_gasto_prevaed.parquet"
    df.to_parquet(parquet_path)

    reporte_path = GOLD_DIR / "fact_gasto_prevaed_calidad.json"
    reporte["fecha_procesamiento_utc"] = datetime.now(timezone.utc).isoformat()
    reporte_path.write_text(json.dumps(reporte, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"FACT_GASTO_PREVAED: {len(df)} filas")
    print(f"Guardado en {parquet_path}")
    for regla in reporte["reglas"]:
        estado = "OK" if regla["ok"] else "FALLA"
        print(f"  [{estado}] {regla['regla']}: {regla['valor']} (meta {regla['meta']})")
    print(f"Grano región-año único: {reporte['grano_region_anio_unico']}")


if __name__ == "__main__":
    main()
