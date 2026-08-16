import os
import sys
import json
import urllib.request
import urllib.error
from typing import Dict, Any, List

REAL_DATA_PATH = r"c:\Users\yeshu\Documents\Inteligencia de Negocios\Proyecto\apps\webapp\src\data\realData.json"
DEFAULT_RECIPIENT = "yeshuachavezlozano@gmail.com"

def check_and_dispatch_alerts(target_email: str = DEFAULT_RECIPIENT) -> List[Dict[str, Any]]:
    """
    Escanea la capa Gold / realData.json y dispara alertas automáticas para departamentos en riesgo Alto o Crítico.
    """
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
        
    print(f"Escaneando mapa de riesgo para notificaciones automatizadas...")
    print(f"Destinatario oficial: {target_email}")
    
    if not os.path.exists(REAL_DATA_PATH):
        print(f"Archivo {REAL_DATA_PATH} no encontrado. Omitiendo despacho de alertas.")
        return []
        
    with open(REAL_DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    deptos_data = data.get("departamentos", [])
    dispatched_alerts = []
    
    # Manejar estructura si es dict { "CUSCO": {...} } o list [ {...} ]
    items = []
    if isinstance(deptos_data, dict):
        for k, v in deptos_data.items():
            if isinstance(v, dict):
                v["nombre"] = k
                items.append(v)
    elif isinstance(deptos_data, list):
        items = deptos_data

    for dept in items:
        if not isinstance(dept, dict):
            continue
        nombre = dept.get("nombre", dept.get("depto", "DESCONOCIDO"))
        riesgo = dept.get("riesgo", "Bajo")
        
        # Filtro estricto: Solo disparar si el nivel es Alto o Crítico
        if riesgo in ["Alto", "Crítico"]:
            precip = dept.get("precipitacionMax", 0.0)
            focos = dept.get("focosCalorActivos", 0)
            sismos = dept.get("sismosSemana", 0)
            alert_msg = dept.get("alertMsg", "Peligro por condiciones climáticas adversas.")
            
            alert_payload = {
                "departamento": nombre,
                "nivelRiesgo": riesgo,
                "precipitacionMax": precip,
                "focosCalor": focos,
                "sismos7d": sismos,
                "factoresRiesgo": [alert_msg, f"Riesgo relativo clasificado como {riesgo}"],
                "destinatario": target_email
            }
            
            print(f"[ALERTA DETECTADA] Departamento de {nombre} - Nivel {riesgo.upper()}")
            print(f"   --> Despachando notificación a {target_email}...")
            
            # Enviar mediante la API de Nodemailer local / remota si el servidor está arriba
            try:
                req = urllib.request.Request(
                    "http://localhost:3000/api/alerts",
                    data=json.dumps(alert_payload).encode("utf-8"),
                    headers={"Content-Type": "application/json"},
                    method="POST"
                )
                with urllib.request.urlopen(req, timeout=3) as resp:
                    res_body = json.loads(resp.read().decode("utf-8"))
                    alert_payload["dispatch_status"] = res_body.get("emailStatus", "DISPATCHED")
            except Exception as e:
                # Fallback de despacho local
                alert_payload["dispatch_status"] = f"PREPARED_FOR_NODEMAILER ({e})"
                
            dispatched_alerts.append(alert_payload)
            
    print(f"Proceso de alertas finalizado. {len(dispatched_alerts)} alertas procesadas para {target_email}.")
    return dispatched_alerts

if __name__ == "__main__":
    check_and_dispatch_alerts()
