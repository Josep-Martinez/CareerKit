# CareerKit

CareerKit reúne tu perfil profesional, aprendizajes, copia de LinkedIn, currículum y vacantes en una web que puedes usar en tu ordenador. Puedes rellenar los formularios a mano. Para tareas como buscar ofertas, revisar LinkedIn o preparar el CV, CareerKit te da instrucciones que puedes copiar a un asistente.

[Primera vez](#primera-vez) · [Volver a abrir CareerKit](#volver-a-abrir-careerkit) · [Qué hay en cada pantalla](#qué-hay-en-cada-pantalla) · [Si algo falla](#si-algo-falla) · [Datos y privacidad](#datos-y-privacidad) · [Publicación opcional](#publicación-opcional)

## Primera vez

1. En GitHub, abre el repositorio de CareerKit, pulsa **Code → Download ZIP** y descomprime el archivo. Si ya tienes la carpeta del proyecto, úsala directamente. Guárdala en un lugar donde puedas encontrarla después.
2. Abre **esa carpeta** como proyecto en un asistente de programación con acceso local, como Codex o Claude Code. Un chat que solo recibe texto no puede preparar archivos en tu ordenador.
3. Pega este mensaje en el chat del proyecto:

   > Prepara CareerKit en este ordenador. Lee AGENTS.md. Si falta Node.js o pnpm, guíame para instalarlos con pasos sencillos. Instala las dependencias con pnpm install --frozen-lockfile, prepara solo los archivos vacíos que falten con pnpm data:init y abre la web con pnpm local. Dame la dirección cuando esté lista. Si aparece la pantalla para conectar la carpeta, indícame cómo seleccionar private-data y conceder el permiso. Conserva los datos que ya existan y no publiques el proyecto.

4. Abre [CareerKit en tu ordenador](http://127.0.0.1:5173/). Si ya ves Inicio, puedes empezar. Si aparece **Conectar carpeta de datos**, pulsa el botón, selecciona la carpeta **private-data** que está dentro del proyecto y acepta el permiso del navegador. Si te ofrece preparar archivos que faltan, confirma la creación de las plantillas vacías.

La primera apertura está vacía. Empieza por **Perfil y aprendizajes** y pulsa **Guardar** cuando hayas añadido información. Puedes dejar Vacantes vacía hasta que quieras buscar.

### Prepararlo sin asistente

Instala Node.js 24 y la versión de pnpm indicada en [package.json](package.json). Usa la aplicación **Terminal** de macOS o Linux o **Terminal de Windows**. Abre una terminal en la carpeta que contiene este README y `package.json`. En Windows, puedes abrir esa carpeta en el Explorador, escribir `powershell` en la barra de dirección y pulsar Intro. En macOS o Linux, abre Terminal, escribe `cd` seguido de un espacio, arrastra la carpeta a la ventana y pulsa Intro.

Ejecuta estos comandos de uno en uno, pulsando Intro después de cada línea:

```sh
pnpm install --frozen-lockfile
pnpm data:init
pnpm local
```

Cuando aparezca la dirección, abre [CareerKit](http://127.0.0.1:5173/). Los dos primeros comandos son de preparación. Si actualizas el proyecto y cambian sus dependencias, repite el primero. Puedes repetir el segundo para crear archivos que falten sin reemplazar los existentes.

## Volver a abrir CareerKit

**Para usar CareerKit cada día basta con abrir la carpeta del proyecto, iniciar la web y entrar en el navegador.** Puedes hacerlo sin abrir un asistente.

1. Abre una terminal en la carpeta de CareerKit.
2. Escribe **`pnpm local`** y pulsa Intro.
3. Abre [http://127.0.0.1:5173/](http://127.0.0.1:5173/) en tu navegador habitual. Guarda esta dirección en favoritos para encontrarla fácilmente.
4. Deja abierta la terminal mientras usas la web. Puedes minimizarla. Para detener CareerKit, vuelve a esa terminal y pulsa **Ctrl+C**.

Después de reiniciar el ordenador o detener CareerKit, repite estos pasos. Si la terminal sigue abierta con CareerKit en marcha, basta con abrir el favorito. La dirección funciona en el ordenador donde arrancaste la web.

### Abrirlo con doble clic

Si prefieres un icono en el Escritorio, pide al asistente que lo prepare **una sola vez**:

> Crea un acceso directo en mi Escritorio para abrir CareerKit con doble clic. Adáptalo a mi sistema y a la ubicación real de esta carpeta. Debe iniciar pnpm local en la carpeta de CareerKit, esperar a que responda http://127.0.0.1:5173/ y abrir esa dirección en mi navegador. Si CareerKit ya está abierto desde esta misma carpeta, reutiliza esa sesión. Si otra aplicación ocupa la dirección, muestra el error. Si falla el arranque, deja visible el mensaje de error. Dime cómo abrirlo y detenerlo. Guarda el acceso directo fuera del repositorio.

A partir de ahí usa el acceso directo. Si mueves la carpeta del proyecto, actualiza el acceso directo con su nueva ubicación.

## Qué hay en cada pantalla

| Pantalla | Para qué sirve |
| --- | --- |
| **Inicio** | Muestra el progreso de preparación, las prioridades, las vacantes destacadas y las fechas registradas de CV y LinkedIn. «Sin registrar» indica que falta la fecha. |
| **Perfil y aprendizajes** | Despliega cada bloque para guardar objetivos, intereses, preferencias laborales y evidencias de tu trayectoria. Marca qué está confirmado, qué sirve para el CV, qué aparece en LinkedIn y qué es interno. |
| **LinkedIn** | Guarda una copia de tu perfil publicado. Alterna **Editar** y **Vista previa** y elige el idioma que quieres consultar. Usa las anotaciones de auditoría para ver propuestas junto a la sección correspondiente. Guarda después de aplicar o descartar propuestas. Los cambios se guardan en CareerKit. |
| **CV** | Consulta la base española en dos columnas o la inglesa en una columna. Puedes imprimir la vista o guardarla como PDF desde el cuadro de impresión del navegador. Los cambios en las bases se hacen mediante prompts. |
| **Vacantes** | Añade o abre una oferta, consulta su enlace y fecha de verificación, vincula evidencias de Perfil y compara hasta tres ofertas. En los detalles puedes consultar las recomendaciones de adaptación y el CV específico cuando esté guardado. |
| **Buzón** | Busca y copia prompts para el asistente. Las tareas destacadas indican qué conviene revisar según tus cambios recientes. |

### Qué prompt usar

Un **prompt** es un texto de instrucciones. Abre el Buzón, elige la tarea, pulsa **Copiar prompt** y pégalo en el chat del asistente. Si la tarea necesita un archivo o una oferta concreta, adjunta el archivo o indica la oferta. Revisa la respuesta y comprueba qué archivos dice haber actualizado. Si CareerKit detecta el cambio, usa **Recargar** en la pantalla correspondiente para verlo.

- **Completar Perfil.** Elige la entrevista guiada, comparte material para que el asistente lo organice o usa el prompt que parte del CV. Añade tú los intereses, metas y preferencias que quieras tener en cuenta en futuras búsquedas.
- **Registrar o revisar LinkedIn.** Para guardar una copia fiel, aporta un PDF, documento, captura o texto legible. El prompt del complemento puede servir si tu asistente tiene uno que muestra el perfil. Para obtener sugerencias sobre qué corregir o añadir según tu trayectoria, elige la auditoría. Para alinear español e inglés, usa el prompt de las dos versiones.
- **Preparar el CV general.** Usa el prompt de actualización tras completar Perfil y LinkedIn. También puedes aportar un CV anterior como punto de partida. Cuando se destaque una revisión del CV o de los idiomas de LinkedIn, copiar el prompt inicia el trabajo con el asistente. El cierre depende del resultado guardado en el archivo local.
- **Buscar y valorar vacantes.** Guarda primero tus roles, tareas, lugares y condiciones en Perfil. El prompt de búsqueda pide fuentes públicas y verifica la vigencia de cada oferta. Para adaptar el CV, abre una oferta concreta y usa su prompt. El asistente puede pedirte datos antes de redactar. La adaptación queda asociada a esa vacante.
- **Preparar otros materiales.** El Buzón también ofrece tareas para cartas, historias STAR, publicaciones, comentarios y otros borradores de LinkedIn. Revísalos en el chat antes de utilizarlos.

### Contenido de LinkedIn en la rama mejoras

Si en el menú aparece **Contenido de LinkedIn**, tu versión incluye esta pantalla adicional. El Buzón sigue disponible como catálogo de prompts.

1. En **Perfil → Intereses y voz para publicaciones**, indica temas que quieres explorar, voces profesionales y empresas u organizaciones que quieres seguir.
2. En **Contenido de LinkedIn → Artículos**, copia el prompt de búsqueda. El asistente consulta tus preferencias cuando tiene acceso local, busca en fuentes públicas como revistas, publicaciones especializadas, centros de investigación y LinkedIn, y comprueba las afiliaciones que cita.
3. Si el asistente guardó las lecturas, recarga el archivo cuando la web te avise. Acepta o descarta cada propuesta. Si no pudo guardarlas, puedes añadir los enlaces a mano.
4. Añade tu opinión a una lectura aceptada y copia el prompt para convertirla en una publicación. También puedes preparar publicaciones sobre logros, títulos, proyectos y aprendizajes, o reutilizar material que aportes.
5. En **Comentarios**, pega el texto de la publicación y añade qué te gustaría aportar. Copia el prompt con ambos textos. Los borradores se quedan en la conversación con el asistente.

## Si algo falla

| Qué ves | Qué hacer |
| --- | --- |
| El navegador dice que no se puede abrir la página | Ejecuta `pnpm local` en la carpeta de CareerKit y revisa el mensaje de la terminal. Si dice que el puerto 5173 está ocupado, comprueba si CareerKit ya está abierto o cierra la aplicación que lo ocupa. |
| La terminal dice que no encuentra `pnpm` o `package.json` | Si falta pnpm, instala el programa y vuelve a abrir la terminal. Si falta `package.json`, abre la terminal dentro de la carpeta descomprimida del proyecto. |
| La web vuelve a pedir acceso a la carpeta | Usa el navegador y la dirección habituales. Si te ofrece recuperar el permiso, acéptalo. Si cambiaste de navegador, de perfil o moviste la carpeta, selecciónala de nuevo. |
| La carpeta no se conecta dentro del navegador del asistente | Abre la dirección en tu navegador habitual. Prueba la selección de carpeta allí. Si el navegador ofrece **Abrir archivos JSON**, puedes seleccionar los archivos uno a uno. |
| El archivo está vacío, falta o necesita revisión | Una plantilla válida sin datos es normal. Si falta un archivo, usa la opción de preparar archivos o el prompt del Buzón. Si hay un aviso de formato, pídele al asistente que revise el archivo señalado y conserve su contenido. |
| El asistente guardó cambios y todavía ves datos anteriores | Espera al aviso de cambio externo y pulsa **Recargar**. Si abriste archivos individuales, vuelve a seleccionar la versión actual del archivo. |
| La web avisa de que el archivo cambió mientras editabas | Conserva tu borrador antes de recargar, usando la opción de copiarlo si aparece. Revisa la versión actual y vuelve a aplicar los cambios que quieras guardar. |

Cuando usas archivos individuales, **Guardar** prepara una descarga. Sustituye manualmente el archivo correspondiente en `private-data/` y vuelve a abrirlo. En este modo la web no vigila el archivo del disco mientras editas.

## Datos y privacidad

**La carpeta `private-data/` contiene tus datos.** Cada archivo JSON es un documento de texto estructurado. Puedes trabajar desde los formularios sin editarlo a mano.

| Archivo | Contenido |
| --- | --- |
| `profile.json` | Perfil, preferencias, objetivos y evidencias. |
| `linkedin.json` | Copia del perfil publicado, versiones por idioma y auditorías. |
| `cv.json` | Bases generales del CV y fechas. |
| `vacancies.json` | Ofertas, valoración y adaptaciones por vacante. |
| `priorities.json` | Prioridades que aparecen en Inicio. |
| `linkedin-content.json` | Cola de lectura y opiniones en las versiones con Contenido de LinkedIn. |

En el modo local, CareerKit puede detectar la carpeta del proyecto y recuerda la conexión cuando el navegador lo permite. Tu selección manual tiene prioridad. Puedes usar **Desconectar carpeta** y, si quieres, confirmar que la web limpie los datos que tiene cargados. Los archivos del disco se conservan. Para cambiar de ordenador, copia la carpeta de datos por un medio que controles y conéctala en el nuevo equipo.

CareerKit no tiene cuenta, sincronización ni analítica. Si pegas un prompt con datos o adjuntas un documento en un chat externo, ese material lo recibe el servicio del chat. El acceso local del asistente depende de que pueda abrir la misma carpeta. Las plantillas vacías están en `templates/` y las reglas de cada archivo en `schemas/`. Para asistentes, consulta [AGENTS.md](AGENTS.md), el [formato local](schemas/agent-format.md) y el [índice de guías](.agents/skills/README.md).

## Publicación opcional

Puedes usar CareerKit siempre en tu ordenador. Si quieres publicar la web estática en GitHub Pages, abre el proyecto en el asistente y usa este prompt cuando tengas el destino decidido:

> Publica la web estática de CareerKit en GitHub Pages en este repositorio: [pega la dirección exacta]. Lee AGENTS.md. Confirma el destino y prepara la web con pnpm pages:prepare. Comprueba que la ruta de la web corresponde al nombre del repositorio. Revisa los archivos versionados y la carpeta dist para asegurarte de que no contienen datos personales ni private-data. Si aparece información personal o no puedes verificarlo, detente. Si todo está correcto, configura GitHub Pages, comprueba que el enlace abre y dime la dirección publicada.

La comprobación automática busca archivos privados y patrones conocidos. La revisión del contenido sigue siendo necesaria. En la versión publicada, cada persona conecta sus propios archivos desde su navegador.
