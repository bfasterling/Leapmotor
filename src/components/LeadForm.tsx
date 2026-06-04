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
  FileText,
  Key,
  MessageSquare,
  Calendar,
  Compass,
  Map,
  Layers,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import LeapmotorLogo from './LeapmotorLogo';
import StellantisLogo from './StellantisLogo';

// Import newly generated design assets
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
  'Fiat': ['Pulse', 'Fastback', '500e']
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

  // Renders premium, responsive vector brand logos for the Multimarca experience
  const renderBrandLogo = (brandName: string, isSelected: boolean) => {
    const activeColor = isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-100';
    
    switch (brandName) {
      case 'Leapmotor':
        return (
          <div className="flex flex-col items-center justify-center gap-0.5 w-full px-0.5" id="brand-logo-leapmotor">
            <svg viewBox="0 0 120 40" className={`w-full max-w-[62px] sm:max-w-[75px] h-6.5 sm:h-7.5 fill-current ${activeColor}`} xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(18, 11)" className="fill-current">
                <rect x="0" y="2" width="4.5" height="15" rx="2" />
                <rect x="8.5" y="7" width="4.5" height="10" rx="2" />
              </g>
              <text x="82" y="25" textAnchor="middle" className="font-sans font-black tracking-widest text-[12px] uppercase">
                LEAP
              </text>
            </svg>
          </div>
        );
      case 'Jeep':
        return (
          <div className="flex flex-col items-center justify-center gap-0.5 w-full px-0.5" id="brand-logo-jeep">
            <svg viewBox="0 0 24 24" className={`w-full max-w-[48px] sm:max-w-[58px] h-6 sm:h-7 fill-current ${activeColor}`} xmlns="http://www.w3.org/2000/svg">
              <path d="M4.1651 7.1687v5.2011c0 .6762-.444 1.0777-1.1628 1.0777-.7185 0-1.0992-.5283-1.0992-1.0992v-.9299H0v.9514c0 .972.296 2.7068 3.0235 2.7068 2.7272 0 3.1082-1.8614 3.1082-2.7488V7.1687Zm4.9177 2.1562c-1.7973 0-2.6003 1.6485-2.6003 3.0657 0 1.4168.9094 2.7912 2.7695 2.7912 1.6285.021 2.707-1.0361 2.707-1.8187h-1.7977s-.2113.5078-.8458.5078c-.6343 0-.9934-.3596-.9934-1.2265h3.6576c0-2.7277-1.3526-3.3195-2.897-3.3195zm5.8471 0c-1.7968 0-2.6007 1.6485-2.6007 3.0657 0 1.4168.9094 2.7912 2.7705 2.7912 1.628.021 2.7067-1.0361 2.7067-1.8187h-1.7978s-.2116.5078-.8454.5078c-.6348 0-.9942-.3596-.9942-1.2265h3.6574c0-2.7277-1.3523-3.3195-2.8965-3.3195zm6.7435.0635c-.9132 0-1.3186.4962-1.3401.522-.1283.1538-.2875.3165-.2875-.0782v-.2959h-1.8193v7.295h1.8398V14.822c0-.148.1478-.126.2543 0 .1063.1277.5711.4443 1.3752.4443C23.155 15.2663 24 13.9978 24 12.264c0-2.2415-1.4162-2.8757-2.3266-2.8756Zm-12.401 1.1203c.6766 0 .972.5073.972 1.0365H8.3843c0-.5718.2327-1.0365.8882-1.0365zm5.8468 0c.6767 0 .9724.5073.9724 1.0365H14.231c0-.5718.2332-1.0365.8883-1.0365zm5.9204.296c.9318 0 1.1.7189 1.1 1.4593 0 .74-.1272 1.7124-1.0141 1.7124-.8884 0-1.1212-.5709-1.1017-1.6486.022-1.0788.4441-1.523 1.0158-1.523zm2.2813 4.5664a.5855.5855 0 0 0-.5856.5857c0 .3233.2617.5856.5856.5856.3218 0 .585-.2623.585-.5856 0-.3233-.2632-.5857-.585-.5857zm0 .062a.524.524 0 0 1 .5236.5237c0 .2884-.2346.5246-.5236.5246a.5258.5258 0 0 1-.525-.5246c0-.289.2352-.5236.525-.5236zm-.2108.2024v.6208h.0725v-.2689h.1764l.1159.269h.0806l-.1216-.2873c.0386-.0133.0514-.0227.072-.0447.0266-.0287.0434-.0739.0434-.115 0-.1034-.0796-.174-.195-.174zm.0705.0676h.1722c.072 0 .1177.041.1177.1045 0 .072-.0485.1168-.1278.1168h-.1621z" />
            </svg>
          </div>
        );
      case 'Ram':
        return (
          <div className="flex flex-col items-center justify-center gap-0.5 w-full px-0.5" id="brand-logo-ram">
            <svg viewBox="0 0 140 40" className={`w-full max-w-[80px] sm:max-w-[95px] h-6.5 sm:h-7.5 fill-current ${activeColor}`} xmlns="http://www.w3.org/2000/svg">
              {/* Complex high-fidelity RAM head profile */}
              <g transform="translate(10, 5)" className="fill-none stroke-current">
                <path d="M 12 2 C 18 2, 23 5, 23 11 C 23 15, 19 19, 12 28 C 5 19, 1 15, 1 11 C 1 5, 6 2, 12 2 Z" strokeWidth="1.8" />
                {/* Left concentric horn */}
                <path d="M 11 5 C 7 5, 4 8, 4 11 C 4 14, 7 14, 9 12 C 9 9, 6 9, 5 11" strokeWidth="1.2" />
                {/* Right concentric horn */}
                <path d="M 13 5 C 17 5, 20 8, 20 11 C 20 14, 17 14, 15 12 C 15 9, 18 9, 19 11" strokeWidth="1.2" />
                {/* Nose bridge and base lines */}
                <path d="M 12 9 L 12 20" strokeWidth="1.8" />
                <path d="M 9 19 L 15 19" strokeWidth="1.5" />
              </g>
              <text x="82" y="28" className="font-sans font-black tracking-widest text-[23px] uppercase" style={{ fontWeight: 900 }}>RAM</text>
            </svg>
          </div>
        );
      case 'Dodge':
        return (
          <div className="flex flex-col items-center justify-center gap-0.5 w-full px-0.5" id="brand-logo-dodge">
            <svg viewBox="0 0 145 40" className={`w-full max-w-[85px] sm:max-w-[100px] h-6.5 sm:h-7.5 fill-current ${activeColor}`} xmlns="http://www.w3.org/2000/svg">
              <text x="8" y="28" className="font-sans font-extrabold tracking-wide text-[21px] uppercase" style={{ fontWeight: 950 }}>DODGE</text>
              {/* Precise red dual-wedge design to the right matching the image */}
              <g transform="translate(108, 12)" className="fill-red-500">
                <path d="M 0,16 L 6,16 L 15,0 L 9,0 Z" />
                <path d="M 8,16 L 14,16 L 23,0 L 17,0 Z" />
              </g>
            </svg>
          </div>
        );
      case 'Fiat':
        return (
          <div className="flex flex-col items-center justify-center gap-0.5 w-full px-0.5" id="brand-logo-fiat">
            <svg viewBox="0 0 120 40" className="w-full max-w-[58px] sm:max-w-[75px] h-6.5 sm:h-7.5" xmlns="http://www.w3.org/2000/svg">
              {/* Modern high-tall FIAT letters in the exact brand crimson design matching the image */}
              <g fill="#ff1a24">
                {/* F */}
                <path d="M 22,6 L 31,6 L 31,13 L 26.5,13 L 26.5,17.5 L 30.5,17.5 L 30.5,23.5 L 26.5,23.5 L 26.5,34 L 22,34 Z" />
                {/* I */}
                <path d="M 36,6 L 40.5,6 L 40.5,34 L 36,34 Z" />
                {/* A */}
                <path d="M 45,6 L 50,6 L 54.5,34 L 49.5,34 L 48.5,27.5 L 45.5,27.5 L 44.5,34 L 40,34 Z M 46,22.5 L 48,22.5 L 47.25,12.5 Z" />
                {/* T */}
                <path d="M 58.5,6 L 68.5,6 L 68.5,12 L 65.5,12 L 65.5,34 L 61,34 L 61,12 L 58.5,12 Z" />
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

  // Launch Form sheet instantly from landing CTA clicks
  const launchFormWithRequest = (reqType: 'cotizacion' | 'prueba' | 'asesor', presetModel?: string) => {
    setFormData(prev => ({ 
      ...prev, 
      requestType: reqType,
      modelOfInterest: presetModel || prev.modelOfInterest
    }));
    setFormActive(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault && e.preventDefault();
    setLoading(true);
    setErrorText('');

    const isLeapmotorLanding = activeLanding === 'leapmotor';
    const isDistributorRequired = !isLeapmotorLanding;

    if (!formData.name.trim() || !formData.lastName.trim() || !formData.phone.trim() || !formData.postalCode.trim() || !formData.state.trim() || (isDistributorRequired && !formData.distributor.trim())) {
      setErrorText('Por favor ingresa todos los campos obligatorios (*).');
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

      // Ensure email has fallback if empty
      const cleanEmail = formData.email.trim() || `${formData.name.trim().toLowerCase().replace(/\s+/g, '.')}@stellantis-leads.mx`;

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
      btnBg: 'bg-[#035F1D] hover:bg-[#009100] hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,145,0,0.4)] transition-all duration-300',
      successGradient: 'from-[#035F1D] to-[#009100]',
      thankYouBadge: 'bg-[#009100]/10 text-[#009100] border border-[#009100]/25'
    };
  };

  const theme = getThemeColors();

  // Dynamic input styling based on active branding (Leapmotor Pantone 2427C #035F1D and Highlight #009100)
  const rowClass = activeLanding === 'leapmotor'
    ? 'space-y-1 bg-[#035F1D]/10 p-2.5 rounded-xl border border-[#009100]/25 hover:border-[#009100]/40 hover:bg-[#035F1D]/15 transition-all duration-350'
    : 'space-y-1 bg-slate-900/60 p-2.5 rounded-xl border border-white/15 hover:border-white/20 transition-all duration-350';

  const inputClass = activeLanding === 'leapmotor'
    ? 'w-full bg-[#010602] border border-[#009100]/25 focus:border-[#009100] focus:ring-1 focus:ring-[#009100]/40 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-505 outline-none transition font-semibold font-sans'
    : (activeLanding === 'jeep'
       ? 'w-full bg-[#0a0f18] border border-white/20 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/40 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-400 outline-none transition font-semibold'
       : 'w-full bg-[#0a0f18] border border-white/25 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/40 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-400 outline-none transition font-semibold');

  return (
    <div className="w-full text-slate-100 flex flex-col justify-start items-center" id="landing-page-view">
      
      {/* Outer Mobile Mock Wrapper with Pantone 2427C and Highlight R0 G145 B0 theme */}
      <div className={`w-full max-w-md mx-auto min-h-[82vh] border rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col justify-between mt-1 mb-6 transition-all duration-500 ${
        activeLanding === 'leapmotor'
          ? 'bg-gradient-to-b from-[#010602] via-[#035F1D]/80 to-[#010502] border-[#009100]/40 shadow-[0_0_35px_rgba(0,145,0,0.25)]'
          : 'bg-[#05070a] border-white/10'
      }`}>
        
        {/* Subtle Decorative Auras tailored by theme */}
        {activeLanding === 'leapmotor' ? (
          <>
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#009100]/20 to-transparent blur-[70px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-[#035F1D]/30 to-transparent blur-[90px] rounded-full pointer-events-none" />
            
            {/* Architectural Layout Guide Corner lines imitating layout references */}
            <div className="absolute top-4 left-4 w-7 h-7 border-t border-l border-[#009100]/50 pointer-events-none" />
            <div className="absolute top-4 right-4 w-7 h-7 border-t border-r border-[#009100]/50 pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-7 h-7 border-b border-l border-[#009100]/50 pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-7 h-7 border-b border-r border-[#009100]/50 pointer-events-none" />
            
            {/* Tech line dividers */}
            <div className="absolute top-10 inset-x-5 h-[1px] bg-[#009100]/15 pointer-events-none" />
            <div className="absolute bottom-10 inset-x-5 h-[1px] bg-[#009100]/15 pointer-events-none" />
          </>
        ) : (
          <>
            <div className={`absolute top-20 left-12 w-60 h-60 ${activeLanding === 'jeep' ? 'bg-emerald-600/5' : (activeLanding === 'multimarca' ? 'bg-indigo-600/5' : 'bg-blue-600/10')} blur-[80px] rounded-full pointer-events-none -translate-x-1/2`} />
            <div className={`absolute bottom-20 right-12 w-60 h-60 ${activeLanding === 'jeep' ? 'bg-teal-600/5' : (activeLanding === 'multimarca' ? 'bg-purple-600/5' : 'bg-purple-600/10')} blur-[80px] rounded-full pointer-events-none translate-x-1/2`} />
          </>
        )}

        {/* Brand Header */}
        <div className={`px-6 py-4 flex justify-between items-center backdrop-blur-md sticky top-0 z-25 ${
          activeLanding === 'leapmotor'
            ? 'bg-[#010602]/95 border-b border-[#009100]/25'
            : 'bg-[#05070a]/90 border-b border-white/5'
        }`}>
          {activeLanding === 'leapmotor' && (
            <>
              <div className="flex items-center gap-1.5">
                <LeapmotorLogo size="sm" className="text-white" style={{ height: '62px' }} imgStyle={{ height: '84px' }} />
              </div>
              <span className="text-[10px] font-black font-mono text-[#009100] tracking-widest bg-[#009100]/10 border border-[#009100]/30 px-2.5 py-0.5 rounded-lg uppercase">B10 EV</span>
            </>
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
            <>
              <div className="flex items-center gap-1.5 py-1">
                <StellantisLogo size="sm" color="#ffffff" />
              </div>
              <span className="text-[9px] font-black font-mono text-indigo-400 tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded uppercase font-bold">5 Marcas VIP</span>
            </>
          )}
        </div>

        {/* Content Sheets (Landing / Form / Success) */}
        <AnimatePresence mode="wait">
          
          {/* STEP 1: LANDINGS SHEETS */}
          {!formActive && !success && (
            <motion.div
              key={`${activeLanding}-sheet`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="px-6 py-4 flex flex-col justify-start gap-4 flex-1"
            >
              {/* LEAPMOTOR LANDING VIEW - Professional Presentation Deck Layout */}
              {activeLanding === 'leapmotor' && (
                <div className="space-y-4 text-center mt-1">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black tracking-[0.25em] text-[#009100] uppercase block">
                      TECNOLOGÍA INTELIGENTE
                    </span>
                    <h1 className="text-3xl font-extralight tracking-tight text-white leading-tight font-sans">
                      Descubre el nuevo <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#009100] to-[#035F1D] font-extrabold text-3xl tracking-tighter">
                        B10
                      </span>
                    </h1>
                  </div>
                  
                  <p className="text-slate-300 text-xs font-medium max-w-xs mx-auto leading-relaxed">
                    Movilidad premium 100% eléctrica concebida bajo los estándares internacionales de Stellantis. Domina el camino inteligente.
                  </p>

                  {/* Central Car Graphic Showcase with Highlight Green framing & glow */}
                  <div className="relative aspect-[16/10] my-2 select-none overflow-hidden rounded-2xl border border-[#009100]/40 group bg-slate-900/35 shadow-[0_0_25px_rgba(0,145,0,0.25)]">
                    <img 
                      src={b10ImgUrl || "https://picsum.photos/seed/purpleb10/600/375"} 
                      alt="Leapmotor B10"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-2xl transform transition-transform duration-700 group-hover:scale-105 brightness-[1.2] contrast-[1.05] saturate-[1.05]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#010602]/85 via-transparent to-transparent opacity-65" />
                  </div>

                  {/* Highlights Grid matching Slide 2 details with Pantone 2427C & Highlight Green theme */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#009100]/20">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-[#035F1D]/20 border border-[#009100]/30 flex items-center justify-center text-[#009100] shadow-inner">
                        <Zap className="w-4 h-4 fill-[#009100]" />
                      </div>
                      <span className="text-[9px] text-white font-bold leading-normal font-mono uppercase">100% Eléctrico</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-[#035F1D]/20 border border-[#009100]/30 flex items-center justify-center text-[#009100] shadow-inner">
                        <Settings className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] text-white font-bold leading-normal font-mono uppercase">Autonomía Eléctrica</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-[#035F1D]/20 border border-[#009100]/30 flex items-center justify-center text-[#009100] shadow-inner">
                        <BatteryCharging className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] text-white font-bold leading-normal font-mono uppercase">Carga súper Rápida</span>
                    </div>
                  </div>

                  {/* Dual CTA Buttons customized with Pantone 2427C as base & Highlight R0 G145 B0 online */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => launchFormWithRequest('cotizacion', 'B10')}
                      className="bg-[#035F1D] hover:bg-[#009100] text-white font-extrabold py-3.5 px-4 rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-95 shadow-lg shadow-[#035F1D]/30 border border-[#009100]/30"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Cotizar</span>
                    </button>
                    <button
                      onClick={() => launchFormWithRequest('asesor', 'B10')}
                      className="bg-white/5 hover:bg-[#009100]/10 text-[#009100] border border-[#009100]/40 hover:border-[#009100]/80 font-extrabold py-3.5 px-4 rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-95"
                    >
                      <Zap className="w-3.5 h-3.5 fill-[#009100]" />
                      <span>Atención VIP</span>
                    </button>
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
                <div className="space-y-4 text-center mt-1">
                  <div className="flex flex-col items-center justify-center">
                    <StellantisLogo size="md" color="#ffffff" className="mb-1" />
                    <h1 className="text-3xl font-light tracking-wide leading-none uppercase">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-[#1e5eb5] to-[#00205B] font-black">Multimarca</span>
                    </h1>
                  </div>
                  
                  <p className="text-white text-xs font-semibold max-w-xs mx-auto leading-relaxed">
                    Selecciona una firma de nuestro portafolio de prestigio Stellantis para configurar su cotización o programar pista.
                  </p>

                  {/* Dynamic Brand Cards/Boxes Central Showcase */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {[
                      {
                        brand: 'Leapmotor',
                        image: b10ImgUrl || "https://picsum.photos/seed/purpleb10/600/375",
                        tagline: 'Movilidad Inteligente 100% Eléctrica',
                        colSpan: 'col-span-2'
                      },
                      {
                        brand: 'Jeep',
                        image: JEEP_IMG,
                        tagline: 'Leyenda Todoterreno 4x4',
                        colSpan: 'col-span-1'
                      },
                      {
                        brand: 'Ram',
                        image: 'https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?auto=format&fit=crop&w=400&q=80',
                        tagline: 'Poder de Trabajo Premium',
                        colSpan: 'col-span-1'
                      },
                      {
                        brand: 'Dodge',
                        image: 'https://images.unsplash.com/photo-1612462225418-4a946df41c19?auto=format&fit=crop&w=400&q=80',
                        tagline: 'Alto Rendimiento y Músculo',
                        colSpan: 'col-span-1'
                      },
                      {
                        brand: 'Fiat',
                        image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=400&q=80',
                        tagline: 'Estilo Urbano Italiano',
                        colSpan: 'col-span-1'
                      }
                    ].map((card) => {
                      const isSelected = selectedBrand === card.brand;
                      return (
                        <button
                          key={card.brand}
                          onClick={() => handleBrandSelect(card.brand)}
                          className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 text-left select-none bg-slate-900/30 ${card.colSpan} ${
                            card.colSpan === 'col-span-2' ? 'h-24 sm:h-28' : 'h-20 sm:h-24'
                          } ${
                            isSelected 
                              ? 'border-[#1e5eb5] ring-2 ring-[#1e5eb5]/50 scale-[1.02]' 
                              : 'border-white/10 opacity-70 hover:opacity-95 hover:border-white/20'
                          }`}
                        >
                          {/* Background Car Image with Gradient Overlay */}
                          <img 
                            src={card.image} 
                            alt={card.brand} 
                            referrerPolicy="no-referrer"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 brightness-[1.25] contrast-[1.08] saturate-[1.15]"
                          />
                          <div className={`absolute inset-0 bg-gradient-to-t ${isSelected ? 'from-[#05070a]/95 via-[#00205B]/30' : 'from-[#05070a]/65 via-transparent'} to-transparent`} />
                          
                          {/* Selected Active Border Pulse Overlay */}
                          {isSelected && (
                            <div className="absolute inset-0 border border-blue-400 rounded-2xl pointer-events-none animate-pulse" />
                          )}

                          {/* Brand Logo & Content Overlay */}
                          <div className="absolute inset-0 p-2.5 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                              {/* Logo */}
                              <div className="transform scale-95 sm:scale-100 origin-left">
                                {renderBrandLogo(card.brand, isSelected)}
                              </div>

                              {/* Selected Status Dot indicator */}
                              {isSelected ? (
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-md shadow-blue-500 animate-pulse border border-white/20" />
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-white/20 border border-white/10" />
                              )}
                            </div>

                            {/* Tagline / Brand Info */}
                            <div className="min-w-0">
                              <span className="text-[7.5px] sm:text-[8.5px] font-semibold text-slate-300 font-mono uppercase tracking-wide block truncate">
                                {card.tagline}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Info card of active brand state */}
                  <div className="bg-slate-900/80 p-2.5 rounded-2xl border border-white/5 flex items-center justify-between text-left">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-blue-400 tracking-wider font-mono uppercase font-bold">Portafolio Activo</span>
                      <strong className="text-xs text-white block uppercase">{selectedBrand}</strong>
                      <span className="text-[10px] text-slate-300 font-medium font-mono block truncate max-w-[210px]">
                        Modelos disp: {BRAND_MODELS[selectedBrand]?.join(', ')}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/10 rounded text-[8px] font-bold uppercase font-mono">
                      Stellantis VIP
                    </span>
                  </div>

                  {/* Dual CTA buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => launchFormWithRequest('cotizacion', BRAND_MODELS[selectedBrand]?.[0])}
                      className="bg-gradient-to-r from-blue-500 via-[#1e5eb5] to-[#00205B] hover:brightness-115 text-white font-extrabold py-3 px-3 rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 transition-all duration-300 active:scale-95 shadow-md shadow-blue-500/20 col-span-1 border border-blue-500/30"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Cotizar</span>
                    </button>
                    
                    <button
                      onClick={() => launchFormWithRequest('prueba', BRAND_MODELS[selectedBrand]?.[0])}
                      className="bg-[#0f1012] hover:bg-slate-900 text-slate-200 border border-blue-500/30 hover:border-blue-500/60 font-extrabold py-3 px-3 rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 transition-all duration-300 active:scale-95 col-span-1"
                    >
                      <Key className="w-3.5 h-3.5 text-blue-400" />
                      <span>Prueba de Manejo</span>
                    </button>
                  </div>
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
              className="px-6 py-4 flex flex-col gap-4 flex-1"
              style={{ paddingTop: '9px', paddingBottom: '9px' }}
            >
              <div>
                {/* Back Link */}
                <button 
                  onClick={() => setFormActive(false)}
                  className="flex items-center gap-1.5 text-white hover:text-slate-200 text-[11px] font-semibold font-mono mb-4 transition bg-white/10 px-2 py-1 rounded"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver a la Landing</span>
                </button>

                <h2 className="text-xl font-black tracking-wide text-white mb-1 uppercase font-sans">
                  Registro de {formData.requestType === 'cotizacion' ? 'Cotización' : (formData.requestType === 'prueba' ? 'Prueba de Manejo' : 'Atención personalizada')}
                </h2>
                <span className="text-[11px] text-white font-bold font-mono block mb-4 uppercase">
                  Marca de interés: <strong className={theme.textAccent}>{selectedBrand}</strong>
                </span>

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
                      <label id="frm-name-label" htmlFor="name" className="text-[11px] uppercase font-mono tracking-wider text-white font-extrabold block mb-0.5">
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
                      <label id="frm-lastname-label" htmlFor="lastName" className="text-[11px] uppercase font-mono tracking-wider text-white font-extrabold block mb-0.5">
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
                      <label id="frm-phone-label" htmlFor="phone" className="text-[11px] uppercase font-mono tracking-wider text-white font-extrabold block mb-0.5 truncate">
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
                      <label id="frm-postalcode-label" htmlFor="postalCode" className="text-[11px] uppercase font-mono tracking-wider text-white font-extrabold block mb-0.5 truncate" title="Código Postal *">
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

                  {/* Models dropdown list tailored by Selected Brand */}
                  <div className={rowClass}>
                    <label id="frm-model-label" className="text-[11px] uppercase font-mono tracking-wider text-white font-extrabold block mb-0.5">
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
                          className="w-full text-left bg-[#0a0f18] text-white border border-white/25 hover:border-indigo-400 focus:border-indigo-400 rounded-xl pl-11 pr-7 py-2.5 text-xs outline-none transition uppercase font-mono font-bold flex items-center justify-between"
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
                          className={`w-full text-white rounded-xl pl-11 pr-7 py-2.5 text-xs outline-none appearance-none transition uppercase font-mono font-bold disabled:opacity-85 disabled:cursor-not-allowed ${
                            activeLanding === 'leapmotor'
                              ? 'bg-[#010602] border border-[#009100]/25 focus:border-[#009100]'
                              : 'bg-[#0a0f18] border border-white/25 focus:border-indigo-400'
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

                  {/* Distribuidor / Distributor field */}
                  {activeLanding !== 'leapmotor' && (
                    <div className="space-y-1 bg-slate-900/60 p-2 rounded-xl border border-white/15">
                      <label id="frm-distributor-label" htmlFor="distributor" className="text-[11px] uppercase font-mono tracking-wider text-white font-extrabold block mb-0.5">
                        Distribuidor de Preferencia *
                      </label>
                      <div className="relative">
                        <Settings className="absolute left-3.5 top-3 w-4 h-4 text-slate-300" />
                        <select
                          id="distributor"
                          name="distributor"
                          required
                          value={formData.distributor}
                          onChange={handleChange}
                          className="w-full bg-[#0a0f18] text-white border border-white/25 focus:border-indigo-400 rounded-xl pl-11 pr-7 py-2.5 text-xs outline-none appearance-none transition font-semibold"
                        >
                          {CDMX_DISTRIBUTORS.map(d => (
                            <option key={d} value={d} className="bg-slate-900 text-white">
                              {d.replace('Leapmotor ', `${selectedBrand} `)}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-300 pointer-events-none" />
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

              {/* Submit registration button */}
              <div className="pt-2 pb-1">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`w-full ${theme.btnBg} active:scale-95 disabled:opacity-55 text-white font-bold py-4 px-6 rounded-2xl text-[11px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all duration-300 shadow-xl`}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                  ) : (
                    <span>{formData.requestType === 'cotizacion' ? 'Registrar Cotización' : 'Registrar para ser atendido personalmente'}</span>
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
              className="px-6 py-4 flex flex-col gap-3 flex-1 text-center"
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
                    ¡Gracias, <span className={`font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${theme.successGradient}`}>{formData.name.split(' ')[0]}</span>!
                  </h3>
                  <p className="text-sm font-bold text-white">
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
                    className="w-full h-full object-cover brightness-[1.25] contrast-[1.08] saturate-[1.1]"
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
                    setFormData({
                      name: '',
                      lastName: '',
                      email: '',
                      phone: '',
                      postalCode: '',
                      state: 'Ciudad de México (CDMX)',
                      distributor: 'Leapmotor Santa Fe',
                      modelOfInterest: activeLanding === 'jeep' ? 'Grand Cherokee' : 'B10',
                      contactMethod: 'whatsapp',
                      testDriveDate: '',
                      requestType: 'asesor'
                    });
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
