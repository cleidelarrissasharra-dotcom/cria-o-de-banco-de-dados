/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Filial, Produto, LoteEstoque } from './types';

export interface SqlResult {
  columns: string[];
  rows: Record<string, any>[];
  errorMessage?: string;
  queryType: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'UNKNOWN';
}

// Helper to clean and format datetime from ISO to Brazilian Standard or simple layout
function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toISOString().replace('T', ' ').replace('Z', '').substring(0, 19);
  } catch {
    return isoString;
  }
}

/**
 * A client-side simulated query engine that parses input SQL or matches predefined keywords,
 * then maps the memory array states (Filiais, Produtos, Lotes) using logical filters
 * to mimic realistic SQL execution on our schema.
 */
export function executeSql(
  query: string,
  filiais: Filial[],
  produtos: Produto[],
  lotes: LoteEstoque[],
  dynamicStatusCalculator: (l: LoteEstoque, p: Produto) => string
): SqlResult {
  const normalized = query.trim().replace(/\s+/g, ' ');
  const lowerQuery = normalized.toLowerCase();

  // Determine query type
  let queryType: SqlResult['queryType'] = 'UNKNOWN';
  if (lowerQuery.startsWith('select')) queryType = 'SELECT';
  else if (lowerQuery.startsWith('insert')) queryType = 'INSERT';
  else if (lowerQuery.startsWith('update')) queryType = 'UPDATE';
  else if (lowerQuery.startsWith('delete')) queryType = 'DELETE';

  if (queryType !== 'SELECT') {
    return {
      columns: [],
      rows: [],
      queryType,
      errorMessage: 'Por segurança e usabilidade na demonstração, utilize as abas de formulários para INSERÇÃO, ATUALIZAÇÃO e EXCLUSÃO, e o editor SQL para consultas (SELECT).'
    };
  }

  try {
    // 1. Detect PREDEFINED QUERY 1 (INNER JOIN Dashboard list)
    if (lowerQuery.includes('inner join filiais') && lowerQuery.includes('inner join produtos')) {
      // ORDER BY l.status_validade DESC or similar
      const resultRows = lotes.map(l => {
        const f = filiais.find(fil => fil.id_filial === l.id_filial);
        const p = produtos.find(prod => prod.id_produto === l.id_produto);
        const activeStatus = p ? dynamicStatusCalculator(l, p) : l.status_validade;

        return {
          'id_lote': l.id_lote,
          'Unidade': f ? f.nome_filial : `Sem Filial BD (${l.id_filial})`,
          'Produto': p ? p.nome_produto : `Sem Produto BD (${l.id_produto})`,
          'Categoria': p ? p.categoria : 'Indefinida',
          'Peso (KG)': l.quantidade_kg,
          'Status': activeStatus
        };
      });

      // Sort by status priority: Crítico/Expirado first, then Atenção, then Seguro
      const getPriority = (status: string) => {
        if (status === 'Expirado' || status === 'Crítico') return 3;
        if (status === 'Atenção') return 2;
        return 1;
      };

      resultRows.sort((a, b) => getPriority(b.Status) - getPriority(a.Status));

      return {
        columns: ['id_lote', 'Unidade', 'Produto', 'Categoria', 'Peso (KG)', 'Status'],
        rows: resultRows,
        queryType
      };
    }

    // 2. Detect PREDEFINED QUERY 2 (LEFT JOIN Alerts)
    if (lowerQuery.includes('left join filiais') || lowerQuery.includes('left join produtos')) {
      const parsedWithAlertFilter = lotes.filter(l => {
        const prod = produtos.find(p => p.id_produto === l.id_produto);
        const s = prod ? dynamicStatusCalculator(l, prod) : l.status_validade;
        return s === 'Crítico' || s === 'Atenção' || s === 'Expirado';
      });

      const resultRows = parsedWithAlertFilter.map(l => {
        const f = filiais.find(fil => fil.id_filial === l.id_filial);
        const p = produtos.find(prod => prod.id_produto === l.id_produto);
        const s = p ? dynamicStatusCalculator(l, p) : l.status_validade;

        return {
          'nome_filial': f ? f.nome_filial : 'N/A',
          'nome_produto': p ? p.nome_produto : 'N/A',
          'data_processamento': formatDateTime(l.data_processamento),
          'status_validade': s
        };
      });

      return {
        columns: ['nome_filial', 'nome_produto', 'data_processamento', 'status_validade'],
        rows: resultRows,
        queryType
      };
    }

    // 3. GROUP BY Category (Consulta 3)
    if (lowerQuery.includes('group by p.categoria') || (lowerQuery.includes('categoria') && lowerQuery.includes('count') && lowerQuery.includes('sum'))) {
      // Group batches by product category
      const categories: Record<string, { count: number; sumKg: number }> = {};
      lotes.forEach(l => {
        const p = produtos.find(prod => prod.id_produto === l.id_produto);
        const cat = p ? p.categoria : 'Outros';
        if (!categories[cat]) {
          categories[cat] = { count: 0, sumKg: 0 };
        }
        categories[cat].count += 1;
        categories[cat].sumKg += l.quantidade_kg;
      });

      const resultRows = Object.entries(categories).map(([cat, val]) => ({
        'Categoria': cat,
        'Total de Lotes': val.count,
        'Peso Total (KG)': Number(val.sumKg.toFixed(2))
      })).sort((a, b) => b['Peso Total (KG)'] - a['Peso Total (KG)']);

      return {
        columns: ['Categoria', 'Total de Lotes', 'Peso Total (KG)'],
        rows: resultRows,
        queryType
      };
    }

    // 4. GROUP BY filial (Consulta 4)
    if (lowerQuery.includes('group by f.id_filial') || (lowerQuery.includes('nome_filial') && lowerQuery.includes('lotes ativos'))) {
      const resultRows = filiais.map(f => {
        const fLotes = lotes.filter(l => l.id_filial === f.id_filial);
        const sumKg = fLotes.reduce((sum, l) => sum + l.quantidade_kg, 0);
        return {
          'Unidade': f.nome_filial,
          'Cidade': f.cidade,
          'Lotes Ativos': fLotes.length,
          'Volume Estocado (KG)': Number(sumKg.toFixed(2))
        };
      }).sort((a, b) => b['Volume Estocado (KG)'] - a['Volume Estocado (KG)']);

      return {
        columns: ['Unidade', 'Cidade', 'Lotes Ativos', 'Volume Estocado (KG)'],
        rows: resultRows,
        queryType
      };
    }

    // 5. Basic SELECT * FROM filiais
    if (lowerQuery.includes('from filiais')) {
      let rows = [...filiais];
      if (lowerQuery.includes('where')) {
        const whereClause = lowerQuery.split('where')[1];
        if (whereClause.includes('cidade')) {
          const match = whereClause.match(/=\s*['"]([^'"]+)['"]/);
          if (match) {
            const cidadeVal = match[1].toLowerCase();
            rows = rows.filter(f => f.cidade.toLowerCase() === cidadeVal);
          }
        }
      }
      return {
        columns: ['id_filial', 'nome_filial', 'cidade'],
        rows,
        queryType
      };
    }

    // 6. Basic SELECT * FROM produtos
    if (lowerQuery.includes('from produtos')) {
      let rows = [...produtos];
      if (lowerQuery.includes('where')) {
        const whereClause = lowerQuery.split('where')[1];
        if (whereClause.includes('categoria')) {
          const match = whereClause.match(/=\s*['"]([^'"]+)['"]/);
          if (match) {
            const catVal = match[1].toLowerCase();
            rows = rows.filter(p => p.categoria.toLowerCase() === catVal);
          }
        }
      }
      return {
        columns: ['id_produto', 'nome_produto', 'categoria', 'shelf_life_horas'],
        rows,
        queryType
      };
    }

    // 7. Basic SELECT * FROM lotes_estoque
    if (lowerQuery.includes('from lotes_estoque') || lowerQuery.includes('from lotes')) {
      let rowsList = lotes.map(l => {
        const p = produtos.find(prod => prod.id_produto === l.id_produto);
        const calculatedStatus = p ? dynamicStatusCalculator(l, p) : l.status_validade;
        return {
          id_lote: l.id_lote,
          id_filial: l.id_filial,
          id_produto: l.id_produto,
          data_processamento: formatDateTime(l.data_processamento),
          quantidade_kg: l.quantidade_kg,
          status_validade: calculatedStatus
        };
      });

      if (lowerQuery.includes('where')) {
        const whereClause = lowerQuery.split('where')[1];
        if (whereClause.includes('status_validade')) {
          const match = whereClause.match(/=\s*['"]([^'"]+)['"]/);
          if (match) {
            const statusVal = match[1].toLowerCase();
            rowsList = rowsList.filter(l => l.status_validade.toLowerCase() === statusVal);
          }
        }
        if (whereClause.includes('id_filial')) {
          const match = whereClause.match(/id_filial\s*=\s*(\d+)/);
          if (match) {
            const idVal = parseInt(match[1]);
            rowsList = rowsList.filter(l => l.id_filial === idVal);
          }
        }
      }

      return {
        columns: ['id_lote', 'id_filial', 'id_produto', 'data_processamento', 'quantidade_kg', 'status_validade'],
        rows: rowsList,
        queryType
      };
    }

    // Generic response if couldn't identify the table fully but contains SELECT keywords
    return {
      columns: ['Resultado'],
      rows: [
        { 'Resultado': 'Consulta executada com sucesso!' },
        { 'Instrução': 'Tente usar uma das consultas pré-definidas na barra lateral ou selecione uma tabela válida. Ex: SELECT * FROM produtos' }
      ],
      queryType,
      errorMessage: `Sentença SQL aceita sintaticamente, mas o simulador relacional não encontrou a tabela ou a combinação de filtros especificada. Escolha uma das consultas pré-definidas para ver os JOINs complexos!`
    };

  } catch (error: any) {
    return {
      columns: [],
      rows: [],
      queryType,
      errorMessage: `Erro de Sintaxe SQL: ${error.message || 'Erro desconhecido de análise.'}`
    };
  }
}
