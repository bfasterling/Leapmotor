/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { LeadStatus } from '../types';
import { 
  Sparkles, 
  Car, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  CheckCircle, 
  ArrowRight, 
  Info, 
  Zap, 
  ShieldCheck, 
  BatteryCharging,
  Settings,
  Eye,
  ChevronDown,
  ArrowLeft,
  ChevronRight,
  Tag,
  FileText,
  Key,
  MessageSquare,
  Calendar,
  Compass,
  Map,
  Layers,
  Award,
  Cpu,
  Route,
  Star,
  Wrench,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import LeapmotorLogo from './LeapmotorLogo';
import StellantisLogo from './StellantisLogo';
import { PRIVACY_TEXT_ES } from '../privacyText';
import { ALL_DEALERS } from '../data/dealers';

// Import newly generated design assets
import LEAPMOTOR_TUNNEL_BG from '../assets/images/leapmotor_b10_tunnel_bg_1780692970544.png';
import JEEP_IMG from '../assets/images/jeep_cherokee_green_1780407967325.png';
import JEEP_COMMANDER_IMG from '../assets/images/jeep_commander_1780440413653.png';
import JEEP_COMPASS_IMG from '../assets/images/jeep_compass_1780440426004.png';
import JEEP_GRAND_CHEROKEE_IMG from '../assets/images/jeep_grand_cherokee_1780440437533.png';
import JEEP_GRAND_WAGONEER_IMG from '../assets/images/jeep_grand_wagoneer_1780440449247.png';
import JEEP_JT_IMG from '../assets/images/jeep_jt_1780440462196.png';
import JEEP_RENEGADE_IMG from '../assets/images/jeep_renegade_1780440473660.png';
import STELLANTIS_IMG from '../assets/images/stellantis_multibrand_1780407983016.png';
import CARPA_MAP_IMG from '../assets/images/stellantis_carpa_map_1780431196502.png';

const MEX_STATES = [
  'Aguascalientes',
  'Baja California',
  'Baja California Sur',
  'Campeche',
  'Chiapas',
  'Chihuahua',
  'Coahuila',
  'Colima',
  'Ciudad de México (CDMX)',
  'Durango',
  'Estado de México',
  'Guanajuato',
  'Guerrero',
  'Hidalgo',
  'Jalisco',
  'Michoacán',
  'Morelos',
  'Nayarit',
  'Nuevo León',
  'Oaxaca',
  'Puebla',
  'Querétaro',
  'Quintana Roo',
  'San Luis Potosí',
  'Sinaloa',
  'Sonora',
  'Tabasco',
  'Tamaulipas',
  'Tlaxcala',
  'Veracruz',
  'Yucatán',
  'Zacatecas'
];

const STATE_DISTRIBUTORS: Record<string, string[]> = {
  'Aguascalientes': ['Leapmotor Aguascalientes'],
  'Baja California': ['Leapmotor Tijuana', 'Leapmotor Mexicali'],
  'Baja California Sur': ['Leapmotor Tijuana'],
  'Campeche': ['Leapmotor Puebla Angelópolis'],
  'Chiapas': ['Leapmotor Puebla Angelópolis'],
  'Chihuahua': ['Leapmotor Chihuahua'],
  'Coahuila': ['Leapmotor Saltillo'],
  'Colima': ['Leapmotor Colima', 'Leapmotor Manzanillo'],
  'Ciudad de México (CDMX)': [
    'Leapmotor Santa Fe',
    'Leapmotor Viaducto'
  ],
  'Durango': ['Leapmotor Chihuahua'],
  'Estado de México': [
    'Leapmotor Cuautitlán',
    'Leapmotor Coacalco',
    'Leapmotor Zaragoza',
    'Leapmotor Lázaro Cárdenas',
    'Leapmotor Naucalpan',
    'Leapmotor Camino Real'
  ],
  'Guanajuato': ['Leapmotor Celaya'],
  'Guerrero': ['Leapmotor Cuernavaca'],
  'Hidalgo': ['Leapmotor Pachuca'],
  'Jalisco': ['Leapmotor Acueducto'],
  'Michoacán': ['Leapmotor Morelia'],
  'Morelos': ['Leapmotor Cuernavaca'],
  'Nayarit': ['Leapmotor Acueducto'],
  'Nuevo León': [
    'Leapmotor Lindavista',
    'Leapmotor Valle Oriente',
    'Leapmotor San Pedro'
  ],
  'Oaxaca': ['Leapmotor Puebla Angelópolis'],
  'Puebla': ['Leapmotor Puebla Angelópolis', 'Leapmotor Puebla Serdán'],
  'Querétaro': ['Leapmotor Querétaro'],
  'Quintana Roo': ['Leapmotor Puebla Angelópolis'],
  'San Luis Potosí': ['Leapmotor Querétaro'],
  'Sinaloa': ['Leapmotor Chihuahua'],
  'Sonora': ['Leapmotor Mexicali'],
  'Tabasco': ['Leapmotor Puebla Angelópolis'],
  'Tamaulipas': ['Leapmotor Saltillo'],
  'Tlaxcala': ['Leapmotor Puebla Serdán'],
  'Veracruz': ['Leapmotor Puebla Angelópolis'],
  'Yucatán': ['Leapmotor Puebla Angelópolis'],
  'Zacatecas': ['Leapmotor Aguascalientes']
};

const CDMX_DISTRIBUTORS = [
  'Leapmotor Santa Fe',
  'Leapmotor Viaducto'
];

// Group vehicle options by brand
const BRAND_MODELS: Record<string, string[]> = {
  'Leapmotor': ['B10'],
  'Jeep': ['Commander', 'Compass', 'Grand Cherokee', 'Grand Wagoneer', 'Jeep JT', 'Renegade'],
  'Ram': ['1500', '2500', 'Rampage'],
  'Dodge': ['Charger', 'Durango', 'Attitude'],
  'Fiat': ['Pulse', 'Fastback', '500e'],
  'Peugeot': ['2008', '3008', 'Landtrek']
};

const MODEL_DETAILS: Record<string, Record<string, { name: string; desc: string; img: string }>> = {
  'Leapmotor': {
    'B10': {
      name: 'Leapmotor B10',
      desc: 'Smart SUV 100% eléctrica inteligente',
      img: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=350&q=80'
    }
  },
  'Jeep': {
    'Commander': {
      name: 'Jeep Commander',
      desc: 'El SUV premium de 3 filas con diseño sofisticado y espacio inteligente',
      img: JEEP_COMMANDER_IMG
    },
    'Compass': {
      name: 'Jeep Compass',
      desc: 'Diseño audaz y tecnología avanzada híbrida para tu día a día',
      img: JEEP_COMPASS_IMG
    },
    'Grand Cherokee': {
      name: 'Grand Cherokee L',
      desc: 'Lujo legendario, refinamiento y tres filas de asientos con tracción 4x4',
      img: JEEP_GRAND_CHEROKEE_IMG
    },
    'Grand Wagoneer': {
      name: 'Grand Wagoneer',
      desc: 'La cumbre del lujo todoterreno de Jeep con diseño imponente',
      img: JEEP_GRAND_WAGONEER_IMG
    },
    'Jeep JT': {
      name: 'Jeep JT Gladiator',
      desc: 'La pickup todoterreno definitiva con ADN Trail Rated y techo desmontable',
      img: JEEP_JT_IMG
    },
    'Renegade': {
      name: 'Jeep Renegade',
      desc: 'Estilo aventurero urbano, dinámico y potente para almas jóvenes',
      img: JEEP_RENEGADE_IMG
    }
  },
  'Ram': {
    '1500': {
      name: 'Ram 1500 Limited',
      desc: 'Poder, lujo y refinamiento sin límites',
      img: 'https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?w=350&q=80'
    },
    '2500': {
      name: 'Ram 2500 Heavy Duty',
      desc: 'Fuerza extrema impulsada por Cummins',
      img: 'https://images.unsplash.com/photo-1590333742459-7151121df0c1?w=350&q=80'
    },
    'Rampage': {
      name: 'Ram Rampage Laramie',
      desc: 'Crossover pick-up ágil e innovadora',
      img: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=350&q=80'
    }
  },
  'Dodge': {
    'Charger': {
      name: 'Charger Daytona SRT',
      desc: 'Concepto de poder eléctrico americano',
      img: 'https://images.unsplash.com/photo-1612462225418-4a946df41c19?w=350&q=80'
    },
    'Durango': {
      name: 'Durango SRT Hellcat',
      desc: 'Estilo agresivo con desempeño de pista',
      img: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=350&q=80'
    },
    'Attitude': {
      name: 'Dodge Attitude SXT',
      desc: 'Máxima economía y amplio confort urbano',
      img: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=350&q=80'
    }
  },
  'Fiat': {
    'Pulse': {
      name: 'Fiat Pulse Abarth',
      desc: 'Diseño deportivo italiano con temperamento de pista',
      img: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=350&q=80'
    },
    'Fastback': {
      name: 'Fiat Fastback Audace',
      desc: 'Silhouette SUV coupé con herencia dinámica',
      img: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=350&q=80'
    },
    '500e': {
      name: 'Fiat 500e Icon',
      desc: 'El ícono italiano renace 100% eléctrico',
      img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=350&q=80'
    }
  },
  'Peugeot': {
    '2008': {
      name: 'Peugeot 2008',
      desc: 'SUV compacto con estilo felino e i-Cockpit® de vanguardia.',
      img: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=350&q=80'
    },
    '3008': {
      name: 'Peugeot 3008',
      desc: 'La máxima expresión del SUV tecnológico premium híbrido.',
      img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=350&q=80'
    },
    'Landtrek': {
      name: 'Peugeot Landtrek',
      desc: 'Pickup robusta con imponente capacidad de carga y tracción.',
      img: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=350&q=80'
    }
  }
};

const SUB_BRAND_DETAILS: Record<string, {
  name: string;
  modelName: string;
  tagline: string;
  bgImage: string;
  pantoneHex: string;
  accentBg: string; // gradient overlay background
  btnBg: string;   // button background
  btnBorder: string; // button border
  highlights: { title: string; desc: string }[];
}> = {
  'Leapmotor': {
    name: 'Leapmotor',
    modelName: 'LEAPMOTOR B10',
    tagline: 'MOVILIDAD INTELIGENTE, TECNOLOGÍA EN CADA CARGA.',
    bgImage: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&q=80',
    pantoneHex: '#035F1D',
    accentBg: 'from-[#035F1D]/90 via-[#035F1D]/35 to-[#2D2926]/40',
    btnBg: 'bg-[#035F1D] hover:bg-[#009100]',
    btnBorder: 'border-[#035F1D]/35',
    highlights: [
      { title: 'Tecnología 100% Eléctrica', desc: 'Sistemas inteligentes de propulsión de alta eficiencia cero emisiones.' },
      { title: 'Conectividad Inteligente', desc: 'Cabina inmersiva integrada con control remoto y seguridad ADAS avanzada.' },
      { title: 'Tranquilidad Sin Límites', desc: 'Respaldo robusto de refacciones y red de distribución Stellantis.' }
    ]
  },
  'Jeep': {
    name: 'Jeep',
    modelName: 'JEEP GRAND CHEROKEE',
    tagline: 'LEYENDA TODOTERRENO, AVENTURA EN CADA CAMINO.',
    bgImage: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=600&q=80',
    pantoneHex: '#1E2A22',
    accentBg: 'from-[#1E2A22]/90 via-[#1E2A22]/35 to-[#050706]/10',
    btnBg: 'bg-[#1E2A22] hover:bg-[#324538]',
    btnBorder: 'border-[#1E2A22]/30',
    highlights: [
      { title: 'Poder de Tracción 4x4', desc: 'Capacidad de vadeo y control de tracción legendarios en cualquier superficie.' },
      { title: 'Refinamiento Premium', desc: 'Asientos de piel premium y espacios amplios con acabados de alta calidad.' },
      { title: 'Sistemas ADAS Avanzados', desc: 'Control de crucero adaptativo y prevención de colisión frontal activa.' }
    ]
  },
  'Fiat': {
    name: 'Fiat',
    modelName: 'FIAT FASTBACK',
    tagline: 'ESTILO DEPORTIVO, DISEÑO ITALIANO EN CADA DETALLE.',
    bgImage: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=600&q=80',
    pantoneHex: '#C8102E',
    accentBg: 'from-[#C8102E]/85 via-[#C8102E]/25 to-[#0b0102]/10',
    btnBg: 'bg-[#C8102E] hover:bg-[#eb2c4b]',
    btnBorder: 'border-[#C8102E]/25',
    highlights: [
      { title: 'Diseño Italiano Compacto', desc: 'Estética europea audaz y gran agilidad para moverte con estilo por la ciudad.' },
      { title: 'Eficiencia de Combustible', desc: 'Motores Firefly altamente eficientes que combinan gran respuesta con bajo consumo.' },
      { title: 'Pantalla Táctil Uconnect', desc: 'Conectividad inalámbrica compatible con Apple CarPlay y Android Auto de serie.' }
    ]
  },
  'Dodge': {
    name: 'Dodge',
    modelName: 'DODGE CHARGER',
    tagline: 'MÚSCULO AMERICANO, ADRENALINA EN CADA ARRANQUE.',
    bgImage: 'https://images.unsplash.com/photo-1612462225418-4a946df41c19?auto=format&fit=crop&w=600&q=80',
    pantoneHex: '#DA291C',
    accentBg: 'from-[#DA291C]/85 via-[#DA291C]/25 to-[#0c0202]/10',
    btnBg: 'bg-[#DA291C] hover:bg-[#f63d2f]',
    btnBorder: 'border-[#DA291C]/25',
    highlights: [
      { title: 'Espíritu de Muscle Car', desc: 'Desempeño brutal, aceleración emocionante y actitud imponente en las calles.' },
      { title: 'Tecnología SRT Hellcat', desc: 'Enfoque deportivo con componentes de pista para máxima respuesta y agarre.' },
      { title: 'Espacio y Agresividad', desc: 'El balance perfecto entre un diseño amenazante y el espacio de carga inteligente.' }
    ]
  },
  'Peugeot': {
    name: 'Peugeot',
    modelName: 'PEUGEOT 3008',
    tagline: 'DISEÑO FELINO, VANGUARDIA EN CADA KILÓMETRO.',
    bgImage: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80',
    pantoneHex: '#041E42',
    accentBg: 'from-[#041E42]/90 via-[#041E42]/25 to-[#01060e]/10',
    btnBg: 'bg-[#041E42] hover:bg-[#072f66]',
    btnBorder: 'border-[#041E42]/25',
    highlights: [
      { title: 'Diseño Felino Exclusivo', desc: 'Líneas afiladas, firma luminosa de colmillos LED y un perfil de vanguardia estética.' },
      { title: 'Cabina Peugeot i-Cockpit®', desc: 'Puesto de conducción envolvente, volante compacto y cuadro de instrumentos elevado.' },
      { title: 'Ingeniería Europea', desc: 'Chasis dinámico de respuesta precisa para una experiencia de manejo inigualable.' }
    ]
  },
  'Ram': {
    name: 'RAM',
    modelName: 'RAM 1500',
    tagline: 'FUERZA, LUJO Y CAPACIDAD EN CADA CAMINO.',
    bgImage: 'https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?auto=format&fit=crop&w=600&q=80',
    pantoneHex: '#2D2926',
    accentBg: 'from-[#1A1A1A]/95 via-[#1A1A1A]/35 to-[#1c1c1c]/10',
    btnBg: 'bg-[#2D2926] hover:bg-[#3f3a35]',
    btnBorder: 'border-[#2D2926]/20',
    highlights: [
      { title: 'Desempeño Trabajo rudo', desc: 'Suspensión trasera multilink con resortes para un andar ultra confortable sin sacrificar carga.' },
      { title: 'Lujo en Cada Rincón', desc: 'Pantalla vertical de 12 pulgadas, acabados premium y sistema de audio de alta fidelidad.' },
      { title: 'Capacidad Legendaria', desc: 'Chasis de acero de alta resistencia diseñado para remolcar y cargar con total holgura.' }
    ]
  }
};

interface LeadFormProps {
  c10ImgUrl: string;
  t03ImgUrl: string;
  b10ImgUrl: string;
}

export default function LeadForm({ c10ImgUrl, t03ImgUrl, b10ImgUrl }: LeadFormProps) {
  // Experience selector: 'leapmotor' | 'jeep' | 'multimarca'
  const [activeLanding, setActiveLanding] = useState<'leapmotor' | 'jeep' | 'multimarca'>('leapmotor');
  
  // Multimarca active brand
  const [selectedBrand, setSelectedBrand] = useState<string>('Leapmotor');
  const [selectedSubBrand, setSelectedSubBrand] = useState<string | null>(null);

  // Modal displays states
  const [showStellantisMap, setShowStellantisMap] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);

  // Form registration parameters
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    phone: '',
    postalCode: '',
    state: 'Ciudad de México (CDMX)',
    distributor: 'Leapmotor Santa Fe',
    modelOfInterest: 'B10',
    contactMethod: 'whatsapp',
    testDriveDate: '',
    requestType: 'asesor' as 'cotizacion' | 'prueba' | 'asesor'
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formActive, setFormActive] = useState(false); // false = landing sheet, true = form sheet
  const [registeredLeadId, setRegisteredLeadId] = useState('');
  const [errorText, setErrorText] = useState('');

  // Interactive Map Event Callout Section for Jeep Landing
  const [activeJeepEventSpot, setActiveJeepEventSpot] = useState<string>('track');

  // Privacy Policy Acceptance and Display State
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [showPrivacyText, setShowPrivacyText] = useState(false);

  // Renders premium, responsive vector brand logos for the Multimarca experience
  const renderBrandLogo = (brandName: string, isSelected: boolean, isLarge?: boolean) => {
    const activeColor = isLarge
      ? 'text-white'
      : (isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-100');
    
    switch (brandName) {
      case 'Leapmotor':
        return (
          <div className="flex flex-col items-center justify-center w-full px-0.5" id="brand-logo-leapmotor">
            <svg 
              viewBox="0 0 250 42" 
              className={`w-full ${isLarge ? 'max-w-[200px] sm:max-w-[245px] h-10 sm:h-12' : 'max-w-[105px] sm:max-w-[125px] h-6.5 sm:h-7.5'} fill-current ${activeColor} transition-all duration-300`} 
              xmlns="http://www.w3.org/2000/svg"
            >
              <g transform="translate(18, 0)" fill="currentColor">
                {/* LP Monogram Emblem */}
                <path d="M 0,10 L 10.5,1 L 22.5,1 L 22.5,7 L 13,7 L 7.5,12.5 L 7.5,23.5 L 13,29 L 22.5,29 L 22.5,35 L 10.5,35 L 0,26 Z" />
                <path d="M 16.5,7 L 22.5,7 L 22.5,29 L 16.5,29 Z" opacity="0.8" />
                {/* Modern futuristic text track and style */}
                <text x="36" y="27" className="font-sans font-extrabold tracking-[0.24em] text-[20px]" style={{ fontWeight: 800 }}>LEAPMOTOR</text>
              </g>
            </svg>
          </div>
        );
      case 'Jeep':
        return (
          <div className="flex flex-col items-center justify-center w-full px-0.5" id="brand-logo-jeep">
            <svg 
              viewBox="0 0 120 40" 
              className={`w-full ${isLarge ? 'max-w-[110px] sm:max-w-[130px] h-9 sm:h-11' : 'max-w-[62px] sm:max-w-[72px] h-6 sm:h-7'} fill-current ${activeColor} transition-all duration-300`} 
              xmlns="http://www.w3.org/2000/svg"
            >
              <g fill="currentColor" transform="translate(26, 0)">
                <path d="M 12,2 L 12,22 C 12,25.5 10.5,27 8,27 C 5.5,27 4.2,25.5 4.2,22 L 4.2,18.5 H 0 V 22 C 0,27.5 3,31 8,31 C 13,31 16.2,27.5 16.2,22 L 16.2,2 H 12 Z M 29.5,12.5 C 24,12.5 21,17.5 21,22 C 21,26.5 24,31 29.5,31 C 33.5,31 36.2,29 36.5,25.5 H 32 C 31.7,26.5 31,27 30,27 C 29,27 28.5,26.2 28.5,24.5 H 37 C 37,17.5 34.5,12.5 29.5,12.5 Z M 44.5,12.5 C 39,12.5 36,17.5 36,22 C 36,26.5 39,31 44.5,31 C 48.5,31 51.2,29 51.5,25.5 H 47 C 46.7,26.5 46,27 45,27 C 44,27 43.5,26.2 43.5,24.5 H 52 C 52,17.5 49.5,12.5 44.5,12.5 Z M 60,12.5 C 57.5,12.5 55.5,13.8 54.5,15.5 V 13 H 50 V 36.5 H 54.5 V 26.5 C 55.5,28.2 57.5,29.5 60,29.5 C 64.5,29.5 68,25 68,21 C 68,17 64.5,12.5 60,12.5 Z M 29.5,16.5 C 31,16.5 31.5,17.5 31.5,19 H 27.5 C 27.5,17.5 28,16.5 29.5,16.5 Z M 44.5,16.5 C 46,16.5 46.5,17.5 46.5,19 H 42.5 C 42.5,17.5 43,16.5 44.5,16.5 Z M 59,16.5 C 61,16.5 62,18 62,21.5 C 62,25 61,26.5 59,26.5 C 57,26.5 56,25 56,21.5 C 56,18 57,16.5 59,16.5 Z" />
              </g>
            </svg>
          </div>
        );
      case 'Ram':
        return (
          <div className="flex flex-col items-center justify-center w-full px-0.5" id="brand-logo-ram">
            <svg 
              viewBox="0 0 220 54" 
              className={`w-full ${isLarge ? 'max-w-[160px] sm:max-w-[200px] h-10 sm:h-12' : 'max-w-[110px] sm:max-w-[130px] h-7 sm:h-8'} fill-current ${activeColor} transition-all duration-300`} 
              xmlns="http://www.w3.org/2000/svg"
            >
              <g transform="translate(13, 0)">
                <g transform="translate(1, 4)" className="fill-current">
                  <path d="M29.8 1.5c-7.2 0-14.4 3.1-18.8 8.4-4.4 5.3-5.8 12.3-4 19.3 1.2 4.7 3.9 8.8 7.6 11.8 1.4-1.2 2-2.8 1.4-4.5-1.1-2.9-2.7-7-2.7-10.7 0-4.3 3.6-7.8 8.1-7.8s8.1 3.5 8.1 7.8c0 4.1-1.6 8.5-3.1 11.2-1.1 2-2.8 3.5-3.1 5.5-.3 2.1 1.2 3.9 3.2 3.9s3.5-1.8 3.5-3.9v-6.7c0-1.8 1-3.3 2.5-4.1l2.5-1.3c1.5-.8 2.5-2.3 2.5-4.1v-6.1c0-4.3 3.6-7.8 8.1-7.8s8.1 3.5 8.1 7.8c0 3.7-1.6 7.8-2.7 10.7-.6 1.7 0 3.3 1.4 4.5 3.7-3 6.4-7.1 7.6-11.8 1.8-7 .4-14-4-19.3-4.4-5.3-11.6-8.4-18.8-8.4z" />
                  <path d="M29.8 16.5c-4-.8-8.2.8-10.3 4.1l6.2 12.4H34l6.2-12.4c-2.1-3.3-6.4-4.9-10.4-4.1z" />
                  <path d="M23.6 37l6.2 11.2 6.2-11.2c-3.1.8-9.3.8-12.4 0z" />
                </g>
                <g fill="currentColor" transform="translate(72, 8)">
                  <path d="M8 4h18a7 7 0 0 1 7 7v3a7 7 0 0 1-5 6.7l6 10.3h-8.5l-5.5-10.3H16v10.3H8V4zm8 7v6h9a3 3 0 0 0 0-6H16z" />
                  <path d="M40 4h14l8 27h-8.5l-2-7h-8l-2 7H33L40 4zm6.5 5l-2.5 8h5.5l-3-8z" />
                  <path d="M68 4h9l5.5 16l5.5-16h9v27h-8V12l-6.5 19H81l-6.5-19v19H68V4z" />
                </g>
              </g>
            </svg>
          </div>
        );
      case 'Dodge':
        return (
          <div className="flex flex-col items-center justify-center w-full px-0.5" id="brand-logo-dodge">
            <svg 
              viewBox="0 0 200 40" 
              className={`w-full ${isLarge ? 'max-w-[180px] sm:max-w-[210px] h-10 sm:h-12' : 'max-w-[100px] sm:max-w-[115px] h-6.5 sm:h-7.5'} ${activeColor} transition-all duration-300`} 
              xmlns="http://www.w3.org/2000/svg"
            >
              <g transform="translate(10, 0)">
                <g fill="currentColor">
                  {/* D */}
                  <path d="M 10,11 H 24 A 9,9 0 0 1 33,20 V 20 A 9,9 0 0 1 24,29 H 10 Z M 16,14.5 V 25.5 H 23 A 4,4 0 0 0 27,21.5 V 18.5 A 4,4 0 0 0 23,14.5 Z" />
                  {/* O */}
                  <path d="M 44,11 H 48 A 9,9 0 0 1 57,20 V 20 A 9,9 0 0 1 48,29 H 44 A 9,9 0 0 1 35,20 V 20 A 9,9 0 0 1 44,11 Z M 44,14.5 A 4,4 0 0 0 40,18.5 V 21.5 A 4,4 0 0 0 44,25.5 H 48 A 4,4 0 0 0 52,21.5 V 18.5 A 4,4 0 0 0 48,14.5 Z" />
                  {/* D */}
                  <path d="M 58,11 H 72 A 9,9 0 0 1 81,20 V 20 A 9,9 0 0 1 72,29 H 58 Z M 64,14.5 V 25.5 H 71 A 4,4 0 0 0 75,21.5 V 18.5 A 4,4 0 0 0 71,14.5 Z" />
                  {/* G */}
                  <path d="M 92,11 H 96 A 9,9 0 0 1 105,20 V 20 A 9,9 0 0 1 96,29 H 92 A 9,9 0 0 1 83,20 V 20 A 9,9 0 0 1 92,11 Z M 92,14.5 C 90,14.5 89,16 89,18.5 V 21.5 C 89,24 90,25.5 92,25.5 H 96 V 21.5 H 93 V 18.5 H 100 V 25.5 C 100,27 99,29 96,29 H 92 C 89,29 88,27 88,25.5 V 21.5 C 88,18.5 89,14.5 92,14.5 Z" />
                  {/* E */}
                  <path d="M 109,11 H 125 V 15 H 115 V 18 H 123 V 21 H 115 V 25 H 125 V 29 H 109 Z" />
                </g>
                <g transform="translate(142, 6) scale(1.15)" fill="none" stroke="#DA291C" strokeWidth="2" strokeLinejoin="round">
                  <polygon points="12,1 23,20 1,20" strokeLinejoin="miter" strokeWidth="2.4" />
                  <polygon points="12,4 20,18.5 4,18.5" opacity="0.6" strokeWidth="1" />
                  <polygon points="12,7 17,16 7,16" className="text-red-500" fill="#DA291C" />
                </g>
              </g>
            </svg>
          </div>
        );
      case 'Fiat':
        return (
          <div className="flex flex-col items-center justify-center w-full px-0.5" id="brand-logo-fiat">
            <svg 
              viewBox="0 0 120 40" 
              className={`w-full ${isLarge ? 'max-w-[110px] sm:max-w-[130px] h-10 sm:h-12' : 'max-w-[55px] sm:max-w-[65px] h-6 sm:h-7'} fill-current ${activeColor} transition-all duration-300`} 
              xmlns="http://www.w3.org/2000/svg"
            >
              <g fill="currentColor" transform="translate(23.5, 0)">
                <path d="M 12,2 L 23,2 L 23,6 L 17.5,6 L 17.5,16 L 22.5,16 L 22.5,20 L 17.5,20 L 17.5,38 L 12,38 Z" />
                <path d="M 27,2 L 32.5,2 L 32.5,38 L 27,38 Z" />
                <path d="M 36.5,2 L 47.5,2 L 53.5,38 L 47.5,38 L 46.2,30 L 41,30 L 39.8,38 L 33.8,38 Z M 43.6,12 L 45.2,25.5 L 41.8,25.5 Z" />
                <path d="M 57,2 L 73,2 L 73,6 L 67.8,6 L 67.8,38 L 62.2,38 L 62.2,6 L 57,6 Z" />
              </g>
            </svg>
          </div>
        );
      case 'Peugeot':
        return (
          <div className="flex items-center justify-center w-full px-0.5" id="brand-logo-peugeot">
            <svg 
              viewBox="0 0 100 110" 
              className={`w-full ${isLarge ? 'max-w-[70px] sm:max-w-[85px] h-14 sm:h-16' : 'max-w-[42px] sm:max-w-[50px] h-9 sm:h-10'} fill-current ${activeColor} transition-all duration-300`} 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M 50,2 C 78,2 96,8 96,28 C 96,55 90,83 50,108 C 10,83 4,55 4,28 C 4,8 22,2 50,2 Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
              <path d="M 50,6 C 74,6 91,11 91,29 C 91,53 85,79 50,102 C 15,79 9,53 9,29 C 9,11 26,6 50,6 Z" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
              <text x="50" y="21" textAnchor="middle" className="font-sans text-[7.5px]" style={{ fontWeight: 800, letterSpacing: '0.22em' }} fill="currentColor">PEUGEOT</text>
              <line x1="20" y1="26" x2="80" y2="26" stroke="currentColor" strokeWidth="1.2" />
              <g transform="translate(16, 26) scale(0.68)" fill="currentColor">
                <path d="M 50,7 C 46,12 40,15 36,12 C 32,9 26,4 20,4 C 18,7 20,11 18,14 C 15,14 12,11 10,8 C 7,12 8,17 12,20 C 13,21 12,22 10,23 C 8,24 5,23 2,21 C 2,26 6,30 11,31 C 15,32 18,29 20,27 C 18,31 15,36 10,38 C 12,42 16,42 20,40 C 23,38 24,33 25,32 M 50,7 C 54,12 55,20 52,28 C 50,32 46,36 41,38 C 36,40 31,41 27,42 M 52,28 C 58,26 64,28 66,35 C 68,42 64,50 56,54 C 48,58 38,58 30,55 C 24,52 20,47 22,43 C 24,39 28,39 31,42 C 33,44 33,47 31,50 M 56,54 C 54,60 48,66 40,68 C 32,70 24,67 18,62 C 14,58 12,52 14,48 M 41,38 C 43,45 40,52 35,55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M 45,21 Q 48,15 44,11 M 36,25 Q 40,25 41,20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </g>
            </svg>
          </div>
        );
      default:
        return <span className="font-black text-xs">{brandName}</span>;
    }
  };

  // Switch between landing modules effortlessly
  const handleLandingSwitch = (target: 'leapmotor' | 'jeep' | 'multimarca') => {
    setActiveLanding(target);
    setFormActive(false);
    setSuccess(false);
    setSelectedSubBrand(null);
    setPrivacyAccepted(false);
    setShowPrivacyText(false);
    
    // Clear dynamic states
    if (target === 'leapmotor') {
      setSelectedBrand('Leapmotor');
      setFormData(prev => ({ ...prev, modelOfInterest: 'B10' }));
    } else if (target === 'jeep') {
      setSelectedBrand('Jeep');
      setFormData(prev => ({ ...prev, modelOfInterest: 'Grand Cherokee' }));
    } else if (target === 'multimarca') {
      setSelectedBrand('Leapmotor');
      setFormData(prev => ({ ...prev, modelOfInterest: 'B10' }));
    }
  };

  useEffect(() => {
    const host = window.location.hostname.toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);
    const landingParam = searchParams.get('landing') || searchParams.get('campaign') || searchParams.get('site');
    
    if (landingParam === 'jeep' || host.startsWith('jeep')) {
      handleLandingSwitch('jeep');
    } else if (landingParam === 'multimarca' || host.startsWith('multimarca') || host.startsWith('stellantis')) {
      handleLandingSwitch('multimarca');
    } else if (landingParam === 'leapmotor' || host.startsWith('leapmotor')) {
      handleLandingSwitch('leapmotor');
    }
  }, []);

  // Update selected state and distributor automatically based on landing selection or brand selection
  useEffect(() => {
    if (activeLanding === 'leapmotor') {
      setFormData(prev => ({
        ...prev,
        state: 'Ciudad de México (CDMX)',
        distributor: 'Leapmotor Santa Fe'
      }));
    } else {
      const activeBrandKey = activeLanding === 'jeep' ? 'JEEP' : selectedBrand.toUpperCase();
      const brandDealers = ALL_DEALERS.filter(d => d.brand === activeBrandKey).length > 0
        ? ALL_DEALERS.filter(d => d.brand === activeBrandKey)
        : ALL_DEALERS;
      
      const availableStates = Array.from(new Set(brandDealers.map(d => d.state))).sort();
      
      // Attempt to stay with previously selected state if it exists for this brand, otherwise default to "CIUDAD DE MÉXICO" or first
      const defaultState = availableStates.includes(formData.state) 
        ? formData.state 
        : (availableStates.includes('CIUDAD DE MÉXICO') ? 'CIUDAD DE MÉXICO' : (availableStates[0] || ''));
      
      const dealersInState = brandDealers.filter(d => d.state === defaultState);
      const defaultDealer = dealersInState[0]?.name || '';

      setFormData(prev => ({
        ...prev,
        state: defaultState,
        distributor: defaultDealer
      }));
    }
  }, [activeLanding, selectedBrand]);

  const handleBrandSelect = (brand: string) => {
    setSelectedBrand(brand);
    // Auto-select first model of selected brand
    const models = BRAND_MODELS[brand] || [];
    setFormData(prev => ({ ...prev, modelOfInterest: models[0] || '' }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const cleaned = value.replace(/[^0-9+\s-]/g, '');
      setFormData(prev => ({ ...prev, [name]: cleaned }));
    } else if (name === 'state') {
      const distributorsForState = STATE_DISTRIBUTORS[value] || [];
      const firstDistributor = distributorsForState[0] || 'Leapmotor Distribuidor Digital';
      setFormData(prev => ({ ...prev, state: value, distributor: firstDistributor }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Helper to dynamically get clean and fully reset form parameters
  const getInitialFormData = (
    landing: 'leapmotor' | 'jeep' | 'multimarca',
    brand: string,
    presetModel?: string,
    reqType: 'cotizacion' | 'prueba' | 'asesor' = 'asesor'
  ) => {
    let defaultState = 'Ciudad de México (CDMX)';
    let defaultDistributor = 'Leapmotor Santa Fe';

    if (landing !== 'leapmotor') {
      const activeBrandKey = landing === 'jeep' ? 'JEEP' : brand.toUpperCase();
      const brandDealers = ALL_DEALERS.filter(d => d.brand === activeBrandKey).length > 0
        ? ALL_DEALERS.filter(d => d.brand === activeBrandKey)
        : ALL_DEALERS;
      
      const availableStates = Array.from(new Set(brandDealers.map(d => d.state))).sort();
      defaultState = availableStates.includes('CIUDAD DE MÉXICO') 
        ? 'CIUDAD DE MÉXICO' 
        : (availableStates[0] || '');
      
      const dealersInState = brandDealers.filter(d => d.state === defaultState);
      defaultDistributor = dealersInState[0]?.name || '';
    }

    return {
      name: '',
      lastName: '',
      email: '',
      phone: '',
      postalCode: '',
      state: defaultState,
      distributor: defaultDistributor,
      modelOfInterest: presetModel || (landing === 'leapmotor' ? 'B10' : (brand === 'Jeep' ? 'Grand Cherokee' : BRAND_MODELS[brand]?.[0] || 'Grand Cherokee')),
      contactMethod: 'whatsapp',
      testDriveDate: '',
      requestType: reqType
    };
  };

  // Launch Form sheet instantly from landing CTA clicks
  const launchFormWithRequest = (reqType: 'cotizacion' | 'prueba' | 'asesor', presetModel?: string) => {
    setFormData(getInitialFormData(activeLanding, selectedBrand, presetModel, reqType));
    setPrivacyAccepted(false);
    setShowPrivacyText(false);
    setFormActive(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault && e.preventDefault();
    setLoading(true);
    setErrorText('');

    if (!privacyAccepted) {
      setErrorText('DEBE ACEPTAR EL AVISO DE PRIVACIDAD PARA CONTINUAR.');
      setLoading(false);
      return;
    }

    const isLeapmotorLanding = activeLanding === 'leapmotor';
    const isDistributorRequired = !isLeapmotorLanding;

    if (!formData.name.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.postalCode.trim() || !formData.state.trim() || (isDistributorRequired && !formData.distributor.trim())) {
      setErrorText('Por favor ingresa todos los campos obligatorios (*).');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setErrorText('Por favor ingresa un correo electrónico válido.');
      setLoading(false);
      return;
    }

    if (formData.postalCode.trim().length !== 5) {
      setErrorText('El Código Postal debe ser de exactamente 5 dígitos.');
      setLoading(false);
      return;
    }

    if (formData.requestType === 'prueba' && !formData.testDriveDate) {
      setErrorText('Por favor selecciona una fecha válida para tu prueba de manejo.');
      setLoading(false);
      return;
    }

    try {
      // 1. Fetch sales advisors from Firestore 'advisors' collection
      let activeAdvisors: any[] = [];
      try {
        const advSnap = await getDocs(collection(db, 'advisors'));
        advSnap.forEach((docSnap) => {
          const advData = docSnap.data();
          if (advData.active !== false) {
            activeAdvisors.push({ id: docSnap.id, ...advData });
          }
        });
      } catch (advErr) {
        console.error("Error reading advisors, using fallbacks:", advErr);
      }

      // If no advisors configured in database yet, seed default active advisors instantly
      if (activeAdvisors.length === 0) {
        const defaultAdvisors = [
          { id: 'ADV-01', name: 'Arturo Stellantis', email: 'arturo@leapmotor.com', password: '123', distributor: 'Leapmotor Santa Fe', active: true },
          { id: 'ADV-02', name: 'Belinda Leap', email: 'belinda@leapmotor.com', password: '123', distributor: 'Leapmotor Santa Fe', active: true },
          { id: 'ADV-03', name: 'Carlos Galería', email: 'carlos@leapmotor.com', password: '123', distributor: 'Leapmotor Viaducto', active: true }
        ];
        try {
          for (const s of defaultAdvisors) {
            await setDoc(doc(db, 'advisors', s.id), {
              name: s.name,
              email: s.email,
              password: s.password,
              distributor: s.distributor,
              active: s.active,
              createdAt: new Date()
            });
          }
          activeAdvisors = defaultAdvisors;
        } catch (seedErr) {
          console.error("Failed to seed fallback advisors:", seedErr);
          activeAdvisors = defaultAdvisors; // static fallback
        }
      }

      // 2. Query all existing leads to count each advisor's waiting leads
      let minWaitingAdvisor = activeAdvisors[0];
      try {
        const leadsSnap = await getDocs(collection(db, 'leads'));
        const advisorWaitingMap: Record<string, number> = {};
        
        activeAdvisors.forEach(a => {
          advisorWaitingMap[a.id] = 0;
        });

        leadsSnap.forEach(lSnap => {
          const lData = lSnap.data();
          if (lData.status === LeadStatus.WAITING && lData.advisorId && advisorWaitingMap[lData.advisorId] !== undefined) {
            advisorWaitingMap[lData.advisorId]++;
          }
        });

        // Select the advisor with the least waiting leads (minimum count)
        let minCount = Infinity;
        activeAdvisors.forEach(a => {
          const count = advisorWaitingMap[a.id];
          if (count < minCount) {
            minCount = count;
            minWaitingAdvisor = a;
          }
        });
      } catch (leadsErr) {
        console.error("Error counting waiting workloads, defaulting to random or first:", leadsErr);
      }

      const leadsCol = collection(db, 'leads');
      const newLeadDoc = doc(leadsCol);
      const leadId = newLeadDoc.id;

      const cleanEmail = formData.email.trim().toLowerCase();

      const payload = {
        name: formData.name.trim(),
        lastName: formData.lastName.trim(),
        email: cleanEmail,
        phone: formData.phone.trim(),
        postalCode: formData.postalCode.trim() || null,
        state: formData.state,
        distributor: activeLanding === 'leapmotor' ? 'Sin Asignar (Sincronizando con Asesor)' : formData.distributor,
        modelOfInterest: formData.modelOfInterest,
        contactMethod: formData.contactMethod,
        requestType: formData.requestType,
        status: LeadStatus.WAITING,
        advisorId: formData.requestType === 'cotizacion' ? "" : minWaitingAdvisor.id,
        advisorName: formData.requestType === 'cotizacion' ? "Sin Asignar (Solo Cotización)" : minWaitingAdvisor.name,
        createdAt: serverTimestamp(),
        // New features parameters
        landing: activeLanding,
        selectedBrand: activeLanding === 'multimarca' ? selectedBrand : (activeLanding === 'jeep' ? 'Jeep' : 'Leapmotor'),
        testDriveDate: formData.requestType === 'prueba' ? formData.testDriveDate : null
      };

      await setDoc(newLeadDoc, payload);
      setRegisteredLeadId(leadId);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setErrorText('Error al registrar sus datos. Conexión de red inestable.');
      try {
        handleFirestoreError(err, OperationType.CREATE, 'leads');
      } catch (formattedErr) {}
    } finally {
      setLoading(false);
    }
  };

  // Get active brand based on landing or selection
  const activeBrandKey = activeLanding === 'jeep' ? 'JEEP' : selectedBrand.toUpperCase();
  
  // Filter dealers. Fallback to all dealers if activeBrandKey is empty or not found in CSV (e.g. Leapmotor or Peugeot)
  const activeDealers = ALL_DEALERS.filter(d => d.brand === activeBrandKey).length > 0
    ? ALL_DEALERS.filter(d => d.brand === activeBrandKey)
    : ALL_DEALERS;

  // Get list of states from activeDealers
  const availableStates = Array.from(new Set(activeDealers.map(d => d.state))).sort();

  // Get dealers in the currently selected state, fully deduplicated by name to prevent duplication, and sorted alphabetically
  const stateDealers = activeDealers.filter(d => d.state === formData.state);
  const filteredDealers = stateDealers
    .filter((d, idx) => stateDealers.findIndex(x => x.name === d.name) === idx)
    .sort((a, b) => a.name.localeCompare(b.name));

  // Determine standard dropdown models list for selection
  const activeModelsList = BRAND_MODELS[selectedBrand] || BRAND_MODELS['Leapmotor'];

  // Theme details based on active landing site
  const getThemeColors = () => {
    if (activeLanding === 'jeep') {
      return {
        accent: 'bg-emerald-600',
        hoverAccent: 'hover:bg-emerald-500',
        bgPill: 'bg-emerald-950/40 border-emerald-500/20',
        textAccent: 'text-emerald-400',
        borderAccent: 'border-emerald-500',
        btnBg: 'bg-[#1e4a2f] hover:bg-[#255d3b]',
        successGradient: 'from-emerald-400 to-green-300',
        thankYouBadge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
      };
    }
    if (activeLanding === 'multimarca') {
      return {
        accent: 'bg-indigo-600',
        hoverAccent: 'hover:bg-indigo-500',
        bgPill: 'bg-indigo-950/40 border-indigo-500/20',
        textAccent: 'text-indigo-400',
        borderAccent: 'border-indigo-500',
        btnBg: 'bg-[#4338ca] hover:bg-[#4f46e5]',
        successGradient: 'from-indigo-400 to-purple-300',
        thankYouBadge: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
      };
    }
    return {
      accent: 'bg-[#035F1D]',
      hoverAccent: 'hover:bg-[#009100]',
      bgPill: 'bg-[#035F1D]/20 border-[#009100]/30',
      textAccent: 'text-[#009100]',
      borderAccent: 'border-[#009100]/40',
      btnBg: 'bg-[#deff01] hover:bg-[#c9e600] text-slate-950 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(222,255,1,0.35)] transition-all duration-300',
      successGradient: 'from-[#035F1D] to-[#009100]',
      thankYouBadge: 'bg-[#009100]/10 text-[#009100] border border-[#009100]/25'
    };
  };

  const theme = getThemeColors();

  // Dynamic input styling based on active branding (Leapmotor Pantone 2427C #035F1D and Highlight #009100)
  const rowClass = activeLanding === 'leapmotor'
    ? 'space-y-1 bg-[#035F1D]/10 p-2.5 rounded-xl border border-[#009100]/25 hover:border-[#deff01]/40 hover:bg-[#035F1D]/15 transition-all duration-350'
    : 'space-y-1 bg-slate-900/60 p-2.5 rounded-xl border border-white/15 hover:border-white/20 transition-all duration-350';

  const inputClass = activeLanding === 'leapmotor'
    ? 'w-full bg-[#2D2926] border border-[#deff01] focus:border-[#deff01] focus:ring-1 focus:ring-[#deff01]/40 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none transition font-semibold font-sans'
    : (activeLanding === 'jeep'
       ? 'w-full bg-[#0a0f18] border border-white/20 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/40 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-400 outline-none transition font-semibold'
       : 'w-full bg-[#0a0f18] border border-white/25 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/40 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-400 outline-none transition font-semibold');

  return (
    <div className="w-full text-slate-100 flex flex-col justify-start items-center" id="landing-page-view">
      
      {/* Outer Mobile Mock Wrapper with Pantone 2427C and Highlight R0 G145 B0 theme */}
      <div 
        style={activeLanding === 'leapmotor' && !formActive ? {
          backgroundImage: `url(${LEAPMOTOR_TUNNEL_BG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : undefined}
        className={`w-full max-w-md mx-auto min-h-[82vh] border rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col justify-between mt-1 mb-6 transition-all duration-500 ${
          activeLanding === 'leapmotor'
            ? 'bg-black border-[#009100]/40 shadow-[0_0_35px_rgba(0,145,0,0.25)]'
            : 'bg-[#05070a] border-white/10'
        }`}
      >
        
        {/* Subtle Decorative Auras tailored by theme */}
        {activeLanding === 'leapmotor' ? null : (
          <>
            <div className={`absolute top-20 left-12 w-60 h-60 ${activeLanding === 'jeep' ? 'bg-emerald-600/5' : (activeLanding === 'multimarca' ? 'bg-indigo-600/5' : 'bg-blue-600/10')} blur-[80px] rounded-full pointer-events-none -translate-x-1/2`} />
            <div className={`absolute bottom-20 right-12 w-60 h-60 ${activeLanding === 'jeep' ? 'bg-teal-600/5' : (activeLanding === 'multimarca' ? 'bg-purple-600/5' : 'bg-purple-600/10')} blur-[80px] rounded-full pointer-events-none translate-x-1/2`} />
          </>
        )}

        {/* Brand Header */}
        <div 
          style={{ paddingBottom: '0px' }}
          className={`px-6 ${activeLanding === 'leapmotor' ? 'py-1 border-b border-white/5 relative z-10' : 'py-4 bg-[#05070a]/90 border-b border-white/5 relative z-10'} flex ${activeLanding === 'multimarca' || activeLanding === 'leapmotor' ? 'justify-center' : 'justify-between'} items-center backdrop-blur-md sticky top-0 z-25`}
        >
          {activeLanding === 'leapmotor' && (
            <div className="flex items-center justify-center w-full max-w-full">
              <LeapmotorLogo 
                size="sm" 
                className="text-white mx-auto" 
                style={{ height: 'clamp(65px, 16vw, 136px)', aspectRatio: 'auto', maxWidth: '100%', width: 'auto' }} 
                imgStyle={{ height: 'clamp(65px, 16vw, 136px)', width: 'auto', objectFit: 'contain' }} 
              />
            </div>
          )}

          {activeLanding === 'jeep' && (
            <>
              <div className="flex items-center gap-2 py-1">
                <Compass className="w-4.5 h-4.5 text-emerald-400 animate-spin-slow" />
                <svg role="img" viewBox="0 0 24 24" className="w-[50px] sm:w-[60px] h-auto fill-slate-100 transition-colors duration-300" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.1651 7.1687v5.2011c0 .6762-.444 1.0777-1.1628 1.0777-.7185 0-1.0992-.5283-1.0992-1.0992v-.9299H0v.9514c0 .972.296 2.7068 3.0235 2.7068 2.7272 0 3.1082-1.8614 3.1082-2.7488V7.1687Zm4.9177 2.1562c-1.7973 0-2.6003 1.6485-2.6003 3.0657 0 1.4168.9094 2.7912 2.7695 2.7912 1.6285.021 2.707-1.0361 2.707-1.8187h-1.7977s-.2113.5078-.8458.5078c-.6343 0-.9934-.3596-.9934-1.2265h3.6576c0-2.7277-1.3526-3.3195-2.897-3.3195zm5.8471 0c-1.7968 0-2.6007 1.6485-2.6007 3.0657 0 1.4168.9094 2.7912 2.7705 2.7912 1.628.021 2.7067-1.0361 2.7067-1.8187h-1.7978s-.2116.5078-.8454.5078c-.6348 0-.9942-.3596-.9942-1.2265h3.6574c0-2.7277-1.3523-3.3195-2.8965-3.3195zm6.7435.0635c-.9132 0-1.3186.4962-1.3401.522-.1283.1538-.2875.3165-.2875-.0782v-.2959h-1.8193v7.295h1.8398V14.822c0-.148.1478-.126.2543 0 .1063.1277.5711.4443 1.3752.4443C23.155 15.2663 24 13.9978 24 12.264c0-2.2415-1.4162-2.8757-2.3266-2.8756Zm-12.401 1.1203c.6766 0 .972.5073.972 1.0365H8.3843c0-.5718.2327-1.0365.8882-1.0365zm5.8468 0c.6767 0 .9724.5073.9724 1.0365H14.231c0-.5718.2332-1.0365.8883-1.0365zm5.9204.296c.9318 0 1.1.7189 1.1 1.4593 0 .74-.1272 1.7124-1.0141 1.7124-.8884 0-1.1212-.5709-1.1017-1.6486.022-1.0788.4441-1.523 1.0158-1.523zm2.2813 4.5664a.5855.5855 0 0 0-.5856.5857c0 .3233.2617.5856.5856.5856.3218 0 .585-.2623.585-.5856 0-.3233-.2632-.5857-.585-.5857zm0 .062a.524.524 0 0 1 .5236.5237c0 .2884-.2346.5246-.5236.5246a.5258.5258 0 0 1-.525-.5246c0-.289.2352-.5236.525-.5236zm-.2108.2024v.6208h.0725v-.2689h.1764l.1159.269h.0806l-.1216-.2873c.0386-.0133.0514-.0227.072-.0447.0266-.0287.0434-.0739.0434-.115 0-.1034-.0796-.174-.195-.174zm.0705.0676h.1722c.072 0 .1177.041.1177.1045 0 .072-.0485.1168-.1278.1168h-.1621z" />
              </svg>
            </div>
            <span className="text-[10px] font-black font-mono text-emerald-400 tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded font-bold uppercase">G. Cherokee</span>
          </>
        )}

          {activeLanding === 'multimarca' && (
            <div className="flex items-center justify-center py-2 h-14">
              <StellantisLogo size="md" color="#ffffff" style={{ height: '51px' }} />
            </div>
          )}
        </div>

        {/* Content Sheets (Landing / Form / Success) */}
        <AnimatePresence mode="wait">
          
          {/* STEP 1: LANDINGS SHEETS */}
          {!formActive && !success && (
            <motion.div
              key={`${activeLanding}-sheet`}
              style={{ paddingTop: '0px', marginLeft: '0px', marginTop: '0px' }}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className={`px-6 ${activeLanding === 'leapmotor' ? 'pt-1 pb-3 gap-2.5 relative z-10' : 'py-4 gap-4 relative z-10'} flex flex-col justify-start flex-1`}
            >
              {/* LEAPMOTOR LANDING VIEW - Professional Presentation Deck Layout */}
              {activeLanding === 'leapmotor' && (
                <div className="space-y-4 text-center mt-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[12px] font-black tracking-[0.25em] text-[#deff01] uppercase block animate-pulse">
                      Tranquilidad sin límites
                    </span>
                    <h1 className="leading-tight font-sans">
                      <span className="text-[#deff01] font-extrabold text-4xl tracking-tighter inline-block drop-shadow-[0_2px_10px_rgba(222,255,1,0.15)] uppercase">
                        INCREÍBLE
                      </span>{' '}
                      <span className="text-white font-extrabold text-4xl tracking-tighter inline-block drop-shadow-[0_2px_10px_rgba(222,255,1,0.15)] uppercase">
                        TODOS LOS DIAS
                      </span>
                      <br />
                      <span className="text-[#deff01] font-extrabold text-4xl tracking-tighter inline-block mt-1.5 drop-shadow-[0_2px_10px_rgba(222,255,1,0.15)]">
                        LEAPMOTOR B10
                      </span>
                    </h1>
                    
                    <p 
                      style={activeLanding === 'leapmotor' ? { fontFamily: 'Montserrat', fontSize: '13px', color: '#ffffff' } : undefined}
                      className="text-slate-200 text-xs font-semibold max-w-xs mx-auto leading-relaxed mt-2.5"
                    >
                      LEAPMOTOR te da confianza y seguridad para tu camino. Una marca con más de 85 años de respaldo en México
                    </p>
                  </div>

                  {/* Move highlights grid and dual CTA buttons lower into the bottom layout */}
                  <div className="mt-auto space-y-5 pt-10 pb-2">
                    {/* Highlights Grid matching Slide 2 details with Pantone 2427C & Highlight Green theme */}
                    <div 
                      style={{ paddingTop: '6px', marginTop: '-14px' }}
                      className="grid grid-cols-3 gap-2 py-4 border-y border-[#deff01]/20"
                    >
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-9 h-9 rounded-full bg-[#deff01]/10 border border-[#deff01]/30 flex items-center justify-center text-[#deff01] shadow-inner transition duration-300">
                          <Cpu className="w-4.5 h-4.5 text-[#deff01]" />
                        </div>
                        <span className="text-[10px] text-slate-100 font-extrabold leading-tight font-sans uppercase text-center max-w-[85px]">Tecnología Ultra Híbrida</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-9 h-9 rounded-full bg-[#deff01]/10 border border-[#deff01]/30 flex items-center justify-center text-[#deff01] shadow-inner transition duration-300">
                          <Route className="w-4.5 h-4.5 text-[#deff01]" />
                        </div>
                        <span className="text-[10px] text-slate-100 font-extrabold leading-tight font-sans uppercase text-center max-w-[85px]">Autonomía hasta 990 Kms</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-9 h-9 rounded-full bg-[#deff01]/10 border border-[#deff01]/30 flex items-center justify-center text-[#deff01] shadow-inner transition duration-300">
                          <Wrench className="w-4.5 h-4.5 text-[#deff01]" />
                        </div>
                        <span className="text-[10px] text-slate-100 font-extrabold leading-tight font-sans uppercase text-center max-w-[85px]">Respaldo de Mopar</span>
                      </div>
                    </div>

                    {/* Dual CTA Buttons customized with Pantone 2427C as base & Highlight R0 G145 B0 online */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => launchFormWithRequest('cotizacion', 'B10')}
                        className="bg-[#035F1D] hover:bg-[#009100] text-white font-extrabold py-3.5 px-4 rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-95 shadow-lg shadow-[#035F1D]/30 border border-[#009100]/30"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span style={{ fontSize: '13px' }}>Cotizar</span>
                      </button>
                      <button
                        onClick={() => launchFormWithRequest('asesor', 'B10')}
                        className="bg-[#deff01] hover:bg-[#c9e600] text-slate-950 font-extrabold py-3.5 px-4 rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-95 shadow-lg shadow-[rgba(222,255,1,0.25)] border border-[#deff01]/40"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                        <span style={{ fontSize: '13px' }}>Atención VIP</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* JEEP EXPERIENTIAL LANDING VIEW */}
              {activeLanding === 'jeep' && (
                <div className="space-y-4 text-center mt-1">
                  
                  <p className="text-white text-xs font-semibold max-w-xs mx-auto leading-relaxed">
                    La leyenda todoterreno, rediseñada con motorización Hemi-Hybrid de máxima potencia. Desafía el asfalto.
                  </p>

                  {/* Cherokee Image Asset */}
                  <div className="relative aspect-[16/10] my-1 select-none overflow-hidden rounded-2xl border border-emerald-500/30 group bg-slate-900/35 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                    <img 
                      src={JEEP_IMG} 
                      alt="Jeep Cherokee 2026"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-2xl transform transition-transform duration-700 brightness-[1.25] contrast-[1.08] saturate-[1.1]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#05070a]/60 via-transparent to-transparent opacity-40" />
                  </div>

                  {/* Highlights Row */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-emerald-500/10">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Compass className="w-3.5 h-3.5 text-emerald-300" />
                      </div>
                      <span className="text-[8px] text-white font-bold uppercase font-mono">Terrain 4x4</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Zap className="w-3.5 h-3.5 text-emerald-300" />
                      </div>
                      <span className="text-[8px] text-white font-bold uppercase font-mono">Hemi-Hybrid</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Award className="w-3.5 h-3.5 text-emerald-300" />
                      </div>
                      <span className="text-[8px] text-white font-bold uppercase font-mono">Trail Rated</span>
                    </div>
                  </div>

                  {/* Three CTA buttons including personalized maps */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => launchFormWithRequest('cotizacion', 'Grand Cherokee')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 px-4 rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-95 shadow-md shadow-emerald-500/10 col-span-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Cotización</span>
                    </button>
                    <button
                      onClick={() => launchFormWithRequest('prueba', 'Grand Cherokee')}
                      className="bg-[#0f1012] hover:bg-slate-900 text-slate-200 border border-emerald-500/30 hover:border-emerald-500/60 font-extrabold py-3.5 px-4 rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-95 col-span-1"
                    >
                      <Key className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Prueba de Manejo</span>
                    </button>

                    <button
                      onClick={() => setShowStellantisMap(true)}
                      className="bg-gradient-to-r from-amber-600/20 to-indigo-600/20 hover:from-amber-600/30 hover:to-indigo-600/30 text-amber-300 border border-amber-500/40 hover:border-amber-400 font-extrabold py-3 px-4 rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-95 col-span-2 shadow-lg shadow-black/30"
                    >
                      <Map className="w-3.5 h-3.5 text-amber-400" />
                      <span>Atención Personalizada (Ver Ubicación Carpa)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STELLANTIS MULTIBRAND LANDING VIEW */}
              {activeLanding === 'multimarca' && (
                <div className="space-y-4 mt-1">
                  
                  {selectedSubBrand === null ? (
                    <>
                      {/* Main Multimarca Brands Selector view */}
                      <div className="text-center py-2">
                        <h1 className="text-lg sm:text-xl font-bold tracking-[0.16em] text-white uppercase font-encode leading-normal">
                          ELIGE LA MARCA DE TU INTERÉS
                        </h1>
                      </div>

                      {/* Stacked Brand boxes (All identical size, stacked vertically, centering the brand logos) */}
                      <div className="flex flex-col gap-2.5 pt-1">
                        {['Leapmotor', 'Jeep', 'Fiat', 'Dodge', 'Peugeot', 'Ram'].map((brand) => {
                          return (
                            <button
                              key={brand}
                              onClick={() => {
                                handleBrandSelect(brand);
                                setSelectedSubBrand(brand);
                              }}
                              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 hover:bg-slate-900/85 hover:border-white/20 h-22 sm:h-24 w-full flex items-center justify-center select-none transition-all duration-300 transform active:scale-[0.99] shadow-lg shadow-black/20"
                            >
                              {/* Centralized Brand Logo */}
                              <div className="z-10 flex items-center justify-center w-full px-8 pointer-events-none transition-transform duration-300 group-hover:scale-[1.03]">
                                {renderBrandLogo(brand, true, true)}
                              </div>
                              
                              {/* Right arrow interactive indicator */}
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 opacity-60 group-hover:opacity-100 group-hover:bg-white/10 group-hover:text-white transition-all duration-300 shrink-0">
                                <ArrowRight className="w-4 h-4" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    /* Exclusive Brand details subpage view - Mimics the Mockup precisely */
                    (() => {
                      const brandDetailSource = SUB_BRAND_DETAILS[selectedSubBrand] || SUB_BRAND_DETAILS['Leapmotor'];
                      const brandDetail = {
                        ...brandDetailSource,
                        bgImage: selectedSubBrand === 'Leapmotor'
                          ? (b10ImgUrl || brandDetailSource.bgImage)
                          : (selectedSubBrand === 'Jeep'
                            ? (JEEP_GRAND_CHEROKEE_IMG || brandDetailSource.bgImage)
                            : brandDetailSource.bgImage)
                      };
                      return (
                        <div className="relative flex flex-col w-full text-center pb-2 select-none overflow-hidden">
                          {/* Ambient Brand Color Glow Dressing */}
                          <div 
                            className="absolute top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[110px] opacity-[0.18] pointer-events-none transition-all duration-700" 
                            style={{ backgroundColor: brandDetail.pantoneHex }}
                          />

                          {/* Premium mockup top navbar heading */}
                          <div className="flex items-center justify-between py-2 border-b border-white/5 h-12 w-full z-10">
                            <button
                              onClick={() => setSelectedSubBrand(null)}
                              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/5 text-slate-300 hover:text-white transition active:scale-90"
                              aria-label="Regresar"
                            >
                              <ArrowLeft className="w-5 h-5" />
                            </button>
                            
                            {/* Centered Brand Logo */}
                            <div className="flex items-center justify-center max-h-7 flex-1">
                              {renderBrandLogo(selectedSubBrand, true, false)}
                            </div>
                            
                            {/* Balance spacer */}
                            <div className="w-8" />
                          </div>

                          {/* Centered big display name */}
                          <div className="mt-5 space-y-1 z-10 px-4">
                            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-encode">
                              {brandDetail.modelName}
                            </h2>
                            <p className="text-[10px] sm:text-[11px] font-bold text-slate-300 tracking-[0.16em] uppercase leading-relaxed max-w-xs mx-auto">
                              {brandDetail.tagline}
                            </p>
                          </div>

                          {/* Representative high-contrast car picture on dark gradient */}
                          <div className="relative mt-5 aspect-[16/10] w-full max-w-[420px] mx-auto overflow-hidden rounded-2xl border border-white/5 bg-black/40 shadow-xl shadow-black/40 z-10">
                            <img 
                              src={brandDetail.bgImage} 
                              alt={brandDetail.modelName} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-[1.02]"
                            />
                            {/* Vignette fade layout overlays to blend image beautifully into the dark panel */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f17] via-transparent to-[#0b0f17]/25 pointer-events-none" />
                            <div className="absolute inset-0 bg-gradient-to-r from-[#0b0f17]/10 via-transparent to-[#0b0f17]/10 pointer-events-none" />
                          </div>

                          {/* ¿Qué deseas hacer? prompt */}
                          <div className="mt-6 mb-3 px-4 z-10">
                            <h3 className="text-sm sm:text-base font-semibold text-white tracking-wide">
                              ¿Qué deseas hacer?
                            </h3>
                          </div>

                          {/* Interactive stacked button panels - Matching the mockup */}
                          <div className="space-y-2.5 px-3 z-10">
                            {/* COTIZA */}
                            <button
                              onClick={() => launchFormWithRequest('cotizacion', BRAND_MODELS[selectedSubBrand]?.[0])}
                              className="group w-full p-3.5 rounded-2xl bg-[#1b1c1e]/60 hover:bg-[#25272a]/75 border border-white/5 hover:border-white/15 flex items-center gap-4 text-left transition-all duration-300 shadow-md transform active:scale-[0.99]"
                            >
                              {/* White outlined badge represent request for quotation */}
                              <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 transition-colors duration-300 group-hover:bg-white/10">
                                <FileText className="w-5 h-5 text-white" />
                              </div>
                              
                              <div className="flex flex-col">
                                <span className="font-bold text-xs sm:text-sm text-white tracking-wider uppercase font-encode">
                                  COTIZA
                                </span>
                                <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                                  Recibe una cotización personalizada
                                </span>
                              </div>
                              
                              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all duration-300 shrink-0 ml-auto" />
                            </button>

                            {/* PRUEBA DE MANEJO */}
                            {selectedSubBrand !== 'Leapmotor' && (
                              <button
                                onClick={() => launchFormWithRequest('prueba', BRAND_MODELS[selectedSubBrand]?.[0])}
                                className="group w-full p-3.5 rounded-2xl bg-[#1b1c1e]/60 hover:bg-[#25272a]/75 border border-white/5 hover:border-white/15 flex items-center gap-4 text-left transition-all duration-300 shadow-md transform active:scale-[0.99]"
                              >
                                {/* White/Silver outlined badge for Calendar */}
                                <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 transition-colors duration-300 group-hover:bg-white/10">
                                  <Calendar className="w-5 h-5 text-white animate-pulse-slow" />
                                </div>
                                
                                <div className="flex flex-col">
                                  <span className="font-bold text-xs sm:text-sm text-white tracking-wider uppercase font-encode">
                                    PRUEBA DE MANEJO
                                  </span>
                                  <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                                    Agenda tu prueba de manejo
                                  </span>
                                </div>
                                
                                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all duration-300 shrink-0 ml-auto" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })()
                  )}
                  
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 2: REGISTRATION FORM SHEET (DYNAMIC FIELDS BASED ON EXPERIENCES) */}
          {formActive && !success && (
            <motion.div
              key="form-sheet"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
              className="px-6 py-4 flex flex-col gap-4 flex-1 relative z-10"
              style={{ paddingTop: '9px', paddingBottom: '9px' }}
            >
              <div>
                {/* Back Link */}
                <button 
                  onClick={() => setFormActive(false)}
                  className={`flex items-center gap-1.5 text-white hover:text-slate-200 text-[11px] font-semibold ${activeLanding === 'leapmotor' ? 'font-sans' : 'font-mono'} mb-4 transition bg-white/10 px-2 py-1 rounded`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{activeLanding === 'leapmotor' ? 'Regresar' : 'Volver a la Landing'}</span>
                </button>

                <h2 className={`text-xl tracking-wide text-white mb-1 uppercase font-sans ${activeLanding === 'leapmotor' ? 'font-semibold' : 'font-black'}`}>
                  {activeLanding === 'leapmotor' 
                    ? 'Déjanos tus datos' 
                    : `Registro de ${formData.requestType === 'cotizacion' ? 'Cotización' : (formData.requestType === 'prueba' ? 'Prueba de Manejo' : 'Atención personalizada')}`}
                </h2>
                {activeLanding !== 'leapmotor' && (
                  <span className="text-[11px] text-white font-bold font-mono block mb-4 uppercase">
                    Marca de interés: <strong className={theme.textAccent}>{selectedBrand}</strong>
                  </span>
                )}

                {errorText && (
                  <div className="p-3 bg-red-950/40 border border-red-500/20 rounded-xl text-red-400 text-xs mb-4 flex gap-2">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>{errorText}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {/* Name and Last Name in elegant side-by-side layout */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className={rowClass}>
                      <label id="frm-name-label" htmlFor="name" className={`text-[11px] uppercase ${activeLanding === 'leapmotor' ? 'font-sans' : 'font-mono'} tracking-wider block mb-0.5 ${activeLanding === 'leapmotor' ? 'font-semibold text-white' : 'text-white font-extrabold'}`}>
                        Nombre *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                        <input
                          id="name"
                          type="text"
                          name="name"
                          required
                          placeholder="Tu nombre"
                          value={formData.name}
                          onChange={handleChange}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className={rowClass}>
                      <label id="frm-lastname-label" htmlFor="lastName" className={`text-[11px] uppercase ${activeLanding === 'leapmotor' ? 'font-sans' : 'font-mono'} tracking-wider block mb-0.5 ${activeLanding === 'leapmotor' ? 'font-semibold text-white' : 'text-white font-extrabold'}`}>
                        Apellido *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                        <input
                          id="lastName"
                          type="text"
                          name="lastName"
                          required
                          placeholder="Tu apellido"
                          value={formData.lastName}
                          onChange={handleChange}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Phone & Postal Code fields in the same row */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Phone field */}
                    <div className={rowClass}>
                      <label id="frm-phone-label" htmlFor="phone" className={`text-[11px] uppercase ${activeLanding === 'leapmotor' ? 'font-sans' : 'font-mono'} tracking-wider block mb-0.5 truncate ${activeLanding === 'leapmotor' ? 'font-semibold text-white' : 'text-white font-extrabold'}`}>
                        Teléfono *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                        <input
                          id="phone"
                          type="tel"
                          name="phone"
                          required
                          placeholder="10 dígitos"
                          value={formData.phone}
                          onChange={handleChange}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {/* Postal Code field */}
                    <div className={rowClass}>
                      <label id="frm-postalcode-label" htmlFor="postalCode" className={`text-[11px] uppercase ${activeLanding === 'leapmotor' ? 'font-sans' : 'font-mono'} tracking-wider block mb-0.5 truncate ${activeLanding === 'leapmotor' ? 'font-semibold text-white' : 'text-white font-extrabold'}`} title="Código Postal *">
                        Código Postal *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                        <input
                          id="postalCode"
                          type="text"
                          name="postalCode"
                          required
                          maxLength={5}
                          placeholder="Ej. 06000"
                          value={formData.postalCode}
                          onChange={(e) => {
                             const cleaned = e.target.value.replace(/[^0-9]/g, '');
                             setFormData(prev => ({ ...prev, postalCode: cleaned }));
                          }}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mail field */}
                  <div className={rowClass}>
                    <label id="frm-email-label" htmlFor="email" className={`text-[11px] uppercase ${activeLanding === 'leapmotor' ? 'font-sans' : 'font-mono'} tracking-wider block mb-0.5 ${activeLanding === 'leapmotor' ? 'font-semibold text-white' : 'text-white font-extrabold'}`}>
                      Correo Electrónico *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                      <input
                        id="email"
                        type="email"
                        name="email"
                        required
                        placeholder="tu@correo.com"
                        value={formData.email}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Models dropdown list tailored by Selected Brand */}
                  <div className={rowClass}>
                    <label id="frm-model-label" className={`text-[11px] uppercase ${activeLanding === 'leapmotor' ? 'font-sans' : 'font-mono'} tracking-wider block mb-0.5 ${activeLanding === 'leapmotor' ? 'font-semibold text-white' : 'text-white font-extrabold'}`}>
                      Modelo Seleccionado *
                    </label>
                    
                    {(activeLanding === 'jeep' || activeLanding === 'multimarca') ? (
                      /* Custom visually rich selection trigger */
                      <div className="relative">
                        <Car className="absolute left-3.5 top-3 w-4 h-4 text-slate-300 pointer-events-none" />
                        <button
                          type="button"
                          id="model-modal-trigger-btn"
                          onClick={() => {
                            // Ensure formData of interest is initialized correctly of the active brand if empty
                            if (!formData.modelOfInterest || !activeModelsList.includes(formData.modelOfInterest)) {
                              setFormData(prev => ({ ...prev, modelOfInterest: activeModelsList[0] }));
                            }
                            setShowModelModal(true);
                          }}
                          className={`w-full text-left bg-[#0a0f18] text-white border border-white/25 hover:border-indigo-400 focus:border-indigo-400 rounded-xl pl-11 pr-7 py-2.5 text-xs outline-none transition uppercase ${activeLanding === 'leapmotor' ? 'font-sans' : 'font-mono'} font-bold flex items-center justify-between`}
                        >
                          <span className="truncate text-slate-200">
                            {selectedBrand} {formData.modelOfInterest || activeModelsList[0]}
                          </span>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        </button>
                      </div>
                    ) : (
                      /* Standard selection select block for single leapmotor landing */
                      <div className="relative">
                        <Car className="absolute left-3.5 top-3 w-4 h-4 text-slate-300" />
                        <select
                          id="modelOfInterest"
                          name="modelOfInterest"
                          required
                          disabled={selectedBrand === 'Leapmotor'}
                          value={formData.modelOfInterest}
                          onChange={handleChange}
                          className={`w-full text-white rounded-xl pl-11 pr-7 py-2.5 text-xs outline-none appearance-none transition uppercase ${activeLanding === 'leapmotor' ? 'font-sans' : 'font-mono'} disabled:opacity-85 disabled:cursor-not-allowed ${
                            activeLanding === 'leapmotor'
                              ? 'bg-[#2D2926] border border-[#deff01] focus:border-[#deff01] font-semibold'
                              : 'bg-[#0a0f18] border border-white/25 focus:border-indigo-400 font-bold'
                          }`}
                        >
                          {activeModelsList.map(m => (
                            <option key={m} value={m} className="bg-slate-900 text-white">
                              {selectedBrand} {m}
                            </option>
                          ))}
                        </select>
                        {selectedBrand !== 'Leapmotor' && (
                          <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-300 pointer-events-none" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Estado y Distribuidor / State and Distributor cascading selectors */}
                  {activeLanding !== 'leapmotor' && (
                    <div className="space-y-3.5">
                      {/* Estado selector */}
                      <div className="space-y-1 bg-slate-900/60 p-2 rounded-xl border border-white/15">
                        <label id="frm-state-label" htmlFor="state" className="text-[11px] uppercase font-mono tracking-wider text-white font-extrabold block mb-0.5">
                          Estado *
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-300 pointer-events-none z-10" />
                          <select
                            id="state"
                            name="state"
                            required
                            value={formData.state}
                            onChange={(e) => {
                              const stateValue = e.target.value;
                              const stateDealers = activeDealers.filter(d => d.state === stateValue);
                              const firstDealer = stateDealers[0]?.name || '';
                              setFormData(prev => ({
                                ...prev,
                                state: stateValue,
                                distributor: firstDealer
                              }));
                            }}
                            className="w-full bg-[#0a0f18] text-white border border-white/25 focus:border-indigo-400 rounded-xl pl-11 pr-7 py-2.5 text-xs outline-none appearance-none transition font-semibold"
                          >
                            {availableStates.map(st => (
                              <option key={st} value={st} className="bg-slate-900 text-white">
                                {st}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-300 pointer-events-none" />
                        </div>
                      </div>

                      {/* Distribuidor de Preferencia selector */}
                      <div className="space-y-1 bg-slate-900/60 p-2 rounded-xl border border-white/15">
                        <label id="frm-distributor-label" htmlFor="distributor" className="text-[11px] uppercase font-mono tracking-wider text-white font-extrabold block mb-0.5">
                          Distribuidor de Preferencia *
                        </label>
                        <div className="relative">
                          <Settings className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-300 pointer-events-none z-10" />
                          <select
                            id="distributor"
                            name="distributor"
                            required
                            value={formData.distributor}
                            onChange={(e) => {
                              const dealerValue = e.target.value;
                              setFormData(prev => ({ ...prev, distributor: dealerValue }));
                            }}
                            className="w-full bg-[#0a0f18] text-white border border-white/25 focus:border-indigo-400 rounded-xl pl-11 pr-7 py-2.5 text-xs outline-none appearance-none transition font-semibold"
                          >
                            {filteredDealers.map(d => (
                              <option key={d.id + '-' + d.name} value={d.name} className="bg-slate-900 text-white">
                                {d.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-300 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Test drive preferred date steps */}
                  {formData.requestType === 'prueba' && (
                    <div className="space-y-1">
                      <label id="frm-date-label" htmlFor="testDriveDate" className="text-[10px] uppercase font-mono tracking-wider text-amber-400 font-bold block flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Selecciona la Fecha para tu Prueba *
                      </label>
                      <input
                        id="testDriveDate"
                        type="date"
                        name="testDriveDate"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.testDriveDate}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-amber-500/30 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition font-bold font-mono"
                      />
                    </div>
                  )}

                  {/* Hidden metadata email helper */}
                  <div className="relative">
                    <input
                      type="hidden"
                      name="email"
                      value={formData.email}
                      className="hidden"
                    />
                  </div>
                </form>
              </div>

              {/* Privacy Policy and Checkbox Section */}
              <div className="space-y-2 mt-3 mb-1">
                <AnimatePresence>
                  {showPrivacyText && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-slate-950/90 border border-white/10 rounded-xl p-3 text-left shadow-2xl relative z-20">
                        <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-1.5">
                          <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider font-mono">
                            AVISO DE PRIVACIDAD (STELLANTIS MÉXICO)
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowPrivacyText(false)}
                            className="text-slate-400 hover:text-white transition text-[9px] font-bold font-mono py-0.5 px-2 bg-white/5 border border-white/10 rounded hover:bg-white/10 active:scale-95"
                          >
                            CERRAR
                          </button>
                        </div>
                        <div className="max-h-[140px] overflow-y-auto text-[10px] text-slate-300 leading-relaxed font-mono whitespace-pre-wrap pr-1" style={{ scrollbarWidth: 'thin' }}>
                          {PRIVACY_TEXT_ES}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-start gap-2.5 py-1.5 select-none text-left">
                  <input
                    type="checkbox"
                    id="privacyActiveCheckbox"
                    checked={privacyAccepted}
                    onChange={(e) => setPrivacyAccepted(e.target.checked)}
                    className="w-4.5 h-4.5 rounded border-white/20 bg-black/40 text-indigo-500 focus:ring-indigo-500/50 focus:ring-offset-slate-950 mt-0.5 shrink-0 accent-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="privacyActiveCheckbox" className={`text-[10px] sm:text-[11px] uppercase tracking-wider cursor-pointer leading-relaxed ${activeLanding === 'leapmotor' ? 'font-semibold text-white' : 'font-bold text-white'}`}>
                    HE LEÍDO Y ACEPTO EL{' '}
                    <button
                      type="button"
                      onClick={() => setShowPrivacyText(!showPrivacyText)}
                      className={`underline text-white hover:text-white/80 transition-colors uppercase ${activeLanding === 'leapmotor' ? 'font-semibold' : 'font-black'}`}
                    >
                      AVISO DE PRIVACIDAD
                    </button>
                  </label>
                </div>
              </div>

              {/* Submit registration button */}
              <div className="pt-1 pb-1">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !privacyAccepted}
                  style={activeLanding === 'leapmotor' ? {
                    borderColor: '#deff01',
                    backgroundColor: '#deff01',
                    color: '#000000',
                    fontSize: '14px',
                    borderWidth: '1px'
                  } : undefined}
                  className={`w-full ${theme.btnBg} active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none ${
                    activeLanding === 'leapmotor' ? 'text-slate-950 font-black' : 'text-white font-bold'
                  } py-4 px-6 rounded-2xl text-[11px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all duration-300 shadow-xl`}
                >
                  {loading ? (
                    <div className={`w-4 h-4 border-2 ${
                      activeLanding === 'leapmotor' ? 'border-slate-950 border-t-transparent' : 'border-white border-t-transparent'
                    } animate-spin rounded-full`} />
                  ) : (
                    <span>
                      {activeLanding === 'leapmotor' 
                        ? (formData.requestType === 'cotizacion' ? 'SOLICITAR COTIZACIÓN' : 'SOLICITAR ATENCIÓN INMEDIATA')
                        : (formData.requestType === 'cotizacion' ? 'Registrar Cotización' : 'Registrar para ser atendido personalmente')}
                    </span>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: SUCCESS BLOCK */}
          {success && (
            <motion.div
              key="success-sheet"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="px-6 py-4 flex flex-col gap-3 flex-1 text-center relative z-10"
              style={{ paddingTop: '6px', paddingBottom: '6px' }}
            >
              <div className="space-y-3 my-1">
                
                {/* Circle Alert */}
                <div className="relative inline-flex items-center justify-center my-1">
                  <div className={`absolute inset-0 w-14 h-14 ${formData.requestType === 'prueba' ? 'bg-indigo-500/10' : 'bg-emerald-500/10'} rounded-full blur-md animate-ping`} />
                  <div className="w-14 h-14 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center">
                    <CheckCircle className={`w-8 h-8 ${formData.requestType === 'prueba' ? 'text-indigo-400' : 'text-emerald-400'}`} />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-light text-white leading-tight">
                    ¡Gracias, <span 
                      style={activeLanding === 'leapmotor' ? { color: '#deff01', background: 'none', WebkitTextFillColor: 'initial', WebkitBackgroundClip: 'initial' } : undefined}
                      className={activeLanding === 'leapmotor' ? "font-extrabold" : `font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${theme.successGradient}`}
                    >
                      {formData.name.split(' ')[0]}
                    </span>!
                  </h3>
                  <p 
                    style={activeLanding === 'leapmotor' ? { fontSize: '18px', fontWeight: 'normal' } : undefined}
                    className="text-sm font-bold text-white"
                  >
                    Tu solicitud ha sido registrada en el sistema.
                  </p>
                </div>

                {formData.requestType === 'prueba' ? (
                  <div className="p-3 bg-slate-900 border border-indigo-500/20 rounded-2xl max-w-xs mx-auto text-left font-mono text-[11px] leading-relaxed">
                    <div className="text-indigo-400 font-bold block uppercase mb-1 flex items-center gap-1">
                      <Key className="w-3.5 h-3.5" /> TEST DRIVE RESERVADO OK
                    </div>
                    <span>Tu cita preferida es para el <strong>{formData.testDriveDate}</strong>. Un asesor te contactará para formalizar la pista.</span>
                  </div>
                ) : (
                  <p className="text-xs font-bold text-emerald-400 font-mono tracking-wide">
                    {activeLanding === 'leapmotor' 
                      ? "Un asesor especializado ha recibido tu alerta, te contactará a la brevedad en el Hospitality de LeapMotor."
                      : "Un asesor especializado ha recibido tu alerta. Contacto en menos de 2 Minutos."
                    }
                  </p>
                )}

                {/* Show brand graphic mockup preview with dynamic branding border & shadow */}
                <div className={`relative aspect-video max-w-xs mx-auto rounded-xl border select-none bg-slate-900/40 my-2 overflow-hidden shadow-lg transition-all duration-300 ${
                  selectedBrand === 'Leapmotor'
                    ? 'border-[#009100]/40 shadow-[0_0_20px_rgba(0,145,0,0.25)]'
                    : (selectedBrand === 'Jeep'
                       ? 'border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                       : 'border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]')
                }`}>
                  <img 
                    src={selectedBrand === 'Jeep' ? JEEP_IMG : (selectedBrand === 'Leapmotor' ? b10ImgUrl : STELLANTIS_IMG)} 
                    alt={selectedBrand}
                    referrerPolicy="no-referrer"
                    className={`w-full h-full object-cover ${selectedBrand === 'Leapmotor' ? '' : 'brightness-[1.25] contrast-[1.08] saturate-[1.1]'}`}
                  />
                  <div className="absolute inset-x-0 bottom-2 text-[10px] font-bold tracking-[0.2em] uppercase text-white/90">
                    {selectedBrand} {formData.modelOfInterest}
                  </div>
                </div>

                {/* Distributor verification card */}
                <div className="bg-slate-900/60 border border-white/5 p-3 rounded-2xl flex items-center gap-3 text-left max-w-xs mx-auto">
                  <span className={`p-2 rounded-xl flex items-center justify-center ${theme.thankYouBadge}`}>
                    <MapPin className="w-4 h-4 animate-bounce" />
                  </span>
                  <div>
                    <span className="text-[11px] font-black text-white block uppercase">Paddock de Asignación</span>
                    <span className="text-[11px] text-white font-bold block mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">{formData.distributor.replace('Leapmotor ', `${selectedBrand} `)}</span>
                  </div>
                </div>
              </div>

              {/* Utility resets */}
              <div className="space-y-2 pt-1 pb-1">
                <button
                  onClick={() => {
                    setSuccess(false);
                    setFormActive(false);
                    setFormData(getInitialFormData(activeLanding, selectedBrand));
                  }}
                  className="w-full bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 px-6 py-3 rounded-xl text-[10px] font-bold tracking-wider uppercase transition font-mono"
                >
                  Nuevo Registro de Prueba
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Spacer */}
        <div className="py-2" />

      </div>

      {/* MODAL 1: EXPOSURE LOCATION CARPA MAP */}
      <AnimatePresence>
        {showStellantisMap && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#020408]/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#0b0f17] border border-white/10 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-indigo-950/60 to-[#0b0f17] border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Map className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-black uppercase text-white font-mono tracking-wide">
                    Carpa Stellantis CDMX
                  </h3>
                </div>
                <button 
                  onClick={() => setShowStellantisMap(false)}
                  className="bg-white/10 hover:bg-white/20 text-white rounded-lg p-1.5 transition text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Map Canvas body */}
              <div className="p-4 flex flex-col items-center gap-3">
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                  <img 
                    src={CARPA_MAP_IMG} 
                    alt="Mapa Carpa Stellantis"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover brightness-[1.25] contrast-[1.08] saturate-[1.1]"
                  />
                  <div className="absolute top-3 left-3 bg-slate-950/80 border border-amber-500/30 px-2 py-0.5 rounded text-[8px] font-bold font-mono text-amber-400 uppercase tracking-widest animate-pulse">
                    Vip hospitality
                  </div>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-2xl border border-white/5 text-center space-y-1.5">
                  <span className="text-[10px] text-indigo-400 font-bold font-mono uppercase tracking-widest block">Acceso Prioritario</span>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                    Nuestra carpa se ubica en el <strong className="text-white">Hospitality Zone Stellantis, Campo Marte</strong>. Presenta tu código para acceso prioritario.
                  </p>
                </div>
              </div>

              {/* Action footer */}
              <div className="p-4 bg-slate-950/80 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowStellantisMap(false)}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider transition-all duration-300"
                >
                  Entendido, volver
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 2: CUSTOM MODEL PICKER WITH HERO IMAGES AND DETAILS */}
      <AnimatePresence>
        {showModelModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#020408]/90 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setShowModelModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#0b0f17] border border-white/10 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-slate-950 to-[#0b0f17] border-b border-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-black uppercase text-white font-mono tracking-wide">
                    Selecciona Modelo {selectedBrand}
                  </h3>
                </div>
                <button 
                  onClick={() => setShowModelModal(false)}
                  className="bg-white/10 hover:bg-white/20 text-white rounded-lg p-1.5 transition text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Models List Scrollable body */}
              <div className="p-3 overflow-y-auto space-y-2.5 flex-1 select-none">
                {activeModelsList.map((m) => {
                  let details = MODEL_DETAILS[selectedBrand]?.[m] || {
                    name: `${selectedBrand} ${m}`,
                    desc: 'Innovación, tecnología y excelencia Stellantis.',
                    img: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=350&q=80'
                  };
                  if (selectedBrand === 'Leapmotor' && m === 'B10' && b10ImgUrl) {
                    details = { ...details, img: b10ImgUrl };
                  }
                  const isChosen = formData.modelOfInterest === m;

                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, modelOfInterest: m }));
                        setShowModelModal(false);
                      }}
                      className={`w-full text-left rounded-2xl border transition-all duration-300 p-2 flex gap-3 relative overflow-hidden bg-slate-950/40 ${
                        isChosen 
                          ? 'border-indigo-500 ring-1 ring-indigo-500/40 bg-indigo-950/10' 
                          : 'border-white/5 hover:border-white/10 hover:bg-slate-950/80'
                      }`}
                    >
                      {/* Model small preview thumbnail */}
                      <div className="w-20 h-16 rounded-xl overflow-hidden relative shrink-0 border border-white/10 bg-slate-900 shadow-md">
                        <img 
                          src={details.img} 
                          alt={details.name}
                          className="w-full h-full object-cover brightness-[1.22] contrast-[1.06] saturate-[1.08]"
                        />
                      </div>

                      {/* Info layout */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <strong className="text-xs text-white block uppercase tracking-wide truncate">
                          {details.name}
                        </strong>
                        <span className="text-[10px] text-slate-400 block leading-relaxed line-clamp-2 mt-0.5">
                          {details.desc}
                        </span>
                      </div>

                      {/* Tick selected status */}
                      {isChosen && (
                        <div className="absolute top-2 right-2 bg-indigo-500 rounded-full p-0.5">
                          <CheckCircle className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Action/Cancel Footer */}
              <div className="p-3 bg-slate-950/60 border-t border-white/5 shrink-0 text-center">
                <button
                  type="button"
                  onClick={() => setShowModelModal(false)}
                  className="text-[10px] text-slate-400 hover:text-white uppercase font-bold tracking-wider font-mono py-1 block w-full"
                >
                  Cancelar Selección
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
