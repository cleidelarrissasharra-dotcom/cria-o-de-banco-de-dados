/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Filial } from '../types';
import { 
  Building, 
  Trash2, 
  Plus, 
  MapPin, 
  Search, 
  X,
  Edit2,
  Navigation
} from 'lucide-react';

interface FiliaisTabProps {
  filiais: Filial[];
  onAddFilial: (f: Omit<Filial, 'id_filial'>) => void;
  onEditFilial: (id_filial: number, updated: Partial<Filial>) => void;
  onDeleteFilial: (id_filial: number) => void;
}

export function FiliaisTab({
  filiais,
  onAddFilial,
  onEditFilial,
  onDeleteFilial
}: FiliaisTabProps) {

  const [searchQuery, setSearchQuery] = useState('');

  // Editing states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFilialId, setEditingFilialId] = useState<number | null>(null);

  // Form inputs
  const [fNome, setFNome] = useState('');
  const [fCidade, setFCidade] = useState('');

  const openNewForm = () => {
    setEditingFilialId(null);
    setFNome('');
    setFCidade('');
    setIsFormOpen(true);
  };

  const openEditForm = (fil: Filial) => {
    setEditingFilialId(fil.id_filial);
    setFNome(fil.nome_filial);
    setFCidade(fil.cidade);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fNome.trim() === '' || fCidade.trim() === '') return;

    const payload = {
      nome_filial: fNome.trim(),
      cidade: fCidade.trim()
    };

    if (editingFilialId !== null) {
      onEditFilial(editingFilialId, payload);
    } else {
      onAddFilial(payload);
    }
    setIsFormOpen(false);
  };

  const filteredFiliais = filiais.filter(f => {
    const q = searchQuery.toLowerCase();
    return f.nome_filial.toLowerCase().includes(q) || f.cidade.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Search and Action Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-3xs flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            id="input-filiais-search"
            type="text"
            placeholder="Buscar filial por nome ou cidade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-250 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/55"
          />
        </div>

        <button
          id="btn-register-filial"
          onClick={openNewForm}
          className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4.5 py-2.5 rounded-lg shadow-2xs hover:shadow-xs transition-all cursor-pointer w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4" />
          <span>Cadastrar Unidade</span>
        </button>

      </div>

      {/* Main layout: Grid cards + Custom Mini Map HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: List of Branches (2/3 size) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredFiliais.length === 0 ? (
              <div className="col-span-full bg-white border border-slate-200 p-12 text-center text-slate-400 rounded-xl space-y-2">
                <Building className="h-10 w-10 text-slate-300 mx-auto animate-pulse" />
                <p className="font-semibold text-slate-600">Nenhuma filial cadastrada.</p>
                <p className="text-2xs text-slate-400">Insira sua central de coleta e logística.</p>
              </div>
            ) : (
              filteredFiliais.map(f => (
                <div 
                  key={f.id_filial}
                  className="bg-white border border-slate-200/80 hover:border-emerald-250 rounded-xl p-5 shadow-3xs hover:shadow-2xs transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                        <Building className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                          ID Filial #{f.id_filial}
                        </span>
                        <h4 className="font-bold text-slate-800 text-sm mt-0.5">{f.nome_filial}</h4>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs mt-4">
                    <span className="flex items-center text-slate-500 font-medium font-sans">
                      <MapPin className="h-3.5 w-3.5 text-rose-500 mr-1" />
                      {f.cidade}
                    </span>

                    <div className="flex items-center space-x-1">
                      <button
                        id={`btn-edit-filial-${f.id_filial}`}
                        onClick={() => openEditForm(f)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 rounded hover:bg-slate-50 cursor-pointer"
                        title="Editar Central"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        id={`btn-delete-filial-${f.id_filial}`}
                        onClick={() => {
                          if (confirm(`Deseja deletar a filial ${f.nome_filial}?`)) {
                            onDeleteFilial(f.id_filial);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50/50 cursor-pointer"
                        title="Deletar Central"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>

        {/* Right column: Logistics Route Simulator Map Indicator */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-3xs flex flex-col h-[300px]">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h4 className="font-bold text-slate-800 text-sm flex items-center">
              <Navigation className="h-4.5 w-4.5 text-emerald-600 mr-1.5" />
              Malha Logística de Distribuição
            </h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Pontos geográficos ativos no Hortifrúti cadastrado.
            </p>
          </div>

          <div className="bg-slate-900 rounded-lg flex-1 relative overflow-hidden flex flex-col justify-between p-3 select-none">
            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:16px_16px]"></div>

            {/* Simulated Radar Screen with registered pins */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center space-y-6">
              {filteredFiliais.map((f, i) => {
                // simple math to stagger coordinates for visual interest
                const offsetLeft = [40, 20, 70, 50, 80][i % 5];
                const offsetTop = [30, 60, 45, 75, 20][i % 5];
                
                return (
                  <div 
                    key={f.id_filial}
                    className="absolute flex items-center group cursor-pointer"
                    style={{ left: `${offsetLeft}%`, top: `${offsetTop}%` }}
                  >
                    <div className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-white"></span>
                    </div>
                    <div className="ml-1.5 bg-slate-800/90 text-[9px] text-white border border-slate-700 font-bold py-0.5 px-2 rounded backdrop-blur-xs whitespace-nowrap shadow-md group-hover:bg-emerald-600 group-hover:border-emerald-500 transition-all">
                      {f.cidade}
                    </div>
                  </div>
                );
              })}

              {filteredFiliais.length === 0 && (
                <p className="text-2xs text-slate-500 text-center uppercase tracking-widest">
                  Radar Logístico Offline
                </p>
              )}
            </div>

            {/* Footer with summary metadata */}
            <div className="relative z-10 bg-slate-800/40 border-t border-slate-800 p-1.5 flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <span>ESTRADAS DE ACESSO: LIVRES</span>
              <span>{filteredFiliais.length} PONTOS ATIVOS</span>
            </div>
          </div>
        </div>

      </div>

      {/* Form Overlay Box */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 text-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200/80 w-full max-w-sm overflow-hidden animate-scaleIn">
            <div className="bg-emerald-800 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingFilialId !== null ? `Editar Central #${editingFilialId}` : 'Criar Nova Central / Filial'}
              </h3>
              <button 
                id="btn-close-filial-form"
                onClick={() => setIsFormOpen(false)} 
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1 cursor-pointer transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              
              {/* Nome */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">Nome da Filial / Central:</label>
                <input
                  id="form-filial-nome"
                  type="text"
                  required
                  placeholder="Ex: Central Campinas ou Yard Leste"
                  value={fNome}
                  onChange={(e) => setFNome(e.target.value)}
                  className="w-full border border-slate-250 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden text-slate-800"
                />
              </div>

              {/* Cidade */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">Cidade Sede:</label>
                <input
                  id="form-filial-cidade"
                  type="text"
                  required
                  placeholder="Ex: Campinas ou São Paulo"
                  value={fCidade}
                  onChange={(e) => setFCidade(e.target.value)}
                  className="w-full border border-slate-250 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  id="btn-cancel-filial-form"
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 hover:bg-slate-100 text-slate-500 font-semibold rounded-lg cursor-pointer transition"
                >
                  Cancelar
                </button>
                <button
                  id="btn-save-filial"
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-2xs hover:shadow-xs cursor-pointer transition"
                >
                  Salvar Central
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
