# Instrucciones para asistentes de programación

CareerKit guarda datos profesionales en JSON locales. Usa las skills versionadas en `.agents/skills/` como guías editoriales; no son una fuente de datos ni se ejecutan dentro de la web.

Para revisar o adaptar un CV, lee `.agents/skills/cv-optimizer/SKILL.md` y `.agents/skills/cv-formatos/SKILL.md`. Añade `.agents/skills/cv-espana/SKILL.md` o `.agents/skills/cv-europa/SKILL.md` según el país de destino. Usa la versión española de dos columnas o la versión inglesa de una columna según la petición; la segunda debe estar redactada en inglés. Basa el trabajo en el objetivo actual del usuario y en toda la evidencia pertinente disponible en los módulos CareerKit. Comprueba el perfil aunque una evidencia aún no aparezca en el CV maestro; respeta los estados de confirmación, los IDs estables y las marcas de información interna.

Si el usuario pide explorar roles, compara las tareas y requisitos de ofertas actuales con las evidencias confirmadas antes de recomendar subtítulos o nombres de rol. No prometas que una empresa contratará al usuario ni guardes ofertas en `vacancies.json` sin que lo pida.

Accede a `private-data/` solo si está disponible en el entorno local y el usuario ha autorizado su uso. Si no tienes acceso, pide que abra la carpeta o comparta la información necesaria; explica si no pudiste leer o guardar. No busques datos en otros proyectos ni copies datos personales a archivos versionados, plantillas, ejemplos, skills o al build. No sobrescribas un JSON inválido ni descartes campos desconocidos. La adaptación de un CV no modifica el CV maestro ni envía candidaturas salvo petición expresa.

Consulta `schemas/agent-format.md` para la estructura, las relaciones y la validación de los datos.
