
# Configuración Local - EcoRecetas Inteligentes

Esta guía te ayudará a configurar y ejecutar el proyecto EcoRecetas Inteligentes en tu máquina local.

## 📋 Prerrequisitos

1. **Node.js** (versión 18 o superior)
   ```bash
   node --version
   npm --version
   ```

2. **Git** (para clonar el repositorio)
   ```bash
   git --version
   ```

## 🚀 Instalación Paso a Paso

### 1. Clonar o Descargar el Proyecto

```bash
# Si tienes git instalado
git clone [URL_DEL_REPOSITORIO]
cd ecorecetas-inteligentes

# O descarga el ZIP y extrae los archivos
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
# Copia el archivo ejemplo
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:

```env
# Google Gemini AI
GEMINI_API_KEY=tu_gemini_api_key_aqui

# Entorno
NODE_ENV=development
```

#### Obtener Google Gemini API Key:
1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea una nueva API key
3. Copia la key y pégala en el archivo `.env`

### 5. Iniciar el Servidor

```bash
npm run dev
```

El proyecto estará disponible en: `http://localhost:5000`

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo

# Producción
npm run build           # Construye para producción
npm start              # Inicia servidor de producción

# Base de datos
npm run db:push        # Aplica cambios a la base de datos

# Verificación
npm run check          # Verifica tipos TypeScript
```

## ✅ Verificar que Todo Funciona

1. **Abrir navegador**: Ve a `http://localhost:5000`
2. **Añadir ingrediente**: Prueba añadir "tomate" manualmente
3. **Generar receta**: Selecciona ingredientes y genera una receta
4. **Revisar logs**: En la terminal deberías ver logs del servidor

## 🐛 Solución de Problemas

### Error: "tsx: not found"
```bash
npm uninstall tsx
npm install tsx --save-dev
```

### Error: Puerto 5000 en uso
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID [PID] /F

# Mac/Linux
lsof -i :5000
kill -9 [PID]
```

### Error de Base de Datos
- Verifica que `DATABASE_URL` sea correcta
- Asegúrate de que no hay espacios extra
- Confirma que tu proyecto Neon esté activo

### Error de API Gemini
- Verifica que `GEMINI_API_KEY` sea correcta
- Confirma que tienes créditos disponibles

## 📁 Estructura del Proyecto

```
├── client/             # Frontend React + TypeScript
├── server/             # Backend Express + TypeScript
├── shared/             # Esquemas compartidos (Zod)
├── .env               # Variables de entorno (crear este archivo)
├── package.json       # Dependencias
└── README.md          # Documentación principal
```

## 🌟 Características

- ✅ Generación de recetas con IA (Google Gemini)
- ✅ Gestión de ingredientes
- ✅ Preferencias personalizables
- ✅ Interfaz moderna con React + Tailwind
- ✅ Base de datos PostgreSQL (Neon)
- ✅ TypeScript en frontend y backend

¡Ya tienes todo listo para desarrollar! 🎉
