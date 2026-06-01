/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  getDocs, 
  writeBatch 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Lead, LeadStatus } from '../types';
import { playNewLeadAlert, speakNewLeadAnnouncement } from '../utils/audio';
import { 
  Bell, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Car, 
  Clock, 
  MessageSquare, 
  Check, 
  X, 
  Play, 
  Zap, 
  Trash2, 
  AlertTriangle, 
  Smile, 
  UserCheck,
  FileText,
  Key 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import LeapmotorLogo from './LeapmotorLogo';

// Custom Advisor identification details (can be toggled in UI)
// Default safety fallbacks for offline states or seeding initial data
const DEFAULT_ADVISORS = [
  { id: 'ADV-01', name: 'Arturo Stellantis', email: 'arturo@leapmotor.com', password: '123', active: true },
  { id: 'ADV-02', name: 'Belinda Leap', email: 'belinda@leapmotor.com', password: '123', active: true },
  { id: 'ADV-03', name: 'Carlos Galería', email: 'carlos@leapmotor.com', password: '123', active: true }
];

export default function AdvisorPanel() {
  const [advisors, setAdvisors] = useState<any[]>([]);
  const [loggedInAdvisor, setLoggedInAdvisor] = useState<any | null>(() => {
    try {
      const saved = localStorage.getItem('active_advisor_session');
      return saved ? JSON.parse(saved) : null;
    } catch (_) {
      return null;
    }
  });

  const [selectedLoginId, setSelectedLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Track notes being entered per lead ID
  const [notesInput, setNotesInput] = useState<{ [leadId: string]: string }>({});
  
  // Audio configuration & control
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [lastNotificationLeadId, setLastNotificationLeadId] = useState<string>('');
  
  // Keep track of which lead IDs we have already warned about to prevent duplicate alarms
  const warnedLeadsRef = useRef<Set<string>>(new Set());

  // Subscribe to ADVISORS collection so we support real-time user management & additions
  useEffect(() => {
    const unsubscribeAdvisors = onSnapshot(collection(db, 'advisors'), async (snapshot) => {
      if (snapshot.empty) {
        // Seeding initial advisors so that they represent credentials in production
        try {
          for (const s of DEFAULT_ADVISORS) {
            await setDoc(doc(db, 'advisors', s.id), {
              name: s.name,
              email: s.email,
              password: s.password,
              active: s.active,
              createdAt: new Date()
            });
          }
        } catch (err) {
          console.error("Error seeding initial advisors into Firestore:", err);
        }
      } else {
        const list: any[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        setAdvisors(list);
        
        // Auto-select first advisor for select value
        if (list.length > 0) {
          setSelectedLoginId(prev => prev || list[0].id);
        }
      }
    }, (error) => {
      console.error("Firestore loading advisors error:", error);
      setAdvisors(DEFAULT_ADVISORS);
      setSelectedLoginId(DEFAULT_ADVISORS[0].id);
    });

    return () => unsubscribeAdvisors();
  }, []);

  // Sync login session details when active advisor is modified or deleted from the dashboard
  useEffect(() => {
    if (loggedInAdvisor && advisors.length > 0) {
      const stillExists = advisors.find(a => a.id === loggedInAdvisor.id);
      if (!stillExists) {
        // Log out advisor if they were deleted from database
        handleLogout();
      } else if (JSON.stringify(stillExists) !== JSON.stringify(loggedInAdvisor)) {
        // Update local session properties if changed
        setLoggedInAdvisor(stillExists);
        localStorage.setItem('active_advisor_session', JSON.stringify(stillExists));
      }
    }
  }, [advisors, loggedInAdvisor]);

  // Firestore real-time snapshot subscription
  useEffect(() => {
    if (!loggedInAdvisor) return;

    const q = query(
      collection(db, 'leads'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const parsedLeads: Lead[] = [];
      let newWaitingLead: Lead | null = null;
      
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const parsedLead: Lead = {
          id: docSnap.id,
          name: data.name || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          postalCode: data.postalCode || '',
          state: data.state || '',
          distributor: data.distributor || '',
          city: data.city || '',
          modelOfInterest: data.modelOfInterest || 'C10',
          status: data.status || LeadStatus.WAITING,
          notes: data.notes || '',
          advisorId: data.advisorId || '',
          advisorName: data.advisorName || '',
          createdAt: data.createdAt,
          attendedAt: data.attendedAt,
          completedAt: data.completedAt,
          contactMethod: data.contactMethod || 'whatsapp'
        };

        // Filter: Keep only leads assigned to this specific advisor
        if (parsedLead.advisorId === loggedInAdvisor.id) {
          parsedLeads.push(parsedLead);

          // Check if there's any active waiting lead that we haven't checked or alerted yet
          if (parsedLead.status === LeadStatus.WAITING && !warnedLeadsRef.current.has(parsedLead.id)) {
            newWaitingLead = parsedLead;
          }
        }
      });

      setLeads(parsedLeads);
      setLoading(false);

      // Trigger real-time audio block warning
      if (newWaitingLead) {
        const leadToAlert: Lead = newWaitingLead; // assign to local const to prevent closure issue
        warnedLeadsRef.current.add(leadToAlert.id);
        
        if (audioEnabled) {
          playNewLeadAlert();
          speakNewLeadAnnouncement(leadToAlert.name);
        }
      }
    }, (error) => {
      console.error("Firestore onSnapshot error:", error);
      try {
        handleFirestoreError(error, OperationType.LIST, 'leads');
      } catch (formattedErr) {
        // Quiet catch
      }
    });

    return () => unsubscribe();
  }, [audioEnabled, loggedInAdvisor]);

  // Handle Advisor Login submit action
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const target = advisors.find(a => a.id === selectedLoginId);
    if (!target) {
      setLoginError('Seleccione un asesor válido de la lista.');
      return;
    }

    if (target.password !== loginPassword.trim()) {
      setLoginError('La contraseña ingresada es incorrecta.');
      return;
    }

    if (target.active === false) {
      setLoginError('Esta cuenta de asesor se encuentra inactiva por el momento.');
      return;
    }

    // Login successful
    setLoggedInAdvisor(target);
    localStorage.setItem('active_advisor_session', JSON.stringify(target));
    setLoginPassword('');
  };

  // Logout routine
  const handleLogout = () => {
    setLoggedInAdvisor(null);
    localStorage.removeItem('active_advisor_session');
    setLeads([]);
  };

  // Filters
  const waitingLeads = leads.filter(l => l.status === LeadStatus.WAITING);
  const attendingLeads = leads.filter(l => l.status === LeadStatus.ATTENDING);
  const concludedLeads = leads.filter(l => l.status === LeadStatus.ATTENDED || l.status === LeadStatus.LOST);

  const hasWaiting = waitingLeads.length > 0;

  // Mark lead as attending
  const handleStartAttending = async (leadId: string) => {
    try {
      if (!loggedInAdvisor) return;
      const docRef = doc(db, 'leads', leadId);
      await updateDoc(docRef, {
        status: LeadStatus.ATTENDING,
        attendedAt: serverTimestamp(),
        advisorId: loggedInAdvisor.id,
        advisorName: loggedInAdvisor.name
      });
    } catch (err) {
      console.error(err);
      try {
        handleFirestoreError(err, OperationType.UPDATE, `leads/${leadId}`);
      } catch (e) {}
    }
  };

  // Conclude/Save lead with final notes
  const handleConcludeLead = async (leadId: string, finalStatus: LeadStatus.ATTENDED | LeadStatus.LOST) => {
    const finalNotes = notesInput[leadId] || 'Sin notas adicionales de seguimiento.';
    try {
      const docRef = doc(db, 'leads', leadId);
      await updateDoc(docRef, {
        status: finalStatus,
        notes: finalNotes.trim(),
        completedAt: serverTimestamp()
      });
      // Clear local input
      setNotesInput(prev => {
        const copy = { ...prev };
        delete copy[leadId];
        return copy;
      });
    } catch (err) {
      console.error(err);
      try {
        handleFirestoreError(err, OperationType.UPDATE, `leads/${leadId}`);
      } catch (e) {}
    }
  };

  // Convert Firestore Timestamp representation or JS Date to human text
  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return 'Justo ahora';
    let date: Date;
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } else {
      date = new Date(timestamp);
    }
    const secDiff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (secDiff < 5) return 'Hace unos momentos';
    if (secDiff < 60) return `Hace ${secDiff} s`;
    const minDiff = Math.floor(secDiff / 60);
    return `Hace ${minDiff} min`;
  };

  // Format wait response time
  const getResponseTime = (lead: Lead) => {
    if (!lead.createdAt || !lead.attendedAt) return null;
    
    let created: Date = lead.createdAt.toDate ? lead.createdAt.toDate() : new Date(lead.createdAt);
    let attended: Date = lead.attendedAt.toDate ? lead.attendedAt.toDate() : new Date(lead.attendedAt);
    
    const diffSec = Math.floor((attended.getTime() - created.getTime()) / 1000);
    if (diffSec <= 0) return '1 s';
    return `${diffSec} s`;
  };

  if (!loggedInAdvisor) {
    return (
      <div className="w-full min-h-[90vh] text-slate-100 flex justify-center items-center font-sans px-4 py-12 bg-slate-950">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden"
        >
          {/* Accent Glow */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-blue-600/10 blur-[60px] rounded-full pointer-events-none" />
          
          <div className="flex flex-col items-center text-center gap-3 mb-8">
            <LeapmotorLogo size="md" className="text-white" />
            <div className="mt-2">
              <h2 className="text-xl font-bold tracking-tight text-white uppercase font-sans">Portal del Asesor</h2>
              <p className="text-xs text-slate-400 mt-1">Inicie sesión para atender sus prospectos asignados en tiempo real</p>
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-2">Seleccione su Usuario:</label>
              <div className="relative">
                <select
                  value={selectedLoginId}
                  onChange={(e) => {
                    setSelectedLoginId(e.target.value);
                    setLoginError('');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 text-sm rounded-xl px-4 py-3 text-slate-200 font-medium focus:border-blue-500/50 outline-none transition appearance-none"
                >
                  {advisors.length === 0 ? (
                    <option value="">Cargando asesores...</option>
                  ) : (
                    advisors.map((adv) => (
                      <option key={adv.id} value={adv.id}>
                        {adv.name} ({adv.active !== false ? 'Activo' : 'Inactivo'})
                      </option>
                    ))
                  )}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  ▼
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-2">Contraseña:</label>
              <input
                type="password"
                placeholder="Ingrese contraseña de asesor"
                value={loginPassword}
                onChange={(e) => {
                  setLoginPassword(e.target.value);
                  setLoginError('');
                }}
                className="w-full bg-slate-950 border border-slate-800 text-sm rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:border-blue-500/50 outline-none transition"
              />
            </div>

            {loginError && (
              <p className="text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                ⚠️ {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={advisors.length === 0}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/10 transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
            >
              Iniciar sesión
            </button>
          </form>
          
          <div className="mt-6 text-center text-[11px] text-slate-500 font-mono">
            ¿No aparece en la lista? Comuníquese con administración desde el Tablero de Mando.
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`w-full min-h-screen text-slate-100 transition-colors duration-500 font-sans pt-1 px-4 md:pt-2 md:px-6 pb-24 ${
      hasWaiting ? 'bg-red-950/20' : 'bg-slate-950'
    }`}>
      {/* Alert Header if New Leads are Waiting */}
      <AnimatePresence>
        {hasWaiting && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-red-600 text-white py-3.5 px-4 mb-6 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 font-sans font-bold shadow-lg shadow-red-500/20 animate-pulse"
          >
            <div className="flex items-center gap-2.5 text-center sm:text-left">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div>
                <span className="text-sm">¡ALERTA DE REGISTROS ESPERANDO ATENCIÓN!</span>
                <p className="text-xs font-medium text-red-100 mt-0.5">
                  Hay {waitingLeads.length} prospecto{waitingLeads.length > 1 ? 's' : ''} esperando ser contactado{waitingLeads.length > 1 ? 's' : ''}. Objetivo de contacto: &lt;15s.
                </p>
              </div>
            </div>
            {!audioEnabled && (
              <button 
                onClick={() => {
                  setAudioEnabled(true);
                  playNewLeadAlert();
                }}
                className="bg-white text-red-600 px-4 py-1.5 rounded-lg text-xs font-black tracking-wider uppercase hover:bg-slate-100 transition"
              >
                🔊 Activar Alerta de Audio
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        {/* Advisor Controls Console */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 font-sans tracking-tight">
              <UserCheck className="w-5 h-5 text-emerald-400" /> Consola del Asesor Comercial
            </h2>
            <p className="text-slate-400 text-xs">
              Bienvenido, <strong className="text-emerald-400">{loggedInAdvisor.name}</strong> ({loggedInAdvisor.email}). Estás atendiendo tus leads asignados en tiempo real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Audio Settings Pill */}
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                audioEnabled 
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40' 
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              <Bell className={`w-4 h-4 ${audioEnabled ? 'animate-bounce text-emerald-400' : 'text-slate-400'}`} />
              <span>Alertas con sonido: {audioEnabled ? 'ENCENDIDO' : 'SILENCIADO'}</span>
            </button>

            {/* Logout CTA */}
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold transition border border-red-500/20 flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>

        {/* Real-time Status Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLUMN 1: WAITING EN ESPERA (The Blink Red target) */}
          <div className="bg-slate-900/45 border border-slate-900 rounded-2xl p-4 flex flex-col">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <h3 className="font-bold text-sm tracking-wide text-amber-500 uppercase font-mono">
                  1) En Espera ({waitingLeads.length})
                </h3>
              </div>
              <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full font-bold font-mono">Realtime</span>
            </div>

            <div className="space-y-4 flex-1">
              <AnimatePresence mode="popLayout">
                {waitingLeads.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-8 border border-dashed border-slate-850 rounded-xl text-center flex flex-col items-center justify-center text-slate-500 h-64"
                  >
                    <Smile className="w-8 h-8 text-emerald-500/50 mb-3" />
                    <p className="text-xs font-semibold">Base libre de espera</p>
                    <p className="text-[10px] text-slate-650 max-w-[200px] mt-1 leading-relaxed">
                      No hay clientes esperando atención actualmente. ¡Buen trabajo de respuesta rápida!
                    </p>
                  </motion.div>
                ) : (
                  waitingLeads.map((lead) => (
                    <motion.div
                      key={lead.id}
                      layoutId={lead.id}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                      className="border-2 border-red-500/90 bg-slate-950 p-4 rounded-xl shadow-xl space-y-4 relative overflow-hidden group alert-card-pulse"
                      style={{
                        animation: 'blinkRed 1.8s infinite'
                      }}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="flex flex-wrap gap-1.5 items-center mb-2">
                            <div className="inline-flex items-center gap-1 text-[10px] font-bold font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full uppercase">
                              <Car className="w-3 h-3" /> Leap {lead.modelOfInterest}
                            </div>
                            {lead.requestType === 'cotizacion' && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold font-mono bg-[#00a845]/15 text-emerald-300 border border-[#00a845]/25 px-2 py-0.5 rounded uppercase">
                                <FileText className="w-3 h-3 shrink-0" /> Cotización
                              </span>
                            )}
                            {lead.requestType === 'prueba' && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold font-mono bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 px-2 py-0.5 rounded uppercase">
                                <Key className="w-3 h-3 shrink-0" /> Prueba de Manejo
                              </span>
                            )}
                            {(!lead.requestType || lead.requestType === 'asesor') && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold font-mono bg-blue-500/15 text-blue-300 border border-blue-500/25 px-2 py-0.5 rounded uppercase">
                                <MessageSquare className="w-3 h-3 shrink-0" /> Hablar con Asesor
                              </span>
                            )}
                          </div>
                          <h4 className="font-sans font-extrabold text-base text-white uppercase tracking-tight leading-snug">
                            {lead.name} {lead.lastName || ''}
                          </h4>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <span className="text-[10px] text-red-400 flex items-center gap-1 font-mono font-bold uppercase animate-pulse">
                            <Clock className="w-3.5 h-3.5" /> urgente
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono mt-1">
                            {formatTimeAgo(lead.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-300 font-mono">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                          <div className="leading-snug">
                            <div className="font-bold text-white">{lead.distributor || 'Distribuidor Digital'}</div>
                            <div className="text-[10px] text-slate-400 font-semibold">{lead.state || 'N/A'}{lead.postalCode ? ` • CP: ${lead.postalCode}` : ''}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{lead.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                          <span>Canal: <strong className="text-cyan-400 uppercase">{lead.contactMethod || 'whatsapp'}</strong></span>
                        </div>
                      </div>

                      {/* Attend Now button */}
                      <button
                        onClick={() => handleStartAttending(lead.id)}
                        className="w-full bg-red-600 hover:bg-red-500 text-white font-sans font-black py-3 rounded-lg text-xs transition duration-200 uppercase tracking-widest flex items-center justify-center gap-2 relative overflow-hidden active:scale-95"
                      >
                        <Zap className="w-4 h-4 fill-white shrink-0 animate-bounce" />
                        <span>¡Atender Ahora!</span>
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* COLUMN 2: IN ATTENTION (Attending state) */}
          <div className="bg-slate-900/45 border border-slate-900 rounded-2xl p-4 flex flex-col">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <h3 className="font-bold text-sm tracking-wide text-cyan-400 uppercase font-mono">
                  2) En Atención ({attendingLeads.length})
                </h3>
              </div>
              <span className="text-[10px] bg-cyan-400/10 text-cyan-400 px-2.5 py-0.5 rounded-full font-bold">Llamada/WA</span>
            </div>

            <div className="space-y-4 flex-1">
              <AnimatePresence mode="popLayout">
                {attendingLeads.length === 0 ? (
                  <div className="p-8 border border-dashed border-slate-850 rounded-xl text-center flex flex-col items-center justify-center text-slate-500 h-64">
                    <User className="w-8 h-8 text-cyan-500/20 mb-3" />
                    <p className="text-xs font-semibold">Consola de llamada vacía</p>
                    <p className="text-[10px] text-slate-650 max-w-[200px] mt-1 leading-relaxed">
                      Los leads asignados aparecerán aquí para contacto telefónico o WhatsApp.
                    </p>
                  </div>
                ) : (
                  attendingLeads.map((lead) => {
                    return (
                      <motion.div
                        key={lead.id}
                        layoutId={lead.id}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-slate-950 border border-cyan-500/30 p-4 rounded-xl space-y-4 relative"
                      >
                        <div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded font-semibold uppercase">
                              Contacto Activo
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              React: <strong>{getResponseTime(lead)}</strong>
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1.5 items-center mt-2.5">
                            <div className="inline-flex items-center gap-0.5 text-[9px] font-bold font-mono bg-blue-500/10 text-blue-300 border border-blue-500/20 px-1.5 py-0.5 rounded font-bold">
                              Leap {lead.modelOfInterest}
                            </div>
                            {lead.requestType === 'cotizacion' && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold font-mono bg-[#00a845]/10 text-emerald-300 border border-[#00a845]/20 px-1.5 py-0.5 rounded uppercase font-bold">
                                <FileText className="w-3 h-3 shrink-0" /> Cotización
                              </span>
                            )}
                            {lead.requestType === 'prueba' && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-1.5 py-0.5 rounded uppercase font-bold">
                                <Key className="w-3 h-3 shrink-0" /> Prueba de Manejo
                              </span>
                            )}
                            {(!lead.requestType || lead.requestType === 'asesor') && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold font-mono bg-blue-500/10 text-blue-300 border border-blue-500/20 px-1.5 py-0.5 rounded uppercase font-bold">
                                <MessageSquare className="w-3 h-3 shrink-0" /> Hablar con Asesor
                              </span>
                            )}
                          </div>
                          
                          <h4 className="font-sans font-bold text-sm text-white uppercase tracking-tight mt-2.5">
                            {lead.name} {lead.lastName || ''}
                          </h4>
                          <div className="text-[10px] text-slate-400 font-mono mt-1">
                            <span className="text-cyan-400 font-semibold">{lead.distributor || 'Distribuidor Digital'}</span> ({lead.state || 'N/A'})
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono mt-1.5 block">
                            Atendido por: {lead.advisorName}
                          </span>
                        </div>

                        {/* Interactive contact quick actions */}
                        <div className="pt-1">
                          <a
                            href={`tel:${lead.phone}`}
                            className="w-full bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-750 text-[11px] font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition"
                          >
                            <Phone className="w-3.5 h-3.5 shrink-0 text-cyan-400" /> Llamar
                          </a>
                        </div>

                        {/* Note Input */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-mono text-slate-400 font-bold block">
                            Notas de la Consulta / Seguimiento
                          </label>
                          <textarea
                            placeholder="Escribe el resultado del contacto. Ej: Interesado en C10 con financiamiento, cita programada para el Sábado."
                            value={notesInput[lead.id] || ''}
                            onChange={(e) => {
                              const v = e.target.value;
                              setNotesInput(p => ({ ...p, [lead.id]: v }));
                            }}
                            className="w-full bg-slate-900 text-slate-200 border border-slate-800 focus:border-cyan-400 rounded-lg p-2.5 text-xs outline-none h-16 resize-none transition"
                          />
                        </div>

                        {/* Conclude outcomes */}
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-900">
                          <button
                            onClick={() => handleConcludeLead(lead.id, LeadStatus.LOST)}
                            className="bg-slate-900 border border-red-500/30 hover:border-red-500/60 text-red-400 text-[10px] font-black uppercase py-2.5 rounded-lg flex items-center justify-center gap-1 transition"
                          >
                            <X className="w-3.5 h-3.5 shrink-0" /> No Interesado
                          </button>
                          <button
                            onClick={() => handleConcludeLead(lead.id, LeadStatus.ATTENDED)}
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-[10px] font-black uppercase py-2.5 rounded-lg flex items-center justify-center gap-1 transition"
                          >
                            <Check className="w-3.5 h-3.5 shrink-0 stroke-[3]" /> Concluido Ok
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* COLUMN 3: HISTORIC CLIENTS */}
          <div className="bg-slate-900/45 border border-slate-900 rounded-2xl p-4 flex flex-col">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="font-bold text-sm tracking-wide text-emerald-500 uppercase font-mono">
                  3) Concluidos ({concludedLeads.length})
                </h3>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">Historial</span>
            </div>

            <div className="space-y-3.5 flex-1 max-h-[500px] overflow-y-auto pr-1">
              <AnimatePresence>
                {concludedLeads.length === 0 ? (
                  <div className="p-8 border border-dashed border-slate-850 rounded-xl text-center flex flex-col items-center justify-center text-slate-500 h-64">
                    <Smile className="w-8 h-8 text-slate-700 mb-3" />
                    <p className="text-xs font-semibold">Sin historial de atención</p>
                    <p className="text-[10px] text-slate-650 max-w-[200px] mt-1 text-center">
                      Aquí aparecerán los prospectos atendidos durante el día.
                    </p>
                  </div>
                ) : (
                  concludedLeads.map((lead) => (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-slate-950/80 border border-slate-900 p-3.5 rounded-xl space-y-2.5 text-xs text-slate-300"
                    >
                      <div className="flex justify-between items-start gap-1">
                        <div>
                          <h4 className="font-bold text-slate-200 uppercase leading-snug">{lead.name} {lead.lastName || ''}</h4>
                          <div className="flex flex-col text-[9px] text-slate-500 font-mono mt-0.5 leading-normal">
                            <span className="uppercase text-slate-400">Leap {lead.modelOfInterest}</span>
                            <span className="text-emerald-500/80">{lead.distributor || 'Distribuidor Digital'} • {lead.state || 'N/A'}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase font-mono ${
                          lead.status === LeadStatus.ATTENDED 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {lead.status === LeadStatus.ATTENDED ? 'Atendido' : 'Descartado'}
                        </span>
                      </div>

                      <div className="bg-slate-900/60 p-2 rounded text-[11px] text-slate-400 italic">
                        {lead.notes || 'Sin anotaciones de contacto.'}
                      </div>

                      <div className="flex justify-between items-center text-[9px] font-mono text-slate-500/80 pt-1 border-t border-slate-900">
                        <span>Contacto: {lead.phone}</span>
                        <span className="text-emerald-500">Resp: {getResponseTime(lead) || 'N/D'}</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        
      </div>

      {/* Embedded CSS for the required red blinking animation as requested */}
      <style>{`
        @keyframes blinkRed {
          0%, 100% {
            border-color: rgba(239, 68, 68, 0.9);
            box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
          }
          50% {
            border-color: rgba(30, 41, 59, 0.8);
            box-shadow: 0 0 0px rgba(0, 0, 0, 0);
          }
        }
        .alert-card-pulse {
          animation: blinkRed 1.8s infinite;
        }
      `}</style>
    </div>
  );
}
