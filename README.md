# CareerKit

Aplicación web estática, local-first y en español para organizar perfil profesional, aprendizajes, LinkedIn, CV, vacantes y prioridades. No incluye cuentas, backend, sincronización, telemetría, analítica ni conexión a modelos. No busca ofertas ni genera recomendaciones automáticamente; un agente local puede guardar una valoración cuando se lo pidas.

## Abrir CareerKit por primera vez

No hace falta escribir comandos si usas un asistente de programación que pueda trabajar con esta carpeta:

1. Abre esta carpeta como proyecto local en tu asistente de programación.
2. Copia este prompt en el chat del proyecto:

   > Lee `AGENTS.md` y `.agents/skills/careerkit-data-entry/SKILL.md`. Prepara y abre CareerKit en este ordenador. Usa pnpm para instalar lo necesario, prepara los JSON vacíos con `pnpm data:init` sin leer otros proyectos ni sobrescribir archivos e inicia la app con `pnpm local`. Cuando esté lista, dame el enlace local y ayúdame a abrirlo. No rellenes datos, no publiques nada ni conectes carpetas por mí. Guíame para que yo conecte `private-data/` y acepte el permiso del navegador. Si falta algún programa, explícame cómo instalarlo con pasos sencillos, sin pedirme que escriba comandos.

3. Cuando se abra CareerKit, pulsa **Conectar carpeta de datos**, elige `private-data/` y acepta el permiso de lectura y escritura del navegador.

El asistente puede preparar y editar los archivos porque tiene abierto este repositorio local. La primera vez, tienes que seleccionar la carpeta y aceptar el permiso de lectura y escritura en el navegador. Después, CareerKit recuerda la selección en el navegador y vuelve a abrirla al iniciar; si el navegador retira el permiso, te pedirá renovarlo sin seleccionar la carpeta otra vez. El asistente no puede aceptar ese permiso por ti.

La app queda en `http://127.0.0.1:5173/`. Usa siempre esa misma dirección y el mismo navegador: así CareerKit puede recordar la selección de carpeta en este ordenador. El servidor debe seguir activo mientras la usas; puedes pedirle al asistente que lo inicie o lo detenga. No hace falta desplegar ni publicar el proyecto.

La primera apertura está vacía. No se incluyen ejemplos personales. `pnpm data:init` prepara `private-data/` y copia `profile.json`, `linkedin.json`, `cv.json`, `vacancies.json` y `priorities.json` desde las plantillas vacías, solo cuando cada archivo aún no existe. Conserva los archivos existentes sin leerlos ni sobrescribirlos. `private-data/` está ignorada por Git y no forma parte del build.

Si todavía no has conectado una carpeta, verás una franja que explica cómo conectar tus archivos y abrir el prompt de preparación. Al seleccionar una carpeta sin los JSON, CareerKit muestra una ventana que permite crear solo las plantillas que faltan, tras tu confirmación. Si los JSON existen y tienen el formato correcto pero están vacíos, aparece una ventana que te lleva a **Perfil y aprendizajes** para empezar a rellenarlos. Si un archivo está vacío, mal formado o no coincide con su plantilla, CareerKit lo deja intacto, señala el nombre y te indica cuál archivo de `templates/` revisar. Los demás módulos siguen disponibles. También puedes pedir al asistente local que prepare la carpeta con el prompt del buzón.

Los datos permanecen en esos archivos locales. La web necesita permiso para leerlos y guardarlos. El navegador recuerda localmente la referencia a la carpeta, no copia ni sube los JSON. Esa referencia pertenece a este navegador y a esta dirección local; si cambias de navegador, perfil o dirección, o borras sus datos de sitio, puede que tengas que seleccionar la carpeta otra vez. Si el permiso caduca, puedes renovarlo desde CareerKit sin volver a buscarla. Si el asistente de programación tiene este repositorio abierto localmente, puede editar los mismos JSON; si no tiene acceso a la carpeta, debe pedirte acceso o decirte que no pudo guardar.

### Si el navegador no permite conectar una carpeta

La app ofrece abrir o editar un JSON individual y descargar la versión actualizada. Después, sustituye manualmente el fichero correspondiente dentro de `private-data/` y vuelve a conectar o recargarlo. El CV base solo se muestra en modo de consulta; para actualizarlo, pide al agente local que revise Perfil y LinkedIn. Este modo no sincroniza el archivo mientras editas, no vigila cambios externos y no resuelve conflictos automáticamente. No es una función de exportación general; es una alternativa de guardado para navegadores sin acceso directo.

Para desconectar, usa **Desconectar carpeta**. Puedes borrar los datos cargados de la sesión solo mediante la segunda acción confirmada. Esto no borra ficheros locales.

## Módulos y formato

Cada JSON tiene su propio `schemaVersion` y se valida aisladamente. Los esquemas están en `schemas/`, las plantillas genéricas vacías en `templates/`. Se permiten propiedades adicionales para permitir evolución; si la app encuentra campos desconocidos, los conserva y avisa. Un JSON inválido o incompatible queda intacto, se indica el archivo que debes comparar con `templates/<módulo>.json` y afecta solo a su sección. Antes de guardar se comprueba que el fichero no haya cambiado fuera de la app.

Los elementos del perfil y las vacantes usan IDs estables (`id`, UUID recomendado). `vacancies.items[].matchingEvidenceIds` referencia IDs de `profile.json`. No reutilices un ID para otra evidencia. Las prioridades tienen `id`, título, nivel, motivo, fecha y sección relacionada. Las añade el asistente de programación si el usuario se lo pide; la app no las genera.

`profile.json` es un dossier privado distinto de la copia literal de LinkedIn. Incluye el resumen profesional, metas a corto/medio/largo plazo y evidencias, además de contexto opcional sobre intereses, valores, forma de pensar y trabajar, preferencias laborales y dirección de contenido. Ese contexto interno puede orientar una búsqueda o un borrador, pero no demuestra competencias ni se copia a LinkedIn o al CV. Antes de usar en público un detalle personal, el agente debe presentarlo y esperar confirmación. El prompt de actualización desde CV solo añade hechos explícitos del archivo; no infiere gustos, debilidades, preferencias ni objetivos.

`linkedin.json.published.languages` guarda idiomas por separado. Las entradas de experiencia, educación, certificaciones, proyectos, idiomas y destacados aceptan campos estructurados; las cadenas de versiones antiguas siguen siendo válidas. También se guardan modalidad del puesto (`workplaceType`), aptitudes asociadas y el indicador booleano `descriptionTruncated` cuando la fuente muestra un texto cortado. Las secciones publicadas que no encajen en esos campos se conservan en `published.additionalSections`, cada una con un título original, su contenido completo y un ID estable. El esquema comprueba los tipos de cada campo conocido y conserva propiedades adicionales. La transcripción desde un archivo mantiene el texto visible y marca las descripciones truncadas para no confundirlas con contenido completo.

`published.language` indica el idioma de la versión principal. `published.variants[]` guarda la versión del mismo perfil en otro idioma, con identificador estable y el idioma indicado. La app muestra un idioma cada vez y conserva ambas versiones en el mismo `linkedin.json`; no traduce por su cuenta. `languageSync.status` puede ser `current` o `pending`; al guardar cambios en el contenido publicado, la app lo marca como pendiente y conserva el idioma de origen en `languageSync.sourceLanguage` cuando se conoce. El Buzón ofrece el prompt «Actualizar las dos versiones de LinkedIn» y mantiene el aviso hasta que el agente revise las traducciones y marque el estado como `current`. La app no sincroniza la cuenta. Las auditorías pueden vincularse a una versión con `variantId`; `published.languages` sigue refiriéndose a idiomas hablados. `publicationStatus` se admite solo por compatibilidad con archivos anteriores y ya no controla la interfaz.

### Instrucciones para asistentes de programación locales

1. El agente local puede leer y editar los JSON de `private-data/` cuando la tarea que solicita el usuario lo requiera. Si no tiene acceso local, pide al usuario que abra el proyecto o deja claro que no guardaste cambios.
2. Trabaja únicamente con datos guardados en CareerKit o compartidos en la conversación. No busques datos en otros proyectos, documentos, cuentas de LinkedIn o navegadores. Usa un archivo adjunto como fuente solo cuando un prompt lo pida y yo lo identifique expresamente como mi CV o como la copia de mi perfil.
3. Valida el JSON contra el esquema de `schemas/` correspondiente y conserva todas las propiedades desconocidas. En Perfil, mantén separado el contexto interno de las evidencias profesionales; en LinkedIn, no alteres `published` como consecuencia de una auditoría. Si un archivo está mal formado, compáralo con `templates/<módulo>.json`, explica el problema y espera instrucciones antes de repararlo. No inventes datos, fechas, valoraciones o verificaciones.
4. Mantén IDs estables. Para relacionar evidencia con vacantes, referencia `profile.json` mediante `matchingEvidenceIds`.
5. Escribe de forma atómica cuando sea posible, preserva UTF-8 y el formato JSON legible. Informa de los archivos efectivamente guardados.
6. Añade prioridades solo cuando el usuario lo solicite. La app no hace auditorías ni búsquedas automáticas.

### Actualizar la base general del CV

La página de CV muestra dos bases de consulta: formato español y formato inglés. No se editan desde el formulario. Primero actualiza los datos confirmados de **Perfil y aprendizajes** y la copia fiel de **LinkedIn**; después pide al agente local que revise ambas fuentes y actualice `private-data/cv.json`. Si el agente no puede leer esa carpeta, debe decírtelo y no afirmar que guardó cambios.

Puedes pedirlo con este texto:

> Antes de empezar, lee `AGENTS.md`, `schemas/agent-format.md`, `.agents/skills/cv-optimizer/SKILL.md` y `.agents/skills/cv-formatos/SKILL.md`. Revisa `private-data/profile.json`, `private-data/linkedin.json` y `private-data/cv.json`. Actualiza las dos bases generales del CV a partir de la información confirmada y marcada como evidencia para CV. Mantén la versión española en español y con el formato de dos columnas; la versión inglesa debe estar completamente en inglés y usar una columna. Comprueba que los hechos compartidos coinciden con la copia publicada de LinkedIn. Si hay contradicciones, pregúntame antes de resolverlas. No modifiques LinkedIn. Guarda en `cv.json` solo si tienes acceso local a `private-data/` y confirma qué fichero guardaste.

### Valorar una vacante y preparar los cambios de CV

Al abrir una vacante verás, debajo de su descripción y valoración, qué versión se recomienda y qué convendría adaptar en cada CV. La app no calcula esos cambios. Los guarda el agente local en `vacancies.json` cuando se lo pidas; también puedes anotarlos manualmente desde el formulario de la vacante. Los cambios específicos se mantienen separados de las bases generales.

Puedes pedirlo con este texto:

> Antes de empezar, lee `AGENTS.md`, `schemas/agent-format.md`, `.agents/skills/job-fit-assessor/SKILL.md`, `.agents/skills/cv-optimizer/SKILL.md` y `.agents/skills/cv-formatos/SKILL.md`. Si el mercado de destino está claro, lee además `.agents/skills/cv-espana/SKILL.md` para España o `.agents/skills/cv-europa/SKILL.md` para otro país europeo. Revisa `private-data/vacancies.json` y localiza la vacante que te indique. Contrástala con las evidencias confirmadas de `private-data/profile.json` y con las bases de `private-data/cv.json`. Recomienda el formato español, el inglés o ambos y explica por qué. Añade puntos concretos que habría que adaptar en cada versión dentro de `cvAdvice.spanishAdjustments` y `cvAdvice.englishAdjustments`. Deja clara cualquier carencia demostrable y no inventes experiencia ni fechas. No reescribas las bases del CV. Guarda solo si tienes acceso local a `private-data/` y confirma qué fichero guardaste.

### Buzón de prompts

La sección **Buzón de prompts**, después de Vacantes, incluye tareas para preparar los archivos, actualizar Perfil desde un CV que aportes, rellenar la copia de LinkedIn desde un archivo, consultar el complemento de LinkedIn cuando esté disponible, crear las bases generales del CV desde un CV anterior, buscar y valorar ofertas, preparar candidaturas, estructurar historias STAR y trabajar con contenido de LinkedIn. Los prompts de archivos aceptan cualquier formato que el asistente pueda leer; si no puede abrirlo, debe indicarlo y pedirte una copia accesible. El prompt del complemento solo funciona en un asistente que lo tenga conectado; si no muestra el texto completo o no está disponible, usa el prompt de archivo. Puedes buscar por nombre, tema o skill y abrir solo el prompt que necesitas.

Para usar un CV o rellenar LinkedIn desde un archivo, adjúntalo al chat de tu asistente y copia allí el prompt correspondiente. El asistente procesa el archivo; CareerKit no lo recibe ni lo sube a un servidor. El prompt de archivo usa únicamente lo que identifiques como tu CV o copia de LinkedIn. El prompt del complemento es otra opción: busca el perfil y solo puede revisar la información que el complemento muestre explícitamente.

Cada prompt incluye las rutas de las guías que el asistente debe leer. Si tu asistente no descubre las skills automáticamente, esas rutas quedan incluidas también en el texto copiado. Pega el prompt en Codex, Claude Code u otro asistente local; CareerKit no lo envía ni ejecuta. El índice de `.agents/skills/README.md` explica qué guía corresponde a cada tarea. Las guías son genéricas, están versionadas en Git y no incluyen datos personales.

Al guardar cambios en Perfil o LinkedIn, el buzón muestra el indicador **1** y un aviso con el prompt «Actualizar la base general del CV». El aviso se mantiene hasta copiar ese prompt. Si el navegador descarga el JSON individual, sustituye primero el archivo dentro de `private-data/` antes de pedir al agente que actualice el CV.

`cv.json` guarda dos versiones independientes de la base general: español e inglés, junto con fechas de revisión y actualización por separado. La sección CV es de consulta; el agente local actualiza esas bases cuando se lo pides, a partir de la información confirmada de Perfil y de la copia publicada en LinkedIn. El formato español usa dos columnas; el inglés, una columna, y su texto debe estar en inglés. Si conectas un archivo CV antiguo, CareerKit conserva su contenido sin asignarle idioma hasta que confirmes cómo tratarlo.

El repositorio incluye guías para CV, búsqueda y valoración de vacantes, cartas, historias STAR y tareas de LinkedIn. `AGENTS.md` indica cómo escogerlas según el objetivo. Las versiones regionales solo se aplican cuando el destino está confirmado; la guía de CV específica para una oferta pide primero un diagnóstico y espera tus respuestas antes de redactar. El asistente no aplica a vacantes ni publica o envía mensajes. No copies los datos privados al repositorio ni guardes ahí CVs adaptados.

Consulta `schemas/agent-format.md` para convenciones completas. Las skills usan los objetivos y evidencias pertinentes que el usuario haya añadido a CareerKit; nunca completan huecos con datos de otros proyectos.

## Publicación opcional en GitHub Pages

No hace falta publicar la app para usarla en tu ordenador. Si algún día quieres que esté disponible en GitHub Pages, abre este proyecto en tu asistente y copia el prompt siguiente, sustituyendo el texto entre corchetes por la dirección exacta del repositorio. Esa petición autoriza al asistente a publicarla en ese repositorio:

> Lee `AGENTS.md` y la sección «Publicación opcional en GitHub Pages» de este README. Publica CareerKit en GitHub Pages en este repositorio: [pega aquí la dirección exacta]. Antes de publicar, comprueba que ningún archivo de `private-data/` está incluido en Git o en la web generada, y revisa los archivos versionados y el build para detectar datos personales. Puedes leer `private-data/` si lo necesitas para verificar que no se ha copiado información personal; no copies ningún dato personal a archivos versionados ni al build. Si encuentras datos personales en el contenido que se publicaría o no puedes comprobarlo, detente y avísame sin publicar. Prepara la web con pnpm, ajusta la dirección para que funcione en este repositorio y publícala en GitHub Pages. Si no tienes acceso o permisos, explícame qué falta. Al terminar, dame el enlace publicado y confirma si quedó disponible.

El asistente debe confirmar que el repositorio de destino coincide con la dirección que indicaste. La comprobación automática detecta algunos patrones habituales, pero no puede reconocer todos los datos personales; si hay dudas, debe detenerse y preguntarte antes de publicar.

## Privacidad

La web solo trabaja con datos que selecciones localmente y autorices. No los envía a ningún servidor ni los sincroniza. Un asistente externo solo puede leer o modificar esos datos si tiene acceso local a los archivos. No hay cifrado con contraseña.

## Conexión automática en localhost

Al ejecutar `pnpm local`, el servidor local conecta `private-data/` automáticamente, incluso si los cinco JSON son plantillas vacías. Si la carpeta todavía no existe, puedes pedir a tu asistente local que la prepare; la web vuelve a comprobar su existencia cada tres segundos. Los archivos inválidos se señalan por separado y no se sustituyen.

Este acceso usa un servicio exclusivo del servidor de desarrollo, limitado a `127.0.0.1` y a los cinco JSON. No forma parte de la web estática publicada. En GitHub Pages sigue siendo necesario seleccionar una carpeta mediante el navegador. Al desconectar, se suspende la conexión automática durante esa sesión de pestaña.
