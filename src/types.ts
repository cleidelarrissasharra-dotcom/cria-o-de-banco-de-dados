/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Filial {
  id_filial: number;
  nome_filial: string;
  cidade: string;
}

export interface Produto {
  id_produto: number;
  nome_produto: string;
  categoria: string; // Ex: Fruta, Legume, Verdura
  shelf_life_horas: number; // Tempo de vida útil padrão em horas
}

export interface LoteEstoque {
  id_lote: number;
  id_filial: number;  // FK to Filial
  id_produto: number; // FK to Produto
  data_processamento: string; // ISO date string (YYYY-MM-DD HH:MM:SS)
  quantidade_kg: number;
  status_validade: 'Seguro' | 'Atenção' | 'Crítico' | 'Expirado'; // De acordo com o cálculo de shelf-life
}

export interface SavedQuery {
  id: string;
  title: string;
  sql: string;
  description: string;
}
