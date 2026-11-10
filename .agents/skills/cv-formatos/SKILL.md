---
name: cv-formatos
description: Use when preparing either of CareerKit's two CV layouts or maintaining both language versions.
---

# Formatos de CV de CareerKit

Usa esta guía con [cv-optimizer](../cv-optimizer/SKILL.md). «Formato español» identifica la maquetación de dos columnas y su versión se redacta en español; «formato inglés» identifica la maquetación de una columna y su versión se redacta en inglés. El país del puesto y sus convenciones son una decisión aparte. Conserva las dos bases generales en `cv.json` y actualízalas solo cuando el usuario lo pida.

## Formato español · dos columnas

- **Columna lateral:** fotografía en la parte superior solo si la aporta el usuario y quiere incluirla; teléfono, correo, código postal y ciudad si los proporciona; enlaces de LinkedIn y GitHub cuando sean pertinentes; una lista corta de hard skills ordenadas por relevancia para la oferta; idiomas confirmados, incluido valenciano cuando figure en los datos, con nivel solo cuando esté confirmado.
- **Columna principal:** nombre, subtítulo de posicionamiento profesional, introducción de 3–6 líneas, experiencia profesional con pocas tareas pertinentes, proyectos personales en un bloque propio que no se confunda con empleo y experiencia académica ordenada de la formación más específica a la más general.
- **Subtítulo:** usa un nombre de puesto o familia de puestos reconocible y lenguaje natural para describir el valor profesional. No lo conviertas en una lista de tecnologías. En una base general, representa los objetivos y la evidencia más amplios; para una vacante concreta, adáptalo a las tareas y al contexto de esa empresa sin atribuir experiencia no demostrada.
- **Primera línea de la introducción:** debe ganar la atención del lector con un diferenciador confirmado: una aportación, hito o combinación de experiencia que encaje con el puesto. Después concreta el encaje con dos o tres hechos breves. Busca un tono atractivo y memorable, no grandilocuente ni lleno de adjetivos. Deja para la entrevista el contexto y el relato completo, no los datos esenciales para valorar la candidatura. Si no hay evidencia para sostener una apertura distintiva, pregunta qué dato falta o marca el hueco; no la sustituyas por una frase genérica como «profesional con experiencia».
- Incluye trabajo en equipo, aprendizaje y comunicación solo cuando haya acciones o resultados que los demuestren; no los presentes como una lista de cualidades. Selecciona pocas tareas por experiencia —normalmente entre dos y cuatro— y prioriza las que respondan a la oferta. Mantén los proyectos personales separados del empleo.
- No añadas dirección completa ni datos personales que no hagan falta. No busques una fotografía en otras cuentas ni generes una imagen personal. Si el usuario pide orientación fotográfica, sugiere fondo neutro y ropa profesional —por ejemplo, camisa azul clara o americana— como opciones.

## English format · single column

- Write the whole CV in English. Use one column and this order: name, role-family subtitle, 3–6-line profile summary, one contact line, professional experience, selected projects as a separate section, academic experience ordered from most specific to most general when relevant, prioritized hard skills, and languages. Make the subtitle employer-specific only when preparing a draft for a named vacancy.
- Open the summary with a clear, evidence-backed reason to keep reading; express the candidate's value in natural English, not a stack of tools or generic traits. Mention teamwork, learning, and communication only when actions or outcomes demonstrate them; leave the full story for the interview without hiding essential evidence. If the evidence does not support a distinctive first sentence, ask what is missing or flag the gap instead of falling back to a generic profile.
- Adapt spelling and terminology to the destination country or vacancy when known. An English-language version does not by itself mean that the role is in the UK or any particular country.
- Include contact details only when the user supplied and wants them. Use city and postal code rather than a full home address; add LinkedIn and GitHub when relevant.
- Do not add a photo by default. If requested, consider local market and submission-channel guidance before recommending one.

## Shared decisions

- Para preparar o actualizar las bases generales, contrasta `profile.json` con la copia publicada en `linkedin.json`. Conserva en el CV los hechos confirmados y aptos para CV; mantén literal la copia de LinkedIn y no la edites al actualizar el CV. Si las fuentes discrepan sobre un hecho, señala la diferencia y pide confirmación antes de reflejarlo.
- La aplicación muestra el CV base como consulta. El agente local prepara o actualiza `cv.json` cuando el usuario lo solicita y puede acceder a los ficheros; no afirmes que se guardó si no tienes acceso local.
- La adaptación específica de una oferta se anota en `vacancies.json` dentro de `cvAdvice`: elige la versión recomendada, explica el motivo y registra por separado los cambios sugeridos para cada idioma. No reescribas el CV base al guardar esas indicaciones.

- Order skills by the selected vacancy's actual tasks and requirements; keep only the strongest relevant skills. Do not copy long keyword lists into the CV.
- When choosing a subtitle, examine tasks in several current vacancies if the user asks to explore roles. Identify recurring work and suitable role names, then compare them with confirmed evidence. A title match alone is not enough, and no match guarantees an interview or offer.
- When the user asks which roles could fit, use [job-search](../job-search/SKILL.md) to investigate several current offers by responsibilities as well as titles. Use recurring tasks to suggest a role family and subtitle; do not infer a fit from title similarity alone.
- For a vacancy-specific file the user requests, use the filename pattern `Puesto_de_trabajo-Nombre_Apellido`, replacing the placeholders with the confirmed target role and user-provided name. Replace spaces with underscores and remove characters invalid for filenames. Save only in an approved private location, never in the repository or build.
- Keep experience claims, dates, results, and language levels tied to confirmed user-provided evidence. Preserve project names only when present in CareerKit data and approved as CV evidence.
- A photo, contact detail, language, skill, or role preference missing from the user's data is not a placeholder to invent. Ask or omit it.
- Use `cv.json.versions.spanish` and `cv.json.versions.english` for the two source texts. Never replace one with a translation of the other without keeping both. Do not write personal CV examples or drafts into tracked files.
