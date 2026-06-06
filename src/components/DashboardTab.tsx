/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Filial, Produto, LoteEstoque } from '../types';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  TrendingUp, 
  Building, 
  Layers, 
  AlertOctagon, 
  CornerDownRight, 
  ArrowRight,
  ShieldCheck,
  Percent
} from 'lucide-react';

interface DashboardTabProps {
  filiais: Filial[];
  produtos: Produto[];
  lotes: LoteEstoque[];
  appTime: string;
  calculateDynamicStatus: (processedTimeStr: string, shelfLifeHours: number, currentAppTimeIso: string) => {
    elapsedHours: number;
    remainingHours: number;
    remainingPercent: number;
    status: 'Seguro' | 'Atenção' | 'Crítico' | 'Expirado';
  };
  setActiveTab: (tab: 'dashboard' | 'lotes' | 'produtos' | 'filiais' | 'sql') => void;
}

export function DashboardTab({
  filiais,
  produtos,
  lotes,
  appTime,
  calculateDynamicStatus,
  setActiveTab
}: DashboardTabProps) {

  // Process data for dashboard
  let totalKg = 0;
  let countSeguro = 0;
  let countAtencao = 0;
  let countCritico = 0;
  let countExpirado = 0;

  // Track alerts
  const alertLotes: Array<{
    lote: LoteEstoque;
    product: Produto;
    branch: Filial;
    remainingHours: number;
    remainingPercent: number;
    status: string;
  }> = [];

  lotes.forEach(l => {
    totalKg += l.quantidade_kg;
    const prod = produtos.find(p => p.id_produto === l.id_produto);
    const branch = filiais.find(f => f.id_filial === l.id_filial);

    if (prod) {
      const calc = calculateDynamicStatus(l.data_processamento, prod.shelf_life_horas, appTime);
      
      if (calc.status === 'Seguro') countSeguro++;
      else if (calc.status === 'Atenção') countAtencao++;
      else if (calc.status === 'Crítico') countCritico++;
      else if (calc.status === 'Expirado') countExpirado++;

      // If urgent (Atenção, Crítico, Expirado), push to alerts
      if (calc.status !== 'Seguro') {
        alertLotes.push({
          lote: l,
          product: prod,
          branch: branch || { id_filial: 0, nome_filial: 'Não especificada', cidade: 'Indefinida' },
          remainingHours: calc.remainingHours,
          remainingPercent: calc.remainingPercent,
          status: calc.status
        });
      }
    } else {
      countSeguro++; // safe fallback
    }
  });

  // Sort alert lotes by worst remaining hours
  alertLotes.sort((a, b) => a.remainingHours - b.remainingHours);

  // Group total volume by category
  const volumesByCategory: Record<string, number> = { 'Fruta': 0, 'Legume': 0, 'Verdura': 0 };
  lotes.forEach(l => {
    const prod = produtos.find(p => p.id_produto === l.id_produto);
    if (prod) {
      const cat = prod.categoria;
      if (volumesByCategory[cat] !== undefined) {
        volumesByCategory[cat] += l.quantidade_kg;
      } else {
        volumesByCategory[cat] = (volumesByCategory[cat] || 0) + l.quantidade_kg;
      }
    }
  });

  // Group total volume by branch name
  const volumesByBranch: Record<string, number> = {};
  filiais.forEach(f => {
    volumesByBranch[f.nome_filial] = 0;
  });
  lotes.forEach(l => {
    const branch = filiais.find(f => f.id_filial === l.id_filial);
    if (branch) {
      volumesByBranch[branch.nome_filial] = (volumesByBranch[branch.nome_filial] || 0) + l.quantidade_kg;
    }
  });

  // Safe checks for rendering custom SVG charts
  const categoriesList = Object.entries(volumesByCategory);
  const maxCategoryWeight = Math.max(...categoriesList.map(c => c[1]), 1);

  const branchesList = Object.entries(volumesByBranch);
  const maxBranchWeight = Math.max(...branchesList.map(b => b[1]), 1);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Banner Seeding Info */}
      <div className="bg-slate-100 border border-slate-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Métricas e Alertas Hortifrúti</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cálculo dinâmico baseado em horas programadas (`shelf_life_horas`) versus a hora atual do relógio do simulador.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            id="btn-go-lotes"
            onClick={() => setActiveTab('lotes')}
            className="flex items-center space-x-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-3.5 py-1.5 rounded-lg shadow-2xs transition-all cursor-pointer"
          >
            <span>Novo Lote</span>
            <ArrowRight className="h-3 w-3" />
          </button>
          <button
            id="btn-go-sql"
            onClick={() => setActiveTab('sql')}
            className="flex items-center space-x-1.5 text-xs bg-slate-800 hover:bg-slate-900 text-white font-medium px-3.5 py-1.5 rounded-lg shadow-2xs transition-all cursor-pointer"
          >
            <span>Executar Consulta SQL</span>
          </button>
        </div>
      </div>

      {/* Grid de Cards KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Estocado */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-3xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xs font-semibold uppercase tracking-wider text-slate-400">Total Estocado</p>
            <p className="text-lg font-bold text-slate-800">{totalKg.toFixed(1)} Kg</p>
            <p className="text-4xs text-slate-400 mt-0.5">{lotes.length} lotes rastreados</p>
          </div>
        </div>

        {/* Seguro */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-3xs flex items-center space-x-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xs font-semibold uppercase tracking-wider text-slate-400">Status Seguro</p>
            <p className="text-lg font-bold text-green-600">{countSeguro}</p>
            <p className="text-4xs text-slate-400 mt-0.5">Lotes em condições ideais</p>
          </div>
        </div>

        {/* Atenção */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-3xs flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xs font-semibold uppercase tracking-wider text-slate-400">Atenção (&lt;50% Life)</p>
            <p className="text-lg font-bold text-amber-600">{countAtencao}</p>
            <p className="text-4xs text-slate-400 mt-0.5">Ações preventivas recomendadas</p>
          </div>
        </div>

        {/* Crítico */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-3xs flex items-center space-x-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
            <AlertOctagon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xs font-semibold uppercase tracking-wider text-slate-400">Crítico (&lt;24 horas)</p>
            <p className="text-lg font-bold text-rose-600">{countCritico}</p>
            <p className="text-4xs text-slate-400 mt-0.5">Venda imediata ou descarte próximo</p>
          </div>
        </div>

        {/* Expirado */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-3xs flex items-center space-x-4">
          <div className="p-3 bg-slate-900 text-rose-400 rounded-lg">
            <AlertOctagon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xs font-semibold uppercase tracking-wider text-slate-400">Esgotado / Expirado</p>
            <p className="text-lg font-bold text-slate-900">{countExpirado}</p>
            <p className="text-4xs text-slate-400 mt-0.5">Shelf-Life excedido</p>
          </div>
        </div>

      </div>

      {/* Grid Principal do Painel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Lado Esquerdo: Alertas de Shelf-Life Próximos do Fim */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-3xs flex flex-col h-[400px]">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-rose-500" />
              <h3 className="font-bold text-slate-800 text-sm">Fila de Prioridade de Consumo (Alertas)</h3>
            </div>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-rose-600 bg-rose-50 border border-rose-200/50 px-2 py-0.5 rounded-full">
              {alertLotes.length} lotes em alerta
            </span>
          </div>

          <div className="overflow-y-auto flex-1 custom-scrollbar pr-1 space-y-3">
            {alertLotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <ShieldCheck className="h-10 w-10 text-emerald-500/80 mb-2" />
                <p className="text-sm font-medium">Nenhum lote crítico no momento.</p>
                <p className="text-xs text-slate-400 text-center max-w-[280px]">
                  Parabéns! Todos os lotes possuem tempo seguro de shelf life.
                </p>
              </div>
            ) : (
              alertLotes.map(({ lote, product, branch, remainingHours, remainingPercent, status }) => (
                <div 
                  key={lote.id_lote}
                  className={`p-3.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all ${
                    status === 'Expirado' 
                      ? 'bg-slate-50 border-slate-300 shadow-3xs'
                      : status === 'Crítico'
                      ? 'bg-rose-50/20 border-rose-100 hover:border-rose-200'
                      : 'bg-amber-50/20 border-amber-100 hover:border-amber-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800">{product.nome_produto}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                        status === 'Expirado'
                          ? 'bg-slate-900 text-white'
                          : status === 'Crítico'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 text-slate-500 text-[11px] gap-x-2">
                      <span className="flex items-center">
                        <Building className="h-3 w-3 mr-0.5" />
                        {branch.nome_filial}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span>Lote #{lote.id_lote}</span>
                      <span className="text-slate-300">•</span>
                      <span className="font-medium text-slate-700">{lote.quantidade_kg} Kg</span>
                    </div>
                  </div>

                  {/* Indicador visual de shelf-life restante */}
                  <div className="flex flex-col items-start sm:items-end min-w-[130px] justify-center">
                    {status === 'Expirado' ? (
                      <span className="font-bold text-slate-900 text-xs">Excedido há {Math.abs(remainingHours)}h</span>
                    ) : (
                      <span className={`font-bold text-xs ${status === 'Crítico' ? 'text-rose-600' : 'text-amber-600'}`}>
                        {remainingHours} horas restantes
                      </span>
                    )}
                    
                    <div className="w-full sm:w-[120px] h-1.5 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          status === 'Expirado' 
                            ? 'bg-slate-500 w-full' 
                            : status === 'Crítico' 
                            ? 'bg-rose-500' 
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${status === 'Expirado' ? 100 : remainingPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Lado Direito: Distribuição nas Centrais / Gráficos */}
        <div className="grid grid-cols-1 gap-6">
          
          {/* Distribuição por Categoria de FLV */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-3xs">
            <div className="pb-3 border-b border-slate-100 mb-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="h-4.5 w-4.5 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">Distribuição por Categoria (Kg)</h3>
              </div>
              <span className="text-2xs text-slate-400 font-mono">Visão Relacional</span>
            </div>

            <div className="space-y-4">
              {categoriesList.map(([cat, weight]) => {
                const percent = totalKg ? ((weight / totalKg) * 100) : 0;
                const barColor = cat === 'Fruta' ? 'bg-amber-500' : cat === 'Legume' ? 'bg-emerald-500' : 'bg-green-500';
                
                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700">{cat}</span>
                      <div className="space-x-1.5 text-slate-500">
                        <span className="font-bold text-slate-800">{weight.toFixed(1)} Kg</span>
                        <span>({percent.toFixed(1)}%)</span>
                      </div>
                    </div>
                    
                    <div className="w-full h-3 bg-slate-100 rounded-md overflow-hidden flex">
                      <div 
                        className={`h-full rounded-md transition-all duration-500 ${barColor}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Volume Rastreável por Filial de Abastecimento */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-3xs">
            <div className="pb-3 border-b border-slate-100 mb-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building className="h-4.5 w-4.5 text-slate-700" />
                <h3 className="font-bold text-slate-800 text-sm">Estoque por Unidades de Centrais</h3>
              </div>
              <span className="text-2xs text-slate-450 font-mono">INNER JOIN Active</span>
            </div>

            <div className="space-y-3 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
              {branchesList.map(([branchName, weight]) => {
                const percent = totalKg ? ((weight / totalKg) * 100) : 0;
                
                return (
                  <div key={branchName} className="flex items-center space-x-3 text-xs">
                    <span className="font-medium text-slate-600 w-2/5 truncate">{branchName}</span>
                    <div className="w-2/5 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-slate-600 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="font-bold text-slate-800 w-1/5 text-right">{weight.toFixed(1)} Kg</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
