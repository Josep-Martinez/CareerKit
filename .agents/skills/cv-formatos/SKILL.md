---
name: cv-formatos
description: Use when preparing either of CareerKit's two CV layouts or maintaining both language versions.
---

# Formatos de CV de CareerKit

Usa esta guía con [cv-optimizer](../cv-optimizer/SKILL.md). «Formato español» identifica la maquetación de dos columnas y su versión se redacta en español; «formato inglés» identifica la maquetación de una columna y su versión se redacta en inglés. El país del puesto y sus convenciones son una decisión aparte. Si el usuario pide ambas versiones, prepara cada una por separado y conserva sus textos independientes en `cv.json`.

## Formato español · dos columnas

- **Columna lateral:** fotografía solo si la aporta el usuario y quiere incluirla; teléfono y correo si los proporciona; código postal y ciudad, LinkedIn y GitHub cuando sean pertinentes; una lista corta de hard skills ordenadas según la oferta; idiomas indicados por el usuario, con nivel solo cuando esté confirmado.
- **Columna principal:** nombre, subtítulo adaptado a las tareas del puesto y a la empresa, introducción de 3–6 líneas, experiencia profesional con pocas tareas relevantes, proyectos personales en un bloque propio que no se confunda con empleo y experiencia académica ordenada de la formación más específica a la más general.
- Abre con el encaje y la evidencia más distintiva. Incluye trabajo en equipo, aprendizaje y comunicación solo cuando haya hechos que los demuestren. La introducción puede ser atractiva y memorable, pero no debe ocultar información esencial ni sustituirla por adjetivos.
- No añadas dirección completa ni datos personales que no hagan falta. No busques una fotografía en otras cuentas ni generes una imagen personal. Si el usuario pide orientación fotográfica, sugiere fondo neutro y ropa profesional —por ejemplo, camisa azul clara o americana— como opciones.

## English format · single column

- Write the whole CV in English. Use one column and this order: name, employer-specific role subtitle, 3–6-line profile summary, one contact line, professional experience, selected projects as a separate section, academic experience, prioritized hard skills, and languages.
- Adapt spelling and terminology to the destination country or vacancy when known. An English-language version does not by itself mean that the role is in the UK or any particular country.
- Include contact details only when the user supplied and wants them. Use city and postal code rather than a full home address; add LinkedIn and GitHub when relevant.
- Do not add a photo by default. If requested, consider local market and submission-channel guidance before recommending one.

## Shared decisions

- Order skills by the selected vacancy's actual tasks and requirements; keep only the strongest relevant skills. Do not copy long keyword lists into the CV.
- When choosing a subtitle, examine tasks in several current vacancies if the user asks to explore roles. Identify recurring work and suitable role names, then compare them with confirmed evidence. A title match alone is not enough, and no match guarantees an interview or offer.
- Keep experience claims, dates, results, and language levels tied to confirmed user-provided evidence. Preserve project names only when present in CareerKit data and approved as CV evidence.
- A photo, contact detail, language, skill, or role preference missing from the user's data is not a placeholder to invent. Ask or omit it.
- Use `cv.json.versions.spanish` and `cv.json.versions.english` for the two source texts. Never replace one with a translation of the other without keeping both. Do not write personal CV examples or drafts into tracked files.
