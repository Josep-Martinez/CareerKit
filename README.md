# CareerKit

Aplicación web estática, local-first y en español para organizar perfil profesional, aprendizajes, LinkedIn, CV, vacantes y prioridades. No incluye cuentas, backend, sincronización, telemetría, analítica ni conexión a modelos. No busca ofertas ni genera recomendaciones.

## Abrir CareerKit por primera vez

No hace falta escribir comandos si usas un asistente de programación que pueda trabajar con esta carpeta:

1. Abre esta carpeta como proyecto local en tu asistente de programación.
2. Copia este prompt en el chat del proyecto:

   > Prepara y abre CareerKit en este ordenador. Usa pnpm para instalar lo necesario, prepara los JSON vacíos con `pnpm data:init` sin leer otros proyectos ni sobrescribir archivos e inicia la app con `pnpm local`. Cuando esté lista, dame el enlace local y ayúdame a abrirlo. No rellenes datos, no publiques nada ni conectes carpetas por mí. Guíame para que yo conecte `private-data/` y acepte el permiso del navegador. Si falta algún programa, explícame cómo instalarlo con pasos sencillos, sin pedirme que escriba comandos.

3. Cuando se abra CareerKit, pulsa **Conectar carpeta de datos**, elige `private-data/` y acepta el permiso de lectura y escritura del navegador.

El asistente puede preparar y editar los archivos porque tiene abierto este repositorio local. La web no queda conectada automáticamente por el hecho de que el README esté en el proyecto: tienes que seleccionar la carpeta y aceptar el permiso de lectura y escritura en el navegador. El asistente no puede aceptar ese permiso por ti.

La app queda en la dirección local que indique el servidor, normalmente `http://localhost:5173/`. El servidor debe seguir activo mientras la usas; puedes pedirle al asistente que lo inicie o lo detenga. No hace falta desplegar ni publicar el proyecto.

La primera apertura está vacía. No se incluyen ejemplos personales. `pnpm data:init` prepara `private-data/` y copia `profile.json`, `linkedin.json`, `cv.json`, `vacancies.json` y `priorities.json` desde las plantillas vacías, solo cuando cada archivo aún no existe. Conserva los archivos existentes sin leerlos ni sobrescribirlos. `private-data/` está ignorada por Git y no forma parte del build.

Los datos permanecen en esos archivos locales. La web necesita permiso para leerlos y guardarlos. Si el asistente de programación tiene este repositorio abierto localmente, puede editar los mismos JSON; si no tiene acceso a la carpeta, debe pedirte acceso o decirte que no pudo guardar. El permiso del navegador puede tener que concederse de nuevo en otra sesión.

### Si el navegador no permite conectar una carpeta

La app ofrece abrir o editar un JSON individual y descargar la versión actualizada. Después, sustituye manualmente el fichero correspondiente dentro de `private-data/` y vuelve a conectar o recargarlo. Este modo no sincroniza el archivo mientras editas, no vigila cambios externos y no resuelve conflictos automáticamente. No es una función de exportación general; es una alternativa de guardado para navegadores sin acceso directo.

Para desconectar, usa **Desconectar carpeta**. Puedes borrar los datos cargados de la sesión solo mediante la segunda acción confirmada. Esto no borra ficheros locales.

## Módulos y formato

Cada JSON tiene su propio `schemaVersion` y se valida aisladamente. Los esquemas están en `schemas/`, las plantillas genéricas vacías en `templates/`. Se permiten propiedades adicionales para permitir evolución; si la app encuentra campos superiores desconocidos, los conserva en memoria y avisa. Un JSON inválido o incompatible queda intacto y afecta solo a su sección.

Los elementos del perfil y las vacantes usan IDs estables (`id`, UUID recomendado). `vacancies.items[].matchingEvidenceIds` referencia IDs de `profile.json`. No reutilices un ID para otra evidencia. Las prioridades tienen `id`, título, nivel, motivo, fecha y sección relacionada. Las añade el asistente de programación si el usuario se lo pide; la app no las genera.

### Instrucciones para asistentes de programación locales

1. Confirma que tienes acceso local a `private-data/`; si no existe, puedes ejecutar `pnpm data:init` para crear solo las plantillas vacías. Si no tienes acceso al repositorio local, pide al usuario que lo abra o deja claro que no guardaste cambios.
2. Lee únicamente el módulo que el usuario haya pedido revisar y los módulos relacionados necesarios. No busques datos fuera de esta carpeta para rellenar la app.
3. Valida el JSON contra el esquema de `schemas/` correspondiente y conserva todas las propiedades desconocidas. No reemplaces un fichero mal formado ni inventes datos, fechas, valoraciones o verificaciones.
4. Mantén IDs estables. Para relacionar evidencia con vacantes, referencia `profile.json` mediante `matchingEvidenceIds`.
5. Escribe de forma atómica cuando sea posible, preserva UTF-8 y el formato JSON legible. Informa de los archivos efectivamente guardados.
6. Añade prioridades solo cuando el usuario lo solicite. La app no hace auditorías ni búsquedas automáticas.

El repositorio incluye guías generales para adaptar CV en `.agents/skills/`: `cv-optimizer`, `cv-espana` y `cv-europa`. `AGENTS.md` indica cuándo leerlas y cómo usar los datos pertinentes de CareerKit. Son instrucciones para asistentes de programación; la web no las ejecuta ni conecta un modelo. Si tu asistente no las carga automáticamente, pídele que lea `AGENTS.md` y la guía correspondiente. No copies los datos privados al repositorio ni guardes ahí CVs adaptados.

Consulta `schemas/agent-format.md` para convenciones completas. Las skills usan los objetivos y evidencias pertinentes que el usuario haya añadido a CareerKit; nunca completan huecos con datos de otros proyectos.

## Publicación opcional en GitHub Pages

No hace falta publicar la app para usarla en tu ordenador. Si algún día quieres que esté disponible en GitHub Pages, abre este proyecto en tu asistente y copia el prompt siguiente, sustituyendo el texto entre corchetes por la dirección exacta del repositorio. Esa petición autoriza al asistente a publicarla en ese repositorio:

> Publica CareerKit en GitHub Pages en este repositorio: [pega aquí la dirección exacta]. Antes de publicar, comprueba que `private-data/` no está incluido en el repositorio ni en la web generada, y revisa el código y la web generada para detectar datos personales. No leas el contenido de `private-data/`. Si encuentras un dato personal o no puedes comprobarlo, detente y avísame sin publicar. Prepara la web con pnpm, ajusta la dirección para que funcione en este repositorio y publícala en GitHub Pages. Si no tienes acceso o permisos, explícame qué falta. Al terminar, dame el enlace publicado y confirma si quedó disponible.

El asistente debe confirmar que el repositorio de destino coincide con la dirección que indicaste. La comprobación automática detecta algunos patrones habituales, pero no puede reconocer todos los datos personales; si hay dudas, debe detenerse y preguntarte antes de publicar.

## Privacidad

La web solo trabaja con datos que selecciones localmente y autorices. No los envía a ningún servidor ni los sincroniza. Un asistente externo solo puede leer o modificar esos datos si tiene acceso local a los archivos. No hay cifrado con contraseña.
