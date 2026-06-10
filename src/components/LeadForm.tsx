/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  writeBatch,
  onSnapshot
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { LeadStatus, Lead } from '../types';
import { sendLeapmotorLeadToCRM } from '../utils/crm';
import { 
  Sparkles, 
  Car, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  CheckCircle, 
  Check, 
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
import { BRAND_MODELS_DB } from '../data/brandModelsDb';

// Import newly generated design assets
import LEAPMOTOR_TUNNEL_BG from '../assets/images/leapmotor_b10_tunnel_bg_1780692970544.png';
import LEAPMOTOR_LOGO_IMG from '../assets/images/regenerated_image_1780979872662.png';
import LEAPMOTOR_LOGO_NEW_IMG from '../assets/images/leapmotor_outline_white_1780977081063.png';
import JEEP_LOGO_IMG from '../assets/images/regenerated_image_1781121932966.png';
import JEEP_HEADER_LOGO_IMG from '../assets/images/jeep_logo_new_1780714816380.png';
import FIAT_LOGO_IMG from '../assets/images/regenerated_image_1780715561130.jpg';
import DODGE_LOGO_BG_IMG from '../assets/images/regenerated_image_1780970482939.png';
import DODGE_LOGO_IMG from '../assets/images/regenerated_image_1780970830147.jpg';
import PEUGEOT_LOGO_IMG from '../assets/images/peugeot_logo_new_1780716886504.png';
import RAM_LOGO_IMG from '../assets/images/ram_logo_new_1780717149923.png';
import JEEP_IMG from '../assets/images/regenerated_image_1781067758543.jpg';
import JEEP_COMMANDER_IMG from '../assets/images/jeep_commander_1780440413653.png';
import JEEP_COMPASS_IMG from '../assets/images/jeep_compass_1780440426004.png';
import JEEP_GRAND_CHEROKEE_IMG from '../assets/images/jeep_grand_cherokee_1780440437533.png';
import JEEP_GRAND_WAGONEER_IMG from '../assets/images/jeep_grand_wagoneer_1780440449247.png';
import JEEP_JT_IMG from '../assets/images/jeep_jt_1780440462196.png';
import JEEP_RENEGADE_IMG from '../assets/images/jeep_renegade_1780440473660.png';
import STELLANTIS_IMG from '../assets/images/stellantis_multibrand_1780407983016.png';
import STELLANTIS_HEADER_LOGO_TRANSPARENT_IMG from '../assets/images/regenerated_image_1781104822022.jpg';
import CARPA_MAP_IMG from '../assets/images/stellantis_carpa_map_1780431196502.png';
import MAP_800X800_IMG from '../assets/images/mapa-800x800.jpg';

// Import newly generated high-fidelity brand landing background/hero images
import RAM_LANDING_BG_26 from '../assets/images/ram_landing_2026_1780767734197.png';
import PEUGEOT_LANDING_BG_26 from '../assets/images/peugeot_landing_2026_1780767747561.png';
import JEEP_LANDING_BG_26 from '../assets/images/jeep_landing_2026_1780767759797.png';
import FIAT_LANDING_BG_26 from '../assets/images/fiat_landing_2026_1780767772093.png';
import DODGE_LANDING_BG_26 from '../assets/images/dodge_landing_2026_1780767783850.png';

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

// Group vehicle options dynamically from the corporate BRAND_MODELS_DB
const BRAND_MODELS: Record<string, string[]> = BRAND_MODELS_DB.reduce((acc, curr) => {
  const brandName = curr.brand;
  if (!acc[brandName]) {
    acc[brandName] = [];
  }
  if (!acc[brandName].includes(curr.model)) {
    acc[brandName].push(curr.model);
  }
  return acc;
}, {} as Record<string, string[]>);

// Expand details dynamically from our model database registry reflecting real-time ClaveGen images
const MODEL_DETAILS: Record<string, Record<string, { name: string; desc: string; img: string }>> = BRAND_MODELS_DB.reduce((acc, curr) => {
  if (!acc[curr.brand]) {
    acc[curr.brand] = {};
  }
  acc[curr.brand][curr.model] = {
    name: `${curr.brand} ${curr.model}`,
    desc: curr.desc,
    img: curr.img
  };
  return acc;
}, {} as Record<string, Record<string, { name: string; desc: string; img: string }>>);

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
    modelName: 'B10',
    tagline: 'Algo increíble te está esperando.',
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
    modelName: 'Wrangler',
    tagline: 'El original 4x4 más capaz de la historia.',
    bgImage: JEEP_LANDING_BG_26,
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
    modelName: 'Pulse Abarth',
    tagline: 'El SUV que despierta tu modo poison.',
    bgImage: FIAT_LANDING_BG_26,
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
    modelName: 'Attitude',
    tagline: 'Unleash your Attitude.',
    bgImage: DODGE_LANDING_BG_26,
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
    modelName: '3008',
    tagline: 'Súbete y entenderás lo extraordinario.',
    bgImage: PEUGEOT_LANDING_BG_26,
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
    tagline: 'Grandeza Amplificada.',
    bgImage: RAM_LANDING_BG_26,
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
  const [activeLanding, setActiveLanding] = useState<'leapmotor' | 'jeep' | 'multimarca'>(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname.toLowerCase();
      const searchParams = new URLSearchParams(window.location.search);
      const landingParam = searchParams.get('landing') || searchParams.get('campaign') || searchParams.get('site');
      
      const isSoccerhouseParam = landingParam && landingParam.toLowerCase().startsWith('soccerhouse');
      
      if (landingParam === 'jeep' || host.startsWith('jeep')) {
        return 'jeep';
      } else if (landingParam === 'multimarca' || host.startsWith('multimarca') || host.startsWith('stellantis') || host.startsWith('soccerhouse') || isSoccerhouseParam) {
        return 'multimarca';
      } else if (landingParam === 'leapmotor' || host.startsWith('leapmotor')) {
        return 'leapmotor';
      }
    }
    return 'leapmotor';
  });
  
  // Multimarca active brand
  const [selectedBrand, setSelectedBrand] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname.toLowerCase();
      const searchParams = new URLSearchParams(window.location.search);
      const landingParam = searchParams.get('landing') || searchParams.get('campaign') || searchParams.get('site');
      
      if (landingParam === 'jeep' || host.startsWith('jeep')) {
        return 'Jeep';
      }
    }
    return 'Leapmotor';
  });
  const [selectedSubBrand, setSelectedSubBrand] = useState<string | null>(null);

  // Modal displays states
  const [showStellantisMap, setShowStellantisMap] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);

  // Form registration parameters
  const [formData, setFormData] = useState(() => {
    let initialLanding: 'leapmotor' | 'jeep' | 'multimarca' = 'leapmotor';
    if (typeof window !== 'undefined') {
      const host = window.location.hostname.toLowerCase();
      const searchParams = new URLSearchParams(window.location.search);
      const landingParam = searchParams.get('landing') || searchParams.get('campaign') || searchParams.get('site');
      
      const isSoccerhouseParam = landingParam && landingParam.toLowerCase().startsWith('soccerhouse');
      
      if (landingParam === 'jeep' || host.startsWith('jeep')) {
        initialLanding = 'jeep';
      } else if (landingParam === 'multimarca' || host.startsWith('multimarca') || host.startsWith('stellantis') || host.startsWith('soccerhouse') || isSoccerhouseParam) {
        initialLanding = 'multimarca';
      }
    }

    const defaultModel = initialLanding === 'jeep' ? 'Jeep Cherokee' : 'B10';
    const defaultDistributor = initialLanding === 'jeep' ? 'Autokasa Viaducto' : 'Leapmotor Santa Fe';

    return {
      name: '',
      lastName: '',
      email: '',
      phone: '',
      postalCode: '',
      state: 'Ciudad de México (CDMX)',
      distributor: defaultDistributor,
      modelOfInterest: defaultModel,
      contactMethod: 'whatsapp',
      testDriveDate: '',
      requestType: 'asesor' as 'cotizacion' | 'prueba' | 'asesor'
    };
  });

  // State for tracking UTM Parameters securely
  const [utmParams, setUtmParams] = useState<{
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
  }>(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const host = window.location.hostname.toLowerCase();
      const landingParam = searchParams.get('landing') || searchParams.get('campaign') || searchParams.get('site') || searchParams.get('utm_source') || '';
      const isSoccerhouse = host.startsWith('soccerhouse') || host.includes('soccerhouse') || landingParam.toLowerCase().startsWith('soccerhouse') || landingParam.toLowerCase().includes('soccerhouse');

      let utm_source = searchParams.get('utm_source') || localStorage.getItem('utm_source') || '';
      if (isSoccerhouse && !utm_source) {
        utm_source = 'soccerhouse';
      }

      const utm_medium = searchParams.get('utm_medium') || localStorage.getItem('utm_medium') || '';
      const utm_campaign = searchParams.get('utm_campaign') || localStorage.getItem('utm_campaign') || '';
      const utm_term = searchParams.get('utm_term') || localStorage.getItem('utm_term') || '';
      const utm_content = searchParams.get('utm_content') || localStorage.getItem('utm_content') || '';

      // Persist in localStorage if found in URL for future sessions or navigations
      if (searchParams.get('utm_source')) localStorage.setItem('utm_source', searchParams.get('utm_source')!);
      else if (isSoccerhouse && utm_source === 'soccerhouse') localStorage.setItem('utm_source', 'soccerhouse');

      if (searchParams.get('utm_medium')) localStorage.setItem('utm_medium', searchParams.get('utm_medium')!);
      if (searchParams.get('utm_campaign')) localStorage.setItem('utm_campaign', searchParams.get('utm_campaign')!);
      if (searchParams.get('utm_term')) localStorage.setItem('utm_term', searchParams.get('utm_term')!);
      if (searchParams.get('utm_content')) localStorage.setItem('utm_content', searchParams.get('utm_content')!);

      return {
        utm_source: utm_source || undefined,
        utm_medium: utm_medium || undefined,
        utm_campaign: utm_campaign || undefined,
        utm_term: utm_term || undefined,
        utm_content: utm_content || undefined
      };
    }
    return {};
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formActive, setFormActive] = useState(false); // false = landing sheet, true = form sheet
  const [registeredLeadId, setRegisteredLeadId] = useState('');
  const [errorText, setErrorText] = useState('');
  const [currentLeadData, setCurrentLeadData] = useState<any>(null);
  const redirectTimerRef = useRef<any>(null);

  useEffect(() => {
    if (!registeredLeadId) {
      setCurrentLeadData(null);
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
      return;
    }

    const leadDocRef = doc(db, 'leads', registeredLeadId);
    const unsubscribe = onSnapshot(leadDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setCurrentLeadData(data);

        // If the status is completed (attended or lost)
        if (data.status === 'attended' || data.status === 'lost') {
          if (!redirectTimerRef.current) {
            redirectTimerRef.current = setTimeout(() => {
              setSuccess(false);
              setFormActive(false);
              setFormData(getInitialFormData(activeLanding, selectedBrand));
              setRegisteredLeadId('');
              setCurrentLeadData(null);
              if (redirectTimerRef.current) {
                clearTimeout(redirectTimerRef.current);
                redirectTimerRef.current = null;
              }
            }, 4000); // Wait 4 seconds to display the ended status message before redirecting
          }
        } else {
          // If the status is not completed, make sure any pending redirect timer is cleared
          if (redirectTimerRef.current) {
            clearTimeout(redirectTimerRef.current);
            redirectTimerRef.current = null;
          }
        }
      }
    }, (error) => {
      console.error("Error listening to lead:", error);
    });

    return () => {
      unsubscribe();
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
    };
  }, [registeredLeadId]);

  // Interactive Map Event Callout Section for Jeep Landing
  const [activeJeepEventSpot, setActiveJeepEventSpot] = useState<string>('track');

  // Privacy Policy Acceptance and Display State
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [showPrivacyText, setShowPrivacyText] = useState(false);

  // Dynamic, fast database lookups for selected brand + state
  const [dbDistributors, setDbDistributors] = useState<any[]>([]);
  const [allDbDistributors, setAllDbDistributors] = useState<any[]>([]);
  const [loadingDbDistributors, setLoadingDbDistributors] = useState(false);

  // Renders premium, responsive vector brand logos for the Multimarca experience
  const renderBrandLogo = (brandName: string, isSelected: boolean, isLarge?: boolean) => {
    const activeColor = isLarge
      ? 'text-white'
      : (isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-100');
    
    switch (brandName) {
      case 'Leapmotor':
        return (
          <div className="flex flex-col items-center justify-center w-full px-0.5" id="brand-logo-leapmotor">
            <img 
              src={LEAPMOTOR_LOGO_IMG} 
              alt="Leapmotor"
              referrerPolicy="no-referrer"
              className={`w-full ${isLarge ? 'max-w-[400px] sm:max-w-[490px] h-13 sm:h-16' : 'max-w-[105px] sm:max-w-[125px] h-6.5 sm:h-7.5'} object-contain transition-all duration-300`} 
              style={{ mixBlendMode: 'normal' }}
            />
          </div>
        );
      case 'Jeep':
        return (
          <div className="flex flex-col items-center justify-center w-full px-0.5" id="brand-logo-jeep">
            <img 
              src={JEEP_LOGO_IMG} 
              alt="Jeep"
              referrerPolicy="no-referrer"
              className={`w-full ${isLarge ? 'max-w-[400px] sm:max-w-[490px] h-30 sm:h-36' : 'max-w-[105px] sm:max-w-[125px] h-6.5 sm:h-7.5'} object-contain transition-all duration-300`} 
            />
          </div>
        );
      case 'Ram':
        return (
          <div className="flex flex-col items-center justify-center w-full px-0.5" id="brand-logo-ram">
            <img 
              src={RAM_LOGO_IMG} 
              alt="Ram"
              referrerPolicy="no-referrer"
              className={`w-full ${isLarge ? 'max-w-[400px] sm:max-w-[490px] h-24 sm:h-28' : 'max-w-[105px] sm:max-w-[125px] h-6.5 sm:h-7.5'} object-contain transition-all duration-300`} 
            />
          </div>
        );
      case 'Dodge':
        return (
          <div 
            className="flex flex-col items-center justify-center w-full px-0.5" 
            id="brand-logo-dodge"
            style={isLarge ? {} : { 
              backgroundImage: `url(${DODGE_LOGO_BG_IMG})`, 
              backgroundSize: 'contain', 
              backgroundRepeat: 'no-repeat', 
              backgroundPosition: 'center' 
            }}
          >
            <img 
              src={DODGE_LOGO_IMG} 
              alt="Dodge"
              referrerPolicy="no-referrer"
              className={`w-full ${isLarge ? 'max-w-[180px] sm:max-w-[220px] h-12 sm:h-14' : 'max-w-[105px] sm:max-w-[125px] h-6.5 sm:h-7.5'} object-contain transition-all duration-300`} 
            />
          </div>
        );
      case 'Fiat':
        return (
          <div className="flex flex-col items-center justify-center w-full px-0.5" id="brand-logo-fiat">
            <img 
              src={FIAT_LOGO_IMG} 
              alt="Fiat"
              referrerPolicy="no-referrer"
              className={`w-full ${isLarge ? 'max-w-[400px] sm:max-w-[490px] h-26 sm:h-30' : 'max-w-[105px] sm:max-w-[125px] h-6.5 sm:h-7.5'} object-contain transition-all duration-300`} 
            />
          </div>
        );
      case 'Peugeot':
        return (
          <div className="flex flex-col items-center justify-center w-full px-0.5" id="brand-logo-peugeot">
            <img 
              src={PEUGEOT_LOGO_IMG} 
              alt="Peugeot"
              referrerPolicy="no-referrer"
              className={`w-full ${isLarge ? 'max-w-[400px] sm:max-w-[490px] h-28 sm:h-32' : 'max-w-[105px] sm:max-w-[125px] h-6.5 sm:h-7.5'} object-contain transition-all duration-300`} 
            />
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
      setFormData(prev => ({ ...prev, modelOfInterest: 'Jeep Cherokee' }));
    } else if (target === 'multimarca') {
      setSelectedBrand('Leapmotor');
      setFormData(prev => ({ ...prev, modelOfInterest: 'B10' }));
    }
  };

  useEffect(() => {
    const host = window.location.hostname.toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);
    const landingParam = searchParams.get('landing') || searchParams.get('campaign') || searchParams.get('site');
    
    const isSoccerhouseParam = landingParam && landingParam.toLowerCase().startsWith('soccerhouse');
    
    if (landingParam === 'jeep' || host.startsWith('jeep')) {
      handleLandingSwitch('jeep');
    } else if (landingParam === 'multimarca' || host.startsWith('multimarca') || host.startsWith('stellantis') || host.startsWith('soccerhouse') || isSoccerhouseParam) {
      handleLandingSwitch('multimarca');
    } else if (landingParam === 'leapmotor' || host.startsWith('leapmotor')) {
      handleLandingSwitch('leapmotor');
    }
  }, []);

  useEffect(() => {
    const brandName = activeLanding === 'jeep' ? 'Jeep' : (activeLanding === 'leapmotor' ? 'Leapmotor' : selectedBrand);
    document.title = `Landing page campo marte - ${brandName}`;
  }, [activeLanding, selectedBrand]);

  // Google Tag Manager dynamic injection for Leapmotor and Jeep Cherokee
  useEffect(() => {
    if (activeLanding === 'leapmotor') {
      if (!(window as any).gtmLeapmotorInjected) {
        (window as any).gtmLeapmotorInjected = true;

        // Custom GTM script injection (placed as the second instruction in <head> dynamically)
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.innerHTML = `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-52MFNGBR');
        `;
        
        const head = document.head;
        if (head.children.length > 1) {
          head.insertBefore(script, head.children[1]);
        } else {
          head.appendChild(script);
        }

        // Noscript alternative placed at the end of <body> dynamically
        const noscript = document.createElement('noscript');
        const iframe = document.createElement('iframe');
        iframe.src = "https://www.googletagmanager.com/ns.html?id=GTM-52MFNGBR";
        iframe.height = "0";
        iframe.width = "0";
        iframe.style.display = "none";
        iframe.style.visibility = "hidden";
        noscript.appendChild(iframe);
        document.body.appendChild(noscript);
      }
    } else if (activeLanding === 'jeep') {
      if (!(window as any).gtmJeepInjected) {
        (window as any).gtmJeepInjected = true;

        // Custom GTM script injection (placed as the second instruction in <head> dynamically)
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.innerHTML = `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-KBZTWBNW');
        `;
        
        const head = document.head;
        if (head.children.length > 1) {
          head.insertBefore(script, head.children[1]);
        } else {
          head.appendChild(script);
        }

        // Noscript alternative placed at the end of <body> dynamically
        const noscript = document.createElement('noscript');
        const iframe = document.createElement('iframe');
        iframe.src = "https://www.googletagmanager.com/ns.html?id=GTM-KBZTWBNW";
        iframe.height = "0";
        iframe.width = "0";
        iframe.style.display = "none";
        iframe.style.visibility = "hidden";
        noscript.appendChild(iframe);
        document.body.appendChild(noscript);
      }
    } else if (activeLanding === 'multimarca') {
      const host = window.location.hostname.toLowerCase();
      const searchParams = new URLSearchParams(window.location.search);
      const landingParam = searchParams.get('landing') || searchParams.get('campaign') || searchParams.get('site') || searchParams.get('utm_source') || '';
      const isSoccerhouse = host.startsWith('soccerhouse') || host.includes('soccerhouse') || landingParam.toLowerCase().startsWith('soccerhouse') || landingParam.toLowerCase().includes('soccerhouse');

      if (isSoccerhouse) {
        if (!(window as any).gtmSoccerhouseInjected) {
          (window as any).gtmSoccerhouseInjected = true;

          // Custom GTM script injection for soccerhouse (placed as the second instruction in <head> dynamically)
          const script = document.createElement('script');
          script.type = 'text/javascript';
          script.innerHTML = `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-57B77SKL');
          `;
          
          const head = document.head;
          if (head.children.length > 1) {
            head.insertBefore(script, head.children[1]);
          } else {
            head.appendChild(script);
          }

          // Noscript alternative placed at the end of <body> dynamically
          const noscript = document.createElement('noscript');
          const iframe = document.createElement('iframe');
          iframe.src = "https://www.googletagmanager.com/ns.html?id=GTM-57B77SKL";
          iframe.height = "0";
          iframe.width = "0";
          iframe.style.display = "none";
          iframe.style.visibility = "hidden";
          noscript.appendChild(iframe);
          document.body.appendChild(noscript);
        }
      } else {
        if (!(window as any).gtmMultimarcaInjected) {
          (window as any).gtmMultimarcaInjected = true;

          // Custom GTM script injection (placed as the second instruction in <head> dynamically)
          const script = document.createElement('script');
          script.type = 'text/javascript';
          script.innerHTML = `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-N6RRXWDB');
          `;
          
          const head = document.head;
          if (head.children.length > 1) {
            head.insertBefore(script, head.children[1]);
          } else {
            head.appendChild(script);
          }

          // Noscript alternative placed at the end of <body> dynamically
          const noscript = document.createElement('noscript');
          const iframe = document.createElement('iframe');
          iframe.src = "https://www.googletagmanager.com/ns.html?id=GTM-N6RRXWDB";
          iframe.height = "0";
          iframe.width = "0";
          iframe.style.display = "none";
          iframe.style.visibility = "hidden";
          noscript.appendChild(iframe);
          document.body.appendChild(noscript);
        }
      }
    }
  }, [activeLanding]);

  // Update selected state automatically based on landing selection or brand selection
  useEffect(() => {
    if (activeLanding === 'leapmotor' && formData.requestType !== 'cotizacion') {
      setFormData(prev => ({
        ...prev,
        state: 'CIUDAD DE MÉXICO',
        distributor: 'Leapmotor Santa Fe'
      }));
    } else {
      const activeBrandKey = activeLanding === 'jeep' ? 'JEEP' : selectedBrand.toUpperCase();
      const brandDealers = ALL_DEALERS.filter(d => d.brand === activeBrandKey);
      
      const availableStates = Array.from(new Set(brandDealers.map(d => d.state))).sort();
      
      // Attempt to stay with previously selected state if it exists for this brand, otherwise default to "CIUDAD DE MÉXICO" or first
      const defaultState = availableStates.includes(formData.state) 
        ? formData.state 
        : (availableStates.includes('CIUDAD DE MÉXICO') ? 'CIUDAD DE MÉXICO' : (availableStates[0] || ''));
      
      setFormData(prev => ({
        ...prev,
        state: defaultState
      }));
    }
  }, [activeLanding, selectedBrand]);

  // Query database dynamically for distributors matching the selected brand + selected state
  useEffect(() => {
    const activeBrandKey = activeLanding === 'jeep' ? 'JEEP' : selectedBrand.toUpperCase();
    const currentState = formData.state?.trim().toUpperCase();

    if (!currentState) {
      setDbDistributors([]);
      return;
    }

    let active = true;
    const fetchDealers = async () => {
      setLoadingDbDistributors(true);
      try {
        console.log(`[Firebase] Querying all distributors from collection and filtering client-side for Brand: "${activeBrandKey}", State: "${currentState}"`);
        let snap = await getDocs(collection(db, 'distributors'));
        if (!active) return;

        // Auto-seed if the database is completely empty so that the user gets real database values instantly
        if (snap.size === 0) {
          console.warn(`[Firebase] distributors collection in database was found empty. Auto-seeding catalog to collection...`);
          const chunkSize = 400;
          for (let i = 0; i < ALL_DEALERS.length; i += chunkSize) {
            const batch = writeBatch(db);
            const chunk = ALL_DEALERS.slice(i, i + chunkSize);
            chunk.forEach(d => {
              const docRef = doc(db, 'distributors', d.id);
              batch.set(docRef, {
                marca: d.brand.toUpperCase(),
                claveCorporativo: d.corpKey,
                disId: d.id,
                estado: d.state.trim().toUpperCase(),
                name: d.name,
                url: d.url || '',
                createdAt: new Date()
              }, { merge: true });
            });
            await batch.commit();
            console.log(`[Firebase] Seeded batch ${Math.floor(i / chunkSize) + 1} (${chunk.length} entries)`);
          }
          console.log(`[Firebase] Database seeding completed successfully.`);
          // Query again after seeding
          snap = await getDocs(collection(db, 'distributors'));
        }

        const allDocs: any[] = [];
        snap.forEach((docSnap) => {
          allDocs.push({ id: docSnap.id, ...docSnap.data() });
        });

        // Save all distributors in database for cross-referencing and name-to-disId matching
        setAllDbDistributors(allDocs);

        // Filter client-side to bypass composite index constraints and query-permission quirks
        const list = allDocs.filter(d => 
          String(d.marca || '').toUpperCase() === activeBrandKey.toUpperCase() &&
          String(d.estado || '').toUpperCase() === currentState.toUpperCase()
        );

        // Alphabetically sort by name
        list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        console.log(`[Firebase] Found ${list.length} database dealers (filtered from ${allDocs.length} total) for brand "${activeBrandKey}" in state "${currentState}"`);

        setDbDistributors(list);

        // Auto-select the first helper
        if (list.length > 0) {
          const matched = list.find(d => d.name === formData.distributor);
          if (!matched) {
            setFormData(prev => ({ ...prev, distributor: list[0].name }));
          }
        } else {
          setFormData(prev => ({ ...prev, distributor: '' }));
        }
      } catch (err: any) {
        console.warn("[Firebase] Error querying distributors from Firestore. Automatically falling back to local dataset to prevent offline issues:", err);
        
        if (!active) return;
        
        // Filter local ALL_DEALERS catalogue in-memory
        const list = ALL_DEALERS.filter(d => 
          String(d.brand || '').toUpperCase() === activeBrandKey.toUpperCase() &&
          String(d.state || '').toUpperCase() === currentState.toUpperCase()
        ).map(d => ({
          marca: d.brand,
          claveCorporativo: d.corpKey,
          disId: d.id,
          estado: d.state,
          name: d.name,
          url: d.url || ''
        }));
        
        list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        
        console.log(`[Firebase Fallback] Successfully filtered ${list.length} local dealers for Brand: "${activeBrandKey}", State: "${currentState}"`);
        setDbDistributors(list);
        setAllDbDistributors(ALL_DEALERS.map(d => ({
          marca: d.brand,
          claveCorporativo: d.corpKey,
          disId: d.id,
          estado: d.state,
          name: d.name,
          url: d.url || ''
        })));
        
        if (list.length > 0) {
          const matched = list.find(d => d.name === formData.distributor);
          if (!matched) {
            setFormData(prev => ({ ...prev, distributor: list[0].name }));
          }
        } else {
          setFormData(prev => ({ ...prev, distributor: '' }));
        }

        // Satisfy Firestore Integration Skill requirement: Handle and format permission error in background
        const isPermission = err?.code === 'permission-denied' || String(err).includes('permission') || String(err).includes('Permission');
        if (isPermission) {
          try {
            handleFirestoreError(err, OperationType.LIST, 'distributors');
          } catch (richErr) {
            console.warn("[Firestore Diagnostic Info] Handled permission error during lazy-load:", richErr);
          }
        }
      } finally {
        if (active) {
          setLoadingDbDistributors(false);
        }
      }
    };

    fetchDealers();

    return () => {
      active = false;
    };
  }, [activeLanding, selectedBrand, formData.state]);

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

    if (landing !== 'leapmotor' || reqType === 'cotizacion') {
      const activeBrandKey = landing === 'jeep' ? 'JEEP' : brand.toUpperCase();
      const brandDealers = ALL_DEALERS.filter(d => d.brand === activeBrandKey);
      
      const availableStates = Array.from(new Set(brandDealers.map(d => d.state))).sort();
      defaultState = availableStates.includes('CIUDAD DE MÉXICO') 
        ? 'CIUDAD DE MÉXICO' 
        : (availableStates[0] || '');
      
      const dealersInState = brandDealers.filter(d => d.state === defaultState);
      defaultDistributor = dealersInState[0]?.name || '';
    } else {
      defaultState = 'CIUDAD DE MÉXICO';
      defaultDistributor = 'Leapmotor Santa Fe';
    }

    return {
      name: '',
      lastName: '',
      email: '',
      phone: '',
      postalCode: '',
      state: defaultState,
      distributor: defaultDistributor,
      modelOfInterest: presetModel || (landing === 'leapmotor' ? 'B10' : (brand === 'Jeep' ? 'Jeep Cherokee' : BRAND_MODELS[brand]?.[0] || 'Jeep Cherokee')),
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
    const isDistributorRequired = !isLeapmotorLanding || formData.requestType === 'cotizacion';

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
      let minWaitingAdvisor: any = null;
      const needsAdvisorAssignment = activeLanding !== 'leapmotor' && formData.requestType !== 'cotizacion' && formData.requestType !== 'prueba';

      if (needsAdvisorAssignment) {
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
        minWaitingAdvisor = activeAdvisors[0];
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
      }

      const leadsCol = collection(db, 'leads');
      const newLeadDoc = doc(leadsCol);
      const leadId = newLeadDoc.id;

      const cleanEmail = formData.email.trim().toLowerCase();

      const activeBrand = activeLanding === 'multimarca' ? selectedBrand : (activeLanding === 'jeep' ? 'Jeep' : 'Leapmotor');
      const matchedModel = BRAND_MODELS_DB.find(
        m => m.brand.toLowerCase() === activeBrand.toLowerCase() && 
             m.model.toLowerCase() === formData.modelOfInterest.toLowerCase()
      );
      const modelClaveGen = matchedModel ? matchedModel.claveGen : '';

      let chosenDistName = activeLanding === 'leapmotor' && formData.requestType !== 'cotizacion' && formData.requestType !== 'prueba'
        ? 'Sin Asignar (Sincronizando con Asesor)' 
        : formData.distributor;

      // In case we are auto-assigning a VIP sales advisor at creation (needsAdvisorAssignment is true),
      // we must assign that advisor's distributor to the lead
      if (needsAdvisorAssignment && minWaitingAdvisor?.distributor) {
        chosenDistName = minWaitingAdvisor.distributor;
      }

      let disId = '';
      if (chosenDistName && chosenDistName !== 'Sin Asignar (Sincronizando con Asesor)') {
        // Find inside allDbDistributors (which contains ALL distributors from the DB unfiltered)
        const matchedDb = allDbDistributors?.find(d => d.name === chosenDistName) || dbDistributors?.find(d => d.name === chosenDistName);
        if (matchedDb && (matchedDb.disId || matchedDb.id)) {
          disId = matchedDb.disId || matchedDb.id;
        } else {
          const matchedLocal = ALL_DEALERS.find(d => d.name === chosenDistName);
          if (matchedLocal) {
            disId = matchedLocal.id;
          }
        }
      }

      const payload = {
        name: formData.name.trim(),
        lastName: formData.lastName.trim(),
        email: cleanEmail,
        phone: formData.phone.trim(),
        postalCode: formData.postalCode.trim() || null,
        state: formData.state,
        distributor: chosenDistName,
        disId: disId,
        modelOfInterest: formData.modelOfInterest,
        modelClaveGen: modelClaveGen,
        contactMethod: formData.contactMethod,
        requestType: formData.requestType,
        status: LeadStatus.WAITING,
        advisorId: activeLanding === 'leapmotor' 
          ? "" 
          : (formData.requestType === 'cotizacion' || formData.requestType === 'prueba' ? "" : (minWaitingAdvisor?.id || "")),
        advisorName: activeLanding === 'leapmotor' 
          ? (formData.requestType === 'cotizacion' ? "Sin Asignar (Solo Cotización)" : (formData.requestType === 'prueba' ? "Sin Asignar (Solo Prueba)" : "Sin Asignar (Pool Leapmotor)")) 
          : (formData.requestType === 'cotizacion' ? "Sin Asignar (Solo Cotización)" : (formData.requestType === 'prueba' ? "Sin Asignar (Solo Prueba de Manejo)" : (minWaitingAdvisor?.name || "Sin Asignar"))),
        createdAt: serverTimestamp(),
        // New features parameters
        landing: activeLanding,
        selectedBrand: activeBrand,
        testDriveDate: formData.requestType === 'prueba' ? formData.testDriveDate : null,
        // UTM parameters
        utm_source: utmParams.utm_source || null,
        utm_medium: utmParams.utm_medium || null,
        utm_campaign: utmParams.utm_campaign || null,
        utm_term: utmParams.utm_term || null,
        utm_content: utmParams.utm_content || null
      };

      await setDoc(newLeadDoc, payload);

      // Leapmotor cotización and prueba leads are now sent during the nightly cron job instead of real time.
      // This allows grouping and processing of all leads overnight using the designated Netcar/Stellantis APIs.

      setRegisteredLeadId(leadId);
      setSuccess(true);
    } catch (err: any) {
      console.error("Firestore submit error details:", err);
      const errorMessage = err?.message || (typeof err === 'string' ? err : '');
      const detail = errorMessage ? ` [Detalle: ${errorMessage}]` : '';
      setErrorText(`Error al registrar sus datos. Conexión de red inestable.${detail}`);
      try {
        handleFirestoreError(err, OperationType.CREATE, 'leads');
      } catch (formattedErr) {}
    } finally {
      setLoading(false);
    }
  };

  // Get active brand based on landing or selection
  const activeBrandKey = activeLanding === 'jeep' ? 'JEEP' : selectedBrand.toUpperCase();
  
  // Filter dealers. Fallback to JEEP if activeBrandKey is empty or not found
  const activeDealers = ALL_DEALERS.filter(d => d.brand === activeBrandKey).length > 0
    ? ALL_DEALERS.filter(d => d.brand === activeBrandKey)
    : ALL_DEALERS.filter(d => d.brand === 'JEEP');

  // Get list of states from activeDealers
  let availableStates = Array.from(new Set(activeDealers.map(d => d.state))).sort();
  if (activeLanding === 'leapmotor') {
    availableStates = ['CIUDAD DE MÉXICO', 'ESTADO DE MÉXICO', 'MORELOS'];
  }

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
        accent: 'bg-[#22372B]',
        hoverAccent: 'hover:bg-[#15231b]',
        bgPill: 'bg-[#22372B]/70 border-[#22372B]/50',
        textAccent: 'text-[#87a091]',
        borderAccent: 'border-[#22372B]',
        btnBg: 'bg-[#22372B] hover:bg-[#15231b]',
        successGradient: 'from-[#22372B] to-[#3a5444]',
        thankYouBadge: 'bg-[#22372B]/20 text-[#a3b899] border border-[#22372B]/30'
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
    ? 'space-y-1 bg-[#035F1D]/10 p-2 sm:p-2.5 rounded-xl border border-[#009100]/25 hover:border-[#deff01]/40 hover:bg-[#035F1D]/15 transition-all duration-350'
    : (activeLanding === 'jeep'
       ? 'space-y-1 bg-slate-950/40 p-2 sm:p-2.5 rounded-xl border border-[#424D07] hover:border-[#424D07]/80 transition-all duration-350 shadow-inner'
       : 'space-y-1 bg-slate-900/60 p-2 sm:p-2.5 rounded-xl border border-white/15 hover:border-white/20 transition-all duration-350');

  const inputClass = activeLanding === 'leapmotor'
    ? 'w-full bg-[#2D2926] border border-[#deff01] focus:border-[#deff01] focus:ring-1 focus:ring-[#deff01]/40 rounded-xl pl-9 pr-3 py-2 sm:py-2.5 text-base md:text-xs text-slate-100 placeholder-slate-500 outline-none transition font-semibold font-sans'
    : (activeLanding === 'jeep'
       ? 'w-full bg-[#0d1411] border border-[#424D07] focus:border-[#424D07] focus:ring-1 focus:ring-[#424D07]/40 rounded-xl pl-9 pr-3 py-2 sm:py-2.5 text-base md:text-xs text-white placeholder-slate-400 outline-none transition font-semibold'
       : 'w-full bg-[#0a0f18] border border-white/25 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/40 rounded-xl pl-9 pr-3 py-2 sm:py-2.5 text-base md:text-xs text-white placeholder-slate-400 outline-none transition font-semibold');

  return (
    <div 
      className="w-full text-slate-100 flex flex-col justify-start items-center min-h-screen transition-all duration-500" 
      id="landing-page-view"
      style={activeLanding === 'multimarca' ? { backgroundColor: '#243782' } : undefined}
    >
      
      {/* Outer Mobile Mock Wrapper with Pantone 2427C and Highlight R0 G145 B0 theme */}
      <div 
        style={activeLanding === 'leapmotor' && !formActive ? {
          backgroundImage: `url(${LEAPMOTOR_TUNNEL_BG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : (activeLanding === 'multimarca' ? {
          backgroundColor: '#243782'
        } : undefined)}
        className={`w-full max-w-md mx-auto h-[100dvh] sm:h-auto sm:min-h-[82vh] border-0 sm:border rounded-none sm:rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col justify-between mt-0 sm:mt-1 mb-0 sm:mb-6 transition-all duration-500 ${
          activeLanding === 'leapmotor'
            ? 'bg-black border-[#009100]/40 shadow-[0_0_35px_rgba(0,145,0,0.25)]'
            : (activeLanding === 'jeep'
               ? 'bg-[#050807] border-[#22372B]/60 shadow-[0_0_35px_rgba(34,55,43,0.35)]'
               : (activeLanding === 'multimarca' ? 'bg-[#243782] border-white/10 shadow-[0_0_35px_rgba(36,55,130,0.25)]' : 'bg-[#05070a] border-white/10'))
        }`}
      >
        
        {/* Subtle Decorative Auras tailored by theme */}
        {activeLanding === 'leapmotor' ? null : (
          <>
            <div className={`absolute top-20 left-12 w-60 h-60 ${activeLanding === 'jeep' ? 'bg-[#22372B]/20' : (activeLanding === 'multimarca' ? 'bg-indigo-600/5' : 'bg-blue-600/10')} blur-[80px] rounded-full pointer-events-none -translate-x-1/2`} />
            <div className={`absolute bottom-20 right-12 w-60 h-60 ${activeLanding === 'jeep' ? 'bg-[#22372B]/10' : (activeLanding === 'multimarca' ? 'bg-purple-600/5' : 'bg-purple-600/10')} blur-[80px] rounded-full pointer-events-none translate-x-1/2`} />
          </>
        )}

        {/* Brand Header */}
        <div 
          style={activeLanding === 'leapmotor' ? {
            paddingBottom: '0px',
            paddingTop: '0px',
            marginBottom: '-7px',
            height: '114px'
          } : (activeLanding === 'jeep' ? {
            paddingBottom: '0px',
            paddingTop: '8px',
            height: formActive ? '120px' : '122px'
          } : { 
            paddingBottom: '0px',
            height: '120px',
            backgroundColor: activeLanding === 'multimarca' ? '#103586' : undefined
          })}
          className={`px-6 ${activeLanding === 'multimarca' && selectedSubBrand !== null ? 'hidden' : (activeLanding === 'leapmotor' ? 'py-1 border-b border-white/5 relative z-10' : (activeLanding === 'multimarca' ? 'py-4 bg-[#103586] border-b border-white/5 relative z-10' : 'py-4 bg-[#05070a]/90 border-b border-white/5 relative z-10'))} flex ${activeLanding === 'multimarca' || activeLanding === 'leapmotor' || activeLanding === 'jeep' ? 'justify-center' : 'justify-between'} items-center ${activeLanding === 'leapmotor' ? '' : 'backdrop-blur-md'} sticky top-0 z-25`}
        >
          {activeLanding === 'leapmotor' && (
            <div style={{ height: '102px' }} className="flex items-center justify-center w-full max-w-full py-3 sm:py-5">
              <LeapmotorLogo 
                size="lg" 
                variant="outline"
                className="text-white mx-auto" 
                style={{ height: 'clamp(82px, 19vw, 118px)', aspectRatio: 'auto', maxWidth: '100%', width: 'auto' }} 
                imgStyle={{ height: 'clamp(60px, 14vw, 86px)', width: 'auto', objectFit: 'contain' }} 
              />
            </div>
          )}
          
          {activeLanding === 'jeep' && (
            <div style={{ height: formActive ? '72px' : '90px' }} className="flex items-center justify-center w-full select-none">
              <img 
                src={JEEP_HEADER_LOGO_IMG} 
                alt="Jeep"
                referrerPolicy="no-referrer"
                style={{ height: formActive ? '64px' : '80px', maxHeight: '100%', width: 'auto', objectFit: 'contain' }}
                className="pointer-events-none"
              />
            </div>
          )}

          {false && (
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

          {activeLanding === 'multimarca' && selectedSubBrand === null && (
            <div className="flex items-center justify-center py-4 h-28 select-none">
              <img 
                src={STELLANTIS_HEADER_LOGO_TRANSPARENT_IMG} 
                alt="Stellantis"
                referrerPolicy="no-referrer"
                style={{ height: '102px', maxHeight: '100%', width: 'auto', objectFit: 'contain' }}
                className="pointer-events-none block"
              />
            </div>
          )}
        </div>

        {/* Content Sheets (Landing / Form / Success) */}
        <AnimatePresence mode="wait">
          
          {/* STEP 1: LANDINGS SHEETS */}
          {!formActive && !success && (
            <motion.div
              key={`${activeLanding}-sheet`}
              style={{ 
                paddingTop: '0px', 
                marginLeft: '0px', 
                marginTop: '0px',
                backgroundColor: activeLanding === 'multimarca' ? '#103586' : (activeLanding === 'jeep' ? '#ffffff' : undefined)
              }}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className={`px-6 ${activeLanding === 'leapmotor' ? 'pt-2 pb-5 relative z-10 flex flex-col justify-between h-full' : (activeLanding === 'multimarca' ? 'py-4 gap-4 relative z-10 flex flex-col justify-start bg-[#103586]' : (activeLanding === 'jeep' ? 'py-4 gap-4 relative z-10 flex flex-col justify-start bg-[#ffffff]' : 'py-4 gap-4 relative z-10 flex flex-col justify-start'))} flex-1`}
            >
              {/* LEAPMOTOR LANDING VIEW - Professional Presentation Deck Layout */}
              {activeLanding === 'leapmotor' && (
                <div className="flex-1 flex flex-col justify-between w-full h-full">
                  {/* TOP CONTAINER - Always stays at the top */}
                  <div className="flex flex-col items-center text-center space-y-4 pt-1">
                    <span className="text-[12px] font-black tracking-[0.25em] text-[#deff01] uppercase block animate-pulse drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
                      Tranquilidad sin límites
                    </span>
                    
                    <h1 style={{ fontWeight: '900', fontSize: '24px', marginBottom: '7px' }} className="text-[#deff01] font-sans tracking-tight uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                      LEAPMOTOR B10
                    </h1>
                    
                    <p style={{ paddingTop: '9px', paddingBottom: '9px' }} className="text-slate-100 text-[13px] max-w-xs leading-relaxed font-semibold px-4 bg-black/55 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl drop-shadow-[0_4px_10px_rgba(0,0,0,0.7)] text-center">
                      LEAPMOTOR te da confianza y seguridad para tu camino. Una marca con más de 85 años de respaldo en México
                    </p>
                  </div>

                  {/* BOTTOM CONTAINER - Always stays at the bottom */}
                  <div className="space-y-4 pb-2 mt-auto">
                    {/* Features Row - Tecnología, Autonomía, Respaldo de Mopar */}
                    <div 
                      style={{ paddingTop: '8px', paddingBottom: '6px', marginBottom: '8px' }}
                      className="grid grid-cols-3 gap-1.5 border-y border-[#deff01]/20 bg-black/60 backdrop-blur-md rounded-2xl px-1.5 shadow-xl border border-white/5"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-8.5 h-8.5 rounded-full bg-[#deff01]/10 border border-[#deff01]/30 flex items-center justify-center text-[#deff01] shadow-inner">
                          <Cpu className="w-4 h-4 text-[#deff01]" />
                        </div>
                        <span className="text-[8.5px] text-slate-100 font-extrabold leading-tight font-sans uppercase text-center max-w-[85px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">Tecnología Ultra Híbrida</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-8.5 h-8.5 rounded-full bg-[#deff01]/10 border border-[#deff01]/30 flex items-center justify-center text-[#deff01] shadow-inner animate-pulse">
                          <Route className="w-4 h-4 text-[#deff01]" />
                        </div>
                        <span className="text-[8.5px] text-slate-100 font-extrabold leading-tight font-sans uppercase text-center max-w-[85px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">Autonomía hasta 990 Kms</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-8.5 h-8.5 rounded-full bg-[#deff01]/10 border border-[#deff01]/30 flex items-center justify-center text-[#deff01] shadow-inner">
                          <Wrench className="w-4 h-4 text-[#deff01]" />
                        </div>
                        <span className="text-[8.5px] text-slate-100 font-extrabold leading-tight font-sans uppercase text-center max-w-[85px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">Respaldo de Mopar</span>
                      </div>
                    </div>

                    {/* Dual CTA Buttons */}
                    <div className="flex flex-col gap-2.5">
                      <button
                        onClick={() => launchFormWithRequest('cotizacion', 'B10')}
                        style={{ paddingBottom: '12px' }}
                        className="bg-[#035F1D] hover:bg-[#009100] text-white font-extrabold pt-3.5 px-4 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-95 shadow-lg shadow-[#035F1D]/45 border border-[#009100]/40 w-full"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Cotizar</span>
                      </button>
                      
                      <button
                        onClick={() => launchFormWithRequest('asesor', 'B10')}
                        style={{ paddingBottom: '14px', marginBottom: '-24px' }}
                        className="bg-[#deff01] hover:bg-[#c9e600] text-slate-950 font-extrabold pt-3.5 px-4 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-95 shadow-lg shadow-[rgba(222,255,1,0.3)] border border-[#deff01]/50 w-full"
                      >
                        <UserCheck className="w-4 h-4 text-slate-950 shrink-0" />
                        <span>Atención Personalizada</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* JEEP EXPERIENTIAL LANDING VIEW */}
              {activeLanding === 'jeep' && (
                <div className="space-y-4 text-center mt-1">
                  
                  <p 
                    style={{ fontSize: '19px', marginTop: '14px' }}
                    className="text-slate-800 font-semibold max-w-xs mx-auto leading-relaxed"
                  >
                    Híbrido por Naturaleza
                  </p>

                  {/* Cherokee Image Asset */}
                  <div className="relative my-1 select-none overflow-hidden rounded-2xl border border-[#22372B]/20 group bg-slate-900/5 shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
                    <img 
                      src={JEEP_IMG} 
                      alt="Jeep Cherokee 2026"
                      referrerPolicy="no-referrer"
                      className="w-full h-auto block rounded-2xl transform transition-transform duration-700"
                    />
                  </div>

                  {/* Highlights Row */}
                  <div 
                    style={{ borderColor: '#7d9267' }} 
                    className="grid grid-cols-3 gap-2 py-3 border-y bg-transparent rounded-xl"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div 
                        style={{ borderColor: '#7d9267' }} 
                        className="w-11 h-11 rounded-full bg-transparent border flex items-center justify-center text-[#7d9267] shadow-inner"
                      >
                        <Compass className="w-6 h-6 text-[#7d9267]" style={{ borderColor: '#7d9267' }} />
                      </div>
                      <span style={{ color: '#000000' }} className="text-[10px] sm:text-[11px] font-extrabold uppercase font-sans tracking-wide">Terrain 4x4</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div 
                        style={{ borderColor: '#7d9267' }} 
                        className="w-11 h-11 rounded-full bg-transparent border flex items-center justify-center text-[#7d9267] shadow-inner"
                      >
                        <Zap className="w-6 h-6 text-[#7d9267]" style={{ borderColor: '#7d9267' }} />
                      </div>
                      <span style={{ color: '#000000' }} className="text-[10px] sm:text-[11px] font-extrabold uppercase font-sans tracking-wide">Hemi-Hybrid</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div 
                        style={{ borderColor: '#7d9267' }} 
                        className="w-11 h-11 rounded-full bg-transparent border flex items-center justify-center text-[#7d9267] shadow-inner"
                      >
                        <Award className="w-6 h-6 text-[#7d9267]" style={{ borderColor: '#7d9267' }} />
                      </div>
                      <span style={{ color: '#000000' }} className="text-[10px] sm:text-[11px] font-extrabold uppercase font-sans tracking-wide">Trail Rated</span>
                    </div>
                  </div>

                  {/* Three CTA buttons including personalized maps */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => launchFormWithRequest('cotizacion', 'Jeep Cherokee')}
                      style={{ backgroundColor: '#7d9267' }}
                      className="text-white hover:bg-[#8da376] font-extrabold py-3.5 px-4 rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-95 shadow-md shadow-[#7d9267]/25 col-span-1"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-100" />
                      <span>Cotización</span>
                    </button>
                    <button
                      onClick={() => launchFormWithRequest('prueba', 'Jeep Cherokee')}
                      style={{ backgroundColor: '#7d9267' }}
                      className="text-white hover:bg-[#8da376] font-extrabold py-3.5 px-4 rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-95 col-span-1"
                    >
                      <Key className="w-3.5 h-3.5 text-white" style={{ borderColor: '#ffffff' }} />
                      <span>Prueba de Manejo</span>
                    </button>

                    <button
                      onClick={() => setShowStellantisMap(true)}
                      style={{ borderColor: '#7d9267', backgroundColor: '#ffffff' }}
                      className="hover:bg-slate-50 border font-extrabold py-3 px-4 rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-95 col-span-2 shadow-sm text-[#7d9267]"
                    >
                      <Map className="w-3.5 h-3.5" style={{ color: '#7d9267' }} />
                      <span style={{ color: '#7d9267' }}>Atención Personalizada (Ver Ubicación)</span>
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
                        <h1 
                          style={{ fontSize: '14px', lineHeight: '30px' }}
                          className="font-bold tracking-[0.16em] text-white uppercase font-encode"
                        >
                          ELIGE LA MARCA DE TU INTERÉS
                        </h1>
                      </div>

                      {/* Stacked Brand boxes (All identical size, stacked vertically, centering the brand logos) */}
                      <div className="flex flex-col gap-1.5 pt-1">
                        {['Leapmotor', 'Jeep', 'Fiat', 'Dodge', 'Peugeot', 'Ram'].map((brand) => {
                          if (brand === 'Leapmotor') {
                            return (
                              <button
                                key={brand}
                                onClick={() => {
                                  handleBrandSelect(brand);
                                  setSelectedSubBrand(brand);
                                }}
                                style={{ height: '92.5px', backgroundColor: '#000000' }}
                                className="relative overflow-hidden rounded-2xl border border-white/10 bg-black w-full flex items-center justify-center select-none shadow-lg shadow-black/20 cursor-pointer"
                              >
                                <img 
                                  src={LEAPMOTOR_LOGO_NEW_IMG} 
                                  alt="Leapmotor"
                                  referrerPolicy="no-referrer"
                                  className="w-auto max-w-[85%] max-h-[50%] object-contain pointer-events-none p-0.5"
                                  style={{ mixBlendMode: 'normal' }}
                                />
                              </button>
                            );
                          }
                          if (brand === 'Jeep') {
                            return (
                              <button
                                key={brand}
                                onClick={() => {
                                  handleBrandSelect(brand);
                                  setSelectedSubBrand(brand);
                                }}
                                style={{ backgroundColor: '#000000' }}
                                className="relative overflow-hidden rounded-2xl border border-white/10 bg-black h-20 sm:h-24 w-full flex items-center justify-center select-none shadow-lg shadow-black/20 cursor-pointer"
                              >
                                <img 
                                  src={JEEP_LOGO_IMG} 
                                  alt="Jeep"
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-contain pointer-events-none scale-[1.5] p-1"
                                />
                              </button>
                            );
                          }
                          if (brand === 'Fiat') {
                            return (
                              <button
                                key={brand}
                                onClick={() => {
                                  handleBrandSelect(brand);
                                  setSelectedSubBrand(brand);
                                }}
                                style={{ backgroundColor: '#000000' }}
                                className="relative overflow-hidden rounded-2xl border border-white/10 bg-black h-20 sm:h-24 w-full flex items-center justify-center select-none shadow-lg shadow-black/20 cursor-pointer"
                              >
                                <img 
                                  src={FIAT_LOGO_IMG} 
                                  alt="Fiat"
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-contain pointer-events-none p-3 sm:p-3.5"
                                />
                              </button>
                            );
                          }
                          if (brand === 'Dodge') {
                            return (
                              <button
                                key={brand}
                                onClick={() => {
                                  handleBrandSelect(brand);
                                  setSelectedSubBrand(brand);
                                }}
                                style={{ backgroundColor: '#000000' }}
                                className="relative overflow-hidden rounded-2xl border border-white/10 bg-black h-20 sm:h-24 w-full flex items-center justify-center select-none shadow-lg shadow-black/20 cursor-pointer"
                              >
                                <img 
                                  src={DODGE_LOGO_IMG} 
                                  alt="Dodge"
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-contain pointer-events-none scale-[1.15] p-2"
                                />
                              </button>
                            );
                          }
                          if (brand === 'Peugeot') {
                            return (
                              <button
                                key={brand}
                                onClick={() => {
                                  handleBrandSelect(brand);
                                  setSelectedSubBrand(brand);
                                }}
                                style={{ backgroundColor: '#000000' }}
                                className="relative overflow-hidden rounded-2xl border border-white/10 bg-black h-20 sm:h-24 w-full flex items-center justify-center select-none shadow-lg shadow-black/20 cursor-pointer"
                              >
                                <img 
                                  src={PEUGEOT_LOGO_IMG} 
                                  alt="Peugeot"
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-contain pointer-events-none scale-[1.48] p-1"
                                />
                              </button>
                            );
                          }
                          if (brand === 'Ram') {
                            return (
                              <button
                                key={brand}
                                onClick={() => {
                                  handleBrandSelect(brand);
                                  setSelectedSubBrand(brand);
                                }}
                                style={{ backgroundColor: '#000000' }}
                                className="relative overflow-hidden rounded-2xl border border-white/10 bg-black h-20 sm:h-24 w-full flex items-center justify-center select-none shadow-lg shadow-black/20 cursor-pointer"
                              >
                                <img 
                                  src={RAM_LOGO_IMG} 
                                  alt="Ram"
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-contain pointer-events-none scale-[1.2] p-1.5 sm:p-2"
                                />
                              </button>
                            );
                          }
                          return (
                            <button
                              key={brand}
                              onClick={() => {
                                handleBrandSelect(brand);
                                setSelectedSubBrand(brand);
                              }}
                              style={{ backgroundColor: '#000000' }}
                              className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-black hover:bg-zinc-900 hover:border-white/20 h-20 sm:h-24 w-full flex items-center justify-center select-none transition-all duration-300 transform active:scale-[0.99] shadow-lg shadow-black/20`}
                            >
                              {/* Centralized Brand Logo */}
                              <div className="z-10 flex items-center justify-center w-full px-8 pointer-events-none transition-transform duration-300 group-hover:scale-[1.02]">
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
                        bgImage: selectedSubBrand === 'Leapmotor' && b10ImgUrl
                          ? b10ImgUrl
                          : brandDetailSource.bgImage
                      };
                      return (
                        <div className="relative flex flex-col w-full text-center pb-6 select-none overflow-hidden gap-5 items-center">
                          {/* Ambient Brand Color Glow Dressing */}
                          <div 
                            className="absolute top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[110px] opacity-[0.18] pointer-events-none transition-all duration-700" 
                            style={{ backgroundColor: brandDetail.pantoneHex }}
                          />

                          {/* Premium mockup top navbar heading */}
                          <div className="flex items-center justify-start pt-5 px-4 z-10 w-full mb-1">
                            <button
                              onClick={() => setSelectedSubBrand(null)}
                              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white text-sm font-bold tracking-wider transition duration-300 active:scale-[0.98] shadow-sm"
                              aria-label="Regresar"
                            >
                              <ArrowLeft className="w-5 h-5 text-indigo-400" />
                              <span>Regresar</span>
                            </button>
                          </div>

                          {/* Brand Logo right above the car photo */}
                          <div className="z-10 px-5 flex items-center justify-center [&_img]:max-h-36 [&_img]:w-auto [&_img]:object-contain w-full">
                            <div className="w-full max-w-[280px] flex items-center justify-center">
                              {renderBrandLogo(selectedSubBrand, true, true)}
                            </div>
                          </div>

                          {/* Representative high-contrast car picture on dark gradient */}
                          <div className="relative aspect-[16/10] w-full max-w-[420px] mx-auto overflow-hidden rounded-2xl border border-white/5 bg-black/40 shadow-xl shadow-black/40 z-10">
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
                          <div className="px-5 z-10 w-full text-center">
                            <h3 className="text-sm sm:text-base font-bold text-white tracking-widest uppercase font-encode text-slate-300">
                              ¿Qué deseas hacer?
                            </h3>
                          </div>

                          {/* Interactive stacked button panels - Matching the mockup */}
                          <div className="space-y-3 px-4 z-10 w-full max-w-[420px] mx-auto">
                            {/* COTIZA */}
                            <button
                              onClick={() => launchFormWithRequest('cotizacion', BRAND_MODELS[selectedSubBrand]?.[0])}
                              className="group w-full p-4 rounded-2xl bg-[#1b1c1e]/60 hover:bg-[#25272a]/75 border border-white/5 hover:border-white/15 flex items-center gap-4 text-left transition-all duration-300 shadow-md transform active:scale-[0.99]"
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
                                className="group w-full p-4 rounded-2xl bg-[#1b1c1e]/60 hover:bg-[#25272a]/75 border border-white/5 hover:border-white/15 flex items-center gap-4 text-left transition-all duration-300 shadow-md transform active:scale-[0.99]"
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
              className="px-4 sm:px-6 py-3 sm:py-4 flex flex-col gap-2 sm:gap-3 flex-1 min-h-0 relative z-10 overflow-y-auto custom-scrollbar"
              style={{ paddingTop: '4px', paddingBottom: '4px', scrollbarWidth: 'thin' }}
            >
              <div>
                {/* Back Link */}
                <button 
                  onClick={() => setFormActive(false)}
                  className={`flex items-center gap-1.5 text-white hover:text-slate-200 text-[11px] font-semibold ${activeLanding === 'leapmotor' ? 'font-sans' : 'font-mono'} mb-4 transition bg-white/10 px-2 py-1 rounded`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{(activeLanding === 'leapmotor' || activeLanding === 'jeep') ? 'Regresar' : 'Volver a la Landing'}</span>
                </button>

                <h2 className={`text-xl tracking-wide text-white mb-1 uppercase font-sans ${activeLanding === 'leapmotor' ? 'font-semibold' : 'font-black'}`}>
                  DÉJANOS TUS DATOS
                </h2>
                {activeLanding !== 'leapmotor' && activeLanding !== 'jeep' && (
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
                  {activeLanding === 'jeep' ? (
                    <>
                      {/* Rearranged compact layout for Jeep Cherokee */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className={rowClass}>
                          <label id="frm-name-label" htmlFor="name" className="text-[11px] uppercase font-mono tracking-wider block mb-0.5 text-white font-extrabold truncate">
                            Nombre *
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                            <input
                              id="name"
                              type="text"
                              name="name"
                              required
                              placeholder="Nombre"
                              value={formData.name}
                              onChange={handleChange}
                              className={inputClass}
                            />
                          </div>
                        </div>

                        <div className={rowClass}>
                          <label id="frm-lastname-label" htmlFor="lastName" className="text-[11px] uppercase font-mono tracking-wider block mb-0.5 text-white font-extrabold truncate">
                            Apellido *
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                            <input
                              id="lastName"
                              type="text"
                              name="lastName"
                              required
                              placeholder="Apellido"
                              value={formData.lastName}
                              onChange={handleChange}
                              className={inputClass}
                            />
                          </div>
                        </div>
                      </div>

                      <div className={rowClass}>
                        <label id="frm-email-label" htmlFor="email" className="text-[11px] uppercase font-mono tracking-wider block mb-0.5 text-white font-extrabold">
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

                      <div className="grid grid-cols-2 gap-2.5">
                        <div className={rowClass}>
                          <label id="frm-phone-label" htmlFor="phone" className="text-[11px] uppercase font-mono tracking-wider block mb-0.5 text-white font-extrabold truncate">
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

                        <div className={rowClass}>
                          <label id="frm-postalcode-label" htmlFor="postalCode" className="text-[11px] uppercase font-mono tracking-wider block mb-0.5 text-white font-extrabold truncate" title="Tu Código Postal *">
                            C.P. *
                          </label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                            <input
                              id="postalCode"
                              type="text"
                              name="postalCode"
                              required
                              maxLength={5}
                              placeholder="C.P."
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
                    </>
                  ) : (
                    <>
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
                          <label id="frm-postalcode-label" htmlFor="postalCode" className={`text-[11px] uppercase ${activeLanding === 'leapmotor' ? 'font-sans' : 'font-mono'} tracking-wider block mb-0.5 truncate ${activeLanding === 'leapmotor' ? 'font-semibold text-white' : 'text-white font-extrabold'}`} title="Tu Código Postal *">
                            {activeLanding === 'multimarca' ? 'C.P. *' : 'Tu Código Postal *'}
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
                          {activeLanding === 'multimarca' ? 'Correo *' : 'Correo Electrónico *'}
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
                      {activeLanding !== 'leapmotor' && activeLanding !== 'jeep' && (
                        <div className={rowClass}>
                          <label id="frm-model-label" className={`text-[11px] uppercase ${activeLanding === 'leapmotor' ? 'font-sans' : 'font-mono'} tracking-wider block mb-0.5 ${activeLanding === 'leapmotor' ? 'font-semibold text-white' : 'text-white font-extrabold'}`}>
                            {activeLanding === 'multimarca' ? 'Modelo *' : 'Modelo Seleccionado *'}
                          </label>
                          
                          {(activeLanding === 'jeep' || activeLanding === 'multimarca') ? (
                            /* Custom visually rich selection trigger */
                            <div className="relative">
                              <Car className="absolute left-3.5 top-3 w-4 h-4 text-slate-300 pointer-events-none" />
                              <button
                                type="button"
                                id="model-modal-trigger-btn"
                                disabled={activeLanding === 'jeep'}
                                style={{ backgroundColor: '#deff01' }}
                                onClick={() => {
                                  if (activeLanding === 'jeep') return;
                                  // Ensure formData of interest is initialized correctly of the active brand if empty
                                  if (!formData.modelOfInterest || !activeModelsList.includes(formData.modelOfInterest)) {
                                    setFormData(prev => ({ ...prev, modelOfInterest: activeModelsList[0] }));
                                  }
                                  setShowModelModal(true);
                                }}
                                className={`w-full text-left bg-[#0a0f18] text-slate-950 border border-white/25 rounded-xl pl-11 pr-7 py-2.5 text-xs outline-none transition uppercase ${activeLanding === 'leapmotor' ? 'font-sans' : 'font-mono'} font-bold flex items-center justify-between disabled:opacity-75 disabled:cursor-not-allowed`}
                              >
                                <span className="truncate text-slate-950">
                                  {selectedBrand} {formData.modelOfInterest || activeModelsList[0]}
                                </span>
                                {activeLanding !== 'jeep' && <ChevronDown className="w-3.5 h-3.5 text-slate-950 shrink-0" />}
                              </button>
                            </div>
                          ) : (
                            /* Standard selection select block for single leapmotor landing */
                            <div className="relative">
                              <Car className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                              <select
                                id="modelOfInterest"
                                name="modelOfInterest"
                                required
                                disabled={selectedBrand === 'Leapmotor'}
                                value={formData.modelOfInterest}
                                onChange={handleChange}
                                className={`w-full text-white rounded-xl pl-11 pr-7 py-2.5 text-base md:text-xs outline-none appearance-none transition uppercase ${activeLanding === 'leapmotor' ? 'font-sans' : 'font-mono'} disabled:opacity-85 disabled:cursor-not-allowed ${
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
                      )}
                    </>
                  )}

                  {/* Estado y Distribuidor / State and Distributor cascading selectors */}
                  {(activeLanding !== 'leapmotor' || formData.requestType === 'cotizacion') && (
                    <div className="space-y-3.5 animate-fade-in">
                      {/* Estado selector */}
                      <div className={rowClass}>
                        <label id="frm-state-label" htmlFor="state" className={`text-[11px] uppercase ${activeLanding === 'leapmotor' ? 'font-sans' : 'font-mono'} tracking-wider block mb-0.5 ${activeLanding === 'leapmotor' ? 'font-semibold text-white' : 'text-white font-extrabold'}`}>
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
                              setFormData(prev => ({
                                ...prev,
                                state: stateValue
                              }));
                            }}
                            className={`w-full text-white rounded-xl pl-11 pr-7 py-2.5 text-base md:text-xs outline-none appearance-none transition uppercase ${activeLanding === 'leapmotor' ? 'font-sans' : 'font-mono'} ${
                              activeLanding === 'leapmotor'
                                ? 'bg-[#2D2926] border border-[#deff01] focus:border-[#deff01] font-semibold'
                                : (activeLanding === 'jeep'
                                   ? 'bg-[#0d1411] border border-[#424D07] focus:border-[#424D07] font-semibold'
                                   : 'bg-[#0a0f18] border border-white/25 focus:border-indigo-400 font-bold')
                            }`}
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
                      <div className={rowClass}>
                        <label id="frm-distributor-label" htmlFor="distributor" className={`text-[11px] uppercase ${activeLanding === 'leapmotor' ? 'font-sans' : 'font-mono'} tracking-wider block mb-0.5 ${activeLanding === 'leapmotor' ? 'font-semibold text-white' : 'text-white font-extrabold'}`}>
                          {activeLanding === 'multimarca' ? 'Distribuidor *' : 'Distribuidor de Preferencia *'} {loadingDbDistributors && <span className="text-emerald-400 font-bold animate-pulse text-[9px] lowercase">(consultando BD...)</span>}
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
                            className={`w-full text-white rounded-xl pl-11 pr-7 py-2.5 text-base md:text-xs outline-none appearance-none transition uppercase ${activeLanding === 'leapmotor' ? 'font-sans' : 'font-mono'} ${
                              activeLanding === 'leapmotor'
                                ? 'bg-[#2D2926] border border-[#deff01] focus:border-[#deff01] font-semibold'
                                : (activeLanding === 'jeep'
                                   ? 'bg-[#0d1411] border border-[#424D07] focus:border-[#424D07] font-semibold'
                                   : 'bg-[#0a0f18] border border-white/25 focus:border-indigo-400 font-bold')
                            }`}
                          >
                            {loadingDbDistributors ? (
                              <option className="bg-slate-900 text-slate-400">Cargando distribuidores de la BD...</option>
                            ) : dbDistributors.length === 0 ? (
                              <option className="bg-slate-900 text-slate-400">Sin distribuidores registrados</option>
                            ) : (
                              dbDistributors.map((d, idx) => (
                                <option key={(d.disId || d.id || idx) + '-' + d.name} value={d.name} className="bg-slate-900 text-white">
                                  {d.name}
                                </option>
                              ))
                            )}
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
                        className="w-full bg-white/5 border border-amber-500/30 focus:border-amber-500 rounded-xl px-4 py-2.5 text-base md:text-xs text-white outline-none transition font-bold font-mono"
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
                  <div className={`absolute inset-0 w-14 h-14 ${
                    activeLanding === 'leapmotor'
                      ? 'bg-[#deff01]/10'
                      : (formData.requestType === 'prueba' ? 'bg-indigo-500/10' : 'bg-emerald-500/10')
                  } rounded-full blur-md animate-ping`} />
                  {activeLanding === 'leapmotor' ? (
                    <div 
                      style={{ backgroundColor: '#deff01' }}
                      className="w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(222,255,1,0.35)]"
                    >
                      <Check className="w-7 h-7 text-black stroke-[3.5]" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center">
                      <CheckCircle className={`w-8 h-8 ${formData.requestType === 'prueba' ? 'text-indigo-400' : 'text-emerald-400'}`} />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-light text-white leading-tight">
                    ¡Gracias, <span 
                      style={activeLanding === 'leapmotor' || selectedBrand === 'Leapmotor' ? { color: '#deff01', background: 'none', WebkitTextFillColor: 'initial', WebkitBackgroundClip: 'initial' } : undefined}
                      className={activeLanding === 'leapmotor' || selectedBrand === 'Leapmotor' ? "font-extrabold" : `font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${theme.successGradient}`}
                    >
                      {formData.name.split(' ')[0]}
                    </span>!
                  </h3>
                  {activeLanding !== 'leapmotor' && selectedBrand !== 'Leapmotor' && (
                    <p 
                      className="text-sm font-bold text-white"
                    >
                      Tu solicitud ha sido registrada en el sistema.
                    </p>
                  )}
                </div>

                {currentLeadData && (currentLeadData.status === 'attending' || currentLeadData.status === 'attended' || currentLeadData.status === 'lost') && currentLeadData.advisorId && !currentLeadData.advisorName?.includes('Sin Asignar') ? (
                  <div 
                    style={activeLanding === 'leapmotor' ? { borderColor: '#deff01', backgroundColor: 'rgba(222,255,1,0.08)' } : undefined}
                    className={`p-4 rounded-xl max-w-xs mx-auto text-center border transition-all duration-300 ${
                      activeLanding === 'leapmotor'
                        ? 'border-[#deff01] shadow-[0_0_15px_rgba(222,255,1,0.1)]'
                        : (activeLanding === 'jeep'
                           ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                           : 'bg-indigo-950/20 border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.1)]')
                    }`}
                  >
                    {currentLeadData.status === 'attended' || currentLeadData.status === 'lost' ? (
                      <>
                        <div className="flex justify-center items-center gap-2 mb-1.5 animate-pulse">
                          <strong 
                            style={activeLanding === 'leapmotor' ? { color: '#deff01' } : undefined}
                            className={`text-[10px] font-mono font-black tracking-widest uppercase ${
                              activeLanding === 'leapmotor' ? '' : (activeLanding === 'jeep' ? 'text-emerald-400' : 'text-indigo-400')
                            }`}
                          >
                            ✓ ATENCIÓN FINALIZADA
                          </strong>
                        </div>
                        <p className="text-white text-xs font-semibold leading-relaxed">
                          La atención ha concluido. ¡Muchas gracias por tu visita!
                        </p>
                        <p className="text-[10px] text-slate-400 mt-2 font-mono">
                          Redireccionando al inicio...
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-center items-center gap-2 mb-1.5">
                          <span className="relative flex h-2 w-2">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${activeLanding === 'leapmotor' ? 'bg-[#deff01]' : (activeLanding === 'jeep' ? 'bg-emerald-400' : 'bg-indigo-400')}`}></span>
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${activeLanding === 'leapmotor' ? 'bg-[#deff01]' : (activeLanding === 'jeep' ? 'bg-emerald-500' : 'bg-indigo-500')}`}></span>
                          </span>
                          <strong 
                            style={activeLanding === 'leapmotor' ? { color: '#deff01' } : undefined}
                            className={`text-[10px] font-mono font-black tracking-widest uppercase ${
                              activeLanding === 'leapmotor' ? '' : (activeLanding === 'jeep' ? 'text-emerald-400' : 'text-indigo-400')
                            }`}
                          >
                            Atención en Curso
                          </strong>
                        </div>
                        <p className="text-white text-xs font-semibold leading-relaxed">
                          Gracias, te está atendiendo :
                        </p>
                        <p 
                          style={activeLanding === 'leapmotor' ? { color: '#deff01' } : undefined}
                          className={`text-base font-black uppercase tracking-tight mt-1 truncate ${
                            activeLanding === 'leapmotor' ? '' : (activeLanding === 'jeep' ? 'text-emerald-400' : 'text-indigo-400')
                          }`}
                        >
                          {currentLeadData.advisorName}
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  formData.requestType === 'prueba' ? (
                    <div className="p-3 bg-slate-900 border border-indigo-500/20 rounded-2xl max-w-xs mx-auto text-left font-mono text-[11px] leading-relaxed">
                      <div className="text-indigo-400 font-bold block uppercase mb-1 flex items-center gap-1">
                        <Key className="w-3.5 h-3.5" /> TEST DRIVE RESERVADO OK
                      </div>
                      <span>Gracias por agendar tu prueba de manejo, a la brevedad un asesor te contactará para confirmar tu cita.</span>
                    </div>
                  ) : (
                    <p 
                      style={
                        (formData.requestType === 'cotizacion' && (selectedBrand === 'Leapmotor' || activeLanding === 'leapmotor'))
                          ? { color: '#deff01' }
                          : (activeLanding === 'leapmotor' ? { color: '#deff01' } : undefined)
                      }
                      className={`text-xs font-bold font-mono tracking-wide ${
                        (formData.requestType === 'cotizacion' && (selectedBrand === 'Leapmotor' || activeLanding === 'leapmotor'))
                          ? ''
                          : (activeLanding === 'leapmotor' ? '' : 'text-emerald-400')
                      }`}
                    >
                      {formData.requestType === 'cotizacion' && (selectedBrand === 'Leapmotor' || activeLanding === 'leapmotor')
                        ? (activeLanding === 'leapmotor'
                            ? "Aproximadamente en dos minutos un asesor te atenderá."
                            : "Gracias por solicitar una cotización, en breve un asesor se pondrá en contacto."
                          )
                        : (activeLanding === 'leapmotor' 
                            ? "Aproximadamente en dos minutos un asesor te atenderá."
                            : "Un asesor especializado ha recibido tu alerta. Contacto en menos de 2 Minutos."
                          )
                      }
                    </p>
                  )
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
                    className={`w-full h-full object-cover ${(selectedBrand === 'Leapmotor' || selectedBrand === 'Jeep') ? '' : 'brightness-[1.25] contrast-[1.08] saturate-[1.1]'}`}
                  />
                  <div className="absolute inset-x-0 bottom-2 text-[10px] font-bold tracking-[0.2em] uppercase text-white/90">
                    {selectedBrand} {formData.modelOfInterest}
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
                    setRegisteredLeadId('');
                    setCurrentLeadData(null);
                  }}
                  style={activeLanding === 'leapmotor' || selectedBrand === 'Leapmotor' ? {
                    backgroundColor: '#deff01',
                    color: '#000000',
                    borderColor: '#deff01'
                  } : undefined}
                  className={`w-full ${
                    activeLanding === 'leapmotor' || selectedBrand === 'Leapmotor'
                      ? 'text-black font-extrabold hover:opacity-90'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                  } px-6 py-3 rounded-xl text-[10px] font-bold tracking-wider uppercase transition font-mono`}
                >
                  {activeLanding === 'leapmotor' || selectedBrand === 'Leapmotor' ? 'CERRAR' : 'Nuevo Registro de Prueba'}
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
              {/* Map Canvas body */}
              <div className="p-4 flex flex-col items-center gap-3">
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                  <img 
                    src={MAP_800X800_IMG} 
                    alt="Mapa Carpa Stellantis"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="bg-slate-950/60 p-3 rounded-2xl border border-white/5 text-center">
                  <p className="text-[14px] sm:text-[15px] text-slate-200 leading-relaxed font-sans font-semibold">
                    Te esperamos en el hospitality zone de Leapmotor, para que seas atendido por uno de nuestros asesores.
                  </p>
                </div>
              </div>

              {/* Action footer */}
              <div className="p-4 bg-slate-950/80 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowStellantisMap(false)}
                  className="w-full bg-[#22372B] hover:bg-[#15231b] text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-md shadow-[#22372B]/20"
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
