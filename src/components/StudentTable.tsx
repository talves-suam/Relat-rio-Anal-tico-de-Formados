import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Calendar,
  Award,
  BookOpen,
  FileCheck,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { StudentEvaluated } from '../types';

interface StudentTableProps {
  students: StudentEvaluated[];
  onSelectStudent?: (student: StudentEvaluated) => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({ students }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | '137' | '100' | '139' | 'enade' | 'blocked' | 'colou'>('all');
  const [selectedStudentModal, setSelectedStudentModal] = useState<StudentEvaluated | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filtering logic
  const filteredStudents = useMemo(() => {
    let list = students;

    // Filter by destination tab
    if (filterTab === '137') {
      list = list.filter((s) => s.exportar137);
    } else if (filterTab === '100') {
      list = list.filter((s) => s.exportar100);
    } else if (filterTab === '139') {
      list = list.filter((s) => s.exportar139);
    } else if (filterTab === 'enade') {
      list = list.filter((s) => s.exportarEnade);
    } else if (filterTab === 'blocked') {
      list = list.filter((s) => !s.exportar137 && !s.exportar100 && !s.exportar139 && !s.exportarEnade);
    } else if (filterTab === 'colou') {
      list = list.filter((s) => s.jaColouGrau);
    }

    // Filter by search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.matricula.toLowerCase().includes(q) ||
          s.nome.toLowerCase().includes(q) ||
          s.cpf.includes(q) ||
          s.resultadoOriginal.toLowerCase().includes(q) ||
          s.periodo.toLowerCase().includes(q)
      );
    }

    return list;
  }, [students, filterTab, searchTerm]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  const handleTabChange = (tab: any) => {
    setFilterTab(tab);
    setCurrentPage(1);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Conferência & Auditoria dos Alunos da Planilha
          </h2>
          <p className="text-xs text-slate-500">
            Pesquise por matrícula, nome ou CPF para conferir a aplicação das fórmulas e destinos
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full md:w-80">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="input-search-student"
            type="text"
            placeholder="Pesquisar matrícula, nome, CPF..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-medium">
        <button
          onClick={() => handleTabChange('all')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
            filterTab === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Todos ({students.length})
        </button>
        <button
          onClick={() => handleTabChange('enade')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
            filterTab === 'enade'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
          }`}
        >
          ENADE ({students.filter((s) => s.exportarEnade).length})
        </button>
        <button
          onClick={() => handleTabChange('137')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
            filterTab === '137'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
          }`}
        >
          DRA137 ({students.filter((s) => s.exportar137).length})
        </button>
        <button
          onClick={() => handleTabChange('100')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
            filterTab === '100'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
          }`}
        >
          DRA100 ({students.filter((s) => s.exportar100).length})
        </button>
        <button
          onClick={() => handleTabChange('139')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
            filterTab === '139'
              ? 'bg-violet-600 text-white shadow-xs'
              : 'bg-violet-50 text-violet-700 hover:bg-violet-100'
          }`}
        >
          DRA139 ({students.filter((s) => s.exportar139).length})
        </button>
        <button
          onClick={() => handleTabChange('colou')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
            filterTab === 'colou'
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
          }`}
        >
          Já Colou Grau ({students.filter((s) => s.jaColouGrau).length})
        </button>
        <button
          onClick={() => handleTabChange('blocked')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
            filterTab === 'blocked'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
          }`}
        >
          Bloqueados/Exigência ({students.filter((s) => !s.exportar137 && !s.exportar100 && !s.exportar139 && !s.exportarEnade).length})
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
              <th className="py-2.5 px-3">Matrícula</th>
              <th className="py-2.5 px-3">Nome do Aluno</th>
              <th className="py-2.5 px-3">Período (Col. I)</th>
              <th className="py-2.5 px-3">Colação (Col. Q)</th>
              <th className="py-2.5 px-3">Resultado Calculado (Col. AL)</th>
              <th className="py-2.5 px-3">Destinos Habilitados</th>
              <th className="py-2.5 px-3">Situação ENADE</th>
              <th className="py-2.5 px-3 text-center">Detalhes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {paginatedStudents.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  Nenhum aluno encontrado para os filtros aplicados.
                </td>
              </tr>
            ) : (
              paginatedStudents.map((aluno) => {
                const isBlocked =
                  !aluno.exportar137 &&
                  !aluno.exportar100 &&
                  !aluno.exportar139 &&
                  !aluno.exportarEnade;

                return (
                  <tr
                    key={aluno.matricula}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {aluno.matricula}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {aluno.nome || 'Nome não informado'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {aluno.periodo}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {aluno.dataColacao ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          {aluno.dataColacao}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Vazio</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 max-w-xs">
                      <p
                        className="truncate text-[11px] text-slate-700 font-medium"
                        title={aluno.resultadoOriginal}
                      >
                        {aluno.resultadoOriginal || '-'}
                      </p>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        {aluno.exportarEnade && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            ENADE
                          </span>
                        )}
                        {aluno.exportar137 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">
                            DRA137
                          </span>
                        )}
                        {aluno.exportar100 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-800">
                            DRA100
                          </span>
                        )}
                        {aluno.exportar139 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-violet-100 text-violet-800">
                            DRA139
                          </span>
                        )}
                        {isBlocked && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200"
                            title={aluno.motivoBloqueio || 'Bloqueado por exigência'}
                          >
                            Bloqueado
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[11px] text-slate-600">
                        {aluno.situacaoEnade || (aluno.enadeText.includes('nao habilitado') ? 'Não Habilitado' : '-')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => setSelectedStudentModal(aluno)}
                        className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                        title="Ver auditoria detalhada do aluno"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>Exibindo</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-800 font-medium"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>de {filteredStudents.length} alunos filtrados</span>
        </div>

        <div className="flex items-center gap-1 self-center">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-3 py-1 font-medium text-slate-700">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Student Details Inspection Modal */}
      {selectedStudentModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedStudentModal(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedStudentModal.nome}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Matrícula: {selectedStudentModal.matricula} • CPF: {selectedStudentModal.cpf || 'Não informado'}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudentModal(null)}
                className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Fechar
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Destination status flags */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className={`p-3 rounded-xl border ${selectedStudentModal.exportarEnade ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                  <div className="font-bold flex items-center gap-1.5">
                    {selectedStudentModal.exportarEnade ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4" />}
                    <span>ENADE</span>
                  </div>
                  <div className="text-[10px] mt-1">{selectedStudentModal.exportarEnade ? 'Apto para envio' : 'Não enviado'}</div>
                </div>

                <div className={`p-3 rounded-xl border ${selectedStudentModal.exportar137 ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                  <div className="font-bold flex items-center gap-1.5">
                    {selectedStudentModal.exportar137 ? <CheckCircle2 className="h-4 w-4 text-blue-600" /> : <XCircle className="h-4 w-4" />}
                    <span>DRA137</span>
                  </div>
                  <div className="text-[10px] mt-1">{selectedStudentModal.exportar137 ? 'Colação Especial' : selectedStudentModal.jaColouGrau ? 'Ignorado (já colou)' : 'Não solicitado'}</div>
                </div>

                <div className={`p-3 rounded-xl border ${selectedStudentModal.exportar100 ? 'bg-indigo-50 border-indigo-200 text-indigo-800' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                  <div className="font-bold flex items-center gap-1.5">
                    {selectedStudentModal.exportar100 ? <CheckCircle2 className="h-4 w-4 text-indigo-600" /> : <XCircle className="h-4 w-4" />}
                    <span>DRA100</span>
                  </div>
                  <div className="text-[10px] mt-1">{selectedStudentModal.exportar100 ? 'Docs Finais' : 'Não solicitado'}</div>
                </div>

                <div className={`p-3 rounded-xl border ${selectedStudentModal.exportar139 ? 'bg-violet-50 border-violet-200 text-violet-800' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                  <div className="font-bold flex items-center gap-1.5">
                    {selectedStudentModal.exportar139 ? <CheckCircle2 className="h-4 w-4 text-violet-600" /> : <XCircle className="h-4 w-4" />}
                    <span>DRA139</span>
                  </div>
                  <div className="text-[10px] mt-1">{selectedStudentModal.exportar139 ? 'Cerimônia' : 'Não solicitado'}</div>
                </div>
              </div>

              {/* Resultado & Bloqueios */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800">Resultado Avaliado (Coluna AL):</div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800">
                  {selectedStudentModal.resultadoOriginal || 'Vazio'}
                </div>
                {selectedStudentModal.motivoBloqueio && (
                  <div className="text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 text-[11px] flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{selectedStudentModal.motivoBloqueio}</span>
                  </div>
                )}
              </div>

              {/* Data de Colação */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-1">Data de Colação (Coluna Q):</span>
                  <span className="text-slate-900 font-medium">
                    {selectedStudentModal.dataColacao ? selectedStudentModal.dataColacao : 'Não registrada (vazio)'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-1">Período de Conclusão:</span>
                  <span className="text-slate-900 font-medium">{selectedStudentModal.periodo}</span>
                </div>
              </div>

              {/* ENADE Information */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-700 block">Classificação ENADE Concluinte:</span>
                <p className="text-slate-600 text-[11px]">
                  <strong>Ano:</strong> {selectedStudentModal.anoEnade} •{' '}
                  <strong>Condição:</strong> {selectedStudentModal.condicaoEnade} •{' '}
                  <strong>Situação:</strong> {selectedStudentModal.situacaoEnade || 'Não Habilitado'}
                </p>
                <p className="text-slate-500 text-[11px]">
                  <strong>Motivo:</strong> {selectedStudentModal.motivoEnade || 'Não Possui'}
                </p>
              </div>

              {/* Pareceres que serão gerados */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-700 block">Parecer Interno / Externo nos Processos:</span>
                <p className="text-slate-600 text-[11px]">
                  {selectedStudentModal.exportar137 && selectedStudentModal.parecer137}
                  {selectedStudentModal.exportar100 && ` • ${selectedStudentModal.parecer100}`}
                  {selectedStudentModal.exportar139 && ` • Cerimônia de Formatura (Parecer Coruja)`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
