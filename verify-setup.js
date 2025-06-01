#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Verificando configuración del proyecto...\n');

let hasErrors = false;

// Verificar Node.js
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log('✅ Node.js:', nodeVersion);
  console.log('✅ npm:', npmVersion);
} catch (error) {
  console.log('❌ Node.js no está instalado o no está en el PATH');
  hasErrors = true;
}

// Verificar dependencias
try {
  if (existsSync(join(__dirname, 'node_modules'))) {
    console.log('✅ Dependencias instaladas');
  } else {
    console.log('❌ Dependencias no instaladas. Ejecuta: npm install');
    hasErrors = true;
  }
} catch (error) {
  console.log('❌ Error verificando dependencias');
  hasErrors = true;
}

// Verificar archivo .env
try {
  // Verificar variables de entorno
  const envPath = join(__dirname, '.env');
  if (!existsSync(envPath)) {
    console.log('❌ Archivo .env no encontrado');
    console.log('   Crea un archivo .env basado en .env.example');
    hasErrors = true;
  } else {
    const envContent = readFileSync(envPath, 'utf8');

    // Verificar GEMINI_API_KEY
    if (!envContent.includes('GEMINI_API_KEY=') || envContent.includes('GEMINI_API_KEY=tu_gemini_api_key_aqui')) {
      console.log('❌ GEMINI_API_KEY no configurada en .env');
      hasErrors = true;
    } else {
      console.log('✅ GEMINI_API_KEY configurada');
    }

    console.log('✅ Almacenamiento en memoria (sin base de datos requerida)');
  }
} catch (error) {
  console.log('❌ Error verificando archivo .env');
  hasErrors = true;
}

// Verificar TypeScript
try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('✅ TypeScript sin errores');
} catch (error) {
  console.log('⚠️  Hay errores de TypeScript. Ejecuta: npm run check');
}

console.log('\n' + '='.repeat(50));

if (hasErrors) {
  console.log('❌ Hay problemas de configuración que necesitan resolverse');
  console.log('\n📖 Revisa SETUP_LOCAL.md para instrucciones detalladas');
  process.exit(1);
} else {
  console.log('✅ ¡Configuración correcta! Puedes ejecutar: npm run dev');
  console.log('\n🚀 Tu aplicación estará en: http://localhost:5000');
}