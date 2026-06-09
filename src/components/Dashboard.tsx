/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, doc, setDoc, deleteDoc, updateDoc, getDocs, writeBatch } from 'firebase/firestore';
import { db, activeDbId } from '../firebase';
import { Lead, LeadStatus } from '../types';
import { ALL_DEALERS } from '../data/dealers';
import LeapmotorLogo from './LeapmotorLogo';
import leapmotorLogoImg from '../assets/images/leapmotor_logo_1780268613531.png';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  Legend 
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Percent, 
  Car, 
  Award, 
  BarChart2, 
  Calendar, 
  Zap,
  Bell,
  MapPin,
  FileText,
  Key,
  MessageSquare,
  Sparkles,
  Sun,
  Moon,
  Pencil,
  Search,
  Filter,
  CheckCircle,
  Database,
  UploadCloud,
  RefreshCw,
  Trash2,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import { motion } from 'motion/react';

// Pie chart colors matching Leapmotor theme
const COLORS = ['#2563EB', '#06B6D4', '#F59E0B', '#EF4444'];

const OFFICIAL_DISTRIBUTORS_STATIC = [
  { marca: "LEAPMOTOR", claveCorporativo: "01L5060", disId: "65012", estado: "AGUASCALIENTES", name: "Leapmotor Aguascalientes", url: "leapmotoraguascalientes.com" },
  { marca: "LEAPMOTOR", claveCorporativo: "01L5330", disId: "65003", estado: "BAJA CALIFORNIA", name: "Leapmotor Tijuana", url: "leapmotortijuana.com" },
  { marca: "LEAPMOTOR", claveCorporativo: "01L5340", disId: "65004", estado: "BAJA CALIFORNIA", name: "Leapmotor Mexicali", url: "leapmotormexicali.mx" },
  { marca: "LEAPMOTOR", claveCorporativo: "01L5400", disId: "65026", estado: "COAHUILA", name: "Leapmotor Saltillo", url: "leapmotorsaltillo.mx" },
  { marca: "LEAPMOTOR", claveCorporativo: "01L5280", disId: "65032", estado: "COLIMA", name: "Leapmotor Colima", url: "leapmotorcolima.mx" },
  { marca: "LEAPMOTOR", claveCorporativo: "01L5281", disId: "65033", estado: "COLIMA", name: "Leapmotor Manzanillo", url: "leapmotormanzanillo.mx" },
  { marca: "LEAPMOTOR", claveCorporativo: "01L5160", disId: "65002", estado: "CHIHUAHUA", name: "Leapmotor Chihuahua", url: "leapmotorchihuahua.mx" },
  { marca: "LEAPMOTOR", claveCorporativo: "01L5020", disId: "65006", estado: "CIUDAD DE MÉXICO", name: "Leapmotor Santa Fe", url: "leapmotorsantafe.mx" },
  { marca: "LEAPMOTOR", claveCorporativo: "01L5350", disId: "65042", estado: "CIUDAD DE MÉXICO", name: "Leapmotor Viaducto", url: "leapmotorviaducto.mx" },
  { marca: "LEAPMOTOR", claveCorporativo: "01L5390", disId: "65020", estado: "GUANAJUATO", name: "Leapmotor Celaya", url: "leapmotorcelaya.com" },
  { marca: "LEAPMOTOR", claveCorporativo: "01L5380", disId: "65023", estado: "HIDALGO", name: "Leapmotor Pachuca", url: "leapmotorpachuca.mx" },
  { marca: "LEAPMOTOR", claveCorporativo: "01L5310", disId: "65031", estado: "JALISCO", name: "Leapmotor Acueducto", url: "leapmotoracueducto.com" },
  { marca: "LEAPMOTOR", claveCorporativo: "01L5130", disId: "65009", estado: "ESTADO DE MÉXICO", name: "Leapmotor Cuautitlán", url: "leapmotorcuautitlan.mx" },
  { marca: "LEAPMOTOR", claveCorporativo: "01L5370", disId: "65025", estado: "ESTADO DE MÉXICO", name: "Leapmotor Coacalco", url: "leapmotorcoacalco.mx" },
  { marca: "LEAPMOTOR", claveCorporativo: "01L5120", disId: "65027", estado: "ESTADO DE MÉXICO", name: "Leapmotor Zaragoza", url: "leapmotorzaragoza.mx" },
  { marca: "LEAPMOTOR", claveCorporativo: "01M7570", disId: "65030", estado: "ESTADO DE MÉXICO", name: "Leapmotor Lázaro Cárdenas", url: "leapmotorlazarocardenas.com" },
  { marca: "LEAPMOTOR", claveCorporativo: "01L5360", disId: "65041", estado: "ESTADO DE MÉXICO", name: "Leapmotor Naucalpan", url: "leapmotornaucalpan.mx" },
  { marca: "LEAPMOTOR", claveCorporativo: "01L5300", disId: "65043", estado: "ESTADO DE MÉXICO", name: "Leapmotor Camino Real", url: "leapmotorcaminoreal.com" },
  { marca: "LEAPMOTOR", claveCorporativo: "01L5040", disId: "65017", estado: "MICHOACÁN", name: "Leapmotor Morelia", url: "leapmotormorelia.mx" },
  { marca: "LEAPMOTOR", claveCorporativo: "01L5030", disId: "65037", estado: "MORELOS", name: "Leapmotor Cuernavaca", url: "leapmotorcuernavaca.mx" },
  { marca: "LEAPMOTOR", claveCorporativo: "01L5200", disId: "65010", estado: "NUEVO LEÓN", name: "Leapmotor Lindavista", url: "leapmotorlindavista.mx" },
  { marca: "LEAPMOTOR", claveCorporativo: "01L5191", disId: "65028", estado: "NUEVO LEÓN", name: "Leapmotor Valle Oriente", url: "leapmotorvalleoriente.mx" },
  { marca: "LEAPMOTOR", claveCorporativo: "01L5190", disId: "65029", estado: "NUEVO LEÓN", name: "Leapmotor San Pedro", url: "leapmotorsanpedro.mx" },
  { marca: "LEAPMOTOR", claveCorporativo: "01L5210", disId: "65039", estado: "PUEBLA", name: "Leapmotor Puebla Angelópolis", url: "leapmotorangelopolis.mx" },
  { marca: "LEAPMOTOR", claveCorporativo: "01L5220", disId: "65040", estado: "PUEBLA", name: "Leapmotor Puebla Serdán", url: "leapmotorserdan.mx" },
  { marca: "LEAPMOTOR", claveCorporativo: "01L5010", disId: "65036", estado: "QUERÉTARO", name: "Leapmotor Querétaro", url: "leapmotorqueretaro.mx" }
];

export default function Dashboard() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      return (localStorage.getItem('dashboard_theme') as 'dark' | 'light') || 'dark';
    } catch (_) {
      return 'dark';
    }
  });

  const isDark = theme === 'dark';

  // Theme helpers for clean code structure in Dashboard
  const dashBg = isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800';
  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm';
  const titleColor = isDark ? 'text-white' : 'text-slate-900';
  const subColor = isDark ? 'text-slate-200' : 'text-slate-600';
  const mutedColor = isDark ? 'text-slate-400' : 'text-slate-500';
  const inputStyle = isDark ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-500/50 outline-none' : 'bg-white border-slate-200 text-slate-800 focus:border-indigo-500/50 outline-none';
  const borderLine = isDark ? 'border-slate-800/60' : 'border-slate-200';

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      localStorage.setItem('dashboard_theme', next);
    } catch (_) {}
  };

  // Helper to get local date string YYYY-MM-DD
  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Date range filters state: Default to local 'Hoy'
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getTodayString());

  // Advisors and advisor creation states
  const [advisors, setAdvisors] = useState<any[]>([]);
  const [newAdvName, setNewAdvName] = useState('');
  const [newAdvEmail, setNewAdvEmail] = useState('');
  const [newAdvPassword, setNewAdvPassword] = useState('');
  const [distributors, setDistributors] = useState<any[]>([]);
  const [newAdvDistributor, setNewAdvDistributor] = useState('');
  const [mgmtError, setMgmtError] = useState('');
  const [mgmtSuccess, setMgmtSuccess] = useState('');
  const [editingAdvisorId, setEditingAdvisorId] = useState<string | null>(null);

  // Estados para panel de administración de leads del coordinador
  const [leadSearch, setLeadSearch] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>('all');
  const [leadLandingFilter, setLeadLandingFilter] = useState<string>('all');
  const [leadAgencyFilter, setLeadAgencyFilter] = useState('all');
  const [leadAdvisorFilter, setLeadAdvisorFilter] = useState('all');
  const [leadDateFilter, setLeadDateFilter] = useState<string>('all');
  const [leadSearchStartDate, setLeadSearchStartDate] = useState('');
  const [leadSearchEndDate, setLeadSearchEndDate] = useState('');

  // Estados para paginación de prospectos
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Estados para edición de notas de coordinador
  const [editingNotesLeadId, setEditingNotesLeadId] = useState<string | null>(null);
  const [editingNotesText, setEditingNotesText] = useState('');

  // Estado para reasignación de asesor
  const [reassigningLeadId, setReassigningLeadId] = useState<string | null>(null);
  const [selectedReassignAdvisorId, setSelectedReassignAdvisorId] = useState('');

  // Estado para visualización conjunta de administración
  const [adminTab, setAdminTab] = useState<'prospectos' | 'asesores' | 'distribuidores'>('prospectos');

  // Estados para sincronización y carga de distribuidores (CSV o Catálogo)
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvMessage, setCsvMessage] = useState<{ text: string, type: 'info' | 'success' | 'error' } | null>(null);
  const [csvDetails, setCsvDetails] = useState<string[]>([]);

  // Estados para simulación y ejecución manual de Sincronización CRM
  const [syncCrmLoading, setSyncCrmLoading] = useState(false);
  const [syncCrmResults, setSyncCrmResults] = useState<any | null>(null);
  const [syncCrmConsoleLogs, setSyncCrmConsoleLogs] = useState<string[]>([]);
  const [syncCrmSuccess, setSyncCrmSuccess] = useState<boolean | null>(null);

  const handleTriggerCrmSync = async () => {
    setSyncCrmLoading(true);
    setSyncCrmSuccess(null);
    setSyncCrmResults(null);
    setSyncCrmConsoleLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Iniciando conexión a /api/cron/sync-leads en el servidor local...`]);
    try {
      const res = await fetch('/api/cron/sync-leads', { method: 'POST' });
      const rawText = await res.text();
      
      let data: any = null;
      try {
        data = JSON.parse(rawText);
      } catch (jsonErr: any) {
        setSyncCrmSuccess(false);
        setSyncCrmConsoleLogs(prev => [
          ...prev,
          `[ERROR HTTP ${res.status}] El servidor no retornó un JSON válido.`,
          `[Respuesta del Servidor (Primeros 600 caracteres)]:` ,
          rawText.substring(0, 600)
        ]);
        return;
      }
      
      if (res.ok && data.success) {
        setSyncCrmSuccess(true);
        setSyncCrmResults(data.results || data);
        setSyncCrmConsoleLogs(prev => [
          ...prev, 
          `[${new Date().toLocaleTimeString()}] Respuesta exitosa del servidor. Código HTTP: ${res.status}`,
          `[Resultado] Mensaje: ${data.message}`,
          `[Resultado] Leads procesados en esta ejecución: ${data.results?.processedCount ?? 0}`,
          `[Resultado] Leads escaneados en total: ${data.results?.totalScanned ?? 0}`,
          `[Sincronizados] (${data.results?.syncedLeads?.length ?? 0} leads): ${JSON.stringify(data.results?.syncedLeads ?? [])}`,
          `[Fallidos] (${data.results?.failedLeads?.length ?? 0} leads): ${JSON.stringify(data.results?.failedLeads ?? [])}`,
          `[INFO] La sincronización se cargó correctamente desde la base de datos "default" como fue ordenado.`
        ]);
      } else {
        setSyncCrmSuccess(false);
        setSyncCrmResults(data);
        setSyncCrmConsoleLogs(prev => [
          ...prev,
          `[ERROR] El servidor respondió con un código de error: ${res.status}`,
          `[Detalle] ${JSON.stringify(data)}`
        ]);
      }
    } catch (err: any) {
      setSyncCrmSuccess(false);
      setSyncCrmConsoleLogs(prev => [
        ...prev,
        `[EXCEPTION] Error al invocar el sync-leads: ${err.message || err}`
      ]);
    } finally {
      setSyncCrmLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Stellantis Campo Marte - Tablero digital";
  }, []);

  // Reset page to 1 when filters or page size change
  useEffect(() => {
    setCurrentPage(1);
  }, [leadSearch, leadStatusFilter, leadLandingFilter, leadAgencyFilter, leadAdvisorFilter, leadDateFilter, pageSize]);

  // Subscribe to leads
  useEffect(() => {
    const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const parsed: Lead[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        parsed.push({
          id: docSnap.id,
          name: d.name || '',
          lastName: d.lastName || '',
          email: d.email || '',
          phone: d.phone || '',
          postalCode: d.postalCode || '',
          state: d.state || '',
          distributor: d.distributor || '',
          city: d.city || '',
          modelOfInterest: d.modelOfInterest || 'C10',
          modelClaveGen: d.modelClaveGen || '',
          disId: d.disId || '',
          crmSuccess: d.crmSuccess !== undefined ? d.crmSuccess : undefined,
          crmResponseCode: d.crmResponseCode !== undefined ? d.crmResponseCode : undefined,
          crmSolicitudId: d.crmSolicitudId !== undefined ? d.crmSolicitudId : undefined,
          crmShiftDigitalId: d.crmShiftDigitalId || '',
          crmSentAt: d.crmSentAt || null,
          crmError: d.crmError || '',
          status: d.status || LeadStatus.WAITING,
          notes: d.notes || '',
          advisorId: d.advisorId || '',
          advisorName: d.advisorName || '',
          createdAt: d.createdAt,
          attendedAt: d.attendedAt,
          completedAt: d.completedAt,
          requestType: d.requestType,
          landing: d.landing || 'leapmotor',
          selectedBrand: d.selectedBrand || 'Leapmotor',
          testDriveDate: d.testDriveDate || null,
          coordinatorNotes: d.coordinatorNotes || ''
        });
      });
      setLeads(parsed);
      setLoading(false);
    }, (error) => {
      console.error("Dashboard snap error:", error);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to advisors
  useEffect(() => {
    const unsubscribeAdvisors = onSnapshot(collection(db, 'advisors'), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setAdvisors(list);
    }, (error) => {
      console.error("Dashboard advisors subscription error:", error);
    });

    return () => unsubscribeAdvisors();
  }, []);

  // Load distributors from the database on startup (with dynamic auto-seeding if collection is empty)
  useEffect(() => {
    let active = true;
    
    if (distributors.length === 0) {
      console.log(`[Firebase] Startup trigger: Fetching distributors collection...`);
      const fetchDistributors = async () => {
        try {
          const ref = collection(db, 'distributors');
          const snap = await getDocs(ref);
          
          if (!active) return;
          
          const list: any[] = [];
          snap.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...docSnap.data() });
          });
          
          // Sort first by brand (marca) and then by name
          list.sort((a, b) => {
            const brandComp = (a.marca || '').localeCompare(b.marca || '');
            if (brandComp !== 0) return brandComp;
            return (a.name || '').localeCompare(b.name || '');
          });
          
          if (list.length > 0) {
            console.log(`[Firebase] Successfully loaded ${list.length} distributors on startup.`);
            setDistributors(list);
            setNewAdvDistributor(prev => prev || list[0].name);
          } else {
            console.warn("[Firebase] No distributors found in Firestore collection 'distributors'. Collection is empty. Auto-seeding catalog to collection...");
            
            // Auto-seed to the default database so that the user gets real database values instantly
            const chunkSize = 400;
            const fallbackList = ALL_DEALERS.map((d) => ({
              id: d.id,
              disId: d.id,
              marca: d.brand,
              claveCorporativo: d.corpKey,
              estado: d.state,
              name: d.name,
              url: d.url || ''
            }));

            try {
              for (let i = 0; i < fallbackList.length; i += chunkSize) {
                const batch = writeBatch(db);
                const chunk = fallbackList.slice(i, i + chunkSize);
                chunk.forEach(d => {
                  const docRef = doc(db, 'distributors', d.id);
                  batch.set(docRef, {
                    marca: d.marca,
                    claveCorporativo: d.claveCorporativo,
                    disId: d.disId,
                    estado: d.estado,
                    name: d.name,
                    url: d.url,
                    createdAt: new Date()
                  }, { merge: true });
                });
                await batch.commit();
                console.log(`[Firebase] Auto-seeded batch ${Math.floor(i / chunkSize) + 1} (${chunk.length} elements)`);
              }
              console.log("[Firebase] Database automatic seeding completed successfully.");
            } catch (seedErr) {
              console.error("Failed to seed distributors during background restore:", seedErr);
            }

            const sortedList = fallbackList.sort((a, b) => {
              const brandComp = (a.marca || '').localeCompare(b.marca || '');
              if (brandComp !== 0) return brandComp;
              return (a.name || '').localeCompare(b.name || '');
            });
            setDistributors(sortedList);
            setNewAdvDistributor(prev => prev || sortedList[0].name);
          }
        } catch (err) {
          console.error("Error loading distributors from database on-demand:", err);
          if (!active) return;
          console.log("[Firebase Fallback] Using local ALL_DEALERS dataset to guarantee admin functionality...");
          const fallbackList = ALL_DEALERS.map((d) => ({
            id: d.id,
            disId: d.id,
            marca: d.brand,
            claveCorporativo: d.corpKey,
            estado: d.state,
            name: d.name,
            url: d.url || ''
          })).sort((a, b) => {
            const brandComp = (a.marca || '').localeCompare(b.marca || '');
            if (brandComp !== 0) return brandComp;
            return (a.name || '').localeCompare(b.name || '');
          });
          setDistributors(fallbackList);
          setNewAdvDistributor(prev => prev || fallbackList[0].name);
        }
      };
 
      fetchDistributors();
    }
 
    return () => {
      active = false;
    };
  }, [distributors.length]);

  // Filter leads based on selected date range in upper inputs
  const filteredLeads = leads.filter(lead => {
    if (!lead.createdAt) return true; // include if loading
    
    // Convert to Date
    let d: Date;
    if (lead.createdAt.toDate && typeof lead.createdAt.toDate === 'function') {
      d = lead.createdAt.toDate();
    } else {
      d = new Date(lead.createdAt);
    }

    if (startDate) {
      const start = new Date(startDate + "T00:00:00");
      if (d < start) return false;
    }
    if (endDate) {
      const end = new Date(endDate + "T23:59:59");
      if (d > end) return false;
    }
    return true;
  });

  // Handle addition or updates of a sales advisor
  const handleAddAdvisorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMgmtError('');
    setMgmtSuccess('');

    if (!newAdvName.trim() || !newAdvEmail.trim() || !newAdvPassword.trim()) {
      setMgmtError('Todos los campos son obligatorios para guardar los datos.');
      return;
    }

    try {
      const selectedDist = newAdvDistributor || (distributors[0]?.name || 'Leapmotor Santa Fe');
      
      if (editingAdvisorId) {
        // Update existing advisor
        await updateDoc(doc(db, 'advisors', editingAdvisorId), {
          name: newAdvName.trim(),
          email: newAdvEmail.trim(),
          password: newAdvPassword.trim(),
          distributor: selectedDist
        });
        setMgmtSuccess('Asesor comercial actualizado con éxito.');
        setEditingAdvisorId(null);
      } else {
        // Create new advisor
        const id = 'ADV-' + Date.now().toString().slice(-6);
        await setDoc(doc(db, 'advisors', id), {
          name: newAdvName.trim(),
          email: newAdvEmail.trim(),
          password: newAdvPassword.trim(),
          distributor: selectedDist,
          active: true,
          createdAt: new Date()
        });
        setMgmtSuccess('Asesor comercial registrado con éxito.');
      }

      // Reset form
      setNewAdvName('');
      setNewAdvEmail('');
      setNewAdvPassword('');
      if (distributors.length > 0) {
        setNewAdvDistributor(distributors[0].name);
      }
    } catch (err: any) {
      console.error(err);
      setMgmtError('No se pudo guardar el asesor en Firebase. Verifique privilegios.');
    }
  };

  const handleEditAdvisorClick = (adv: any) => {
    setEditingAdvisorId(adv.id);
    setNewAdvName(adv.name || '');
    setNewAdvEmail(adv.email || '');
    setNewAdvPassword(adv.password || '');
    setNewAdvDistributor(adv.distributor || (distributors[0]?.name || ''));
    setMgmtError('');
    setMgmtSuccess('');
  };

  const handleCancelEdit = () => {
    setEditingAdvisorId(null);
    setNewAdvName('');
    setNewAdvEmail('');
    setNewAdvPassword('');
    if (distributors.length > 0) {
      setNewAdvDistributor(distributors[0].name);
    }
    setMgmtError('');
    setMgmtSuccess('');
  };

  // Toggle active status for advisor assignment engine
  const toggleAdvisorActive = async (advId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'advisors', advId), {
        active: !currentStatus
      });
    } catch (err) {
      console.error("Error toggling active advisor status:", err);
    }
  };

  // Permanently delete advisor
  const handleDeleteAdvisor = async (advId: string) => {
    if (!window.confirm('¿Desea eliminar de forma permanente a este asesor? Los prospectos asignados a él no se verán afectados.')) return;
    try {
      await deleteDoc(doc(db, 'advisors', advId));
    } catch (err) {
      console.error("Error deleting advisor:", err);
    }
  };

  // Guardar comentarios específicos de coordinador
  const handleSaveCoordinatorNotes = async (leadId: string, notesText: string) => {
    try {
      await updateDoc(doc(db, 'leads', leadId), {
        coordinatorNotes: notesText.trim()
      });
      setEditingNotesLeadId(null);
    } catch (err) {
      console.error("Error saving coordinator notes:", err);
    }
  };

  // Reasignar prospecto a un asesor
  const handleReassignLead = async (leadId: string, advId: string) => {
    if (!advId) return;
    const advisorObj = advisors.find(a => a.id === advId);
    if (!advisorObj) return;

    try {
      const chosenDistName = advisorObj.distributor || 'Leapmotor Santa Fe';
      let disIdVal = '';
      const matchedDb = distributors?.find(d => d.name === chosenDistName);
      if (matchedDb && (matchedDb.disId || matchedDb.id)) {
        disIdVal = matchedDb.disId || matchedDb.id;
      } else {
        const matchedLocal = ALL_DEALERS.find(d => d.name === chosenDistName);
        if (matchedLocal) {
          disIdVal = matchedLocal.id;
        }
      }

      const payload: any = {
        advisorId: advisorObj.id,
        advisorName: advisorObj.name,
        distributor: chosenDistName,
        disId: disIdVal
      };
      await updateDoc(doc(db, 'leads', leadId), payload);
      setMgmtSuccess('Prospecto reasignado con éxito.');
      setMgmtError('');
      setReassigningLeadId(null);
      setSelectedReassignAdvisorId('');
    } catch (err: any) {
      console.error("Error reassigning lead in Firestore:", err);
      setMgmtError(`Error al reasignar: ${err.message || 'Denegado por reglas de seguridad'}`);
      setMgmtSuccess('');
    }
  };

  // Cancelar prospecto desde el panel de espera
  const handleCancelLead = async (leadId: string) => {
    if (!window.confirm('¿Desea cancelar este prospecto?')) return;
    try {
      await updateDoc(doc(db, 'leads', leadId), {
        status: LeadStatus.LOST,
        completedAt: new Date()
      });
    } catch (err) {
      console.error("Error canceling lead:", err);
    }
  };

  // Cerrar prospectos estancados en atención
  const handleCloseLeadInAttending = async (leadId: string, outcome: 'no_asistio' | 'ok') => {
    const confirmMsg = outcome === 'no_asistio'
      ? '¿Cerrar prospecto como "No Asistió"?'
      : '¿Cerrar prospecto como "OK" (Exitoso)?';

    if (!window.confirm(confirmMsg)) return;

    try {
      await updateDoc(doc(db, 'leads', leadId), {
        status: outcome === 'no_asistio' ? LeadStatus.LOST : LeadStatus.ATTENDED,
        completedAt: new Date()
      });
    } catch (err) {
      console.error("Error manual closing lead in attention:", err);
    }
  };

  // --- MÓDULO DE SINCRONIZACIÓN Y CARGA DE DISTRIBUIDORES ---

  // Parser simple y robusto de filas de CSV compatible con comillas internas y formato RFC-4180
  const parseCSVRow = (text: string): string[] => {
    const result: string[] = [];
    let currentWord = '';
    let insideQuotes = false;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        result.push(currentWord.trim());
        currentWord = '';
      } else {
        currentWord += char;
      }
    }
    result.push(currentWord.trim());
    return result;
  };

  // Función núcleo para limpiar la BD y cargar el catálogo especificado en lotes seguro (límite 400 por batch)
  const reloadDistributorsInFirestore = async (dealersList: any[]) => {
    try {
      setCsvMessage({ text: 'Iniciando sincronización con base de datos...', type: 'info' });
      setCsvDetails(prev => [...prev, `Conectando y consultando colección "distributors" en base de datos activa: "${activeDbId}"...`]);
      
      const ref = collection(db, 'distributors');
      const currentSnap = await getDocs(ref);
      const currentDocs = currentSnap.docs;
      
      setCsvDetails(prev => [...prev, `Encontrados ${currentDocs.length} registros anteriores que se eliminarán para evitar duplicados.`]);
      
      // Batch Deletes (chunks of 400)
      const chunkSize = 400;
      for (let i = 0; i < currentDocs.length; i += chunkSize) {
        const batch = writeBatch(db);
        const chunk = currentDocs.slice(i, i + chunkSize);
        chunk.forEach(docSnap => {
          batch.delete(docSnap.ref);
        });
        await batch.commit();
        setCsvDetails(prev => [...prev, `🧹 Lote de eliminación de transacciones (${chunk.length} elementos) completado.`]);
      }
      
      setCsvDetails(prev => [...prev, `Procediendo a subir ${dealersList.length} distribuidores nuevos en base de datos "${activeDbId}"...`]);
      
      // Batch Writes (chunks of 400)
      for (let i = 0; i < dealersList.length; i += chunkSize) {
        const batch = writeBatch(db);
        const chunk = dealersList.slice(i, i + chunkSize);
        chunk.forEach(dist => {
          const docRef = doc(db, 'distributors', dist.disId);
          batch.set(docRef, {
            marca: dist.marca,
            claveCorporativo: dist.claveCorporativo,
            disId: dist.disId,
            estado: dist.estado,
            name: dist.name,
            url: dist.url,
            createdAt: new Date()
          }, { merge: true });
        });
        await batch.commit();
        setCsvDetails(prev => [...prev, `💾 Lote de escritura (${chunk.length} elementos) guardado con éxito (${Math.min(i + chunkSize, dealersList.length)} / ${dealersList.length}).`]);
      }
      
      // Update local state in Dashboard so the advisor registry form refreshes itself immediately
      setDistributors(dealersList.sort((a,b) => {
        const brandComp = (a.marca || '').localeCompare(b.marca || '');
        if (brandComp !== 0) return brandComp;
        return (a.name || '').localeCompare(b.name || '');
      }));
      if (dealersList.length > 0) {
        setNewAdvDistributor(dealersList[0].name);
      }
      
      setCsvMessage({ text: '¡Sincronización completada con éxito!', type: 'success' });
      setCsvDetails(prev => [...prev, `✅ Sincronización completada: ${dealersList.length} registros cargados y guardados de forma segura en la base de datos "${activeDbId}". Las interfaces han sido actualizadas.`]);
      setCsvFile(null);
    } catch (dbErr: any) {
      console.error(dbErr);
      setCsvMessage({ text: `Error de Firestore: ${dbErr.message || 'Privilegios insuficientes o error de conexión'}`, type: 'error' });
      setCsvDetails(prev => [...prev, `❌ ERROR FIRESTORE: ${dbErr.message || 'Denegado por reglas de seguridad'}`]);
      throw dbErr;
    }
  };

  // Acción para parsear archivo CSV seleccionado manualmente y enviarlo al recargo
  const handleUploadCSV = async (file: File | null) => {
    if (!file) {
      setCsvMessage({ text: 'Por favor, selecciona un archivo CSV primero.', type: 'error' });
      return;
    }
    
    setCsvUploading(true);
    setCsvMessage({ text: 'Procesando archivo CSV cargado...', type: 'info' });
    setCsvDetails(['Leyendo flujo binario a texto...']);
    
    try {
      const reader = new FileReader();
      
      const fileData = await new Promise<string>((resolve, reject) => {
        reader.onload = (e) => resolve(e.target?.result as string || '');
        reader.onerror = (e) => reject(new Error('No se pudo leer el archivo físico.'));
        reader.readAsText(file);
      });
      
      const lines = fileData.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
      if (lines.length < 2) {
        throw new Error('El archivo CSV está vacío o no contiene suficientes filas (se requiere fila de títulos de columna y datos).');
      }
      
      const headers = parseCSVRow(lines[0]).map(h => h.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
      setCsvDetails(prev => [...prev, `Columnas detectadas en cabecera: [ ${headers.join(' | ')} ]`]);
      
      // Auto-identify indices based on headers
      const colMarca = headers.findIndex(h => h.includes('brand') || h.includes('marca') || h.includes('fabricante'));
      const colClave = headers.findIndex(h => h.includes('corpkey') || h.includes('clave') || h.includes('corporativ') || h.includes('corp'));
      const colId = headers.findIndex(h => h.includes('id') || h.includes('disid') || h.includes('dealerid') || h.includes('distribuidorid') || h.includes('clavecorporativ'));
      const colState = headers.findIndex(h => h.includes('state') || h.includes('estado') || h.includes('provincia') || h.includes('region'));
      const colName = headers.findIndex(h => h.includes('name') || h.includes('nombre') || h.includes('distribuidor') || h.includes('agencia'));
      const colUrl = headers.findIndex(h => h.includes('url') || h.includes('web') || h.includes('sitio') || h.includes('link'));
      
      if (colName === -1) {
        throw new Error('No se pudo identificar una columna para el NOMBRE de la agencia/distribuidor (ej. "name", "nombre", "distribuidor"). Verifique encabezados.');
      }
      
      const parsedDealers: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const row = parseCSVRow(lines[i]);
        if (row.length === 0 || (row.length === 1 && row[0] === '')) continue;
        
        const brandRaw = colMarca !== -1 ? row[colMarca] : 'LEAPMOTOR';
        const brand = brandRaw ? brandRaw.toUpperCase().trim() : 'LEAPMOTOR';
        
        const corpKey = colClave !== -1 ? (row[colClave] || '').trim() : '';
        const id = colId !== -1 && row[colId] ? row[colId].trim() : `D-${Date.now().toString().slice(-4)}-${i}`;
        const state = colState !== -1 ? (row[colState] || 'N/A').trim().toUpperCase() : 'N/A';
        const name = (row[colName] || '').trim();
        const url = colUrl !== -1 ? (row[colUrl] || '').trim() : '';
        
        if (!name) continue;
        
        parsedDealers.push({
          marca: brand,
          claveCorporativo: corpKey,
          disId: id,
          estado: state,
          name: name,
          url: url
        });
      }
      
      setCsvDetails(prev => [...prev, `CSV parseado con éxito: ${parsedDealers.length} registros extraídos.`]);
      await reloadDistributorsInFirestore(parsedDealers);
    } catch (err: any) {
      console.error(err);
      setCsvMessage({ text: `Error de procesamiento: ${err.message || 'Formato de CSV desconocido'}`, type: 'error' });
      setCsvDetails(prev => [...prev, `❌ ERROR CSV: ${err.message || 'Verifique codificación UTF-8'}`]);
    } finally {
      setCsvUploading(false);
    }
  };

  // Restaurar el catálogo completo del sistema de forma automática con un click para salvar desarrollo vs producción
  const handleRestoreSystemCatalog = async () => {
    const confirmation = window.confirm(
      `¿Desea restablecer el catálogo oficial del sistema (${ALL_DEALERS.length} distribuidores oficiales multi-marca) en la base de datos "${activeDbId}"?\n\nEsto borrará todas las agencias personalizadas registradas antes.`
    );
    if (!confirmation) return;
    
    setCsvUploading(true);
    setCsvMessage({ text: 'Iniciando restauración de catálogo de sistema...', type: 'info' });
    setCsvDetails(['Leyendo catálogo interno "ALL_DEALERS" del código fuente...']);
    
    try {
      const systemDealers = ALL_DEALERS.map(d => ({
        marca: d.brand,
        claveCorporativo: d.corpKey,
        disId: d.id,
        estado: d.state,
        name: d.name,
        url: d.url
      }));
      
      await reloadDistributorsInFirestore(systemDealers);
    } catch (err: any) {
      console.error(err);
      setCsvMessage({ text: `Error de restauración: ${err.message || 'Fallo de escritura Firestore'}`, type: 'error' });
      setCsvDetails(prev => [...prev, `❌ ERROR RESTAURAR: ${err.message || 'Error imprevisto'}`]);
    } finally {
      setCsvUploading(false);
    }
  };

  // --- FIN MÓDULO DE DISTRIBUIDORES ---

  // Helper to detect if a lead's createdAt is today
  const getIsToday = (createdAt: any) => {
    if (!createdAt) return false;
    const d = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    const now = new Date();
    return d.getDate() === now.getDate() && 
           d.getMonth() === now.getMonth() && 
           d.getFullYear() === now.getFullYear();
  };

  // Leads registered today
  const leadsToday = leads.filter(l => getIsToday(l.createdAt));
  const totalLeadsToday = leadsToday.length;
  const leapmotorLeadsToday = leadsToday.filter(l => !l.landing || l.landing === 'leapmotor').length;
  const jeepLeadsToday = leadsToday.filter(l => l.landing === 'jeep').length;
  const multimarcaLeadsToday = leadsToday.filter(l => l.landing === 'multimarca').length;

  // Real-time Leapmotor status counts (tiempo real) (Excluyendo cotización y prueba del flujo de asesores)
  const leapmotorWaitingCountRealTime = leads.filter(l => (!l.landing || l.landing === 'leapmotor') && l.status === LeadStatus.WAITING && l.requestType !== 'cotizacion' && l.requestType !== 'prueba').length;
  const leapmotorAttendingCountRealTime = leads.filter(l => (!l.landing || l.landing === 'leapmotor') && l.status === LeadStatus.ATTENDING && l.requestType !== 'cotizacion' && l.requestType !== 'prueba').length;
  const leapmotorAttendedCountRealTime = leads.filter(l => (!l.landing || l.landing === 'leapmotor') && l.status === LeadStatus.ATTENDED && l.requestType !== 'cotizacion' && l.requestType !== 'prueba').length;

  // Compute stats based on the selected date filters
  const totalLeads = filteredLeads.length;
  
  const statusCounts = filteredLeads.reduce((acc, lead) => {
    // Excluir cotizaciones y pruebas de las estadísticas del embudo de asesores
    if (lead.requestType !== 'cotizacion' && lead.requestType !== 'prueba') {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
    }
    return acc;
  }, {} as { [key: string]: number });

  const waitingCount = statusCounts[LeadStatus.WAITING] || 0;
  const attendingCount = statusCounts[LeadStatus.ATTENDING] || 0;
  const attendedCount = statusCounts[LeadStatus.ATTENDED] || 0;
  const lostCount = statusCounts[LeadStatus.LOST] || 0;

  // Calculo de Tiempo Promedio de Atención (en segundos)
  const attendedLeadsWithTime = filteredLeads.filter(l => l.createdAt && l.attendedAt);
  let averageResponseTimeSec = 0;
  if (attendedLeadsWithTime.length > 0) {
    const totalElapsedSec = attendedLeadsWithTime.reduce((sum, l) => {
      let created: Date = l.createdAt.toDate ? l.createdAt.toDate() : new Date(l.createdAt);
      let attended: Date = l.attendedAt.toDate ? l.attendedAt.toDate() : new Date(l.attendedAt);
      const elapsed = Math.max(0, Math.floor((attended.getTime() - created.getTime()) / 1000));
      return sum + elapsed;
    }, 0);
    averageResponseTimeSec = Math.round(totalElapsedSec / attendedLeadsWithTime.length);
  }

  // Tasa de Conversión (Atendidos con éxito vs total procesados)
  const processedCount = attendedCount + lostCount;
  const conversionRate = processedCount > 0 ? Math.round((attendedCount / processedCount) * 100) : 0;

  // Counts by Request Type (Cotización, Prueba de manejo, Hablar con asesor)
  const cotizacionLeads = filteredLeads.filter(l => l.requestType === 'cotizacion').length;
  const pruebaLeads = filteredLeads.filter(l => l.requestType === 'prueba').length;
  const asesorLeads = filteredLeads.filter(l => !l.requestType || l.requestType === 'asesor').length;

  // Counts by Landing Page campaign
  const leapmotorLandingCount = filteredLeads.filter(l => !l.landing || l.landing === 'leapmotor').length;
  const jeepLandingCount = filteredLeads.filter(l => l.landing === 'jeep').length;
  const multimarcaLandingCount = filteredLeads.filter(l => l.landing === 'multimarca').length;

  const landingChartData = [
    { name: 'Leapmotor', Leads: leapmotorLandingCount },
    { name: 'Jeep', Leads: jeepLandingCount },
    { name: 'Multimarca', Leads: multimarcaLandingCount }
  ];

  // Leads por Marca / Multimarca data calculation
  const brandCounts = filteredLeads.reduce((acc, lead) => {
    const rawBrand = lead.selectedBrand || (lead.landing === 'jeep' ? 'Jeep' : (lead.landing === 'leapmotor' ? 'Leapmotor' : 'Multimarca'));
    const isLeapRaw = !lead.landing || lead.landing === 'leapmotor';
    const finalBrandName = isLeapRaw ? 'Leapmotor' : (rawBrand.charAt(0).toUpperCase() + rawBrand.slice(1).toLowerCase());
    acc[finalBrandName] = (acc[finalBrandName] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  // List of active brands
  const BRAND_LIST_EXPECTED = ['Leapmotor', 'Jeep', 'Fiat', 'Dodge', 'Ram', 'Peugeot'];
  const brandChartData = BRAND_LIST_EXPECTED.map(brName => ({
    name: brName,
    Leads: brandCounts[brName] || 0
  })).sort((a, b) => b.Leads - a.Leads);

  // 1. Data for conversion status pie (deprecated/removed, but kept as helper structure if needed)
  const pieChartData = [
    { name: 'Éxito (Atendidos)', value: attendedCount },
    { name: 'En Proceso', value: attendingCount },
    { name: 'Esperando', value: waitingCount },
    { name: 'No Interesado', value: lostCount }
  ].filter(d => d.value > 0);

  // 3. Data for State and Distributor ratio
  const stateCounts = filteredLeads.reduce((acc, lead) => {
    const key = lead.state || 'N/A';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const stateChartData = Object.entries(stateCounts)
    .map(([st, val]) => ({ name: st, Cantidad: val as number }))
    .sort((a, b) => b.Cantidad - a.Cantidad)
    .slice(0, 7);

  const distributorCounts = filteredLeads.reduce((acc, lead) => {
    const key = lead.distributor || 'Distribuidor Digital';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const distributorChartData = Object.entries(distributorCounts)
    .map(([dist, val]) => ({ name: dist.replace('Leapmotor ', ''), Cantidad: val as number }))
    .sort((a, b) => b.Cantidad - a.Cantidad)
    .slice(0, 5);

  // Filtrado de prospectos para la sección de administración del coordinador
  const uniqueLeadDistributors = Array.from(new Set(leads.map(l => l.distributor).filter(Boolean))).sort();

  const filteredCoordinatorLeads = leads.filter(lead => {
    // 1. Búsqueda por nombre, apellido, correo o teléfono
    if (leadSearch.trim()) {
      const q = leadSearch.toLowerCase().trim();
      const fullName = `${lead.name} ${lead.lastName || ''}`.toLowerCase();
      const email = (lead.email || '').toLowerCase();
      const phone = lead.phone || '';
      if (!fullName.includes(q) && !email.includes(q) && !phone.includes(q)) {
        return false;
      }
    }

    // 2. Filtro por Estado
    if (leadStatusFilter !== 'all') {
      if (lead.status !== leadStatusFilter) return false;
    }

    // 3. Filtro por Agencia
    if (leadAgencyFilter !== 'all') {
      if (lead.distributor !== leadAgencyFilter) return false;
    }

    // 4. Filtro por Asesor asignado
    if (leadAdvisorFilter !== 'all') {
      if (leadAdvisorFilter === 'unassigned') {
        if (lead.advisorId) return false;
      } else {
        if (lead.advisorId !== leadAdvisorFilter) return false;
      }
    }

    // 5. Filtro por Rango / Fecha de hoy
    const leadDate = lead.createdAt?.toDate ? lead.createdAt.toDate() : new Date(lead.createdAt || Date.now());
    if (leadDateFilter === 'today') {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      if (leadDate < todayStart || leadDate > todayEnd) return false;
    } else if (leadDateFilter === 'range') {
      if (leadSearchStartDate) {
        const start = new Date(leadSearchStartDate + "T00:00:00");
        if (leadDate < start) return false;
      }
      if (leadSearchEndDate) {
        const end = new Date(leadSearchEndDate + "T23:59:59");
        if (leadDate > end) return false;
      }
    }

    // 6. Nuevo Filtro por Landing de Ingreso / Campaña / Marca (Permite filtrar marca y cotizacion/prueba simultaneamente)
    if (leadLandingFilter !== 'all') {
      const parts = leadLandingFilter.split('_');
      const land = parts[0]; // 'leapmotor', 'jeep', 'multimarca'
      const leadLanding = lead.landing || 'leapmotor';
      
      if (leadLanding !== land) return false;
      
      if (parts.length > 1 && parts[1] !== 'all') {
        const reqType = lead.requestType || 'asesor';
        const brand = (lead.selectedBrand || '').toLowerCase();
        
        if (parts[1] === 'cotizacion' || parts[1] === 'prueba' || parts[1] === 'asesor') {
          if (reqType !== parts[1]) return false;
        } else {
          let brandFilter = parts[1];
          let typeFilter = parts[2];
          
          if (parts[1] === 'leapmotor' && parts[2] === 'brand') {
            brandFilter = 'leapmotor';
            typeFilter = parts[3];
          }
          
          if (brand !== brandFilter) return false;
          
          if (typeFilter && typeFilter !== 'all' && typeFilter !== 'brand') {
            if (reqType !== typeFilter) return false;
          }
        }
      }
    }

    return true;
  });

  // Parámetros de paginación para el administrador de prospectos
  const totalLeadsCount = filteredCoordinatorLeads.length;
  const totalPages = Math.ceil(totalLeadsCount / pageSize) || 1;
  const activePage = currentPage > totalPages ? totalPages : currentPage;
  
  const startIndex = (activePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalLeadsCount);
  const paginatedCoordinatorLeads = filteredCoordinatorLeads.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className={`w-full min-h-screen flex justify-center items-center ${isDark ? 'bg-slate-950 text-emerald-400' : 'bg-slate-50 text-emerald-600'}`}>
        <div className={`w-10 h-10 border-4 animate-spin rounded-full ${isDark ? 'border-emerald-500 border-t-transparent' : 'border-emerald-600 border-t-transparent'}`}></div>
      </div>
    );
  }

  return (
    <div className={`w-full min-h-screen transition-colors duration-500 pb-24 ${dashBg}`}>
      <div className="max-w-7xl mx-auto pt-4 px-4 md:pt-6 md:px-6" id="dashboard-view">
        
        {/* Main Dashboard Header */}
        <div className={`border rounded-3xl p-5 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-colors duration-300 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-205 border-slate-200 text-slate-800 shadow-md'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="p-1 px-3 bg-white rounded-2xl shadow-sm border border-slate-200 shrink-0 flex items-center justify-center select-none scale-90 sm:scale-100">
              <LeapmotorLogo 
                size="sm" 
                variant="white" 
                style={{ height: '36px', width: 'auto' }} 
                imgStyle={{ height: '36px', width: 'auto' }}
              />
            </div>
            <div className="space-y-1">
              <h1 className={`text-xl font-black flex items-center gap-2 font-sans tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Tablero Digital de Mando
              </h1>
              <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-650 text-slate-600'}`}>
                Módulo de Coordinación en Tiempo Real &bull; <span className="font-mono text-[10px] text-emerald-500 font-extrabold">HOST: {activeDbId}</span>
              </p>
              <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'} font-mono uppercase font-extrabold`}>
                Socio Estratégico: Stellantis Joint Venture
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            {/* Visual style selector (Sun/Moon) */}
            <button
              onClick={toggleTheme}
              type="button"
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all border ${
                isDark 
                  ? 'bg-slate-800 border-white/10 hover:bg-slate-700 text-white' 
                  : 'bg-slate-105 border-slate-205 hover:bg-slate-200 text-slate-800 shadow-sm'
              }`}
              title={`Estilo de Pantalla: ${isDark ? 'NEGRO' : 'BLANCO'}`}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400 shrink-0" /> : <Moon className="w-4 h-4 text-indigo-650 text-indigo-600 shrink-0" />}
              <span>ESTILO: {isDark ? 'NEGRO' : 'BLANCO'}</span>
            </button>
          </div>
        </div>

        {/* Date Filter Bar */}
        <div className={`${cardBg} rounded-3xl p-5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all duration-300 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-2xl rounded-full pointer-events-none" />
          <div className="space-y-1">
            <h2 className={`text-sm font-black flex items-center gap-2 font-mono uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Calendar className={`w-4 h-4 animate-pulse ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} /> HISTÓRICO DE FECHAS SELECCIONABLES
            </h2>
            <p className={`text-xs font-semibold ${isDark ? 'text-slate-100' : 'text-slate-500'}`}>Selecciona el rango para filtrar prospectos, conversión y desempeño de asesores en tiempo real.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className={`flex items-center gap-2 border px-3.5 py-2 rounded-xl ${isDark ? 'bg-slate-950 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
              <span className={`text-[10px] uppercase font-mono font-extrabold ${isDark ? 'text-white' : 'text-slate-600'}`}>Desde:</span>
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`bg-transparent text-xs outline-none select-none font-black ${isDark ? 'text-white' : 'text-slate-800'}`}
              />
            </div>
            <div className={`flex items-center gap-2 border px-3.5 py-2 rounded-xl ${isDark ? 'bg-slate-950 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
              <span className={`text-[10px] uppercase font-mono font-extrabold ${isDark ? 'text-white' : 'text-slate-600'}`}>Hasta:</span>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`bg-transparent text-xs outline-none select-none font-black ${isDark ? 'text-white' : 'text-slate-800'}`}
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className={`text-xs border px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-1 ${
                  isDark ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20' : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
                }`}
              >
                Ver Todo
              </button>
            )}
            {(startDate !== getTodayString() || endDate !== getTodayString()) && (
              <button
                type="button"
                onClick={() => { setStartDate(getTodayString()); setEndDate(getTodayString()); }}
                className={`text-xs border px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-1 ${
                  isDark ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-750 border-emerald-300'
                }`}
              >
                Filtro: Hoy
              </button>
            )}
          </div>
        </div>
      
      {/* Leapmotor Real-time Status Grid */}
      <div className="mb-8">
        <h3 className={`text-xs font-black tracking-widest uppercase font-mono mb-4 flex items-center gap-2 ${titleColor}`}>
          <Sparkles className="w-4 h-4 text-cyan-400" /> OPERACIÓN LEAPMOTOR EN TIEMPO REAL
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: En espera */}
          <div className={`${cardBg} p-5 rounded-2xl relative overflow-hidden flex items-center justify-between transition-all duration-300 border-l-4 border-l-amber-500`}>
            <div>
              <span className="text-[11px] font-mono text-amber-550 text-amber-500 tracking-wider uppercase font-extrabold">LeapMotor En Espera</span>
              <div className={`text-3xl font-black mt-1.5 font-mono ${titleColor}`}>{leapmotorWaitingCountRealTime}</div>
              <p className={`text-[11px] font-bold mt-1 ${mutedColor}`}>Cola de espera general</p>
            </div>
            <div className={`p-3.5 rounded-xl ${isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
          </div>

          {/* Card 2: En atencion */}
          <div className={`${cardBg} p-5 rounded-2xl relative overflow-hidden flex items-center justify-between transition-all duration-300 border-l-4 border-l-cyan-500`}>
            <div>
              <span className="text-[11px] font-mono text-cyan-500 tracking-wider uppercase font-extrabold">LeapMotor En Atención</span>
              <div className={`text-3xl font-black mt-1.5 font-mono ${titleColor}`}>{leapmotorAttendingCountRealTime}</div>
              <p className={`text-[11px] font-bold mt-1 ${mutedColor}`}>Siendo atendidos</p>
            </div>
            <div className={`p-3.5 rounded-xl ${isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-50 text-cyan-700 border border-cyan-200'}`}>
              <Users className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Atendidos */}
          <div className={`${cardBg} p-5 rounded-2xl relative overflow-hidden flex items-center justify-between transition-all duration-300 border-l-4 border-l-emerald-500`}>
            <div>
              <span className="text-[11px] font-mono text-emerald-500 tracking-wider uppercase font-extrabold">LeapMotor Atendidos</span>
              <div className={`text-3xl font-black mt-1.5 font-mono ${titleColor}`}>{leapmotorAttendedCountRealTime}</div>
              <p className={`text-[11px] font-bold mt-1 ${mutedColor}`}>Finalizados exitosamente</p>
            </div>
            <div className={`p-3.5 rounded-xl ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Operación Leads Hoy (General summary) */}
      <div className="mb-8">
        <h3 className={`text-xs font-black tracking-widest uppercase font-mono mb-4 flex items-center gap-2 ${titleColor}`}>
          <BarChart2 className="w-4 h-4 text-indigo-400" /> OPERACIÓN LEADS HOY
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Leads Today */}
          <div className={`${cardBg} p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between transition-all duration-300`}>
            <div className="flex justify-between items-start">
              <span className={`text-[12px] font-mono tracking-wider uppercase font-extrabold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Leads Hoy</span>
              <span className={`p-2 rounded-xl ${isDark ? 'bg-indigo-500/20 text-white' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'}`}>
                <Users className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-4">
              <div className={`text-3xl font-black ${titleColor}`}>{totalLeadsToday}</div>
              <p className={`text-[11px] font-extrabold font-mono mt-1 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>Leads totales de hoy</p>
            </div>
          </div>

          {/* Card 2: Leapmotor Today */}
          <div className={`${cardBg} p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between transition-all duration-300`}>
            <div className="flex justify-between items-start">
              <span className={`text-[12px] font-mono tracking-wider uppercase font-extrabold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>LeapMotor Hoy</span>
              <span className={`p-2 rounded-xl ${isDark ? 'bg-cyan-500/20 text-white' : 'bg-cyan-50 text-cyan-700 border border-cyan-200'}`}>
                <Car className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-4">
              <div className={`text-3xl font-black ${titleColor}`}>{leapmotorLeadsToday}</div>
              <p className={`text-[11px] font-extrabold font-mono mt-1 ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>Landing LeapMotor</p>
            </div>
          </div>

          {/* Card 3: Jeep Cherokee Today */}
          <div className={`${cardBg} p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between transition-all duration-300`}>
            <div className="flex justify-between items-start">
              <span className={`text-[12px] font-mono tracking-wider uppercase font-extrabold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Jeep Cherokee Hoy</span>
              <span className={`p-2 rounded-xl ${isDark ? 'bg-emerald-500/20 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                <Car className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-4">
              <div className={`text-3xl font-black ${titleColor}`}>{jeepLeadsToday}</div>
              <p className={`text-[11px] font-extrabold font-mono mt-1 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>Landing Jeep Cherokee</p>
            </div>
          </div>

          {/* Card 4: Multimarca Today */}
          <div className={`${cardBg} p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between transition-all duration-300`}>
            <div className="flex justify-between items-start">
              <span className={`text-[12px] font-mono tracking-wider uppercase font-extrabold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Multimarca Hoy</span>
              <span className={`p-2 rounded-xl ${isDark ? 'bg-amber-500/20 text-white' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                <Car className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-4">
              <div className={`text-3xl font-black ${titleColor}`}>{multimarcaLeadsToday}</div>
              <p className={`text-[11px] font-extrabold font-mono mt-1 ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>Landing Multimarca</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tipos de Solicitudes de Clientes panel */}
      <div className="mb-8">
        <h3 className={`text-sm font-black tracking-wider uppercase font-mono mb-4 flex items-center gap-2 ${titleColor}`}>
          <Sparkles className="w-4 h-4 text-blue-400" /> RESUMEN DE REQUERIMIENTOS SOLICITADOS
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`border hover:border-[#00a845]/60 transition p-5 rounded-2xl flex items-center justify-between shadow-lg transition-all duration-300 ${
            isDark ? 'bg-white/10 border-[#00a845]/35' : 'bg-white border-[#00a845]/20 shadow-sm'
          }`}>
            <div>
              <span className="text-[11px] font-mono text-emerald-500 tracking-wider uppercase font-extrabold">Cotizaciones</span>
              <div className={`text-3xl font-black mt-1.5 font-mono ${titleColor}`}>{cotizacionLeads}</div>
            </div>
            <div className={`p-3.5 rounded-xl ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
              <FileText className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className={`border hover:border-indigo-500/60 transition p-5 rounded-2xl flex items-center justify-between shadow-lg transition-all duration-300 ${
            isDark ? 'bg-white/10 border-indigo-500/35' : 'bg-white border-indigo-500/20 shadow-sm'
          }`}>
            <div>
              <span className="text-[11px] font-mono text-indigo-500 tracking-wider uppercase font-extrabold">Pruebas de Manejo</span>
              <div className={`text-3xl font-black mt-1.5 font-mono ${titleColor}`}>{pruebaLeads}</div>
            </div>
            <div className={`p-3.5 rounded-xl ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600 border border-indigo-200'}`}>
              <Key className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className={`border hover:border-blue-500/60 transition p-5 rounded-2xl flex items-center justify-between shadow-lg transition-all duration-300 ${
            isDark ? 'bg-white/10 border-blue-500/35' : 'bg-white border-blue-500/20 shadow-sm'
          }`}>
            <div>
              <span className="text-[11px] font-mono text-blue-500 tracking-wider uppercase font-extrabold">Llamar Asesor / Atención</span>
              <div className={`text-3xl font-black mt-1.5 font-mono ${titleColor}`}>{asesorLeads}</div>
            </div>
            <div className={`p-3.5 rounded-xl ${isDark ? 'bg-blue-500/20 text-blue-450 text-blue-400' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}>
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Analytics charts panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* CHART 1: Landing Page Leads Origin Ratio */}
        <div className={`${cardBg} rounded-2xl p-6 transition-all duration-300`}>
          <h3 className={`text-sm font-black tracking-wide uppercase font-mono mb-6 flex items-center gap-2 ${titleColor}`}>
            <BarChart2 className="w-4 h-4 text-indigo-400" /> Leads por Landing de Origen
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {totalLeads === 0 ? (
              <div className={`text-center text-xs font-bold py-12 md:col-span-2 ${subColor}`}>
                Registrando leads originarios...
              </div>
            ) : (
              <>
                <div className="h-48 w-full relative">
                  <ResponsiveContainer width="100%" height="100%" minHeight={192}>
                    <BarChart data={landingChartData} layout="vertical" margin={{ left: -10, right: 10, top: 10, bottom: 10 }}>
                      <XAxis type="number" stroke="#64748b" fontSize={9} fontClassName="font-mono" hide />
                      <YAxis dataKey="name" type="category" stroke="#cbd5e1" fontSize={9} width={80} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: isDark ? '#090d16' : '#ffffff', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', color: isDark ? '#ffffff' : '#333333' }} />
                      <Bar dataKey="Leads" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={12}>
                        {landingChartData.map((entry, index) => {
                          const colors = ['#3b82f6', '#10b981', '#6366f1'];
                          return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className={`space-y-3 p-3 rounded-xl border text-[11px] font-mono ${isDark ? 'bg-slate-950/40 border-white/5' : 'bg-slate-50 border-slate-150'}`}>
                  <div className={`flex justify-between pb-1 border-b font-semibold ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                    <span className="text-blue-500 font-extrabold">● Leapmotor</span>
                    <strong className={`font-black ${titleColor}`}>{leapmotorLandingCount}</strong>
                  </div>
                  <div className={`flex justify-between pb-1 border-b font-semibold ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                    <span className="text-emerald-500 font-extrabold">● Jeep Experience</span>
                    <strong className={`font-black ${titleColor}`}>{jeepLandingCount}</strong>
                  </div>
                  <div className={`flex justify-between font-semibold ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                    <span className="text-indigo-500 font-extrabold">● Multimarca</span>
                    <strong className={`font-black ${titleColor}`}>{multimarcaLandingCount}</strong>
                  </div>
                  <div className={`flex justify-between pt-1 border-t font-bold ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                    <span className={`font-bold ${titleColor}`}>Total Leads</span>
                    <strong className={`font-black ${titleColor}`}>{totalLeads}</strong>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* CHART 2: Leads por Marca o Submarca de Interés (Fiat, Dodge, Ram, Peugeot, Jeep, Leapmotor) */}
        <div className={`${cardBg} rounded-2xl p-6 transition-all duration-300`}>
          <h3 className={`text-sm font-black tracking-wide uppercase font-mono mb-6 flex items-center gap-2 ${titleColor}`}>
            <Award className="w-4 h-4 text-emerald-400" /> Leads por Marca / Multimarca
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {totalLeads === 0 ? (
              <div className={`text-center text-xs font-bold py-12 md:col-span-2 ${subColor}`}>
                Registrando marcas consultadas...
              </div>
            ) : (
              <>
                <div className="h-48 w-full relative">
                  <ResponsiveContainer width="100%" height="100%" minHeight={192}>
                    <BarChart data={brandChartData} layout="vertical" margin={{ left: -10, right: 10, top: 10, bottom: 10 }}>
                      <XAxis type="number" stroke="#64748b" fontSize={9} fontClassName="font-mono" hide />
                      <YAxis dataKey="name" type="category" stroke="#cbd5e1" fontSize={9} width={80} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: isDark ? '#090d16' : '#ffffff', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', color: isDark ? '#ffffff' : '#333333' }} />
                      <Bar dataKey="Leads" fill="#10b981" radius={[0, 4, 4, 0]} barSize={12}>
                        {brandChartData.map((entry, index) => {
                          const colorsBrands = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];
                          return <Cell key={`cell-${index}`} fill={colorsBrands[index % colorsBrands.length]} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className={`space-y-1.5 p-3 rounded-xl border text-[10px] font-mono ${isDark ? 'bg-slate-950/40 border-white/5' : 'bg-slate-50 border-slate-150'}`}>
                  {brandChartData.map((bInfo, idx) => {
                    const dotColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];
                    return (
                      <div key={bInfo.name} className={`flex justify-between pb-1 border-b last:border-0 font-semibold ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                        <span style={{ color: dotColors[idx % dotColors.length] }}>● {bInfo.name}</span>
                        <strong className={`font-black ${titleColor}`}>{bInfo.Leads}</strong>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Top 5 Distributors interest */}
        <div className={`${cardBg} rounded-2xl p-6 transition-all duration-300`}>
          <h3 className={`text-sm font-black tracking-wide uppercase font-mono mb-4 flex items-center gap-2 ${titleColor}`}>
            <MapPin className="w-4 h-4 text-emerald-400" /> Distribuidores de Interés
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {distributorChartData.length === 0 ? (
              <div className={`col-span-full text-center text-xs font-bold py-8 ${subColor}`}>Registrando distribuidores...</div>
            ) : (
              distributorChartData.map((d, i) => {
                const qty = d.Cantidad as number;
                const percentage = totalLeads > 0 ? Math.round((qty / totalLeads) * 100) : 0;
                return (
                  <div key={d.name} className={`space-y-1.5 p-4 rounded-xl border ${isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50/50 border-slate-200'}`}>
                     <div className="flex justify-between text-xs">
                      <span className={`font-extrabold truncate max-w-[200px] ${titleColor}`}>{i + 1}. {d.name}</span>
                      <span className="text-emerald-500 font-mono font-black">{qty} ({percentage}%)</span>
                    </div>
                    <div className={`w-full h-2.5 rounded-full overflow-hidden border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-105 bg-slate-100 border-slate-205 border-slate-200'}`}>
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN CONJUNTA DE ADMINISTRACIÓN TABULADA */}
      <div className={`mt-8 border rounded-3xl p-6 transition-all duration-300 relative overflow-hidden ${cardBg}`} id="tabbed-administration-system">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
        
        {/* Tab Headers */}
        <div className="flex border-b border-slate-800/10 dark:border-white/10 mb-6 gap-2 sm:gap-4 overflow-x-auto whitespace-nowrap">
          <button
            type="button"
            onClick={() => setAdminTab('prospectos')}
            className={`pb-4 px-4 font-black text-xs sm:text-sm tracking-widest uppercase font-mono border-b-2 transition-all duration-300 flex items-center gap-2 cursor-pointer ${
              adminTab === 'prospectos'
                ? 'border-blue-500 text-blue-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            Control de Prospectos
          </button>
          <button
            type="button"
            onClick={() => setAdminTab('asesores')}
            className={`pb-4 px-4 font-black text-xs sm:text-sm tracking-widest uppercase font-mono border-b-2 transition-all duration-300 flex items-center gap-2 cursor-pointer ${
              adminTab === 'asesores'
                ? 'border-emerald-500 text-emerald-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Control de Asesores
          </button>
          <button
            type="button"
            onClick={() => setAdminTab('distribuidores')}
            className={`pb-4 px-4 font-black text-xs sm:text-sm tracking-widest uppercase font-mono border-b-2 transition-all duration-300 flex items-center gap-2 cursor-pointer ${
              adminTab === 'distribuidores'
                ? 'border-purple-500 text-purple-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            Distribuidores ({distributors.length})
          </button>
        </div>

        {/* Tab 1: Administración de Prospectos */}
        {adminTab === 'prospectos' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className={`text-sm font-black tracking-widest uppercase font-mono mb-1.5 flex items-center gap-2 ${titleColor}`}>
                  <Filter className="w-4 h-4 text-blue-400" /> ADMINISTRACIÓN GENERAL DE PROSPECTOS
                </h3>
                <p className={`text-xs font-semibold leading-relaxed ${subColor}`}>
                  Filtre, busque, asigne o reasigne prospectos originarios de todas las campañas en tiempo real.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-blue-500/15 text-blue-400 text-[11px] font-mono font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl border border-blue-500/25">
                Leads Filtrados: {filteredCoordinatorLeads.length}
              </div>
            </div>

            {/* Fila de Filtros Avanzados */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 p-4 rounded-2xl border ${isDark ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-50 border-slate-200'}`}>
              {/* 1. Búsqueda por Texto */}
              <div>
                <label className={`block text-[10px] font-mono tracking-wider uppercase font-extrabold mb-1.5 ${isDark ? 'text-white' : 'text-slate-600'}`}>Buscar Cliente:</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Nombre, Telefono, Correo..."
                    value={leadSearch}
                    onChange={(e) => setLeadSearch(e.target.value)}
                    className={`w-full border rounded-xl pl-9 pr-3 py-2 text-xs outline-none transition font-semibold ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:border-blue-500/50' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500/50'
                    }`}
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* 2. Filtro de Estado */}
              <div>
                <label className={`block text-[10px] font-mono tracking-wider uppercase font-extrabold mb-1.5 ${isDark ? 'text-white' : 'text-slate-600'}`}>Filtrar por Estado:</label>
                <select
                  value={leadStatusFilter}
                  onChange={(e) => setLeadStatusFilter(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 text-xs outline-none transition font-semibold cursor-pointer ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white focus:border-blue-500/50' : 'bg-white border-slate-200 text-slate-800 focus:border-indigo-500/50'
                  }`}
                >
                  <option value="all">TODOS LOS ESTADOS</option>
                  <option value={LeadStatus.WAITING}>EN ESPERA DE ATENCIÓN</option>
                  <option value={LeadStatus.ATTENDING}>EN ATENCIÓN ACTIVA</option>
                  <option value={LeadStatus.ATTENDED}>ATENDIDOS CON ÉXITO / OK</option>
                  <option value={LeadStatus.LOST}>DESCARTADOS / CANCELADOS</option>
                </select>
              </div>

              {/* 6. Nuevo Filtro de Landing/Origen de Campaña */}
              <div>
                <label className={`block text-[10px] font-mono tracking-wider uppercase font-extrabold mb-1.5 ${isDark ? 'text-white' : 'text-slate-600'}`}>Landing / Campaña / Marca:</label>
                <select
                  value={leadLandingFilter}
                  onChange={(e) => setLeadLandingFilter(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 text-xs outline-none transition font-semibold cursor-pointer ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white focus:border-blue-500/50' : 'bg-white border-slate-200 text-slate-800 focus:border-indigo-500/50'
                  }`}
                >
                  <option value="all">TODOS LOS EXPOSITORES</option>
                  <optgroup label="Leapmotor">
                    <option value="leapmotor_all">LeapMotor - Todos</option>
                    <option value="leapmotor_cotizacion">LeapMotor - Cotización</option>
                    <option value="leapmotor_asesor">LeapMotor - Atención Asesor</option>
                  </optgroup>
                  <optgroup label="Jeep Experience">
                    <option value="jeep_all">Jeep Cherokee - Todos</option>
                    <option value="jeep_cotizacion">Jeep Cherokee - Cotización</option>
                    <option value="jeep_prueba">Jeep Cherokee - Prueba de Manejo</option>
                  </optgroup>
                  <optgroup label="Multimarca">
                    <option value="multimarca_all">Multimarca - Todos los Prospectos</option>
                    <option value="multimarca_cotizacion">Multimarca - Sólo Cotización (Cualquier Marca)</option>
                    <option value="multimarca_prueba">Multimarca - Sólo Prueba de Manejo (Cualquier Marca)</option>
                    <option value="multimarca_fiat">Multimarca - Fiat (Todos)</option>
                    <option value="multimarca_fiat_cotizacion">Multimarca - Fiat (Cotización)</option>
                    <option value="multimarca_fiat_prueba">Multimarca - Fiat (Prueba de Manejo)</option>
                    <option value="multimarca_dodge">Multimarca - Dodge (Todos)</option>
                    <option value="multimarca_dodge_cotizacion">Multimarca - Dodge (Cotización)</option>
                    <option value="multimarca_dodge_prueba">Multimarca - Dodge (Prueba de Manejo)</option>
                    <option value="multimarca_ram">Multimarca - RAM (Todos)</option>
                    <option value="multimarca_ram_cotizacion">Multimarca - RAM (Cotización)</option>
                    <option value="multimarca_ram_prueba">Multimarca - RAM (Prueba de Manejo)</option>
                    <option value="multimarca_peugeot">Multimarca - PEUGEOT (Todos)</option>
                    <option value="multimarca_peugeot_cotizacion">Multimarca - PEUGEOT (Cotización)</option>
                    <option value="multimarca_peugeot_prueba">Multimarca - PEUGEOT (Prueba de Manejo)</option>
                    <option value="multimarca_jeep">Multimarca - Jeep (Todos)</option>
                    <option value="multimarca_jeep_cotizacion">Multimarca - Jeep (Cotización)</option>
                    <option value="multimarca_jeep_prueba">Multimarca - Jeep (Prueba de Manejo)</option>
                    <option value="multimarca_leapmotor_brand">Multimarca - Leapmotor (Todos)</option>
                    <option value="multimarca_leapmotor_brand_cotizacion">Multimarca - Leapmotor (Cotización)</option>
                    <option value="multimarca_leapmotor_brand_prueba">Multimarca - Leapmotor (Prueba de Manejo)</option>
                  </optgroup>
                </select>
              </div>

              {/* 3. Filtro por Agencia */}
              <div>
                <label className={`block text-[10px] font-mono tracking-wider uppercase font-extrabold mb-1.5 ${isDark ? 'text-white' : 'text-slate-600'}`}>Filtrar por Agencia:</label>
                <select
                  value={leadAgencyFilter}
                  onChange={(e) => setLeadAgencyFilter(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 text-xs outline-none transition font-semibold cursor-pointer ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white focus:border-blue-500/50' : 'bg-white border-slate-200 text-slate-800 focus:border-indigo-500/50'
                  }`}
                >
                  <option value="all">TODAS LAS AGENCIAS</option>
                  {uniqueLeadDistributors.map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>

              {/* 4. Filtro por Asesor */}
              <div>
                <label className={`block text-[10px] font-mono tracking-wider uppercase font-extrabold mb-1.5 ${isDark ? 'text-white' : 'text-slate-600'}`}>Filtrar por Asesor:</label>
                <select
                  value={leadAdvisorFilter}
                  onChange={(e) => setLeadAdvisorFilter(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 text-xs outline-none transition font-semibold cursor-pointer ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white focus:border-blue-500/50' : 'bg-white border-slate-200 text-slate-800 focus:border-indigo-500/50'
                  }`}
                >
                  <option value="all">TODOS LOS ASESORES</option>
                  <option value="unassigned">SIN ASIGNAR (FILA DE ESPERA)</option>
                  {advisors.map(adv => (
                    <option key={adv.id} value={adv.id}>{adv.name} {adv.active === false ? '(Inactivo)' : ''}</option>
                  ))}
                </select>
              </div>

              {/* 5. Filtro de Tiempo */}
              <div>
                <label className={`block text-[10px] font-mono tracking-wider uppercase font-extrabold mb-1.5 ${isDark ? 'text-white' : 'text-slate-600'}`}>Filtro Temporal:</label>
                <select
                  value={leadDateFilter}
                  onChange={(e) => setLeadDateFilter(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 text-xs outline-none transition font-semibold cursor-pointer ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white focus:border-blue-500/50' : 'bg-white border-slate-200 text-slate-800 focus:border-indigo-500/50'
                  }`}
                >
                  <option value="all">HISTÓRICO COMPLETO</option>
                  <option value="today">SÓLO HOY</option>
                  <option value="range">RANGO PERSONALIZADO</option>
                </select>
              </div>
            </div>

            {/* Rango de fechas condicional */}
            {leadDateFilter === 'range' && (
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border ${isDark ? 'bg-slate-950/20 border-slate-850' : 'bg-slate-50 border-slate-200'}`}>
                <div>
                  <label className={`block text-[10px] font-mono tracking-wider uppercase font-extrabold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Fecha Inicial:</label>
                  <input
                    type="date"
                    value={leadSearchStartDate}
                    onChange={(e) => setLeadSearchStartDate(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 text-xs outline-none transition font-semibold ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-[10px] font-mono tracking-wider uppercase font-extrabold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Fecha Final:</label>
                  <input
                    type="date"
                    value={leadSearchEndDate}
                    onChange={(e) => setLeadSearchEndDate(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 text-xs outline-none transition font-semibold ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Controles de Paginación Superior */}
            {totalLeadsCount > 0 && (
              <div className={`flex flex-col md:flex-row items-center justify-between gap-4 mb-6 p-4 rounded-2xl border transition-all ${
                isDark ? 'bg-slate-950/40 border-slate-850 text-slate-400' : 'bg-slate-50 border-slate-200 ' + mutedColor
              }`}>
                {/* Detalle de registros mostrados */}
                <span className="text-[11px] font-semibold leading-none">
                  Mostrando <strong className={isDark ? 'text-white' : 'text-slate-900'}>{totalLeadsCount === 0 ? 0 : startIndex + 1}</strong>{" "}
                  a <strong className={isDark ? 'text-white' : 'text-slate-900'}>{endIndex}</strong>{" "}
                  de <strong className={isDark ? 'text-white' : 'text-slate-900'}>{totalLeadsCount}</strong> prospectos.
                </span>

                {/* Selectores de tamaño de página y cambio de página */}
                <div className="flex flex-wrap items-center gap-4">
                  {/* Selector de tamaño de página */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono tracking-wider uppercase font-extrabold">Mostrar:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className={`text-[10px] py-1 px-2.5 rounded-lg border font-mono font-bold cursor-pointer transition ${
                        isDark 
                          ? 'bg-slate-900 border-slate-700 text-white focus:ring-1 focus:ring-emerald-500/50' 
                          : 'bg-white border-slate-200 text-slate-800 focus:ring-1 focus:ring-emerald-600/50'
                      }`}
                    >
                      <option value={20}>20 registros</option>
                      <option value={50}>50 registros</option>
                      <option value={100}>100 registros</option>
                    </select>
                  </div>

                  {/* Botones de navegación */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={activePage === 1}
                      className={`px-3 py-1.5 text-[10px] uppercase font-mono font-black rounded-lg border transition ${
                        activePage === 1
                          ? 'opacity-40 cursor-not-allowed border-transparent bg-transparent'
                          : isDark
                            ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 hover:border-slate-600 text-white cursor-pointer'
                            : 'bg-white border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-800 cursor-pointer'
                      }`}
                    >
                      ← Anterior
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => {
                          // Show first page, last page, current page, and pages immediately adjacent to current page
                          return p === 1 || p === totalPages || Math.abs(p - activePage) <= 1;
                        })
                        .map((page, index, array) => {
                          const elements = [];
                          // If there's a gap between the current page and the previous shown page, render ellipsis
                          if (index > 0 && page - array[index - 1] > 1) {
                            elements.push(
                              <span key={`top-dots-${page}`} className="px-1.5 text-xs select-none opacity-50 font-mono">
                                ...
                              </span>
                            );
                          }
                          elements.push(
                            <button
                              key={`top-page-${page}`}
                              onClick={() => setCurrentPage(page)}
                              className={`w-7 h-7 flex items-center justify-center text-[10px] font-mono font-bold rounded-lg border transition cursor-pointer ${
                                activePage === page
                                  ? (isDark 
                                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 font-extrabold')
                                  : (isDark
                                      ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-white'
                                      : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-800')
                              }`}
                            >
                              {page}
                            </button>
                          );
                          return elements;
                        })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={activePage === totalPages}
                      className={`px-3 py-1.5 text-[10px] uppercase font-mono font-black rounded-lg border transition ${
                        activePage === totalPages
                          ? 'opacity-40 cursor-not-allowed border-transparent bg-transparent'
                          : isDark
                            ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 hover:border-slate-600 text-white cursor-pointer'
                            : 'bg-white border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-800 cursor-pointer'
                      }`}
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tabla de Resultados de Leads con Encabezado Fijo y Desplazamiento */}
            <div className="w-full max-h-[600px] overflow-auto border rounded-xl">
              <div className={`transition-all ${isDark ? 'bg-slate-950/30 border-slate-800' : 'bg-white border-slate-200'}`}>
                <table className="w-full text-[11px] text-left border-collapse">
                <thead>
                  <tr className={`border-b font-mono uppercase text-[9px] tracking-wider font-black ${isDark ? 'border-slate-850' : 'border-slate-200'}`}>
                    <th className={`sticky top-0 z-10 p-3 shadow-sm ${isDark ? 'bg-slate-900 border-b border-slate-800 text-white' : 'bg-slate-100 border-b border-slate-200 text-slate-700'}`}>Prospecto / Contacto</th>
                    <th className={`sticky top-0 z-10 p-3 shadow-sm ${isDark ? 'bg-slate-900 border-b border-slate-800 text-white' : 'bg-slate-100 border-b border-slate-200 text-slate-700'}`}>Interés / Campaña</th>
                    <th className={`sticky top-0 z-10 p-3 shadow-sm ${isDark ? 'bg-slate-900 border-b border-slate-800 text-white' : 'bg-slate-100 border-b border-slate-200 text-slate-700'}`}>Agencia</th>
                    <th className={`sticky top-0 z-10 p-3 shadow-sm ${isDark ? 'bg-slate-900 border-b border-slate-800 text-white' : 'bg-slate-100 border-b border-slate-200 text-slate-700'}`}>Asesor Asignado</th>
                    <th className={`sticky top-0 z-10 p-3 shadow-sm ${isDark ? 'bg-slate-900 border-b border-slate-800 text-white' : 'bg-slate-100 border-b border-slate-200 text-slate-700'}`}>Fecha Registro</th>
                    <th className={`sticky top-0 z-10 p-3 shadow-sm ${isDark ? 'bg-slate-900 border-b border-slate-800 text-white' : 'bg-slate-100 border-b border-slate-200 text-slate-700'}`}>Fila de Coordinador (Hover)</th>
                    <th className={`sticky top-0 z-10 p-3 shadow-sm ${isDark ? 'bg-slate-900 border-b border-slate-800 text-white' : 'bg-slate-100 border-b border-slate-200 text-slate-700'}`}>Estado</th>
                    <th className={`sticky top-0 z-10 p-3 text-right shadow-sm ${isDark ? 'bg-slate-900 border-b border-slate-800 text-white' : 'bg-slate-100 border-b border-slate-200 text-slate-700'}`}>Acciones de Coordinación</th>
                  </tr>
                </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-slate-800/50' : 'divide-slate-100'}`}>
                    {filteredCoordinatorLeads.length === 0 ? (
                      <tr>
                        <td colSpan={8} className={`p-8 text-center font-bold italic text-xs ${mutedColor}`}>
                          No se encontraron prospectos con los filtros actuales...
                        </td>
                      </tr>
                    ) : (
                      paginatedCoordinatorLeads.map((lead) => {
                        let dateStr = 'Hoy';
                        if (lead.createdAt) {
                          const dateObj = lead.createdAt.toDate ? lead.createdAt.toDate() : new Date(lead.createdAt);
                          dateStr = dateObj.toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          });
                        }

                        return (
                          <tr key={lead.id} className={`transition-colors font-medium ${isDark ? 'text-slate-100 hover:bg-slate-850/30' : 'text-slate-800 hover:bg-slate-50'}`}>
                            <td className="p-3">
                              <div className={`font-black text-xs ${titleColor}`}>{lead.name} {lead.lastName || ''}</div>
                              <div className="font-mono text-[10px] text-sky-400 mt-0.5">{lead.phone}</div>
                              <div className="text-[10px] text-slate-450">{lead.email}</div>
                            </td>

                            <td className="p-3">
                              <div className="flex flex-col gap-1.5">
                                {/* Badge de Landing Origen */}
                                {(() => {
                                  let landingLabel = 'Multimarca';
                                  let brandLabel = lead.selectedBrand || 'Varios';
                                  let formTypeLabel = lead.requestType === 'cotizacion' ? 'Cotización' : lead.requestType === 'prueba' ? 'Prueba de Manejo' : 'Atención VIP';
                                  
                                  const landLower = (lead.landing || 'multimarca').toLowerCase();
                                  let badgeStyle = 'bg-indigo-500/10 text-indigo-450 border-indigo-500/20';
                                  
                                  if (landLower.includes('leap') || landLower.includes('motor')) {
                                    landingLabel = 'LeapMotor';
                                    brandLabel = 'Leapmotor';
                                    badgeStyle = 'bg-[#deff01]/10 text-lime-400 border-lime-500/35';
                                  } else if (landLower.includes('jeep') || landLower.includes('cherokee')) {
                                    landingLabel = 'Jeep Cherokee';
                                    brandLabel = 'Jeep';
                                    badgeStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                                  }

                                  return (
                                    <div className="space-y-1">
                                      <div className={`font-mono font-black border text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full inline-flex items-center gap-1.5 ${badgeStyle}`}>
                                        <span className="w-1 h-1 rounded-full bg-current" />
                                        {landingLabel}: {formTypeLabel}
                                      </div>
                                      <div className={`text-[10px] font-semibold flex items-center gap-1 flex-wrap ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                        <span>Marca: <strong className="font-black font-mono text-[9px] uppercase text-cyan-400">{brandLabel}</strong></span>
                                        {lead.modelOfInterest && (
                                          <>
                                            <span className="text-slate-500">•</span>
                                            <span>Modelo: <strong className="font-bold">{lead.modelOfInterest}</strong></span>
                                          </>
                                        )}
                                      </div>
                                      {(lead.utm_source || lead.utm_medium || lead.utm_campaign) && (
                                        <div className="flex flex-wrap gap-1 mt-1 font-mono text-[8px] max-w-xs">
                                          {lead.utm_source && (
                                            <span className="bg-cyan-500/10 text-cyan-450 border border-cyan-500/20 px-1 py-0.2 rounded" title={`UTM Source: ${lead.utm_source}`}>
                                              src: {lead.utm_source}
                                            </span>
                                          )}
                                          {lead.utm_medium && (
                                            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1 py-0.2 rounded" title={`UTM Medium: ${lead.utm_medium}`}>
                                              med: {lead.utm_medium}
                                            </span>
                                          )}
                                          {lead.utm_campaign && (
                                            <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1 py-0.2 rounded" title={`UTM Campaign: ${lead.utm_campaign}`}>
                                              cam: {lead.utm_campaign}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>
                            </td>

                            <td className="p-3">
                              <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                {lead.distributor || 'Distribuidor Digital'}
                              </div>
                              {lead.state && (
                                <div className="text-[9px] font-mono mt-0.5 text-slate-500 uppercase">{lead.state}</div>
                              )}
                            </td>

                            <td className="p-3">
                              {(lead.requestType === 'cotizacion' || (lead.requestType === 'prueba' && lead.landing !== 'leapmotor')) ? (
                                <span className="font-bold font-mono text-[10px] text-emerald-400 uppercase flex items-center gap-1">
                                  🧾 {lead.requestType === 'cotizacion' ? 'Solo Cotización (CRM)' : 'Prueba de Manejo (CRM)'}
                                </span>
                              ) : lead.advisorId ? (
                                <div className="flex flex-col">
                                  <span className={`font-bold ${titleColor}`}>👤 {lead.advisorName || 'Desconocido'}</span>
                                  <span className="font-mono text-[9px] text-slate-400">ID: {lead.advisorId}</span>
                                </div>
                              ) : (
                                <span className="font-bold font-mono text-[10px] text-amber-500 uppercase flex items-center gap-1 animate-pulse">
                                  ⚠️ Sin Asesor
                                </span>
                              )}
                            </td>

                            <td className="p-3 font-mono text-[10px] text-slate-400">
                              {dateStr}
                            </td>

                            <td className="p-3 relative group">
                              {editingNotesLeadId === lead.id ? (
                                <div className="flex gap-1.5 items-center">
                                  <input
                                    type="text"
                                    value={editingNotesText}
                                    onChange={(e) => setEditingNotesText(e.target.value)}
                                    className={`px-2 py-1 text-xs rounded-lg border ${inputStyle}`}
                                    placeholder="Comentario..."
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleSaveCoordinatorNotes(lead.id, editingNotesText);
                                      }
                                    }}
                                  />
                                  <button
                                    onClick={() => handleSaveCoordinatorNotes(lead.id, editingNotesText)}
                                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-2 py-1 rounded-lg text-xs font-black cursor-pointer shadow"
                                  >
                                    ✓
                                  </button>
                                  <button
                                    onClick={() => setEditingNotesLeadId(null)}
                                    className="bg-slate-600 hover:bg-slate-400 text-white px-2 py-1 rounded-lg text-xs font-black cursor-pointer shadow"
                                  >
                                    X
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <div className="max-w-[125px] overflow-hidden truncate">
                                    <span className={`italic text-[10px] font-semibold ${lead.coordinatorNotes ? 'text-cyan-400 font-bold border-b border-dashed border-cyan-400' : 'text-slate-500'}`}>
                                      {lead.coordinatorNotes || '(Sin comentarios)'}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setEditingNotesLeadId(lead.id);
                                      setEditingNotesText(lead.coordinatorNotes || '');
                                    }}
                                    className="text-blue-400 hover:text-blue-300 transition cursor-pointer"
                                    title="Editar comentario"
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </button>

                                  {lead.coordinatorNotes && (
                                    <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl shadow-2xl hidden group-hover:block z-50 pointer-events-none break-words">
                                      <div className="text-blue-400 font-bold mb-1 border-b border-slate-700/60 pb-1 flex items-center gap-1 font-mono uppercase tracking-wider text-[10px]">
                                        <CheckCircle className="w-3.5 h-3.5" /> Notas de Coordinador:
                                      </div>
                                      <span className="font-sans font-medium text-slate-200">{lead.coordinatorNotes}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>

                            <td className="p-3">
                              <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase font-mono border ${
                                (lead.requestType === 'cotizacion' || (lead.requestType === 'prueba' && lead.landing !== 'leapmotor')) ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                                lead.status === LeadStatus.WAITING ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                                lead.status === LeadStatus.ATTENDING ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30 font-extrabold' :
                                lead.status === LeadStatus.ATTENDED ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-bold' :
                                'bg-slate-500/15 text-slate-400 border-slate-500/30'
                              }`}>
                                {(lead.requestType === 'cotizacion' || (lead.requestType === 'prueba' && lead.landing !== 'leapmotor')) ? (lead.requestType === 'cotizacion' ? 'Cotización' : 'Prueba de Manejo') :
                                 lead.status === LeadStatus.WAITING ? 'Espera' :
                                 lead.status === LeadStatus.ATTENDING ? 'Atención' :
                                 lead.status === LeadStatus.ATTENDED ? 'Atendido / OK' :
                                 'Cancelado'}
                              </span>

                              {lead.crmSuccess !== undefined && (
                                <div className="mt-2 text-[9px] font-mono leading-relaxed space-y-1">
                                  {lead.crmSuccess ? (
                                    <div className="p-1 px-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                      <div className="font-extrabold flex items-center gap-1">🚀 CRM ENVIADO ({lead.crmResponseCode})</div>
                                      {lead.crmSolicitudId && <div className="text-[8px] opacity-90 text-slate-400">ID: {lead.crmSolicitudId}</div>}
                                      {lead.crmShiftDigitalId && <div className="text-[8px] opacity-95 text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap block" title={lead.crmShiftDigitalId}>ShiftD: {lead.crmShiftDigitalId}</div>}
                                    </div>
                                  ) : (
                                    <div className="p-1 px-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400" title={lead.crmError || 'Error de conexión'}>
                                      <div className="font-extrabold flex items-center gap-1">❌ CRM ERROR ({lead.crmResponseCode || 'NET_ERR'})</div>
                                      {lead.crmError && <div className="text-[8px] opacity-90 text-slate-450 line-clamp-2 leading-tight mt-0.5">{lead.crmError}</div>}
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>

                            <td className="p-3 text-right">
                              {(lead.requestType === 'cotizacion' || (lead.requestType === 'prueba' && lead.landing !== 'leapmotor')) ? (
                                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold uppercase rounded-xl inline-block">
                                  ✓ Almacenado para CRM
                                </span>
                              ) : lead.status === LeadStatus.WAITING && (
                                <div className="flex gap-2 justify-end items-center">
                                  <select
                                    value={lead.advisorId || ""}
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        handleReassignLead(lead.id, e.target.value);
                                      }
                                    }}
                                    className={`px-2 py-1 text-[10px] uppercase font-mono font-bold rounded-lg border cursor-pointer ${inputStyle}`}
                                  >
                                    <option value="">Asignar a...</option>
                                    {advisors.map(adv => (
                                      <option key={adv.id} value={adv.id}>{adv.name}</option>
                                    ))}
                                  </select>
                                </div>
                              )}

                              {lead.status === LeadStatus.ATTENDING && (
                                <div className="flex flex-col sm:flex-row gap-2 justify-end items-center">
                                  <div className="flex gap-1 items-center">
                                    <span className="text-[9px] uppercase font-bold text-slate-400">Reasignar:</span>
                                    <select
                                      value={lead.advisorId || ""}
                                      onChange={(e) => {
                                        if (e.target.value) {
                                          handleReassignLead(lead.id, e.target.value);
                                        }
                                      }}
                                      className={`px-2 py-1 text-[10px] uppercase font-mono font-bold rounded-lg border cursor-pointer ${inputStyle}`}
                                    >
                                      <option value="">Cambiar asesor...</option>
                                      {advisors.map(adv => (
                                        <option key={adv.id} value={adv.id}>{adv.name}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="flex gap-1.5 items-center">
                                    <button
                                      onClick={() => handleCloseLeadInAttending(lead.id, 'ok')}
                                      className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 hover:text-emerald-300 text-[9px] uppercase border border-emerald-500/25 px-2.5 py-1 rounded-lg font-black transition cursor-pointer"
                                      title="Cerrar prospecto como atendido con éxito / OK"
                                    >
                                      Cerrar OK
                                    </button>
                                    <button
                                      onClick={() => handleCloseLeadInAttending(lead.id, 'no_asistio')}
                                      className="bg-red-500/15 hover:bg-red-500/25 text-red-400 hover:text-red-350 text-[9px] uppercase border border-red-500/20 px-2.5 py-1 rounded-lg font-black transition cursor-pointer"
                                      title="Cerrar prospecto indicando que no asistió"
                                    >
                                      No Asistió
                                    </button>
                                  </div>
                                </div>
                              )}

                              {(lead.status === LeadStatus.ATTENDED || lead.status === LeadStatus.LOST) && (
                                <span className="text-[10px] font-bold font-mono text-slate-500 uppercase italic">
                                  Cerrado/Inalterable
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Controles de Paginación */}
            {totalLeadsCount > 0 && (
              <div className={`flex flex-col md:flex-row items-center justify-between gap-4 mt-6 p-4 rounded-2xl border transition-all ${
                isDark ? 'bg-slate-950/40 border-slate-850 text-slate-400' : 'bg-slate-50 border-slate-200 ' + mutedColor
              }`}>
                {/* Detalle de registros mostrados */}
                <span className="text-[11px] font-semibold leading-none">
                  Mostrando <strong className={isDark ? 'text-white' : 'text-slate-900'}>{totalLeadsCount === 0 ? 0 : startIndex + 1}</strong>{" "}
                  a <strong className={isDark ? 'text-white' : 'text-slate-900'}>{endIndex}</strong>{" "}
                  de <strong className={isDark ? 'text-white' : 'text-slate-900'}>{totalLeadsCount}</strong> prospectos.
                </span>

                {/* Selectores de tamaño de página y cambio de página */}
                <div className="flex flex-wrap items-center gap-4">
                  {/* Selector de tamaño de página */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono tracking-wider uppercase font-extrabold">Mostrar:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className={`text-[10px] py-1 px-2.5 rounded-lg border font-mono font-bold cursor-pointer transition ${
                        isDark 
                          ? 'bg-slate-900 border-slate-700 text-white focus:ring-1 focus:ring-emerald-500/50' 
                          : 'bg-white border-slate-200 text-slate-800 focus:ring-1 focus:ring-emerald-600/50'
                      }`}
                    >
                      <option value={20}>20 registros</option>
                      <option value={50}>50 registros</option>
                      <option value={100}>100 registros</option>
                    </select>
                  </div>

                  {/* Botones de navegación */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={activePage === 1}
                      className={`px-3 py-1.5 text-[10px] uppercase font-mono font-black rounded-lg border transition ${
                        activePage === 1
                          ? 'opacity-40 cursor-not-allowed border-transparent bg-transparent'
                          : isDark
                            ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 hover:border-slate-600 text-white cursor-pointer'
                            : 'bg-white border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-800 cursor-pointer'
                      }`}
                    >
                      ← Anterior
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => {
                          // Show first page, last page, current page, and pages immediately adjacent to current page
                          return p === 1 || p === totalPages || Math.abs(p - activePage) <= 1;
                        })
                        .map((page, index, array) => {
                          const elements = [];
                          // If there's a gap between the current page and the previous shown page, render ellipsis
                          if (index > 0 && page - array[index - 1] > 1) {
                            elements.push(
                              <span key={`dots-${page}`} className="px-1.5 text-xs select-none opacity-50 font-mono">
                                ...
                              </span>
                            );
                          }
                          elements.push(
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`w-7 h-7 flex items-center justify-center text-[10px] font-mono font-bold rounded-lg border transition cursor-pointer ${
                                activePage === page
                                  ? (isDark 
                                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 font-extrabold')
                                  : (isDark
                                      ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-white'
                                      : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-800')
                              }`}
                            >
                              {page}
                            </button>
                          );
                          return elements;
                        })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={activePage === totalPages}
                      className={`px-3 py-1.5 text-[10px] uppercase font-mono font-black rounded-lg border transition ${
                        activePage === totalPages
                          ? 'opacity-40 cursor-not-allowed border-transparent bg-transparent'
                          : isDark
                            ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 hover:border-slate-600 text-white cursor-pointer'
                            : 'bg-white border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-800 cursor-pointer'
                      }`}
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Administración de Asesores */}
        {adminTab === 'asesores' && (
          <div className="space-y-6">
            <div>
              <h3 className={`text-sm font-black tracking-widest uppercase font-mono mb-1.5 flex items-center gap-2 ${titleColor}`}>
                <Users className="w-4 h-4 text-emerald-400" /> ASESORES CONFIGURADOS
              </h3>
              <p className={`text-xs font-semibold mb-6 leading-relaxed ${subColor}`}>
                Agrega nuevos asesores comerciales, modifique sus contraseñas para permitirles iniciar sesión en su consola, y desactívelos temporalmente para que dejen de recibir asignación automática de nuevos leads clientelares en tiempo real de acuerdo a la regla del menor volumen de carga.
              </p>
            </div>

            <div className="flex flex-col gap-8">
              {/* Aresores Create / Edit Form */}
              <div className={`p-5 rounded-2xl border transition-all ${isDark ? 'bg-slate-950/50 border-slate-800/80' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
                <h4 className={`text-xs font-bold uppercase tracking-wider font-mono mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {editingAdvisorId ? 'Editar Asesor' : 'Registrar Nuevo Asesor'}
                </h4>
                <form onSubmit={handleAddAdvisorSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className={`block text-[11px] font-extrabold font-mono uppercase mb-1.5 ${isDark ? 'text-white' : 'text-slate-700'}`}>Nombre Completo:</label>
                      <input
                        type="text"
                        placeholder="Ej: Daniel Sánchez"
                        value={newAdvName}
                        onChange={(e) => setNewAdvName(e.target.value)}
                        className={`w-full border focus:border-emerald-500/55 rounded-xl px-3 py-2 text-xs outline-none transition font-semibold ${
                          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-[11px] font-extrabold font-mono uppercase mb-1.5 ${isDark ? 'text-white' : 'text-slate-700'}`}>Correo Electrónico (Login ID):</label>
                      <input
                        type="email"
                        placeholder="Ej: daniel@leapmotor.com"
                        value={newAdvEmail}
                        onChange={(e) => setNewAdvEmail(e.target.value)}
                        className={`w-full border focus:border-emerald-500/55 rounded-xl px-3 py-2 text-xs outline-none transition font-semibold ${
                          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-[11px] font-extrabold font-mono uppercase mb-1.5 ${isDark ? 'text-white' : 'text-slate-705'}`}>Contraseña de Acceso:</label>
                      <input
                        type="text"
                        placeholder="Ej: clave123"
                        value={newAdvPassword}
                        onChange={(e) => setNewAdvPassword(e.target.value)}
                        className={`w-full border focus:border-emerald-500/55 rounded-xl px-3 py-2 text-xs outline-none transition font-semibold ${
                          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-[11px] font-extrabold font-mono uppercase mb-1.5 ${isDark ? 'text-white' : 'text-slate-700'}`}>Distribuidor Asociado (Todas las Marcas):</label>
                      <select
                        value={newAdvDistributor}
                        onChange={(e) => setNewAdvDistributor(e.target.value)}
                        className={`w-full border focus:border-emerald-500/55 rounded-xl px-3 py-2 text-xs outline-none transition font-semibold ${
                          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      >
                        {distributors.length === 0 ? (
                          <option value="">Seeding/Cargando distribuidores...</option>
                        ) : (
                          distributors.map((dist, idx) => (
                            <option key={`${dist.id || idx}-${dist.marca || ''}-${idx}`} value={dist.name}>
                              [{dist.marca || 'LEAPMOTOR'}] {dist.name} ({dist.estado || 'N/A'})
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>

                  {mgmtError && <p className="text-[11px] text-red-500 font-bold">⚠️ {mgmtError}</p>}
                  {mgmtSuccess && <p className="text-[11px] text-emerald-600 font-bold">✓ {mgmtSuccess}</p>}

                  <div className="flex flex-col sm:flex-row gap-3 max-w-md pt-1">
                    <button
                      type="submit"
                      className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2.5 rounded-xl text-xs transition uppercase tracking-widest cursor-pointer text-center"
                    >
                      {editingAdvisorId ? '✓ Guardar Cambios' : '+ Registrar en Base de Datos'}
                    </button>
                    {editingAdvisorId && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="flex-1 bg-slate-550 hover:bg-slate-400 text-white font-black py-2.5 rounded-xl text-xs transition uppercase tracking-widest cursor-pointer text-center bg-slate-600"
                      >
                        X Cancelar Edición
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Advisors List Table */}
              <div className="w-full overflow-x-auto">
                <h4 className={`text-xs font-bold uppercase tracking-wider font-mono mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Asesores configurados ({advisors.length})</h4>
                <div className={`border rounded-xl overflow-hidden transition-all ${isDark ? 'bg-slate-950/30 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <table className="w-full text-[11px] text-left border-collapse">
                    <thead>
                      <tr className={`border-b font-mono uppercase text-[9px] tracking-wider font-black ${isDark ? 'bg-slate-950/80 border-slate-700 text-white' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
                        <th className="p-3">Asesor</th>
                        <th className="p-3">Correo</th>
                        <th className="p-3 shadow-none">Contraseña</th>
                        <th className="p-3 text-center">Carga de Leads</th>
                        <th className="p-3 text-center">Auto-Asignación</th>
                        <th className="p-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-slate-800/50' : 'divide-slate-100'}`}>
                      {advisors.length === 0 ? (
                        <tr>
                          <td colSpan={6} className={`p-6 text-center font-bold italic border border-dashed ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                            Cargando catálogo de asesores de ventas corporativos...
                          </td>
                        </tr>
                      ) : (
                        advisors.map((adv) => {
                          const advWaitingCount = leads.filter(l => l.advisorId === adv.id && l.status === LeadStatus.WAITING).length;
                          const advAttendingCount = leads.filter(l => l.advisorId === adv.id && l.status === LeadStatus.ATTENDING).length;

                          return (
                            <tr key={adv.id} className={`transition-colors font-medium ${isDark ? 'text-slate-100 hover:bg-slate-800/25' : 'text-slate-800 hover:bg-slate-50'}`}>
                              <td className={`p-3 font-bold ${titleColor}`}>
                                <div className="flex items-center gap-1.5">
                                  <span className={`w-2 h-2 rounded-full ${adv.active !== false ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                  {adv.name}
                                </div>
                                {adv.distributor && (
                                  <div className="text-[10px] font-mono mt-1">
                                    <span className={`font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>🏢 {adv.distributor}</span>
                                  </div>
                                )}
                              </td>
                              <td className={`p-3 font-mono font-semibold ${isDark ? 'text-white' : 'text-slate-700'}`}>{adv.email}</td>
                              <td className="p-3 font-mono font-bold cursor-help relative">
                                <div className="group/pwd relative inline-block whitespace-nowrap">
                                  <span className={`group-hover/pwd:hidden tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>••••••••</span>
                                  <span className={`hidden group-hover/pwd:inline ${isDark ? 'text-white' : 'text-slate-900'}`}>{adv.password}</span>
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                <span className={`inline-block px-2.5 py-1 rounded text-[9px] font-black uppercase font-mono transition border ${
                                  (advWaitingCount > 0 || advAttendingCount > 0)
                                    ? isDark 
                                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/35' 
                                      : 'bg-amber-50 text-amber-700 border-amber-200'
                                    : isDark 
                                      ? 'bg-slate-900/50 text-slate-500 border-slate-800' 
                                      : 'bg-slate-50 border-slate-200 text-slate-400'
                                }`}>
                                  {advWaitingCount} espera / {advAttendingCount} atención
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => toggleAdvisorActive(adv.id, adv.active !== false)}
                                  className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase font-mono transition border cursor-pointer ${
                                    adv.active !== false 
                                      ? isDark ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                      : isDark ? 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                  }`}
                                >
                                  {adv.active !== false ? 'Habilitado' : 'Suspendido'}
                                </button>
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex gap-2 justify-end">
                                  <button
                                    type="button"
                                    onClick={() => handleEditAdvisorClick(adv)}
                                    className={`text-[9px] font-bold border rounded px-2.5 py-1 transition cursor-pointer flex items-center justify-center gap-1 ${
                                      isDark ? 'text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30' : 'text-blue-600 hover:bg-blue-50 border-blue-200'
                                    }`}
                                    title="Editar datos del asesor"
                                  >
                                    <Pencil className="w-2.5 h-2.5" />
                                    Editar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteAdvisor(adv.id)}
                                    className={`text-[9px] font-bold border rounded px-2.5 py-1 transition cursor-pointer ${
                                      isDark ? 'text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border-red-500/30' : 'text-red-600 hover:bg-red-50 border-red-200'
                                    }`}
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                <p className={`text-[11px] mt-2.5 font-mono font-semibold ${subColor}`}>
                  * Nota: Al suspender un asesor, éste conservará acceso para atender sus leads vigentes, pero no recibirá prospectos adicionales desde el formulario de la Landing.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Sincronización de Distribuidores */}
        {adminTab === 'distribuidores' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className={`text-sm font-black tracking-widest uppercase font-mono mb-1.5 flex items-center gap-2 ${titleColor}`}>
                  <Database className="w-4 h-4 text-purple-400" /> PANEL DE CONFIGURACIÓN Y SINCRONIZACIÓN DE DISTRIBUIDORES
                </h3>
                <p className={`text-xs font-semibold leading-relaxed ${subColor}`}>
                  Administre el catálogo completo de distribuidores y agencias de ventas de las marcas del grupo Stellantis de manera ágil.
                </p>
              </div>
              
              {/* Database Indicator Badge */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-[11px] font-bold uppercase tracking-wider bg-green-500/10 text-green-500 border-green-500/25`}>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Base de Datos Activa: INDEPENDIENTE ({activeDbId.toUpperCase()})
              </div>
            </div>

            {/* Diagnostic Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Card 1: Database Status */}
              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-900 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                    <Database className="w-5 h-5" />
                  </div>
                  <h4 className={`text-xs font-bold uppercase tracking-wider font-mono ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Firestore CRM db</h4>
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-mono font-black">PRODUCCIÓN (MAIN)</p>
                  <p className={`text-[11px] font-medium leading-relaxed ${subColor}`}>
                    Base de datos principal de Firestore conectada directamente para desarrollo y producción.
                  </p>
                </div>
              </div>

              {/* Card 2: Catalog Status */}
              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-900 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <h4 className={`text-xs font-bold uppercase tracking-wider font-mono ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Estado del Catálogo</h4>
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-mono font-black">{distributors.length} Agencias</p>
                  <p className={`text-[11px] font-medium leading-relaxed ${subColor}`}>
                    {distributors.length > 500 
                      ? 'Catálogo Stellantis oficial completo cargado en memoria de consola.' 
                      : 'Catálogo de agencias cargado de forma parcial o modificado.'}
                  </p>
                </div>
              </div>

              {/* Card 3: Form Safety Warning */}
              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-50 text-yellow-600'}`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h4 className={`text-xs font-bold uppercase tracking-wider font-mono ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Requisitos de Estructura</h4>
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-mono font-black">Estructuras Idénticas</p>
                  <p className={`text-[11px] font-medium leading-relaxed ${subColor}`}>
                    Ambas bases de datos (main y aistudio) mantienen idéntica estructura de colecciones de leads, asesores y distribuidores.
                  </p>
                </div>
              </div>
            </div>

            {/* Sync Tools Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Option A: Manual CSV Upload */}
              <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-950/20 border-slate-800/60' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h4 className={`text-xs font-bold uppercase tracking-wider font-mono mb-2 flex items-center gap-2 ${titleColor}`}>
                  <UploadCloud className="w-4 h-4 text-purple-400" /> Método A: Cargar archivo CSV
                </h4>
                <p className={`text-xs font-semibold leading-relaxed mb-4 ${subColor}`}>
                  Cargue un archivo CSV delimitado por comas para reescribir por completo el catálogo de distribuidores en "{activeDbId}".
                </p>
                
                <div className="space-y-4">
                  {/* CSV Template Guidelines */}
                  <div className={`p-3.5 rounded-xl border text-[10px] space-y-1.5 ${isDark ? 'bg-slate-900/60 border-slate-850 text-slate-350' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                    <p className="font-bold underline uppercase tracking-wider text-purple-400">Columnas requeridas para el CSV:</p>
                    <p className="font-mono bg-black/30 p-1.5 rounded text-center text-emerald-450 tracking-wider">marca, corpKey, id, state, name, url</p>
                    <p className="font-sans leading-relaxed">
                      * El sistema identificará automáticamente las columnas relevantes para Marca (brand/marca), Clave corporativa, Clave de Distribuidor (disId/id), Estado (state/estado), Nombre de Distribuidor (name/nombre) y Sitio Web (url/web). Se recomienda usar formato UTF-8.
                    </p>
                  </div>

                  {/* Drag and Drop Zone */}
                  <div className={`border-2 border-dashed rounded-xl p-6 text-center transition flex flex-col items-center justify-center gap-2 ${
                    csvFile 
                      ? 'border-purple-500 bg-purple-500/5' 
                      : isDark ? 'border-slate-800 hover:border-slate-700 bg-slate-950/40' : 'border-slate-300 hover:border-slate-400 bg-slate-50'
                  }`}>
                    <FileSpreadsheet className={`w-8 h-8 ${csvFile ? 'text-purple-500 animate-bounce' : 'text-slate-405'}`} />
                    
                    {csvFile ? (
                      <div className="space-y-1 max-w-full">
                        <p className={`text-xs font-black truncate max-w-[280px] ${titleColor}`}>{csvFile.name}</p>
                        <p className="text-[10px] font-mono font-extrabold text-slate-500">{(csvFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className={`text-xs font-bold ${titleColor}`}>Arrastre o seleccione su archivo CSV</p>
                        <p className="text-[10px] text-slate-500 font-semibold">Formato delimitado por comas (.csv)</p>
                      </div>
                    )}

                    <input 
                      type="file" 
                      accept=".csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setCsvFile(file);
                        setCsvMessage(null);
                      }}
                      className="hidden" 
                      id="csv-file-selector"
                      disabled={csvUploading}
                    />
                    
                    <label 
                      htmlFor="csv-file-selector"
                      className={`mt-2 inline-block px-4 py-1.5 rounded-lg text-[11px] font-black uppercase font-mono tracking-wider transition cursor-pointer ${
                        csvUploading
                          ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                          : 'bg-purple-500 hover:bg-purple-400 text-slate-950'
                      }`}
                    >
                      {csvFile ? 'Cambiar Archivo' : 'Seleccionar Archivo'}
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleUploadCSV(csvFile)}
                      disabled={!csvFile || csvUploading}
                      className={`w-full py-2.5 rounded-xl text-xs font-black uppercase font-mono tracking-widest transition flex items-center justify-center gap-2 cursor-pointer ${
                        !csvFile || csvUploading
                          ? 'bg-slate-805 text-slate-500 border border-slate-800'
                          : 'bg-purple-500 hover:bg-purple-400 text-slate-950 font-black shadow-lg shadow-purple-500/10'
                      }`}
                    >
                      {csvUploading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Sincronizando...
                        </>
                      ) : (
                        '+ Limpiar BD e Importar CSV'
                      )}
                    </button>
                    {csvFile && !csvUploading && (
                      <button
                        type="button"
                        onClick={() => {
                          setCsvFile(null);
                          setCsvMessage(null);
                        }}
                        className={`px-3 py-2.5 rounded-xl border text-xs font-extrabold font-mono uppercase transition cursor-pointer ${
                          isDark ? 'border-slate-800 text-red-400 hover:bg-red-500/10' : 'border-slate-200 text-red-600 hover:bg-red-50'
                        }`}
                        title="Remover archivo seleccionado"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Option B: Official Backup Catalog Reset */}
              <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-950/20 border-slate-800/60' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h4 className={`text-xs font-bold uppercase tracking-wider font-mono mb-2 flex items-center gap-2 ${titleColor}`}>
                  <RefreshCw className="w-4 h-4 text-purple-400" /> Método B: Restablecer Catálogo Oficial del Sistema
                </h4>
                <p className={`text-xs font-semibold leading-relaxed mb-4 ${subColor}`}>
                  ¿No dispone de un catálogo personalizado? Cargue de inmediato la base de datos Stellantis oficial completa del sistema. No requiere preparar archivos.
                </p>
                
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl border text-[11px] leading-relaxed ${isDark ? 'bg-slate-900/60 border-slate-850 text-slate-350' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                    <p className="font-bold uppercase tracking-wider mb-1 text-purple-400">Catálogo Oficial Ofrecido:</p>
                    <p className="mb-2">
                      Inicializa de forma automática <strong>{ALL_DEALERS.length} agencias de venta oficiales</strong> del consorcio: JEEP, RAM, DODGE, FIAT, PEUGEOT, LEAPMOTOR y ALFA ROMEO.
                    </p>
                    <p className="text-amber-500 font-bold font-mono text-[10px]">
                      ⚠️ Atención: Al restablecer, se destruirá cualquier registro de agencias personalizadas registradas previamente en la colección de la base "{activeDbId}".
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleRestoreSystemCatalog}
                    disabled={csvUploading}
                    className={`w-full py-3 rounded-xl text-xs font-black uppercase font-mono tracking-widest transition flex items-center justify-center gap-2 cursor-pointer ${
                      csvUploading
                        ? 'bg-slate-800/50 text-slate-500 border border-slate-800'
                        : 'bg-slate-900 hover:bg-slate-850 text-purple-450 hover:text-purple-300 border border-purple-500/30'
                    }`}
                  >
                    {csvUploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Sincronizando...
                      </>
                    ) : (
                      '⚡ Sincronizar Catálogo Stellantis Oficial (' + ALL_DEALERS.length + ' Registros)'
                    )}
                  </button>
                </div>
              </div>

              {/* Option C: Complete Firestore Database Backup & Direct Download */}
              <div className={`p-6 rounded-2xl border lg:col-span-2 ${isDark ? 'bg-slate-950/20 border-slate-800/60' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h4 className={`text-xs font-bold uppercase tracking-wider font-mono mb-2 flex items-center gap-2 ${titleColor}`}>
                  <Database className="w-4 h-4 text-emerald-400" /> Método C: Respaldar Base de Datos Completa (Guardar en Equipo)
                </h4>
                <p className={`text-xs font-semibold leading-relaxed mb-4 ${subColor}`}>
                  Descargue un respaldo completo e instantáneo en formato JSON con la información en tiempo real de leads, asesores y distribuidores. Podrá guardarlo inmediatamente en su computadora local.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 rounded-xl border border-dashed border-emerald-550/30 bg-emerald-500/5">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-emerald-550 uppercase tracking-wide">Fichero del Respaldo:</p>
                    <p className={`text-[11px] font-medium leading-relaxed ${subColor}`}>
                      Genera <span className="font-mono text-emerald-500 font-bold">firestore_backup_export.json</span> con todos los registros activos.
                    </p>
                  </div>
                  
                  <a
                    href="/api/db/export"
                    download="firestore_backup_export.json"
                    className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white hover:text-white rounded-xl text-xs font-black uppercase font-mono tracking-widest transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/10"
                  >
                    <Database className="w-4 h-4" /> Descargar Respaldo JSON en mi Equipo
                  </a>
                </div>
              </div>

              {/* Option D: Live CRM Lead Synchronizer Tool (Sync-Leads) */}
              <div className={`p-6 rounded-2xl border lg:col-span-2 ${isDark ? 'bg-slate-950/20 border-slate-800/60' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h4 className={`text-xs font-bold uppercase tracking-wider font-mono mb-2 flex items-center gap-2 ${titleColor}`}>
                  <Zap className="w-4 h-4 text-blue-400 animate-pulse" /> Método D: Sincronizador de Leads a CRM en Vivo (Ejecución de Cron)
                </h4>
                <p className={`text-xs font-semibold leading-relaxed mb-4 ${subColor}`}>
                  El sistema ejecuta de forma automática una rutina todos los días a la 1:00 AM para sincronizar todos los prospectos pendientes con los CRM de Stellantis (Netcar/RegistraCOT) y Leapmotor. Puede activar e inspeccionar este proceso de sincronización manualmente en tiempo real desde este panel.
                </p>

                <div className={`p-4 rounded-xl border text-[11px] leading-relaxed mb-4 ${isDark ? 'bg-slate-900/40 border-slate-850 text-slate-350' : 'bg-slate-50 border-slate-250 text-slate-750'}`}>
                  <p className="font-bold uppercase tracking-wider text-blue-400 mb-1">🛠️ Información de Arquitectura del Servidor:</p>
                  <p className="mb-2">
                    Esta ruta es procesada programáticamente en el servidor de Node.js mediante Express en el archivo <span className="font-mono text-blue-450 font-bold">/server.ts</span>. Al ser una Single Page Application con un custom backend de Express, todas las peticiones con prefijo <span className="font-mono text-slate-400">/api/</span> se capturan programáticamente en el archivo del servidor en lugar de requerir una carpeta física de ficheros como en otros frameworks.
                  </p>
                  <p className="font-bold text-emerald-500 font-mono text-[10.5px]">
                    ✓ Conexión Segura: El proceso está programado para conectarse exclusivamente a la base de datos de Firestore llamada "default" para mantener coherencia en los registros.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 rounded-xl border border-dashed border-blue-550/30 bg-blue-500/5">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-blue-500 uppercase tracking-wide">Acción de sincronización:</p>
                      <p className={`text-[11px] font-medium leading-relaxed ${subColor}`}>
                        Iniciará una petición interna HTTP POST para invocar <span className="font-mono text-blue-400 font-bold">/api/cron/sync-leads</span> y reportará el avance de cada prospecto.
                      </p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleTriggerCrmSync}
                      disabled={syncCrmLoading}
                      className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-850 disabled:text-slate-500 text-white rounded-xl text-xs font-black uppercase font-mono tracking-widest transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-650/10"
                    >
                      {syncCrmLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Sincronizando Leads...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          Ejecutar Sincronización en Vivo
                        </>
                      )}
                    </button>
                  </div>

                  {/* Interactivo Micro Console Output Log de Sincronización */}
                  {syncCrmConsoleLogs.length > 0 && (
                    <div className="mt-2 space-y-2">
                      <p className="text-[10px] uppercase font-mono font-black tracking-wider text-slate-500">Consola de Respuestas de la Sincronización:</p>
                      <div className="bg-black/90 border border-slate-900 rounded-xl p-4 font-mono text-[10px] text-slate-300 max-h-[220px] overflow-y-auto space-y-1.5 scrollbar-thin">
                        {syncCrmConsoleLogs.map((logLine, idx) => {
                          let colorClass = 'text-slate-300';
                          if (logLine.includes('[ERROR]')) colorClass = 'text-red-400 font-bold';
                          if (logLine.includes('[EXCEPTION]')) colorClass = 'text-pink-500 font-bold';
                          if (logLine.includes('[Resultado]')) colorClass = 'text-blue-400';
                          if (logLine.includes('[Sincronizados]')) colorClass = 'text-emerald-400';
                          if (logLine.includes('Respuesta exitosa')) colorClass = 'text-emerald-350 font-bold';
                          if (logLine.includes('[INFO]')) colorClass = 'text-yellow-450 font-bold';
                          
                          return (
                            <p key={idx} className={colorClass}>
                              {logLine}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Active Operations Log Console (Monospace box) */}
            {(csvMessage || csvDetails.length > 0) && (
              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-850' : 'bg-slate-900 border-slate-950 shadow-inner'}`}>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-black tracking-wider ml-1">Terminal de Sincronización en Tiempo Real</span>
                  </div>
                  
                  {csvUploading && <span className="text-[10px] font-mono text-emerald-450 font-bold animate-pulse">● PROCESANDO TRANSACCIONES</span>}
                </div>

                {/* Main Alert Message */}
                {csvMessage && (
                  <div className={`p-3 rounded-xl mb-4 font-bold text-xs flex items-center gap-2 border ${
                    csvMessage.type === 'error'
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : csvMessage.type === 'success'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-blue-500/10 text-blue-450 border-blue-500/20'
                  }`}>
                    {csvMessage.type === 'error' && '⚠️ '}
                    {csvMessage.type === 'success' && '✓ '}
                    {csvMessage.type === 'info' && '🛈 '}
                    {csvMessage.text}
                  </div>
                )}

                {/* Step-by-Step Console Logs */}
                {csvDetails.length > 0 && (
                  <div className="bg-slate-950/90 rounded-xl p-4 max-h-[180px] overflow-y-auto border border-slate-850/80 font-mono text-[9px] text-slate-300 space-y-1.5 scrollbar-thin">
                    {csvDetails.map((detail, idx) => (
                      <p key={idx} className="leading-relaxed">
                        <span className="text-slate-600 select-none mr-2">[{idx + 1}]</span>
                        {detail.startsWith('✅') ? (
                          <span className="text-emerald-400 font-extrabold">{detail}</span>
                        ) : detail.startsWith('❌') ? (
                          <span className="text-red-400 font-extrabold">{detail}</span>
                        ) : detail.startsWith('🧹') ? (
                          <span className="text-yellow-500">{detail}</span>
                        ) : (
                          <span>{detail}</span>
                        )}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Current Distributors Preview */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h4 className={`text-xs font-black uppercase font-mono tracking-wider ${isDark ? 'text-slate-350' : 'text-slate-650'}`}>
                  VISTA PREVIA Y VALIDACIÓN EN BASE "{activeDbId}" (Top 50 del Catálogo)
                </h4>
              </div>

              <div className="w-full overflow-x-auto">
                <div className={`border rounded-xl overflow-hidden transition-all max-h-[350px] overflow-y-auto ${isDark ? 'bg-slate-950/30 border-slate-850' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className={`border-b font-mono uppercase text-[9px] tracking-wider font-extrabold sticky top-0 z-10 ${isDark ? 'bg-slate-955 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
                        <th className="p-3">Marca</th>
                        <th className="p-3">Clave Corporativo</th>
                        <th className="p-3">ID Agencia</th>
                        <th className="p-3">Nombre del Distribuidor</th>
                        <th className="p-3">Estado</th>
                        <th className="p-3">Sitio Web Asociado</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-slate-800/50' : 'divide-slate-100'}`}>
                      {distributors.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-6 text-center font-bold italic text-slate-400">
                            No hay distribuidores cargados en la base de datos "{activeDbId}". Use uno de los métodos anteriores para poblarlos.
                          </td>
                        </tr>
                      ) : (
                        distributors.slice(0, 50).map((dist, idx) => (
                          <tr key={`${dist.disId || dist.id || idx}-${dist.marca || ''}-${idx}`} className={`transition-colors duration-150 ${isDark ? 'text-slate-200 hover:bg-slate-800/10' : 'text-slate-700 hover:bg-slate-50'}`}>
                            <td className="p-3 font-semibold">
                              <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase font-mono ${
                                dist.marca?.toUpperCase() === 'LEAPMOTOR'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : dist.marca?.toUpperCase() === 'JEEP'
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                    : 'bg-slate-500/10 text-slate-400 border border-slate-500/10'
                              }`}>
                                {dist.marca || 'N/A'}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-slate-400">{dist.claveCorporativo || 'N/A'}</td>
                            <td className="p-3 font-mono font-bold text-slate-400">{dist.disId || dist.id || 'N/A'}</td>
                            <td className={`p-3 font-black ${titleColor}`}>{dist.name}</td>
                            <td className="p-3 font-extrabold uppercase text-slate-400">{dist.estado || 'N/A'}</td>
                            <td className="p-3 truncate max-w-[200px] font-mono text-slate-400" title={dist.url}>
                              {dist.url ? (
                                <a href={dist.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                  {dist.url}
                                </a>
                              ) : 'N/A'}
                            </td>
                          </tr>
                        ))
                      )}
                      {distributors.length > 50 && (
                        <tr>
                          <td colSpan={6} className={`p-3.5 text-center font-mono text-[9px] font-bold tracking-wider uppercase border-t ${
                            isDark ? 'bg-slate-900/50 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-500 border-slate-200'
                          }`}>
                            ... y {distributors.length - 50} agencias de distribución de Stellantis adicionales activas cargadas ...
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
  );
}
