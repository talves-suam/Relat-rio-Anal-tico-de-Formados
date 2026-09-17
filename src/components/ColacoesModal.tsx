import React, { useState, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  GraduationCap,
  CheckCircle2,
  Clock,
  RotateCcw,
  Search,
  AlertCircle,
  HelpCircle,
  Save,
} from 'lucide-react';
import { ColacaoGroup } from '../types';
import {
  DEFAULT_COLACOES_GROUPS,
  isGroupRealizado,
} from '../utils/colacoesConfig';

interface ColacoesModalProps {
  isOpen: boolean;
  onClose: () => void;
  colacoesConfig: ColacaoGroup[];
  onSaveConfig: (newConfig: ColacaoGroup[]) => void;
  onApplyAndReprocess?: () => void;
}

export const ColacoesModal: React.FC<ColacoesModalProps> = ({
  isOpen,
  onClose,
  colacoesConfig,
  onSaveConfig,
  onApplyAndReprocess,
}) => {
  const [groups, setGroups] = useState<ColacaoGroup[]>(() =>
    JSON.parse(JSON.stringify(colacoesConfig && colacoesConfig.length > 0 ? colacoesConfig : DEFAULT_COLACOES_GROUPS))
  );

  // Sync state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setGroups(
        JSON.parse(
          JSON.stringify(
            colacoesConfig && colacoesConfig.length > 0
              ? colacoesConfig
              : DEFAULT_COLACOES_GROUPS
          )
        )
      );
      setSearchTerm('');
      setNewGroupTitle('');
      setNewGroupDate('');
      setNewGroupCourses('');
      setNewGroupJaRealizada(false);
    }
  }, [isOpen, colacoesConfig]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCourseInputs, setNewCourseInputs] = useState<Record<string, string>>({});

  // New Group Form State
  const [newGroupTitle, setNewGroupTitle] = useState('');
  const [newGroupDate, setNewGroupDate] = useState('');
  const [newGroupCourses, setNewGroupCourses] = useState('');
  const [newGroupJaRealizada, setNewGroupJaRealizada] = useState(false);

  const today = useMemo(() => new Date(), []);
  const todayFormatted = useMemo(() => {
    return today.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }, [today]);

  // Statistics
  const stats = useMemo(() => {
    let totalCursos = 0;
    let cursosRealizadosCount = 0;
    let cursosAgendadosCount = 0;

    for (const g of groups) {
      const isDone = isGroupRealizado(g, today);
      totalCursos += g.cursos.length;
      if (isDone) {
        cursosRealizadosCount += g.cursos.length;
      } else {
        cursosAgendadosCount += g.cursos.length;
      }
    }

    return { totalCursos, cursosRealizadosCount, cursosAgendadosCount };
  }, [groups, today]);

  if (!isOpen) return null;

  // Toggle jaRealizada
  const handleToggleRealizada = (groupId: string) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          return { ...g, jaRealizada: !g.jaRealizada };
        }
        return g;
      })
    );
  };

  // Update date
  const handleUpdateDate = (groupId: string, newDate: string) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          return { ...g, data: newDate };
        }
        return g;
      })
    );
  };

  // Remove Course
  const handleRemoveCourse = (groupId: string, courseIdx: number) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          const updated = [...g.cursos];
          updated.splice(courseIdx, 1);
          return { ...g, cursos: updated };
        }
        return g;
      })
    );
  };

  // Add course to existing group
  const handleAddCourseToGroup = (groupId: string) => {
    const text = (newCourseInputs[groupId] || '').trim();
    if (!text) return;

    // Support comma or newline separated
    const addedList = text
      .split(/[\n,]+/)
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    if (addedList.length === 0) return;

    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          const uniqueCourses = Array.from(new Set([...g.cursos, ...addedList]));
          return { ...g, cursos: uniqueCourses };
        }
        return g;
      })
    );

    setNewCourseInputs((prev) => ({ ...prev, [groupId]: '' }));
  };

  // Delete entire group
  const handleDeleteGroup = (groupId: string) => {
    if (groups.length <= 1) {
      alert('Você deve manter pelo menos um grupo de colação cadastrado.');
      return;
    }
    if (confirm('Deseja realmente remover este grupo de colação?')) {
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
    }
  };

  // Add New Group
  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupTitle.trim()) {
      alert('Por favor, informe o título do grupo de colação.');
      return;
    }

    const cursosList = newGroupCourses
      .split(/[\n,]+/)
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    const newGroup: ColacaoGroup = {
      id: `grupo-${Date.now()}`,
      titulo: newGroupTitle.trim(),
      data: newGroupDate,
      jaRealizada: newGroupJaRealizada,
      cursos: Array.from(new Set(cursosList)),
    };

    setGroups((prev) => [...prev, newGroup]);
    setNewGroupTitle('');
    setNewGroupDate('');
    setNewGroupCourses('');
    setNewGroupJaRealizada(false);
    setShowAddForm(false);
  };

  // Reset to default
  const handleResetDefaults = () => {
    if (
      confirm(
        'Tem certeza que deseja restaurar a lista padrão de colações da UNISUAM? Suas edições personalizadas serão substituídas.'
      )
    ) {
      setGroups(JSON.parse(JSON.stringify(DEFAULT_COLACOES_GROUPS)));
    }
  };

  // Save changes
  const handleSaveAndApply = () => {
    onSaveConfig(groups);
    if (onApplyAndReprocess) {
      onApplyAndReprocess();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
        id="modal-colacoes-realizadas"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-sm shadow-amber-500/30">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Colações Realizadas & Calendário de Cursos
              </h2>
              <p className="text-xs text-slate-500">
                Alunos dos cursos com colação realizada são automaticamente{' '}
                <strong className="text-slate-800 font-semibold">
                  excluídos do relatório DRA139
                </strong>
                .
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Fechar"
            id="btn-close-colacoes-modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Informative Stats Banner */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                Colação Já Realizada
              </span>
              <strong className="text-emerald-700 text-sm">
                {stats.cursosRealizadosCount} cursos (Excluídos DRA139)
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
            <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                Colação Agendada / Futura
              </span>
              <strong className="text-blue-700 text-sm">
                {stats.cursosAgendadosCount} cursos
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
            <Calendar className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                Data do Sistema
              </span>
              <strong className="text-slate-800 text-sm">{todayFormatted}</strong>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white">
          {/* Rule description card */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <span className="font-semibold text-amber-950">
                Regra Automática de Exclusão DRA139:
              </span>
              <p>
                Quando a data agendada para uma colação passar da data atual (ou quando você marcar o botão{' '}
                <span className="font-semibold underline">"Marcar como Já Realizada"</span>), nenhum formando desses cursos receberá solicitação de abertura do protocolo{' '}
                <span className="font-semibold">DRA139 (Cerimônia de Formatura)</span>.
              </p>
            </div>
          </div>

          {/* Controls: Search & Add Group Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar curso na lista..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                id="input-search-curso-colacao"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-colors"
                id="btn-toggle-add-group"
              >
                <Plus className="h-3.5 w-3.5" />
                {showAddForm ? 'Cancelar Novo Grupo' : 'Nova Data de Colação'}
              </button>

              <button
                type="button"
                onClick={handleResetDefaults}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
                title="Restaurar listas originais do UNISUAM"
                id="btn-reset-colacoes-defaults"
              >
                <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                Padrão UNISUAM
              </button>
            </div>
          </div>

          {/* Add Group Form */}
          {showAddForm && (
            <form
              onSubmit={handleCreateGroup}
              className="p-4 bg-slate-50 border border-amber-200 rounded-xl space-y-3 animate-in fade-in duration-150"
            >
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-amber-600" />
                Cadastrar Novo Grupo / Data de Colação
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nome / Descrição da Colação:
                  </label>
                  <input
                    type="text"
                    required
                    value={newGroupTitle}
                    onChange={(e) => setNewGroupTitle(e.target.value)}
                    placeholder="Ex: Colação Polo Bonsucesso - Outubro"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Data do Evento (Opcional):
                  </label>
                  <input
                    type="date"
                    value={newGroupDate}
                    onChange={(e) => setNewGroupDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Cursos que Colarão Grau (separe por vírgula ou uma linha por curso):
                </label>
                <textarea
                  rows={3}
                  value={newGroupCourses}
                  onChange={(e) => setNewGroupCourses(e.target.value)}
                  placeholder="Ex: Engenharia Mecânica, Pedagogia, Nutrição..."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={newGroupJaRealizada}
                    onChange={(e) => setNewGroupJaRealizada(e.target.checked)}
                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span>Marcar imediatamente como <strong>Já Realizada</strong> (Excluir do DRA139)</span>
                </label>

                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm transition-colors"
                >
                  Salvar Grupo
                </button>
              </div>
            </form>
          )}

          {/* Groups Accordion / Cards */}
          <div className="space-y-4">
            {groups.map((group) => {
              const isDone = isGroupRealizado(group, today);
              const filteredCourses = group.cursos.filter((c) =>
                c.toLowerCase().includes(searchTerm.toLowerCase())
              );

              if (searchTerm && filteredCourses.length === 0) {
                return null;
              }

              return (
                <div
                  key={group.id}
                  className={`rounded-xl border transition-all overflow-hidden ${
                    isDone
                      ? 'bg-emerald-50/20 border-emerald-300'
                      : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  {/* Group Header */}
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isDone
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}
                      >
                        {isDone ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            Já Realizada (Excluído do DRA139)
                          </>
                        ) : (
                          <>
                            <Clock className="h-3.5 w-3.5 text-blue-600" />
                            Agendada
                          </>
                        )}
                      </span>

                      <h4 className="font-bold text-slate-900 text-sm">
                        {group.titulo}
                      </h4>

                      <span className="text-xs text-slate-500 font-medium">
                        ({group.cursos.length}{' '}
                        {group.cursos.length === 1 ? 'curso' : 'cursos'})
                      </span>
                    </div>

                    {/* Group Action Controls */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Date input */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-white px-2 py-1 rounded-lg border border-slate-200">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-[11px] text-slate-500">Data:</span>
                        <input
                          type="date"
                          value={group.data || ''}
                          onChange={(e) => handleUpdateDate(group.id, e.target.value)}
                          className="text-xs border-0 bg-transparent focus:ring-0 p-0 text-slate-800 font-medium"
                          title="Data da colação de grau"
                        />
                      </div>

                      {/* Force realized toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleRealizada(group.id)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                          group.jaRealizada
                            ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                        title="Alternar se já foi realizada ou não"
                      >
                        {group.jaRealizada ? '✓ Já Realizada' : 'Marcar Realizada'}
                      </button>

                      {/* Delete group */}
                      <button
                        type="button"
                        onClick={() => handleDeleteGroup(group.id)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir este grupo"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Group Courses Badges */}
                  <div className="p-4">
                    {filteredCourses.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">
                        Nenhum curso cadastrado neste grupo.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {filteredCourses.map((curso, idx) => (
                          <span
                            key={idx}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                              isDone
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                                : 'bg-slate-100 text-slate-800 border-slate-200'
                            }`}
                          >
                            <span>{curso}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCourse(group.id, idx)}
                              className="text-slate-400 hover:text-red-600 p-0.5 rounded transition-colors"
                              title={`Remover ${curso}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Quick Add Course Input */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Adicionar novo curso neste grupo (ex: Engenharia Química)..."
                        value={newCourseInputs[group.id] || ''}
                        onChange={(e) =>
                          setNewCourseInputs((prev) => ({
                            ...prev,
                            [group.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCourseToGroup(group.id);
                          }
                        }}
                        className="flex-1 text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddCourseToGroup(group.id)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Adicionar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            As alterações são salvas localmente no seu navegador e aplicadas instantaneamente às planilhas.
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
              id="btn-cancel-colacoes"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveAndApply}
              className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm shadow-amber-600/30 flex items-center gap-2 transition-all"
              id="btn-save-colacoes"
            >
              <Save className="h-4 w-4" />
              Salvar & Aplicar às Listas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
