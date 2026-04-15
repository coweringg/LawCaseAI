"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Router Global Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#060910] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-rose-500/20 text-rose-500 flex items-center justify-center mb-8 animate-pulse shadow-2xl shadow-rose-500/10">
        <AlertCircle size={40} />
      </div>
      
      <h1 className="text-4xl font-black font-display tracking-tightest mb-4">
        ALGO SALIÓ <span className="text-rose-500 italic">MAL</span>
      </h1>
      
      <p className="text-slate-400 max-w-md mx-auto mb-12 font-medium leading-relaxed">
        Se ha producido un error crítico en el motor de la aplicación. No te preocupes, tus datos están seguros.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-200 transition-all active:scale-95 shadow-xl shadow-white/5"
        >
          <RefreshCw size={14} className="animate-spin-slow" />
          Reintentar Carga
        </button>
        
        <Link
          href="/"
          className="flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-white/10 transition-all active:scale-95"
        >
          <Home size={14} />
          Volver al Inicio
        </Link>
      </div>

      <div className="mt-16 pt-8 border-t border-white/5 w-full max-w-xs">
        <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">
          Error ID: {error.digest || "INFRA_FAIL_PROD"}
        </p>
      </div>
    </div>
  );
}
