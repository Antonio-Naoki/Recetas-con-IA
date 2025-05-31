
# EcoRecetas Inteligentes 🍽️🤖

Una aplicación web inteligente que genera recetas personalizadas basadas en los ingredientes que tienes disponibles, utilizando IA generativa para crear variaciones creativas y sostenibles.

## 🚀 Características

- **Generación de recetas con IA**: Utiliza Google Gemini AI para crear recetas personalizadas
- **Detección de ingredientes**: Captura ingredientes usando la cámara o añádelos manualmente
- **Variaciones creativas**: Genera diferentes versiones de una receta con los mismos ingredientes
- **Interfaz moderna**: UI responsiva construida con React y Tailwind CSS
- **Preferencias personalizables**: Ajusta tiempo de cocción, dificultad, porciones y restricciones dietéticas

## 🛠️ Stack Tecnológico

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Base de datos**: Neon (PostgreSQL) con Drizzle ORM
- **IA**: Google Gemini AI
- **UI**: Tailwind CSS + shadcn/ui components
- **Validación**: Zod schemas

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior)
- **npm** (incluido con Node.js)
- Una **API key de Google Gemini**
- Una **base de datos Neon** (PostgreSQL)

## 🔧 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd ecorecetas-inteligentes
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Google Gemini AI
GEMINI_API_KEY=tu_gemini_api_key_aqui

# Base de datos Neon
DATABASE_URL=tu_neon_database_url_aqui

# Entorno de desarrollo
NODE_ENV=development
```

#### Obtener API Key de Google Gemini:
1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea una nueva API key
3. Copia la key y agrégala al archivo `.env`

#### Configurar base de datos Neon:
1. Ve a [Neon.tech](https://neon.tech)
2. Crea una cuenta y un nuevo proyecto
3. Copia la connection string y agrégala al archivo `.env`

### 4. Configurar la base de datos

Ejecuta las migraciones para crear las tablas necesarias:

```bash
npm run db:push
```

### 5. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:5000`

## 📁 Estructura del Proyecto

```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilidades
│   │   ├── pages/         # Páginas de la aplicación
│   │   └── App.tsx        # Componente principal
│   └── index.html         # HTML template
├── server/                # Backend Express
│   ├── index.ts          # Servidor principal
│   ├── routes.ts         # Rutas de la API
│   ├── storage.ts        # Configuración de base de datos
│   └── vite.ts           # Configuración de Vite
├── shared/               # Esquemas compartidos
│   └── schema.ts         # Validaciones Zod
└── package.json          # Dependencias y scripts
```

## 🎯 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo

# Construcción
npm run build           # Construye para producción

# Producción
npm start              # Inicia servidor de producción

# Base de datos
npm run db:push        # Aplica cambios a la base de datos

# Verificación de tipos
npm run check          # Verifica tipos TypeScript
```

## 🔌 API Endpoints

### Ingredientes
- `GET /api/ingredients` - Obtener todos los ingredientes
- `POST /api/ingredients` - Añadir nuevo ingrediente
- `DELETE /api/ingredients/:id` - Eliminar ingrediente

### Recetas
- `GET /api/recipes` - Obtener todas las recetas
- `POST /api/recipes/generate` - Generar nueva receta con IA
- `DELETE /api/recipes/:id` - Eliminar receta

### Preferencias
- `GET /api/preferences` - Obtener preferencias del usuario
- `POST /api/preferences` - Guardar preferencias

## 🎨 Uso de la Aplicación

1. **Añadir ingredientes**: 
   - Usa la cámara para detectar ingredientes automáticamente
   - O añádelos manualmente escribiendo el nombre

2. **Generar receta**:
   - Selecciona los ingredientes que quieres usar
   - Ajusta las preferencias (tiempo, dificultad, porciones)
   - Haz clic en "Generar Receta"

3. **Crear variaciones**:
   - En cualquier receta generada, haz clic en "Generar Variación"
   - La IA creará una versión diferente usando los mismos ingredientes

## 🌱 Características Sostenibles

- Reduce el desperdicio de alimentos al usar ingredientes disponibles
- Sugiere recetas basadas en ingredientes de temporada
- Promueve el uso completo de ingredientes con variaciones creativas

## 🐛 Solución de Problemas

### Error: "tsx: not found"
```bash
npm uninstall tsx && npm install tsx --save-dev
npx tsx server/index.ts
```

### Error de conexión a base de datos
- Verifica que la `DATABASE_URL` en `.env` sea correcta
- Asegúrate de que tu base de datos Neon esté activa

### Error de API de Gemini
- Verifica que tu `GEMINI_API_KEY` esté correcta
- Asegúrate de tener créditos disponibles en tu cuenta de Google AI

## 📝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Añadir nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo `LICENSE` para más detalles.

## 🤝 Soporte

Si tienes problemas o preguntas:

1. Revisa la sección de solución de problemas
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema

---

¡Disfruta cocinando con EcoRecetas Inteligentes! 🍳✨
