# Carrera al Vacío — proyecto Android con compilación APK en GitHub

Este proyecto envuelve el videojuego HTML/CSS/JavaScript en una aplicación Android nativa mediante WebView. Está preparado para que GitHub Actions compile un APK de prueba automáticamente.

## Crear el APK en GitHub
1. Crea un repositorio llamado `CarreraAlVacio`.
2. Sube **todo el contenido de esta carpeta** a la raíz del repositorio (incluido `.github/workflows/build-apk.yml`).
3. Abre la pestaña **Actions** y selecciona **Build Carrera al Vacío APK**.
4. Pulsa **Run workflow**. También se ejecuta automáticamente al hacer push a `main` o `master`.
5. Cuando termine correctamente, abre la ejecución y descarga el artefacto `CarreraAlVacio-APK`.
6. Dentro del ZIP descargado estará `app-debug.apk`, que puedes transferir a tu dispositivo Android e instalar habilitando la instalación de esa fuente si Android lo solicita.

## Importante
El APK de GitHub Actions es una compilación de depuración para pruebas, no una versión firmada para publicar en Google Play. La compilación necesita acceso a internet en GitHub Actions para descargar Gradle y el complemento Android.
