# Guías de agente de CareerKit

Estas guías son recursos locales para agentes de programación. La web no las ejecuta ni llama a un modelo. Se mantienen en Git como instrucciones genéricas y no deben incluir perfiles, CV reales, preferencias privadas, experiencias de ejemplo basadas en personas ni datos de `private-data/`.

Si tu agente no carga skills automáticamente, pídele que lea `AGENTS.md` y la guía indicada en esta tabla. Las rutas son relativas a la raíz del repositorio.

## CareerKit y datos locales

| Guía | Cuándo usarla |
|---|---|
| `careerkit-data-entry/SKILL.md` | Rellenar Perfil con información que aporta el usuario, transcribir su copia publicada de LinkedIn o modificar los JSON de CareerKit con permiso y validación. |

## CV, vacantes y candidaturas

| Guía | Cuándo usarla |
|---|---|
| `cv-optimizer/SKILL.md` | Revisar o actualizar las bases generales del CV con evidencias confirmadas de CareerKit. |
| `cv-formatos/SKILL.md` | Mantener el formato español de dos columnas y el formato inglés de una columna. |
| `cv-espana/SKILL.md` | Adaptar una candidatura al mercado español. |
| `cv-europa/SKILL.md` | Adaptarla a un país europeo concreto fuera de España. |
| `ruthless-cv-optimizer/SKILL.md` | Comparar y reescribir el CV para una vacante. Primero presenta el diagnóstico y hasta cinco preguntas; se detiene hasta recibir respuesta. |
| `job-search/SKILL.md` | Buscar vacantes actuales por tareas, títulos y preferencias indicadas; verificar las ofertas y sus fuentes. `job-search/portals.md` contiene puntos de partida, no garantías de vigencia. |
| `job-fit-assessor/SKILL.md` | Valorar una vacante o empresa frente a la evidencia y los objetivos del usuario. |
| `cover-letter-writer/SKILL.md` | Preparar una carta para una oferta concreta con información confirmada. |
| `star-story-extractor/SKILL.md` | Estructurar experiencias reales en formato STAR o relacionarlas con requisitos de una vacante. Solo las guarda en `profile.json` si el usuario lo pide. |

## LinkedIn

| Guía | Cuándo usarla |
|---|---|
| `li-profile/SKILL.md` | Auditar las secciones del perfil y proponer cambios vinculados a evidencias. La rúbrica editorial está en `li-profile/rubric.json`. |
| `li-bilingual/SKILL.md` | Preparar versiones independientes en español e inglés con el mismo sentido. |
| `li-audit/SKILL.md` | Analizar métricas de publicaciones que el usuario proporciona; no accede a su cuenta. |
| `li-post/SKILL.md` | Redactar una publicación; `li-post/hooks.json` aporta estructuras opcionales, no fórmulas de rendimiento. |
| `li-carousel/SKILL.md` | Crear el texto de un documento o carrusel para aprobación antes de preparar un archivo local. |
| `li-comment/SKILL.md` | Redactar comentarios útiles sobre publicaciones que comparte el usuario. |
| `li-dm/SKILL.md` | Escribir mensajes de conexión o seguimiento con un motivo real confirmado. |
| `li-human/SKILL.md` | Revisar claridad y formato. Sus scripts y señales locales no detectan autoría ni predicen resultados. |
| `li-inbox/SKILL.md` | Clasificar mensajes que el usuario pega y preparar posibles respuestas, sin acceder a su bandeja. |
| `li-plan/SKILL.md` | Organizar un plan de publicaciones y networking a partir de objetivos, disponibilidad y preferencias expresas. |
| `li-reply/SKILL.md` | Preparar respuestas a comentarios que el usuario comparte. |
| `li-repurpose/SKILL.md` | Extraer ideas para LinkedIn de un texto, transcripción u otro material proporcionado. |

## Reglas compartidas

- Los datos de CareerKit solo se leen desde `private-data/`, cuando existe acceso local y el usuario autoriza su uso. No busques material personal en otros proyectos o cuentas.
- La experiencia o los resultados ausentes se preguntan; no se inventan ni se completan con ejemplos de estas guías.
- Los borradores de LinkedIn, CV, cartas y mensajes no se publican, envían ni presentan a una empresa. No hagas solicitudes ni contactos automáticos.
- La copia publicada de LinkedIn se conserva literal. Las sugerencias de auditoría permanecen separadas.
- Cada guía nueva está generalizada para este repositorio. Las skills existentes `cv-optimizer`, `cv-formatos`, `cv-espana` y `cv-europa` se conservan sin cambios.

Las skills con licencia MIT conservan su archivo de licencia. La licencia de las guías de LinkedIn está en `LICENSE.linkedin-agent`.
