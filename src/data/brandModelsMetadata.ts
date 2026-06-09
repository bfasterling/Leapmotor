export interface BrandModelMetadata {
  brand: string;        // E.g., 'Fiat', 'Jeep', 'Dodge', 'Ram', 'Peugeot', 'Leapmotor'
  model: string;        // UI Display Name
  claveGen: string;     // Database corporate lookup key
  desc: string;         // Customer-facing description
  version?: string;     // CSV Version (e.g., 'SE MT' or 'GT PLUS')
  idVersion?: string;   // CSV idVersion (e.g., 'DGATTI2401')
  anio?: string;        // CSV Anio (e.g., '24')
}

export const BRAND_MODELS_METADATA: BrandModelMetadata[] = [
  // --- FIAT BRAND ---
  {
    brand: 'Fiat',
    model: 'PULSE',
    claveGen: 'FPUL24',
    desc: 'Diseño deportivo italiano, confort elevado y tecnología intuitiva.',
    version: 'Drive MT',
    idVersion: 'FIFPUL2401',
    anio: '24'
  },
  {
    brand: 'Fiat',
    model: 'PULSE ABARTH',
    claveGen: 'FPAB24',
    desc: 'El temperamento deportivo de pista del escorpión, hecho para la calle.',
    version: 'PULSE ABARTH',
    idVersion: 'FIFPAB2401',
    anio: '24'
  },
  {
    brand: 'Fiat',
    model: 'PULSE ABARTH STRANGER THINGS',
    claveGen: 'PABE26',
    desc: 'Edición exclusiva Stranger Things, diseño retro futurista y potencia deportiva.',
    version: 'Abarth',
    idVersion: 'FIPABE2601',
    anio: '26'
  },
  {
    brand: 'Fiat',
    model: 'FASTBACK',
    claveGen: 'FIFA25',
    desc: 'La elegancia del diseño coupé combinada con la robustez y espacio de un SUV.',
    version: 'Audace',
    idVersion: 'FIFIFA2501',
    anio: '25'
  },
  {
    brand: 'Fiat',
    model: 'ARGO',
    claveGen: 'ARGO24',
    desc: 'Estilo moderno con amplio espacio y comodidad para cada viaje.',
    version: 'Drive Plus MT',
    idVersion: 'FIARGO2401',
    anio: '24'
  },

  // --- JEEP BRAND ---
  {
    brand: 'Jeep',
    model: 'RENEGADE',
    claveGen: 'RENE25',
    desc: 'Estilo aventurero urbano, dinámico y potente para almas jóvenes.',
    version: 'Sport 1.3L Turbo 6AT',
    idVersion: 'JPRENE2503',
    anio: '25'
  },
  {
    brand: 'Jeep',
    model: 'COMPASS',
    claveGen: 'COMP25',
    desc: 'Diseño audaz y tecnología avanzada híbrida para tu día a día.',
    version: 'Compass Limited Premium 4X2 ATX6 1.3L Turbo',
    idVersion: 'JPCOMP2505',
    anio: '25'
  },
  {
    brand: 'Jeep',
    model: 'COMMANDER',
    claveGen: 'COMM25',
    desc: 'El SUV premium de 3 filas con diseño sofisticado y espacio inteligente.',
    version: 'Overland FWD 6AT 1.3L Turbo',
    idVersion: 'JPCOMM2501',
    anio: '25'
  },
  {
    brand: 'Jeep',
    model: 'CHEROKEE',
    claveGen: 'CHRO26',
    desc: 'Lujo premium legendario, refinamiento y confort en carretera.',
    version: 'Limited 4x4',
    idVersion: 'JPCHRO2601',
    anio: '26'
  },
  {
    brand: 'Jeep',
    model: 'WRANGLER',
    claveGen: 'WRMH24',
    desc: 'El espíritu de libertad todoterreno indiscutible en cualquier terreno.',
    version: 'Unlimited Willys 2.0L Turbo 4x4',
    idVersion: 'JPWRMH2401',
    anio: '24'
  },
  {
    brand: 'Jeep',
    model: 'WRANGLER 4xe',
    claveGen: 'WRPH24',
    desc: 'El espíritu Jeep electrificado, tecnología híbrida todoterreno sin precedentes.',
    version: 'Unlimited Sahara PHEV 2.0L Turbo 4xe',
    idVersion: 'JPWRPH2401',
    anio: '24'
  },
  {
    brand: 'Jeep',
    model: 'JEEP JT',
    claveGen: 'GLAD24',
    desc: 'La pickup todoterreno definitiva con ADN Trail Rated y versatilidad inigualable.',
    version: 'Willys 4X4',
    idVersion: 'JPGLAD2401',
    anio: '24'
  },
  {
    brand: 'Jeep',
    model: 'GRAND CHEROKEE',
    claveGen: 'TCHR24',
    desc: 'Sofisticación sin paralelo con asombroso desempeño en todo camino.',
    version: 'Altitude V6 4x2',
    idVersion: 'JPTCHR2407',
    anio: '24'
  },
  {
    brand: 'Jeep',
    model: 'GRAND CHEROKEE 4xe',
    claveGen: 'GCXE24',
    desc: 'Elegancia superior con propulsión híbrida avanzada.',
    version: '2.0L PHEV',
    idVersion: 'JPGCXE2401',
    anio: '24'
  },
  {
    brand: 'Jeep',
    model: 'GRAND WAGONEER',
    claveGen: 'GRWL26',
    desc: 'La cumbre del confort absoluto y el refinamiento en un SUV de gran tamaño.',
    version: 'L Limited 4x4',
    idVersion: 'JPGRWL2601',
    anio: '26'
  },
  {
    brand: 'Jeep',
    model: 'GRAND WAGONEER L',
    claveGen: 'WGNL24',
    desc: 'Gran Wagoneer Premium extendido, suntuosidad y espacio para viajes idílicos.',
    version: 'Series III 4X4',
    idVersion: 'JPWGNL2401',
    anio: '24'
  },
  {
    brand: 'Jeep',
    model: 'WAGONEER L',
    claveGen: 'WGNR24',
    desc: 'Elegancia majestuosa en formato extendido, viaje sin límites.',
    version: 'Wagoneer L Series III 4X4',
    idVersion: 'JPWGNR2401',
    anio: '24'
  },

  // --- DODGE BRAND ---
  {
    brand: 'Dodge',
    model: 'ATTITUDE',
    claveGen: 'ATTI24',
    desc: 'La economía de combustible superior y el excelente manejo en ciudad.',
    version: 'SE MT',
    idVersion: 'DGATTI2401',
    anio: '24'
  },
  {
    brand: 'Dodge',
    model: 'NEW ATTITUDE',
    claveGen: 'NATT25',
    desc: 'Máxima evolución de diseño del sedán preferido de México.',
    version: 'SXT',
    idVersion: 'DGNATT2501',
    anio: '25'
  },
  {
    brand: 'Dodge',
    model: 'DURANGO',
    claveGen: 'DURA24',
    desc: 'SUV de tres filas con estilo agresivo y potencia deportiva superior.',
    version: 'GT PLUS',
    idVersion: 'DGDURA2401',
    anio: '24'
  },
  {
    brand: 'Dodge',
    model: 'JOURNEY',
    claveGen: 'JOUR24',
    desc: 'Confort, seguridad y espacio moderno para toda la familia.',
    version: 'SXT',
    idVersion: 'DGJOUR2401',
    anio: '24'
  },

  // --- RAM BRAND ---
  {
    brand: 'Ram',
    model: 'RAM 700',
    claveGen: 'R70024',
    desc: 'La pickup compacta líder, versátil, eficiente y lista para cualquier trabajo.',
    version: 'SLT Regular Cab',
    idVersion: 'RMR7002401',
    anio: '24'
  },
  {
    brand: 'Ram',
    model: 'RAM 1200',
    claveGen: '120025',
    desc: 'Excelente capacidad de carga y fuerza de arrastre para el trabajo rudo diario.',
    version: 'Tradesman RC 2.4T 6M/T',
    idVersion: 'RM12002501',
    anio: '25'
  },
  {
    brand: 'Ram',
    model: 'RAM 4000',
    claveGen: 'R400024',
    desc: 'Chasis robusto y versatilidad extrema para configurar tu fuerza de trabajo.',
    version: 'Chasis Plano Corto P V8 5MT 4X2',
    idVersion: 'RMR40002401',
    anio: '24'
  },
  {
    brand: 'Ram',
    model: 'PROMASTER',
    claveGen: 'PROM24',
    desc: 'Máxima capacidad volumétrica y confort de conducción para tu negocio.',
    version: '2500 11.5m3',
    idVersion: 'RMPROM2401',
    anio: '24'
  },
  {
    brand: 'Ram',
    model: 'PROMASTER RAPID',
    claveGen: 'PROR24',
    desc: 'La socia perfecta para entregas rápidas y logística urbana.',
    version: 'Rapid',
    idVersion: 'RMPROR2401',
    anio: '24'
  },
  {
    brand: 'Ram',
    model: 'RAM 1500',
    claveGen: 'CRLM24',
    desc: 'Lujo sin límites, tecnología avanzada y un desempeño legendario y sofisticado.',
    version: '1500 MILD-HYBRID TRADESMAN V6',
    idVersion: 'RMRHTV2401',
    anio: '24'
  },
  {
    brand: 'Ram',
    model: '1500 CLASSIC',
    claveGen: 'RCLS24',
    desc: 'Fuerza legendaria, diseño clásico y confiabilidad incomparable.',
    version: 'Tradesman Crew Cab - V6 8AT 4X2',
    idVersion: 'RMRCLS2401',
    anio: '24'
  },
  {
    brand: 'Ram',
    model: '1500 MILD-HYBRID',
    claveGen: 'RHBV25',
    desc: 'Lujo sofisticado y eficiente, propulsión eTorque Mild Hybrid.',
    version: 'Bighorn V6',
    idVersion: 'RMRHBV2501',
    anio: '25'
  },
  {
    brand: 'Ram',
    model: '2500 HD',
    claveGen: 'CRHD24',
    desc: 'El poder absoluto del trabajo rudo, diseño imponente y arrastre masivo.',
    version: 'Tradesman 6.4L 8A/T',
    idVersion: 'RMCRHD2401',
    anio: '24'
  },
  {
    brand: 'Ram',
    model: '2500 HD LIMITED',
    claveGen: 'HDLI24',
    desc: 'La máxima expresión del lujo premium combinada con poder extremo.',
    version: '6.4L 8A/T RAMBOX',
    idVersion: 'RMHDLI2401',
    anio: '24'
  },
  {
    brand: 'Ram',
    model: 'RAM 2500 POWER WAGON',
    claveGen: 'RMPW24',
    desc: 'La pickup off-road definitiva para terrenos indomables.',
    version: 'HD 6.4L 8A/T',
    idVersion: 'RMRMPW2401',
    anio: '24'
  },

  // --- PEUGEOT BRAND ---
  {
    brand: 'Peugeot',
    model: 'PARTNER',
    claveGen: 'PGPT27',
    desc: 'Excelente capacidad volumétrica y acceso lateral para tu negocio diario.',
    version: 'Partner',
    idVersion: 'PGPART2701',
    anio: '27'
  },
  {
    brand: 'Peugeot',
    model: 'RIFTER',
    claveGen: 'PTRI27',
    desc: 'El espacio y estilo dinámico para las de aventuras en familia.',
    version: 'Allure',
    idVersion: 'PGRIFT2701',
    anio: '27'
  },
  {
    brand: 'Peugeot',
    model: '2008',
    claveGen: 'P20027',
    desc: 'La máxima elegancia y tecnología del SUV compacto con el i-Cockpit®.',
    version: 'Active',
    idVersion: 'PG20082701',
    anio: '27'
  },

  // --- LEAPMOTOR BRAND ---
  {
    brand: 'Leapmotor',
    model: 'B10',
    claveGen: 'LB1027',
    desc: 'Smart SUV 100% eléctrica inteligente con arquitectura global de conectividad.',
    version: 'DESIGN',
    idVersion: 'LMLB102701',
    anio: '27'
  },
  {
    brand: 'Leapmotor',
    model: 'C10',
    claveGen: 'LC1027',
    desc: 'SUV Inteligente de formato mediano con tecnología de confort superior.',
    version: 'DESIGN',
    idVersion: 'LMLC102701',
    anio: '27'
  },
  {
    brand: 'Leapmotor',
    model: 'C16',
    claveGen: 'LC1627',
    desc: 'SUV Familiar Premium de gran tamaño con propulsión 100% eléctrica avanzada.',
    version: 'DESIGN',
    idVersion: 'LMLC162701',
    anio: '27'
  }
];
