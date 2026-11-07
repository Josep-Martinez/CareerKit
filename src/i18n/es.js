import { PROMPT_INBOX_ES } from './prompt-inbox.es.js'

export const NAV = [
  ['home', 'Inicio', '⌂'],
  ['profile', 'Perfil y aprendizajes', '◈'],
  ['linkedin', 'LinkedIn', '↗'],
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
    body: 'CareerKit necesita una carpeta local para mostrar y guardar información. Crea private-data/ en la raíz de este proyecto con los cinco JSON vacíos de templates/, o conecta la carpeta si ya la tienes. Al conectar, la web solicitará permiso para leer y guardar. También puedes pedirle a tu asistente local que prepare la carpeta; solo podrá editar esos archivos si tiene acceso local al proyecto.',
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
    checking: 'Buscando carpeta…',
    connectLocal: 'Conectar la carpeta de este proyecto',
    localMissing:
      'No encontramos private-data en este proyecto. Abre el prompt de preparación, pásaselo a tu asistente local y vuelve a pulsar este botón.',
    wrongFolder:
      'Elige la carpeta llamada private-data. Si todavía no existe, usa el prompt de preparación.',
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
      'Este navegador no permite conectar carpetas directamente. Abre CareerKit en un navegador compatible para continuar.',
    privacy:
      'Cuando el navegador lo permite, recuerda la selección. Tus JSON siguen en tu carpeta y no se envían a servidores.',
  },
  disconnect: 'Desconectar carpeta',
  disconnected: 'Datos desconectados',
  connected: 'Carpeta conectada',
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
  homeIntro: 'Una vista clara de lo que estás construyendo.',
  priorities: 'Prioridades',
  featured: 'Vacantes destacadas',
  cvDates: 'CV',
  homeSetup: {
    highPriorityLabel: 'ALTA PRIORIDAD · PRIMEROS PASOS',
    urgentTitle: 'Tu espacio necesita tu historia profesional',
    urgentBodyBoth:
      'Añade la información confirmada de tu trayectoria en Perfil y copia en LinkedIn lo que tienes publicado. Cuando ambas estén listas, el CV te mostrará el prompt para preparar las dos versiones.',
    urgentBodyProfile:
      'Añade la información confirmada de tu trayectoria en Perfil. Después podrás contrastarla con tu copia publicada en LinkedIn y preparar los CV desde su prompt.',
    urgentBodyLinkedin:
      'Añade la copia fiel de lo que tienes publicado en LinkedIn. Después podrás contrastarla con tu Perfil y preparar los CV desde su prompt.',
    cvTitle: 'El CV base está pendiente de preparar',
    cvBody:
      'Tu Perfil y LinkedIn ya tienen contenido. Abre CV y copia el prompt para que tu asistente prepare las dos versiones.',
    profileAction: 'Completar Perfil',
    linkedinAction: 'Completar LinkedIn',
    cvAction: 'Preparar los dos CV',
  },
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
    editButton: 'Editar',
    previewButton: 'Vista previa',
    separationNotice: 'La copia publicada y las notas se guardan por separado.',
    formEyebrow: 'COPIA FIEL',
    formTitle: 'Contenido publicado',
    formDescription:
      'Escribe cada sección como aparece en tu perfil. Las propuestas de revisión no cambian este contenido.',
    nameLabel: 'Nombre que aparece en LinkedIn',
    lastUpdatedLabel: 'Última actualización del perfil',
    lastUpdatedHint: 'Fecha manual; déjala vacía si no está registrada.',
    auditTitle: 'Anotaciones de revisión',
    auditDescription:
      'Añade recomendaciones con evidencia concreta de Perfil y aprendizajes.',
    addAudit: 'Añadir anotación',
    emptyAudit: 'Aún no hay anotaciones de revisión.',
    save: 'Guardar contenido y anotaciones',
    previewEyebrow: 'VISTA DE CONSULTA',
    previewTitle: 'Tu perfil',
    previewDescription: 'Las notas de revisión aparecen debajo de su sección.',
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
    auditLabel: 'PARA REVISAR',
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
      action: 'Acción',
      problem: 'Qué se observa',
      reasonEvidence: 'Por qué, según el perfil o los aprendizajes',
      relatedEvidence: 'Evidencias relacionadas',
      untitledEvidence: 'Sin título',
      noEvidence: 'Añade primero evidencias o aprendizajes en Perfil.',
      otherEvidenceIds: 'Otros IDs de perfil/aprendizajes',
      evidenceIdsHint: 'Los IDs deben existir en profile.json.',
      recommendation: 'Qué corregir o añadir',
      proposedText: 'Texto propuesto (opcional)',
      date: 'Fecha de auditoría',
      status: 'Estado',
      actions: { corregir: 'Corregir', anadir: 'Añadir', aclarar: 'Aclarar' },
      priorities: { alta: 'Alta', media: 'Media', baja: 'Baja' },
      statuses: {
        pendiente: 'Pendiente',
        aplicada: 'Aplicada',
        descartada: 'Descartada',
      },
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
      skills: 'Aptitudes',
      certifications: 'Certificaciones',
      projects: 'Proyectos',
      featured: 'Destacados',
    },
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
  cv: 'CV base',
  vacancies: 'Vacantes',
  prompts: 'Buzón',
  priorities: 'Prioridades',
}
