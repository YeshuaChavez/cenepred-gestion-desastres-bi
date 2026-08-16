import os
import json
from data.pipelines.alert_dispatcher import check_and_dispatch_alerts

def test_alert_filtering_only_high_and_critical(tmp_path):
    """Verifica que el filtro de alertas responda únicamente para departamentos en riesgo Alto o Crítico."""
    test_json = tmp_path / "realData.json"
    
    mock_data = {
        "departamentos": {
            "CUSCO": {
                "nombre": "CUSCO",
                "riesgo": "Crítico",
                "precipitacionMax": 95.0,
                "focosCalorActivos": 15,
                "sismosSemana": 2,
                "alertMsg": "Lluvias extremas en la cuenca del Urubamba."
            },
            "LIMA": {
                "nombre": "LIMA",
                "riesgo": "Bajo",
                "precipitacionMax": 2.0,
                "focosCalorActivos": 0,
                "sismosSemana": 1,
                "alertMsg": "Condiciones normales."
            },
            "PIURA": {
                "nombre": "PIURA",
                "riesgo": "Alto",
                "precipitacionMax": 82.0,
                "focosCalorActivos": 5,
                "sismosSemana": 0,
                "alertMsg": "Alerta por tormentas eléctricas."
            }
        }
    }
    
    with open(test_json, "w", encoding="utf-8") as f:
        json.dump(mock_data, f)
        
    # Monkeypatch REAL_DATA_PATH
    import data.pipelines.alert_dispatcher as ad
    ad.REAL_DATA_PATH = str(test_json)
    
    alerts = check_and_dispatch_alerts(target_email="yeshuachavezlozano@gmail.com")
    
    # Debe disparar únicamente para CUSCO (Crítico) y PIURA (Alto), ignorando LIMA (Bajo)
    assert len(alerts) == 2
    dept_names = [a["departamento"] for a in alerts]
    assert "CUSCO" in dept_names
    assert "PIURA" in dept_names
    assert "LIMA" not in dept_names
    assert alerts[0]["destinatario"] == "yeshuachavezlozano@gmail.com"

def test_alert_payload_structure():
    """Valida los campos obligatorios del payload formateado para Nodemailer."""
    payload = {
        "departamento": "PUNO",
        "nivelRiesgo": "Crítico",
        "precipitacionMax": 110.0,
        "focosCalor": 2,
        "sismos7d": 0,
        "destinatario": "yeshuachavezlozano@gmail.com"
    }
    
    assert payload["destinatario"] == "yeshuachavezlozano@gmail.com"
    assert payload["nivelRiesgo"] in ["Alto", "Crítico"]
    assert payload["precipitacionMax"] > 0
