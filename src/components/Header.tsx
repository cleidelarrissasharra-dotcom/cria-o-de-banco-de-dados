/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Clock, Play, Pause, RefreshCw, Landmark, ChevronRight, Sliders } from 'lucide-react';

interface HeaderProps {
  appTime: string;
  setAppTime: React.Dispatch<React.SetStateAction<string>>;
  isClockRunning: boolean;
  setIsClockRunning: React.Dispatch<React.SetStateAction<boolean>>;
  onResetDatabase: () => void;
}

export function Header({
  appTime,
  setAppTime,
  isClockRunning,
  setIsClockRunning,
  onResetDatabase
}: HeaderProps) {
  const [showConfig, setShowConfig] = useState(false);

  // When clock is running, advance simulated time by 1 hour every 4 seconds
  useEffect(() => {
    if (!isClockRunning) return;

    const interval = setInterval(() => {
      setAppTime((prev) => {
        const date = new Date(prev);
        // Add 1 hour
        date.setHours(date.getHours() + 1);
        return date.toISOString();
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isClockRunning, setAppTime]);

  const advanceHours = (hours: number) => {
    setAppTime((prev) => {
      const date = new Date(prev);
      date.setHours(date.getHours() + hours);
      return date.toISOString();
    });
  };

  const advanceDays = (days: number) => {
    setAppTime((prev) => {
      const date = new Date(prev);
      date.setDate(date.getDate() + days);
      return date.toISOString();
    });
  };

  const syncToCurrent = () => {
    setAppTime(new Date().toISOString());
  };

  const syncToOriginal = () => {
    setAppTime('2026-06-06T00:23:08Z');
  };

  const formatSimulatedTime = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      
      return `${day}/${month}/${year} às ${hours}:${minutes}:${seconds}`;
    } catch {
      return isoStr;
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          
          {/* Logo Brand Brand */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-sm border border-emerald-500/20">
              Q
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-slate-800 tracking-tight">QualiFLV</span>
                <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200/50">
                  SQL Relacional v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400">Rastreabilidade e Shelf-life de Hortifrúti Processado</p>
            </div>
          </div>

          {/* Simulador de Tempo / Controles */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Relógio do Simulador */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-1.5 px-3 space-x-3 text-sm">
              <div className="flex items-center space-x-1.5 text-slate-500">
                <Clock className="h-4 w-4 text-emerald-500 animate-pulse" />
                <span className="font-semibold text-slate-600 text-xs hidden sm:inline uppercase tracking-wider">Simulador:</span>
              </div>
              
              <span className="font-mono font-medium text-slate-700 bg-white border border-slate-100 rounded px-2 py-0.5 shadow-xs">
                {formatSimulatedTime(appTime)}
              </span>

              <div className="flex items-center space-x-1 border-l border-slate-200 pl-2">
                <button
                  id="btn-play-pause-clock"
                  onClick={() => setIsClockRunning(!isClockRunning)}
                  title={isClockRunning ? 'Pausar Simulador (Modo Estático)' : 'Iniciar Simulador (1 hora / 4 segs)'}
                  className={`p-1 rounded cursor-pointer transition-all ${
                    isClockRunning 
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-600' 
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600'
                  }`}
                >
                  {isClockRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                </button>

                <button
                  id="btn-tune-time"
                  onClick={() => setShowConfig(!showConfig)}
                  title="Ajustes Rápidos de Tempo"
                  className={`p-1 rounded cursor-pointer transition-all ${
                    showConfig ? 'bg-slate-200 text-slate-800' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                  }`}
                >
                  <Sliders className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Ações de Banco de Dados */}
            <button
              id="btn-reset-db-header"
              onClick={onResetDatabase}
              title="Restaurar Banco de Dados ao Seed Original"
              className="flex items-center space-x-1 text-xs text-slate-500 hover:text-emerald-600 bg-white border border-slate-200 hover:border-emerald-300 font-medium px-3 py-2 rounded-lg shadow-2xs hover:shadow-xs transition cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
              <span>Zerar BD (SQL)</span>
            </button>

          </div>
        </div>

        {/* Painel configurações de tempo expandido */}
        {showConfig && (
          <div className="bg-slate-50 border-t border-slate-200/60 py-2.5 px-4 mb-2 rounded-b-lg flex flex-wrap items-center gap-2 justify-between animate-fadeIn text-xs">
            <div className="flex items-center space-x-2 text-slate-500">
              <span className="font-semibold text-slate-600">Avanço rápido de shelf-life:</span>
              <p className="text-slate-400 hidden lg:inline">Use os botões para acelerar o vencimento dos lotes de frutas/verduras.</p>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                id="btn-advance-6h"
                onClick={() => { advanceHours(6); }}
                className="bg-white border border-slate-200 hover:border-emerald-400 px-2 py-1 rounded shadow-3xs cursor-pointer hover:bg-emerald-50/25 transition-all text-slate-700"
              >
                +6 Horas
              </button>
              <button
                id="btn-advance-12h"
                onClick={() => { advanceHours(12); }}
                className="bg-white border border-slate-200 hover:border-emerald-400 px-2 py-1 rounded shadow-3xs cursor-pointer hover:bg-emerald-50/25 transition-all text-slate-700"
              >
                +12 Horas
              </button>
              <button
                id="btn-advance-24h"
                onClick={() => { advanceHours(24); }}
                className="bg-white border border-slate-200 hover:border-emerald-400 px-2 py-1 rounded shadow-3xs cursor-pointer hover:bg-emerald-50/25 transition-all text-slate-700"
              >
                +24h (1 Dia)
              </button>
              <button
                id="btn-advance-48h"
                onClick={() => { advanceDays(2); }}
                className="bg-white border border-slate-200 hover:border-emerald-400 px-2 py-1 rounded shadow-3xs cursor-pointer hover:bg-emerald-50/25 transition-all text-slate-700"
              >
                +48h (2 Dias)
              </button>
              <div className="h-4 w-px bg-slate-200 mx-1"></div>
              <button
                id="btn-sync-seed-time"
                onClick={syncToOriginal}
                className="bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2 py-1 rounded transition text-slate-600 font-medium cursor-pointer"
              >
                Resetar Tempo (06/06)
              </button>
              <button
                id="btn-sync-real-time"
                onClick={syncToCurrent}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded transition font-medium cursor-pointer"
              >
                Sincronizar Relógio Real
              </button>
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
