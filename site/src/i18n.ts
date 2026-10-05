// ES/EN strings for Round 3. Approved copy is copied verbatim from
// experiments/codex/kinetic-editorial/src/{content.ts,case-*.json,human-*.json};
// new lines come from BUILD-SPEC.md, REFINEMENT-PASS.md, FINAL-PASS.md, LAST-PASS.md
// and CLOSING-PASS.md.

import { teaching } from './data/proof';

export type Lang = 'es' | 'en';

export const base = import.meta.env.BASE_URL.replace(/\/$/, '') + '/';
export const asset = (file: string) => `${base}assets/${file}`;
export const homeHref = (lang: Lang) => (lang === 'en' ? `${base}en/` : base);
export const workHref = (lang: Lang) => (lang === 'en' ? `${base}en/work/` : `${base}work/`);

export const links = {
  email: 'sebasbelmosdev@gmail.com',
  linkedin: 'https://www.linkedin.com/in/sebasbelmos/',
  youtube: 'https://www.youtube.com/channel/UCeYaQhjA-N6YVd6RNTdhBeA',
  github: 'https://github.com/SEBASBELMOS',
  preply: 'https://preply.com/en/tutor/7382924',
  geoApp: 'https://analiticalastdance-geovision-cali-frontend.hf.space',
  geoCode: 'https://github.com/SEBASBELMOS/GeoVision-CLIP-Cali',
};

const es = {
  meta: {
    title: 'Sebastian Belalcazar — AI Systems Engineer',
    description:
      'Ayudo a fundadores de negocios digitales a conectar herramientas, datos y procesos para reducir trabajo manual.',
    workTitle: 'Todos los proyectos · Sebastian Belalcazar',
    workDescription:
      'Proyectos universitarios, exploraciones propias y contribuciones de Sebastian Belalcazar.',
    notFoundTitle: 'Página no encontrada · SEBASBELMOS',
    ogAlt: 'Tarjeta de SEBASBELMOS sobre papel claro: «Menos trabajo manual. Menos cosas que dependan de ti.» Sebastian Belalcazar, AI Systems Engineer.',
  },
  ui: {
    skip: 'Saltar al contenido',
    home: 'SEBASBELMOS, inicio',
    nav: 'Principal',
    language: 'Idioma',
    navItems: [
      ['Casos', '#casos'],
      ['Cómo trabajo', '#proceso'],
      ['Sobre mí', '#sobre-mi'],
    ] as [string, string][],
    write: 'Hablemos',
    social: 'Redes',
    archive: 'Todos los proyectos',
  },
  hero: {
    before: 'El problema',
    struck: 'Demasiadas cosas pasan por ti.',
    // Phone line break of the struck sentence; each line gets its own strike.
    struckLines: ['Demasiadas cosas', 'pasan por ti.'],
    h1: ['Menos trabajo manual.', 'Menos cosas que', 'dependan de ti.'],
    support: 'Ayudo a fundadores de negocios digitales a conectar herramientas, datos y procesos para reducir trabajo manual y ordenar la operación.',
    niche: 'Educación online · coaching · mentorías · productos digitales',
    cta: 'Cuéntame qué te está quitando tiempo',
  },
  reality: {
    title: ['El negocio funciona.', 'Pero demasiadas cosas todavía pasan por ti.'],
    // [category label, situation]
    rows: [
      ['Información dispersa', 'Drive o Notion: ¿cuál tiene la versión correcta?'],
      ['Trabajo manual', 'Copiar los leads del formulario a una hoja.'],
      ['Reportes', 'Volver a armar el reporte del mes.'],
      ['Dependencia', 'Pedir confirmación antes de avanzar.'],
    ] as [string, string][],
    close: 'Si todo vuelve a ti, la operación depende demasiado de ti.',
  },
  thesis: {
    statement: ['Casi nunca falta otra herramienta.', 'Falta que las que ya tienes trabajen juntas.'],
    support: 'Primero entiendo dónde se rompe el flujo. Después vemos si hace falta automatizar, integrar herramientas, mejorar reportes o construir una herramienta interna.',
  },
  casesIntro: {
    title: 'Cómo se ve en la práctica.',
  },
  bilbao: {
    record: 'Bilbao2 · Cliente · enero de 2026',
    title: 'De formularios sueltos a leads que llegan al lugar correcto.',
    stagesCount: '3',
    stagesLabel: 'etapas integradas',
    stages: ['Captación', 'Calificación', 'Asignación'],
    toolsCount: '4',
    toolsLabel: 'herramientas conectadas',
    tools: ['Typeform', 'n8n', 'ActiveCampaign', 'Hojas de cálculo'],
    did: 'Diseñé e implementé el flujo que mueve la información entre esas etapas y herramientas sin tener que trasladarla manualmente.',
  },
  betterlife: {
    record: 'BetterLife Coaching · Cliente · 2024–2025',
    title: 'De contenido a producto y datos.',
    p1Label: '01 · Contenido',
    p1Metric: '5M+',
    p1Unit: 'vistas orgánicas',
    p1Time: '~2 meses',
    qualifier: 'Resultado del trabajo de contenido en equipo durante la colaboración. No corresponde al uso del MVP.',
    p2Label: '02 · Producto',
    p2Title: 'MVP de finanzas personales',
    p2Body: 'Construí la primera versión y participé en decisiones de producto, UX, datos, reportes y flujos.',
    scope: 'Datos · reportes · flujos · UX',
  },
  geo: {
    record: 'GeoVision-CLIP Cali · Proyecto universitario · equipo de 3',
    title: 'Cinco fuentes de datos, una sola interfaz para explorarlas.',
    tabs: 'Capas de la app',
    shotAlt: 'Captura de GeoVision',
    otherShots: 'Otras capturas',
    problem: 'Los datos satelitales, meteorológicos y de estaciones llegaban en formatos y resoluciones distintos. Hacía falta una base común para explorarlos.',
    did: 'Mi aporte cubrió datos, backend, frontend, pruebas y despliegue.',
    facts: [
      ['5', 'fuentes de datos'],
      ['93,1 GB', 'de imágenes Sentinel-2 (198 escenas)'],
      ['1.920', 'celdas espaciales'],
      ['26/26', 'pruebas del backend'],
    ] as [string, string][],
    factsLabel: 'Datos del proyecto',
    app: 'Abrir la app',
    code: 'Ver el código',
    newTab: '(se abre en una pestaña nueva)',
  },
  archivePath: {
    title: 'Ver los 11 proyectos',
  },
  process: {
    title: ['Primero entendemos qué pasa.', 'Después decidimos por dónde empezar.'],
    under: 'Antes de tocar una herramienta, definimos qué está quitando tiempo, qué debería cambiar y cómo sabremos si mejoró.',
    steps: [
      ['01', 'Entender', 'Qué está pasando y qué resultado importa.'],
      ['02', 'Mapear', 'Qué herramientas, datos y personas intervienen.'],
      ['03', 'Priorizar', 'Qué cambio vale la pena hacer primero.'],
      ['04', 'Construir y entregar', 'Implementar, medir cuando se pueda, ajustar y dejarlo documentado.'],
    ] as [string, string, string][],
  },
  why: {
    title: 'Lo construyo para que tu equipo pueda entenderlo y usarlo.',
    lead: 'Conecto la parte técnica con la forma en que trabaja el equipo.',
    portraitAlt: 'Sebastian Belalcazar',
    portraitCaption: 'Sebastian Belalcazar',
    portraitSub: 'AI Systems Engineer',
    p1: 'Entiendo cómo trabaja el equipo, cómo se mueve la información y dónde tiene sentido automatizar, conectar datos o construir una herramienta. Así puedo entender el problema completo sin perder el contexto entre una parte y otra.',
    teachTitle: 'También llevo años enseñando.',
    // [figure, label]
    teach: [[`${teaching.lessons}+`, 'clases'], [`${teaching.students}+`, 'estudiantes internacionales'], [`${teaching.fiveStarReviews}`, 'reseñas de 5 estrellas']] as [string, string][],
    teachText: 'Dar clases me entrenó para escuchar, adaptarme a la persona que tengo delante y explicar temas complejos con claridad.',
    quoteLabel: 'Reseña en Preply · abril de 2026',
    quote: ['«Desde la primera clase supo identificar ', 'lo que necesitaba', ' y ver con claridad en qué me faltaba mejorar».'],
    quoteBy: 'Alice, estudiante de español (traducido del inglés).',
    quoteLink: 'Reseñas en Preply',
  },
  contact: {
    title: 'Cuéntame qué te está quitando tiempo.',
    sub: 'No necesitas saber qué solución hace falta. Cuéntame qué se repite, qué se pierde o qué sigue dependiendo de ti. Con eso basta para empezar.',
    copy: 'Copiar correo',
    copied: 'copiado ✓',
    copyFail: 'Selecciona la dirección y cópiala',
  },
  archive: {
    title: 'Todos los proyectos',
    intro: 'Proyectos universitarios, exploraciones propias y contribuciones. Abre cada proyecto para ver el contexto, mi trabajo y la evidencia disponible.',
    problem: 'El problema',
    built: 'Lo que hice',
    evidence: 'Evidencia y contexto',
    view: 'Ver proyecto',
    report: 'Informe archivado (PDF)',
    shots: 'Capturas',
    back: 'Volver a los casos',
    contact: 'Cuéntame qué te está quitando tiempo',
  },
};

type Copy = typeof es;

const en: Copy = {
  meta: {
    title: 'Sebastian Belalcazar — AI Systems Engineer',
    description:
      'I help founders of digital businesses connect tools, data and workflows to cut manual work.',
    workTitle: 'All projects · Sebastian Belalcazar',
    workDescription: 'University projects, personal explorations and contributions by Sebastian Belalcazar.',
    notFoundTitle: 'Page not found · SEBASBELMOS',
    ogAlt: 'SEBASBELMOS card on light paper: “Less manual work. Fewer things that depend on you.” Sebastian Belalcazar, AI Systems Engineer.',
  },
  ui: {
    skip: 'Skip to content',
    home: 'SEBASBELMOS, home',
    nav: 'Main',
    language: 'Language',
    navItems: [
      ['Work', '#casos'],
      ['How I work', '#proceso'],
      ['About', '#sobre-mi'],
    ],
    write: 'Let’s talk',
    social: 'Social',
    archive: 'All projects',
  },
  hero: {
    before: 'The problem',
    struck: 'Too much still has to go through you.',
    struckLines: ['Too much still has', 'to go through you.'],
    h1: ['Less manual work.', 'Fewer things that', 'depend on you.'],
    support: 'I help founders of digital businesses connect tools, data and workflows to reduce manual work and make the business easier to run.',
    niche: 'Online education · coaching · mentoring · digital products',
    cta: 'Tell me what’s taking up your time',
  },
  reality: {
    title: ['The business is running.', 'But too much still has to go through you.'],
    rows: [
      ['Scattered information', 'Drive or Notion: which one has the right version?'],
      ['Manual work', 'Copying leads from a form into a spreadsheet.'],
      ['Reporting', 'Rebuilding this month’s report.'],
      ['Dependence', 'Waiting for your sign-off before moving on.'],
    ],
    close: 'If everything comes back to you, the business still depends too heavily on you.',
  },
  thesis: {
    statement: ['You rarely need another tool.', 'You need the ones you already have to work together.'],
    support: 'First I work out where the workflow breaks. Then we decide whether it needs automation, better integrations, clearer reporting or an internal tool.',
  },
  casesIntro: {
    title: 'What this looks like in practice.',
  },
  bilbao: {
    record: 'Bilbao2 · Client · January 2026',
    title: 'From scattered form entries to leads that land in the right place.',
    stagesCount: '3',
    stagesLabel: 'stages integrated',
    stages: ['Intake', 'Qualification', 'Routing'],
    toolsCount: '4',
    toolsLabel: 'tools connected',
    tools: ['Typeform', 'n8n', 'ActiveCampaign', 'Spreadsheets'],
    did: 'I designed and built the workflow that moves information between those stages and tools without anyone having to move it manually.',
  },
  betterlife: {
    record: 'BetterLife Coaching · Client · 2024–2025',
    title: 'From content to product and data.',
    p1Label: '01 · Content',
    p1Metric: '5M+',
    p1Unit: 'organic views',
    p1Time: '~2 months',
    qualifier: 'These results came from the team’s content work during the collaboration. They are not a measure of MVP usage.',
    p2Label: '02 · Product',
    p2Title: 'Personal finance MVP',
    p2Body: 'I built the first version and contributed across product, UX, data, reporting and workflows.',
    scope: 'Data · reporting · workflows · UX',
  },
  geo: {
    record: 'GeoVision-CLIP Cali · University project · team of 3',
    title: 'Five data sources, one interface to explore them.',
    tabs: 'App layers',
    shotAlt: 'GeoVision screenshot',
    otherShots: 'Other screenshots',
    problem: 'Satellite, weather and ground-station data arrived in different formats and resolutions. They needed a common base before anyone could explore them.',
    did: 'My contribution covered data, backend, frontend, testing and deployment.',
    facts: [
      ['5', 'data sources'],
      ['93.1 GB', 'of Sentinel-2 imagery (198 scenes)'],
      ['1,920', 'spatial cells'],
      ['26/26', 'backend tests'],
    ],
    factsLabel: 'Project facts',
    app: 'Open the app',
    code: 'View the code',
    newTab: '(opens in a new tab)',
  },
  archivePath: {
    title: 'See all 11 projects',
  },
  process: {
    title: ['First we understand what’s happening.', 'Then we decide where to start.'],
    under: 'Before we touch any tools, we work out what is taking up time, what should change and how we’ll know the change worked.',
    steps: [
      ['01', 'Understand', 'What is happening and which outcome matters.'],
      ['02', 'Map', 'Which tools, data and people are involved.'],
      ['03', 'Prioritise', 'Which change is worth making first.'],
      ['04', 'Build and hand over', 'Implement, measure where possible, refine, document and hand over.'],
    ],
  },
  why: {
    title: 'I build it so your team can understand it and use it.',
    lead: 'I connect the technical side with the way the team actually works.',
    portraitAlt: 'Sebastian Belalcazar',
    portraitCaption: 'Sebastian Belalcazar',
    portraitSub: 'AI Systems Engineer',
    p1: 'I look at how the team works, how information moves and where it makes sense to automate, connect data or build a tool. That lets me see the whole problem without losing context between the pieces.',
    teachTitle: 'I’ve also been teaching for years.',
    teach: [[`${teaching.lessons}+`, 'lessons'], [`${teaching.students}+`, 'international students'], [`${teaching.fiveStarReviews}`, 'five-star reviews']] as [string, string][],
    teachText: 'Teaching trained me to listen, adapt to the person in front of me and explain complex topics clearly.',
    quoteLabel: 'Preply review · April 2026',
    quote: ['“From the very first class, he was able to ', 'distill my need', ' and identify clearly where I fall short.”'],
    quoteBy: 'Alice, a student of Spanish.',
    quoteLink: 'Reviews on Preply',
  },
  contact: {
    title: 'Tell me what’s taking up your time.',
    sub: 'You don’t need to know what the solution is. Tell me what keeps repeating, what gets lost or what still depends on you. That’s enough to start.',
    copy: 'Copy email',
    copied: 'copied ✓',
    copyFail: 'Select the address and copy it',
  },
  archive: {
    title: 'All projects',
    intro: 'University projects, personal explorations and contributions. Open each project to see the context, what I built and the available evidence.',
    problem: 'The problem',
    built: 'What I built',
    evidence: 'Evidence and context',
    view: 'View project',
    report: 'Archived report (PDF)',
    shots: 'Screenshots',
    back: 'Back to the case studies',
    contact: 'Tell me what’s taking up your time',
  },
};

export const copy: Record<Lang, Copy> = { es, en };
