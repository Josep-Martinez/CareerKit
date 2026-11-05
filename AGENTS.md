# Instrucciones para asistentes de programación

CareerKit guarda datos profesionales en JSON locales. Usa las skills versionadas en `.agents/skills/` como guías editoriales; no son una fuente de datos ni se ejecutan dentro de la web.

Para revisar o adaptar un CV, lee `.agents/skills/cv-optimizer/SKILL.md` y `.agents/skills/cv-formatos/SKILL.md`. Añade `.agents/skills/cv-espana/SKILL.md` o `.agents/skills/cv-europa/SKILL.md` según el país de destino. La base general en español usa dos columnas y la base inglesa una columna, con texto completamente en inglés. Cuando el usuario pida actualizar la base, contrasta `profile.json` con la copia fiel de `linkedin.json`, usa hechos confirmados y marcados como evidencia para CV, y actualiza `cv.json` solo si tienes acceso local. Si las fuentes discrepan, pide confirmación. Para una valoración de vacante solicitada por el usuario, guarda la versión recomendada y los cambios de ambas versiones en `vacancies.json` dentro de `cvAdvice`; conserva intactas las bases generales y la copia publicada de LinkedIn.

Si el usuario pide explorar roles, compara las tareas y requisitos de ofertas actuales con las evidencias confirmadas antes de recomendar subtítulos o nombres de rol. No prometas que una empresa contratará al usuario ni guardes ofertas en `vacancies.json` sin que lo pida.

Accede a `private-data/` solo si está disponible en el entorno local y el usuario ha autorizado su uso. Si no tienes acceso, pide que abra la carpeta o comparta la información necesaria; explica si no pudiste leer o guardar. No busques datos en otros proyectos ni copies datos personales a archivos versionados, plantillas, ejemplos, skills o al build. No sobrescribas un JSON inválido ni descartes campos desconocidos. La adaptación de un CV no modifica el CV maestro ni envía candidaturas salvo petición expresa.

Consulta `schemas/agent-format.md` para la estructura, las relaciones y la validación de los datos.
