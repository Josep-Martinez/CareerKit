# Formato local para agentes

Los cinco módulos son JSON UTF-8 independientes con `schemaVersion: 1`. Valida cada fichero contra su propio esquema. Conserva propiedades desconocidas y no reemplaces un documento inválido; señala el error para que el usuario lo corrija.

## Módulos

- `profile.json`: descripción profesional, objetivos y colecciones de evidencias, experiencia, formación, habilidades, certificaciones, idiomas, proyectos y aprendizajes. Cada elemento debe tener un `id` estable cuando se cree. Usa `confirmed` para distinguir lo confirmado de lo pendiente. `cvEvidence`, `onLinkedIn` e `internal` expresan destino/privacidad editorial.
- `linkedin.json`: copia literal del contenido publicado, `lastUpdated` opcional y anotaciones `audits`. Las notas usan `id`, `section`, `priority`, `problem`, `reasonEvidence`, `recommendation`, `proposedText`, `date` y `status` (`pendiente`, `aplicada`, `descartada`). No edites `published` a partir de una recomendación sin petición del usuario.
- `cv.json`: `masterText`, `lastUpdated`, `lastReviewed`. Fechas como texto ISO `YYYY-MM-DD` si se conocen; cadena vacía si no constan.
- `vacancies.json`: lista `items`, con `id` estable, información de la oferta, verificación, descripción completa, valoración, evidencias relacionadas y orden `preference`. `matchingEvidenceIds` apunta a elementos de perfil. `salaryVerified` solo es verdadero si el salario está comprobado.
- `priorities.json`: lista `items` con `id`, `title`, `level` (`alta`, `media`, `baja`), `reason`, `date` y `section` (`profile`, `linkedin`, `cv`, `vacancies`). `order` (entero, opcional) permite ordenar prioridades; si falta, se conserva el orden del array tras el nivel. Solo añadir prioridades tras petición del usuario.

Las plantillas en `../templates/` muestran la forma mínima vacía. No contienen datos de muestra. Mantén identificadores al editar y elimina una evidencia solo si el usuario lo solicita; antes de hacerlo, revisa referencias desde las vacantes.
