/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Filial, Produto, LoteEstoque, SavedQuery } from './types';

export const INITIAL_FILIAIS: Filial[] = [
  { id_filial: 1, nome_filial: 'Central São Paulo', cidade: 'São Paulo' },
  { id_filial: 2, nome_filial: 'Central Rio de Janeiro', cidade: 'Rio de Janeiro' },
  { id_filial: 3, nome_filial: 'Central Campinas', cidade: 'Campinas' }
];

export const INITIAL_PRODUTOS: Produto[] = [
  { id_produto: 1, nome_produto: 'Abacaxi Picado Encartelado', categoria: 'Fruta', shelf_life_horas: 72 },
  { id_produto: 2, nome_produto: 'Melancia em Cubos Pote', categoria: 'Fruta', shelf_life_horas: 48 },
  { id_produto: 3, nome_produto: 'Salada de Folhas Higienizada', categoria: 'Verdura', shelf_life_horas: 96 },
  { id_produto: 4, nome_produto: 'Abóbora Cabotiá Cubos', categoria: 'Legume', shelf_life_horas: 120 }
];

export const INITIAL_LOTES: LoteEstoque[] = [
  {
    id_lote: 1,
    id_filial: 1,
    id_produto: 1,
    data_processamento: '2026-06-04T08:00:00Z',
    quantidade_kg: 150.00,
    status_validade: 'Seguro'
  },
  {
    id_lote: 2,
    id_filial: 1,
    id_produto: 2,
    data_processamento: '2026-06-05T06:00:00Z',
    quantidade_kg: 80.50,
    status_validade: 'Atenção'
  },
  {
    id_lote: 3,
    id_filial: 2,
    id_produto: 3,
    data_processamento: '2026-06-01T10:00:00Z',
    quantidade_kg: 200.00,
    status_validade: 'Crítico'
  },
  {
    id_lote: 4,
    id_filial: 3,
    id_produto: 4,
    data_processamento: '2026-06-03T14:00:00Z',
    quantidade_kg: 310.00,
    status_validade: 'Seguro'
  },
  {
    id_lote: 5,
    id_filial: 2,
    id_produto: 1,
    data_processamento: '2026-06-05T07:30:00Z',
    quantidade_kg: 95.00,
    status_validade: 'Seguro'
  }
];

export const PREDEFINED_QUERIES: SavedQuery[] = [
  {
    id: 'consulta-1',
    title: 'Consulta 1: Dashboard de Controle (INNER JOIN)',
    description: 'Lista completa cruzando lotes de estoque, produtos e filiais correspondentes, com ordenação por status de validade decrescente.',
    sql: `-- Mostra o lote, qual é o produto, de qual filial ele pertence e o status.
SELECT 
    l.id_lote,
    f.nome_filial AS Unidade,
    p.nome_produto AS Produto,
    p.categoria AS Categoria,
    l.quantidade_kg AS "Peso (KG)",
    l.status_validade AS Status
FROM lotes_estoque l
INNER JOIN filiais f ON l.id_filial = f.id_filial
INNER JOIN produtos p ON l.id_produto = p.id_produto
ORDER BY l.status_validade DESC;`
  },
  {
    id: 'consulta-2',
    title: 'Consulta 2: Alertas Críticos ou de Atenção (LEFT JOIN)',
    description: 'Filtra e exibe apenas os lotes que requerem ação rápida (status Crítico ou Atenção) de qualquer uma das filiais.',
    sql: `-- Busca apenas os lotes que precisam de ação rápida na filial de SP ou RJ
SELECT 
    f.nome_filial,
    p.nome_produto,
    l.data_processamento,
    l.status_validade
FROM lotes_estoque l
LEFT JOIN filiais f ON l.id_filial = f.id_filial
LEFT JOIN produtos p ON l.id_produto = p.id_produto
WHERE l.status_validade = 'Crítico' OR l.status_validade = 'Atenção';`
  },
  {
    id: 'consulta-3',
    title: 'Consulta Adicional: Agrupamento por Categoria (GROUP BY)',
    description: 'Agrupa o volume total estocado (soma de Kg) e quantidade de lotes ativos classificados por categoria de hortifrúti.',
    sql: `SELECT 
    p.categoria AS Categoria,
    COUNT(l.id_lote) AS "Total de Lotes",
    SUM(l.quantidade_kg) AS "Peso Total (KG)"
FROM lotes_estoque l
INNER JOIN produtos p ON l.id_produto = p.id_produto
GROUP BY p.categoria
ORDER BY "Peso Total (KG)" DESC;`
  },
  {
    id: 'consulta-4',
    title: 'Consulta Adicional: Visão Geral por Unidade (GROUP BY)',
    description: 'Soma total de estoque em Kg por Filial e contagem total de lotes.',
    sql: `SELECT 
    f.nome_filial AS Unidade,
    f.cidade AS Cidade,
    COUNT(l.id_lote) AS "Lotes Ativos",
    SUM(l.quantidade_kg) AS "Volume Estocado (KG)"
FROM lotes_estoque l
RIGHT JOIN filiais f ON l.id_filial = f.id_filial
GROUP BY f.id_filial
ORDER BY "Volume Estocado (KG)" DESC;`
  }
];
