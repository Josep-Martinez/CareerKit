# Rediseñar Perfil y las preferencias de trabajo

**Objetivo.** Hacer que Perfil se lea como una ficha personal, con bloques cortos y una sección de empleo que distingue qué buscar, qué es imprescindible y qué suma puntos.

## 1. Reorganizar Perfil

- [x] Trabajar sobre la versión que contiene las mejoras de la PR #19. Leer `AGENTS.md` y `schemas/agent-format.md`.
- [x] En `src/ui/pages/ProfilePage.jsx`, mantener «Quién eres y cómo trabajas», «Qué trabajo buscas», «Intereses y voz» y «Trayectoria y evidencias» como bloques separados. Conservar sus estados de edición, guardado, conflictos y enlaces internos. Reutilizar los desplegables accesibles y evitar desplegables dentro de desplegables.
- [x] En «Qué trabajo buscas», poner al principio tres grupos visibles al abrirlo:
  1. **Qué te gustaría hacer**. Tareas primero, nombres de puestos y sectores después.
  2. **Dónde y en qué condiciones**. Ubicación, modalidad preferida, requisitos imprescindibles y lo que quieres evitar.
  3. **Qué sería un plus**. Preferencias flexibles y aspectos que merece la pena preguntar antes de decidir.
- [x] Mover los objetivos a corto, medio y largo plazo a un grupo «Hacia dónde quieres ir» después de esos tres grupos. Mantener los valores y el esquema de objetivos.
- [x] Diseñar cada grupo como una tarjeta ligera con título, una frase de ayuda y suficiente espacio. Una columna en móvil y hasta dos para campos breves en escritorio. Mantener los textos largos a ancho completo. Usar los colores y la tipografía actuales. Mostrar un ejemplo por grupo y conservar las etiquetas al escribir. Colocar textos de interfaz en `src/i18n/es.js` y limitar los estilos nuevos a Perfil.

## 2. Ampliar las preferencias sin migración

- [x] Añadir a `careerPreferences` tres listas opcionales de texto: `mustHaves` («Imprescindible», por ejemplo jornada completa), `niceToHaves` («Sería un plus», por ejemplo mentoría o formación) y `thingsToClarify` («Quiero saber antes de decidir», por ejemplo frecuencia real de oficina, tamaño del equipo o guardias).
- [x] Mantener `conditions` como «Otras condiciones que ya hayas indicado» y conservar su contenido literal. Evitar reclasificar datos antiguos por inferencia. Mantener `avoid` como preferencias a evitar y tratarlo como exclusión solo si el usuario lo indica expresamente.
- [x] Declarar los campos en `schemas/profile.schema.json`, añadir listas vacías en `templates/profile.json` e incluirlos en la validación local de `src/data/storage.js` y en el catálogo de `src/data/profile-fields.js`. Incluirlos en el recuento de Perfil. Mantener la versión de esquema y preservar propiedades desconocidas. Documentar el uso en `schemas/agent-format.md` y explicar la pantalla en el README. Usar datos ficticios para verificar.

## 3. Ajustar los prompts de Vacantes

- [x] En `src/i18n/prompt-inbox.es.js`, actualizar `research-vacancies` y la valoración individual. Ambos deben aplicar las mismas reglas: usar tareas y títulos equivalentes para descubrir, objetivos para ordenar y evidencias confirmadas para valorar el encaje.
- [x] Tratar `mustHaves` como filtro. Si hay un incumplimiento confirmado, excluir la oferta. Si falta un dato imprescindible, mostrarla aparte como pendiente de comprobar. Contar para el objetivo de diez solo las ofertas verificadas elegibles. Usar `niceToHaves` para ordenar y `thingsToClarify` para sugerir preguntas. Si un plus o una respuesta no consta, dejarlo como desconocido. Si `conditions` contiene una condición ambigua, no convertirla automáticamente en filtro.
- [x] Para cada oferta, separar los motivos del encaje, los extras verificados y las preguntas pendientes. Aprovechar el contacto profesional ya verificado para sugerir una pregunta pertinente a su función. Mantener la búsqueda amplia, las fuentes públicas, la deduplicación y la generación de `cvAdvice` y `adaptedCv` para ofertas nuevas con evidencia suficiente. Comprobar que se usa el mismo texto desde el Buzón y el botón de Vacantes.
- [x] Revisar los prompts que escriben Perfil. Permitir que la entrevista y la entrada manual guarden estos campos cuando el usuario los indique. El flujo desde CV o LinkedIn conserva los valores existentes y evita deducir preferencias.

## 4. Criterios de aceptación

- [x] Con Perfil vacío se entiende por dónde empezar. Con un Perfil anterior se ven sus condiciones y todos los objetivos. Guardar y recargar conserva valores, acentos, listas y propiedades desconocidas.
- [x] Probar la pantalla con teclado, escritorio y móvil. Los títulos y acciones se distinguen visualmente, el orden de foco sigue el formulario y no hay desplazamiento horizontal ni campos cortados.
- [x] Con datos ficticios, comprobar tres ofertas: una cumple y ofrece mentoría, otra cumple sin mentoría y una tercera omite un requisito imprescindible. Las dos primeras son elegibles y la tercera queda pendiente. Comprobar también una preferencia antigua ambigua, una búsqueda con Perfil vacío y el CV adaptado visible en «Ver detalles» cuando se guarda.
- [x] Ejecutar `pnpm format:check`, `pnpm test`, `pnpm build`, `pnpm check:publish` y `git diff --check`. Separar los commits de interfaz, datos y prompts si cada uno deja el proyecto en un estado coherente.


**Alcance de la validación de prompts.** CareerKit prepara prompts pero no ejecuta un modelo. Por eso, los tres escenarios de requisitos (cumple y tiene un plus, cumple sin el plus, e imprescindible desconocido) se verificaron contra el contrato explícito de los prompts y sus pruebas, no mediante una ejecución de IA. La adaptación de CV por oferta y su panel de detalles se conservaron y revisaron en el código existente.
