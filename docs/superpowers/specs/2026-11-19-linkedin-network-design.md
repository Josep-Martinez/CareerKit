# Red de LinkedIn: diseño

## Objetivo

Añadir **Red** a Contenido de LinkedIn para descubrir perfiles profesionales públicos que merezca la pena seguir, especialmente recruiters y responsables relacionados con los puestos que busca el usuario. Las recomendaciones se guardan en el módulo local existente y se revisan desde la web.

## Decisiones

- Añadir una cuarta pestaña **Red** junto a Artículos, Publicaciones y Comentarios.
- Mantener `schemaVersion: 1` y ampliar de forma opcional `private-data/linkedin-content.json`; no crear otro archivo ni modificar datos reales durante el desarrollo.
- Añadir `network[]` como lista de perfiles recomendados. Cada elemento contiene un ID estable, nombre, URL pública del perfil, categoría (`recruiter`, `hiring-manager`, `team-leader`, `industry-expert` o `company-leader`), motivo concreto de relevancia, fuente de verificación, fecha de verificación y estado (`pending`, `followed` o `dismissed`). Cargo y empresa son opcionales y solo se guardan si se confirman con fuentes públicas.
- La interfaz muestra vistas Pendientes, Seguidos y Descartados. El usuario cambia el estado; **Seguidos** solo registra una acción que la persona hizo fuera de CareerKit. La app nunca sigue perfiles, conecta ni envía mensajes. Un perfil descartado se conserva para deduplicarlo en búsquedas futuras; el usuario puede restaurarlo a Pendientes.
- Los perfiles se ordenan por verificación más reciente y relevancia descrita, sin puntuaciones inventadas. Cada tarjeta ofrece el enlace al perfil de LinkedIn y, cuando sea diferente, a la fuente pública usada para verificar identidad o puesto.

## Flujo de búsqueda

1. El prompt comprueba las instrucciones del proyecto, los archivos locales disponibles, su validez y si puede guardar en la carpeta conectada. Si falta acceso, puede continuar investigando en la web, pero no afirma que guardó resultados; explica cómo abrir CareerKit con `pnpm local`, conectar la carpeta y recargar el archivo.
2. Con acceso autorizado, consulta `profile.json`, `linkedin.json` y `cv.json`. Usa familias de puestos, tareas, sectores y ubicación indicados en `careerPreferences`; evidencias profesionales confirmadas; el CV; el contenido público de LinkedIn; y los temas profesionales expresamente declarados en `contentDirection`. Los intereses sirven como filtros temáticos, no como afirmaciones públicas sobre el usuario. No usa `personalContext` para inferir intereses ni objetivos, ni copia datos de contacto, domicilio, motivaciones o vulnerabilidades a consultas públicas.
3. Descubre perfiles mediante búsqueda web pública actual, páginas de empresas y equipos, fuentes profesionales y resultados públicos de LinkedIn. Prioriza, en este orden flexible, recruiters o talento que seleccionan para roles pertinentes; responsables de contratación y líderes de esos equipos; profesionales y referentes cuyos temas conectan de forma verificable con los intereses indicados; y líderes de empresa solo si su actividad es relevante para el objetivo.
4. Si el conector de personas de LinkedIn está disponible, lo usa para localizar o contrastar perfiles después de identificar el nombre. El conector actual requiere nombre o apellido; no sustituye la búsqueda amplia. Sin conector, continúa con búsqueda web pública. No instala herramientas ni se bloquea por su ausencia.
5. Abre y confirma cada perfil en fuentes públicas actuales. Verifica nombre, cargo y empresa antes de afirmarlos; distingue los datos no confirmados y no inventa afiliaciones, correos, teléfonos ni influencia. No usa número de seguidores como prueba de relevancia. No promete que seguir a alguien hará que vea el CV ni aumentará las opciones de empleo.
6. Compara con todos los elementos de `network[]` —también seguidos y descartados— y deduplica por URL canónica de perfil. Añade únicamente perfiles nuevos que haya podido verificar, con fuente y fecha. Valida el archivo antes y después, conserva IDs y propiedades desconocidas y vuelve a leerlo tras guardar.

## Interfaz y prompt

- Red muestra un breve resumen de los tipos de perfiles buscados, un campo opcional para acotar empresa, puesto o tema y un botón principal para copiar el prompt.
- Incluye la vista previa exacta del prompt y estados accesibles de copiado/error, siguiendo los otros flujos de la página.
- Las tarjetas muestran categoría, persona, cargo y empresa si se verificaron, relevancia para el objetivo, fecha de comprobación, perfil público y fuente. Acciones: **Ya lo sigo**, **Descartar** y **Volver a pendientes** según el estado.
- El mismo prompt se añade al Buzón para conservar un único texto fuente y ofrecer el flujo desde ambos lugares.
- Al terminar la búsqueda, el prompt pide volver a Contenido de LinkedIn → Red y recargar `linkedin-content.json` si CareerKit detecta un cambio externo.

## Privacidad y límites

- No abrir cuentas iniciadas, mensajes ni datos privados de LinkedIn; no seguir perfiles, conectar, enviar mensajes ni solicitar empleo.
- Solo se registra información profesional pública necesaria para que el usuario revise la recomendación. No se guarda correo o teléfono en esta lista.
- El CV y Perfil son fuentes privadas locales: se usan para construir criterios profesionales, no se copian enteros a búsquedas, perfiles recomendados, skills, ejemplos ni build.
- No leer ni modificar `private-data/` durante el cambio.

## Compatibilidad y verificación

- Validar `network[]` tanto en JSON Schema como en el validador local; dejarla opcional para admitir archivos existentes.
- Actualizar la plantilla, `schemas/agent-format.md`, el prompt del Buzón, sus etiquetas y la documentación de uso.
- Añadir pruebas para perfiles válidos e inválidos, URL, estados, transiciones y conservación de propiedades desconocidas; comprobar que `network` cuenta como contenido del módulo.
- Ejecutar `pnpm format`, `pnpm run lint:check` si existe, pruebas, compilación y comprobación de publicación. Revisar la pestaña en escritorio y móvil y probar copia del prompt.
- Mantener los cambios en la rama actual y el PR #19. No tocar datos privados.

## Criterios de aceptación

1. Un archivo antiguo de `linkedin-content.json` sin `network` continúa cargando y guardándose sin migración obligatoria.
2. La búsqueda evita repetir perfiles pendientes, seguidos o descartados y conserva propiedades desconocidas.
3. La interfaz permite revisar recomendaciones y cambiar su estado sin realizar ninguna acción en LinkedIn.
4. El prompt distingue hechos comprobados, inferencias y datos no disponibles; entrega enlaces y motivos verificables, sin garantizar resultados de networking.
5. Si falla el acceso local o la copia del prompt, el usuario recibe una explicación clara y no aparece ningún estado falso de guardado.
