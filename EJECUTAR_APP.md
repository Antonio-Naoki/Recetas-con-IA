# Ejecutar EcoRecetas Inteligentes

Para ejecutar la aplicación EcoRecetas Inteligentes, sigue estos pasos:

## Preparación (ya completada)

✅ Node.js está instalado (versión 22.15.0)
✅ Las dependencias están instaladas
✅ El archivo .env está configurado correctamente
✅ La aplicación ha sido compilada con `npm run build`

## Ejecutar la aplicación

1. Haz doble clic en el archivo `start_app.bat` que se encuentra en la carpeta principal del proyecto.
2. Se abrirá una ventana de comando que iniciará el servidor.
3. Espera hasta que veas un mensaje indicando que el servidor está en funcionamiento.
4. Observa en la ventana de comando el puerto en el que se está ejecutando la aplicación. Verás un mensaje como:
   ```
   serving on port 5000
   ```
   o si el puerto 5000 ya está en uso:
   ```
   Port 5000 is already in use, trying next port...
   serving on port 5001
   ```
5. Abre tu navegador web y ve a la URL mostrada en la ventana de comando (por ejemplo, http://localhost:5000 o http://localhost:5001)

## Detener la aplicación

Para detener la aplicación, simplemente presiona `Ctrl+C` en la ventana de comando y luego confirma con `S` o `Y`.

## Solución de problemas

Si encuentras algún problema al ejecutar la aplicación:

1. Intenta ejecutar los comandos manualmente:
   ```
   npm run build
   npm run dev
   ```
2. Revisa el archivo COMO_EJECUTAR.md para instrucciones más detalladas

¡Disfruta usando EcoRecetas Inteligentes! 🍽️🤖
