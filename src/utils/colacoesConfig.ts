import { ColacaoGroup } from '../types';
import { norm } from './excelEngine';

export const STORAGE_KEY_COLACOES = 'unisuam_colacoes_realizadas_config';

export const DEFAULT_COLACOES_GROUPS: ColacaoGroup[] = [
  {
    id: 'grupo-anteriores',
    titulo: 'Colações Anteriores (Já Realizadas)',
    data: '',
    jaRealizada: true,
    cursos: [
      'Arquitetura e Urbanismo',
      'Bacharelado em Biologia',
      'Bacharelado em Educação Física',
      'Ciência da Computação',
      'Engenharia Civil',
      'Engenharia de Produção',
      'Engenharia Elétrica',
      'Engenharia Mecânica',
      'Licenciatura em Educação Física',
      'Licenciatura em História',
      'Licenciatura em Letras',
      'Licenciatura em Pedagogia',
      'Superior de Tecnologia em Análise e Desenvolvimento de Sistemas',
      'Superior de Tecnologia em Design de Interiores',
      'Superior de Tecnologia em Gestão da Tecnologia da Informação',
      'Superior de Tecnologia em Redes de Computadores',
      'Farmácia',
      'Nutrição',
      'Superior de Tecnologia em Gastronomia',
      'Serviço Social',
      'Superior de Tecnologia em Gestão Ambiental',
      'Superior de Tecnologia em Gestão Hospitalar',
      'Odontologia',
      'Fisioterapia',
      'Bacharelado em Biomedicina',
      'Superior de Tecnologia em Estética e Cosmética',
    ],
  },
  {
    id: 'grupo-19-setembro',
    titulo: 'Colação 19 de Setembro',
    data: '2026-09-19',
    jaRealizada: false,
    cursos: [
      'Direito',
      'Comunicação Social',
      'Superior de Tecnologia em Marketing',
      'Superior de Tecnologia em Design Gráfico',
      'Superior de Tecnologia em Gestão de Serviços Jurídicos Notariais',
      'Enfermagem',
      'Ciências Contábeis',
    ],
  },
  {
    id: 'grupo-20-setembro',
    titulo: 'Colação 20 de Setembro',
    data: '2026-09-20',
    jaRealizada: false,
    cursos: [
      'Superior de Tecnologia em Gestão de Recursos Humanos',
      'Superior de Tecnologia em Gestão Financeira',
      'Superior de Tecnologia em Gestão Pública',
      'Superior de Tecnologia em Gestão de Negócios e Inovação',
      'Superior de Tecnologia em Automação Industrial',
      'Superior de Tecnologia em Gestão Comercial',
      'Superior de Tecnologia em Gestão de Segurança Pública',
      'Superior de Tecnologia em Processos Gerenciais',
      'Psicologia',
    ],
  },
];

/**
 * Checks whether a ColacaoGroup is considered completed/realizada.
 * It is realized if:
 * 1. jaRealizada is explicitly true, OR
 * 2. It has a scheduled date and the reference date (default: now) has arrived or passed the end of that day.
 */
export function isGroupRealizado(group: ColacaoGroup, refDate: Date = new Date()): boolean {
  if (group.jaRealizada) return true;
  if (!group.data) return false;

  // Format YYYY-MM-DD
  const match = group.data.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;
  const day = parseInt(match[3], 10);

  // Consider completed at the end of that day (23:59:59)
  const eventEndOfDay = new Date(year, month, day, 23, 59, 59);
  return refDate.getTime() >= eventEndOfDay.getTime();
}

/**
 * Returns a Set of normalized course strings that are currently considered "Colação Realizada".
 */
export function getRealizedCoursesSet(
  groups: ColacaoGroup[],
  refDate: Date = new Date()
): Set<string> {
  const realizedSet = new Set<string>();

  for (const group of groups) {
    if (isGroupRealizado(group, refDate)) {
      for (const curso of group.cursos) {
        const n = norm(curso);
        if (n) realizedSet.add(n);
      }
    }
  }

  return realizedSet;
}

/**
 * Evaluates whether a student's course name matches any realized course.
 * Performs robust matching for common spreadsheet naming variations.
 */
export function isCursoColacaoRealizada(
  cursoAluno: string,
  realizedCoursesSet: Set<string>
): boolean {
  if (!cursoAluno || realizedCoursesSet.size === 0) return false;
  const alunoNorm = norm(cursoAluno);
  if (!alunoNorm) return false;

  // 1. Direct exact match
  if (realizedCoursesSet.has(alunoNorm)) return true;

  // 2. Substring or word matching
  for (const cRealizado of realizedCoursesSet) {
    // If student course contains the realized course name (e.g. "Direito - Noturno" contains "Direito")
    if (alunoNorm.includes(cRealizado)) return true;
    
    // If realized course contains the student course name (if sufficiently descriptive, >= 6 chars)
    if (cRealizado.length >= 6 && cRealizado.includes(alunoNorm)) return true;
  }

  return false;
}

/**
 * Loads configured groups from localStorage or returns defaults.
 */
export function getStoredColacoesConfig(): ColacaoGroup[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COLACOES);
    if (!raw) return DEFAULT_COLACOES_GROUPS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.warn('Erro ao carregar configurações de colação do localStorage:', err);
  }
  return DEFAULT_COLACOES_GROUPS;
}

/**
 * Saves configured groups to localStorage.
 */
export function saveStoredColacoesConfig(groups: ColacaoGroup[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_COLACOES, JSON.stringify(groups));
  } catch (err) {
    console.error('Erro ao salvar configurações de colação no localStorage:', err);
  }
}
