# ==============================================================================
# Dockerfile para Servicio de Inferencia Machine Learning CENEPRED (FastAPI)
# ==============================================================================

FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema mínimas
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar requerimientos e instalar
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código del proyecto
COPY . .

# Exponer puerto de la API FastAPI
EXPOSE 8000

ENV PYTHONUNBUFFERED=1

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Comando de inicio del servidor Uvicorn
CMD ["python", "-m", "uvicorn", "data.ml.api_server:app", "--host", "0.0.0.0", "--port", "8000"]
