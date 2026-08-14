# ☁️ GUÍA DE DESPLIEGUE EN MICROSOFT AZURE — CENEPRED SAT & CHATBOT AI

Esta guía detalla paso a paso cómo desplegar la plataforma analítica de CENEPRED y el chatbot asistente en **Microsoft Azure** utilizando **Azure OpenAI Service**, **Azure Key Vault**, **Azure App Service** y **Azure Databricks**.

---

## 📋 REQUISITOS PREVIOS
1. Cuenta activa en **Microsoft Azure** ([portal.azure.com](https://portal.azure.com)).
2. Acceso a **Azure OpenAI Service** (o clave de API configurada).
3. **Azure CLI** instalado en tu computadora (`az --version`).
4. Repositorio en GitHub sincronizado (`https://github.com/YeshuaChavez/cenepred-gestion-desastres-bi.git`).

---

## 🚀 PASO 1: CREAR Y CONFIGURAR AZURE OPENAI SERVICE

1. Ingresa al Portal de Azure y busca **Azure OpenAI**.
2. Haz clic en **+ Crear (+ Create)**:
   - **Suscripción**: Selecciona tu suscripción.
   - **Grupo de recursos**: Crear uno nuevo llamado `rg-cenepred-prod`.
   - **Nombre del recurso**: `cenepred-openai-prod`.
   - **Región**: `East US` o `South Central US`.
3. Una vez creado, entra a **Keys and Endpoint**:
   - Copia la **ENDPOINT**: `https://cenepred-openai-prod.openai.azure.com/`
   - Copia la **KEY 1**: (Esta clave se guardará en Azure Key Vault).
4. Entra a **Model deployments > Manage Deployments** (Azure OpenAI Studio):
   - Haz clic en **Deploy Model**.
   - Selecciona el modelo: `gpt-4o-mini` (o `gpt-4`).
   - Nombre del Despliegue (**Deployment Name**): `gpt-4o-mini`.

---

## 🔐 PASO 2: GUARDAR SECRETOS EN AZURE KEY VAULT

1. En el buscador del Portal de Azure, busca **Key Vaults** y haz clic en **+ Crear**.
   - Nombre: `cenepred-kv-prod`.
   - Grupo de Recursos: `rg-cenepred-prod`.
2. Entra a tu Key Vault y dirígete a **Secrets > + Generate/Import**:
   - **Nombre**: `AZURE-OPENAI-KEY` | **Valor**: [Pega la clave de Azure OpenAI].
   - **Nombre**: `GEMINI-API-KEY` | **Valor**: `AQ.Ab8RN6LLxP9JxoqcGr5_IBzhXuxCspXMM4u-U2ZxBCbvTpZ0iQ`.
3. Copia el identificador URI del secreto para conectarlo con App Service.

---

## ⚙️ PASO 3: DESPLEGAR EL SERVIDOR BACKEND DEL CHATBOT (`apps/chatbot`)

1. En el Portal de Azure, busca **App Services** y haz clic en **+ Crear > Web App**:
   - **Nombre**: `cenepred-backend-api` (URL: `https://cenepred-backend-api.azurewebsites.net`).
   - **Runtime stack**: `Node 20 LTS`.
   - **Sistema Operativo**: `Linux`.
   - **Plan de servicio**: `B1` (Basic) o `F1` (Free).
2. Configurar Variables de Entorno en Azure:
   - Entra a **Settings > Environment variables** en tu App Service.
   - Agrega las siguientes variables:
     | Nombre | Valor |
     | :--- | :--- |
     | `AZURE_OPENAI_KEY` | `@Microsoft.KeyVault(SecretUri=https://cenepred-kv-prod.vault.azure.net/secrets/AZURE-OPENAI-KEY/)` |
     | `AZURE_OPENAI_ENDPOINT` | `https://cenepred-openai-prod.openai.azure.com/` |
     | `AZURE_OPENAI_DEPLOYMENT` | `gpt-4o-mini` |
     | `PORT` | `3001` |
3. Desplegar Código desde GitHub:
   - Ve a **Deployment Center** en el App Service.
   - Origen: **GitHub**.
   - Selecciona tu repositorio `YeshuaChavez/cenepred-gestion-desastres-bi`, rama `main`.
   - Carpeta raíz: `apps/chatbot`.

---

## 🌐 PASO 4: DESPLEGAR LA APLICACIÓN WEB FRONTEND (`apps/webapp`)

1. En el Portal de Azure, busca **Static Web Apps** y haz clic en **+ Crear**:
   - **Nombre**: `cenepred-sat-frontend`.
   - **Origen**: GitHub (`YeshuaChavez/cenepred-gestion-desastres-bi`).
   - **Build Presets**: `Custom`.
   - **App location**: `/apps/webapp`.
   - **Output location**: `dist`.
2. Una vez desplegado, Azure te entregará la URL pública de la plataforma (ej: `https://white-sea-12345.azurestaticapps.net`).

---

## 🧪 PASO 5: VERIFICACIÓN Y PRUEBA EN VIVO

1. Abre la URL pública de tu aplicación en Azure.
2. Ingresa a la sección **Riesgo Predictivo**:
   - Verifica el botón **`Clave Protegida (Azure)`**, el cual confirma que las credenciales están resguardadas en Azure Key Vault.
3. Haz clic en el botón flotante del **Chatbot CENEPRED** (esquina inferior derecha):
   - Envía preguntas como: *"¿Cuál es la región en mayor riesgo?"* o *"¿Cuánto es el PIM de Piura en PP0068?"*.
   - El chatbot procesará la respuesta a través del backend de Azure de forma rápida y segura.

---

## 🛠️ COMANDO RÁPIDO DE DESPLIEGUE CON AZURE CLI (OPCIONAL)

Si prefieres desplegar directamente desde la terminal de tu computadora:

```bash
# 1. Iniciar sesión en Azure
az login

# 2. Desplegar el backend de chatbot
cd apps/chatbot
az webapp up --name cenepred-backend-api --resource-group rg-cenepred-prod --runtime "NODE:20-lts"

# 3. Desplegar el frontend React
cd ../webapp
npm run build
az staticwebapp create --name cenepred-sat-frontend --resource-group rg-cenepred-prod --location "eastus2"
```
