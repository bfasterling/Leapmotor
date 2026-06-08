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
import { ALL_DEALERS } from '../data/dealers';
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
  Key,
  Calendar,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import LeapmotorLogo from './LeapmotorLogo';

// Custom Advisor identification details (can be toggled in UI)
const getLeadSourceText = (lead: Lead) => {
  const brand = lead.selectedBrand || (lead.landing === 'jeep' ? 'Jeep' : 'Leapmotor');
  const claveSuffix = lead.modelClaveGen ? ` [${lead.modelClaveGen}]` : '';
  return `${brand} ${lead.modelOfInterest}${claveSuffix}`;
};

const getLeadSourceBadgeClass = (lead: Lead) => {
  if (lead.landing === 'jeep') {
    return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
  }
  if (lead.landing === 'multimarca') {
    return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
  }
  return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
};

// Default safety fallbacks for offline states or seeding initial data
const DEFAULT_ADVISORS = [
  { id: 'ADV-01', name: 'Arturo Stellantis', email: 'arturo@leapmotor.com', password: '123', distributor: 'Leapmotor Santa Fe', active: true },
  { id: 'ADV-02', name: 'Belinda Leap', email: 'belinda@leapmotor.com', password: '123', distributor: 'Leapmotor Mexicali', active: true },
  { id: 'ADV-03', name: 'Carlos Galería', email: 'carlos@leapmotor.com', password: '123', distributor: 'Leapmotor Acueducto', active: true }
];

// Helper to push VIP leads of Leapmotor to Stellantis Netcar CRM API
const sendLeadToCRM = async (lead: Lead, disIdVal: string): Promise<{
  success: boolean;
  status: number;
  solicitudId?: any;
  shiftDigitalId?: string;
  error?: string;
}> => {
  try {
    // Determine corporate disId, default to "01L5000" for tests if not available
    const urlDisId = disIdVal || lead.disId || "01L5000";
    
    // Default B10 modelClaveGen is 'LB1025' if none was explicitly configured
    const userModelClaveGen = lead.modelClaveGen || "LB1025";

    const payload = {
      url: urlDisId,
      cliente: {
        nombre: lead.name ? lead.name.trim() : "",
        apellidoPaterno: lead.lastName ? lead.lastName.trim() : "",
        apellidoMaterno: "",
        correo: lead.email ? lead.email.trim() : "",
        telefono: lead.phone ? lead.phone.trim() : ""
      },
      vehiculo: {
        modelo: userModelClaveGen
      },
      comentarios: lead.postalCode ? `C.P. ${lead.postalCode.trim()}` : "C.P. No Asignado",
      origen: "LANDING",
      conversacion: "Contacto de atención VIP asignado al asesor comercial"
    };

    console.log("[CRM Connection] Posting to Netcar API:", payload);

    const response = await fetch("https://api.stellantis.netcar.com.mx/api/v1/Cotizaciones/Rapida", {
      method: "POST",
      headers: {
        "Usuario": "landings-st",
        "Token": "e05100fa837ecf4e30d5318f6b9a6a0a",
        "BusinessId": "77",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const statusCode = response.status;
    let data: any = null;
    
    try {
      data = await response.json();
    } catch (_) {}

    console.log(`[CRM Connection] Response: Status Code ${statusCode}`, data);

    // netcar api returns 201 when created successfully
    if (statusCode === 201 && data && data.success) {
      return {
        success: true,
        status: 201,
        solicitudId: data.data?.solicitudId || null,
        shiftDigitalId: data.data?.shiftDigitalId || ""
      };
    } else {
      return {
        success: false,
        status: statusCode || 400,
        error: data?.message || data?.error || `Error de respuesta del CRM (${statusCode})`
      };
    }
  } catch (error: any) {
    console.error("[CRM Connection] Client fetch network error (likely CORS or Offline):", error);
    return {
      success: false,
      status: 0,
      error: error.message || "Error de red / CORS bloqueado"
    };
  }
};

export default function AdvisorPanel() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      return (localStorage.getItem('advisor_theme') as 'dark' | 'light') || 'dark';
    } catch (_) {
      return 'dark';
    }
  });

  const isDark = theme === 'dark';

  // Theme styling helpers to keep code clean and robust
  const colBg = isDark ? 'bg-slate-900/45 border-slate-900' : 'bg-white border-slate-200 shadow-md';
  const borderCol = isDark ? 'border-slate-800/60' : 'border-slate-200';
  const borderSub = isDark ? 'border-slate-850' : 'border-slate-200';
  const cardBg = isDark ? 'bg-slate-950' : 'bg-white border-slate-200';
  const textTitle = isDark ? 'text-white' : 'text-slate-900';
  const textBody = isDark ? 'text-slate-100' : 'text-slate-700';
  const textSub = isDark ? 'text-slate-200' : 'text-slate-500';
  const itemBg = isDark ? 'bg-slate-950' : 'bg-slate-100/60';

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      localStorage.setItem('advisor_theme', next);
    } catch (_) {}
  };

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
  const [dbDistributors, setDbDistributors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Track notes being entered per lead ID
  const [notesInput, setNotesInput] = useState<{ [leadId: string]: string }>({});
  
  // Audio configuration & control
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [lastNotificationLeadId, setLastNotificationLeadId] = useState<string>('');
  
  // Keep track of which lead IDs we have already warned about to prevent duplicate alarms
  const warnedLeadsRef = useRef<Set<string>>(new Set());

  // Subscribe to DISTRIBUTORS collection
  useEffect(() => {
    const unsubscribeDistributors = onSnapshot(collection(db, 'distributors'), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setDbDistributors(list);
    }, (error) => {
      console.error("Firestore loading distributors error for advisor panel:", error);
    });
    return () => unsubscribeDistributors();
  }, []);

  // Request browser Notification permission on mount or login
  useEffect(() => {
    document.title = "Stellantis Campo Marte - Asesor";
  }, []);

  useEffect(() => {
    if (loggedInAdvisor && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch((err) => {
          console.error('Error requesting web notification permissions:', err);
        });
      }
    }
  }, [loggedInAdvisor]);

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
              distributor: s.distributor,
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
          modelClaveGen: data.modelClaveGen || '',
          disId: data.disId || '',
          crmSuccess: data.crmSuccess !== undefined ? data.crmSuccess : undefined,
          crmResponseCode: data.crmResponseCode !== undefined ? data.crmResponseCode : undefined,
          crmSolicitudId: data.crmSolicitudId !== undefined ? data.crmSolicitudId : undefined,
          crmShiftDigitalId: data.crmShiftDigitalId || '',
          crmSentAt: data.crmSentAt || null,
          crmError: data.crmError || '',
          status: data.status || LeadStatus.WAITING,
          notes: data.notes || '',
          advisorId: data.advisorId || '',
          advisorName: data.advisorName || '',
          createdAt: data.createdAt,
          attendedAt: data.attendedAt,
          completedAt: data.completedAt,
          contactMethod: data.contactMethod || 'whatsapp',
          requestType: data.requestType,
          landing: data.landing || 'leapmotor',
          selectedBrand: data.selectedBrand || 'Leapmotor',
          testDriveDate: data.testDriveDate || null
        };

        // Filter: Keep leads assigned to this specific advisor OR unassigned Leapmotor waiting leads
        const isAssignedToMe = parsedLead.advisorId === loggedInAdvisor.id;
        const isUnassignedLeapmotorPool = parsedLead.landing === 'leapmotor' && 
                                          (!parsedLead.advisorId || parsedLead.advisorId === "") && 
                                          parsedLead.status === LeadStatus.WAITING &&
                                          parsedLead.requestType !== 'cotizacion' &&
                                          parsedLead.requestType !== 'prueba';

        if (isAssignedToMe || isUnassignedLeapmotorPool) {
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

        // Web Notification trigger
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            const brandText = leadToAlert.selectedBrand || (leadToAlert.landing === 'jeep' ? 'Jeep' : 'Leapmotor');
            try {
              new Notification('🚗 ¡Nuevo Lead Comercial!', {
                body: `Cliente: ${leadToAlert.name} ${leadToAlert.lastName || ''}\nMarca: ${brandText}\nModelo: ${leadToAlert.modelOfInterest}\nTel: ${leadToAlert.phone}`,
                tag: leadToAlert.id,
                requireInteraction: true
              });
            } catch (err) {
              console.error('Error triggering push notification:', err);
            }
          } else if (Notification.permission === 'default') {
            Notification.requestPermission();
          }
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
      
      const payload: any = {
        status: LeadStatus.ATTENDING,
        attendedAt: serverTimestamp(),
        advisorId: loggedInAdvisor.id,
        advisorName: loggedInAdvisor.name
      };

      // Assign distributor associated to the advisor
      let disIdVal = '';
      if (loggedInAdvisor.distributor) {
        payload.distributor = loggedInAdvisor.distributor;

        // Lookup disId based on distributor name
        const matchedDb = dbDistributors?.find(d => d.name === loggedInAdvisor.distributor);
        if (matchedDb && (matchedDb.disId || matchedDb.id)) {
          disIdVal = matchedDb.disId || matchedDb.id;
        } else {
          const matchedLocal = ALL_DEALERS.find(d => d.name === loggedInAdvisor.distributor);
          if (matchedLocal) {
            disIdVal = matchedLocal.id;
          }
        }
        if (disIdVal) {
          payload.disId = disIdVal;
        }
      }

      // Check if lead corresponds to a Leapmotor VIP Attention lead
      const lead = leads.find(l => l.id === leadId);
      const isLeapmotorVip = lead && lead.landing === 'leapmotor' && lead.requestType !== 'cotizacion' && lead.requestType !== 'prueba';

      if (isLeapmotorVip && lead) {
        console.log(`[CRM Integration] Sending Leapmotor VIP lead ${leadId} to Stellantis CRM...`);
        // Call the rapid quotation API
        const crmResult = await sendLeadToCRM(lead, disIdVal);
        
        // Save the results to payload to store in lead document
        payload.crmSuccess = crmResult.success;
        payload.crmResponseCode = crmResult.status;
        payload.crmSolicitudId = crmResult.solicitudId || null;
        payload.crmShiftDigitalId = crmResult.shiftDigitalId || "";
        payload.crmSentAt = new Date().toISOString();
        if (crmResult.error) {
          payload.crmError = crmResult.error;
        }
      }

      await updateDoc(docRef, payload);
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

  const formatFullDateTime = (timestamp: any) => {
    if (!timestamp) return 'No disponible';
    let date: Date;
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } else {
      date = new Date(timestamp);
    }
    return date.toLocaleString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (lead: Lead) => {
    if (!lead.createdAt || !lead.attendedAt) return 'No disponible';
    
    let created: Date = lead.createdAt.toDate ? lead.createdAt.toDate() : new Date(lead.createdAt);
    let attended: Date = lead.attendedAt.toDate ? lead.attendedAt.toDate() : new Date(lead.attendedAt);
    
    const diffSec = Math.floor((attended.getTime() - created.getTime()) / 1000);
    if (diffSec <= 0) return '1 s';
    if (diffSec < 60) return `${diffSec} s`;
    
    const mins = Math.floor(diffSec / 60);
    const secs = diffSec % 60;
    if (mins < 60) {
      return `${mins} min ${secs} s`;
    }
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hours} h ${remMins} min ${secs} s`;
  };

  if (!loggedInAdvisor) {
    return (
      <div className={`w-full min-h-[90vh] flex justify-center items-center font-sans px-4 py-12 transition-colors duration-500 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-850'
      }`}>
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full max-w-md p-8 rounded-3xl shadow-2xl relative overflow-hidden border transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          {/* Aesthetic Theme Toggle (Sun/Moon) */}
          <button
            onClick={toggleTheme}
            type="button"
            className={`absolute top-4 right-4 p-2 rounded-full border transition-all ${
              isDark 
                ? 'bg-slate-800 border-white/10 text-amber-400 hover:bg-slate-700' 
                : 'bg-slate-100 border-slate-200 text-indigo-650 text-indigo-600 hover:bg-slate-200'
            }`}
            title={isDark ? "Cambiar a Diseño Claro (Blanco)" : "Cambiar a Diseño Obscuro (Negro)"}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Accent Glow */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-blue-600/10 blur-[60px] rounded-full pointer-events-none" />
          
          <div className="flex flex-col items-center text-center gap-3 mb-8">
            <LeapmotorLogo size="md" className={isDark ? "text-white" : "text-slate-900"} />
            <div className="mt-2">
              <h2 className={`text-xl font-bold tracking-tight uppercase font-sans ${isDark ? "text-white" : "text-slate-900"}`}>Portal del Asesor</h2>
              <p className={`text-xs font-semibold mt-1 ${isDark ? "text-white" : "text-slate-500"}`}>Inicie sesión para atender sus prospectos asignados en tiempo real</p>
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className={`block text-xs font-mono uppercase tracking-wider font-extrabold mb-2 ${isDark ? "text-white" : "text-slate-700"}`}>Seleccione su Usuario:</label>
              <div className="relative">
                <select
                  value={selectedLoginId}
                  onChange={(e) => {
                    setSelectedLoginId(e.target.value);
                    setLoginError('');
                  }}
                  className={`w-full text-sm rounded-xl px-4 py-3 font-medium outline-none transition appearance-none border ${
                    isDark ? 'bg-slate-950 border-slate-805 text-slate-200 focus:border-blue-500/50' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500/50'
                  }`}
                >
                  {advisors.length === 0 ? (
                    <option value="">Cargando asesores...</option>
                  ) : (
                    advisors.map((adv) => (
                      <option key={adv.id} value={adv.id} className={isDark ? "bg-slate-900 text-white" : "bg-white text-slate-800"}>
                        {adv.name} ({adv.active !== false ? 'Activo' : 'Inactivo'})
                      </option>
                    ))
                  )}
                </select>
                <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-slate-400" : "text-slate-550"}`}>
                  ▼
                </div>
              </div>
            </div>

            <div>
              <label className={`block text-xs font-mono uppercase tracking-wider font-extrabold mb-2 ${isDark ? "text-white" : "text-slate-700"}`}>Contraseña:</label>
              <input
                type="password"
                placeholder="Ingrese contraseña de asesor"
                value={loginPassword}
                onChange={(e) => {
                  setLoginPassword(e.target.value);
                  setLoginError('');
                }}
                className={`w-full text-sm rounded-xl px-4 py-3 outline-none transition font-semibold border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-400 focus:border-blue-500/50' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500/50'
                }`}
              />
            </div>

            {loginError && (
              <p className="text-xs font-medium text-red-500 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
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
          
          <div className={`mt-6 text-center text-[11px] font-bold font-mono ${isDark ? "text-white/90" : "text-slate-500"}`}>
            ¿No aparece en la lista? Comuníquese con administración desde el Tablero de Mando.
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`w-full min-h-screen transition-colors duration-500 font-sans pt-1 px-4 md:pt-2 md:px-6 pb-24 ${
      isDark 
        ? (hasWaiting ? 'bg-red-950/20 text-slate-100' : 'bg-slate-950 text-slate-100') 
        : (hasWaiting ? 'bg-red-50 text-slate-800' : 'bg-slate-50 text-slate-800')
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
        <div className={`border rounded-2xl p-4 md:p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-colors duration-300 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-205 border-slate-200 text-slate-800 shadow-md'
        }`}>
          <div className="space-y-1">
            <h2 className={`text-2xl font-black flex items-center gap-2 font-sans tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <UserCheck className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} /> Consola del Asesor Comercial
            </h2>
            <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-650 text-slate-600'}`}>
              Bienvenido, <strong className={isDark ? 'text-emerald-400' : 'text-emerald-600 font-extrabold'}>{loggedInAdvisor.name}</strong> ({loggedInAdvisor.email}).
            </p>
            {loggedInAdvisor.distributor && (
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} font-mono uppercase font-extrabold`}>
                Distribuidor Asociado: {loggedInAdvisor.distributor}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            {/* Visual style selector (Sun/Moon) */}
            <button
              onClick={toggleTheme}
              type="button"
              className={`flex items-center gap-1 px-3 py-2.5 rounded-xl text-xs font-black transition-all border ${
                isDark 
                  ? 'bg-slate-800 border-white/10 text-white hover:bg-slate-700' 
                  : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
              }`}
              title={`Estilo de Pantalla: ${isDark ? 'NEGRO' : 'BLANCO'}`}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400 shrink-0" /> : <Moon className="w-4 h-4 text-indigo-600 shrink-0" />}
              <span>{isDark ? 'NEGRO' : 'BLANCO'}</span>
            </button>

            {/* Audio Settings Pill */}
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`flex items-center gap-1 px-3 py-2.5 rounded-xl text-xs font-black transition-all border ${
                audioEnabled 
                  ? (isDark ? 'bg-emerald-500/20 text-white border-emerald-500/40' : 'bg-emerald-50 text-emerald-700 border-emerald-205') 
                  : (isDark ? 'bg-slate-950 text-slate-200 border-slate-800 hover:text-white' : 'bg-slate-100 text-slate-600 border-slate-200')
              }`}
              title={`Alerta de Sonido: ${audioEnabled ? 'SÍ' : 'NO'}`}
            >
              <Bell className={`w-4 h-4 shrink-0 ${audioEnabled ? 'animate-bounce text-emerald-400' : (isDark ? 'text-slate-400' : 'text-slate-400')}`} />
              <span>{audioEnabled ? 'SÍ' : 'NO'}</span>
            </button>

            {/* Logout CTA */}
            <button
              onClick={handleLogout}
              className="px-3 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-black transition border border-red-500/20 flex items-center gap-1"
              title="Cerrar sesión de asesor"
            >
              <X className="w-3.5 h-3.5 shrink-0" />
              <span>SALIR</span>
            </button>
          </div>
        </div>

        {/* Real-time Status Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLUMN 1: WAITING EN ESPERA (The Blink Red target) */}
          <div className={`${colBg} border rounded-2xl p-4 flex flex-col transition-all duration-300`}>
            <div className={`flex justify-between items-center pb-4 mb-4 border-b ${borderCol}`}>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <h3 className="font-bold text-sm tracking-wide text-amber-500 uppercase font-mono">
                  1) En Espera ({waitingLeads.length})
                </h3>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${isDark ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>Realtime</span>
            </div>

            <div className="space-y-4 flex-1">
              <AnimatePresence mode="popLayout">
                {waitingLeads.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-8 border border-dashed rounded-xl text-center flex flex-col items-center justify-center h-64 ${
                      isDark ? 'border-slate-700/60 text-white' : 'border-slate-300 text-slate-850 bg-slate-50'
                    }`}
                  >
                    <Smile className={`w-8 h-8 mb-3 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <p className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>Base libre de espera</p>
                    <p className={`text-xs max-w-[200px] mt-1.5 leading-relaxed font-semibold ${isDark ? 'text-slate-200' : 'text-slate-500'}`}>
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
                      className={`border-2 border-red-500/90 p-3 pt-2.5 pb-3.5 rounded-xl shadow-xl space-y-3 relative overflow-hidden group alert-card-pulse ${
                        isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-800'
                      }`}
                      style={{
                        animation: isDark ? 'blinkRed 1.8s infinite' : 'blinkRedLight 1.8s infinite'
                      }}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="flex flex-wrap gap-1.5 items-center mb-2">
                            <div className={`inline-flex items-center gap-1 text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full uppercase ${getLeadSourceBadgeClass(lead)}`}>
                              <Car className="w-3 h-3" /> {getLeadSourceText(lead)}
                            </div>
                            {lead.testDriveDate && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-black font-mono bg-amber-500/15 text-white border border-amber-500/40 px-2 py-0.5 rounded uppercase">
                                <Calendar className="w-3 h-3 shrink-0 text-white" /> Cita {lead.testDriveDate}
                              </span>
                            )}
                            {lead.requestType === 'cotizacion' && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-black font-mono bg-[#00a845]/20 text-white border border-[#00a845]/40 px-2 py-0.5 rounded uppercase">
                                <FileText className="w-3 h-3 shrink-0" /> Cotización
                              </span>
                            )}
                            {lead.requestType === 'prueba' && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-black font-mono bg-indigo-600/30 text-white border border-indigo-500/40 px-2 py-0.5 rounded uppercase">
                                <Key className="w-3 h-3 shrink-0" /> Prueba de Manejo
                              </span>
                            )}
                            {(!lead.requestType || lead.requestType === 'asesor') && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-black font-mono bg-blue-600/30 text-white border border-blue-500/45 px-2 py-0.5 rounded uppercase">
                                <MessageSquare className="w-3 h-3 shrink-0" /> Hablar con Asesor
                              </span>
                            )}
                          </div>
                          <h4 className={`font-sans font-extrabold text-base uppercase tracking-tight leading-snug ${textTitle}`}>
                            {lead.name} {lead.lastName || ''}
                          </h4>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <span className="text-[10px] text-red-500 flex items-center gap-1 font-mono font-bold uppercase animate-pulse">
                            <Clock className="w-3.5 h-3.5" /> urgente
                          </span>
                          <span className={`text-[10px] font-bold font-mono mt-1 ${textSub}`}>
                            {formatTimeAgo(lead.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className={`space-y-1.5 text-xs font-semibold font-mono ${isDark ? 'text-slate-100' : 'text-slate-750 text-slate-705'}`}>
                        <div className="flex items-start gap-1.5">
                          <MapPin className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isDark ? 'text-slate-200' : 'text-slate-500'}`} />
                          <div className="leading-snug">
                            <div className={`font-bold ${textTitle}`}>{lead.distributor || 'Distribuidor Digital'}</div>
                            <div className={`text-[11px] font-black ${isDark ? 'text-white' : 'text-slate-600'}`}>{lead.state || 'N/A'}{lead.postalCode ? ` • CP: ${lead.postalCode}` : ''}</div>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                          <Phone className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-slate-200' : 'text-slate-550'}`} />
                          <span>{lead.phone}</span>
                        </div>

                      </div>

                      {/* Attend Now button */}
                      <button
                        onClick={() => handleStartAttending(lead.id)}
                        className="w-full bg-red-650 bg-red-600 hover:bg-red-500 text-white font-sans font-black py-3 rounded-lg text-xs transition duration-200 uppercase tracking-widest flex items-center justify-center gap-2 relative overflow-hidden active:scale-95"
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
          <div className={`${colBg} border rounded-2xl p-4 flex flex-col transition-all duration-300`}>
            <div className={`flex justify-between items-center pb-4 mb-4 border-b ${borderCol}`}>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <h3 className="font-bold text-sm tracking-wide text-cyan-400 uppercase font-mono">
                  2) En Atención ({attendingLeads.length})
                </h3>
              </div>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${isDark ? 'bg-cyan-400/10 text-cyan-405 text-cyan-400' : 'bg-cyan-50 text-cyan-700 border border-cyan-200'}`}>Llamada/WA</span>
            </div>

            <div className="space-y-4 flex-1">
              <AnimatePresence mode="popLayout">
                {attendingLeads.length === 0 ? (
                  <div className={`p-8 border border-dashed rounded-xl text-center flex flex-col items-center justify-center h-64 ${
                    isDark ? 'border-slate-700/60 text-white' : 'border-slate-300 text-slate-850 bg-slate-50'
                  }`}>
                    <User className={`w-8 h-8 mb-3 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                    <p className={`text-sm font-extrabold ${textTitle}`}>Consola de llamada vacía</p>
                    <p className={`text-xs mt-1.5 leading-relaxed font-semibold ${textSub}`}>
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
                        className={`p-3 pt-2 px-3 pb-3.5 rounded-xl space-y-3 relative border transition-all ${
                          isDark ? 'bg-slate-950 border-cyan-500/35' : 'bg-white border-cyan-400 shadow-sm shadow-cyan-400/5'
                        }`}
                      >
                        <div>
                          {/* Top-aligned Model Name & Response React Time */}
                          <div className="flex justify-between items-center">
                            <div className={`inline-flex items-center gap-0.5 text-[9px] font-black font-mono px-1.5 py-0.5 rounded uppercase ${getLeadSourceBadgeClass(lead)}`}>
                              <Car className="w-3 h-3 shrink-0" /> {getLeadSourceText(lead)}
                            </div>
                            <span className={`text-[10px] font-extrabold font-mono ${textSub}`}>
                              React: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{getResponseTime(lead)}</strong>
                            </span>
                          </div>
                          
                          {/* Secondary request badges */}
                          {(lead.testDriveDate || lead.requestType === 'cotizacion' || lead.requestType === 'prueba') && (
                            <div className="flex flex-wrap gap-1 items-center mt-1.5">
                              {lead.testDriveDate && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-black font-mono bg-amber-500/20 text-white border border-amber-500/40 px-1.5 py-0.5 rounded uppercase">
                                  <Calendar className="w-3 h-3 shrink-0" /> Cita {lead.testDriveDate}
                                </span>
                              )}
                              {lead.requestType === 'cotizacion' && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-black font-mono bg-[#00a845]/20 text-white border border-[#00a845]/40 px-1.5 py-0.5 rounded uppercase">
                                  <FileText className="w-3 h-3 shrink-0" /> Cotización
                                </span>
                              )}
                              {lead.requestType === 'prueba' && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-black font-mono bg-indigo-600/30 text-white border border-indigo-500/40 px-1.5 py-0.5 rounded uppercase">
                                  <Key className="w-3 h-3 shrink-0" /> Prueba de Manejo
                                </span>
                              )}
                            </div>
                          )}
                          
                          <h4 className={`font-sans font-black text-base uppercase tracking-tight mt-2.5 ${textTitle}`}>
                            {lead.name} {lead.lastName || ''}
                          </h4>
                          
                          <div className={`text-[11px] font-mono mt-1.5 font-semibold ${textSub}`}>
                            <span className="text-cyan-600 font-semibold">{lead.distributor || 'Distribuidor Digital'}</span>
                          </div>

                          {/* Contact information with action inline to the right of the phone number */}
                          <div className="flex items-center justify-between bg-slate-100/60 dark:bg-slate-900/40 px-2.5 py-1.5 rounded-lg mt-2 border border-slate-200/50 dark:border-slate-800/50">
                            <div className={`flex items-center gap-1.5 text-xs font-mono font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                              <Phone className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                              <span>{lead.phone}</span>
                            </div>
                            <a
                              href={`tel:${lead.phone}`}
                              className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight transition border flex items-center gap-1 shrink-0 ${
                                isDark 
                                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-705 text-cyan-400 hover:text-cyan-300' 
                                  : 'bg-white hover:bg-slate-50 border-slate-200 text-cyan-600 hover:text-cyan-700 shadow-sm'
                              }`}
                              title="Realizar llamada"
                            >
                              <Phone className="w-3 h-3 shrink-0" />
                              <span>Realizar llamada</span>
                            </a>
                          </div>

                          <span className={`text-[10px] font-bold font-mono mt-2 block ${isDark ? 'text-slate-400' : 'text-slate-550'}`}>
                            Atendido por: {lead.advisorName}
                          </span>
                          
                          <div className={`mt-2 text-[10px] font-mono leading-normal border-t border-dashed pt-2 ${isDark ? 'border-slate-800/80 text-slate-400' : 'border-slate-205 text-slate-500'}`}>
                            <div className="flex flex-wrap justify-between gap-x-2 gap-y-0.5">
                              <div>
                                <span>Generado:</span>{' '}
                                <strong className={`${isDark ? 'text-white' : 'text-slate-900'} font-extrabold`}>
                                  {formatFullDateTime(lead.createdAt)}
                                </strong>
                              </div>
                              <div>
                                <span>Atendido:</span>{' '}
                                <strong className={`${isDark ? 'text-cyan-405 text-cyan-400' : 'text-cyan-600'} font-extrabold`}>
                                  {formatDuration(lead)}
                                </strong>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Conclude outcomes */}
                        <div className={`grid grid-cols-2 gap-2 pt-1 border-t ${isDark ? 'border-slate-900' : 'border-slate-100'}`}>
                          <button
                            onClick={() => handleConcludeLead(lead.id, LeadStatus.LOST)}
                            className={`text-[10px] font-black uppercase py-2.5 rounded-lg flex items-center justify-center gap-1 transition border ${
                              isDark ? 'bg-slate-900 border-amber-500/30 hover:border-amber-500/60 text-amber-400' : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700'
                            }`}
                          >
                            <X className="w-3.5 h-3.5 shrink-0" /> No Asistió
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
          <div className={`${colBg} border rounded-2xl p-4 flex flex-col transition-all duration-300`}>
            <div className={`flex justify-between items-center pb-4 mb-4 border-b ${borderCol}`}>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="font-bold text-sm tracking-wide text-emerald-500 uppercase font-mono">
                  3) Concluidos ({concludedLeads.length})
                </h3>
              </div>
              <span className={`text-[10px] border px-2 py-0.5 rounded-full font-bold ${
                isDark ? 'bg-emerald-500/20 text-white border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-250'
              }`}>Historial</span>
            </div>

            <div className="space-y-3.5 flex-1 max-h-[500px] overflow-y-auto pr-1">
              <AnimatePresence>
                {concludedLeads.length === 0 ? (
                  <div className={`p-8 border border-dashed rounded-xl text-center flex flex-col items-center justify-center h-64 ${
                    isDark ? 'border-slate-700/60 text-white' : 'border-slate-300 text-slate-850 bg-slate-50'
                  }`}>
                    <Smile className={`w-8 h-8 mb-3 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <p className={`text-sm font-extrabold ${textTitle}`}>Sin historial de atención</p>
                    <p className={`text-xs mt-1.5 leading-relaxed font-semibold ${textSub}`}>
                      Aquí aparecerán los prospectos atendidos durante el día.
                    </p>
                  </div>
                ) : (
                  concludedLeads.map((lead) => (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`p-3.5 rounded-xl space-y-2.5 text-xs font-semibold border transition-colors ${
                        isDark ? 'bg-slate-950 border-slate-850 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <div>
                          <h4 className={`font-black uppercase leading-snug text-sm ${textTitle}`}>{lead.name} {lead.lastName || ''}</h4>
                          <div className={`flex flex-col text-[10px] font-mono mt-0.5 leading-normal font-semibold ${textSub}`}>
                            <span className={`uppercase font-extrabold px-1 py-0.5 rounded w-max mb-1 ${isDark ? 'text-white bg-slate-800' : 'text-slate-800 bg-slate-200'}`}>{getLeadSourceText(lead)}</span>
                            {lead.testDriveDate && (
                              <span className="text-amber-500 font-extrabold block">Test Drive: {lead.testDriveDate}</span>
                            )}
                            <span className={`font-bold block ${isDark ? 'text-emerald-450 text-emerald-400' : 'text-emerald-700'}`}>{lead.distributor || 'Distribuidor Digital'} • {lead.state || 'N/A'}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-[8px] font-black uppercase font-mono ${
                          lead.status === LeadStatus.ATTENDED 
                            ? (isDark ? 'bg-emerald-500/20 text-white border border-emerald-500/35' : 'bg-emerald-50 text-emerald-700 border border-emerald-300') 
                            : (isDark ? 'bg-red-500/20 text-white border border-red-500/35' : 'bg-red-50 text-red-700 border border-red-300')
                        }`}>
                          {lead.status === LeadStatus.ATTENDED ? 'Atendido' : 'Descartado'}
                        </span>
                      </div>

                      <div className={`p-2.5 rounded text-[11px] italic font-medium leading-relaxed border ${
                        isDark ? 'bg-slate-900 border-slate-800/80 text-white' : 'bg-white border-slate-150 text-slate-700 shadow-sm'
                      }`}>
                        {lead.notes || 'Sin anotaciones de contacto.'}
                      </div>

                      <div className={`flex justify-between items-center text-[10px] font-mono font-bold pt-1 border-t ${
                        isDark ? 'border-slate-800 text-slate-200' : 'border-slate-200 text-slate-550'
                      }`}>
                        <span>Contacto: {lead.phone}</span>
                        <span className={`font-black ${isDark ? 'text-emerald-400' : 'text-emerald-750'}`}>Resp: {getResponseTime(lead) || 'N/D'}</span>
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
            border-color: rgba(15, 23, 42, 0.8);
            box-shadow: 0 0 0px rgba(0, 0, 0, 0);
          }
        }
        @keyframes blinkRedLight {
          0%, 100% {
            border-color: rgba(239, 68, 68, 0.95);
            box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
          }
          50% {
            border-color: rgba(226, 232, 240, 0.9);
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
