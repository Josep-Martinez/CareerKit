# CareerKit

Aplicación web estática, local-first y en español para organizar perfil profesional, aprendizajes, LinkedIn, CV, vacantes y prioridades. No incluye cuentas, backend, sincronización, telemetría, analítica ni conexión a modelos. No busca ofertas ni genera recomendaciones.

## Empezar

Requisitos: Node.js y pnpm.

```sh
pnpm install
pnpm dev
```

Abre `http://localhost:5173/`. El servidor local debe seguir activo mientras usas la app; para detenerlo, pulsa Ctrl+C en la terminal. No hace falta desplegar ni publicar el proyecto. Este flujo local también permite que un agente que tenga abierto el repositorio trabaje con los mismos JSON de `private-data/`.

La primera apertura está vacía. No se incluyen ejemplos personales. Para crear los datos privados:

1. Crea `private-data/` en la raíz local del repositorio.
2. Copia los cinco archivos vacíos de `templates/` dentro de ella: `profile.json`, `linkedin.json`, `cv.json`, `vacancies.json` y `priorities.json`.
3. En la aplicación, pulsa **Conectar carpeta de datos**, selecciona `private-data/` y concede permiso de lectura y escritura.

Los datos reales viven en esos archivos locales, ignorados por Git, y no se copian al build. La aplicación necesita permiso explícito para leerlos y guardarlos. Un agente local solo podrá editarlos si tiene acceso a la carpeta local abierta; que la carpeta esté ignorada por Git no le concede ese acceso. La conexión directa mediante File System Access funciona en navegadores compatibles y puede requerir HTTPS o localhost. Se solicita nuevamente al abrir una sesión nueva.

### Si el navegador no permite conectar una carpeta

La app ofrece abrir o editar un JSON individual y descargar la versión actualizada. Después, sustituye manualmente el fichero correspondiente dentro de `private-data/` y vuelve a conectar o recargarlo. Este modo no sincroniza el archivo mientras editas, no vigila cambios externos y no resuelve conflictos automáticamente. No es una función de exportación general; es una alternativa de guardado para navegadores sin acceso directo.

Para desconectar, usa **Desconectar carpeta**. Puedes borrar los datos cargados de la sesión solo mediante la segunda acción confirmada. Esto no borra ficheros locales.

## Módulos y formato

Cada JSON tiene su propio `schemaVersion` y se valida aisladamente. Los esquemas están en `schemas/`, las plantillas genéricas vacías en `templates/`. Se permiten propiedades adicionales para permitir evolución; si la app encuentra campos superiores desconocidos, los conserva en memoria y avisa. Un JSON inválido o incompatible queda intacto y afecta solo a su sección.

Los elementos del perfil y las vacantes usan IDs estables (`id`, UUID recomendado). `vacancies.items[].matchingEvidenceIds` referencia IDs de `profile.json`. No reutilices un ID para otra evidencia. Las prioridades tienen `id`, título, nivel, motivo, fecha y sección relacionada. Las escribe el agente si el usuario se lo pide; la app no las genera.

### Instrucciones para agentes locales

1. Confirma que tienes acceso local a `private-data/`; si no, pide al usuario que abra la carpeta o deja claro que no guardaste cambios.
2. Lee únicamente el módulo que el usuario haya pedido revisar y los módulos relacionados necesarios. No busques datos fuera de esta carpeta para rellenar la app.
3. Valida el JSON contra el esquema de `schemas/` correspondiente y conserva todas las propiedades desconocidas. No reemplaces un fichero mal formado ni inventes datos, fechas, valoraciones o verificaciones.
4. Mantén IDs estables. Para relacionar evidencia con vacantes, referencia `profile.json` mediante `matchingEvidenceIds`.
5. Escribe de forma atómica cuando sea posible, preserva UTF-8 y el formato JSON legible. Informa de los archivos efectivamente guardados.
6. Añade prioridades solo cuando el usuario lo solicite. La app no hace auditorías ni búsquedas automáticas.

Consulta `schemas/agent-format.md` para convenciones completas. No copies los datos privados al repositorio.

## Publicación opcional en GitHub Pages

El build es estático y no contiene recursos de terceros por CDN. Para el repositorio de proyecto `CareerKit`:

```sh
GITHUB_PAGES=true pnpm build
pnpm check:publish
```

Si algún día decides publicarla, usa el contenido de `dist/` con GitHub Pages. `vite.config.js` usa `/CareerKit/` al definir `GITHUB_PAGES=true`; ajusta `base` si el nombre del repositorio cambia. La comprobación falla si `private-data/` está versionado, aparece en `dist/` o encuentra patrones habituales de datos personales en el contenido publicado. Revisa manualmente archivos versionados y el build antes de publicar: la comprobación automatizada es una barrera adicional, no sustituye la revisión humana. No publiques hasta elegir el repositorio destino y solicitarlo.

## Privacidad

La web solo trabaja con datos que el usuario seleccione localmente y autorice. No los envía a ningún servidor ni los sincroniza. Los agentes externos solo pueden leer o modificar esos datos si disponen de acceso local explícito a los archivos. No hay cifrado con contraseña.
