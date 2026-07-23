"""Clasificación de riesgo — comparación con Deep Learning: LSTM (sección 10.1 del informe).

Mismo target que el baseline y el modelo principal (ml/training/logistic_regression_baseline.py,
ml/training/random_forest_xgboost.py): emergencia MEDIO/ALTO de origen Hidrometeorológico en los
próximos 7 días, para que la comparación sea justa (mismas métricas: F1, precisión, recall,
AUC-ROC; mismo split temporal 2012-2020 train / 2021-2023 test).

A diferencia de Random Forest/XGBoost (que usan features ya resumidas en ventanas móviles
hechas a mano: precipitación acumulada 15 días, tasa histórica región-mes, etc.), el LSTM recibe
una SECUENCIA de los últimos VENTANA_DIAS días de features crudas por región y aprende por sí
mismo qué patrón temporal importa — es la forma natural de usar una red recurrente, en vez de
darle las mismas features ya diseñadas a mano que a los modelos clásicos.

Se espera, y así lo dice la sección 10.1 del informe, que XGBoost iguale o supere al LSTM en
este tipo de datos tabulares de tamaño moderado — no es una falla del proyecto si eso ocurre, es
un resultado esperado y reportable en la literatura (los modelos de árboles suelen ganarle a las
redes neuronales en datos tabulares con relativamente pocas filas por serie).

Resultado real: LSTM (1 capa, 32 unidades, 8 épocas) da F1=0.626, AUC-ROC=0.723, recall=0.740 —
cumple la meta de recall pero no F1 ni AUC-ROC, y XGBoost lo supera en las 3 métricas
(F1=0.751, AUC-ROC=0.860, recall=0.845). Se probó también una versión más grande (2 capas, 64
unidades, 20 épocas, dropout) para descartar que el modelo simple estuviera subentrenado: dio
prácticamente el mismo resultado (F1=0.632, AUC=0.717) tras 11 veces más tiempo de entrenamiento
(397s vs 36s) — confirma que el modelo simple ya estaba bien convergido, no es un caso de
subentrenamiento, y se mantiene la versión simple por ser igual de buena y mucho más rápida.

Uso:
    python lstm_comparacion.py
"""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from sklearn.metrics import f1_score, precision_score, recall_score, roc_auc_score
from sklearn.preprocessing import StandardScaler

sys.path.insert(0, str(Path(__file__).parent))
from logistic_regression_baseline import (  # noqa: E402
    FECHA_CORTE_TRAIN_TEST,
    METAS,
    construir_dataset,
)

OUTPUT_DIR = Path(__file__).parent / "local_data"

FEATURES_SECUENCIA = [
    "temp_max", "temp_min", "precipitacion_mm",
    "num_sismos_7d", "magnitud_max_7d", "num_focos_calor_activos", "oni", "mes",
]
VENTANA_DIAS = 30
BATCH_SIZE = 256
EPOCHS = 8
RANDOM_STATE = 42

torch.manual_seed(RANDOM_STATE)


class LSTMClasificador(nn.Module):
    def __init__(self, n_features: int, hidden_size: int = 32):
        super().__init__()
        self.lstm = nn.LSTM(n_features, hidden_size, batch_first=True)
        self.salida = nn.Linear(hidden_size, 1)

    def forward(self, x):
        _, (h_n, _) = self.lstm(x)
        return self.salida(h_n[-1]).squeeze(-1)


def construir_secuencias(df: pd.DataFrame) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Para cada región-día con al menos VENTANA_DIAS de historia previa, arma la secuencia de
    los VENTANA_DIAS días anteriores (sin incluir el día actual, misma lógica sin fuga que en
    random_forest_xgboost.py)."""
    df = df.sort_values(["region_id", "fecha"]).reset_index(drop=True)
    X, y, fechas = [], [], []

    for _, grupo in df.groupby("region_id"):
        valores = grupo[FEATURES_SECUENCIA].values
        labels = grupo["label"].values
        fechas_grupo = grupo["fecha"].values
        for i in range(VENTANA_DIAS, len(grupo)):
            X.append(valores[i - VENTANA_DIAS:i])
            y.append(labels[i])
            fechas.append(fechas_grupo[i])

    return np.array(X), np.array(y), np.array(fechas)


def entrenar_lstm(X_train, y_train) -> LSTMClasificador:
    modelo = LSTMClasificador(n_features=len(FEATURES_SECUENCIA))
    pos_weight = torch.tensor([(y_train == 0).sum() / (y_train == 1).sum()])
    criterio = nn.BCEWithLogitsLoss(pos_weight=pos_weight)
    optimizador = torch.optim.Adam(modelo.parameters(), lr=1e-3)

    X_t = torch.tensor(X_train, dtype=torch.float32)
    y_t = torch.tensor(y_train, dtype=torch.float32)
    dataset = torch.utils.data.TensorDataset(X_t, y_t)
    loader = torch.utils.data.DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=True)

    modelo.train()
    for epoca in range(EPOCHS):
        perdida_total = 0.0
        for xb, yb in loader:
            optimizador.zero_grad()
            salida = modelo(xb)
            perdida = criterio(salida, yb)
            perdida.backward()
            optimizador.step()
            perdida_total += perdida.item() * len(xb)
        print(f"  Época {epoca + 1}/{EPOCHS}: pérdida={perdida_total / len(dataset):.4f}")

    return modelo


def evaluar_lstm(modelo: LSTMClasificador, X_test, y_test) -> dict:
    modelo.eval()
    with torch.no_grad():
        logits = modelo(torch.tensor(X_test, dtype=torch.float32))
        proba = torch.sigmoid(logits).numpy()
    pred = (proba >= 0.5).astype(int)

    metricas = {
        "f1": round(f1_score(y_test, pred), 4),
        "precision": round(precision_score(y_test, pred), 4),
        "recall": round(recall_score(y_test, pred), 4),
        "auc_roc": round(roc_auc_score(y_test, proba), 4),
    }
    cumple_meta = {k: bool(metricas[k] >= v) for k, v in METAS.items()}
    return {"metricas": metricas, "cumple_meta": cumple_meta, "todas_las_metas_ok": all(cumple_meta.values())}


def main() -> None:
    df = construir_dataset()
    print(f"Dataset base: {len(df)} filas región-día.")

    X, y, fechas = construir_secuencias(df)
    print(f"Secuencias construidas: {X.shape} (samples, {VENTANA_DIAS} días, {len(FEATURES_SECUENCIA)} features)")

    corte = np.datetime64(FECHA_CORTE_TRAIN_TEST)
    train_mask = fechas < corte
    X_train, y_train = X[train_mask], y[train_mask]
    X_test, y_test = X[~train_mask], y[~train_mask]
    print(f"Train: {len(X_train)} secuencias ({y_train.mean()*100:.1f}% positivos)")
    print(f"Test:  {len(X_test)} secuencias ({y_test.mean()*100:.1f}% positivos)")

    # Escalar cada feature por separado, ajustado solo con train (aplanando la dimensión temporal).
    n_features = X_train.shape[2]
    escalador = StandardScaler().fit(X_train.reshape(-1, n_features))
    X_train_esc = escalador.transform(X_train.reshape(-1, n_features)).reshape(X_train.shape)
    X_test_esc = escalador.transform(X_test.reshape(-1, n_features)).reshape(X_test.shape)

    print("Entrenando LSTM...")
    modelo = entrenar_lstm(X_train_esc, y_train)
    reporte = evaluar_lstm(modelo, X_test_esc, y_test)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    reporte_path = OUTPUT_DIR / "lstm_calidad.json"
    reporte["ventana_dias"] = VENTANA_DIAS
    reporte["n_train"] = len(X_train)
    reporte["n_test"] = len(X_test)
    reporte["fecha_procesamiento_utc"] = datetime.now(timezone.utc).isoformat()
    reporte_path.write_text(json.dumps(reporte, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"\nLSTM: {reporte['metricas']}")
    print(f"Cumple metas (sección 11.1): {reporte['cumple_meta']}")
    print(f"Guardado en {reporte_path}")


if __name__ == "__main__":
    main()
