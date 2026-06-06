/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Filial, LoteEstoque, Produto } from '../types';
import { 
  Package, 
  Trash2, 
  Plus, 
  Search, 
  Tag, 
  Building, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  X,
  FileSpreadsheet,
  Edit2
} from 'lucide-react';

interface LotesTabProps {
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
  onAddLote: (lote: Omit<LoteEstoque, 'id_lote'>) => void;
  onEditLote: (id_lote: number, updated: Partial<LoteEstoque>) => void;
  onDeleteLote: (id_lote: number) => void;
}

export function LotesTab({
  filiais,
  produtos,
  lotes,
  appTime,
  calculateDynamicStatus,
  onAddLote,
  onEditLote,
  onDeleteLote
}: LotesTabProps) {
  
  // App states
  const [filterFilial, setFilterFilial] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Editing state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLoteId, setEditingLoteId] = useState<number | null>(null);

  // Form states
  const [fFilialId, setFFilialId] = useState<number>(filiais[0]?.id_filial || 0);
  const [fProdutoId, setFProdutoId] = useState<number>(produtos[0]?.id_produto || 0);
  const [fQuantidade, setFQuantidade] = useState<number>(100);
  const [fData, setFData] = useState<string>(new Date(appTime).toISOString().substring(0, 16));
  const [fStatusManual, setFStatusManual] = useState<'Seguro' | 'Atenção' | 'Crítico' | 'Expirado'>('Seguro');

  const openNewForm = () => {
    setEditingLoteId(null);
    setFFilialId(filiais[0]?.id_filial || 0);
    setFProdutoId(produtos[0]?.id_produto || 0);
    setFQuantidade(100);
    // Use simulated time rounded for input
    setFData(new Date(appTime).toISOString().substring(0, 16));
    setFStatusManual('Seguro');
    setIsFormOpen(true);
  };

  const openEditForm = (l: LoteEstoque) => {
    setEditingLoteId(l.id_lote);
    setFFilialId(l.id_filial);
    setFProdutoId(l.id_produto);
    setFQuantidade(l.quantidade_kg);
    try {
      setFData(new Date(l.data_processamento).toISOString().substring(0, 16));
    } catch {
      setFData(new Date(appTime).toISOString().substring(0, 16));
    }
    setFStatusManual(l.status_validade);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-calculate dynamic status based on standard database shelf life parameters to seed initial
    const chosenProduct = produtos.find(p => p.id_produto === fProdutoId);
    let calculatedVal = fStatusManual;
    if (chosenProduct) {
      const formattedDate = new Date(fData).toISOString();
      const calcInfo = calculateDynamicStatus(formattedDate, chosenProduct.shelf_life_horas, appTime);
      calculatedVal = calcInfo.status;
    }

    const payload = {
      id_filial: fFilialId,
      id_produto: fProdutoId,
      data_processamento: new Date(fData).toISOString(),
      quantidade_kg: Number(fQuantidade),
      status_validade: calculatedVal
    };

    if (editingLoteId !== null) {
      onEditLote(editingLoteId, payload);
    } else {
      onAddLote(payload);
    }
    setIsFormOpen(false);
  };

  // List batches with filters applied
  const filteredLotes = lotes.filter(l => {
    // 1. Filial filter
    if (filterFilial !== 'all' && l.id_filial !== parseInt(filterFilial)) {
      return false;
    }

    const p = produtos.find(prod => prod.id_produto === l.id_produto);
    const calculated = p ? calculateDynamicStatus(l.data_processamento, p.shelf_life_horas, appTime) : null;
    const activeStatus = calculated ? calculated.status : l.status_validade;

    // 2. Status filter
    if (filterStatus !== 'all' && activeStatus !== filterStatus) {
      return false;
    }

    // 3. Text search products or category or filial
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchProduct = p?.nome_produto.toLowerCase().includes(q);
      const matchCat = p?.categoria.toLowerCase().includes(q);
      const f = filiais.find(fil => fil.id_filial === l.id_filial);
      const matchFilial = f?.nome_filial.toLowerCase().includes(q) || f?.cidade.toLowerCase().includes(q);

      return matchProduct || matchCat || matchFilial;
    }

    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Barra de Filtros e Cadastro */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-3xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-72">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            id="input-lotes-search"
            type="text"
            placeholder="Buscar lote, produto ou filial..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-250 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/55"
          />
        </div>

        {/* Filtros Dropdown */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          {/* Filial */}
          <div className="flex items-center space-x-1.5 text-xs w-full sm:w-auto">
            <span className="text-slate-400 font-medium">Filial:</span>
            <select
              id="select-filter-filial"
              value={filterFilial}
              onChange={(e) => setFilterFilial(e.target.value)}
              className="border border-slate-250 rounded-lg py-1.5 px-3 bg-white text-xs text-slate-700 min-w-[130px]"
            >
              <option value="all">Todas as Filiais</option>
              {filiais.map(f => (
                <option key={f.id_filial} value={f.id_filial}>{f.nome_filial}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="flex items-center space-x-1.5 text-xs w-full sm:w-auto">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              id="select-filter-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-slate-250 rounded-lg py-1.5 px-3 bg-white text-xs text-slate-700"
            >
              <option value="all">Todos os Status</option>
              <option value="Seguro">Seguro</option>
              <option value="Atenção">Atenção</option>
              <option value="Crítico">Crítico</option>
              <option value="Expirado">Expirado</option>
            </select>
          </div>

          <button
            id="btn-register-lote"
            onClick={openNewForm}
            className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-2xs hover:shadow-xs transition cursor-pointer w-full sm:w-auto justify-center"
          >
            <Plus className="h-4 w-4" />
            <span>Cadastrar Lote</span>
          </button>
        </div>

      </div>

      {/* Tabela de Lotes Cadastrados */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-3xs">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="h-4.5 w-4.5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-sm">Lotes de Estoque Processados (`lotes_estoque`)</h3>
          </div>
          <span className="text-2xs font-mono text-slate-400 bg-slate-50 px-2.5 py-1 rounded border border-slate-150">
            {filteredLotes.length} de {lotes.length} registros cadastrados
          </span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-5">ID Lote</th>
                <th className="py-3 px-4">Filial / Unidade</th>
                <th className="py-3 px-4">Produto Processado</th>
                <th className="py-3 px-4">Data Processamento</th>
                <th className="py-3 px-4">Peso (KG)</th>
                <th className="py-3 px-4">Decaimento / Shelf-Life</th>
                <th className="py-3 px-4 text-center">Status Vencimento</th>
                <th className="py-3 px-5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60 font-medium text-slate-700">
              {filteredLotes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-450 font-medium space-y-2">
                    <Package className="h-10 w-10 text-slate-300 mx-auto" />
                    <p>Nenhum lote foi encontrado para os filtros selecionados.</p>
                    <p className="text-2xs text-slate-400">
                      Tente redefinir o campo de busca ou cadastre um novo lote estoque acima!
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLotes.map(l => {
                  const p = produtos.find(prod => prod.id_produto === l.id_produto);
                  const f = filiais.find(fil => fil.id_filial === l.id_filial);
                  
                  // Compute dynamic shelf-life metrics
                  const calc = p ? calculateDynamicStatus(l.data_processamento, p.shelf_life_horas, appTime) : null;
                  const activeStatus = calc ? calc.status : l.status_validade;

                  return (
                    <tr key={l.id_lote} className="hover:bg-slate-50/40 transition-all">
                      <td className="py-3.5 px-5 font-mono text-slate-400">#{l.id_lote}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800">{f ? f.nome_filial : `Sem ID ${l.id_filial}`}</span>
                          <span className="text-[10px] text-slate-400">{f ? f.cidade : 'Cidade desconhecida'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800">{p ? p.nome_produto : `Sem ID ${l.id_produto}`}</span>
                          <div className="flex items-center space-x-1.5 mt-0.5">
                            <span className="bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.2 rounded">
                              {p ? p.categoria : 'Custo'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Shelf life: {p ? p.shelf_life_horas : 0}h
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 text-2xs">
                        {new Date(l.data_processamento).toISOString().replace('T', ' ').substring(0, 16)}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{l.quantidade_kg.toFixed(2)} Kg</td>
                      
                      <td className="py-3.5 px-4">
                        {p && calc ? (
                          <div className="space-y-1 w-full max-w-[120px]">
                            <div className="flex justify-between items-center text-[10px]">
                              {calc.status === 'Expirado' ? (
                                <span className="text-slate-500 font-bold">Excedido</span>
                              ) : (
                                <span className="text-slate-600 font-medium">{calc.remainingHours}h restantes</span>
                              )}
                              <span className="text-slate-400">{calc.remainingPercent}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-150 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-300 ${
                                  calc.status === 'Expirado'
                                    ? 'bg-slate-400'
                                    : calc.status === 'Crítico'
                                    ? 'bg-rose-500'
                                    : calc.status === 'Atenção'
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${calc.status === 'Expirado' ? 100 : calc.remainingPercent}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          activeStatus === 'Expirado'
                            ? 'bg-slate-900 text-white border-slate-850'
                            : activeStatus === 'Crítico'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : activeStatus === 'Atenção'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-green-50 text-green-700 border-green-200'
                        }`}>
                          {activeStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            id={`btn-edit-lote-${l.id_lote}`}
                            onClick={() => openEditForm(l)}
                            className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded transition cursor-pointer"
                            title="Editar Lote"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            id={`btn-delete-lote-${l.id_lote}`}
                            onClick={() => {
                              if (confirm('Deseja realmente deletar este lote de estoque?')) {
                                onDeleteLote(l.id_lote);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 rounded transition cursor-pointer"
                            title="Deletar Lote"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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
      </div>

      {/* Form Dialog Expander */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-scaleIn">
            <div className="bg-emerald-800 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingLoteId !== null ? `Editar Lote #${editingLoteId}` : 'Registrar Novo Lote de Estoque'}
              </h3>
              <button 
                id="btn-close-lote-form"
                onClick={() => setIsFormOpen(false)} 
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1 cursor-pointer transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4 text-xs">
              
              {/* Filial */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">Selecione a Filial Unidade:</label>
                <select
                  id="form-lote-filial"
                  value={fFilialId}
                  onChange={(e) => setFFilialId(parseInt(e.target.value))}
                  className="w-full border border-slate-250 p-2.5 rounded-lg text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
                >
                  {filiais.map(f => (
                    <option key={f.id_filial} value={f.id_filial}>{f.nome_filial} ({f.cidade})</option>
                  ))}
                </select>
              </div>

              {/* Produto */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">Selecione o Produto FLV:</label>
                <select
                  id="form-lote-produto"
                  value={fProdutoId}
                  onChange={(e) => setFProdutoId(parseInt(e.target.value))}
                  className="w-full border border-slate-250 p-2.5 rounded-lg text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
                >
                  {produtos.map(p => (
                    <option key={p.id_produto} value={p.id_produto}>
                      {p.nome_produto} — {p.categoria} (Shelf life: {p.shelf_life_horas}h)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Quantidade */}
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">Quantidade (KG):</label>
                  <input
                    id="form-lote-quantidade"
                    type="number"
                    step="0.01"
                    min="0.1"
                    required
                    value={fQuantidade}
                    onChange={(e) => setFQuantidade(parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-250 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden text-slate-800"
                  />
                </div>

                {/* Status Manual backup */}
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">Status Fallback (Fixo):</label>
                  <select
                    id="form-lote-status"
                    value={fStatusManual}
                    onChange={(e: any) => setFStatusManual(e.target.value)}
                    className="w-full border border-slate-250 p-2.5 rounded-lg text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
                  >
                    <option value="Seguro">Seguro</option>
                    <option value="Atenção">Atenção</option>
                    <option value="Crítico">Crítico</option>
                    <option value="Expirado">Expirado</option>
                  </select>
                </div>
              </div>

              {/* Data Processamento */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">Data & Hora de Embalagem / Processamento:</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Calendar className="h-4 w-4" />
                  </span>
                  <input
                    id="form-lote-data"
                    type="datetime-local"
                    required
                    value={fData}
                    onChange={(e) => setFData(e.target.value)}
                    className="w-full pl-9 border border-slate-250 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden text-slate-800"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Padrão: preenchido com a hora do relógio simulado.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  id="btn-cancel-lote-form"
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 hover:bg-slate-100 text-slate-500 font-semibold rounded-lg cursor-pointer transition"
                >
                  Cancelar
                </button>
                <button
                  id="btn-save-lote"
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-2xs hover:shadow-xs cursor-pointer transition"
                >
                  Salvar Lote
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
