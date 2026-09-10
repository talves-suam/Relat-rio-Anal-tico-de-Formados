export interface StudentRawRow {
  rowIndex: number;
  matricula: string;
  nome: string;
  cpf: string;
  statusGeral: string;
  periodoConclusao: string;
  chPendente: number;
  dra045Status: string;
  dra138Status: string;
  dra137Status: string;
  dra100Status: string;
  dra139Status: string;
  dataColacao: string;
  resultadoTexto: string;
  enadeTexto: string;
  enadeTeoricaTexto?: string;
  enadePraticaTexto?: string;
  rawCells: Record<string | number, any>;
}

export interface StudentEvaluated {
  matricula: string;
  nome: string;
  cpf: string;
  periodo: string;
  resultadoOriginal: string;
  dataColacao: string;
  jaColouGrau: boolean;
  
  // Destination booleans
  exportarEnade: boolean;
  exportar137: boolean;
  exportar100: boolean;
  exportar139: boolean;
  
  // Exclusion reason if blocked
  motivoBloqueio?: string;
  
  // ENADE details
  enadeText: string;
  anoEnade: string;
  condicaoEnade: string;
  situacaoEnade: string;
  motivoEnade: string;

  // Process details
  parecer137?: string;
  parecer100?: string;
  parecer139?: string;
}

export interface ProcessedDataset {
  filename: string;
  totalLinhasLidas: number;
  totalLinhasFiltradasPeriodo: number;
  totalIgnoradosColacao137: number;
  periodosDetectados: string[];
  periodosSelecionados: string[];
  
  alunosEnade: StudentEvaluated[];
  alunos137: StudentEvaluated[];
  alunos100: StudentEvaluated[];
  alunos139: StudentEvaluated[];
  todosAlunos: StudentEvaluated[];
  
  tagGerada: string;
  dataHora: string;
}

export interface ColumnMapping {
  headerRow: number;
  colMat: number;
  colNome: number;
  colCpf: number;
  colCurso: number;
  colStatus: number;
  colRes: number;
  colEnade: number | null;
  colPeriodo: number | null;
  colColacao: number;
  
  // Hours & Credits pendencies
  colChExtensao: number | null;
  colChAtividade: number | null;
  colCreditos: number | null;
  colChCargaHoraria: number | null;

  // Protocols
  colDra045Possui: number;
  colDra045Status: number;
  colDra045Parecer: number;

  colDra138Possui: number;
  colDra138Status: number;
  colDra138Parecer: number;

  colDra137Possui: number;
  colDra137Status: number;
  colDra137Parecer: number;

  colDra100Possui: number;
  colDra100Status: number;
  colDra100Parecer: number;

  colDra139Possui: number;
  colDra139Status: number;
  colDra139Parecer: number;

  colDraDocFinaisStatus: number | null;

  // Legacy aliases for formula compatibility
  colChJ: number;
  colChK: number;
  colChL: number;
  colM: number;
  colN: number;
  colO: number;
  colP: number;
  colQ: number;
  colR: number;
  colT: number;
  colU: number;
  colW: number;
  colX: number;
  colZ: number;
  colAA: number;

  isNewLayout: boolean;
  columnNamesFound: string[];
}

