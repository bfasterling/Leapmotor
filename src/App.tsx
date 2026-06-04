/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck } from 'lucide-react';
import LeadForm from './components/LeadForm';
import AdvisorPanel from './components/AdvisorPanel';
import Dashboard from './components/Dashboard';
import LeapmotorLogo from './components/LeapmotorLogo';

import C10_IMG from './assets/images/leapmotor_c10_cdmx_1779978633850.png';
import T03_IMG from './assets/images/leapmotor_t03_urban_1779978654553.png';
import B10_IMG from './assets/images/leapmotor_b10_blue_optimized_1780583624316.png';

enum MainRole {
  CLIENT = 'client',
  ADVISOR = 'advisor',
  BOARD = 'board'
}

export default function App() {
  const [currentRole, setCurrentRole] = useState<MainRole>(MainRole.CLIENT);

  // Helper to parse role from URL or Domain Hostname
  const determineRoleFromUrl = (): MainRole => {
    const host = window.location.hostname.toLowerCase();
    
    // Domain-based routing (subdomains)
    if (host.startsWith('asesor') || host.startsWith('advisor') || host.startsWith('consultor')) {
      return MainRole.ADVISOR;
    }
    if (host.startsWith('tablero') || host.startsWith('dashboard') || host.startsWith('board') || host.startsWith('admin')) {
      return MainRole.BOARD;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const paramVal = searchParams.get('view') || searchParams.get('role') || searchParams.get('app');
    
    if (paramVal === 'advisor') return MainRole.ADVISOR;
    if (paramVal === 'dashboard' || paramVal === 'board') return MainRole.BOARD;
    return MainRole.CLIENT;
  };

  // Synchronize on mount and answer to back/forward navigation
  useEffect(() => {
    const initialRole = determineRoleFromUrl();
    setCurrentRole(initialRole);

    const handlePopState = () => {
      setCurrentRole(determineRoleFromUrl());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Detect if we are in the published/live user version (or if forced via query/hash)
  const isPublishedVersion = 
    window.location.hostname.includes('-pre-') || 
    window.location.search.includes('production=true') ||
    window.location.search.includes('clean=true') ||
    window.location.search.includes('clean') ||
    window.location.hash.includes('clean') ||
    (!window.location.hostname.includes('-dev-') && 
     !window.location.hostname.includes('localhost') && 
     window.location.hostname !== '127.0.0.1');

  // Get active screen text badge
  const getScreenBadge = () => {
    if (currentRole === MainRole.ADVISOR) return 'Consola del Asesor';
    if (currentRole === MainRole.BOARD) return 'Tablero Digital de Mando';
    return 'Portal de Clientes';
  };

  return (
    <div className="min-h-screen bg-[#05070a] bg-noise text-slate-100 selection:bg-blue-500/30 selection:text-blue-300 flex flex-col justify-between overflow-x-hidden">
      
      {/* Premium Clean Header - hidden in the published version */}
      {!isPublishedVersion && (
        <nav id="main-navigation" className="sticky top-0 z-50 bg-[#05070a]/90 backdrop-blur-md border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-2 sm:py-3 gap-6">
              {/* Brand Logo & Slogan */}
              <div className="flex items-center gap-4">
                <LeapmotorLogo size="md" className="text-white" />
                <div className="border-l border-white/10 pl-4 py-2">
                  <span className="text-[11px] uppercase font-mono tracking-widest text-slate-400 block font-bold">Leapmotor México</span>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-blue-400 block font-medium mt-0.5">Stellantis Venture</span>
                </div>
              </div>

              {/* View Status Badge */}
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[10px] uppercase font-mono font-bold text-slate-300 tracking-wider">
                  {getScreenBadge()}
                </span>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content Render */}
      <main className="flex-1 w-full bg-slate-950">
        <AnimatePresence mode="wait">
          {currentRole === MainRole.CLIENT && (
            <motion.div
              key="client-section"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              <LeadForm c10ImgUrl={C10_IMG} t03ImgUrl={T03_IMG} b10ImgUrl={B10_IMG} />
            </motion.div>
          )}

          {currentRole === MainRole.ADVISOR && (
            <motion.div
              key="advisor-section"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              <AdvisorPanel />
            </motion.div>
          )}

          {currentRole === MainRole.BOARD && (
            <motion.div
              key="board-section"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              <Dashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Futuristic footer - hidden in the published version */}
      {!isPublishedVersion && (
        <footer className="bg-slate-950/80 border-t border-slate-900/80 py-8 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-slate-900 rounded border border-slate-800 text-xs text-blue-400 font-bold tracking-widest font-mono">LEAP</span>
              <span>© 2026 Leapmotor México. Todos los derechos reservados.</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-450 font-mono">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-blue-500" /> Stellantis Joint Venture
              </span>
              <span>•</span>
              <span>Aviso de Privacidad</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
