# Cómo Ejecutar EcoRecetas Inteligentes

Este documento explica cómo ejecutar la aplicación EcoRecetas Inteligentes en tu computadora.

## Prerrequisitos

Asegúrate de tener instalado:
- Node.js (versión 18 o superior)
- npm (incluido con Node.js)

## Pasos para ejecutar la aplicación

### 1. Instalar dependencias

Si es la primera vez que ejecutas la aplicación, necesitas instalar las dependencias:

```bash
npm install
```

### 2. Verificar el archivo .env

El archivo `.env` ya está configurado con:
- GEMINI_API_KEY=AIzaSyAkc2dK7ot0Jwl0JCC1m5sEy0vrrj9ldpA
- NODE_ENV=development

No necesitas modificar nada si estos valores son correctos.

### 3. Iniciar el servidor de desarrollo

Para iniciar la aplicación en modo desarrollo, ejecuta:

```bash
npm run dev
```

La aplicación intentará usar el puerto 5000 primero. Si este puerto ya está en uso, probará con puertos alternativos (5001, 5002, etc.).

Observa la terminal para ver en qué puerto se está ejecutando la aplicación. Verás un mensaje como:
```
serving on port 5000
```
o
```
Port 5000 is already in use, trying next port...
serving on port 5001
```

### 4. Uso de la aplicación

1. Abre tu navegador y ve a la URL mostrada en la terminal (por ejemplo, `http://localhost:5000` o `http://localhost:5001`)
2. Añade ingredientes usando la interfaz
3. Genera recetas personalizadas basadas en tus ingredientes

## Solución de problemas comunes

### Error: "tsx: not found"
```bash
npm uninstall tsx
npm install tsx --save-dev
npx tsx server/index.ts
```

### Error de API de Gemini
- Verifica que la API key en el archivo `.env` sea correcta
- Asegúrate de tener créditos disponibles en tu cuenta de Google AI

## Otros comandos útiles

```bash
# Construir para producción
npm run build

# Iniciar en modo producción
npm start

# Verificar tipos TypeScript
npm run check
```

¡Disfruta cocinando con EcoRecetas Inteligentes! 🍳✨
