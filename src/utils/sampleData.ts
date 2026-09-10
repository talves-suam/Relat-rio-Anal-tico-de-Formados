import * as XLSX from 'xlsx';
import { parseWorkbookData } from './excelEngine';
import { ProcessedDataset } from '../types';

export function generateSampleWorkbook(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // Create Header row for "Relatório Analítico de Formado"
  // Col B (1): Matrícula, Col C (2): CPF, Col D (3): Nome, Col H (7): Status, Col I (8): Período,
  // Col Q (16): Data de Colação, Col AL (37): Resultado, Col AM (38): ENADE
  const headers = new Array(40).fill('');
  headers[0] = 'ID';
  headers[1] = 'Matrícula';
  headers[2] = 'CPF';
  headers[3] = 'Nome do Aluno';
  headers[4] = 'Curso';
  headers[5] = 'Unidade';
  headers[6] = 'Turno';
  headers[7] = 'Status Acadêmico';
  headers[8] = 'Período Letivo de Conclusão Provável';
  headers[9] = 'CH Pendente Extensão';
  headers[10] = 'CH Pendente Ativ. Comp.';
  headers[11] = 'CH Pendente Eletivas';
  headers[12] = 'Isenção / Dispensa';
  headers[13] = 'DRA045 Necessário';
  headers[14] = 'DRA045 Status';
  headers[15] = 'Obs Documentação';
  headers[16] = 'Data de Colação de Grau';
  headers[17] = 'DRA138 Status';
  headers[18] = 'DRA138 Obs';
  headers[19] = 'DRA137 Solicitado';
  headers[20] = 'DRA137 Status';
  headers[21] = 'DRA137 Parecer';
  headers[22] = 'DRA100 Solicitado';
  headers[23] = 'DRA100 Status';
  headers[24] = 'DRA100 Parecer';
  headers[25] = 'DRA139 Solicitado';
  headers[26] = 'DRA139 Status';
  headers[37] = 'Resultado';
  headers[38] = 'ENADE Concluinte';

  const sampleStudents = [
    {
      mat: '20211045',
      cpf: '123.456.789-01',
      nome: 'Mariana Silva de Oliveira',
      curso: 'Administração',
      status: 'Formado',
      periodo: '2026-1',
      dataColacao: '',
      resultado: 'Abrir DRA137 (Colação Especial), Abrir DRA100 (Emitir Doc. Finais), Abrir DRA139 (Cerimônia de Formatura)',
      enade: 'Estudante habilitado, em situação regular no Enade (2025)',
    },
    {
      mat: '20211089',
      cpf: '234.567.890-12',
      nome: 'Lucas Gabriel Pereira Santos',
      curso: 'Direito',
      status: 'Formado',
      periodo: '2026-1',
      dataColacao: '15/01/2026', // Já colou grau! Ignorado no DRA137, mas exporta DRA100 e DRA139
      resultado: 'Abrir DRA137 (Colação Especial), Abrir DRA100 (Emitir Doc. Finais), Abrir DRA139 (Cerimônia de Formatura)',
      enade: 'Estudante não habilitado ao Enade, em razão do calendário do ciclo avaliativo',
    },
    {
      mat: '20212014',
      cpf: '345.678.901-23',
      nome: 'Beatriz Costa Alcantara',
      curso: 'Ciência da Computação',
      status: 'Formado',
      periodo: '2026-2',
      dataColacao: '',
      resultado: 'Abrir DRA100 (Emitir Doc. Finais), Cerimônia de Formatura Realizada, NÃO Abrir DRA139 (Cerimônia de Formatura)',
      enade: 'Estudante habilitado, em situação regular no Enade (2025)',
    },
    {
      mat: '20212055',
      cpf: '456.789.012-34',
      nome: 'Rodrigo Mendonça Faria',
      curso: 'Enfermagem',
      status: 'Formado',
      periodo: '2026-1',
      dataColacao: '',
      resultado: 'Abrir DRA137 (Colação Especial), Abrir DRA100 (Emitir Doc. Finais)',
      enade: 'Estudante habilitado, em situação regular no Enade (2025)',
    },
    {
      mat: '20211090',
      cpf: '567.890.123-45',
      nome: 'Camila Fernandes Rocha',
      curso: 'Pedagogia',
      status: 'Formando',
      periodo: '2026-2',
      dataColacao: '',
      resultado: 'Resolver Exigência do DRA045 (Análise Documental)', // DENY
      enade: 'Estudante não habilitado ao Enade, em razão do calendário do ciclo avaliativo',
    },
    {
      mat: '20212078',
      cpf: '678.901.234-56',
      nome: 'Thiago Nogueira Lima',
      curso: 'Engenharia Civil',
      status: 'Formando',
      periodo: '2026-1',
      dataColacao: '',
      resultado: 'Pendência de Carga Horária / Créditos', // DENY
      enade: 'Estudante habilitado, em situação irregular no Enade (2025)',
    },
    {
      mat: '20202011',
      cpf: '789.012.345-67',
      nome: 'Juliana Barbosa Martins',
      curso: 'Fisioterapia',
      status: 'Formado',
      periodo: '2025-2', // Outro período
      dataColacao: '',
      resultado: 'Abrir DRA137 (Colação Especial), Abrir DRA100 (Emitir Doc. Finais), Abrir DRA139 (Cerimônia de Formatura)',
      enade: 'Estudante habilitado, em situação regular no Enade (2025)',
    },
    {
      mat: '20211033',
      cpf: '890.123.456-78',
      nome: 'Guilherme Souza Ramos',
      curso: 'Psicologia',
      status: 'Formado',
      periodo: '2026-2',
      dataColacao: '',
      resultado: 'Abrir DRA139 (Cerimônia de Formatura)',
      enade: 'Estudante não habilitado ao Enade, em razão do calendário do ciclo avaliativo',
    },
    {
      mat: '20212099',
      cpf: '901.234.567-89',
      nome: 'Fernanda Meireles Lima',
      curso: 'Administração',
      status: 'Formado',
      periodo: '2026-1',
      dataColacao: '',
      resultado: 'Processo Concluído / Tudo OK', // DENY
      enade: 'Estudante habilitado, em situação regular no Enade (2025)',
    },
    {
      mat: '20211012',
      cpf: '012.345.678-90',
      nome: 'Matheus Henrique Silveira',
      curso: 'Direito',
      status: 'Formado',
      periodo: '2026-2',
      dataColacao: '',
      resultado: 'Abrir DRA137 (Colação Especial), Abrir DRA100 (Emitir Doc. Finais), Abrir DRA139 (Cerimônia de Formatura)',
      enade: 'Estudante habilitado, em situação regular no Enade (2025)',
    },
    {
      mat: '20211066',
      cpf: '123.098.456-21',
      nome: 'Larissa Moura Dantas',
      curso: 'Ciência da Computação',
      status: 'Formando',
      periodo: '2026-1',
      dataColacao: '',
      resultado: 'Aguardar Finalização do DRA045 (Análise Documental)', // DENY
      enade: 'Estudante não habilitado ao Enade, em razão do calendário do ciclo avaliativo',
    },
    {
      mat: '20212080',
      cpf: '234.109.567-32',
      nome: 'Eduardo Castro Pires',
      curso: 'Engenharia de Produção',
      status: 'Formado',
      periodo: '2026-2',
      dataColacao: '10/02/2026', // Já colou grau
      resultado: 'Abrir DRA100 (Emitir Doc. Finais), Abrir DRA139 (Cerimônia de Formatura)',
      enade: 'Estudante habilitado, em situação regular no Enade (2025)',
    },
    {
      mat: '20211054',
      cpf: '345.210.678-43',
      nome: 'Aline Vasconcelos Ribeiro',
      curso: 'Arquitetura e Urbanismo',
      status: 'Formado',
      periodo: '2026-1',
      dataColacao: '',
      resultado: 'Abrir DRA137 (Colação Especial), Abrir DRA100 (Emitir Doc. Finais), Abrir DRA139 (Cerimônia de Formatura)',
      enade: 'Estudante habilitado, em situação regular no Enade (2025)',
    },
    {
      mat: '20211029',
      cpf: '456.321.789-54',
      nome: 'Gabriel Antunes Prado',
      curso: 'Farmácia',
      status: 'Formado',
      periodo: '2026-2',
      dataColacao: '',
      resultado: 'Abrir DRA137 (Colação Especial), Abrir DRA100 (Emitir Doc. Finais)',
      enade: 'Estudante habilitado, em situação regular no Enade (2025)',
    },
    {
      mat: '20201088',
      cpf: '567.432.890-65',
      nome: 'Priscila Dias Cardoso',
      curso: 'Nutrição',
      status: 'Formado',
      periodo: '2025-1',
      dataColacao: '',
      resultado: 'Abrir DRA137 (Colação Especial), Abrir DRA100 (Emitir Doc. Finais)',
      enade: 'Estudante habilitado, em situação regular no Enade (2025)',
    },
  ];

  const sheetData: any[][] = [headers];

  sampleStudents.forEach((st, idx) => {
    const row = new Array(40).fill('');
    row[0] = idx + 1;
    row[1] = st.mat;
    row[2] = st.cpf;
    row[3] = st.nome;
    row[4] = st.curso;
    row[5] = 'Bonsucesso';
    row[6] = 'Noite';
    row[7] = st.status;
    row[8] = st.periodo;
    row[16] = st.dataColacao;
    row[37] = st.resultado;
    row[38] = st.enade;
    sheetData.push(row);
  });

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  XLSX.utils.book_append_sheet(wb, ws, 'Relatório Analítico de Formado');

  // Also add auxiliary sheet 'Colação Realizada'
  const colacaoData = [
    ['Matrícula', 'Data da Cerimônia', 'Local'],
    ['20212014', '15/01/2026', 'Auditório Principal'],
    ['20212080', '10/02/2026', 'Auditório Principal'],
  ];
  const wsColacao = XLSX.utils.aoa_to_sheet(colacaoData);
  XLSX.utils.book_append_sheet(wb, wsColacao, 'Colação Realizada');

  return wb;
}

export function loadSampleDataset(): ProcessedDataset {
  const wb = generateSampleWorkbook();
  return parseWorkbookData(wb, 'Relatório Analítico de Formado (Exemplo TI).xlsx', ['2026-1', '2026-2']);
}
