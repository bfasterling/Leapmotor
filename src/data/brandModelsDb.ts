/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Import newly generated high-fidelity Jeep images matching the 2026 specifications
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

// Import newly generated high-fidelity RAM images matching the 2026 specifications
import RAM_700_26 from '../assets/images/r70026_img_1780766834372.png';
import RAM_1200_26 from '../assets/images/r120026_img_1780766850090.png';
import RAM_4000_26 from '../assets/images/r400026_img_1780766861825.png';
import RAM_PROMASTER_26 from '../assets/images/prom26_img_1780766873585.png';
import RAM_1500_26 from '../assets/images/rlsh26_img_1780766885810.png';

// Import newly generated high-fidelity Peugeot images matching the 2026-2027 specifications
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
  img: string;          // Model photograph
}

export const BRAND_MODELS_DB: BrandModelInfo[] = [
  // --- FIAT BRAND (SPECIFIC CSV ALIGNMENT) ---
  {
    brand: 'Fiat',
    model: 'PULSE',
    claveGen: 'FPUL25',
    desc: 'Diseño deportivo italiano, confort elevado y tecnología intuitiva.',
    img: FPUL25_IMG
  },
  {
    brand: 'Fiat',
    model: 'PULSE ABARTH',
    claveGen: 'FPAB25',
    desc: 'El temperamento deportivo de pista del escorpión, hecho para la calle.',
    img: FPAB25_IMG
  },
  {
    brand: 'Fiat',
    model: 'FASTBACK',
    claveGen: 'FIFA25',
    desc: 'La elegancia del diseño coupé combinada con la robustez y espacio de un SUV.',
    img: FIFA25_IMG
  },

  // --- JEEP BRAND (UPDATED 2026 JEEP MODEL DATABASE) ---
  {
    brand: 'Jeep',
    model: 'RENEGADE',
    claveGen: 'RENE26',
    desc: 'Estilo aventurero urbano, dinámico y potente para almas jóvenes.',
    img: JEEP_RENEGADE_26
  },
  {
    brand: 'Jeep',
    model: 'COMPASS',
    claveGen: 'COMP26',
    desc: 'Diseño audaz y tecnología avanzada híbrida para tu día a día.',
    img: JEEP_COMPASS_26
  },
  {
    brand: 'Jeep',
    model: 'COMMANDER',
    claveGen: 'COMM26',
    desc: 'El SUV premium de 3 filas con diseño sofisticado y espacio inteligente.',
    img: JEEP_COMMANDER_26
  },
  {
    brand: 'Jeep',
    model: 'CHEROKEE',
    claveGen: 'CHRO26',
    desc: 'Lujo premium legendario, refinamiento y confort en carretera.',
    img: JEEP_CHEROKEE_26
  },
  {
    brand: 'Jeep',
    model: 'WRANGLER',
    claveGen: 'WRMH26',
    desc: 'El espíritu de libertad todoterreno indiscutible en cualquier terreno.',
    img: JEEP_WRANGLER_26
  },
  {
    brand: 'Jeep',
    model: 'JEEP JT',
    claveGen: 'GLAD26',
    desc: 'La pickup todoterreno definitiva con ADN Trail Rated y versatilidad inigualable.',
    img: JEEP_GLADIATOR_26
  },
  {
    brand: 'Jeep',
    model: 'GRAND CHEROKEE',
    claveGen: 'TCHR26',
    desc: 'Sofisticación sin paralelo con asombroso desempeño en todo camino.',
    img: JEEP_GRAND_CHEROKEE_26
  },
  {
    brand: 'Jeep',
    model: 'GRAND WAGONEER',
    claveGen: 'GRWL26',
    desc: 'La cumbre del confort absoluto y el refinamiento en un SUV de gran tamaño.',
    img: JEEP_GRAND_WAGONEER_26
  },

  // --- DODGE BRAND (UPDATED 2026 DODGE MODEL DATABASE) ---
  {
    brand: 'Dodge',
    model: 'NEW ATTITUDE',
    claveGen: 'ATTI26',
    desc: 'La máxima economía de combustible y amplio espacio para el confort urbano.',
    img: DODGE_NEW_ATTITUDE_26
  },
  {
    brand: 'Dodge',
    model: 'DURANGO',
    claveGen: 'DURA26',
    desc: 'SUV de tres filas con estilo agresivo y potencia deportiva superior.',
    img: DODGE_DURANGO_26
  },

  // --- RAM BRAND (UPDATED 2026 RAM MODEL DATABASE) ---
  {
    brand: 'Ram',
    model: 'RAM 700',
    claveGen: 'R70026',
    desc: 'La pickup compacta líder, versátil, eficiente y lista para cualquier trabajo.',
    img: RAM_700_26
  },
  {
    brand: 'Ram',
    model: 'RAM 1200',
    claveGen: '120026',
    desc: 'Excelente capacidad de carga y fuerza de arrastre para el trabajo rudo diario.',
    img: RAM_1200_26
  },
  {
    brand: 'Ram',
    model: 'RAM 4000',
    claveGen: 'R400026',
    desc: 'Chasis robusto y versatilidad extrema para configurar tu fuerza de trabajo.',
    img: RAM_4000_26
  },
  {
    brand: 'Ram',
    model: 'PROMASTER',
    claveGen: 'PROM26',
    desc: 'Máxima capacidad volumétrica y confort de conducción para tu negocio.',
    img: RAM_PROMASTER_26
  },
  {
    brand: 'Ram',
    model: 'RAM 1500',
    claveGen: 'RLSH26',
    desc: 'Lujo sin límites, tecnología avanzada y un desempeño legendario y sofisticado.',
    img: RAM_1500_26
  },

  // --- PEUGEOT BRAND (UPDATED 2026-2027 PEUGEOT MODEL DATABASE) ---
  {
    brand: 'Peugeot',
    model: 'PARTNER',
    claveGen: 'PGPT27',
    desc: 'Excelente capacidad volumétrica y acceso lateral para tu negocio diario.',
    img: PEUGEOT_PARTNER_27
  },
  {
    brand: 'Peugeot',
    model: 'RIFTER',
    claveGen: 'PTRI27',
    desc: 'El espacio y estilo dinámico para las de aventuras en familia.',
    img: PEUGEOT_RIFTER_27
  },
  {
    brand: 'Peugeot',
    model: '2008',
    claveGen: 'P20027',
    desc: 'La máxima elegancia y tecnología del SUV compacto con el i-Cockpit®.',
    img: PEUGEOT_2008_27
  },
  {
    brand: 'Peugeot',
    model: 'PARTNER RAPID',
    claveGen: 'PARP26',
    desc: 'La pickup pequeña pero con gran capacidad y versatilidad.',
    img: PEUGEOT_PARTNER_RAPID_26
  },
  {
    brand: 'Peugeot',
    model: 'NUEVA RIFTER',
    claveGen: 'PTRI26',
    desc: 'La gran evolución de confort y diseño para viajar sin límites.',
    img: PEUGEOT_NUEVA_RIFTER_26
  },
  {
    brand: 'Peugeot',
    model: 'EXPERT',
    claveGen: 'PNEX26',
    desc: 'Equilibrio perfecto de espacio y potencia para el transporte corporativo.',
    img: PEUGEOT_EXPERT_26
  },
  {
    brand: 'Peugeot',
    model: '3008',
    claveGen: 'PSVA26',
    desc: 'Atracción irresistible y el diseño SUV fastback más avanzado.',
    img: PEUGEOT_3008_26
  },
  {
    brand: 'Peugeot',
    model: 'MANAGER',
    claveGen: 'PGRA26',
    desc: 'Poderosa capacidad de carga y eficiencia absoluta en tu logística diaria.',
    img: PEUGEOT_MANAGER_26
  },
  {
    brand: 'Peugeot',
    model: '5008',
    claveGen: 'PTSV26',
    desc: 'El SUV de gran tamaño y tres filas de asientos con refinamiento felino.',
    img: PEUGEOT_5008_26
  },

  // --- LEAPMOTOR BRAND ---
  {
    brand: 'Leapmotor',
    model: 'B10',
    claveGen: 'LB1027',
    desc: 'Smart SUV 100% eléctrica inteligente con arquitectura global de conectividad.',
    img: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=350&q=80'
  }
];

// Helper functions to query the brand database
export function getModelsByBrand(brandName: string): BrandModelInfo[] {
  // Case-insensitive query that matches brand
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
