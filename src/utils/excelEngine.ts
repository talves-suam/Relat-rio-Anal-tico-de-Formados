import * as XLSX from 'xlsx';
import { ColumnMapping, ProcessedDataset, StudentEvaluated } from '../types';

export const DENY_PHRASES = [
  'resolver exigencia',
  'aguardar finalizacao',
  'processo concluido',
  'pendencia de carga horaria',
  'abrir dra045',
  'sem pendencia de carga horaria',
];

export const CERIMONIA_PARECER =
  'Coruja, a Cerimônia de Formatura é um momento especial e insubstituível, ' +
  'dedicado exclusivamente à celebração desta grande conquista acadêmica. ' +
  'Trata-se de uma solenidade simbólica e social, na qual você compartilhará a vitória ' +
  'com familiares, amigos e colegas que estiveram presentes em sua jornada. ' +
  'Para conferir todos os detalhes logísticos, prazos e normas do evento, é indispensável ' +
  'a leitura completa do documento \'Regras e Orientações Gerais da Cerimônia de Formatura\', ' +
  'publicado e disponível para consulta no seu Ambiente do Aluno.';

export const ESCLARECIMENTO = 'Protocolo aberto automaticamente';

export function norm(text: any): string {
  if (text === null || text === undefined) return '';
  const s = String(text)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u00a0/g, ' ')
    .toLowerCase();
  return s.replace(/\s+/g, ' ').trim();
}

export function cleanCpf(cpfRaw: any): string {
  if (!cpfRaw) return '';
  const s = String(cpfRaw).replace(/[.\-\s]/g, '');
  const digits = s.replace(/\D/g, '');
  if (!digits) return '';
  return digits.padStart(11, '0').slice(-11);
}

export function normalizeMatricula(value: any): string {
  if (value === null || value === undefined) return '';
  let s = String(value).trim();
  if (s.endsWith('.0')) s = s.slice(0, -2);
  const digits = s.replace(/\D/g, '');
  if (!digits) return s;
  return digits.length >= 8 ? digits.slice(-8) : digits.padStart(8, '0');
}

export function avaliarExportacaoAluno(textoResultado: string): {
  enade: boolean;
  dra137: boolean;
  dra100: boolean;
  dra139: boolean;
  motivoBloqueio?: string;
} {
  const base = norm(textoResultado);

  // 1. Trava geral para exigências pendentes
  for (const deny of DENY_PHRASES) {
    if (base.includes(deny)) {
      return {
        enade: false,
        dra137: false,
        dra100: false,
        dra139: false,
        motivoBloqueio: `Bloqueado por: "${deny}"`,
      };
    }
  }

  // 2. Identificação das solicitações na coluna AL
  const tem137 = base.includes('dra137') || base.includes('137');
  const tem100 = base.includes('dra100') || base.includes('100');
  const tem139 = base.includes('dra139') || base.includes('139');

  // 3. Exceção explícita para NÃO abrir DRA139
  const bloqueio139 =
    (base.includes('nao abrir') && base.includes('139')) ||
    base.includes('cerimonia de formatura realizada');

  const exportar137 = tem137;
  const exportar100 = tem100;
  const exportar139 = tem139 && !bloqueio139;
  const exportarEnade = tem137 || tem100;

  return {
    enade: exportarEnade,
    dra137: exportar137,
    dra100: exportar100,
    dra139: exportar139,
  };
}

export function mapEnade(enadeText: string): {
  ano: string;
  condicao: string;
  situacao: string;
  motivo: string;
} {
  const txt = norm(enadeText);
  const match = String(enadeText || '').match(/(20\d{2})/g);
  const ano = match ? match[match.length - 1] : '2026';
  const condicao = 'Concluinte';

  if (txt.includes('nao habilitado')) {
    return {
      ano,
      condicao,
      situacao: 'Não Habilitado',
      motivo: 'Estudante não habilitado ao Enade, em razão do calendário do ciclo avaliativo',
    };
  }
  if (txt.includes('habilitado') && txt.includes('regular')) {
    return {
      ano,
      condicao,
      situacao: 'Habilitado',
      motivo: 'Não Possui',
    };
  }
  return {
    ano,
    condicao,
    situacao: txt.includes('irregular') ? 'Irregular' : '',
    motivo: '',
  };
}

export function detectarColunas(rows: any[][]): ColumnMapping {
  let headerRow = 0;
  let columnNamesFound: string[] = [];

  // Look for header row in the first 25 rows
  let foundHeader = false;
  let rowStr: string[] = [];

  for (let r = 0; r < Math.min(rows.length, 25); r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;

    const normalized = row.map((cell) => norm(cell));
    const hasMat = normalized.some((c) => c.includes('matricula'));
    if (hasMat) {
      headerRow = r;
      rowStr = normalized;
      columnNamesFound = row.map((cell) => String(cell || '').trim());
      foundHeader = true;
      break;
    }
  }

  // Detect whether this dataset matches the new 33-column TI layout
  const isNewLayout = rowStr.some((c) => c.includes('cargahoraria_acursar') || c.includes('ultimo_status_documentosfinais')) ||
    (foundHeader && rowStr.length >= 33);

  // Helper matcher to find column index by matchers in priority order
  const findCol = (matchers: ((s: string) => boolean)[]): number | null => {
    for (const matcher of matchers) {
      const idx = rowStr.findIndex(matcher);
      if (idx !== -1) return idx;
    }
    return null;
  };

  // 1. Matrícula
  const colMat = findCol([
    (s) => s === 'matricula',
    (s) => s.startsWith('matricula'),
    (s) => s.includes('matricula'),
  ]) ?? 0;

  // 2. Nome
  const colNome = findCol([
    (s) => s === 'nome',
    (s) => s === 'nome do aluno',
    (s) => s.includes('nome do aluno'),
    (s) => s === 'aluno',
    (s) => s.includes('nome') && !s.includes('mae') && !s.includes('pai'),
  ]) ?? 1;

  // 3. CPF
  const colCpf = findCol([
    (s) => s === 'cpf',
    (s) => s.includes('cpf'),
  ]) ?? 2;

  // 4. Curso
  const colCurso = findCol([
    (s) => s === 'curso',
    (s) => s.includes('curso') && !s.includes('modalidade'),
  ]) ?? 4;

  // 5. Status Histórico
  const colStatus = findCol([
    (s) => s === 'status_historico',
    (s) => s.includes('status_historico'),
    (s) => s.includes('status historico'),
    (s) => s === 'status',
    (s) => s.includes('status aluno'),
    (s) => s.includes('situacao'),
  ]) ?? 7;

  // 6. Período Conclusão
  const colPeriodo = findCol([
    (s) => s === 'periodoletivo_conclusao',
    (s) => s.includes('periodoletivo'),
    (s) => s.includes('periodo letivo'),
    (s) => s.includes('conclusao provavel'),
    (s) => s.includes('periodo de conclusao'),
    (s) => s === 'periodo',
  ]) ?? 8;

  // 7. Cargas Horárias & Créditos
  const colChExtensao = findCol([
    (s) => s === 'ch_extensao_a_cursar',
    (s) => s.includes('ch_extensao'),
    (s) => s.includes('extensao a cursar'),
    (s) => s.includes('extensao') && s.includes('cursar'),
  ]) ?? 9;

  const colChAtividade = findCol([
    (s) => s === 'ch_atividadecomplementar_a_cursar',
    (s) => s.includes('ch_atividadecomplementar'),
    (s) => s.includes('atividadecomplementar'),
    (s) => s.includes('atividade complementar'),
    (s) => s.includes('ch_atividade'),
  ]) ?? 10;

  const colCreditos = findCol([
    (s) => s === 'creditos_acursar',
    (s) => s.includes('creditos_acursar'),
    (s) => s.includes('creditos a cursar'),
    (s) => s === 'creditos',
  ]) ?? 11;

  const colChCargaHoraria = findCol([
    (s) => s === 'cargahoraria_acursar',
    (s) => s.includes('cargahoraria_acursar'),
    (s) => s.includes('carga horaria a cursar'),
    (s) => s.includes('cargahoraria'),
  ]) ?? (isNewLayout ? 12 : null);

  // 8. Data de Colação de Grau
  // Old layout: index 12 (column M). New layout: index 13 (column N).
  const colColacao = findCol([
    (s) => s === 'data_colacaograu',
    (s) => s.includes('data_colacao'),
    (s) => s.includes('data') && s.includes('colacao'),
  ]) ?? (isNewLayout ? 13 : 12);

  // 9. DRA045 (Análise Documental)
  const colDra045Possui = findCol([
    (s) => s.includes('possuiprotocolo_dra045'),
    (s) => s.includes('possuiprotocolo') && s.includes('045'),
    (s) => s.includes('dra045') && s.includes('possui'),
  ]) ?? (isNewLayout ? 14 : 13);

  const colDra045Status = findCol([
    (s) => s.includes('ultimostatus_dra045'),
    (s) => s.includes('status') && s.includes('045'),
    (s) => s.includes('dra045') && s.includes('status'),
  ]) ?? (isNewLayout ? 15 : 14);

  const colDra045Parecer = findCol([
    (s) => s.includes('ultimo_parecer_externo_dra045'),
    (s) => s.includes('parecer') && s.includes('045'),
    (s) => s.includes('parecer_dra045'),
  ]) ?? (isNewLayout ? 16 : 15);

  // 10. DRA138 (Validação de Dados Pessoais)
  const colDra138Possui = findCol([
    (s) => s.includes('possuiprotocolo_dra138'),
    (s) => s.includes('possuiprotocolo') && s.includes('138'),
    (s) => s.includes('dra138') && s.includes('possui'),
  ]) ?? (isNewLayout ? 17 : 16);

  const colDra138Status = findCol([
    (s) => s.includes('ultimostatus_dra138'),
    (s) => s.includes('status') && s.includes('138'),
    (s) => s.includes('dra138') && s.includes('status'),
  ]) ?? (isNewLayout ? 18 : 17);

  const colDra138Parecer = findCol([
    (s) => s.includes('ultimoparecerexterno_dra138'),
    (s) => s.includes('parecer') && s.includes('138'),
    (s) => s.includes('parecer_dra138'),
  ]) ?? (isNewLayout ? 19 : 18);

  // 11. DRA137 (Colação Especial)
  const colDra137Possui = findCol([
    (s) => s.includes('possuiprotocolo_dra137'),
    (s) => s.includes('possuiprotocolo') && s.includes('137'),
    (s) => s.includes('dra137') && s.includes('possui'),
  ]) ?? (isNewLayout ? 20 : 19);

  const colDra137Status = findCol([
    (s) => s.includes('ultimostatus_dra137'),
    (s) => s.includes('status') && s.includes('137'),
    (s) => s.includes('dra137') && s.includes('status'),
  ]) ?? (isNewLayout ? 21 : 20);

  const colDra137Parecer = findCol([
    (s) => s.includes('ultimoparecerexterno_dra137'),
    (s) => s.includes('parecer') && s.includes('137'),
    (s) => s.includes('parecer_dra137'),
  ]) ?? (isNewLayout ? 22 : 21);

  // 12. DRA100 (Documentos Finais)
  const colDra100Possui = findCol([
    (s) => s.includes('possuiprotocolo_dra100'),
    (s) => s.includes('possuiprotocolo') && s.includes('100'),
    (s) => s.includes('dra100') && s.includes('possui'),
  ]) ?? (isNewLayout ? 23 : 22);

  const colDra100Status = findCol([
    (s) => s.includes('ultimostatus_dra100'),
    (s) => s.includes('status') && s.includes('100'),
    (s) => s.includes('dra100') && s.includes('status'),
  ]) ?? (isNewLayout ? 24 : 23);

  const colDra100Parecer = findCol([
    (s) => s.includes('ultimoparecerexterno_dra100'),
    (s) => s.includes('parecer') && s.includes('100'),
    (s) => s.includes('parecer_dra100'),
  ]) ?? (isNewLayout ? 25 : 24);

  // 13. DRA139 (Cerimônia de Formatura)
  const colDra139Possui = findCol([
    (s) => s.includes('possuiprotocolo_dra139'),
    (s) => s.includes('possuiprotocolo') && s.includes('139'),
    (s) => s.includes('dra139') && s.includes('possui'),
  ]) ?? (isNewLayout ? 26 : 25);

  const colDra139Status = findCol([
    (s) => s.includes('ultimostatus_dra139'),
    (s) => s.includes('status') && s.includes('139'),
    (s) => s.includes('dra139') && s.includes('status'),
  ]) ?? (isNewLayout ? 27 : 26);

  const colDra139Parecer = findCol([
    (s) => s.includes('ultimoparecerexterno_dra139'),
    (s) => s.includes('parecer') && s.includes('139'),
    (s) => s.includes('parecer_dra139'),
  ]) ?? (isNewLayout ? 28 : 27);

  // 14. Documentos Finais Extra (New Layout)
  const colDraDocFinaisStatus = findCol([
    (s) => s.includes('ultimo_status_documentosfinais'),
    (s) => s.includes('status') && s.includes('finais'),
  ]) ?? (isNewLayout ? 29 : null);

  // 15. ENADE Concluinte
  const colEnade = findCol([
    (s) => s.includes('participacoes_enade_concluinte'),
    (s) => s.includes('enade concluinte'),
    (s) => s === 'enade',
    (s) => s.includes('enade') && !s.includes('ingressante'),
  ]) ?? (isNewLayout ? 32 : 30);

  // 16. Coluna Resultado (se já calculada no Excel)
  const colResFound = findCol([
    (s) => s === 'resultado',
    (s) => s.includes('resultado'),
  ]);
  const colRes = colResFound !== null ? colResFound : (rowStr.length > 37 ? 37 : rowStr.length);

  return {
    headerRow,
    colMat,
    colNome,
    colCpf,
    colCurso,
    colStatus,
    colRes,
    colEnade,
    colPeriodo,
    colColacao,
    colChExtensao,
    colChAtividade,
    colCreditos,
    colChCargaHoraria,
    colDra045Possui,
    colDra045Status,
    colDra045Parecer,
    colDra138Possui,
    colDra138Status,
    colDra138Parecer,
    colDra137Possui,
    colDra137Status,
    colDra137Parecer,
    colDra100Possui,
    colDra100Status,
    colDra100Parecer,
    colDra139Possui,
    colDra139Status,
    colDra139Parecer,
    colDraDocFinaisStatus,

    // Legacy formula column aliases
    colChJ: colChExtensao,
    colChK: colChAtividade,
    colChL: colCreditos,
    colM: colColacao,
    colN: colDra045Possui,
    colO: colDra045Status,
    colP: colDra045Parecer,
    colQ: colDra138Possui,
    colR: colDra138Status,
    colT: colDra137Possui,
    colU: colDra137Status,
    colW: colDra100Possui,
    colX: colDra100Status,
    colZ: colDra139Possui,
    colAA: colDra139Status,

    isNewLayout,
    columnNamesFound,
  };
}

export function extrairPeriodoNormalizado(val: any): string {
  if (!val) return '';
  const s = String(val).trim();
  // Match standard patterns like 2026-1, 2026/1, 2026.1, 20261
  const m = s.match(/(20\d{2})[-/._\s]?([12])/);
  if (m) {
    return `${m[1]}-${m[2]}`;
  }
  return s;
}

export function parseWorkbookData(
  wb: XLSX.WorkBook,
  filename: string,
  filtroPeriodosSelecionados?: string[]
): ProcessedDataset {
  // Find main sheet: either active / first or named 'Relatório' / 'Formados'
  let mainSheetName = wb.SheetNames[0];
  for (const name of wb.SheetNames) {
    const n = norm(name);
    if (n.includes('relatorio') || n.includes('formado') || n.includes('analitico')) {
      mainSheetName = name;
      break;
    }
  }

  const mainWs = wb.Sheets[mainSheetName];
  const rows: any[][] = XLSX.utils.sheet_to_json(mainWs, { header: 1, defval: '' });

  const mapping = detectarColunas(rows);

  // Check for auxiliary sheets
  const colacaoSheet = wb.Sheets['Colação Realizada'] || wb.Sheets['Colacao Realizada'];
  const colacaoMatriculas = new Set<string>();
  if (colacaoSheet) {
    const cRows: any[][] = XLSX.utils.sheet_to_json(colacaoSheet, { header: 1, defval: '' });
    for (const r of cRows) {
      if (r && r[0]) {
        const mat = normalizeMatricula(r[0]);
        if (mat) colacaoMatriculas.add(mat);
      }
    }
  }

  const enadeTeoricaSheet = wb.Sheets['ENADE Avaliação Teórica 2025'] || wb.Sheets['ENADE Avaliacao Teorica 2025'];
  const mapEnadeTeorica = new Map<string, string>();
  if (enadeTeoricaSheet) {
    const tRows: any[][] = XLSX.utils.sheet_to_json(enadeTeoricaSheet, { header: 1, defval: '' });
    for (const r of tRows) {
      if (r && r[9]) {
        const cpf = cleanCpf(r[9]);
        const status = String(r[23] || '').trim();
        if (cpf) mapEnadeTeorica.set(cpf, status);
      }
    }
  }

  const enadePraticaSheet = wb.Sheets['ENADE Avaliação Prática'] || wb.Sheets['ENADE Avaliacao Pratica'];
  const mapEnadePratica = new Map<string, { ano: string; status: string }>();
  if (enadePraticaSheet) {
    const pRows: any[][] = XLSX.utils.sheet_to_json(enadePraticaSheet, { header: 1, defval: '' });
    for (const r of pRows) {
      if (r && r[4]) {
        const mat = normalizeMatricula(r[4]);
        const ano = String(r[0] || '2025').trim();
        const status = String(r[5] || '').trim();
        if (mat) mapEnadePratica.set(mat, { ano, status });
      }
    }
  }

  // Detect periods across dataset
  const periodosEncontrados = new Set<string>();
  for (let i = mapping.headerRow + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    if (mapping.colPeriodo !== null && row[mapping.colPeriodo] !== undefined) {
      const pRaw = String(row[mapping.colPeriodo] || '').trim();
      const pNorm = extrairPeriodoNormalizado(pRaw);
      if (pNorm) periodosEncontrados.add(pNorm);
    }
  }

  const periodosArray = Array.from(periodosEncontrados).sort();
  
  // Default selected periods: 2026-1 and 2026-2 (or what user passed)
  const defaultSelection = ['2026-1', '2026-2'];
  const periodosParaFiltrar = filtroPeriodosSelecionados ?? (
    periodosArray.some((p) => defaultSelection.includes(p))
      ? periodosArray.filter((p) => defaultSelection.includes(p))
      : periodosArray
  );

  const filterSet = new Set(periodosParaFiltrar.map((p) => norm(p)));

  const todosAlunos: StudentEvaluated[] = [];
  const alunosEnade: StudentEvaluated[] = [];
  const alunos137: StudentEvaluated[] = [];
  const alunos100: StudentEvaluated[] = [];
  const alunos139: StudentEvaluated[] = [];

  const vistosEnade = new Set<string>();
  const vistos137 = new Set<string>();
  const vistos100 = new Set<string>();
  const vistos139 = new Set<string>();

  let totalLinhasFiltradasPeriodo = 0;
  let totalIgnoradosColacao137 = 0;
  let totalLinhasLidas = 0;

  const todayBr = new Intl.DateTimeFormat('pt-BR').format(new Date());

  for (let i = mapping.headerRow + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const matricula = normalizeMatricula(row[mapping.colMat]);
    if (!matricula) continue;

    totalLinhasLidas++;

    const rawPeriodo = mapping.colPeriodo !== null ? String(row[mapping.colPeriodo] || '').trim() : '';
    const periodoNorm = extrairPeriodoNormalizado(rawPeriodo);

    // Period filtering
    if (periodoNorm && filterSet.size > 0 && !filterSet.has(norm(periodoNorm))) {
      totalLinhasFiltradasPeriodo++;
      continue;
    }

    const nome = String(row[mapping.colNome] || '').trim();
    const cpf = cleanCpf(row[mapping.colCpf]);

    // Check Coluna Q (Colação)
    const valColacao = row[mapping.colColacao] !== undefined ? String(row[mapping.colColacao] || '').trim() : '';
    const jaColouGrau = Boolean(valColacao) && valColacao !== 'null' && valColacao !== '-';

    // Check / Evaluate Resultado
    let textoResultado = '';
    if (mapping.colRes < row.length && row[mapping.colRes] !== undefined && String(row[mapping.colRes]).trim() !== '') {
      textoResultado = String(row[mapping.colRes]).trim();
    } else {
      // Evaluate Excel formula logic dynamically!
      textoResultado = calcularFormulaResultado(row, mapping, colacaoMatriculas);
    }

    // Check / Evaluate ENADE
    let enadeText = '';
    if (mapping.colEnade !== null && mapping.colEnade < row.length && row[mapping.colEnade]) {
      enadeText = String(row[mapping.colEnade]).trim();
    } else {
      // Evaluate ENADE from auxiliary sheets or columns
      enadeText = calcularFormulaEnade(row, mapping, mapEnadeTeorica, mapEnadePratica);
    }

    const destinos = avaliarExportacaoAluno(textoResultado);
    const enadeParsed = mapEnade(enadeText);

    const aluno: StudentEvaluated = {
      matricula,
      nome,
      cpf,
      periodo: periodoNorm || rawPeriodo || 'Não Informado',
      resultadoOriginal: textoResultado,
      dataColacao: valColacao,
      jaColouGrau,
      exportarEnade: destinos.enade,
      exportar137: destinos.dra137 && !jaColouGrau,
      exportar100: destinos.dra100,
      exportar139: destinos.dra139,
      motivoBloqueio: destinos.motivoBloqueio || (destinos.dra137 && jaColouGrau ? 'Já possui data de colação de grau registrada' : undefined),
      enadeText,
      anoEnade: enadeParsed.ano,
      condicaoEnade: enadeParsed.condicao,
      situacaoEnade: enadeParsed.situacao,
      motivoEnade: enadeParsed.motivo,
      parecer137: `Colação de Grau Especial (De Ofício) realizada em ${todayBr}.`,
      parecer100: `Emissão de Documentos Finais realizada em ${todayBr}.`,
      parecer139: CERIMONIA_PARECER,
    };

    todosAlunos.push(aluno);

    if (destinos.enade && !vistosEnade.has(matricula)) {
      vistosEnade.add(matricula);
      alunosEnade.push(aluno);
    }

    if (destinos.dra137) {
      if (jaColouGrau) {
        totalIgnoradosColacao137++;
      } else if (!vistos137.has(matricula)) {
        vistos137.add(matricula);
        alunos137.push(aluno);
      }
    }

    if (destinos.dra100 && !vistos100.has(matricula)) {
      vistos100.add(matricula);
      alunos100.push(aluno);
    }

    if (destinos.dra139 && !vistos139.has(matricula)) {
      vistos139.add(matricula);
      alunos139.push(aluno);
    }
  }

  const now = new Date();
  const dateTag = now.toISOString().slice(0, 10).replace(/-/g, '');
  const tagGerada = `${dateTag}_0001`;

  return {
    filename,
    totalLinhasLidas,
    totalLinhasFiltradasPeriodo,
    totalIgnoradosColacao137,
    periodosDetectados: periodosArray,
    periodosSelecionados: periodosParaFiltrar,
    alunosEnade,
    alunos137,
    alunos100,
    alunos139,
    todosAlunos,
    tagGerada,
    dataHora: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  };
}

export function calcularFormulaResultado(
  row: any[],
  mapping: ColumnMapping,
  colacaoMatriculas: Set<string>
): string {
  // Helper to extract cell values safely
  const val = (idx: number | null | undefined) =>
    idx !== null && idx !== undefined && idx < row.length && row[idx] !== undefined
      ? String(row[idx]).trim()
      : '';
  const isNao = (v: string) => {
    const nv = norm(v);
    return nv === 'nao' || nv === 'n' || nv === 'false';
  };

  const matricula = normalizeMatricula(val(mapping.colMat));
  const curso = val(mapping.colCurso);

  // Protocols status & possession
  const uVal = val(mapping.colDra137Status);
  const tVal = val(mapping.colDra137Possui);
  const xVal = val(mapping.colDra100Status);
  const wVal = val(mapping.colDra100Possui);
  const aaVal = val(mapping.colDra139Status);
  const zVal = val(mapping.colDra139Possui);

  const pParts: string[] = [];

  // DRA137 (Colação Especial)
  if (norm(uVal) === 'em exigencia') {
    pParts.push('Resolver Exigência do DRA137 (Colação Especial)');
  } else if (isNao(tVal)) {
    pParts.push('Abrir DRA137 (Colação Especial)');
  }

  // DRA100 (Emitir Documentos Finais)
  if (norm(xVal) === 'em exigencia') {
    pParts.push('Resolver Exigência do DRA100 (Emitir Doc. Finais)');
  } else if (isNao(wVal)) {
    pParts.push('Abrir DRA100 (Emitir Doc. Finais)');
  }

  // DRA139 (Cerimônia de Formatura)
  if (norm(aaVal) === 'em exigencia') {
    pParts.push('Resolver Exigência do DRA139 (Cerimônia de Formatura)');
  } else if (isNao(zVal)) {
    const naColacaoRealizada =
      (matricula && colacaoMatriculas.has(matricula)) ||
      (curso && colacaoMatriculas.has(curso));
    if (naColacaoRealizada) {
      pParts.push('Cerimônia de Formatura Realizada, NÃO Abrir DRA139 (Cerimônia de Formatura)');
    } else {
      pParts.push('Abrir DRA139 (Cerimônia de Formatura)');
    }
  }

  const pJoined = pParts.filter(Boolean).join(', ');

  const nVal = val(mapping.colDra045Possui);
  const oVal = val(mapping.colDra045Status);
  const hVal = val(mapping.colStatus);
  const dataColacao = val(mapping.colColacao);

  // Empty row check
  if (nVal === '' && oVal === '' && hVal === '') {
    return '';
  }

  // Check Colação de Grau: If already has date of colação, process is completed
  const jaColou = Boolean(dataColacao) && dataColacao !== '-' && dataColacao !== 'null' && dataColacao !== '0';
  if (jaColou) {
    return pJoined === '' ? 'Processo Concluído / Tudo OK' : pJoined;
  }

  // Check pending hours & credits (including cargahoraria_acursar from new report)
  const jNum = mapping.colChExtensao !== null ? Number(val(mapping.colChExtensao)) || 0 : 0;
  const kNum = mapping.colChAtividade !== null ? Number(val(mapping.colChAtividade)) || 0 : 0;
  const lNum = mapping.colCreditos !== null ? Number(val(mapping.colCreditos)) || 0 : 0;
  const mChNum = mapping.colChCargaHoraria !== null ? Number(val(mapping.colChCargaHoraria)) || 0 : 0;

  if (jNum + kNum + lNum + mChNum > 0) {
    return 'Pendência de Carga Horária / Créditos';
  }

  // Check DRA045
  if (isNao(nVal)) {
    return 'Abrir DRA045 (Análise Documental) e DRA138 (Validação de Dados Pessoais)';
  }

  if (norm(oVal) === 'em exigencia') {
    return 'Resolver Exigência do DRA045 (Análise Documental)';
  }

  if (norm(oVal) !== 'finalizado' && norm(oVal) !== 'pronto') {
    return 'Aguardar Finalização do DRA045 (Análise Documental)';
  }

  // Check Status Histórico
  if (norm(hVal) !== 'formado') {
    return 'Sem pendência de carga horária e créditos, mas não está com o status de formado';
  }

  // Check DRA138
  const pText = val(mapping.colDra045Parecer);
  const qVal = val(mapping.colDra138Possui);
  const rVal = val(mapping.colDra138Status);

  const normP = norm(pText);
  const isNaoNecessidade = normP.includes('nao havera necessidade') || normP.includes('nao necessita');
  const hasConfirmeCorrija = normP.includes('confirme') || normP.includes('corrija');
  const qIsFilledAndNotNao = !isNao(qVal) && qVal !== '';

  if (!isNaoNecessidade && (qIsFilledAndNotNao || hasConfirmeCorrija)) {
    if (isNao(qVal)) {
      return 'Abrir DRA138 (Validação de Dados Pessoais)';
    }
    if (norm(rVal) === 'em exigencia') {
      return 'Resolver Exigência do DRA138 (Validação de Dados Pessoais)';
    }
    if (norm(rVal) !== 'finalizado') {
      return 'Aguardar Finalização do DRA138 (Validação de Dados Pessoais)';
    }
    return pJoined === '' ? 'Processo Concluído / Tudo OK' : pJoined;
  }

  return pJoined === '' ? 'Processo Concluído / Tudo OK' : pJoined;
}

export function calcularFormulaEnade(
  row: any[],
  mapping: ColumnMapping,
  mapEnadeTeorica: Map<string, string>,
  mapEnadePratica: Map<string, { ano: string; status: string }>
): string {
  const cpf = cleanCpf(row[mapping.colCpf]);
  const mat = normalizeMatricula(row[mapping.colMat]);

  let statusTeorica = '';
  if (cpf && mapEnadeTeorica.has(cpf)) {
    const rawStatus = norm(mapEnadeTeorica.get(cpf));
    if (rawStatus === 'sim') {
      statusTeorica = 'Estudante habilitado, em situação regular no Enade (2025)';
    } else {
      statusTeorica = 'Estudante habilitado, em situação irregular no Enade (2025)';
    }
  } else {
    statusTeorica = 'Estudante não habilitado ao Enade, em razão do calendário do ciclo avaliativo';
  }

  let statusPratica = '';
  if (mat && mapEnadePratica.has(mat)) {
    const pInfo = mapEnadePratica.get(mat)!;
    const isReg = norm(pInfo.status) === 'preenchido' || pInfo.ano === '2025';
    if (isReg) {
      statusPratica = `Estudante habilitado, em situação regular no Enade (${pInfo.ano})`;
    } else {
      statusPratica = `Estudante habilitado, em situação irregular no Enade (${pInfo.ano})`;
    }
  } else {
    statusPratica = 'Estudante não habilitado ao Enade, em razão do calendário do ciclo avaliativo';
  }

  // Combine AM and AN
  if (norm(statusTeorica) === norm('Estudante habilitado, em situação irregular no Enade (2025)')) {
    return 'Estudante habilitado, em situação regular no Enade (2025)';
  }

  const amIrr = norm(statusTeorica).includes('irregular');
  const anIrr = norm(statusPratica).includes('irregular');

  if (amIrr || anIrr) {
    if (amIrr && anIrr) {
      const anoAn = Number((statusPratica.match(/\((\d{4})\)/) || [])[1]) || 0;
      const anoAm = Number((statusTeorica.match(/\((\d{4})\)/) || [])[1]) || 0;
      return anoAn >= anoAm ? statusPratica : statusTeorica;
    }
    return amIrr ? statusTeorica : statusPratica;
  }

  const amReg = norm(statusTeorica).includes('regular');
  const anReg = norm(statusPratica).includes('regular');

  if (amReg || anReg) {
    if (amReg && anReg) {
      const anoAn = Number((statusPratica.match(/\((\d{4})\)/) || [])[1]) || 0;
      const anoAm = Number((statusTeorica.match(/\((\d{4})\)/) || [])[1]) || 0;
      return anoAn >= anoAm ? statusPratica : statusTeorica;
    }
    return amReg ? statusTeorica : statusPratica;
  }

  return 'Estudante não habilitado ao Enade, em razão do calendário do ciclo avaliativo';
}
