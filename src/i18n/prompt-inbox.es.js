export const PROMPT_INBOX_ES = {
  title: 'Buzón',
  eyebrow: 'HERRAMIENTAS PARA TU ASISTENTE',
  subtitle:
    'Elige una tarea, copia el prompt y pégalo en Codex, Claude Code u otro asistente local. CareerKit no ejecuta prompts ni se conecta a modelos.',
  usageTitle: 'Cómo usarlo',
  usageBody:
    'Abre este proyecto con tu asistente. Las guías indicadas en cada prompt le explican el proceso. Comprueba que puede acceder a private-data antes de pedirle que guarde cambios.',
  pendingTitle: 'Tienes 1 prompt pendiente',
  pendingBody:
    'Has guardado cambios en Perfil o LinkedIn. Usa «Actualizar la base general del CV» para que las dos versiones reflejen la información reciente.',
  openButton: 'Abrir el buzón',
  pendingTag: 'Pendiente · 1',
  copyButton: 'Copiar prompt',
  copied: 'Prompt copiado. Pégalo en tu asistente local.',
  copyFailed:
    'No se pudo copiar automáticamente. Selecciona el texto del prompt y cópialo.',
  confirmManualCopy: 'Ya he copiado el prompt',
  promptCopiedNotice:
    'Prompt copiado. Pégalo en tu asistente local cuando quieras.',
  sourceSavedProfile:
    'Perfil guardado. Prompt pendiente: «Actualizar la base general del CV desde Perfil y LinkedIn».',
  sourceSavedLinkedin:
    'LinkedIn guardado. Prompt pendiente: «Actualizar la base general del CV desde Perfil y LinkedIn».',
  sourceReloaded:
    'Cambios externos recargados. Revisa el prompt pendiente para actualizar las bases del CV.',
  sourceChanged:
    'Un archivo de Perfil o LinkedIn cambió fuera de la app. Recárgalo y usa el prompt para actualizar las bases del CV.',
  fallbackSaved:
    'JSON descargado. Sustitúyelo en private-data antes de usar el prompt de actualización del CV.',
  downloadPrepared:
    'JSON descargado para guardar manualmente en tu carpeta local.',
  vacancyReference: 'Vacante (puesto, empresa o identificador)',
  vacancyReferenceHint:
    'El prompt incluirá esta referencia para que el agente localice la oferta correcta.',
  vacancyPromptPlaceholder: '[indica el puesto, la empresa o el identificador]',
  promptLabel: 'Prompt',
  copyMissingVacancy: 'Indica primero qué vacante quieres revisar.',
  noNetwork:
    'Buscar ofertas actuales requiere que tu asistente tenga una herramienta de búsqueda. Si no la tiene, deberá decirlo y no inventar resultados.',
  searchLabel: 'Buscar un prompt',
  searchPlaceholder: 'Escribe una tarea, skill o tema',
  noSearchResults: 'No hay prompts que coincidan con esa búsqueda.',
  skillInstruction:
    'Antes de empezar, lee estas skills y referencias del proyecto. Sigue las instrucciones aplicables y di si no puedes abrir alguna ruta:',
  skillsLabel: 'Skills y archivos de referencia',
  categories: [
    { id: 'setup', title: 'Preparación, Perfil y LinkedIn' },
    { id: 'career', title: 'CV, vacantes y candidaturas' },
    { id: 'interviews', title: 'Entrevistas y evidencias' },
    { id: 'linkedin', title: 'Contenido y actividad en LinkedIn' },
  ],
  prompts: [
    {
      id: 'prepare-data',
      category: 'setup',
      title: 'Preparar o revisar los archivos de datos',
      use: 'Úsalo si falta private-data/ o alguno de los JSON. Conserva los archivos existentes y pide confirmación antes de reparar uno dañado.',
      skillPaths: ['AGENTS.md', '.agents/skills/careerkit-data-entry/SKILL.md'],
      text: [
        'En la raíz local de este proyecto, crea private-data/ solo si falta. Copia desde templates/ únicamente los JSON que no existan: profile.json, linkedin.json, cv.json, vacancies.json y priorities.json.',
        'No sobrescribas archivos existentes. Si uno está vacío, mal formado o no coincide con su esquema, conserva el original, indica el nombre exacto y compara su estructura con schemas/ y templates/. Propón una reparación que mantenga datos y campos desconocidos, y espera mi confirmación antes de modificar ese archivo.',
        'No busques datos en otros proyectos ni rellenes información personal por tu cuenta. Deja toda la información personal en private-data/. Valida cada módulo por separado y dime qué preparaste y qué requiere mi atención. Si no tienes acceso local, dilo y no afirmes que guardaste cambios.',
      ].join('\n\n'),
    },
    {
      id: 'fill-profile',
      category: 'setup',
      title: 'Completar Perfil con información que te doy',
      use: 'Úsalo cuando quieras que el asistente organice en el JSON los datos profesionales que compartes en la conversación.',
      skillPaths: ['AGENTS.md', '.agents/skills/careerkit-data-entry/SKILL.md'],
      text: [
        'Lee schemas/agent-format.md y revisa private-data/profile.json solo si tienes acceso local autorizado. Completa o actualiza únicamente la información que te he dado en esta conversación o confirmado expresamente.',
        'No busques datos en otros proyectos, documentos, PDF, cuentas o navegadores. No inventes fechas, resultados, niveles, cargos ni objetivos. Si una duda afecta a un hecho importante, pregúntame antes de guardarlo.',
        'Mantén los identificadores existentes; asigna un ID estable a cada elemento nuevo. Distingue experiencia, formación, proyectos, aprendizajes y evidencias adicionales. Marca confirmed, cvEvidence, onLinkedIn e internal según lo que haya confirmado, no por inferencia.',
        'Valida profile.json con schemas/profile.schema.json antes y después. Conserva campos desconocidos y no toques otros módulos. Si el archivo no es válido, no lo sobrescribas: explícame qué debe revisarse. Confirma qué guardaste solo si realmente pudiste hacerlo.',
      ].join('\n\n'),
    },
    {
      id: 'record-linkedin',
      category: 'setup',
      title: 'Registrar la copia de LinkedIn que te proporciono',
      use: 'Úsalo para copiar al JSON el texto publicado que tú has pegado o transcrito, sin reescribirlo.',
      skillPaths: ['AGENTS.md', '.agents/skills/careerkit-data-entry/SKILL.md'],
      text: [
        'Usa solo el texto de LinkedIn que te proporciono en esta conversación. No abras LinkedIn, no extraigas contenido de una cuenta o URL y no completes secciones ausentes.',
        'Copia el contenido fielmente en las secciones correspondientes de private-data/linkedin.json.published. Conserva palabras, idioma, puntuación y saltos que formen parte del texto. No traduzcas, corrijas ni mejores la copia publicada. No añadas auditorías en este paso.',
        'Valida linkedin.json con schemas/linkedin.schema.json, conserva sus campos desconocidos y no cambies ningún otro archivo. Si hay una ambigüedad de sección o el JSON es inválido, pregunta y deja el archivo intacto. No inventes la fecha lastUpdated. Confirma el guardado solo si tienes acceso local autorizado.',
      ].join('\n\n'),
    },
    {
      id: 'refresh-cv',
      category: 'career',
      title: 'Actualizar la base general del CV',
      use: 'Úsalo después de cambiar Perfil o LinkedIn, o cuando quieras revisar la coherencia de las dos bases.',
      skillPaths: [
        'AGENTS.md',
        'schemas/agent-format.md',
        '.agents/skills/cv-optimizer/SKILL.md',
        '.agents/skills/cv-formatos/SKILL.md',
      ],
      text: [
        'Revisa private-data/profile.json, private-data/linkedin.json y private-data/cv.json solo si tienes acceso local autorizado. Valida cada módulo con su propio esquema. Si Perfil o LinkedIn no contienen información confirmada suficiente, dime qué falta y espera a que la complete.',
        'Cuando las fuentes estén preparadas, actualiza las dos bases generales en cv.json usando únicamente hechos confirmados y marcados como aptos para CV. Contrasta con la copia publicada de LinkedIn; si las fuentes discrepan, pregunta antes de resolver la diferencia. Respeta IDs, privacidad y datos internos. No modifiques el contenido publicado en LinkedIn.',
        'Mantén la base española en español y con el formato español de dos columnas. Escribe la base inglesa completamente en inglés y con una columna. Conserva el sentido, pero no traduzcas una versión mecánicamente si el resultado no es natural. Registra fechas solo si están confirmadas y actualiza únicamente porque te lo he pedido.',
        'Valida cv.json después de editarlo, conserva sus campos desconocidos y no sustituyas un archivo inválido. Si no puedes acceder o guardar, dilo claramente; no afirmes que actualizaste las bases.',
      ].join('\n\n'),
    },
    {
      id: 'assess-vacancy',
      category: 'career',
      title: 'Valorar una vacante y recomendar cambios para cada CV',
      use: 'Úsalo para guardar debajo de una oferta cuál de las dos bases conviene usar y qué ajustar en cada una.',
      requiresVacancy: true,
      skillPaths: [
        'AGENTS.md',
        'schemas/agent-format.md',
        '.agents/skills/job-fit-assessor/SKILL.md',
        '.agents/skills/cv-optimizer/SKILL.md',
        '.agents/skills/cv-formatos/SKILL.md',
        '.agents/skills/cv-espana/SKILL.md',
        '.agents/skills/cv-europa/SKILL.md',
      ],
      text: [
        'Localiza en private-data/vacancies.json esta vacante: {{vacancy}}. Compara la descripción completa con evidencias confirmadas de private-data/profile.json y ambas bases de private-data/cv.json. Si no tienes acceso local, si no existe la oferta o falta la descripción completa, dilo y no inventes el contenido.',
        'Distingue requisitos demostrados, transferibles, no acreditados en las fuentes y carencias confirmadas. Indica una recomendación razonada: versión española, inglesa, ambas o pendiente. Usa la guía de país solo cuando el mercado esté claro; si la ubicación es ambigua y cambia la recomendación, pregúntame.',
        'Actualiza solo el cvAdvice de esa vacante: recommendedVersion, reason, assessedAt si conoces la fecha, spanishAdjustments y englishAdjustments. Da cambios específicos y distintos para cada versión. No reescribas cv.json ni la copia de LinkedIn; esta valoración no es el CV final ni una candidatura.',
        'Valida vacancies.json, conserva campos desconocidos y no guardes datos no verificados como hechos. Si el JSON es inválido, no lo sobrescribas. Confirma qué archivo guardaste solo después de comprobar el acceso y el resultado.',
      ].join('\n\n'),
    },
    {
      id: 'tailor-cv-vacancy',
      category: 'career',
      title: 'Adaptar un CV a una vacante concreta',
      use: 'Úsalo cuando quieras reescribir una versión para una oferta. El agente primero mostrará el diagnóstico y esperará tus respuestas.',
      requiresVacancy: true,
      skillPaths: [
        'AGENTS.md',
        'schemas/agent-format.md',
        '.agents/skills/ruthless-cv-optimizer/SKILL.md',
        '.agents/skills/job-fit-assessor/SKILL.md',
        '.agents/skills/cv-formatos/SKILL.md',
        '.agents/skills/cv-espana/SKILL.md',
        '.agents/skills/cv-europa/SKILL.md',
      ],
      text: [
        'Quiero adaptar un CV a esta oferta: {{vacancy}}. Lee la oferta completa y contrástala con private-data/cv.json y las evidencias confirmadas de private-data/profile.json, solo si tienes acceso local autorizado. Si falta el anuncio completo, el CV actual o el país cuando sea necesario, pregunta lo imprescindible.',
        'Sigue literalmente el proceso de dos fases de ruthless-cv-optimizer. En la primera respuesta, presenta requisitos principales, evidencia que los respalda, carencias demostrables y hasta cinco preguntas importantes. Detente ahí y espera mi respuesta; no redactes aún el CV final.',
        'Cuando responda, prepara únicamente la versión solicitada. No inventes hechos, métricas, fechas ni motivaciones. Elige idioma y formato según mi petición, la vacante y el canal; no prometas resultados ATS. Conserva intactas las dos bases generales en cv.json y guarda el borrador en el chat. Solo crea un archivo privado si te lo pido expresamente y apruebo su destino.',
        'No envíes solicitudes ni contactes a la empresa. Si no tienes acceso local, dilo y trabaja solo con el contenido que te comparta; no afirmes haber leído o guardado archivos.',
      ].join('\n\n'),
    },
    {
      id: 'research-vacancies',
      category: 'career',
      title: 'Buscar y verificar vacantes actuales',
      use: 'Úsalo cuando quieras buscar ofertas por tareas y familias de puestos. Requiere acceso del asistente a fuentes actuales.',
      skillPaths: [
        'AGENTS.md',
        'schemas/agent-format.md',
        '.agents/skills/job-search/SKILL.md',
        '.agents/skills/job-search/portals.md',
        '.agents/skills/job-fit-assessor/SKILL.md',
      ],
      text: [
        'Investiga vacantes actuales que encajen con los objetivos y preferencias que he indicado en CareerKit. Si tienes permiso y acceso local, usa private-data/profile.json y cv.json para orientar la búsqueda. No presupongas un puesto, ciudad, salario mínimo o modalidad que no haya confirmado.',
        'Busca por tareas y responsabilidades, además de por varios nombres de rol. Abre cada anuncio prometedor y comprueba que sigue publicado en la página del empleador o en una fuente fiable. Anota enlace directo, empresa, puesto, ubicación, modalidad, nivel, descripción completa, salario y si está verificado, fecha de búsqueda y fecha de comprobación. Elimina duplicados y descarta anuncios caducados.',
        'Valora cada oferta con job-fit-assessor y separa hechos, inferencias, incógnitas y carencias confirmadas. Compara requisitos con evidencias reales, no solo con el título. Para los datos del empleador, cita fuentes actuales; los comentarios de empleados son señales anecdóticas. Si una página no es accesible, marca la oferta como no verificada.',
        'Devuélveme una lista corta ordenada con las fuentes y límites de búsqueda. No presentes un resultado de búsqueda como oferta verificada. Guarda en private-data/vacancies.json únicamente las ofertas que te indique expresamente; no solicites empleo ni contactes a nadie. Si no tienes herramienta de búsqueda actual o acceso a los JSON, dilo claramente.',
      ].join('\n\n'),
    },
    {
      id: 'review-priorities',
      category: 'career',
      title: 'Añadir prioridades concretas a Inicio',
      use: 'Úsalo después de pedirme revisar el perfil o una oferta para dejar siguientes pasos visibles en Inicio.',
      skillPaths: [
        'AGENTS.md',
        'schemas/agent-format.md',
        '.agents/skills/careerkit-data-entry/SKILL.md',
        '.agents/skills/li-profile/SKILL.md',
        '.agents/skills/job-fit-assessor/SKILL.md',
      ],
      text: [
        'A partir de la revisión que te he pedido, identifica acciones concretas y verificables. Usa solo hechos confirmados de private-data/profile.json y, si corresponde, la auditoría de private-data/linkedin.json o la vacante de private-data/vacancies.json.',
        'Esta petición autoriza añadir las prioridades resultantes de la revisión a private-data/priorities.json. Incluye ID estable, título, nivel alta/media/baja, motivo, fecha solo si es conocida, sección relacionada y orden. No generes recomendaciones fuera de esta revisión. Evita duplicados; actualiza o conserva IDs existentes según corresponda.',
        'Valida el JSON y conserva propiedades desconocidas. No cambies otros módulos. Si no tienes acceso local o el archivo no es válido, dímelo y no afirmes que guardaste cambios.',
      ].join('\n\n'),
    },
    {
      id: 'cover-letter',
      category: 'career',
      title: 'Redactar una carta para una vacante',
      use: 'Úsalo cuando quieras una carta breve, específica y basada en tus hechos confirmados.',
      requiresVacancy: true,
      skillPaths: [
        'AGENTS.md',
        '.agents/skills/cover-letter-writer/SKILL.md',
        '.agents/skills/star-story-extractor/SKILL.md',
      ],
      text: [
        'Prepara una carta para esta vacante: {{vacancy}}. Usa el anuncio completo y solo hechos confirmados que te haya dado o autorizado en CareerKit. Si no tienes la oferta completa, el CV pertinente o mi motivo real para esta empresa, pregúntame antes de redactar afirmaciones sobre ello.',
        'Relaciona uno o dos requisitos de la oferta con experiencias concretas. No repitas el CV, no inventes resultados o motivaciones y evita frases genéricas. Como guía, escribe 300–400 palabras salvo que la oferta indique otra extensión. Usa el idioma de la candidatura.',
        'Devuelve el borrador en el chat para que pueda revisarlo. No lo guardes en archivos versionados, no modifiques el CV base y no envíes la carta ni la candidatura. Solo crea un archivo privado si te lo pido y apruebo su ubicación.',
      ].join('\n\n'),
    },
    {
      id: 'extract-star-story',
      category: 'interviews',
      title: 'Convertir una experiencia en historia STAR',
      use: 'Úsalo después de contar una experiencia en bruto que quieras preparar para una entrevista o conservar como evidencia.',
      skillPaths: [
        'AGENTS.md',
        'schemas/agent-format.md',
        '.agents/skills/star-story-extractor/SKILL.md',
        '.agents/skills/careerkit-data-entry/SKILL.md',
      ],
      text: [
        'Organiza la experiencia que te he contado en Situación, Tarea, Acción y Resultado. Mantén claro qué hice yo y qué hizo el equipo. No inventes alcance, cifras, fechas ni resultados; conserva exactamente los datos que proporcioné.',
        'Si falta un dato importante, haz hasta tres preguntas concretas. Si el resultado cuantitativo no está confirmado, no lo estimes. Devuelve primero la historia en el chat para que la revise.',
        'Solo si te pido guardarla, añade una evidencia con ID estable a private-data/profile.json.evidence. Usa type: star-story y los campos situation, task, actions, results y tags; marca confirmación y uso para CV según lo que haya confirmado. Valida el archivo, conserva los demás datos y no crees otro fichero. Si no tienes acceso, di que no se guardó.',
      ].join('\n\n'),
    },
    {
      id: 'match-star-stories',
      category: 'interviews',
      title: 'Elegir historias STAR para una vacante',
      use: 'Úsalo cuando quieras saber qué experiencias tuyas sirven para responder a requisitos o preguntas de una oferta.',
      requiresVacancy: true,
      skillPaths: [
        'AGENTS.md',
        '.agents/skills/star-story-extractor/SKILL.md',
        '.agents/skills/job-fit-assessor/SKILL.md',
      ],
      text: [
        'Para esta vacante: {{vacancy}}, extrae las competencias principales y compáralas con historias y evidencias que yo haya compartido o autorizado en CareerKit. Si no tienes la oferta completa o acceso al perfil local, dilo y solicita solo lo que falte.',
        'Sugiere únicamente historias que estén respaldadas por datos concretos. Para cada una, indica la competencia y una forma honesta de enfocarla en entrevista. Separa los requisitos sin evidencia como brechas; la falta de un ejemplo no demuestra que yo carezca de esa capacidad.',
        'No inventes respuestas, resultados ni historias. No modifiques el CV, la vacante ni las evidencias sin pedírtelo.',
      ].join('\n\n'),
    },
    {
      id: 'audit-linkedin',
      category: 'linkedin',
      title: 'Auditar LinkedIn con Perfil y aprendizajes',
      use: 'Úsalo cuando quieras revisar el perfil publicado y detectar cambios concretos con evidencias de CareerKit.',
      skillPaths: [
        'AGENTS.md',
        'schemas/agent-format.md',
        '.agents/skills/li-profile/SKILL.md',
        '.agents/skills/li-bilingual/SKILL.md',
        '.agents/skills/careerkit-data-entry/SKILL.md',
      ],
      text: [
        'Compara private-data/linkedin.json con datos confirmados y relevantes de private-data/profile.json, incluidos proyectos, actividades y aprendizajes. No accedas a LinkedIn. Si no tienes acceso autorizado a los JSON, pídeme la información; no inventes secciones ausentes.',
        'Revisa cada sección aportada y prioriza los problemas que tengan evidencia concreta. Señala la sección, prioridad, problema, motivo y evidencia, IDs estables relacionados, recomendación y texto propuesto solo cuando aporte valor. Marca elementos no aportados como no evaluados. Si propones texto, prepara español e inglés con el mismo sentido, salvo que te pida un idioma.',
        'Mantén las recomendaciones separadas de linkedin.json.published. Añade las notas de esta auditoría a linkedin.json.audits con estado pendiente y fecha solo si se conoce. Valida el archivo, conserva campos desconocidos y no apliques cambios al perfil publicado por tu cuenta.',
      ].join('\n\n'),
    },
    {
      id: 'audit-linkedin-posts',
      category: 'linkedin',
      title: 'Analizar resultados de publicaciones de LinkedIn',
      use: 'Úsalo si compartes textos y métricas de publicaciones y quieres encontrar patrones prudentes.',
      skillPaths: [
        '.agents/skills/li-audit/SKILL.md',
        '.agents/skills/li-plan/SKILL.md',
      ],
      text: [
        'Analiza solo publicaciones y métricas que yo haya compartido aquí. No accedas a mi cuenta ni descargues datos de LinkedIn. Antes de concluir, comprueba si las publicaciones y periodos son comparables y muestra los cálculos posibles.',
        'Compara formatos, temas, aperturas y métricas disponibles. Explica tamaño de muestra, limitaciones y otras posibles causas. Describe patrones como correlaciones, no como causas ni garantías. No inventes métricas ni atribuyas resultados a un horario o fórmula sin evidencia.',
        'Devuelve hallazgos y, si hay base suficiente, un pequeño experimento que pueda revisar. No guardes datos en CareerKit ni crees un historial de publicaciones salvo que te lo pida expresamente.',
      ].join('\n\n'),
    },
    {
      id: 'draft-linkedin-post',
      category: 'linkedin',
      title: 'Redactar una publicación de LinkedIn',
      use: 'Úsalo cuando tengas una idea o experiencia real y quieras convertirla en un borrador listo para revisar.',
      skillPaths: [
        '.agents/skills/li-post/SKILL.md',
        '.agents/skills/li-post/hooks.json',
        '.agents/skills/li-bilingual/SKILL.md',
        '.agents/skills/li-human/SKILL.md',
      ],
      text: [
        'Ayúdame a convertir la idea que te compartiré en una publicación clara y concreta. Usa solo hechos, opiniones y experiencias que yo haya confirmado; no leas otros proyectos ni inventes logros, métricas, clientes, motivaciones o una voz personal.',
        'Propón hasta tres aperturas realmente distintas si encajan, recomienda una con un motivo breve y entrega un borrador completo. Prepara español e inglés por separado con el mismo contenido, salvo que pida una sola lengua. Revísalo con li-human sin perseguir puntuaciones de autoría.',
        'No publiques, programes ni guardes un registro de publicaciones. Si la idea es demasiado vaga para sostener un texto específico, pregúntame qué ocurrió o qué evidencia puedo compartir.',
      ].join('\n\n'),
    },
    {
      id: 'draft-linkedin-carousel',
      category: 'linkedin',
      title: 'Preparar un carrusel o documento para LinkedIn',
      use: 'Úsalo cuando la idea tenga una secuencia, pasos o estructura que se entienda mejor en diapositivas.',
      skillPaths: [
        '.agents/skills/li-carousel/SKILL.md',
        '.agents/skills/li-bilingual/SKILL.md',
        '.agents/skills/li-human/SKILL.md',
      ],
      text: [
        'A partir de la idea que te comparta, prepara primero el texto diapositiva por diapositiva y el texto que acompañaría al documento. Si el contenido no justifica varias diapositivas, sugiere un formato de publicación más sencillo.',
        'Usa únicamente hechos y ejemplos que te dé. Prepara versiones separadas en español e inglés con el mismo sentido. No prometas alcance ni rendimiento por usar un carrusel. Muéstrame el texto y espera mi aprobación antes de maquetar un PDF local.',
        'No cargues archivos a LinkedIn ni a servicios externos. Usa recursos locales y no añadas datos privados o identificadores públicos sin mi autorización.',
      ].join('\n\n'),
    },
    {
      id: 'draft-linkedin-comment',
      category: 'linkedin',
      title: 'Redactar un comentario útil para una publicación',
      use: 'Úsalo cuando compartas una publicación ajena y quieras aportar una idea concreta sin sonar genérico.',
      skillPaths: [
        '.agents/skills/li-comment/SKILL.md',
        '.agents/skills/li-bilingual/SKILL.md',
        '.agents/skills/li-human/SKILL.md',
      ],
      text: [
        'Lee la publicación que te proporcionaré y redacta dos opciones breves con enfoques distintos. Cada opción debe añadir una observación, pregunta o experiencia que yo haya confirmado; no repitas el post ni finjas estar de acuerdo.',
        'Prepara español e inglés por separado y recomienda publicar solo en el idioma de la conversación original. Si el post no está incluido o no tienes acceso a su texto, pídemelo. No inventes una experiencia personal ni busques la publicación por tu cuenta.',
        'Revisa la naturalidad con li-human. No publiques, no accedas a LinkedIn y no registres actividad.',
      ].join('\n\n'),
    },
    {
      id: 'write-linkedin-dm',
      category: 'linkedin',
      title: 'Escribir una nota de conexión o mensaje',
      use: 'Úsalo cuando tengas una persona concreta y un motivo real para contactar manualmente.',
      skillPaths: [
        '.agents/skills/li-dm/SKILL.md',
        '.agents/skills/li-bilingual/SKILL.md',
        '.agents/skills/li-human/SKILL.md',
      ],
      text: [
        'Antes de redactar, pídeme en un solo mensaje quién es la persona, qué referencia concreta motiva el contacto y qué busco. No inventes contactos en común, relaciones, motivos ni conversaciones previas.',
        'Prepara una nota de conexión y, si tiene sentido, un primer mensaje y seguimiento opcional. Escribe español e inglés por separado y recomienda enviar solo el idioma de la conversación. Verifica la longitud con una fuente oficial actual si mencionas un límite de caracteres.',
        'Revisa el texto con li-human. No accedas a la bandeja, no envíes invitaciones ni mensajes y no automatices seguimientos. Si no hay un motivo auténtico para escribir, dilo.',
      ].join('\n\n'),
    },
    {
      id: 'polish-linkedin-copy',
      category: 'linkedin',
      title: 'Pulir un borrador de LinkedIn',
      use: 'Úsalo para mejorar claridad y formato sin cambiar el sentido ni la voz del borrador que compartas.',
      skillPaths: [
        '.agents/skills/li-human/SKILL.md',
        '.agents/skills/li-bilingual/SKILL.md',
      ],
      text: [
        'Revisa el borrador que te proporcionaré. Corrige problemas de claridad, formato y frases confusas, pero conserva el significado, los hechos y mi voz. Explica brevemente los cambios importantes y señala cualquier afirmación que necesite confirmación.',
        'No optimices el texto para puntuaciones de autoría ni presentes heurísticas locales como detectores o predicciones. Prepara ambos idiomas solo si te lo pido o si el texto está destinado a publicarse en dos idiomas.',
        'No cambies ni guardes el contenido publicado en linkedin.json; este trabajo es un borrador. No publiques ni envíes el texto.',
      ].join('\n\n'),
    },
    {
      id: 'triage-linkedin-inbox',
      category: 'linkedin',
      title: 'Clasificar mensajes que yo comparta',
      use: 'Úsalo cuando pegues mensajes y quieras decidir cuáles merecen respuesta y preparar borradores.',
      skillPaths: [
        '.agents/skills/li-inbox/SKILL.md',
        '.agents/skills/li-bilingual/SKILL.md',
        '.agents/skills/li-human/SKILL.md',
      ],
      text: [
        'Clasifica únicamente los mensajes que te pegaré en esta conversación. No abras LinkedIn, no leas mi bandeja y no sigas enlaces para recuperar mensajes privados.',
        'Agrúpalos por oportunidad, recruiter, colega, petición o spam; indica por qué y marca como dudosos los casos con poca evidencia. Prepara respuestas solo donde aporten valor. Usa el idioma de cada conversación y da versiones separadas en español e inglés cuando tenga sentido.',
        'Revisa las respuestas con li-human. No envíes mensajes, no archives conversaciones, no registres contactos y no compartas información privada en respuestas públicas.',
      ].join('\n\n'),
    },
    {
      id: 'plan-linkedin',
      category: 'linkedin',
      title: 'Crear un plan de publicaciones y networking',
      use: 'Úsalo cuando pidas ideas o una planificación basada en objetivos, tiempo disponible y experiencias reales.',
      skillPaths: [
        '.agents/skills/li-plan/SKILL.md',
        '.agents/skills/li-bilingual/SKILL.md',
        '.agents/skills/li-post/SKILL.md',
        '.agents/skills/li-audit/SKILL.md',
      ],
      text: [
        'Crea un plan para el periodo que te indique, usando mis objetivos, disponibilidad, temas y preferencias expresas. Si faltan datos que cambian el plan, pregúntame; no supongas una frecuencia ni un horario.',
        'Propón temas basados en experiencias, ideas o aprendizajes que yo haya confirmado. Investiga personas o empresas solo si te lo pido y usa información pública actual. Trata cualquier recomendación de horario como incierta, no como garantía de alcance.',
        'Distingue sugerencias de borradores listos para revisar. No crees un registro externo, no programes ni publiques contenido y no contactes a nadie.',
      ].join('\n\n'),
    },
    {
      id: 'reply-linkedin-comments',
      category: 'linkedin',
      title: 'Preparar respuestas a comentarios',
      use: 'Úsalo cuando compartas comentarios recibidos en una publicación y quieras responder con criterio.',
      skillPaths: [
        '.agents/skills/li-reply/SKILL.md',
        '.agents/skills/li-bilingual/SKILL.md',
        '.agents/skills/li-human/SKILL.md',
      ],
      text: [
        'Trabaja solo con los comentarios que pegaré aquí. Agrúpalos por tipo y relevancia, y redacta una respuesta breve únicamente si aporta algo. Responde la pregunta real; no lleves una respuesta pública a un mensaje privado sin motivo.',
        'Prepara opciones en español e inglés y recomienda usar el idioma de la conversación original. Ante una crítica, reconoce lo válido y explica mi postura sin escalar. Si hay spam o una petición dudosa, explica por qué no conviene responder.',
        'No inventes datos, no accedas a LinkedIn, no publiques y no envíes las respuestas. Yo decido cuáles utilizar.',
      ].join('\n\n'),
    },
    {
      id: 'repurpose-linkedin-source',
      category: 'linkedin',
      title: 'Sacar ideas de un texto, vídeo o podcast',
      use: 'Úsalo cuando compartas un artículo, transcripción, vídeo, podcast u otro material largo.',
      skillPaths: [
        '.agents/skills/li-repurpose/SKILL.md',
        '.agents/skills/li-post/SKILL.md',
        '.agents/skills/li-post/hooks.json',
        '.agents/skills/li-bilingual/SKILL.md',
        '.agents/skills/li-human/SKILL.md',
      ],
      text: [
        'Lee el material completo que te proporcionaré y enumera ideas independientes que realmente sostenga: afirmaciones, cifras, historias, mecanismos, errores o frases destacables. Si solo hay una idea útil, dilo en lugar de forzar más publicaciones.',
        'Propón ángulos breves para LinkedIn y pregunta cuál quiero desarrollar. Al redactar, usa li-post y li-human; presenta español e inglés por separado. No atribuyas al usuario experiencias o métricas que pertenezcan al material de otra persona.',
        'No extraigas mensajes privados, no publiques, no programes contenido y no inventes estadísticas o citas.',
      ].join('\n\n'),
    },
    {
      id: 'bilingual-linkedin-copy',
      category: 'linkedin',
      title: 'Preparar dos versiones: español e inglés',
      use: 'Úsalo cuando quieras la misma pieza de LinkedIn en ambos idiomas, conservando contenido y sentido.',
      skillPaths: ['.agents/skills/li-bilingual/SKILL.md'],
      text: [
        'Prepara dos versiones completas e independientes del texto que te daré: una en español y otra en inglés. Conserva hechos, ideas, estructura, énfasis y llamada a la acción. Ajusta únicamente lo necesario para que cada idioma suene natural.',
        'No añadas ni elimines experiencia, logros, credenciales o afirmaciones en una versión. Si hay un dato ambiguo, pregúntame antes de traducirlo. Si solicito un solo idioma, sigue esa indicación.',
        'No mezcles ambas lenguas en una sola publicación ni cambies automáticamente la copia publicada de LinkedIn.',
      ].join('\n\n'),
    },
  ],
}

export function buildPromptText(
  prompt,
  {
    body = prompt.text,
    vacancyReference = PROMPT_INBOX_ES.vacancyPromptPlaceholder,
  } = {},
) {
  const resolvedBody = body.replace(
    '{{vacancy}}',
    vacancyReference || PROMPT_INBOX_ES.vacancyPromptPlaceholder,
  )
  return [
    PROMPT_INBOX_ES.skillInstruction,
    ...prompt.skillPaths.map((path) => `- ${path}`),
    '',
    resolvedBody,
  ].join('\n')
}
