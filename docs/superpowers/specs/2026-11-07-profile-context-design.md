# Perfil como contexto personal y profesional

## Objetivo

Convertir Perfil en una ficha privada que permita al usuario explicar cómo piensa, qué le interesa, qué trabajo busca y cómo quiere expresarse. El agente podrá usar ese contexto para orientar vacantes y preparar ideas de LinkedIn. LinkedIn seguirá guardando únicamente una copia fiel de lo publicado y sus auditorías.

## Decisión de arquitectura

Ampliar el módulo existente `profile.json`; no crear un sexto archivo ni mezclar datos en `linkedin.json`. Añadir campos opcionales compatibles con `schemaVersion: 1`, mantener las propiedades desconocidas y conservar las secciones actuales de objetivos y evidencias profesionales. Los datos nuevos no contendrán ejemplos personales.

La propuesta agrupa el formulario en cuatro áreas:

1. **Quién eres y cómo trabajas:** descripción personal, valores, motivaciones, forma de pensar, manera de aprender y colaborar, fortalezas, áreas que quieres desarrollar y condiciones que te ayudan a trabajar bien.
2. **Qué trabajo buscas:** familias de puestos, tareas que te interesan, sectores, modalidad, ubicación, condiciones preferidas y aspectos que quieres evitar.
3. **Intereses y voz para publicaciones:** temas que te interesan, ideas u opiniones que quieres explorar, tono propio y temas que prefieres evitar.
4. **Trayectoria y evidencias:** resumen profesional, objetivos, experiencia, formación, habilidades, certificaciones, idiomas, proyectos, actividades, aprendizajes y evidencias demostrables existentes.

Las tres primeras áreas son contexto interno por defecto. Ningún prompt copiará automáticamente ese contenido a LinkedIn ni lo tratará como una afirmación pública. Los prompts podrán usarlo para orientar una búsqueda o proponer borradores; cualquier uso explícito de información privada en contenido público requerirá presentárselo al usuario y esperar confirmación. La copia `linkedin.json.published` solo cambiará por petición expresa.

## Datos y compatibilidad

`profile.json` incorporará estos objetos opcionales. Cada propiedad interna también será opcional para permitir ediciones parciales; la plantilla mostrará la estructura completa vacía.

- `personalContext`: `aboutMe`, `motivations`, `thinkingStyle`, `learningStyle`, `workStyle`, `preferredEnvironment` y `boundaries` como texto; `values`, `interests`, `strengths` y `growthAreas` como listas de texto.
- `careerPreferences`: `roleFamilies`, `tasks`, `industries`, `workModes` y `avoid` como listas de texto; `location` y `conditions` como texto.
- `contentDirection`: `themes` y `viewpoints` como listas de texto; `tone` como texto; `avoid` como lista de texto.

`professionalProfile` seguirá siendo un resumen de presentación profesional y no sustituirá `personalContext`. El contenido personal no tendrá marcas de publicación ni de evidencia para CV; los elementos de trayectoria mantienen sus controles actuales.

El esquema validará los objetos nuevos cuando estén presentes, sin exigirlos a los archivos existentes. La plantilla incluirá sus valores vacíos. El validador local reconocerá los campos, contará su contenido para el estado de Perfil y seguirá avisando de propiedades desconocidas. No se leerán ni modificarán datos reales durante el cambio.

El agente no inferirá intereses, valores, debilidades, preferencias, tono ni objetivos a partir de un CV o de LinkedIn. El prompt de actualización desde CV solo importará hechos explícitos y dejará los campos personales sin completar. El prompt manual de Perfil podrá preguntar lo necesario y solo guardará respuestas compartidas por el usuario.

## Estructura de la copia de LinkedIn

La copia publicada añadirá `published.languages` como una lista opcional de cadenas para no invalidar JSON existentes. La plantilla nueva incluirá `languages: []`. Cada entrada de `experience`, `education`, `languages`, `skills`, `certifications`, `projects` y `featured` será una cadena que conserva el texto de un elemento publicado. El esquema y el validador comprobarán que cada lista contenga cadenas; no convertirán el texto a campos inferidos.

Si la fuente no muestra una sección, se conserva sin cambios. Si una entrada contiene indicadores de truncamiento como «… más», no se reemplaza el texto completo existente por ese fragmento: se pide una copia expandida o confirmación explícita. Los nombres, titular y Acerca de que no aparezcan tampoco se vacían. Las secciones completas y visibles pueden prepararse por separado sin afirmar que el documento entero sea una copia actual.

## Comportamiento de prompts

- **Búsqueda de vacantes:** priorizar tareas, familias de puestos, objetivos y condiciones indicadas en Perfil. No asumir ubicación, salario, modalidad ni sectores ausentes.
- **Ideas y borradores de LinkedIn:** usar intereses, perspectivas y tono como guía privada; no inventar experiencias, opiniones o logros en primera persona.
- **Auditoría de LinkedIn:** comparar la copia publicada con evidencia profesional confirmada. Puede sugerir temas pertinentes a partir del contexto privado, pero los mantiene como sugerencias separadas.
- **Actualización de perfil desde un CV:** incorporar solo información que aparezca en el archivo y no rellenar contexto subjetivo por inferencia.

## Interfaz

La página mantendrá las colecciones de evidencias, pero las separará visualmente del dossier personal. Cada campo tendrá una etiqueta clara, una explicación breve de para qué lo usa el agente y una indicación cuando su contenido sea interno. Los formularios seguirán siendo editables manualmente y guardarán en `profile.json`; no habrá generación automática ni sincronización.

## Límites y validación

- Sin backend, cuentas, APIs, telemetría, CDN ni conexión automática a LinkedIn o modelos.
- Sin publicaciones ni cambios automáticos de la copia publicada.
- No modificar archivos de `private-data/` durante el desarrollo.
- Verificar formato, compilación y comprobación de publicación; revisar manualmente Perfil con plantilla vacía y con campos ya existentes, guardado local y uso por prompts.
- Asegurar que los datos del usuario no aparezcan en el repositorio, ejemplos ni build.
