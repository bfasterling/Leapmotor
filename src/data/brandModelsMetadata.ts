export interface BrandModelMetadata {
  brand: string;        // E.g., 'Fiat', 'Jeep', 'Dodge', 'Ram', 'Peugeot', 'Leapmotor'
  model: string;        // UI Display Name
  claveGen: string;     // Database corporate lookup key
  desc: string;         // Customer-facing description
  version?: string;     // CSV Version (e.g., 'SE MT' or 'GT PLUS')
  idVersion?: string;   // CSV idVersion (e.g., 'DGATTI2401')
  anio?: string;        // CSV Anio (e.g., '24')
  precioLista?: number; // Retail MSRP price in Mexican Pesos
}

export const BRAND_MODELS_METADATA: BrandModelMetadata[] = [
  // --- FIAT BRAND ---
  {
    brand: 'Fiat',
    model: 'FASTBACK',
    claveGen: 'FIFA26',
    desc: 'La elegancia del diseño coupé combina perfectamente con la robustez y comodidad de un SUV.',
    version: 'Impetus',
    idVersion: 'FIFIFA2601',
    anio: '26',
    precioLista: 502900
  },
  {
    brand: 'Fiat',
    model: 'PULSE',
    claveGen: 'FPUL26',
    desc: 'Diseño deportivo italiano, confort elevado y tecnología intuitiva en cada viaje.',
    version: 'Drive',
    idVersion: 'FIFPUL2601',
    anio: '26',
    precioLista: 388900
  },
  {
    brand: 'Fiat',
    model: 'PULSE ABARTH',
    claveGen: 'FPAB26',
    desc: 'El temperamento deportivo de pista del escorpión, hecho para disfrutar en la calle.',
    version: 'Abarth',
    idVersion: 'FIFPAB2601',
    anio: '26',
    precioLista: 512900
  },
  {
    brand: 'Fiat',
    model: 'PULSE ABARTH STRANGER THINGS',
    claveGen: 'PABE26',
    desc: 'Edición exclusiva Stranger Things, diseño retro futurista y potencia deportiva de pista.',
    version: 'Abarth',
    idVersion: 'FIPABE2601',
    anio: '26',
    precioLista: 512000
  },

  // --- JEEP BRAND ---
  {
    brand: 'Jeep',
    model: 'CHEROKEE',
    claveGen: 'CHRO26',
    desc: 'Lujo premium legendario, refinamiento superior y confort para cualquier viaje.',
    version: 'Limited 4x4',
    idVersion: 'JPCHRO2601',
    anio: '26',
    precioLista: 899900
  },
  {
    brand: 'Jeep',
    model: 'COMMANDER',
    claveGen: 'COMM26',
    desc: 'El SUV premium de 3 filas con diseño sofisticado, espacio inteligente y gran comodidad.',
    version: 'Overland FWD 6AT 1.3L Turbo',
    idVersion: 'JPCOMM2601',
    anio: '26',
    precioLista: 766900
  },
  {
    brand: 'Jeep',
    model: 'COMPASS',
    claveGen: 'COMP26',
    desc: 'Diseño audaz y tecnología avanzada híbrida con gran rendimiento para tu día a día.',
    version: 'Limited Premium 4X2 ATX6 1.3L Turbo',
    idVersion: 'JPCOMP2601',
    anio: '26',
    precioLista: 591900
  },
  {
    brand: 'Jeep',
    model: 'GRAND CHEROKEE',
    claveGen: 'TCHR26',
    desc: 'Sofisticación sin paralelo con asombroso desempeño off-road y refinado andar.',
    version: 'Altitude I4 Turbo 4X2',
    idVersion: 'JPTCHR2601',
    anio: '26',
    precioLista: 1189900
  },
  {
    brand: 'Jeep',
    model: 'GRAND WAGONEER',
    claveGen: 'GRWL26',
    desc: 'La cumbre del confort absoluto y el refinamiento en un SUV majestuoso de gran tamaño.',
    version: 'L Limited 4x4',
    idVersion: 'JPGRWL2601',
    anio: '26',
    precioLista: 2150900
  },
  {
    brand: 'Jeep',
    model: 'JEEP JT',
    claveGen: 'GLAD26',
    desc: 'La pickup todoterreno definitiva con ADN Trail Rated y versatilidad inigualable.',
    version: 'Willys 4X4',
    idVersion: 'JPGLAD2601',
    anio: '26',
    precioLista: 1274900
  },
  {
    brand: 'Jeep',
    model: 'RENEGADE',
    claveGen: 'RENE26',
    desc: 'Estilo aventurero urbano, dinámico y potente para almas jóvenes.',
    version: 'Latitude 1.3L Turbo 6AT',
    idVersion: 'JPRENE2601',
    anio: '26',
    precioLista: 496900
  },
  {
    brand: 'Jeep',
    model: 'WRANGLER',
    claveGen: 'WRMH26',
    desc: 'El espíritu de libertad todoterreno indiscutible en cualquier terreno con potencia turbo.',
    version: 'Unlimited Willys 2.0L Turbo 4x4',
    idVersion: 'JPWRUH2601',
    anio: '26',
    precioLista: 1274900
  },

  // --- DODGE BRAND ---
  {
    brand: 'Dodge',
    model: 'DURANGO',
    claveGen: 'DURA26',
    desc: 'SUV de tres filas con estilo agresivo, brutal potencia deportiva y espacio de primera clase.',
    version: '6.2L V8 Hellcat SRT',
    idVersion: 'DGDURA2601',
    anio: '26',
    precioLista: 2174900
  },
  {
    brand: 'Dodge',
    model: 'JOURNEY',
    claveGen: 'JOUR26',
    desc: 'Confort, seguridad y espacio moderno de última tecnología para toda la familia.',
    version: 'SXT',
    idVersion: 'DGJOUR2601',
    anio: '26',
    precioLista: 603900
  },
  {
    brand: 'Dodge',
    model: 'NEW ATTITUDE',
    claveGen: 'ATTI26',
    desc: 'La economía de combustible superior y el excelente manejo en ciudad con gran equipamiento.',
    version: 'SXT',
    idVersion: 'DGATTI2601',
    anio: '26',
    precioLista: 419900
  },

  // --- RAM BRAND ---
  {
    brand: 'Ram',
    model: 'PROMASTER',
    claveGen: 'PROM26',
    desc: 'Máxima capacidad volumétrica, durabilidad extrema e ideal para cualquier negocio.',
    version: '2500 11.5 m3',
    idVersion: 'RMPROM2601',
    anio: '26',
    precioLista: 1044900
  },
  {
    brand: 'Ram',
    model: 'RAM 1200',
    claveGen: '120026',
    desc: 'Excelente capacidad de carga y fuerza de arrastre para el trabajo rudo diario.',
    version: 'Tradesman Chasis Cabina 2.0T 6M/T 4x2',
    idVersion: 'RM12002601',
    anio: '26',
    precioLista: 449900
  },
  {
    brand: 'Ram',
    model: 'RAM 1500',
    claveGen: 'RLSH26',
    desc: 'Lujo, imponente versatilidad y desempeño legendario con tracción 4x4.',
    version: 'Tradesman Crew Cab Turbo 4x4',
    idVersion: 'RMRLSH2601',
    anio: '26',
    precioLista: 1169900
  },
  {
    brand: 'Ram',
    model: 'RAM 4000',
    claveGen: 'R400026',
    desc: 'Chasis robusto y fuerza insustituible para configurar de acuerdo a tu negocio diario.',
    version: 'Chasis Plano Corto P V8 8AT 4X2',
    idVersion: 'RMR40002601',
    anio: '26',
    precioLista: 1029900
  },
  {
    brand: 'Ram',
    model: 'RAM 700',
    claveGen: 'R70026',
    desc: 'La pickup compacta número uno, versátil, eficiente y lista para cualquier entrega.',
    version: 'Tradesman Regular Cab',
    idVersion: 'RMR7002601',
    anio: '26',
    precioLista: 349900
  },

  // --- PEUGEOT BRAND ---
  {
    brand: 'Peugeot',
    model: '2008',
    claveGen: 'P20026',
    desc: 'La máxima elegancia y tecnología del SUV compacto con el Peugeot i-Cockpit®.',
    version: '2008 ALLURE PACK Aut FL',
    idVersion: 'PEP2002601',
    anio: '26',
    precioLista: 510900
  },
  {
    brand: 'Peugeot',
    model: '3008',
    claveGen: 'PSVA26',
    desc: 'Diseño espectacular, audaz y un equipamiento premium que redefine tu estilo de vida.',
    version: 'Nueva 3008 Allure Pack 5p 1.6THP 180hp Aut 6vel',
    idVersion: 'PEPSVA2601',
    anio: '26',
    precioLista: 654900
  },
  {
    brand: 'Peugeot',
    model: '5008',
    claveGen: 'PTSV26',
    desc: 'El gran SUV de 7 plazas que combina versatilidad, elegancia y máximo bienestar.',
    version: 'NUEVA 5008 GT 5p 1.6THP 165hp Aut 6vel',
    idVersion: 'PEPTSV2601',
    anio: '26',
    precioLista: 779900
  },
  {
    brand: 'Peugeot',
    model: 'EXPERT',
    claveGen: 'PNEX26',
    desc: 'Vehículo comercial de gran durabilidad con la mayor eficiencia diésel en su categoría.',
    version: 'EXPERT FURGON 4p 2.0HDI 150hp Man 6vel FL SC',
    idVersion: 'PEPNEX2602',
    anio: '26',
    precioLista: 690900
  },
  {
    brand: 'Peugeot',
    model: 'MANAGER',
    claveGen: 'PGRA26',
    desc: 'La van de gran tamaño ideal para logística pesada, confort de marcha y durabilidad.',
    version: 'MANAGER FURGON L2H2 5p 2.2HDI 138hp Man 6Vel FL',
    idVersion: 'PEPGRA2601',
    anio: '26',
    precioLista: 827900
  },
  {
    brand: 'Peugeot',
    model: 'NUEVA RIFTER',
    claveGen: 'PTRI26',
    desc: 'Aventurera por naturaleza, optimizada con 7 plazas para máximo espacio.',
    version: 'RIFTER ALLURE PACK 5p 1.6HDI 90hp Man 5Vel 7PL FL',
    idVersion: 'PEPTRI2601',
    anio: '26',
    precioLista: 469900
  },
  {
    brand: 'Peugeot',
    model: 'PARTNER',
    claveGen: 'PGPT26',
    desc: 'Excelente capacidad volumétrica y acceso cómodo lateral para el trabajo productivo diario.',
    version: 'MAXI 5p 1.6HDI 90hp Man 5Vel FL 4 Airbags',
    idVersion: 'PEPGPT2601',
    anio: '26',
    precioLista: 443900
  },
  {
    brand: 'Peugeot',
    model: 'PARTNER RAPID',
    claveGen: 'PARP26',
    desc: 'La aliada ideal para logística urbana compacta, sumamente ágil y robusta.',
    version: '4p 1.3 FireFly 97hp Man 5Vel',
    idVersion: 'PEPARP2601',
    anio: '26',
    precioLista: 338400
  },
  {
    brand: 'Peugeot',
    model: 'RIFTER',
    claveGen: 'PTRI27',
    desc: 'El espacio y estilo robusto ideal para las de aventuras diarias en todas las rutas.',
    version: 'ALLURE PACK 1.6L Diésel 90hp MT5 FL',
    idVersion: 'PEPTRI2701',
    anio: '27',
    precioLista: 473900
  },

  // --- LEAPMOTOR BRAND ---
  {
    brand: 'Leapmotor',
    model: 'B10',
    claveGen: 'LB1027',
    desc: 'Smart SUV 100% eléctrica inteligente con arquitectura global de conectividad.',
    version: 'DESIGN',
    idVersion: 'LMLB102701',
    anio: '27',
    precioLista: 999000
  },
  {
    brand: 'Leapmotor',
    model: 'C10',
    claveGen: 'LC1027',
    desc: 'SUV Inteligente de formato mediano con tecnología de confort superior.',
    version: 'DESIGN',
    idVersion: 'LMLC102701',
    anio: '27',
    precioLista: 999000
  },
  {
    brand: 'Leapmotor',
    model: 'C16',
    claveGen: 'LC1627',
    desc: 'SUV Familiar Premium de gran tamaño con propulsión 100% eléctrica avanzada.',
    version: 'DESIGN',
    idVersion: 'LMLC162701',
    anio: '27',
    precioLista: 999000
  }
];
