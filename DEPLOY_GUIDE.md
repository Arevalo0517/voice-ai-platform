# 🚀 Guía de Despliegue en la Nube - Voice AI Platform

## Resumen

Esta guía despliega todo en un solo repo usando Vercel con múltiples servicios.

---

## ✅ Paso 1: Archivos ya configurados

Ya creé los archivos necesarios:
- `vercel.json` - Configuración de servicios múltiples
- `Dockerfile` - Para el backend

---

## 📋 Pasos Previos

Necesitas cuentas en:
- [Supabase](https://supabase.com) → Base de datos PostgreSQL
- [Twilio](https://twilio.com) → Llamadas telefónicas
- [LiveKit](https://livekit.io) → Agentes de voz AI
- [OpenAI](https://openai.com) → Modelo LLM

---

## 🟢 Paso 2: Push del proyecto completo a GitHub

```bash
cd /Users/davidaaronarevalocruz/voice-ai-platform

# Agregar remote (ya existe, solo verifica)
git remote -v

# Asegúrate de estar en main
git checkout -B main

# Commit y push
git add .
git commit -m "Add vercel.json and Dockerfile for deployment"
git push -u origin main
```

---

## 🔵 Paso 3: Desplegar en Vercel

1. Ve a [https://vercel.com](https://vercel.com)
2. Importa el repo `voice-ai-platform`
3. Vercel detectará automáticamente los servicios:
   - `frontend` (Next.js) → servible en /
   - `backend` (Python) → servible en /api

### Configurar Variables de Entorno en Vercel

En el dashboard de Vercel → Settings → Environment Variables:

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
APP_URL=https://voice-ai-platform.vercel.app
FRONTEND_URL=https://voice-ai-platform.vercel.app
DEBUG=false
```

### Configurar Frontend

En el dashboard de Vercel, selecciona el servicio `frontend` y agrega:

```env
NEXT_PUBLIC_API_URL=https://voice-ai-platform.vercel.app/api
```

---

## 🔴 Paso 4: Configurar Twilio

En [console.twilio.com](https://console.twilio.com) → Tu número de teléfono → Voice & Fax:

| Campo | Valor |
|-------|-------|
| **A Call Comes In** | `https://TU-URL.vercel.app/api/webhooks/twilio/call` |
| **Status Callback URL** | `https://TU-URL.vercel.app/api/webhooks/twilio/call-status` |

---

## ✅ Verificación

1. Abre `https://voice-ai-platform.vercel.app`
2. Crea un agente desde el dashboard
3. Asigna un número de teléfono
4. Haz una llamada de prueba

---

## 💰 Costos

- **Vercel**: Tier gratuito para proyectos personales
- **Supabase**: Tier gratuito con 500MB base de datos
- **Twilio/LiveKit**: Pagar por uso (llamadas)

---

## ❓ Problemas Comunes

**Error 500 en API?**
→ Revisa las variables de entorno en Vercel

**No recibe llamadas?**
→ Verifica que los webhooks de Twilio apunten a tu URL de Vercel

**Frontend no conecta al backend?**
→ Verifica `NEXT_PUBLIC_API_URL` incluye `/api` al final