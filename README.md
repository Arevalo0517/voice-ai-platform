# Voice AI Platform 🚀

Sistema completo de agentes de voz AI con Twilio, LiveKit y herramientas configurables.

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                        │
│         Dashboard para gestión de agentes,                   │
│         llamadas, transcripciones y costos                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND (FastAPI - Python)                   │
│  API REST + Webhooks Twilio/LiveKit + Sistema de Tools/MCP  │
└─────────────────────────────────────────────────────────────┘
         │                                    │
         ▼                                    ▼
┌─────────────────────┐          ┌─────────────────────────────┐
│      SUPABASE       │          │         LIVEKIT              │
│  - PostgreSQL       │          │  - Agentes de Voz AI        │
│  - Base de datos    │          │  - STT, LLM, TTS           │
│                     │          │  - Herramientas/MCP         │
└─────────────────────┘          └─────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────┐
│                       TWILIO                                 │
│        - Llamadas entrantes y salientes                      │
│        - Webhooks de estado                                 │
└─────────────────────────────────────────────────────────────┘
```

## Funcionalidades

- ✅ **Gestión de Agentes**: Crear, editar, eliminar agentes de voz AI
- ✅ **Asignación de Teléfono**: Vincular números telefónicos a agentes
- ✅ **Registro de Llamadas**: Ver todas las llamadas entrantes y salientes
- ✅ **Transcripciones**: Transcripciones completas de llamadas
- ✅ **Análisis de Costos**: Desglose de costos por servicio (Twilio, LiveKit, LLM, etc.)
- ✅ **Sistema de Herramientas/MCP**: Herramientas personalizadas para los agentes
- ✅ **Dashboard Visual**: Panel web moderno con React/Next.js

## Estructura del Proyecto

```
voice-ai-platform/
├── backend/                 # FastAPI Backend
│   ├── app/
│   │   ├── api/           # Endpoints REST
│   │   ├── models/        # Modelos SQLAlchemy
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Lógica de negocio
│   │   └── main.py        # App principal
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/               # Next.js Frontend
│   ├── src/
│   │   ├── app/           # Páginas
│   │   └── lib/           # API client
│   └── package.json
│
├── docker-compose.yml      # Despliegue local
└── README.md
```

## Instalación Rápida

### Prerrequisitos

- Python 3.11+
- Node.js 18+
- Cuenta de [Supabase](https://supabase.com)
- Cuenta de [Twilio](https://twilio.com)
- Cuenta de [LiveKit](https://livekit.io)

### 1. Backend (FastAPI)

```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Ejecutar servidor
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend (Next.js)

```bash
cd frontend

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

### 3. Configurar Supabase

1. Crear un proyecto en [Supabase](https://supabase.com)
2. Ir a Settings > Database > Connection String
3. Copiar el connection string URI
4. Actualizar `DATABASE_URL` en `.env`

### 4. Configurar Twilio

1. Crear cuenta en [Twilio](https://twilio.com)
2. Obtener Account SID y Auth Token
3. Configurar webhooks en tu número de teléfono:
   - Voice Call: `https://tu-dominio/webhooks/twilio/call`
   - Status Callback: `https://tu-dominio/webhooks/twilio/call-status`

### 5. Configurar LiveKit

1. Crear proyecto en [LiveKit Cloud](https://livekit.io)
2. Obtener API Key y API Secret
3. Configurar servidor

## Variables de Entorno

### Backend (.env)

```env
# Supabase Database
DATABASE_URL=postgresql://user:password@host:6543/postgres
SUPABASE_DB_HOST=your-host.supabase.co
SUPABASE_DB_PORT=6543
SUPABASE_DB_USER=postgres.your-project
SUPABASE_DB_PASSWORD=your-password

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# LiveKit
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret

# OpenAI
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# App
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
DEBUG=true
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## API Endpoints

### Agentes
- `GET /api/agents` - Listar agentes
- `POST /api/agents` - Crear agente
- `GET /api/agents/{id}` - Obtener agente
- `PUT /api/agents/{id}` - Actualizar agente
- `DELETE /api/agents/{id}` - Eliminar agente
- `POST /api/agents/{id}/phone` - Asignar teléfono

### Llamadas
- `GET /api/calls` - Listar llamadas (con paginación)
- `GET /api/calls/{id}` - Detalle de llamada
- `GET /api/calls/{id}/full` - Llamada con transcripción

### Transcripciones
- `GET /api/transcripts/call/{call_id}` - Transcripción por llamada

### Costos
- `GET /api/costs/summary` - Resumen de costos
- `GET /api/costs/by-agent` - Costos por agente
- `GET /api/costs/by-period` - Costos por período

### Herramientas
- `GET /api/tools` - Listar herramientas
- `POST /api/tools` - Crear herramienta
- `POST /api/tools/execute` - Ejecutar herramienta

### Webhooks
- `POST /webhooks/twilio/call` - Webhook de llamada entrante
- `POST /webhooks/twilio/call-status` - Estado de llamada
- `POST /webhooks/livekit/events` - Eventos de LiveKit

## Despliegue en Railway

### 1. Preparar el proyecto

```bash
# En la raíz del proyecto
cd backend
git init
git add .
git commit -m "Initial commit"
```

### 2. Desplegar en Railway

1. Ir a [Railway](https://railway.app)
2. Conectar tu repositorio de GitHub
3. Seleccionar el proyecto `backend`
4. Railway detectará automáticamente Python/FastAPI
5. Configurar variables de entorno en Railway Dashboard
6. Desplegar

### 3. Desplegar Frontend en Vercel

```bash
cd frontend
npx vercel
```

## Configurar Twilio Webhooks

En tu consola de Twilio:

1. Ve a tu número de teléfono
2. En "Voice & Fax":
   - **A Call Comes In**: Webhook → `https://tu-backend.railway.app/webhooks/twilio/call`
   - **Status Callback URL**: Webhook → `https://tu-backend.railway.app/webhooks/twilio/call-status`

## Uso del Dashboard

1. Abrir el frontend (http://localhost:3000 o tu URL de Vercel)
2. Crear un nuevo agente:
   - Nombre del agente
   - System prompt (instrucciones del agente)
   - Modelo LLM a usar
   - Voz preferida
3. Asignar un número de teléfono al agente
4. Configurar herramientas/herramientas MCP si es necesario
5. Esperar llamadas entrantes o iniciar llamadas salientes

## Desarrollo Local con Docker

```bash
# En la raíz del proyecto
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

## Licencia

MIT License
