import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { ProcessedDataset, StudentEvaluated } from '../types';
import { CERIMONIA_PARECER, ESCLARECIMENTO } from './excelEngine';

export function buildEnadeRows(alunos: StudentEvaluated[]): any[][] {
  const header = [
    'matricula',
    'nome',
    'anoenade_concluinte',
    'condicaoenade_concluinte',
    'situacaoenade_concluinte',
    'motivoenade_concluinte',
  ];
  const rows = [header];
  for (const a of alunos) {
    rows.push([
      a.matricula,
      a.nome,
      a.anoEnade,
      a.condicaoEnade,
      a.situacaoEnade,
      a.motivoEnade,
    ]);
  }
  return rows;
}

export function buildProcessosRows(
  alunos: StudentEvaluated[],
  protocolo: 'DRA137' | 'DRA100' | 'DRA139'
): any[][] {
  const header = [
    'Matrícula',
    'Solicitação',
    'Status',
    'Esclarecimento',
    'Parecer Interno',
    'Parecer Externo',
  ];
  const rows = [header];
  const todayBr = new Intl.DateTimeFormat('pt-BR').format(new Date());

  let status = 'Finalizado';
  let parecer = '';

  if (protocolo === 'DRA137') {
    status = 'Finalizado';
    parecer = `Colação de Grau Especial (De Ofício) realizada em ${todayBr}.`;
  } else if (protocolo === 'DRA100') {
    status = 'Finalizado';
    parecer = `Emissão de Documentos Finais realizada em ${todayBr}.`;
  } else if (protocolo === 'DRA139') {
    status = 'Aguardando Atendimento';
    parecer = CERIMONIA_PARECER;
  }

  for (const a of alunos) {
    rows.push([
      a.matricula,
      protocolo,
      status,
      ESCLARECIMENTO,
      parecer,
      parecer,
    ]);
  }
  return rows;
}

export function createWorkbookFromRows(rows: any[][], sheetName = 'Gerado_001'): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Set column widths gracefully
  const colWidths = rows[0]?.map((_, colIdx) => {
    let maxLen = 12;
    for (let r = 0; r < Math.min(rows.length, 100); r++) {
      const cellVal = rows[r][colIdx];
      if (cellVal) {
        maxLen = Math.max(maxLen, String(cellVal).length);
      }
    }
    return { wch: Math.min(maxLen + 3, 60) };
  });

  if (colWidths) {
    ws['!cols'] = colWidths;
  }

  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  return wb;
}

export function downloadWorkbookFile(wb: XLSX.WorkBook, filename: string): void {
  XLSX.writeFile(wb, filename);
}

export function getReportFileName(
  type: 'enade' | 'dra137' | 'dra100' | 'dra139',
  tag: string
): string {
  switch (type) {
    case 'enade':
      return `Participações ENADE (Gerado ${tag}).xlsx`;
    case 'dra137':
      return `Processos em Massa DRA137 (Gerado ${tag}).xlsx`;
    case 'dra100':
      return `Processos em Massa DRA100 (Gerado ${tag}).xlsx`;
    case 'dra139':
      return `Processos em Massa DRA139 (Gerado ${tag}).xlsx`;
  }
}

export function downloadSingleReport(
  type: 'enade' | 'dra137' | 'dra100' | 'dra139',
  dataset: ProcessedDataset
): void {
  const filename = getReportFileName(type, dataset.tagGerada);
  const sheetName = `Gerado_${dataset.tagGerada}`;

  let rows: any[][] = [];
  if (type === 'enade') {
    rows = buildEnadeRows(dataset.alunosEnade);
  } else if (type === 'dra137') {
    rows = buildProcessosRows(dataset.alunos137, 'DRA137');
  } else if (type === 'dra100') {
    rows = buildProcessosRows(dataset.alunos100, 'DRA100');
  } else if (type === 'dra139') {
    rows = buildProcessosRows(dataset.alunos139, 'DRA139');
  }

  const wb = createWorkbookFromRows(rows, sheetName);
  downloadWorkbookFile(wb, filename);
}

export async function downloadAllZip(dataset: ProcessedDataset): Promise<void> {
  const zip = new JSZip();
  const sheetName = `Gerado_${dataset.tagGerada}`;

  // 1. ENADE
  if (dataset.alunosEnade.length > 0) {
    const rows = buildEnadeRows(dataset.alunosEnade);
    const wb = createWorkbookFromRows(rows, sheetName);
    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    zip.file(getReportFileName('enade', dataset.tagGerada), buf);
  }

  // 2. DRA137
  if (dataset.alunos137.length > 0) {
    const rows = buildProcessosRows(dataset.alunos137, 'DRA137');
    const wb = createWorkbookFromRows(rows, sheetName);
    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    zip.file(getReportFileName('dra137', dataset.tagGerada), buf);
  }

  // 3. DRA100
  if (dataset.alunos100.length > 0) {
    const rows = buildProcessosRows(dataset.alunos100, 'DRA100');
    const wb = createWorkbookFromRows(rows, sheetName);
    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    zip.file(getReportFileName('dra100', dataset.tagGerada), buf);
  }

  // 4. DRA139
  if (dataset.alunos139.length > 0) {
    const rows = buildProcessosRows(dataset.alunos139, 'DRA139');
    const wb = createWorkbookFromRows(rows, sheetName);
    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    zip.file(getReportFileName('dra139', dataset.tagGerada), buf);
  }

  // Also include a summary text file
  const summaryText = [
    `RELATÓRIO DE PROCESSAMENTO AUTOMÁTICO DE FORMANDOS E PROCESSOS DRA`,
    `Arquivo Origem: ${dataset.filename}`,
    `Data/Hora da Geração: ${new Date().toLocaleString('pt-BR')}`,
    `Tag do Lote: ${dataset.tagGerada}`,
    `Períodos Selecionados: ${dataset.periodosSelecionados.join(', ') || 'Todos'}`,
    `--------------------------------------------------`,
    `Total de Alunos Analisados: ${dataset.totalLinhasLidas}`,
    `Total de Alunos Descartados fora do Período: ${dataset.totalLinhasFiltradasPeriodo}`,
    `Total de Alunos Ignorados no DRA137 (Já possui colação): ${dataset.totalIgnoradosColacao137}`,
    `--------------------------------------------------`,
    `Arquivos Gerados neste Pacote:`,
    `- Participações ENADE: ${dataset.alunosEnade.length} registros`,
    `- Processos DRA137 (Colação Especial): ${dataset.alunos137.length} registros`,
    `- Processos DRA100 (Emitir Documentos Finais): ${dataset.alunos100.length} registros`,
    `- Processos DRA139 (Cerimônia de Formatura): ${dataset.alunos139.length} registros`,
  ].join('\n');

  zip.file(`README_Resumo_Lote_${dataset.tagGerada}.txt`, summaryText);

  const content = await zip.generateAsync({ type: 'blob' });
  const zipUrl = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = zipUrl;
  a.download = `Relatorios_Processados_DRA_${dataset.tagGerada}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(zipUrl);
}

export function downloadConsolidatedAudit(dataset: ProcessedDataset): void {
  const header = [
    'Matrícula',
    'Nome',
    'Período Letivo',
    'Resultado Avaliado',
    'Data de Colação',
    'Já Colou Grau?',
    'DRA137',
    'DRA100',
    'DRA139',
    'ENADE',
    'Situação ENADE',
    'Status/Bloqueio',
  ];

  const rows: any[][] = [header];
  for (const a of dataset.todosAlunos) {
    rows.push([
      a.matricula,
      a.nome,
      a.periodo,
      a.resultadoOriginal,
      a.dataColacao || '-',
      a.jaColouGrau ? 'SIM' : 'NÃO',
      a.exportar137 ? 'SIM' : 'NÃO',
      a.exportar100 ? 'SIM' : 'NÃO',
      a.exportar139 ? 'SIM' : 'NÃO',
      a.exportarEnade ? 'SIM' : 'NÃO',
      a.situacaoEnade || a.condicaoEnade,
      a.motivoBloqueio || 'Apto para Exportação',
    ]);
  }

  const wb = createWorkbookFromRows(rows, 'Auditoria_Consolidada');
  downloadWorkbookFile(wb, `Auditoria_Consolidada_Alunos_${dataset.tagGerada}.xlsx`);
}
