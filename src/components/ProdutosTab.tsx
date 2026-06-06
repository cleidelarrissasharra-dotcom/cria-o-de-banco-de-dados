/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Produto } from '../types';
import { 
  Apple, 
  Trash2, 
  Plus, 
  Search, 
  Tag, 
  Clock, 
  X,
  Edit2,
  Bookmark
} from 'lucide-react';

interface ProdutosTabProps {
  produtos: Produto[];
  onAddProduto: (prod: Omit<Produto, 'id_produto'>) => void;
  onEditProduto: (id_produto: number, updated: Partial<Produto>) => void;
  onDeleteProduto: (id_produto: number) => void;
}

export function ProdutosTab({
  produtos,
  onAddProduto,
  onEditProduto,
  onDeleteProduto
}: ProdutosTabProps) {

  // Search filter
  const [productSearch, setProductSearch] = useState('');

  // Editing state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProdId, setEditingProdId] = useState<number | null>(null);

  // Form states
  const [fNome, setFNome] = useState('');
  const [fCategoria, setFCategoria] = useState('Fruta');
  const [fShelfLife, setFShelfLife] = useState<number>(72);

  const openNewForm = () => {
    setEditingProdId(null);
    setFNome('');
    setFCategoria('Fruta');
    setFShelfLife(72);
    setIsFormOpen(true);
  };

  const openEditForm = (p: Produto) => {
    setEditingProdId(p.id_produto);
    setFNome(p.nome_produto);
    setFCategoria(p.categoria);
    setFShelfLife(p.shelf_life_horas);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fNome.trim() === '') return;

    const payload = {
      nome_produto: fNome.trim(),
      categoria: fCategoria,
      shelf_life_horas: Number(fShelfLife)
    };

    if (editingProdId !== null) {
      onEditProduto(editingProdId, payload);
    } else {
      onAddProduto(payload);
    }
    setIsFormOpen(false);
  };

  const filteredProdutos = produtos.filter(p => {
    const q = productSearch.toLowerCase();
    return p.nome_produto.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Barra superior de ações */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-3xs flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Campo busca */}
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            id="input-produtos-search"
            type="text"
            placeholder="Buscar produto ou categoria..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-250 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/55"
          />
        </div>

        <button
          id="btn-register-produto"
          onClick={openNewForm}
          className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4.5 py-2.5 rounded-lg shadow-2xs hover:shadow-xs transition-all cursor-pointer w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4" />
          <span>Cadastrar Produto FLV</span>
        </button>

      </div>

      {/* Grid de Cards de Produtos catalogados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredProdutos.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 p-12 text-center text-slate-400 rounded-xl space-y-2">
            <Apple className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-600">Nenhum produto cadastrado.</p>
            <p className="text-2xs text-slate-400">Cadastre um novo item clicando no botão para popular a tabela `produtos`.</p>
          </div>
        ) : (
          filteredProdutos.map(p => (
            <div 
              key={p.id_produto}
              className="bg-white border border-slate-200/80 hover:border-emerald-250 rounded-xl p-4.5 shadow-3xs hover:shadow-2xs transition-all flex flex-col justify-between h-40"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    ID #{p.id_produto}
                  </span>
                  
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    p.categoria === 'Fruta' 
                      ? 'bg-amber-50 text-amber-700 border border-amber-100'
                      : p.categoria === 'Verdura'
                      ? 'bg-green-50 text-green-700 border border-green-100'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  }`}>
                    {p.categoria}
                  </span>
                </div>

                <h4 className="font-bold text-slate-800 text-sm mt-2.5 truncate" title={p.nome_produto}>
                  {p.nome_produto}
                </h4>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs mt-3">
                <div className="flex items-center text-slate-500 space-x-1">
                  <Clock className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="font-semibold text-slate-800">{p.shelf_life_horas} horas</span>
                  <span className="text-slate-400 text-[10px]">({Math.round(p.shelf_life_horas / 24)} dias)</span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    id={`btn-edit-prod-${p.id_produto}`}
                    onClick={() => openEditForm(p)}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 rounded hover:bg-slate-50 cursor-pointer"
                    title="Editar Produto"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    id={`btn-delete-prod-${p.id_produto}`}
                    onClick={() => {
                      if (confirm(`Deseja realmente deletar ${p.nome_produto}?`)) {
                        onDeleteProduto(p.id_produto);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50/50 cursor-pointer"
                    title="Deletar Produto"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Form Dialog Box */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 text-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden animate-scaleIn">
            <div className="bg-emerald-800 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingProdId !== null ? `Editar Produto #${editingProdId}` : 'Adicionar Produto Hortifrúti'}
              </h3>
              <button 
                id="btn-close-prod-form"
                onClick={() => setIsFormOpen(false)} 
                className="text-white/85 hover:text-white hover:bg-white/10 rounded-full p-1 cursor-pointer transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              
              {/* Nome */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">Nome do Produto:</label>
                <input
                  id="form-prod-nome"
                  type="text"
                  required
                  placeholder="Ex: Alface Crespa Higienizada"
                  value={fNome}
                  onChange={(e) => setFNome(e.target.value)}
                  className="w-full border border-slate-250 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden text-slate-800"
                />
              </div>

              {/* Categoria */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">Categoria FLV:</label>
                <select
                  id="form-prod-categoria"
                  value={fCategoria}
                  onChange={(e) => setFCategoria(e.target.value)}
                  className="w-full border border-slate-250 p-2.5 rounded-lg text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
                >
                  <option value="Fruta">Fruta</option>
                  <option value="Verdura">Verdura</option>
                  <option value="Legume">Legume</option>
                </select>
              </div>

              {/* Shelf-Life em horas */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">Estime o Shelf-Life (Vida útil em horas):</label>
                <div className="flex items-center space-x-2">
                  <input
                    id="form-prod-shelfhours"
                    type="number"
                    min="1"
                    max="1000"
                    required
                    value={fShelfLife}
                    onChange={(e) => setFShelfLife(parseInt(e.target.value) || 0)}
                    className="w-2/3 border border-slate-250 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden text-slate-800"
                  />
                  <div className="w-1/3 bg-slate-50 border border-slate-200 py-2.5 px-3 rounded-lg text-center font-medium text-slate-600">
                    ~{(fShelfLife / 24).toFixed(1)} dias
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Tempo estimado padrão decorrido antes de atingir o status Expirado.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  id="btn-cancel-prod-form"
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 hover:bg-slate-100 text-slate-500 font-semibold rounded-lg cursor-pointer transition"
                >
                  Cancelar
                </button>
                <button
                  id="btn-save-prod"
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-2xs hover:shadow-xs cursor-pointer transition animate-pulseOnce"
                >
                  Salvar Produto
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
