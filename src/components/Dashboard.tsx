/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
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
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';

// Pie chart colors matching Leapmotor theme
const COLORS = ['#2563EB', '#06B6D4', '#F59E0B', '#EF4444'];

export default function Dashboard() {
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
  const [mgmtError, setMgmtError] = useState('');
  const [mgmtSuccess, setMgmtSuccess] = useState('');

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
          requestType: d.requestType
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

  // Handle addition of a sales advisor
  const handleAddAdvisorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMgmtError('');
    setMgmtSuccess('');

    if (!newAdvName.trim() || !newAdvEmail.trim() || !newAdvPassword.trim()) {
      setMgmtError('Todos los campos son obligatorios para registrar un asesor comercial.');
      return;
    }

    try {
      const id = 'ADV-' + Date.now().toString().slice(-6);
      await setDoc(doc(db, 'advisors', id), {
        name: newAdvName.trim(),
        email: newAdvEmail.trim(),
        password: newAdvPassword.trim(),
        active: true,
        createdAt: new Date()
      });
      setNewAdvName('');
      setNewAdvEmail('');
      setNewAdvPassword('');
      setMgmtSuccess('Asesor comercial registrado con éxito.');
    } catch (err: any) {
      console.error(err);
      setMgmtError('No se pudo guardar el asesor en Firebase. Verifique privilegios.');
    }
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
      <div className="w-full flex justify-center items-center h-96">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent animate-spin rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pt-1 px-4 md:pt-2 md:px-6 pb-24 text-slate-100 font-sans" id="dashboard-view">
      
      {/* Date Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-2xl rounded-full pointer-events-none" />
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-emerald-400" /> HISTÓRICO DE FECHAS SELECCIONABLES
          </h2>
          <p className="text-[11px] text-slate-400">Selecciona el rango para filtrar prospectos, conversión y desempeño de asesores en tiempo real.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2">
            <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">Desde:</span>
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-xs text-slate-200 outline-none select-none font-bold"
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2">
            <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">Hasta:</span>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-xs text-slate-200 outline-none select-none font-bold"
            />
          </div>
          {(startDate || endDate) && (
            <button
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-1"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>
      
      {/* Overview stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* KPI 1: Total Leads */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-xl">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-mono text-slate-500 tracking-wider uppercase font-bold">Total Prospectos</span>
            <span className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">{totalLeads}</div>
            <p className="text-[11px] text-blue-400 font-mono mt-1">Registrados hoy</p>
          </div>
        </div>

        {/* KPI 2: Response Time */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-xl">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-mono text-slate-500 tracking-wider uppercase font-bold">Respuesta Promedio</span>
            <span className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white flex items-baseline gap-1">
              {averageResponseTimeSec === 0 ? 'N/D' : `${averageResponseTimeSec}`}
              {averageResponseTimeSec > 0 && <span className="text-sm font-bold text-slate-400">seg</span>}
            </div>
            <p className="text-[11px] text-cyan-400 font-mono mt-1 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-cyan-400" /> Meta Stellantis: &lt;15s
            </p>
          </div>
        </div>

        {/* KPI 3: Conversion Rate */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-xl">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-mono text-slate-500 tracking-wider uppercase font-bold">Tasa De Cierre</span>
            <span className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
              <Percent className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">{conversionRate}%</div>
            <p className="text-[11px] text-amber-400 font-mono mt-1">Éxito vs descartados</p>
          </div>
        </div>

        {/* KPI 4: Active queue */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-xl">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-mono text-slate-500 tracking-wider uppercase font-bold">Fila de espera</span>
            <span className={`p-2 rounded-xl ${waitingCount > 0 ? 'bg-red-500/15 text-red-500 animate-pulse' : 'bg-white/5 text-slate-500 border border-white/10'}`}>
              <Bell className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">{waitingCount}</div>
            <p className="text-[11px] text-slate-400 font-mono mt-1">Clientes sin asignar</p>
          </div>
        </div>
      </div>

      {/* Tipos de Solicitudes de Clientes panel */}
      <div className="mb-8">
        <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase font-mono mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" /> RESUMEN DE REQUERIMIENTOS SOLICITADOS
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/5 backdrop-blur-md border border-[#00a845]/20 hover:border-[#00a845]/40 transition p-5 rounded-2xl flex items-center justify-between shadow-lg">
            <div>
              <span className="text-[10px] font-mono text-emerald-400 tracking-wider uppercase font-bold">Cotizaciones</span>
              <div className="text-3xl font-black text-white mt-2 font-mono">{cotizacionLeads}</div>
              <p className="text-[10px] text-slate-405 text-slate-500 mt-1">Planes de financiamiento</p>
            </div>
            <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-indigo-500/20 hover:border-indigo-500/40 transition p-5 rounded-2xl flex items-center justify-between shadow-lg">
            <div>
              <span className="text-[10px] font-mono text-indigo-400 tracking-wider uppercase font-bold">Pruebas de Manejo</span>
              <div className="text-3xl font-black text-white mt-2 font-mono">{pruebaLeads}</div>
              <p className="text-[10px] text-slate-405 text-slate-500 mt-1">Test drive en pista</p>
            </div>
            <div className="p-3.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Key className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-blue-500/20 hover:border-blue-500/40 transition p-5 rounded-2xl flex items-center justify-between shadow-lg">
            <div>
              <span className="text-[10px] font-mono text-blue-400 tracking-wider uppercase font-bold">Llamar Asesor / Atención</span>
              <div className="text-3xl font-black text-white mt-2 font-mono">{asesorLeads}</div>
              <p className="text-[10px] text-slate-405 text-slate-500 mt-1">Atención VIP en stand</p>
            </div>
            <div className="p-3.5 bg-blue-500/10 text-blue-400 rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Analytics charts panels */}
      <div className="mb-8">
        {/* CHART 2: Funnel Status ratio */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl w-full">
          <h3 className="text-sm font-bold text-slate-200 tracking-wide uppercase font-mono mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" /> Tasa de Conversión General
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {pieChartData.length === 0 ? (
              <div className="text-center text-xs text-slate-500 py-12 md:col-span-2">
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
                      <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: 'rgba(255,255,255,0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-3 p-4 bg-slate-950/40 rounded-xl border border-white/5 text-xs font-mono">
                  <div className="flex justify-between pb-1.5 border-b border-white/5 font-semibold">
                    <span className="text-blue-400">● Concluidos exitosos</span>
                    <strong className="text-white">{attendedCount}</strong>
                  </div>
                  <div className="flex justify-between pb-1.5 border-b border-white/5 font-semibold">
                    <span className="text-cyan-400">● En contacto comercial</span>
                    <strong className="text-white">{attendingCount}</strong>
                  </div>
                  <div className="flex justify-between pb-1.5 border-b border-white/5 font-semibold">
                    <span className="text-amber-400">● Cola de espera activa</span>
                    <strong className="text-white">{waitingCount}</strong>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-red-400">● Descartado / Sin interés</span>
                    <strong className="text-white">{lostCount}</strong>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 5 Distributors interest */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-slate-200 tracking-wide uppercase font-mono mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" /> Distribuidores de Interés
          </h3>
          <div className="space-y-4 pt-2">
            {distributorChartData.length === 0 ? (
              <div className="text-center text-xs text-slate-500 py-8">Registrando distribuidores...</div>
            ) : (
              distributorChartData.map((d, i) => {
                const qty = d.Cantidad as number;
                const percentage = totalLeads > 0 ? Math.round((qty / totalLeads) * 100) : 0;
                return (
                  <div key={d.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-300 truncate max-w-[200px]">{i + 1}. {d.name}</span>
                      <span className="text-emerald-400 font-mono">{qty} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Advisor Performance table */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 lg:col-span-2 shadow-xl">
          <h3 className="text-sm font-bold text-slate-200 tracking-wide uppercase font-mono mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-400" /> Velocidad de Respuesta por Asesor
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-500 font-mono">
                  <th className="py-2.5">ASESOR</th>
                  <th className="py-2.5">LEADS FINALIZADOS</th>
                  <th className="py-2.5">EN PROCESO</th>
                  <th className="py-2.5">EFECTIVIDAD CIERRE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {advisors.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500 italic">
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
                      <tr key={advisor.id} className="text-slate-350 hover:bg-white/5 transition-colors duration-200">
                        <td className="py-3 font-semibold text-white">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${advisor.active !== false ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            {advisor.name}
                          </div>
                        </td>
                        <td className="py-3 font-mono">{processedLeads}</td>
                        <td className="py-3 font-mono text-cyan-400">{activeLeads}</td>
                        <td className="py-3 font-mono">
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            performance >= 75 ? 'bg-blue-500/10 text-blue-400' :
                            performance >= 50 ? 'bg-amber-500/10 text-amber-500' :
                            processedLeads === 0 ? 'bg-white/5 text-slate-500' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {processedLeads === 0 ? 'Limpio' : `${performance}% cierre`}
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
      <div className="mt-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
        <h3 className="text-sm font-bold text-white tracking-widest uppercase font-mono mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-400" /> GESTIÓN DE ASESORES COMERCIALES (ACCESOS Y AUTO-ASIGNACIÓN)
        </h3>
        <p className="text-slate-400 text-xs mb-6 leading-relaxed">
          Agrega nuevos asesores comerciales, modifique sus contraseñas para permitirles iniciar sesión en su consola, y desactívelos temporalmente para que dejen de recibir asignación automática de nuevos leads clientelares en tiempo real de acuerdo a la regla del menor volumen de carga.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Form */}
          <div className="bg-slate-950/50 border border-slate-800/80 p-5 rounded-2xl">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono mb-4">Registrar Nuevo Asesor</h4>
            <form onSubmit={handleAddAdvisorSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-400 font-mono uppercase font-bold mb-1.5">Nombre Completo:</label>
                <input
                  type="text"
                  placeholder="Ej: Daniel Sánchez"
                  value={newAdvName}
                  onChange={(e) => setNewAdvName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/55 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-mono uppercase font-bold mb-1.5">Correo Electrónico (Login ID):</label>
                <input
                  type="email"
                  placeholder="Ej: daniel@leapmotor.com"
                  value={newAdvEmail}
                  onChange={(e) => setNewAdvEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/55 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-mono uppercase font-bold mb-1.5">Contraseña de Acceso:</label>
                <input
                  type="text"
                  placeholder="Ej: clave123"
                  value={newAdvPassword}
                  onChange={(e) => setNewAdvPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/55 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none transition"
                />
              </div>

              {mgmtError && <p className="text-[11px] text-red-400 font-semibold">⚠️ {mgmtError}</p>}
              {mgmtSuccess && <p className="text-[11px] text-emerald-400 font-semibold">✓ {mgmtSuccess}</p>}

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition uppercase tracking-wide"
              >
                + Registrar en Base de Datos
              </button>
            </form>
          </div>

          {/* Advisors List Table */}
          <div className="lg:col-span-2 overflow-x-auto">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono mb-4">Asesores Configurables ({advisors.length})</h4>
            <div className="bg-slate-950/30 border border-slate-805 rounded-xl overflow-hidden">
              <table className="w-full text-[11px] text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase text-[9px] tracking-wider">
                    <th className="p-3">Asesor</th>
                    <th className="p-3">Correo</th>
                    <th className="p-3">Contraseña</th>
                    <th className="p-3 text-center">Auto-Asignación</th>
                    <th className="p-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {advisors.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-500 italic">
                        Cargando catálogo de asesores de ventas corporativos...
                      </td>
                    </tr>
                  ) : (
                    advisors.map((adv) => (
                      <tr key={adv.id} className="text-slate-300 hover:bg-slate-800/15 transition-colors">
                        <td className="p-3 font-semibold text-white">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${adv.active !== false ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            {adv.name}
                          </div>
                        </td>
                        <td className="p-3 font-mono">{adv.email}</td>
                        <td className="p-3 font-mono text-slate-400">{adv.password}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => toggleAdvisorActive(adv.id, adv.active !== false)}
                            className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase font-mono transition border ${
                              adv.active !== false 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20' 
                                : 'bg-red-500/10 text-red-400 border-red-500/25 hover:bg-red-500/20'
                            }`}
                          >
                            {adv.active !== false ? 'Habilitado' : 'Suspendido'}
                          </button>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteAdvisor(adv.id)}
                            className="text-[9px] font-bold text-red-500 hover:text-red-400 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded px-2.5 py-1 transition"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-slate-500 mt-2.5 font-mono">
              * Nota: Al suspender un asesor, éste conservará acceso para atender sus leads vigentes, pero no recibirá prospectos adicionales desde el formulario de la Landing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
