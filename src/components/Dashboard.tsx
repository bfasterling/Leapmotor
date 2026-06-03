/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, doc, setDoc, deleteDoc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Lead, LeadStatus } from '../types';
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
  Pencil
} from 'lucide-react';
import { motion } from 'motion/react';

// Pie chart colors matching Leapmotor theme
const COLORS = ['#2563EB', '#06B6D4', '#F59E0B', '#EF4444'];

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

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Date range filters state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
          testDriveDate: d.testDriveDate || null
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

  // Seed & Subscribe to distributors
  useEffect(() => {
    let active = true;
    const seedAndSubscribeDistributors = async () => {
      const OFFICIAL_DISTRIBUTORS = [
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

      try {
        const ref = collection(db, 'distributors');
        const snap = await getDocs(ref);
        
        // 1. Seed or update official ones to ensure they contain all fields (marca, claveCorporativo, disId, estado, name, url)
        for (const dist of OFFICIAL_DISTRIBUTORS) {
          await setDoc(doc(db, 'distributors', dist.disId), {
            marca: dist.marca,
            claveCorporativo: dist.claveCorporativo,
            disId: dist.disId,
            estado: dist.estado,
            name: dist.name,
            url: dist.url,
            createdAt: new Date()
          });
        }

        // 2. Clean up any stale or non-official legacy distributors
        const officialIds = new Set(OFFICIAL_DISTRIBUTORS.map(d => d.disId));
        snap.forEach(async (docSnap) => {
          if (!officialIds.has(docSnap.id)) {
            try {
              await deleteDoc(doc(db, 'distributors', docSnap.id));
            } catch (err) {
              console.error("Error deleting stale distributor:", docSnap.id, err);
            }
          }
        });

      } catch (err) {
        console.error("Error seeding official distributors:", err);
      }

      if (!active) return;

      // Subscribe to real-time updates
      const unsubscribeDistributors = onSnapshot(collection(db, 'distributors'), (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        list.sort((a, b) => a.name.localeCompare(b.name));
        setDistributors(list);
        if (list.length > 0) {
          setNewAdvDistributor(list[0].name);
        }
      }, (error) => {
        console.error("Dashboard distributors subscription error:", error);
      });

      return unsubscribeDistributors;
    };

    let unsub: any;
    seedAndSubscribeDistributors().then(u => {
      unsub = u;
    });

    return () => {
      active = false;
      if (unsub) unsub();
    };
  }, []);

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

  // Compute stats based on the selected date filters
  const totalLeads = filteredLeads.length;
  
  const statusCounts = filteredLeads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
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

  // 1. Data for conversion status pie
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
            {/* Style switcher */}
            <button
              onClick={toggleTheme}
              type="button"
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                isDark 
                  ? 'bg-slate-800 border-white/10 text-white hover:bg-slate-700' 
                  : 'bg-slate-100 border-slate-200 text-slate-850 hover:bg-slate-200'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-650 text-indigo-600" />}
              <span>Estilo: {isDark ? 'NEGRO' : 'BLANCO'}</span>
            </button>

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
                  isDark ? 'bg-red-500/10 hover:bg-red-500/20 text-red-405 text-red-400 border-red-500/20' : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
                }`}
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      
      {/* Overview stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* KPI 1: Total Leads */}
        <div className={`${cardBg} p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between transition-all duration-300`}>
          <div className="flex justify-between items-start">
            <span className={`text-[12px] font-mono tracking-wider uppercase font-extrabold ${isDark ? 'text-slate-400' : 'text-slate-550 text-slate-500'}`}>Total Prospectos</span>
            <span className={`p-2 rounded-xl ${isDark ? 'bg-blue-500/20 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <div className={`text-3xl font-black ${titleColor}`}>{totalLeads}</div>
            <p className={`text-[11px] font-extrabold font-mono mt-1 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>Registrados hoy</p>
          </div>
        </div>

        {/* KPI 2: Response Time */}
        <div className={`${cardBg} p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between transition-all duration-300`}>
          <div className="flex justify-between items-start">
            <span className={`text-[12px] font-mono tracking-wider uppercase font-extrabold ${isDark ? 'text-slate-400' : 'text-slate-550 text-slate-500'}`}>Respuesta Promedio</span>
            <span className={`p-2 rounded-xl ${isDark ? 'bg-cyan-500/20 text-white' : 'bg-cyan-50 text-cyan-700 border border-cyan-200'}`}>
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <div className={`text-3xl font-black flex items-baseline gap-1 ${titleColor}`}>
              {averageResponseTimeSec === 0 ? 'N/D' : `${averageResponseTimeSec}`}
              {averageResponseTimeSec > 0 && <span className="text-sm font-black text-slate-500">seg</span>}
            </div>
            <p className={`text-[11px] font-extrabold font-mono mt-1 flex items-center gap-1 ${isDark ? 'text-cyan-333 text-white' : 'text-cyan-700'}`}>
              <Zap className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400 animate-bounce" /> Meta Stellantis: &lt;15s
            </p>
          </div>
        </div>

        {/* KPI 3: Conversion Rate */}
        <div className={`${cardBg} p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between transition-all duration-300`}>
          <div className="flex justify-between items-start">
            <span className={`text-[12px] font-mono tracking-wider uppercase font-extrabold ${isDark ? 'text-slate-400' : 'text-slate-550 text-slate-500'}`}>Tasa De Cierre</span>
            <span className={`p-2 rounded-xl ${isDark ? 'bg-amber-500/20 text-white' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
              <Percent className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <div className={`text-3xl font-black ${titleColor}`}>{conversionRate}%</div>
            <p className={`text-[11px] font-extrabold font-mono mt-1 ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>Éxito vs descartados</p>
          </div>
        </div>

        {/* KPI 4: Active queue */}
        <div className={`${cardBg} p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between transition-all duration-300`}>
          <div className="flex justify-between items-start">
            <span className={`text-[12px] font-mono tracking-wider uppercase font-extrabold ${isDark ? 'text-slate-400' : 'text-slate-550 text-slate-500'}`}>Fila de espera</span>
            <span className={`p-2 rounded-xl ${waitingCount > 0 ? 'bg-red-500/20 text-white animate-pulse' : (isDark ? 'bg-white/10 text-white border border-slate-700' : 'bg-slate-100 text-slate-700 border border-slate-200')}`}>
              <Bell className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <div className={`text-3xl font-black ${titleColor}`}>{waitingCount}</div>
            <p className={`text-[11px] font-extrabold font-mono mt-1 ${isDark ? 'text-slate-100' : 'text-slate-500'}`}>Clientes sin asignar</p>
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
              <p className={`text-[11px] font-bold mt-1 ${subColor}`}>Planes de financiamiento</p>
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
              <p className={`text-[11px] font-bold mt-1 ${subColor}`}>Test drive en pista</p>
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
              <p className={`text-[11px] font-bold mt-1 ${subColor}`}>Atención VIP en stand</p>
            </div>
            <div className={`p-3.5 rounded-xl ${isDark ? 'bg-blue-500/20 text-blue-450 text-blue-400' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}>
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Analytics charts panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* CHART 2: Funnel Status ratio */}
        <div className={`${cardBg} rounded-2xl p-6 transition-all duration-300`}>
          <h3 className={`text-sm font-black tracking-wide uppercase font-mono mb-6 flex items-center gap-2 ${titleColor}`}>
            <TrendingUp className="w-4 h-4 text-blue-400" /> Tasa de Conversión General
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {pieChartData.length === 0 ? (
              <div className={`text-center text-xs font-bold py-12 md:col-span-2 ${subColor}`}>
                Sin datos suficientes para graficar
              </div>
            ) : (
              <>
                <div className="h-48 w-full relative">
                  <ResponsiveContainer width="100%" height="100%" minHeight={192}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: isDark ? '#090d16' : '#ffffff', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', color: isDark ? '#ffffff' : '#333333' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className={`space-y-2 p-3 rounded-xl border text-[11px] font-mono ${isDark ? 'bg-slate-950/40 border-white/5' : 'bg-slate-50 border-slate-150'}`}>
                  <div className={`flex justify-between pb-1 border-b font-semibold ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                    <span className="text-blue-500 font-extrabold">● Éxito (Atendidos)</span>
                    <strong className={`font-black ${titleColor}`}>{attendedCount}</strong>
                  </div>
                  <div className={`flex justify-between pb-1 border-b font-semibold ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                    <span className="text-cyan-500 font-extrabold">● En Proceso</span>
                    <strong className={`font-black ${titleColor}`}>{attendingCount}</strong>
                  </div>
                  <div className={`flex justify-between pb-1 border-b font-semibold ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                    <span className="text-amber-500 font-extrabold">● En Espera</span>
                    <strong className={`font-black ${titleColor}`}>{waitingCount}</strong>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-red-500 font-extrabold">● Sin Interés</span>
                    <strong className={`font-black ${titleColor}`}>{lostCount}</strong>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
               {/* CHART 3: Landing Page Leads Origin Ratio */}
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 5 Distributors interest */}
        <div className={`${cardBg} rounded-2xl p-6 transition-all duration-300`}>
          <h3 className={`text-sm font-black tracking-wide uppercase font-mono mb-4 flex items-center gap-2 ${titleColor}`}>
            <MapPin className="w-4 h-4 text-emerald-400" /> Distribuidores de Interés
          </h3>
          <div className="space-y-4 pt-2">
            {distributorChartData.length === 0 ? (
              <div className={`text-center text-xs font-bold py-8 ${subColor}`}>Registrando distribuidores...</div>
            ) : (
              distributorChartData.map((d, i) => {
                const qty = d.Cantidad as number;
                const percentage = totalLeads > 0 ? Math.round((qty / totalLeads) * 100) : 0;
                return (
                  <div key={d.name} className="space-y-1.5">
                     <div className="flex justify-between text-xs">
                      <span className={`font-extrabold truncate max-w-[200px] ${titleColor}`}>{i + 1}. {d.name}</span>
                      <span className="text-emerald-500 font-mono font-black">{qty} ({percentage}%)</span>
                    </div>
                    <div className={`w-full h-2.5 rounded-full overflow-hidden border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-205 border-slate-200'}`}>
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Advisor Performance table */}
        <div className={`${cardBg} rounded-2xl p-6 lg:col-span-2 transition-all duration-300`}>
          <h3 className={`text-sm font-black tracking-wide uppercase font-mono mb-4 flex items-center gap-2 ${titleColor}`}>
            <Award className="w-4 h-4 text-blue-400" /> Velocidad de Respuesta por Asesor
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className={`border-b font-bold font-mono ${isDark ? 'border-white/20 text-white' : 'border-slate-200 text-slate-800'}`}>
                  <th className="py-2.5">ASESOR</th>
                  <th className="py-2.5">LEADS FINALIZADOS</th>
                  <th className="py-2.5">EN PROCESO</th>
                  <th className="py-2.5">EFECTIVIDAD CIERRE</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-white/10' : 'divide-slate-150 divide-slate-100'}`}>
                {advisors.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={`py-6 text-center font-semibold italic ${subColor}`}>
                      No hay asesores configurados para computar métricas...
                    </td>
                  </tr>
                ) : (
                  advisors.map(advisor => {
                    const finishedLeads = filteredLeads.filter(l => l.advisorId === advisor.id && (l.status === LeadStatus.ATTENDED || l.status === LeadStatus.LOST));
                    const processedLeads = finishedLeads.length;
                    const activeLeads = filteredLeads.filter(l => l.advisorId === advisor.id && l.status === LeadStatus.ATTENDING).length;
                    const successLeads = finishedLeads.filter(l => l.status === LeadStatus.ATTENDED).length;
                    
                    const performance = processedLeads > 0 ? Math.round((successLeads / processedLeads) * 100) : 0;
 
                    return (
                      <tr key={advisor.id} className={`font-medium transition-colors duration-200 ${isDark ? 'text-slate-100 hover:bg-white/10' : 'text-slate-800 hover:bg-slate-100'}`}>
                        <td className={`py-3 font-semibold ${titleColor}`}>
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${advisor.active !== false ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                            {advisor.name}
                          </div>
                        </td>
                        <td className={`py-3 font-mono font-bold ${titleColor}`}>{processedLeads}</td>
                        <td className={`py-3 font-mono font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>{activeLeads}</td>
                        <td className="py-3 font-mono">
                          <span className={`px-2 py-0.5 rounded font-black border ${
                            performance >= 75 ? 'bg-blue-500/20 text-white border-blue-500/35' :
                            performance >= 50 ? 'bg-amber-500/20 text-white border-amber-500/35' :
                            processedLeads === 0 ? 'bg-white/15 text-white border-white/20' : 'bg-red-500/20 text-white border-red-500/35'
                          }`}>
                            {processedLeads === 0 ? 'Sin finalizar' : `${performance}% cierre`}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. GESTIÓN DE ASESORES COMERCIALES (Crear, Listar, Activar/Inactivar, Eliminar) */}
      <div className={`mt-8 border rounded-3xl p-6 transition-all duration-300 relative overflow-hidden ${cardBg}`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
        <h3 className={`text-sm font-black tracking-widest uppercase font-mono mb-4 flex items-center gap-2 ${titleColor}`}>
          <Users className="w-4 h-4 text-emerald-400" /> ASESORES CONFIGURADOS
        </h3>
        <p className={`text-xs font-semibold mb-6 leading-relaxed ${subColor}`}>
          Agrega nuevos asesores comerciales, modifique sus contraseñas para permitirles iniciar sesión en su consola, y desactívelos temporalmente para que dejen de recibir asignación automática de nuevos leads clientelares en tiempo real de acuerdo a la regla del menor volumen de carga.
        </p>

        <div className="flex flex-col gap-8">
          {/* Create / Edit Form */}
          <div className={`p-5 rounded-2xl border transition-all ${isDark ? 'bg-slate-950/50 border-slate-850 border-slate-800/80' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
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
                  <label className={`block text-[11px] font-extrabold font-mono uppercase mb-1.5 ${isDark ? 'text-white' : 'text-slate-700'}`}>Distribuidor Leapmotor Asociado:</label>
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
                      distributors.map((dist) => (
                        <option key={dist.id} value={dist.name}>
                          {dist.name} ({dist.estado || 'N/A'} - ID: {dist.disId || dist.id})
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
                    className="flex-1 bg-slate-500 hover:bg-slate-400 text-white font-black py-2.5 rounded-xl text-xs transition uppercase tracking-widest cursor-pointer text-center"
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
                <tbody className={`divide-y ${isDark ? 'divide-slate-805 divide-slate-800/50' : 'divide-slate-150 divide-slate-100'}`}>
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
                                  : 'bg-amber-50 text-amber-805 border-amber-200 text-amber-700'
                                : isDark 
                                  ? 'bg-slate-900/50 text-slate-500 border-slate-800' 
                                  : 'bg-slate-50 text-slate-405 border-slate-205 text-slate-400'
                            }`}>
                              {advWaitingCount} espera / {advAttendingCount} atención
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => toggleAdvisorActive(adv.id, adv.active !== false)}
                              className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase font-mono transition border cursor-pointer ${
                                adv.active !== false 
                                  ? isDark ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-250 hover:bg-emerald-100'
                                  : isDark ? 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30' : 'bg-red-50 text-red-700 border-red-250 hover:bg-red-100'
                              }`}
                            >
                              {adv.active !== false ? 'Habilitado' : 'Suspendido'}
                            </button>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex gap-2 justify-end">
                              <button
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
                                onClick={() => handleDeleteAdvisor(adv.id)}
                                className={`text-[9px] font-bold border rounded px-2.5 py-1 transition cursor-pointer ${
                                  isDark ? 'text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border-red-500/30' : 'text-red-650 text-red-600 hover:bg-red-50 border-red-200'
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
    </div>
    </div>
  );
}
