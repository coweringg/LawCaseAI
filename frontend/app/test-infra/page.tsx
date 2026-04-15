"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, AlertTriangle, ArrowRight, Zap } from "lucide-react";
import toast from "react-hot-toast";

export default function InfraCompletaTester() {
  const [shouldCrash, setShouldCrash] = useState(false);

  if (shouldCrash) {
    throw new Error("CRASH_TEST_SUCCESS: La infraestructura de errores funciona.");
  }

  return (
    <div className="min-h-screen bg-[#060910] text-white flex flex-col items-center justify-center p-6 space-y-8">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shadow-lg shadow-primary/5">
          <Zap size={24} />
        </div>
        <h1 className="text-4xl font-black font-display tracking-tight text-white">
          Fase 1: <span className="text-primary italic">Completada</span>
        </h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl w-full">
        <div className="premium-glass p-8 rounded-[2rem] border border-white/5 flex flex-col items-center text-center space-y-4">
          <Sparkles className="text-blue-400" size={32} />
          <h2 className="text-xl font-bold uppercase tracking-tighter">4. Transiciones</h2>
          <p className="text-slate-400 text-sm">Cambia de ruta para ver el efecto fade/slide suave del App Router.</p>
          <Link 
            href="/privacy"
            className="mt-4 flex items-center gap-2 px-6 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500/20 transition-all"
          >
            Ir a Privacy <ArrowRight size={14} />
          </Link>
        </div>

        <div className="premium-glass p-8 rounded-[2rem] border border-white/5 flex flex-col items-center text-center space-y-4">
          <AlertTriangle className="text-rose-500" size={32} />
          <h2 className="text-xl font-bold uppercase tracking-tighter">6. Error Boundary</h2>
          <p className="text-slate-400 text-sm">Provoca un error fatal para ver la pantalla de recuperación premium.</p>
          <button 
            onClick={() => setShouldCrash(true)}
            className="mt-4 px-6 py-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500/20 transition-all"
          >
            Simular Crash Crítico
          </button>
        </div>
      </div>

      <div className="max-w-4xl w-full premium-glass p-4 rounded-3xl border border-white/5 text-center">
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">
          Estatus: 7/7 Piezas de Infraestructura Activas
        </p>
      </div>
    </div>
  );
}
