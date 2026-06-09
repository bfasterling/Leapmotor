/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Import newly generated high-fidelity Jeep images matching the specifications
import JEEP_RENEGADE_26 from '../assets/images/rene26_img_1780766111067.png';
import JEEP_COMPASS_26 from '../assets/images/comp26_img_1780766127103.png';
import JEEP_COMMANDER_26 from '../assets/images/comm26_img_1780766138766.png';
import JEEP_CHEROKEE_26 from '../assets/images/chro26_img_1780766151284.png';
import JEEP_WRANGLER_26 from '../assets/images/wrmh26_img_1780766163440.png';
import JEEP_GLADIATOR_26 from '../assets/images/glad26_img_1780766174857.png';
import JEEP_GRAND_CHEROKEE_26 from '../assets/images/tchr26_img_1780766187618.png';
import JEEP_GRAND_WAGONEER_26 from '../assets/images/grwl26_img_1780766200696.png';

// Import newly generated high-fidelity Fiat images
import FIFA25_IMG from '../assets/images/fifa25_img_1780765331412.png';
import FPAB25_IMG from '../assets/images/fpab25_img_1780765345796.png';
import FPUL25_IMG from '../assets/images/fpul25_img_1780765359774.png';

// Import newly generated high-fidelity Dodge images
import DODGE_NEW_ATTITUDE_26 from '../assets/images/atti26_img_1780766639870.png';
import DODGE_DURANGO_26 from '../assets/images/dura26_img_1780766655347.png';

// Import newly generated high-fidelity RAM images matching the specifications
import RAM_700_26 from '../assets/images/r70026_img_1780766834372.png';
import RAM_1200_26 from '../assets/images/r120026_img_1780766850090.png';
import RAM_4000_26 from '../assets/images/r400026_img_1780766861825.png';
import RAM_PROMASTER_26 from '../assets/images/prom26_img_1780766873585.png';
import RAM_1500_26 from '../assets/images/rlsh26_img_1780766885810.png';

// Import newly generated high-fidelity Peugeot images matching the specifications
import PEUGEOT_PARTNER_27 from '../assets/images/pgpt27_img_1780767108136.png';
import PEUGEOT_RIFTER_27 from '../assets/images/ptri27_img_1780767119616.png';
import PEUGEOT_2008_27 from '../assets/images/p20027_img_1780767131886.png';
import PEUGEOT_PARTNER_RAPID_26 from '../assets/images/parp26_img_1780767143669.png';
import PEUGEOT_NUEVA_RIFTER_26 from '../assets/images/ptri26_img_1780767155554.png';
import PEUGEOT_EXPERT_26 from '../assets/images/pnex26_img_1780767167222.png';
import PEUGEOT_3008_26 from '../assets/images/psva26_img_1780767178761.png';
import PEUGEOT_MANAGER_26 from '../assets/images/pgra26_img_1780767190869.png';
import PEUGEOT_5008_26 from '../assets/images/ptsv26_img_1780767209886.png';

export interface BrandModelInfo {
  brand: string;        // E.g., 'Fiat', 'Jeep', 'Dodge', 'Ram', 'Peugeot', 'Leapmotor'
  model: string;        // UI Display Name
  claveGen: string;     // Database corporate lookup key
  desc: string;         // Customer-facing description
  img: string;          // Model photograph illustration
  version?: string;     // CSV Version (e.g., 'SE MT' or 'GT PLUS')
  idVersion?: string;   // CSV idVersion (e.g., 'DGATTI2401')
  anio?: string;        // CSV Anio (e.g., '24')
  precioLista?: number; // Retail MSRP price in Mexican Pesos
}

export const BRAND_MODELS_DB: BrandModelInfo[] = [
  // --- FIAT BRAND ---
  {
    brand: 'Fiat',
    model: 'FASTBACK',
    claveGen: 'FIFA26',
    desc: 'La elegancia del diseño coupé combina perfectamente con la robustez y comodidad de un SUV.',
    img: FIFA25_IMG,
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
    img: FPUL25_IMG,
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
    img: FPAB25_IMG,
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
    img: FPAB25_IMG,
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
    img: JEEP_CHEROKEE_26,
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
    img: JEEP_COMMANDER_26,
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
    img: JEEP_COMPASS_26,
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
    img: JEEP_GRAND_CHEROKEE_26,
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
    img: JEEP_GRAND_WAGONEER_26,
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
    img: JEEP_GLADIATOR_26,
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
    img: JEEP_RENEGADE_26,
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
    img: JEEP_WRANGLER_26,
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
    img: DODGE_DURANGO_26,
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
    img: DODGE_DURANGO_26,
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
    img: DODGE_NEW_ATTITUDE_26,
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
    img: RAM_PROMASTER_26,
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
    img: RAM_1200_26,
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
    img: RAM_1500_26,
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
    img: RAM_4000_26,
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
    img: RAM_700_26,
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
    img: PEUGEOT_2008_27,
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
    img: PEUGEOT_3008_26,
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
    img: PEUGEOT_5008_26,
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
    img: PEUGEOT_EXPERT_26,
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
    img: PEUGEOT_MANAGER_26,
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
    img: PEUGEOT_NUEVA_RIFTER_26,
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
    img: PEUGEOT_PARTNER_27,
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
    img: PEUGEOT_PARTNER_RAPID_26,
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
    img: PEUGEOT_RIFTER_27,
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
    img: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=350&q=80',
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
    img: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=350&q=80',
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
    img: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=350&q=80',
    version: 'DESIGN',
    idVersion: 'LMLC162701',
    anio: '27',
    precioLista: 999000
  }
];

// Helper functions to query the brand database
export function getModelsByBrand(brandName: string): BrandModelInfo[] {
  const searchBrand = brandName.toLowerCase();
  return BRAND_MODELS_DB.filter(
    (item) => item.brand.toLowerCase() === searchBrand
  );
}

export function getModelNamesByBrand(brandName: string): string[] {
  return getModelsByBrand(brandName).map((item) => item.model);
}

export function getModelByClaveGen(claveGen: string): BrandModelInfo | undefined {
  return BRAND_MODELS_DB.find(
    (item) => item.claveGen.toUpperCase() === claveGen.toUpperCase()
  );
}

export function getModelByBrandAndName(brandName: string, modelName: string): BrandModelInfo | undefined {
  const searchBrand = brandName.toLowerCase();
  const searchModel = modelName.toLowerCase();
  return BRAND_MODELS_DB.find(
    (item) => item.brand.toLowerCase() === searchBrand && item.model.toLowerCase() === searchModel
  );
}
