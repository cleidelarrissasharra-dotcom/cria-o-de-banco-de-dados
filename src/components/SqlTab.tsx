/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Filial, LoteEstoque, Produto, SavedQuery } from '../types';
import { PREDEFINED_QUERIES } from '../initialData';
import { executeSql, SqlResult } from '../dbEngine';
import { 
  Database, 
  Terminal, 
  Play, 
  HelpCircle, 
  Grid, 
  CornerDownRight, 
  Layers, 
  BookOpen, 
  TableProperties, 
  AlertCircle,
  CheckCircle2,
  ListFilter
} from 'lucide-react';

interface SqlTabProps {
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
}

export function SqlTab({
  filiais,
  produtos,
  lotes,
  appTime,
  calculateDynamicStatus
}: SqlTabProps) {

  // SQL Editor States
  const [editorQuery, setEditorQuery] = useState(PREDEFINED_QUERIES[0].sql);
  const [selectedPredefinedId, setSelectedPredefinedId] = useState(PREDEFINED_QUERIES[0].id);
  const [sqlResult, setSqlResult] = useState<SqlResult | null>(null);
  const [activeSchemaTable, setActiveSchemaTable] = useState<string | null>(null);

  // Run the default query on load
  useEffect(() => {
    handleRunQuery(editorQuery);
  }, [filiais, produtos, lotes, appTime]); // rerun when base data or time changes to keep live sync!

  const handleRunQuery = (queryText: string) => {
    const result = executeSql(
      queryText,
      filiais,
      produtos,
      lotes,
      (l, p) => calculateDynamicStatus(l.data_processamento, p.shelf_life_horas, appTime).status
    );
    setSqlResult(result);
  };

  const handlePredefinedClick = (q: SavedQuery) => {
    setEditorQuery(q.sql);
    setSelectedPredefinedId(q.id);
    handleRunQuery(q.sql);
  };

  const handleTableQuickSelect = (tableName: string) => {
    const sql = `SELECT * FROM ${tableName};`;
    setEditorQuery(sql);
    setSelectedPredefinedId('custom');
    handleRunQuery(sql);
    setActiveSchemaTable(tableName);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fadeIn">
      
      {/* Left Column: DB Schema and Saved Queries Explorer (1/4 size) */}
      <div className="space-y-5 lg:col-span-1">
        
        {/* Table Schema Inspector */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-3xs">
          <h4 className="font-bold text-slate-800 text-xs flex items-center pb-2 border-b border-slate-100 mb-3 uppercase tracking-wider">
            <TableProperties className="h-4 w-4 text-emerald-600 mr-1.5" />
            Tabelas do Banco (`db_qualiflv`)
          </h4>

          <div className="space-y-3.5">
            
            {/* Table filiais */}
            <div>
              <button 
                id="btn-schema-filiais"
                onClick={() => handleTableQuickSelect('filiais')}
                className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-900 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100/60 p-1.5 px-2 rounded-md w-full text-left transition cursor-pointer"
              >
                <Database className="h-3.5 w-3.5 text-emerald-600" />
                <span className="font-mono">filiais</span>
              </button>
              <div className="pl-6 mt-1 space-y-0.5 text-[10px] text-slate-400 font-mono">
                <p>🔑 id_filial (INT, PK)</p>
                <p>🔹 nome_filial (VARCHAR)</p>
                <p>🔹 cidade (VARCHAR)</p>
              </div>
            </div>

            {/* Table produtos */}
            <div>
              <button 
                id="btn-schema-produtos"
                onClick={() => handleTableQuickSelect('produtos')}
                className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-900 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100/60 p-1.5 px-2 rounded-md w-full text-left transition cursor-pointer"
              >
                <Database className="h-3.5 w-3.5 text-emerald-600" />
                <span className="font-mono">produtos</span>
              </button>
              <div className="pl-6 mt-1 space-y-0.5 text-[10px] text-slate-400 font-mono">
                <p>🔑 id_produto (INT, PK)</p>
                <p>🔹 nome_produto (VARCHAR)</p>
                <p>🔹 categoria (VARCHAR)</p>
                <p>🔹 shelf_life_horas (INT)</p>
              </div>
            </div>

            {/* Table lotes_estoque */}
            <div>
              <button 
                id="btn-schema-lotes"
                onClick={() => handleTableQuickSelect('lotes_estoque')}
                className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-900 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100/60 p-1.5 px-2 rounded-md w-full text-left transition cursor-pointer"
              >
                <Database className="h-3.5 w-3.5 text-emerald-600" />
                <span className="font-mono">lotes_estoque</span>
              </button>
              <div className="pl-6 mt-1 space-y-0.5 text-[10px] text-slate-400 font-mono">
                <p>🔑 id_lote (INT, PK)</p>
                <p>🔗 id_filial (INT, FK)</p>
                <p>🔗 id_produto (INT, FK)</p>
                <p>📅 data_processamento (DATETIME)</p>
                <p>🔹 quantidade_kg (DECIMAL)</p>
                <p>🔸 status_validade (VARCHAR)</p>
              </div>
            </div>

          </div>
        </div>

        {/* List of Saved Queries */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-3xs space-y-2">
          <h4 className="font-bold text-slate-800 text-xs flex items-center pb-2 border-b border-slate-100 mb-2 uppercase tracking-wider">
            <BookOpen className="h-4 w-4 text-emerald-600 mr-1.5" />
            Exercícios de Consulta
          </h4>

          <div className="space-y-2.5">
            {PREDEFINED_QUERIES.map(q => {
              const isSelected = selectedPredefinedId === q.id;
              return (
                <button
                  key={q.id}
                  id={`btn-preset-query-${q.id}`}
                  onClick={() => handlePredefinedClick(q)}
                  className={`w-full text-left text-xs p-2.5 rounded-lg border text-slate-700 transition cursor-pointer flex flex-col space-y-1 ${
                    isSelected 
                      ? 'border-emerald-500 bg-emerald-50/45 text-emerald-900' 
                      : 'border-slate-150 hover:border-slate-350 hover:bg-slate-50/50'
                  }`}
                >
                  <span className="font-bold font-sans text-[11px] leading-tight block">{q.title}</span>
                  <span className="text-[10px] text-slate-400 font-medium leading-normal line-clamp-2">
                    {q.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Right Column: SQL Editor Terminal and Query Table Outputs Grid (3/4 size) */}
      <div className="lg:col-span-3 space-y-5">
        
        {/* Terminal Area */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-md flex flex-col">
          
          {/* Header */}
          <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="h-4 w-4 text-emerald-400" />
              <span className="text-white text-xs font-bold font-mono">Editor SQL Interativo</span>
            </div>

            <button
              id="btn-run-sql-query"
              onClick={() => handleRunQuery(editorQuery)}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98] text-white text-2xs font-bold px-3.5 py-1.5 rounded-md shadow-2xs transition-all cursor-pointer font-mono"
            >
              <Play className="h-3 w-3 fill-current" />
              <span>RUN QUERY (F5)</span>
            </button>
          </div>

          {/* Code text-area */}
          <div className="flex-1 relative">
            <textarea
              id="textarea-sql-editor"
              spellCheck={false}
              value={editorQuery}
              onChange={(e) => setEditorQuery(e.target.value)}
              placeholder="Digite sua consulta SQL aqui... Ex: SELECT * FROM produtos WHERE categoria = 'Fruta';"
              className="w-full h-44 bg-slate-950 text-emerald-400 font-mono text-xs p-4 focus:outline-hidden focus:ring-0 resize-y border-none leading-relaxed custom-scrollbar selection:bg-emerald-900 selection:text-white"
            />
          </div>

          {/* Info tray */}
          <div className="bg-slate-800/80 border-t border-slate-700/60 px-4 py-2 flex justify-between items-center text-[10px] text-slate-400 font-mono">
            <span>SGBD: SQLite (Simulado em Cliente)</span>
            <span>USE db_qualiflv;</span>
          </div>

        </div>

        {/* Output Grid results table */}
        <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-3xs min-h-[250px] flex flex-col">
          
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Grid className="h-4.5 w-4.5 text-emerald-600" />
              <h4 className="font-bold text-slate-800 text-sm">Grelha de Saída SQL (`SQL Result Grid`)</h4>
            </div>

            <div className="flex items-center space-x-2">
              {sqlResult && !sqlResult.errorMessage && (
                <span className="text-2xs bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded border border-green-200">
                  {sqlResult.rows.length} registros retornados
                </span>
              )}
              {sqlResult && sqlResult.errorMessage && (
                <span className="text-2xs bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded border border-rose-200">
                  Consulta com observações
                </span>
              )}
            </div>
          </div>

          {/* Result view table output */}
          <div className="flex-1 flex flex-col justify-between">
            {sqlResult ? (
              <div className="flex-1 flex flex-col justify-between">
                
                {/* Error message if exists */}
                {sqlResult.errorMessage && (
                  <div className="m-4 p-4 bg-orange-50/60 border border-orange-200/80 rounded-lg flex items-start space-x-2.5 text-xs text-orange-800">
                    <AlertCircle className="h-4.5 w-4.5 text-orange-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold">Aviso do Interpretador SQL Relacional</p>
                      <p className="font-medium text-[11px] leading-relaxed text-orange-700">
                        {sqlResult.errorMessage}
                      </p>
                    </div>
                  </div>
                )}

                {/* Table Data list view */}
                {sqlResult.columns.length > 0 ? (
                  <div className="overflow-x-auto custom-scrollbar flex-1 max-h-[350px]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold text-[10px] uppercase font-mono tracking-wider">
                          {sqlResult.columns.map((col, idx) => (
                            <th key={idx} className="py-2.5 px-4">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100/60 font-mono text-slate-700 text-2xs">
                        {sqlResult.rows.length === 0 ? (
                          <tr>
                            <td colSpan={sqlResult.columns.length} className="py-12 text-center text-slate-400 font-medium">
                              <CheckCircle2 className="h-6 w-6 text-slate-300 mx-auto mb-1.5" />
                              Nenhum registro correspondente foi retornado por esta consulta.
                            </td>
                          </tr>
                        ) : (
                          sqlResult.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-50/50 transition">
                              {sqlResult.columns.map((col, cIdx) => (
                                <td key={cIdx} className="py-2.5 px-4 font-mono font-medium text-slate-600">
                                  {typeof row[col] === 'number' 
                                    ? row[col] 
                                    : row[col] === 'Seguro'
                                    ? <span className="text-emerald-600 font-bold uppercase text-[9px] bg-emerald-50 px-1 py-0.2 rounded border border-emerald-100">{row[col]}</span>
                                    : row[col] === 'Atenção'
                                    ? <span className="text-amber-600 font-bold uppercase text-[9px] bg-amber-50 px-1 py-0.2 rounded border border-amber-100">{row[col]}</span>
                                    : (row[col] === 'Crítico' || row[col] === 'Expirado')
                                    ? <span className="text-rose-600 font-bold uppercase text-[9px] bg-rose-50 px-1 py-0.2 rounded border border-rose-100">{row[col]}</span>
                                    : String(row[col])}
                                </td>
                              ))}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 text-center">
                    <Grid className="h-10 w-10 text-slate-200 mb-2" />
                    <p className="font-medium text-xs">Execute a consulta acima para popular a grelha.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center p-12 text-slate-400 text-center">
                <Grid className="h-10 w-10 text-slate-200 mb-2" />
                <p className="font-medium text-xs">Aguardando execução da consulta.</p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
