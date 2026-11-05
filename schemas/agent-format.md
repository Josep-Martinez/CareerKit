# Formato local para agentes

Los cinco módulos son JSON UTF-8 independientes y cada uno se valida con su propio esquema. `profile.json`, `linkedin.json`, `vacancies.json` y `priorities.json` usan `schemaVersion: 1`; `cv.json` usa `schemaVersion: 2`. Conserva propiedades desconocidas y no reemplaces un documento inválido; señala el error para que el usuario lo corrija.

## Módulos

- `profile.json`: descripción profesional, objetivos y colecciones de evidencias, experiencia, formación, habilidades, certificaciones, idiomas, proyectos y aprendizajes. Cada elemento debe tener un `id` estable cuando se cree. Usa `confirmed` para distinguir lo confirmado de lo pendiente. `cvEvidence`, `onLinkedIn` e `internal` expresan destino/privacidad editorial.
- `linkedin.json`: copia literal del contenido publicado, `lastUpdated` opcional y anotaciones `audits`. Cada punto usa `id`, `section`, `action` (`corregir`, `anadir`, `aclarar`), `priority`, `problem`, `reasonEvidence`, `profileEvidenceIds`, `recommendation`, `proposedText`, `date` y `status` (`pendiente`, `aplicada`, `descartada`). `profileEvidenceIds` referencia IDs estables de experiencia, formación, proyectos, evidencias o aprendizajes en `profile.json`. La vista presenta la recomendación debajo de la sección objetivo; las notas no modifican `published`. No edites `published` a partir de una recomendación sin petición del usuario.
- `cv.json`: `versions.spanish` y `versions.english`, cada una con `masterText`, `lastUpdated` y `lastReviewed`. Fechas como texto ISO `YYYY-MM-DD` si se conocen; cadena vacía si no constan. El texto inglés se escribe en inglés. `previousVersion` puede conservar un CV v1 hasta que el usuario elija su idioma; no lo asignes por inferencia.
- `vacancies.json`: lista `items`, con `id` estable, información de la oferta, verificación, descripción completa, valoración, evidencias relacionadas y orden `preference`. `matchingEvidenceIds` apunta a elementos de perfil. `salaryVerified` solo es verdadero si el salario está comprobado.
- `priorities.json`: lista `items` con `id`, `title`, `level` (`alta`, `media`, `baja`), `reason`, `date` y `section` (`profile`, `linkedin`, `cv`, `vacancies`). `order` (entero, opcional) permite ordenar prioridades; si falta, se conserva el orden del array tras el nivel. Solo añadir prioridades tras petición del usuario.

Las plantillas en `../templates/` muestran la forma mínima vacía. No contienen datos de muestra. Mantén identificadores al editar y elimina una evidencia solo si el usuario lo solicita; antes de hacerlo, revisa referencias desde las vacantes.

## Evidencias para adaptar un CV

Cuando el usuario pida revisar o adaptar un CV, usa `cv.json` como texto maestro, `profile.json` para los objetivos y las evidencias pertinentes, y la vacante seleccionada de `vacancies.json` o la descripción que aporte el usuario. Revisa las evidencias relacionadas por `matchingEvidenceIds` y también otras entradas pertinentes del perfil para no perder información relevante. Usa datos confirmados y marcados como evidencia para CV; no incluyas información interna ni pendiente de confirmar sin autorización. Una valoración, prioridad o lista de carencias orienta el trabajo, pero no demuestra un hecho. Consulta `linkedin.json` solo cuando el usuario lo solicite o sea directamente pertinente; su copia publicada no debe modificar el CV por sí sola.

Si no tienes acceso local a los JSON, pide al usuario que abra la carpeta o comparta los datos necesarios y deja claro que no pudiste leerlos ni guardarlos. La adaptación no debe cambiar `cv.json` automáticamente ni guardar contenido personal en archivos versionados.

La app convierte un CV v1 en memoria y conserva su contenido en `previousVersion` sin modificar el archivo original. El cambio a v2 solo se escribe cuando el usuario guarda. Si el objeto v1 contiene `versions` o `previousVersion` desconocidos, no lo migres automáticamente: informa del conflicto para que no se pierdan campos.
