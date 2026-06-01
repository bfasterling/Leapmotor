/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import LeapmotorLogo from './LeapmotorLogo';

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
  'Aguascalientes': ['Leapmotor Aguascalientes Norte'],
  'Baja California': ['Leapmotor Tijuana Zona Río'],
  'Baja California Sur': ['Leapmotor La Paz Malecón'],
  'Campeche': ['Leapmotor Distribuidor Digital (Sureste)'],
  'Chiapas': ['Leapmotor Distribuidor Digital (Sureste)'],
  'Chihuahua': ['Leapmotor Chihuahua San Felipe'],
  'Coahuila': ['Leapmotor Saltillo Alpes'],
  'Colima': ['Leapmotor Distribuidor Digital (Occidente)'],
  'Ciudad de México (CDMX)': [
    'Leapmotor Polanco',
    'Leapmotor Santa Fe',
    'Leapmotor Pedregal',
    'Leapmotor Insurgentes'
  ],
  'Durango': ['Leapmotor Distribuidor Digital (Norte)'],
  'Estado de México': [
    'Leapmotor Interlomas',
    'Leapmotor Toluca Metepec'
  ],
  'Guanajuato': ['Leapmotor León Country'],
  'Guerrero': ['Leapmotor Distribuidor Digital (Centro)'],
  'Hidalgo': ['Leapmotor Pachuca Plateada'],
  'Jalisco': [
    'Leapmotor Guadalajara Country',
    'Leapmotor Zapopan Center'
  ],
  'Michoacán': ['Leapmotor Morelia Las Américas'],
  'Morelos': ['Leapmotor Cuernavaca'],
  'Nayarit': ['Leapmotor Distribuidor Digital (Occidente)'],
  'Nuevo León': [
    'Leapmotor Monterrey Valle',
    'Leapmotor San Pedro'
  ],
  'Oaxaca': ['Leapmotor Oaxaca Reforma'],
  'Puebla': ['Leapmotor Angelópolis'],
  'Querétaro': ['Leapmotor Juriquilla'],
  'Quintana Roo': ['Leapmotor Cancún Cumbres'],
  'San Luis Potosí': ['Leapmotor San Luis Lomas'],
  'Sinaloa': ['Leapmotor Distribuidor Digital (Pacifico)'],
  'Sonora': ['Leapmotor Distribuidor Digital (Pacifico)'],
  'Tabasco': ['Leapmotor Distribuidor Digital (Sureste)'],
  'Tamaulipas': ['Leapmotor Distribuidor Digital (Norte)'],
  'Tlaxcala': ['Leapmotor Distribuidor Digital (Centro)'],
  'Veracruz': ['Leapmotor Distribuidor Digital (Golfo)'],
  'Yucatán': ['Leapmotor Mérida Altabrisa'],
  'Zacatecas': ['Leapmotor Distribuidor Digital (Centro)']
};

const CDMX_DISTRIBUTORS = [
  'Leapmotor CDMX Poniente',
  'Leapmotor CDMX Oriente',
  'Leapmotor CDMX Sur',
  'Leapmotor CDMX Norte'
];

interface LeadFormProps {
  c10ImgUrl: string;
  t03ImgUrl: string;
  b10ImgUrl: string;
}

export default function LeadForm({ c10ImgUrl, t03ImgUrl, b10ImgUrl }: LeadFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    phone: '',
    postalCode: '',
    state: 'Ciudad de México (CDMX)',
    distributor: 'Leapmotor CDMX Poniente',
    modelOfInterest: 'B10' as 'B10' | 'C10' | 'T03' | 'C11' | 'C16',
    contactMethod: 'whatsapp',
    requestType: 'asesor' as 'cotizacion' | 'prueba' | 'asesor'
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formActive, setFormActive] = useState(false); // false = landing view, true = form sheet
  const [registeredLeadId, setRegisteredLeadId] = useState('');
  const [errorText, setErrorText] = useState('');

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

  const handleSelectRequestType = (type: 'cotizacion' | 'asesor') => {
    setFormData(prev => ({ ...prev, requestType: type }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault && e.preventDefault();
    setLoading(true);
    setErrorText('');

    if (!formData.name.trim() || !formData.lastName.trim() || !formData.phone.trim() || !formData.state.trim() || !formData.distributor.trim()) {
      setErrorText('Por favor ingresa todos los campos obligatorios (*).');
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

      // If no advisors configured in database yet, we seed default active advisors instantly
      if (activeAdvisors.length === 0) {
        const defaultAdvisors = [
          { id: 'ADV-01', name: 'Arturo Stellantis', email: 'arturo@leapmotor.com', password: '123', active: true },
          { id: 'ADV-02', name: 'Belinda Leap', email: 'belinda@leapmotor.com', password: '123', active: true },
          { id: 'ADV-03', name: 'Carlos Galería', email: 'carlos@leapmotor.com', password: '123', active: true }
        ];
        try {
          for (const s of defaultAdvisors) {
            await setDoc(doc(db, 'advisors', s.id), {
              name: s.name,
              email: s.email,
              password: s.password,
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

      // Ensure e-mail has fallback if empty
      const cleanEmail = formData.email.trim() || `${formData.name.trim().toLowerCase().replace(/\s+/g, '.')}@leapmotor-leads.mx`;

      const payload = {
        name: formData.name.trim(),
        lastName: formData.lastName.trim(),
        email: cleanEmail,
        phone: formData.phone.trim(),
        postalCode: formData.postalCode.trim() || null,
        state: formData.state,
        distributor: formData.distributor,
        modelOfInterest: formData.modelOfInterest,
        contactMethod: formData.contactMethod,
        requestType: formData.requestType,
        status: LeadStatus.WAITING,
        advisorId: minWaitingAdvisor.id,
        advisorName: minWaitingAdvisor.name,
        createdAt: serverTimestamp()
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

  return (
    <div className="w-full text-slate-100 flex flex-col justify-start items-center" id="landing-page-view">
      
      {/* Outer Mobile Wrapper with strict styling dimensions */}
      <div className="w-full max-w-md mx-auto min-h-[85vh] bg-[#05070a] border border-white/10 rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col justify-between mt-1 mb-6">
        
        {/* Subtle Decorative Aura */}
        <div className="absolute top-20 left-12 w-60 h-60 bg-blue-600/10 blur-[80px] rounded-full pointer-events-none -translate-x-1/2" />
        <div className="absolute bottom-20 right-12 w-60 h-60 bg-purple-600/10 blur-[80px] rounded-full pointer-events-none translate-x-1/2" />

        {/* Brand Header consistent across client layouts */}
        <div 
          className="px-6 py-5 flex justify-between items-center bg-[#05070a]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-20"
          style={{ paddingBottom: '1px' }}
        >
          <div className="flex items-center gap-2">
            <LeapmotorLogo 
              size="sm" 
              className="text-white"
              style={{ height: '50px' }}
              imgStyle={{ height: '70px' }}
            />
          </div>
          <span className="text-sm font-black font-mono text-slate-400 tracking-wider">B10</span>
        </div>

        {/* Content Dynamic Sheets (Landing / Form / Success) */}
        <AnimatePresence mode="wait">
          
          {/* STEP 1: LANDING VIEW */}
          {!formActive && !success && (
            <motion.div
              key="landing-sheet"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.35 }}
              className="px-6 py-4 flex flex-col justify-start gap-4 flex-1"
              style={{ paddingTop: '9px', paddingBottom: '9px' }}
            >
              <div className="space-y-4 text-center mt-2">
                <h1 className="text-3.5xl font-light tracking-wide text-white leading-tight">
                  Descubre el nuevo <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 font-normal">B10</span>
                </h1>
                
                <p className="text-slate-400 text-xs font-light max-w-xs mx-auto leading-relaxed">
                  Solicita una cotización o atención comercial personalizada. Lanza tu experiencia inteligente.
                </p>

                {/* Central Car Graphic Showcase */}
                <div className="relative aspect-[16/10] my-1 select-none overflow-hidden rounded-2xl border border-white/5 group bg-slate-900/35">
                  <img 
                    src={b10ImgUrl || "https://picsum.photos/seed/purpleb10/600/375"} 
                    alt="Leapmotor B10"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-2xl transform transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-transparent to-transparent opacity-60" />
                </div>

                {/* Three precise circular highlight badges matching image */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/5">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Zap className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] text-slate-300 font-semibold leading-normal">100% Eléctrico</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Settings className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] text-slate-300 font-semibold leading-normal">Tecnología Avanzada</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Eye className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] text-slate-300 font-semibold leading-normal">Diseño Inteligente</span>
                  </div>
                </div>

                {/* Response SLA Label */}
                <p className="text-xs text-blue-400 font-mono font-medium tracking-wide pb-1">
                  Estamos listos para atenderte en menos de 2 minutos.
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-2 pb-2">
                <button
                  onClick={() => setFormActive(true)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition duration-300 shadow-lg shadow-blue-500/20 hover:scale-[1.01]"
                >
                  <span>Solicitar Atención Comercial</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: REGISTRATION FORM SHEET */}
          {formActive && !success && (
            <motion.div
              key="form-sheet"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
              className="px-6 py-4 flex flex-col justify-between flex-1"
              style={{ paddingTop: '9px', paddingBottom: '9px' }}
            >
              <div>
                {/* Back Link */}
                <button 
                  onClick={() => setFormActive(false)}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-mono mb-4 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver a la Landing</span>
                </button>

                <h2 className="text-xl font-light tracking-wide text-white mb-1 uppercase">
                  Solicita atención personalizada
                </h2>
                <p className="text-xs text-slate-400 font-light mb-5">
                  Completa los datos y un asesor se acercará contigo.
                </p>

                {errorText && (
                  <div className="p-3.5 bg-red-950/40 border border-red-500/20 rounded-xl text-red-400 text-xs mb-4 flex gap-2">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>{errorText}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name and Last Name in elegant side-by-side layout */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Name field */}
                    <div className="space-y-1">
                      <label id="frm-name-label" htmlFor="name" className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">
                        Nombre *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                        <input
                          id="name"
                          type="text"
                          name="name"
                          required
                          placeholder="Tu nombre"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 focus:border-blue-500 rounded-xl pl-9 pr-3 py-3.5 text-xs text-white placeholder-slate-600 outline-none transition"
                        />
                      </div>
                    </div>

                    {/* Last name field */}
                    <div className="space-y-1">
                      <label id="frm-lastname-label" htmlFor="lastName" className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">
                        Apellido *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                        <input
                          id="lastName"
                          type="text"
                          name="lastName"
                          required
                          placeholder="Tu apellido"
                          value={formData.lastName}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 focus:border-blue-500 rounded-xl pl-9 pr-3 py-3.5 text-xs text-white placeholder-slate-600 outline-none transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Phone field */}
                  <div className="space-y-1">
                    <label id="frm-phone-label" htmlFor="phone" className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">
                      Teléfono *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        required
                        placeholder="Tu teléfono"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 focus:border-blue-500 rounded-xl pl-11 pr-4 py-3.5 text-xs text-white placeholder-slate-600 outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Postal Code field */}
                  <div className="space-y-1">
                    <label id="frm-postalcode-label" htmlFor="postalCode" className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">
                      Código Postal
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                      <input
                        id="postalCode"
                        type="text"
                        name="postalCode"
                        maxLength={5}
                        placeholder="Ej. 06000"
                        value={formData.postalCode}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/[^0-9]/g, '');
                          setFormData(prev => ({ ...prev, postalCode: cleaned }));
                        }}
                        className="w-full bg-white/5 border border-white/10 focus:border-blue-500 rounded-xl pl-9 pr-3 py-3.5 text-xs text-white placeholder-slate-600 outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Distribuidor / Distributor field */}
                  <div className="space-y-1">
                    <label id="frm-distributor-label" htmlFor="distributor" className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">
                      Distribuidor de Preferencia *
                    </label>
                    <div className="relative">
                      <Settings className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                      <select
                        id="distributor"
                        name="distributor"
                        required
                        value={formData.distributor}
                        onChange={handleChange}
                        className="w-full bg-[#05070a]/95 text-white border border-white/10 focus:border-blue-500 rounded-xl pl-11 pr-7 py-3.5 text-xs outline-none appearance-none transition"
                      >
                        {CDMX_DISTRIBUTORS.map(d => (
                          <option key={d} value={d} className="bg-[#05070a] text-white">
                            {d}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-4 w-4 h-4 text-slate-500 pointer-events-none" />
                    </div>
                  </div>

                  {/* Contact preference: ¿Qué deseas? matching mockup buttons */}
                  <div className="space-y-2 pt-1">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">
                      ¿Qué deseas? *
                    </label>
                    
                    <div className="space-y-2">
                      {/* Option 1: Cotizacion */}
                      <button
                        type="button"
                        onClick={() => handleSelectRequestType('cotizacion')}
                        className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all text-left ${
                          formData.requestType === 'cotizacion'
                            ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-md'
                            : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4" />
                          </span>
                          <div>
                            <span className="text-xs font-bold block text-white">Cotización</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Recibe un plan de financiamiento premium</span>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          formData.requestType === 'cotizacion' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600'
                        }`}>
                          {formData.requestType === 'cotizacion' && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                        </div>
                      </button>

                      {/* Option 3: Hablar con asesor */}
                      <button
                        type="button"
                        onClick={() => handleSelectRequestType('asesor')}
                        className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all text-left ${
                          formData.requestType === 'asesor'
                            ? 'bg-blue-500/10 border-blue-500 text-white shadow-md'
                            : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="p-2 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center">
                            <MessageSquare className="w-4 h-4" />
                          </span>
                          <div>
                            <span className="text-xs font-bold block text-white">Hablar con asesor</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Contacto ultra-veloz & asistencia VIP</span>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          formData.requestType === 'asesor' ? 'border-blue-500 bg-blue-500' : 'border-slate-600'
                        }`}>
                          {formData.requestType === 'asesor' && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                        </div>
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Submit Button aligned with screen mock green color */}
              <div className="pt-6 pb-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-[#008f39] hover:bg-[#00a845] active:scale-95 disabled:opacity-55 text-white font-bold py-4 px-6 rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all duration-300"
                >
                  {loading ? (
                    <div className="w-4.5 h-4.5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                  ) : (
                    <span>Solicitar Atención Personalizada</span>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: THANK YOU/SUCCESS VIEW */}
          {success && (
            <motion.div
              key="success-sheet"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="px-6 py-5 flex flex-col justify-between flex-1 text-center"
              style={{ paddingTop: '9px', paddingBottom: '9px' }}
            >
              <div className="space-y-4 my-2">
                {/* Check Circle Animation */}
                <div className="relative inline-flex items-center justify-center my-1">
                  <div className="absolute inset-0 w-14 h-14 bg-green-500/10 rounded-full blur-md animate-ping" />
                  <div className="w-14 h-14 rounded-full bg-green-600/20 border border-green-500/40 flex items-center justify-center text-green-400">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-light text-white leading-tight">
                    ¡Gracias, <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">{formData.name.split(' ')[0]}</span>!
                  </h3>
                  <p className="text-xs text-slate-305 font-semibold text-slate-200">
                    Estamos notificando a un asesor.
                  </p>
                </div>

                <p className="text-xs font-medium text-blue-400 font-mono tracking-medium">
                  Tiempo estimado de atención: menos de 2 minutos.
                </p>

                {/* Simulated B10 image centered on thank you block */}
                <div className="relative aspect-video max-w-xs mx-auto rounded-xl border border-white/5 select-none bg-slate-900/40 my-3 overflow-hidden">
                  <img 
                    src={b10ImgUrl || "https://picsum.photos/seed/purpleb10/600/375"} 
                    alt="B10"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-2 text-[10px] font-light tracking-[0.2em] uppercase text-white/70">LEAPMOTOR B10</div>
                </div>

                {/* Locator notification card */}
                <div className="bg-slate-900/60 border border-white/5 p-4 rounded-2xl flex items-center gap-3 text-left max-w-xs mx-auto">
                  <span className="p-2 bg-green-500/10 text-green-400 rounded-xl flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-[11px] font-bold text-white block">Tu asesor se acercará</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">a tu ubicación actual.</span>
                  </div>
                </div>
              </div>

              {/* Utility buttons to reset */}
              <div className="space-y-2 pt-4 pb-1">
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
                      distributor: 'Leapmotor CDMX Poniente',
                      modelOfInterest: 'B10',
                      contactMethod: 'whatsapp',
                      requestType: 'asesor'
                    });
                  }}
                  className="w-full bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 px-6 py-3 rounded-xl text-[10px] font-bold tracking-wider uppercase transition"
                >
                  Nuevo Registro de Prueba
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Floating security credential line */}
        <div className="px-6 py-3 border-t border-white/5 bg-[#05070a]/90 flex items-center justify-center gap-1.5 text-[9px] text-slate-600 font-mono select-none">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
          <span>Encriptado en tiempo real con Firebase TLS 1.3</span>
        </div>

      </div>

    </div>
  );
}
