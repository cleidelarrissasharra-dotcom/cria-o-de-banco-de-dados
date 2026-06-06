/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Filial, Produto, LoteEstoque } from './types';
import { INITIAL_FILIAIS, INITIAL_PRODUTOS, INITIAL_LOTES } from './initialData';
import { Header } from './components/Header';
import { DashboardTab } from './components/DashboardTab';
import { LotesTab } from './components/LotesTab';
import { ProdutosTab } from './components/ProdutosTab';
import { FiliaisTab } from './components/FiliaisTab';
import { SqlTab } from './components/SqlTab';

import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  Apple, 
  Building, 
  Terminal,
  Database,
  RefreshCw,
  Info
} from 'lucide-react';

export default function App() {
  
  // Tab Routing State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'lotes' | 'produtos' | 'filiais' | 'sql'>('dashboard');

  // Relational Tables Local States (initialized from LocalStorage or seeded defaults)
  const [filiais, setFiliais] = useState<Filial[]>(() => {
    try {
      const saved = localStorage.getItem('qualiflv_filiais');
      return saved ? JSON.parse(saved) : INITIAL_FILIAIS;
    } catch {
      return INITIAL_FILIAIS;
    }
  });

  const [produtos, setProdutos] = useState<Produto[]>(() => {
    try {
      const saved = localStorage.getItem('qualiflv_produtos');
      return saved ? JSON.parse(saved) : INITIAL_PRODUTOS;
    } catch {
      return INITIAL_PRODUTOS;
    }
  });

  const [lotes, setLotes] = useState<LoteEstoque[]>(() => {
    try {
      const saved = localStorage.getItem('qualiflv_lotes');
      return saved ? JSON.parse(saved) : INITIAL_LOTES;
    } catch {
      return INITIAL_LOTES;
    }
  });

  // Simulator Time States
  const [appTime, setAppTime] = useState<string>(() => {
    return localStorage.getItem('qualiflv_apptime') || '2026-06-06T00:23:08Z';
  });
  const [isClockRunning, setIsClockRunning] = useState<boolean>(false);

  // Sync state data changes to localStorage
  useEffect(() => {
    localStorage.setItem('qualiflv_filiais', JSON.stringify(filiais));
  }, [filiais]);

  useEffect(() => {
    localStorage.setItem('qualiflv_produtos', JSON.stringify(produtos));
  }, [produtos]);

  useEffect(() => {
    localStorage.setItem('qualiflv_lotes', JSON.stringify(lotes));
  }, [lotes]);

  useEffect(() => {
    localStorage.setItem('qualiflv_apptime', appTime);
  }, [appTime]);

  /**
   * Helper to evaluate shelf-life remaining parameters based on processing date vs simulated app time
   */
  const calculateDynamicStatus = useCallback((
    processedTimeStr: string,
    shelfLifeHours: number,
    currentAppTimeIso: string
  ) => {
    const processed = new Date(processedTimeStr).getTime();
    const current = new Date(currentAppTimeIso).getTime();
    
    if (isNaN(processed) || isNaN(current)) {
      return { elapsedHours: 0, remainingHours: shelfLifeHours, remainingPercent: 100, status: 'Seguro' as const };
    }

    const elapsedMs = current - processed;
    const elapsedHours = Number((elapsedMs / (1000 * 3600)).toFixed(1));
    const remainingHours = Number((shelfLifeHours - elapsedHours).toFixed(1));
    
    let remainingPercent = Number(((remainingHours / shelfLifeHours) * 100).toFixed(1));
    if (remainingPercent < 0) remainingPercent = 0;
    if (remainingPercent > 100) remainingPercent = 100;

    let status: 'Seguro' | 'Atenção' | 'Crítico' | 'Expirado';
    if (remainingHours <= 0) {
      status = 'Expirado';
    } else if (remainingHours <= 24 || remainingPercent <= 25) {
      status = 'Crítico';
    } else if (remainingPercent <= 50) {
      status = 'Atenção';
    } else {
      status = 'Seguro';
    }

    return {
      elapsedHours,
      remainingHours,
      remainingPercent,
      status
    };
  }, []);

  // CRUD Filiais Handlers
  const handleAddFilial = (newFilial: Omit<Filial, 'id_filial'>) => {
    setFiliais((prev) => {
      const nextId = prev.reduce((max, f) => f.id_filial > max ? f.id_filial : max, 0) + 1;
      return [...prev, { ...newFilial, id_filial: nextId }];
    });
  };

  const handleEditFilial = (id_filial: number, updated: Partial<Filial>) => {
    setFiliais((prev) => prev.map(f => f.id_filial === id_filial ? { ...f, ...updated } : f));
  };

  const handleDeleteFilial = (id_filial: number) => {
    setFiliais((prev) => prev.filter(f => f.id_filial !== id_filial));
    // Also cascades: remove batches associated with that filial
    setLotes((prev) => prev.filter(l => l.id_filial !== id_filial));
  };

  // CRUD Produtos Handlers
  const handleAddProduto = (newProd: Omit<Produto, 'id_produto'>) => {
    setProdutos((prev) => {
      const nextId = prev.reduce((max, p) => p.id_produto > max ? p.id_produto : max, 0) + 1;
      return [...prev, { ...newProd, id_produto: nextId }];
    });
  };

  const handleEditProduto = (id_produto: number, updated: Partial<Produto>) => {
    setProdutos((prev) => prev.map(p => p.id_produto === id_produto ? { ...p, ...updated } : p));
  };

  const handleDeleteProduto = (id_produto: number) => {
    setProdutos((prev) => prev.filter(p => p.id_produto !== id_produto));
    // Cascades: remove batches associated with that product
    setLotes((prev) => prev.filter(l => l.id_produto !== id_produto));
  };

  // CRUD Lotes Handlers
  const handleAddLote = (newLote: Omit<LoteEstoque, 'id_lote'>) => {
    setLotes((prev) => {
      const nextId = prev.reduce((max, l) => l.id_lote > max ? l.id_lote : max, 0) + 1;
      return [...prev, { ...newLote, id_lote: nextId }];
    });
  };

  const handleEditLote = (id_lote: number, updated: Partial<LoteEstoque>) => {
    setLotes((prev) => prev.map(l => l.id_lote === id_lote ? { ...l, ...updated } : l));
  };

  const handleDeleteLote = (id_lote: number) => {
    setLotes((prev) => prev.filter(l => l.id_lote !== id_lote));
  };

  // Reset to seed SQL constraints
  const handleResetDatabase = () => {
    if (confirm('Aviso: Isso restaurará todos os registros ao estado original do script SQL fornecido (Seed). Continuar?')) {
      setFiliais(INITIAL_FILIAIS);
      setProdutos(INITIAL_PRODUTOS);
      setLotes(INITIAL_LOTES);
      setAppTime('2026-06-06T00:23:08Z');
      setIsClockRunning(false);
      localStorage.removeItem('qualiflv_filiais');
      localStorage.removeItem('qualiflv_produtos');
      localStorage.removeItem('qualiflv_lotes');
      localStorage.removeItem('qualiflv_apptime');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans transition-colors duration-200">
      
      {/* Navigation Top Header branding & Relógio */}
      <Header 
        appTime={appTime} 
        setAppTime={setAppTime} 
        isClockRunning={isClockRunning}
        setIsClockRunning={setIsClockRunning}
        onResetDatabase={handleResetDatabase}
      />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col space-y-6">

        {/* Tab Selection Row BAR */}
        <nav className="flex flex-col sm:flex-row bg-white border border-slate-200 p-1.5 rounded-xl gap-1 shadow-3xs">
          
          <button
            id="tab-btn-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center justify-center space-x-2 text-xs font-semibold px-4 py-3 rounded-lg transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Métricas e Painel</span>
          </button>

          <button
            id="tab-btn-lotes"
            onClick={() => setActiveTab('lotes')}
            className={`flex items-center justify-center space-x-2 text-xs font-semibold px-4 py-3 rounded-lg transition-all cursor-pointer ${
              activeTab === 'lotes'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Lotes (`lotes_estoque`)</span>
          </button>

          <button
            id="tab-btn-produtos"
            onClick={() => setActiveTab('produtos')}
            className={`flex items-center justify-center space-x-2 text-xs font-semibold px-4 py-3 rounded-lg transition-all cursor-pointer ${
              activeTab === 'produtos'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Apple className="h-4 w-4" />
            <span>Produtos (`produtos`)</span>
          </button>

          <button
            id="tab-btn-filiais"
            onClick={() => setActiveTab('filiais')}
            className={`flex items-center justify-center space-x-2 text-xs font-semibold px-4 py-3 rounded-lg transition-all cursor-pointer ${
              activeTab === 'filiais'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Building className="h-4 w-4" />
            <span>Centrais/Filiais (`filiais`)</span>
          </button>

          <button
            id="tab-btn-sql"
            onClick={() => setActiveTab('sql')}
            className={`flex items-center justify-center space-x-2 text-xs font-semibold px-4 py-3 rounded-lg transition-all cursor-pointer sm:ml-auto ${
              activeTab === 'sql'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-850 hover:bg-slate-50'
            }`}
          >
            <Terminal className="h-4 w-4 text-emerald-400" />
            <span>Simulador Terminal SQL</span>
          </button>

        </nav>

        {/* Informative summary bar relating GUI fields with the underlying database schema */}
        <div className="bg-emerald-50/45 border border-emerald-100 p-3 px-4 rounded-xl flex items-start space-x-2 text-[11px] leading-relaxed text-emerald-800">
          <Info className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
          <p>
            <strong>Mapeamento Relacional Ativo:</strong> Use as abas para cadastrar, editar e remover elementos das tabelas 
            do banco de dados. Qualquer alteração atualizará dinamicamente os resultados de consultas JOIN e GROUP BY no 
            <strong> Simulador Terminal SQL</strong>. Experimente alterar dados e ver o SQL computar em tempo real.
          </p>
        </div>

        {/* Tab Views Container */}
        <main className="flex-1">
          {activeTab === 'dashboard' && (
            <DashboardTab 
              filiais={filiais} 
              produtos={produtos} 
              lotes={lotes} 
              appTime={appTime} 
              calculateDynamicStatus={calculateDynamicStatus}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'lotes' && (
            <LotesTab 
              filiais={filiais}
              produtos={produtos}
              lotes={lotes}
              appTime={appTime}
              calculateDynamicStatus={calculateDynamicStatus}
              onAddLote={handleAddLote}
              onEditLote={handleEditLote}
              onDeleteLote={handleDeleteLote}
            />
          )}

          {activeTab === 'produtos' && (
            <ProdutosTab 
              produtos={produtos}
              onAddProduto={handleAddProduto}
              onEditProduto={handleEditProduto}
              onDeleteProduto={handleDeleteProduto}
            />
          )}

          {activeTab === 'filiais' && (
            <FiliaisTab 
              filiais={filiais}
              onAddFilial={handleAddFilial}
              onEditFilial={handleEditFilial}
              onDeleteFilial={handleDeleteFilial}
            />
          )}

          {activeTab === 'sql' && (
            <SqlTab 
              filiais={filiais}
              produtos={produtos}
              lotes={lotes}
              appTime={appTime}
              calculateDynamicStatus={calculateDynamicStatus}
            />
          )}
        </main>

      </div>

      {/* Modern, clean footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-5 text-center text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>QualiFLV &copy; 2026 — Controle de Qualidade Hortifrúti S/A</span>
          <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-400">
            <span>MySQL Schema / Relacional</span>
            <span>•</span>
            <span>Estoque Consolidado</span>
            <span>•</span>
            <span>Terminal Port 3000</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
