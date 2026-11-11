import { PROMPT_INBOX_ES } from './prompt-inbox.es.js'

export const NAV = [
  ['home', 'Inicio', '⌂'],
  ['profile', 'Perfil y aprendizajes', '◈'],
  ['linkedin', 'LinkedIn', '↗'],
  ['linkedin-content', 'Contenido de LinkedIn', '✳'],
  ['cv', 'CV', '▤'],
  ['vacancies', 'Vacantes', '◎'],
  ['prompts', 'Buzón', '▣'],
]

export const STRINGS = {
  brand: 'CareerKit',
  subtitle: 'Tu espacio profesional',
  connect: 'Conectar carpeta de datos',
  changeFolder: 'Cambiar carpeta de datos',
  workspaceGate: {
    priority: 'ALTA PRIORIDAD · PRIMER PASO',
    eyebrow: 'TUS ARCHIVOS SE QUEDAN EN TU DISPOSITIVO',
    title: 'Crea o conecta tu carpeta privada',
    body: 'CareerKit necesita una carpeta local para mostrar y guardar información. Crea private-data/ en la raíz de este proyecto con los JSON vacíos de templates/, o conecta la carpeta si ya la tienes. Al conectar, la web solicitará permiso para leer y guardar. También puedes pedirle a tu asistente local que prepare la carpeta; solo podrá editar esos archivos si tiene acceso local al proyecto.',
    checkingTitle: 'Buscando tu carpeta guardada',
    checkingBody:
      'Comprobando si este navegador ya recuerda la carpeta que conectaste anteriormente.',
    rememberedTitle: 'CareerKit recuerda tu carpeta',
    rememberedBody:
      'La carpeta ya está seleccionada. El navegador necesita permiso para volver a leer y guardar sus archivos; no tendrás que buscarla otra vez.',
    storageErrorTitle: 'Vuelve a conectar tu carpeta',
    storageErrorBody:
      'No se pudo recuperar el acceso guardado en este navegador. Tus archivos no se han modificado; puedes volver a elegir la carpeta.',
    connecting: 'Conectando carpeta…',
    previewOnly: 'Solo vista previa',
    checking: 'Buscando carpeta…',
    connectLocal: 'Conectar la carpeta de este proyecto',
    localMissing:
      'No encontramos private-data en este proyecto. Abre el prompt de preparación, pásaselo a tu asistente local y vuelve a pulsar este botón.',
    wrongFolder:
      'Se ha seleccionado «{name}», pero CareerKit necesita la carpeta llamada private-data. Si elegiste la raíz del proyecto, vuelve a seleccionar private-data dentro de ella.',
    pickerHelp:
      'En la ventana del sistema, selecciona la carpeta llamada private-data y confirma con «Seleccionar carpeta». Al conectarla, CareerKit seguirá adelante aunque los JSON estén vacíos.',
    connectCancelled:
      'La carpeta no se conectó. Vuelve a elegir private-data y confirma la selección en la ventana del sistema, o abre los JSON en modo manual.',
    connectUnexpected:
      'No se pudo completar la conexión. No se han modificado tus archivos; vuelve a seleccionar la carpeta private-data.',
    openFiles: 'Abrir JSON de private-data',
    grantPermission: 'Dar permiso a carpeta guardada',
    chooseAnother: 'Elegir otra carpeta',
    permissionNotice:
      'El navegador todavía no ha concedido permiso. Vuelve a intentarlo o elige la carpeta de nuevo.',
    persistenceNotice:
      'La carpeta está conectada durante esta sesión, pero el navegador no pudo recordar la selección. Puede que tengas que elegirla la próxima vez.',
    disconnectPersistenceNotice:
      'La carpeta se desconectó, pero el navegador no pudo borrar su selección guardada.',
    restoredNotice: 'Carpeta recuperada. Tus datos ya están disponibles.',
    showPrompt: 'Ver prompt de preparación',
    hidePrompt: 'Ocultar prompt',
    promptLabel: 'Prompt para tu asistente local',
    copyPrompt: 'Copiar prompt',
    copied: 'Prompt copiado. Pégalo en tu asistente local.',
    copyFailed: 'No se pudo copiar. Selecciona el texto y cópialo.',
    browserUnsupported:
      'Este navegador no completó la conexión directa. Puedes probar con otro navegador o abrir los JSON de private-data en modo manual.',
    privacy:
      'Cuando el navegador lo permite, recuerda la selección. Tus JSON siguen en tu carpeta y no se envían a servidores.',
  },
  fallbackFiles: {
    eyebrow: 'ACCESO MANUAL A TUS ARCHIVOS',
    title: 'Abre los JSON de private-data',
    body: 'Si este navegador no completa la selección de carpeta, puedes abrir aquí los archivos directamente. CareerKit valida cada módulo por separado y mantiene los datos solo en esta sesión del navegador.',
    files:
      'Selecciona uno o varios de estos archivos: profile.json, linkedin.json, linkedin-content.json, cv.json, vacancies.json y priorities.json.',
    choose: 'Seleccionar archivos JSON',
    opening: 'Abriendo archivos…',
    noRecognized:
      'No se encontró ningún JSON de CareerKit. Selecciona archivos con los nombres indicados y vuelve a intentarlo.',
    openError:
      'No se pudieron leer los archivos seleccionados. Revisa que sean JSON válidos y vuelve a elegirlos.',
    connected: 'Archivos abiertos en modo manual.',
    connectedWithIssues:
      'Se abrieron los módulos válidos. Revisa los que aparecen marcados en Inicio antes de usarlos.',
    limitTitle: 'El guardado será manual',
    limitBody:
      'Al guardar un formulario se descargará el JSON actualizado. Sustitúyelo en private-data. La página no escribe en los archivos originales, no detecta cambios externos y olvidará los datos al cerrarse o recargarse. Nada se envía a servidores.',
    bannerTitle: 'Archivos abiertos · guardado manual',
    bannerBody:
      'Los cambios de los formularios no se guardan en los archivos originales. Descarga cada JSON actualizado y sustitúyelo en private-data antes de cerrar esta página.',
    chooseAgain: 'Abrir o corregir JSON',
    tryDirect: 'Conectar carpeta directamente',
    savePrepared:
      'Cambios preparados. Usa «Guardar JSON individual» para descargar este módulo y sustituirlo en private-data.',
    saved:
      'JSON descargado. Sustitúyelo en private-data para guardar el cambio.',
    manualStatus: 'JSON abiertos · guardado manual',
    manualSideNote:
      'Modo manual: vuelve a abrir los JSON al iniciar otra sesión y sustituye cada archivo descargado en private-data.',
    closeManual: 'Cerrar archivos abiertos',
    closeManualTitle: 'Cerrar archivos abiertos',
    closeKeep: 'Cerrar sin borrar datos de sesión',
    closeClear: 'Cerrar y borrar datos de sesión',
    closeManualBody:
      'CareerKit dejará de mostrar estos JSON. Puedes cerrar la vista o borrar también los datos que siguen en esta sesión del navegador.',
  },
  disconnect: 'Desconectar carpeta',
  disconnected: 'Datos desconectados',
  connected: 'Carpeta conectada',
  saveStatus: {
    saving: 'Guardando {file}…',
    draftPending:
      'Hay cambios nuevos sin guardar en {file}. El guardado anterior terminó; guarda otra vez para conservarlos.',
    saved: '{file} guardado · {time}',
    manualSaved:
      '{file} descargado. Sustitúyelo en private-data para guardar el cambio.',
    pendingManual:
      '{file} preparado. Descárgalo y sustitúyelo en private-data.',
    state: '{file} · {state}',
    externalState: '{file} · Cambió fuera de la web',
    conflictState: '{file} · Cambió antes de guardar',
    changedExternally:
      '{file} cambió fuera de CareerKit. El guardado está bloqueado para protegerlo. Puedes cargar la versión actual y continuar desde ella; el formulario mostrará ese archivo.',
    conflict:
      'El archivo cambió antes de guardar. No se guardó este intento y tu edición sigue visible. Si cargas la versión actual, el formulario la mostrará y podrás volver a aplicar lo que quieras conservar.',
    reloadExternal: 'Cargar versión actual',
  },
  dataConnection: {
    bannerEyebrow: 'TUS ARCHIVOS LOCALES',
    bannerTitle: 'Conecta tu carpeta para ver y guardar tus datos',
    bannerBody:
      'Sin una carpeta conectada, la app no puede leer tus archivos ni guardar en ellos. Conecta la carpeta local para cargar tus datos y conservar allí los cambios que confirmes.',
    bannerFallback:
      'Este navegador no conecta carpetas directamente. Puedes abrir y guardar los JSON de uno en uno desde cada sección.',
    promptsButton: 'Ver prompt de preparación',
    missingTitle: 'Aún faltan archivos de datos',
    emptyFolderTitle: 'La carpeta seleccionada está vacía',
    missingBody:
      'Prepara los JSON que faltan con el formato de las plantillas vacías. Después podrás completar los formularios en la app y guardar ahí tus datos.',
    emptyTitle:
      'La carpeta está conectada, pero aún no has rellenado los datos',
    emptyBody:
      'Los archivos tienen el formato correcto. Completa los formularios —por ejemplo, Perfil y aprendizajes— y guarda cada sección para que tus datos aparezcan aquí.',
    invalidTitle: 'Hay archivos que necesitan una revisión',
    invalidBody:
      'No pudimos interpretar estos archivos con seguridad. Se han dejado intactos. Compara cada uno con su plantilla antes de volver a cargarlo.',
    missingLabel: 'Archivos que faltan',
    invalidLabel: 'Archivos para revisar',
    templateHint: 'Plantilla de referencia:',
    prepareButton: 'Crear solo los archivos que faltan',
    preparing: 'Preparando plantillas vacías…',
    prepared: 'Plantillas listas. Ahora puedes completar tus datos en la app.',
    connectedReady: 'Carpeta conectada. Ya puedes completar tus secciones.',
    reconnectedReady:
      'Permiso renovado. La carpeta conectada se recordará en este navegador.',
    folderRemembered:
      'La selección se recuerda en este navegador. Si el permiso caduca, solo tendrás que renovarlo.',
    folderNotRemembered:
      'La web pide permiso al conectar y puede recordar la carpeta en este navegador.',
    folderRememberFailed:
      'El navegador no pudo recordar esta selección. Puede que tengas que conectarla otra vez al volver.',
    disconnectedNotice: 'Carpeta desconectada.',
    disconnectedClearedNotice:
      'Carpeta desconectada y datos de sesión borrados.',
    loadedSuccessfully: 'Datos cargados correctamente.',
    prepareError:
      'No se pudieron preparar todos los archivos. Revisa los permisos de lectura y escritura y vuelve a comprobar la carpeta.',
    recheckButton: 'Volver a comprobar',
    recheckError:
      'No se pudo volver a leer la carpeta. Comprueba el permiso y selecciona de nuevo la carpeta.',
    startProfile: 'Empezar por Perfil',
    openPrompts: 'Abrir buzón de prompts',
    close: 'Cerrar',
    copyInstructions: 'Copiar prompt para reparar los archivos',
    copied: 'Instrucciones copiadas. Pégalas en tu asistente local.',
    copyFailed: 'No se pudieron copiar. Selecciona el texto y cópialo.',
    assistantPromptLabel: 'Instrucciones para tu asistente local',
    connectFailed:
      'No se pudo conectar la carpeta. Vuelve a seleccionarla y concede permiso para leer y guardar sus archivos.',
    prompt:
      'En la carpeta local private-data de este proyecto, prepara solo los archivos ausentes indicados. Usa como base las plantillas vacías correspondientes de templates/. No sobrescribas ningún archivo existente ni elimines campos desconocidos. Para cualquier archivo que no sea JSON válido o no coincida con su plantilla, no lo reemplaces: compara su estructura con schemas/ y templates/, conserva una copia privada del original y propone una reparación que mantenga los datos y campos desconocidos. Pide mi confirmación antes de aplicar una reparación a un archivo existente. Después de validar los archivos, indícame que pulse «Volver a comprobar» en CareerKit. Guarda datos personales únicamente en private-data/ y no los incluyas en archivos versionados, capturas ni en la publicación de GitHub. Si no tienes acceso local a la carpeta, pídeme que abra el proyecto y no afirmes que has guardado nada.',
  },
  noData: 'Sin registrar',
  save: 'Guardar cambios',
  add: 'Añadir elemento',
  confirm: 'Confirmar',
  cancel: 'Cancelar',
  empty: 'Aún no hay datos en esta sección.',
  profileEntry: {
    addStarStory: 'Añadir historia STAR',
    starStory: 'Historia STAR para entrevistas',
    situation: 'Situación',
    task: 'Tarea y responsabilidad propia',
    tags: 'Habilidades demostradas (separadas por comas)',
  },
  profilePage: {
    eyebrow: 'MAPA PERSONAL Y PROFESIONAL',
    title: 'Perfil y aprendizajes',
    subtitle:
      'Tu espacio para explicar cómo eres, qué buscas y qué quieres aportar. No es una copia de LinkedIn.',
    internalBadge: 'Contexto interno',
    evidenceBadge: 'Trayectoria y evidencias',
    emptyBlock: 'Aún sin datos',
    fieldSingular: 'campo con contenido',
    fieldPlural: 'campos con contenido',
    itemSingular: 'elemento guardado',
    itemPlural: 'elementos guardados',
    personalTitle: 'Quién eres y cómo trabajas',
    personalDescription:
      'Ayuda al agente a entender tu forma de pensar y trabajar. Es contexto interno.',
    careerTitle: 'Qué trabajo buscamos',
    careerDescription:
      'Ayuda a priorizar vacantes por roles, tareas y condiciones que indiques; el agente no supone lo que falte.',
    contentTitle: 'Intereses y voz para publicaciones',
    contentDescription:
      'Orienta temas, voces y empresas que quieres seguir. El agente comprueba las afiliaciones; tus preferencias son privadas y no se publican sin tu aprobación.',
    journeyTitle: 'Trayectoria y evidencias',
    journeyDescription:
      'Conserva hechos y aprendizajes. Tus marcas indican qué está confirmado y si se utiliza en el CV o aparece en LinkedIn.',
    professionalSummary: 'Resumen profesional',
    professionalSummaryHint:
      'Una presentación breve de tu trayectoria y dirección profesional; puede diferir de tu titular y Acerca de en LinkedIn.',
    aboutMe: 'Sobre ti, en tus palabras',
    aboutMeHint:
      'Qué te interesa, qué te mueve o qué te gustaría que el asistente entendiera de ti.',
    values: 'Valores importantes',
    interests: 'Intereses y curiosidades',
    interestsHint:
      'Temas y actividades que disfrutas seguir; pueden orientar ideas y búsquedas como contexto privado.',
    motivations: 'Qué te motiva',
    thinkingStyle: 'Cómo piensas y resuelves problemas',
    learningStyle: 'Cómo aprendes mejor',
    workStyle: 'Cómo te gusta trabajar y colaborar',
    strengths: 'Fortalezas que reconoces',
    growthAreas: 'Dificultades o aspectos que quieres desarrollar',
    growthAreasHint:
      'Puedes describir qué te cuesta y qué estás practicando, sin convertirlo en una etiqueta fija.',
    preferredEnvironment: 'Entorno de trabajo donde rindes mejor',
    boundaries: 'Límites o condiciones importantes para ti',
    roleFamilies: 'Familias de puestos que te interesan',
    tasks: 'Tareas que quieres hacer',
    industries: 'Sectores o temas que te atraen',
    workModes: 'Modalidades que prefieres',
    location: 'Ubicaciones o zonas posibles',
    conditions: 'Condiciones importantes',
    avoid: 'Puestos, tareas o condiciones que prefieres evitar',
    objectivesTitle: 'Objetivos profesionales',
    objectivesDescription: 'Metas a corto, medio y largo plazo.',
    shortTerm: 'Corto plazo',
    mediumTerm: 'Medio plazo',
    longTerm: 'Largo plazo',
    themes: 'Temas sobre los que te interesa hablar',
    themesHint:
      'Añade temas concretos que el agente pueda buscar. No supondrá intereses que no hayas indicado.',
    viewpoints: 'Ideas, preguntas u opiniones que quieres explorar',
    preferredVoices: 'Voces o perfiles profesionales que quieres leer',
    preferredVoicesHint:
      'Describe los perfiles, experiencia o perspectivas que valoras. El agente no usará solo la popularidad ni asumirá afiliaciones sin comprobarlas.',
    preferredOrganizations: 'Empresas u organizaciones que quieres seguir',
    preferredOrganizationsHint:
      'El agente las priorizará como fuentes y comprobará la relación actual de cada autor cuando sea posible.',
    tone: 'Tono que te representa',
    languages: 'Idiomas en los que quieres publicar',
    versionPreference: 'Preferencia para preparar versiones',
    contentAvoid: 'Temas o enfoques que prefieres evitar',
    collectionLabels: {
      experience: 'Experiencia',
      education: 'Formación',
      skills: 'Habilidades',
      certifications: 'Certificaciones',
      languages: 'Idiomas',
      projects: 'Proyectos',
      evidence: 'Otras evidencias',
      learnings: 'Aprendizajes',
    },
    itemLabel: 'Elemento',
    deleteItem: 'Eliminar elemento',
    confirmRemoveEvidence:
      '¿Quitar «{title}» de este borrador? El cambio solo llegará a profile.json cuando lo guardes.',
    noItems: 'Aún no hay elementos. Añade uno cuando quieras.',
    titleLabel: 'Título',
    nameLabel: 'Nombre',
    organizationLabel: 'Organización o contexto',
    datesLabel: 'Fechas',
    actionsLabel: 'Acciones',
    resultsLabel: 'Resultados demostrables',
    type: 'Tipo o categoría',
    description: 'Descripción',
    status: 'Estado',
    proficiency: 'Nivel o dominio',
    grade: 'Calificación',
    tags: 'Etiquetas',
    cvEvidenceLabel: 'Evidencia para el CV',
    linkedInLabel: 'Aparece en LinkedIn',
    internalLabel: 'Información interna',
    confirmedLabel: 'Confirmado',
    legendTitle: 'Estado de la información',
    confirmedState: 'Confirmado',
    pendingState: 'Pendiente de confirmar',
    evidenceRelationHint:
      'Cada elemento de trayectoria puede relacionarse con vacantes, CV o LinkedIn.',
    saveHint:
      'Puedes completar estos bloques poco a poco. Los cambios se guardan en profile.json cuando pulses el botón.',
    save: 'Guardar perfil',
    sideTitle: 'Tu Perfil no es tu página pública',
    sideBody:
      'Aquí puedes guardar matices, intereses y objetivos para que el asistente te conozca mejor. LinkedIn conserva por separado y literalmente lo que tú publicas.',
  },
  homePage: {
    eyebrow: 'TU ESPACIO PROFESIONAL',
    title: 'Inicio',
    subtitle: 'Una vista clara de lo que estás construyendo.',
    activityEyebrow: 'A TENER EN CUENTA',
    activityTitle: 'Tu actividad',
    registeredDates: 'Fechas registradas',
    linkedinAudit: 'LinkedIn · última auditoría',
    updatedLabel: 'Actualizado',
    openLinkedin: 'Abrir LinkedIn',
    vacanciesEyebrow: 'ORDEN DE PREFERENCIA',
    viewAll: 'Ver todas',
    vacanciesEmpty:
      'Cuando empieces a buscar, guarda aquí las ofertas que quieras comparar. No hace falta rellenar esta sección ahora.',
    vacanciesAction: 'Ver Vacantes',
    roleFallback: 'Puesto sin título',
    companyFallback: 'Empresa sin registrar',
    locationFallback: 'Ubicación sin registrar',
    modalityFallback: 'Sin modalidad',
    prioritiesEyebrow: 'SIGUIENTES PASOS',
    priorityTitleFallback: 'Prioridad sin título',
    priorityReasonFallback: 'Sin motivo registrado',
    noPrioritiesTitle: 'Sin prioridades todavía',
    noPrioritiesBody:
      'Un agente puede añadir aquí prioridades cuando le pidas revisar tu perfil o una oferta.',
  },
  homeProgress: {
    eyebrow: 'GUÍA DE PROGRESO',
    title: 'Prepara tu base profesional paso a paso',
    subtitle:
      'Perfil y LinkedIn son el punto de partida. El CV viene después; las vacantes pueden esperar hasta que empieces a buscar.',
    connected: 'Carpeta local conectada',
    disconnected: 'Carpeta sin conectar',
    localStorageNote: 'Los cambios se guardan en tus archivos locales.',
    manualConnected: 'Archivos abiertos en modo manual',
    manualStorageNote:
      'Descarga cada JSON actualizado y sustitúyelo en private-data.',
    manualConnected: 'Archivos abiertos en modo manual',
    manualStorageNote:
      'Descarga cada JSON actualizado y sustitúyelo en private-data.',
    connectNote: 'Conecta la carpeta para consultar y guardar tus datos.',
    progressLabel: 'Módulos con contenido',
    progressCount: '{count} de {total} módulos con contenido',
    progressComplete: 'Perfil, LinkedIn y CV tienen contenido',
    progressNeedsReview: 'Hay un archivo que revisar',
    nextLabel: 'TU SIGUIENTE PASO',
    priorityLabel: 'PRIORIDAD ALTA · PRIMEROS PASOS',
    nextReviewTitle: 'Hay un archivo que necesita atención',
    nextReviewBody:
      'CareerKit lo ha dejado intacto. Abre el módulo indicado para revisar qué ocurre.',
    reviewActions: {
      profile: 'Revisar Perfil',
      linkedin: 'Revisar LinkedIn',
      cv: 'Revisar CV',
    },
    nextCheckingTitle: 'Comprobando tus archivos',
    nextCheckingBody:
      'En cuanto termine la lectura, verás aquí qué módulo conviene completar.',
    checkingAction: 'Abrir sección',
    nextProfileTitle: 'Empieza por Perfil y aprendizajes',
    nextProfileBody:
      'Añade tus objetivos, preferencias y evidencias. Este dossier puede guardar también lo que no publicas en LinkedIn.',
    profileAction: 'Completar Perfil',
    nextLinkedinTitle: 'Añade la copia de tu LinkedIn',
    nextLinkedinBody:
      'Puedes transcribirla en el formulario o pedir al agente que la organice desde un archivo legible.',
    linkedinAction: 'Añadir copia de LinkedIn',
    nextPromptTitle: 'Perfil o LinkedIn ha cambiado',
    nextPromptBody:
      'Usa el prompt pendiente para revisar y actualizar las dos bases del CV.',
    promptAction: 'Abrir prompt en el Buzón',
    nextCvTitle: 'Prepara las dos bases del CV',
    nextCvBody:
      'Perfil y LinkedIn ya tienen contenido. En CV encontrarás el prompt para preparar las versiones española e inglesa.',
    cvAction: 'Ver preparación del CV',
    noUrgentLabel: 'SIN PASOS OBLIGATORIOS',
    allReadyTitle: 'Tu base profesional tiene contenido',
    allReadyBody:
      'Por ahora no hace falta completar nada más. Cuando empieces a buscar, puedes guardar vacantes para compararlas.',
    status: {
      ready: 'Con contenido',
      empty: 'Por completar',
      priority: 'Prioridad alta',
      waiting: 'Después',
      review: 'Revisar archivo',
      checking: 'Comprobando',
      update: 'Actualizar CV',
    },
    steps: {
      profile: {
        title: 'Perfil y aprendizajes',
        ready: 'Tu dossier y tus evidencias tienen contenido.',
        empty: 'Cuéntale al agente qué buscas y qué quieres conservar.',
        waiting: 'Añade objetivos, preferencias y evidencias cuando quieras.',
        review: 'Comprueba el archivo de Perfil antes de seguir.',
        checking: 'Leyendo el archivo de Perfil.',
      },
      linkedin: {
        title: 'LinkedIn',
        ready: 'La copia publicada está guardada por separado.',
        empty: 'Registra fielmente lo que aparece en tu perfil publicado.',
        waiting: 'Añade la copia publicada cuando la tengas a mano.',
        review: 'Comprueba el archivo de LinkedIn antes de seguir.',
        checking: 'Leyendo el archivo de LinkedIn.',
      },
      cv: {
        title: 'CV base',
        ready: 'Las versiones española e inglesa tienen contenido.',
        empty:
          'El agente puede preparar las dos versiones desde el prompt de CV.',
        waiting: 'Se prepara después de Perfil y LinkedIn.',
        review: 'Comprueba el archivo del CV antes de seguir.',
        checking: 'Leyendo el archivo del CV.',
        update: 'Hay un prompt pendiente para poner al día las dos versiones.',
      },
    },
    optionalLabel: 'A TU RITMO',
    optionalVacancies:
      'Vacantes es opcional. Puedes dejar esta sección vacía hasta que empieces a buscar.',
    optionalAction: 'Ver Vacantes',
  },
  priorities: 'Prioridades',
  featured: 'Vacantes destacadas',
  cvDates: 'CV',
  cvEditor: {
    title: 'CV base',
    subtitle:
      'Una base general en español y otra en inglés, construidas a partir de Perfil y LinkedIn.',
    versionGroup: 'Versión del CV',
    spanishTab: 'Español · dos columnas',
    englishTab: 'Inglés · una columna',
    spanishShort: 'Español',
    englishShort: 'Inglés',
    legacyShort: 'Versión anterior · idioma pendiente',
    spanishGuideTitle: 'Formato español · dos columnas',
    spanishGuide:
      'Columna lateral para fotografía aportada por ti (opcional), contacto, hard skills priorizadas e idiomas. Columna principal para nombre, subtítulo adaptado a la empresa, introducción breve, experiencia, proyectos claramente separados y formación de la más específica a la más general.',
    englishGuideTitle: 'Formato inglés · una columna',
    englishGuide:
      'Usa una sola columna y redacta el contenido en inglés: nombre, subtítulo adaptado al puesto, perfil de 3–6 líneas, contacto en una línea, experiencia profesional, proyectos seleccionados, experiencia académica, hard skills priorizadas e idiomas.',
    baseTitle: 'Base de los dos CV',
    baseGuidance:
      'El agente local prepara y actualiza estos textos cuando se lo pidas, usando la información confirmada de Perfil y los hechos de la copia publicada en LinkedIn. La app no sincroniza ni genera el contenido.',
    baseHint:
      'Si hay diferencias entre módulos, acláralas antes de adaptar una oferta.',
    lastUpdated: 'Última actualización',
    lastReviewed: 'Última revisión',
    openCV: 'Abrir CV',
    homeReview: 'Revisión',
    homeUpdated: 'Actualización',
    legacyTitle: 'CV anterior pendiente de asignar',
    noLegacyText: 'Sin texto anterior',
    tipTitle: 'Dos versiones, una trayectoria',
    tipBody:
      'Actualiza Perfil y la copia de LinkedIn. Cuando quieras revisar la base, pide al agente local que prepare ambas versiones a partir de esos datos confirmados.',
    photoNote:
      'La app guarda texto, no fotografías. Añade una foto al documento final solo si tú la proporcionas y la quieres incluir.',
    legacyReadOnly:
      'Se conserva el texto original sin asignarle idioma. Pide al agente local que lo revise y lo incorpore solo cuando confirmes a qué versión pertenece.',
    noBase:
      'Sin base registrada. Actualiza Perfil y LinkedIn y pide al agente local que prepare esta versión.',
    noManualEdit: 'Vista de consulta · actualización mediante agente local',
    fallbackReadOnly:
      'La base del CV se muestra para consulta. Pide al agente local que la actualice a partir de Perfil y LinkedIn; este modo no permite guardar cambios del CV.',
    fallbackTitle: 'Consultar el JSON del CV',
    fallbackLimitNote:
      'Este modo no sincroniza el archivo con la página. Después de que el agente local actualice el CV, vuelve a conectar la carpeta o abre de nuevo el JSON.',
    emptyEyebrow: 'PRIMEROS PASOS DEL CV',
    emptyTitle: 'Las dos versiones aún no están preparadas',
    emptyBodyWithoutSources:
      'Completa primero la información confirmada de Perfil y la copia publicada de LinkedIn. Después copia este prompt para que tu asistente prepare la base general en español y en inglés. El prompt también le indica que espere si todavía faltan datos.',
    emptyBodyWithSources:
      'Perfil y LinkedIn ya contienen información. Copia el prompt para que tu asistente prepare las dos bases generales. La aplicación no genera el CV automáticamente.',
    morePrompts: 'Ver más prompts en el Buzón',
  },
  vacancyPage: {
    openOffer: 'Abrir oferta',
    noLink: 'Enlace sin registrar',
    viewDetails: 'Ver detalles',
    closeDetails: 'Cerrar detalles',
    editOffer: 'Editar vacante',
    removeOffer: 'Eliminar vacante',
    saveOffers: 'Guardar vacantes',
    selectForCv: 'Vacante para adaptar el CV',
    chooseOffer: 'Elige una oferta guardada',
    noOffersForCv: 'Guarda una vacante para poder seleccionarla.',
    returnToOffer: 'Volver a la vacante',
    adaptedCv: 'CV adaptado',
    prepareCv: 'Preparar CV con el agente',
    reviseCv: 'Revisar CV con el agente',
    emptyAdaptedCv:
      'El CV que prepare el agente aparecerá aquí. Si acabas de guardarlo, recarga el archivo de vacantes.',
    viewAdaptedCv: 'Ver CV adaptado',
    spanishCv: 'Español',
    englishCv: 'Inglés',
    confirmRemoval:
      '¿Quitar «{offer}» de tu lista? Pulsa «Guardar vacantes» para aplicar la eliminación al archivo.',
  },
  vacancyComparison: {
    eyebrow: '{count} VACANTES SELECCIONADAS',
    title: 'Comparación de vacantes',
    description:
      'Revisa las condiciones y el encaje de cada oferta en paralelo.',
    clear: 'Limpiar selección',
    scrollHint: 'Desliza la tabla para ver todas las ofertas.',
    tableLabel: 'Tabla de comparación',
    criterion: 'Criterio',
    unknownCompany: 'Empresa sin registrar',
    unknownRole: 'Puesto sin título',
    conditions: 'Condiciones',
    salary: 'Salario',
    verified: 'Verificado',
    unverified: 'Sin verificar',
    modality: 'Modalidad',
    location: 'Ubicación',
    verificationDate: 'Fecha de verificación',
    fit: 'Encaje y preparación',
    assessment: 'Valoración',
    evidence: 'Evidencias de encaje',
    gaps: 'Carencias',
    blockers: 'Bloqueos',
    cv: 'CV recomendado',
  },
  vacancyCvAdvice: {
    title: 'Qué adaptar en los CV',
    description:
      'Guarda aquí la valoración del agente o la que introduzcas manualmente. La app no recomienda una versión automáticamente.',
    recommendedVersion: 'Mejor versión para esta vacante',
    spanish: 'Formato español · dos columnas',
    english: 'Formato inglés · una columna',
    both: 'Las dos versiones encajan',
    pending: 'Pendiente de valorar',
    reason: 'Por qué usar esta versión',
    assessedAt: 'Fecha de valoración',
    dateHint: 'Fecha manual; déjala vacía si no está registrada.',
    spanishAdjustments: 'Cambios para el CV en español',
    englishAdjustments: 'Cambios para el CV en inglés',
    noAssessment: 'Todavía no hay una recomendación guardada para esta oferta.',
    noAdjustments: 'Sin cambios registrados.',
    assessmentDate: 'Valorado',
    profileBasis:
      'Contrasta la oferta con evidencias confirmadas del Perfil y con los datos compartidos con LinkedIn.',
    editHint:
      'Añade cada cambio como un punto concreto. Mantén la base coherente con Perfil y LinkedIn; aquí se anotan los ajustes de esta oferta.',
  },
  linkedinPage: {
    eyebrow: 'COPIA DEL PERFIL PUBLICADO',
    title: 'LinkedIn',
    subtitle:
      'Conserva el contenido publicado y anota qué corregir o añadir, con su base en perfil y aprendizajes.',
    modeLabel: 'Vista de LinkedIn',
    languageSwitcherLabel: 'Idioma del perfil de LinkedIn',
    variantLanguageNames: { es: 'Español', en: 'English' },
    languageSyncPending: 'Idiomas por sincronizar',
    openLanguageSyncPrompt: 'Ver Buzón',
    editButton: 'Editar',
    previewButton: 'Vista previa',
    separationNotice: 'La copia publicada y las notas se guardan por separado.',
    unsavedChangesLabel: 'Cambios sin guardar',
    recentlySavedLegend:
      'En rojo se muestran los cambios del último guardado. El próximo guardado sustituirá este resaltado.',
    recentlyChangedEmpty:
      'Este apartado cambió en el último guardado y ahora no tiene contenido para mostrar.',
    unsavedChangesConfirmation:
      'Hay cambios de LinkedIn sin guardar. Si sales de esta sección o recargas ahora, se perderán. ¿Quieres continuar?',
    sectionIndexTitle: 'Ir a una sección',
    sectionIndexHint:
      'Abre el apartado que quieres editar sin recorrer todo el formulario.',
    sectionIndexPresentation: 'Presentación',
    formEyebrow: 'COPIA FIEL',
    formTitle: 'Contenido del perfil',
    formDescription:
      'Escribe cada sección como aparece en tu perfil. Las propuestas de revisión no cambian este contenido.',
    nameLabel: 'Nombre que aparece en LinkedIn',
    lastUpdatedLabel: 'Última actualización del perfil',
    lastUpdatedHint: 'Fecha manual; déjala vacía si no está registrada.',
    auditTitle: 'Anotaciones de revisión',
    auditDescription:
      'Cada tarjeta es una recomendación privada. Completa lo que aplique; nada se escribe en el archivo hasta que pulses Guardar.',
    auditGuideTitle: 'Cómo revisar una anotación',
    auditGuideSteps: [
      'Elige la sección de LinkedIn, la acción y la prioridad.',
      'Si propones un texto para una lista, selecciona la entrada y el campo exactos. Para Titular o Acerca de, basta con elegir la sección.',
      'Explica qué se observa y por qué conviene cambiarlo; vincula las evidencias de Perfil con las casillas.',
      'Escribe la recomendación y, si procede, el texto propuesto. En Vista previa, aceptar aplica el texto y elimina su anotación; descartar también la elimina. Arriba puedes eliminar las anotaciones restantes y guardar el perfil cuando acabes.',
    ],
    addAudit: 'Añadir anotación',
    emptyAudit: 'Aún no hay anotaciones de revisión.',
    save: 'Guardar cambios de LinkedIn',
    previewEyebrow: 'VISTA DE CONSULTA',
    previewTitle: 'Tu perfil',
    previewDescription:
      'Edita cada apartado desde aquí o abre sus marcadores para revisar sugerencias. Los cambios quedan como borrador y solo se guardan al pulsar Guardar.',
    editPreviewAction: 'Editar',
    editPreviewSection: 'Editar {section} en el formulario',
    emptyPreviewTitle: 'Aún no hay contenido para previsualizar',
    emptyPreviewBody:
      'Añade la copia de tu perfil en Editar. Se mostrará aquí tal como la escribas.',
    editAction: 'Ir a editar LinkedIn',
    nameFallback: 'Perfil profesional',
    auditOnlyNote:
      'Todavía no hay secciones publicadas; se muestran las anotaciones disponibles.',
    emptyList: 'Sin elementos añadidos.',
    addSection: 'Añadir',
    removeEntry: 'Eliminar',
    additionalSectionsTitle: 'Otras secciones publicadas',
    additionalSectionsDescription:
      'Conserva aquí una sección completa que no encaje en los campos anteriores, con su título original y el texto tal como aparece.',
    emptyAdditionalSections:
      'Si el agente encuentra una sección sin campo equivalente, la guardará aquí. También puedes añadirla manualmente.',
    addAdditionalSection: 'Añadir otra sección',
    additionalSectionTitleLabel: 'Título original de la sección',
    additionalSectionContentLabel: 'Contenido publicado',
    additionalSectionContentHint:
      'Mantén el texto, el idioma, las listas y los saltos de línea originales.',
    removeAdditionalSection: 'Eliminar sección adicional',
    additionalSectionFallback: 'Otra sección',
    descriptionTruncatedNotice:
      'LinkedIn solo dejó guardar una parte. Si aquí falta texto, vuelve a LinkedIn, pulsa «Ver más» y actualiza la copia.',
    descriptionShowMore: 'Ver más',
    descriptionShowLess: 'Ver menos',
    auditLabel: 'PARA REVISAR',
    auditMarkerLabel:
      'Ver {count} sugerencias de LinkedIn. Prioridad {priority}.',
    auditPopoverEyebrow: 'ANOTACIONES · PRIVADAS',
    auditPopoverClose: 'Cerrar sugerencias',
    auditPopoverCountOne: '1 sugerencia para esta sección',
    auditPopoverCountMany: '{count} sugerencias para esta sección',
    auditPopoverProblem: 'Qué se observa',
    auditPopoverReason: 'Motivo y evidencia',
    auditPopoverRecommendation: 'Qué mejorar',
    auditPopoverProposed: 'Texto propuesto',
    auditPopoverDate: 'Fecha de auditoría',
    auditActions: {
      corregir: 'Corregir',
      anadir: 'Añadir',
      aclarar: 'Aclarar',
      fallback: 'Revisar',
    },
    auditPending: 'Anotación pendiente',
    proposedTextPrefix: 'Texto propuesto',
    evidenceBasePrefix: 'Base',
    missingEvidenceHint: 'Vincula una evidencia del perfil o un aprendizaje.',
    auditPriority: 'Prioridad',
    auditStatuses: {
      pendiente: 'Pendiente',
      aplicada: 'Aplicada',
      descartada: 'Descartada',
    },
    auditCard: {
      title: 'Punto de auditoría',
      delete: 'Eliminar punto de auditoría',
      section: 'Sección de LinkedIn',
      additionalSectionOption: 'Otra sección · {title}',
      sectionUnavailable: 'ya no está disponible',
      sectionUnavailableHint:
        'La sección ya no está en la copia publicada. Esta anotación se conserva; puedes vincularla a otra sección o eliminarla.',
      unlinkedAdditionalSection: 'Otra sección · pendiente de vincular',
      unlinkedAdditionalSectionHint:
        'Vincula esta anotación a una sección adicional concreta para que aparezca junto al contenido correspondiente.',
      action: 'Acción',
      actionHint:
        'Corregir = sustituir; añadir = incorporar contenido; aclarar = hacerlo más preciso.',
      problem: 'Qué se observa',
      problemHint: 'Describe el problema o la información que falta.',
      reasonEvidence: 'Por qué, según el perfil o los aprendizajes',
      reasonEvidenceHint:
        'Explica qué hecho confirmado respalda esta recomendación.',
      relatedEvidence: 'Evidencias relacionadas',
      untitledEvidence: 'Sin título',
      noEvidence: 'Añade primero evidencias o aprendizajes en Perfil.',
      openInProfile: 'Abrir en Perfil',
      otherEvidenceIds: 'Otros IDs de perfil/aprendizajes',
      evidenceIdsHint:
        'Úsalo solo para evidencias que no aparezcan en las casillas de arriba. Separa los IDs de profile.json con comas.',
      recommendation: 'Qué corregir o añadir',
      recommendationHint: 'Resume el cambio que recomiendas.',
      proposedText: 'Texto propuesto (opcional)',
      proposedTextHint:
        'Si lo escribes, podrás probarlo desde Vista previa. Para listas, selecciona arriba la entrada y el campo exactos.',
      date: 'Fecha de auditoría',
      status: 'Estado',
      statusHint:
        'Al aceptar o descartar desde Vista previa, la anotación se elimina del borrador.',
      actions: { corregir: 'Corregir', anadir: 'Añadir', aclarar: 'Aclarar' },
      priorities: { alta: 'Alta', media: 'Media', baja: 'Baja' },
      statuses: {
        pendiente: 'Pendiente',
        aplicada: 'Aplicada',
        descartada: 'Descartada',
      },
      proposalTarget: 'Campo que reemplazará el texto propuesto',
      additionalTargetHint:
        'Elige si el texto propuesto reemplaza el título o el contenido de esta sección.',
      targetHint:
        'Esto se usa al aceptar la propuesta en Vista previa. Selecciona primero la entrada y luego el campo exacto que quieres cambiar.',
      additionalContent: 'Contenido',
      additionalTitle: 'Título de la sección',
      targetEntry: 'Entrada concreta',
      chooseTargetEntry: 'Selecciona una entrada',
      targetField: 'Campo concreto',
      chooseTargetField: 'Selecciona un campo',
      plainTextValue: 'Texto completo de esta entrada',
      chooseExactTarget:
        'Selecciona la entrada y el campo exactos para poder aplicar este texto con seguridad.',
      applyProposal: 'Aplicar al borrador',
      applyProposalHint:
        'Esto cambia solo el borrador. Guarda al final para escribirlo en linkedin.json.',
      acceptProposal: 'Aceptar cambio',
      proposalApplied: 'Propuesta aplicada al borrador.',
      discardSuggestion: 'Descartar anotación',
      discardAudit: 'Eliminar anotaciones restantes ({count})',
      discardAuditConfirmation:
        'Se eliminarán las {count} anotaciones que quedan en esta versión. Los textos ya aceptados no se revertirán. ¿Continuar?',
      discardAuditSuccess:
        'Se eliminaron las anotaciones restantes del borrador. Los cambios aceptados siguen intactos; pulsa Guardar para conservar el resultado.',
      discardSuccess:
        'Anotación eliminada del borrador; no se guardará. Pulsa Guardar para conservar los cambios del perfil.',
      applyConfirmation:
        'Se sustituirá únicamente el campo seleccionado. ¿Quieres aplicar el cambio?',
      currentText: 'Texto actual',
      applyTargetUnavailable:
        'No se aplicó la propuesta: el destino ya no está disponible o no es válido.',
      applySuccess:
        'Propuesta aplicada al borrador y anotación eliminada. Pulsa Guardar para conservar el cambio en linkedin.json.',
    },
    evidenceLabels: {
      experience: 'Experiencia',
      education: 'Formación',
      skills: 'Habilidades',
      certifications: 'Certificaciones',
      languages: 'Idiomas',
      projects: 'Proyectos',
      evidence: 'Otras evidencias',
      learnings: 'Aprendizajes',
    },
    sectionLabels: {
      headline: 'Titular',
      about: 'Acerca de',
      experience: 'Experiencia',
      education: 'Educación',
      languages: 'Idiomas',
      skills: 'Aptitudes',
      certifications: 'Certificaciones',
      projects: 'Proyectos',
      featured: 'Destacados',
    },
    entryFieldLabels: {
      title: 'Cargo',
      company: 'Empresa',
      employmentType: 'Tipo de empleo',
      location: 'Ubicación',
      workplaceType: 'Modalidad del puesto',
      dates: 'Fechas',
      description: 'Descripción',
      descriptionTruncated: 'Falta parte del texto',
      skills: 'Aptitudes asociadas',
      institution: 'Institución',
      degree: 'Titulación',
      fieldOfStudy: 'Área de estudio',
      grade: 'Nota',
      activities: 'Actividades y asociaciones',
      language: 'Idioma',
      proficiency: 'Nivel o competencia',
      details: 'Detalles',
      name: 'Nombre',
      issuer: 'Entidad emisora',
      issueDate: 'Fecha de emisión',
      expirationDate: 'Fecha de caducidad',
      credentialId: 'ID de credencial',
      credentialUrl: 'Enlace de credencial',
      associatedWith: 'Asociado con',
      url: 'Enlace',
      mediaType: 'Tipo de contenido',
    },
  },
  linkedinContentPage: {
    flowTabsLabel: 'Flujos de contenido',
    eyebrow: 'IDEAS PARA CONVERSACIONES PROFESIONALES',
    title: 'Contenido de LinkedIn',
    subtitle:
      'Descubre lecturas que te interesan, prepara publicaciones con tu enfoque y escribe comentarios con algo propio que aportar.',
    flows: {
      articles: 'Artículos',
      posts: 'Publicaciones',
      comments: 'Comentarios',
    },
    profileTitle: 'Una búsqueda guiada por tus intereses',
    profileDescription:
      'El agente consulta tus intereses, temas y preferencias de voces y empresas en cada búsqueda, y comprueba las afiliaciones actuales.',
    profileReady: '{count} intereses, temas y preferencias de fuente en Perfil',
    profileEmpty:
      'Aún no hay intereses, temas ni preferencias de fuente en Perfil. Puedes añadirlos allí o indicar el enfoque de esta búsqueda.',
    searchEyebrow: 'LECTURAS CON HILO PROPIO',
    queueEyebrow: 'TU SIGUIENTE LECTURA',
    postsEyebrow: 'DE LA EXPERIENCIA A LA IDEA',
    commentsEyebrow: 'UNA RESPUESTA CON ALGO QUE APORTAR',
    searchFocus: '¿Qué te gustaría explorar esta vez? (opcional)',
    searchFocusHint:
      'El agente combina este enfoque con los temas actuales de Perfil.',
    discoverTitle: 'Descubrir lecturas',
    discoverDescription:
      'El agente buscará en publicaciones especializadas, revistas, fuentes de investigación y contenido público de LinkedIn, y guardará las propuestas verificadas como pendientes.',
    discoverCopy: 'Copiar prompt de búsqueda',
    discoveryPrompt: 'Prompt de búsqueda',
    discoveryPromptCopied: 'Prompt de búsqueda copiado.',
    promptCopied: 'Prompt copiado. Pégalo en tu asistente.',
    copyFailed: 'No se pudo copiar. Selecciona el prompt y cópialo.',
    queueTitle: 'Tu cola de lectura',
    queueDescription:
      'Decide qué artículos te interesan. Los rechazados se conservan en su pestaña y no vuelven a aparecer como nuevos.',
    queueTabs: {
      pending: 'Por revisar',
      accepted: 'Aceptados',
      rejected: 'Descartados',
    },
    noArticles: {
      pending: 'Aquí aparecerán los artículos que el agente encuentre para ti.',
      accepted: 'Aún no has aceptado ningún artículo.',
      rejected: 'Aquí se conservarán los artículos que descartes.',
    },
    addManually: 'Añadir artículo manualmente',
    addArticle: 'Añadir a pendientes',
    articleTitle: 'Título del artículo',
    articleSource: 'Revista o fuente',
    articleUrl: 'Enlace directo',
    articleDate: 'Fecha de publicación (si consta)',
    verifiedArticle: 'Fuente verificada',
    unverifiedArticle: 'Añadido manualmente · sin verificar',
    articleRelevance: 'Por qué puede interesarte',
    articleTopics: 'Temas (separados por comas)',
    articleInvalid: 'Añade título, fuente y un enlace http o https válido.',
    acceptArticle: 'Me interesa',
    rejectArticle: 'Descartar',
    backToPending: 'Devolver a pendientes',
    restoreArticle: 'Volver a revisar',
    pendingLabel: 'Por revisar',
    acceptedLabel: 'Aceptado',
    rejectedLabel: 'Descartado',
    opinionLabel: '¿Qué opinas tú?',
    opinionHint:
      'Escribe tu postura antes de pedir una publicación. El agente no inventará tu opinión.',
    opinionRequired: 'Añade tu opinión para preparar el prompt.',
    preparePost: 'Preparar publicación sobre este artículo',
    openArticle: 'Leer fuente ↗',
    postTitle: 'Crear una publicación',
    postDescription:
      'Parte de una experiencia, un proyecto, un aprendizaje, un logro o una opinión. Solo se preparará el prompt; el borrador queda en la conversación con tu asistente.',
    postType: 'Tipo de publicación',
    postTypes: {
      achievement: 'Logro o título',
      project: 'Proyecto',
      learning: 'Experiencia o aprendizaje',
      article: 'Opinión sobre un artículo',
      source: 'Reutilizar un material',
    },
    postIdea: 'Idea, experiencia o enfoque que quieres contar',
    postIdeaHint:
      'Cuéntalo con tus palabras. El agente preguntará si falta un dato importante.',
    relatedArticle: 'Artículo aceptado',
    noAcceptedArticles: 'Todavía no hay artículos aceptados.',
    selectedEvidence:
      'Evidencias confirmadas que quieres considerar (opcional)',
    noEvidence: 'No hay evidencias confirmadas guardadas en Perfil.',
    evidenceHint:
      'Se compartirán solo los identificadores seleccionados. El agente comprobará esos hechos en el archivo local.',
    copyPostPrompt: 'Copiar prompt para crear publicación',
    commentTitle: 'Preparar un comentario',
    commentDescription:
      'Pega el texto de la publicación y añade qué piensas o qué quieres aportar. El agente no abrirá cuentas ni buscará la publicación.',
    commentSource: 'Texto de la publicación que quieres comentar',
    commentPoint: 'Tu opinión o aportación',
    commentPointHint:
      'Una pregunta, matiz, experiencia o idea concreta que sí compartes.',
    copyCommentPrompt: 'Copiar prompt para redactar comentarios',
    promptPreview: 'Ver prompt que copiarás',
    promptContext: {
      extraSearchFocus: 'Enfoque adicional para esta búsqueda',
      title: 'Información concreta para esta solicitud',
      type: 'Tipo',
      idea: 'Idea y enfoque',
      acceptedArticle: 'Artículo aceptado',
      articleId: 'ID',
      articleTitle: 'Título',
      articleSource: 'Fuente',
      articleLink: 'Enlace',
      articleDate: 'Fecha',
      articleRelevance: 'Relevancia',
      userOpinion: 'Mi opinión',
      evidenceIds: 'IDs de evidencias confirmadas seleccionadas en Perfil',
      commentMaterial: 'Material y aportación para esta solicitud',
      postText: 'Texto de la publicación',
      commentOpinion: 'Mi opinión o aportación',
      profileTone:
        'Usa el tono de contentDirection de Perfil solo si tienes acceso local; no infieras que comparto ideas que no he indicado.',
    },
    save: 'Guardar cambios en la cola',
    saved: 'Cambios guardados en linkedin-content.json.',
    prepared: 'Archivo preparado para guardar manualmente.',
    saving: 'Guardando…',
    saveFailed: 'No se pudo guardar. Conserva tu borrador y revisa el archivo.',
  },
  promptInbox: PROMPT_INBOX_ES,
  linkedinDates: 'LinkedIn',
  conflict:
    'El archivo cambió fuera de la aplicación. Recárgalo antes de guardar para conservar los cambios externos.',
  invalid:
    'No se pudo leer este JSON. El archivo original se conserva sin cambios.',
}

export const TITLES = {
  profile: 'Perfil y aprendizajes',
  linkedin: 'LinkedIn',
  'linkedin-content': 'Contenido de LinkedIn',
  cv: 'CV base',
  vacancies: 'Vacantes',
  prompts: 'Buzón',
  priorities: 'Prioridades',
}
