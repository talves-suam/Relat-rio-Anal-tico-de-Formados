import React from 'react';
import { Calendar, Check, Filter } from 'lucide-react';

interface PeriodSelectorProps {
  periodosDetectados: string[];
  periodosSelecionados: string[];
  todosAlunosContagemPorPeriodo: Record<string, number>;
  onTogglePeriodo: (periodo: string) => void;
  onSelectDefault: () => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  periodosDetectados,
  periodosSelecionados,
  todosAlunosContagemPorPeriodo,
  onTogglePeriodo,
  onSelectDefault,
  onSelectAll,
  onClearAll,
}) => {
  const isDefaultSelected =
    periodosSelecionados.length === 2 &&
    periodosSelecionados.includes('2026-1') &&
    periodosSelecionados.includes('2026-2');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Período Letivo de Conclusão Provável
            </h2>
            <p className="text-xs text-slate-500">
              Coluna I do sistema da TI • Padrão selecionado: <strong>2026-1</strong> e <strong>2026-2</strong>
            </p>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            id="btn-period-default"
            type="button"
            onClick={onSelectDefault}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              isDefaultSelected
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            Padrão (2026-1 e 2026-2)
          </button>
          <button
            id="btn-period-all"
            type="button"
            onClick={onSelectAll}
            className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Selecionar Todos
          </button>
          <button
            id="btn-period-clear"
            type="button"
            onClick={onClearAll}
            className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Limpar
          </button>
        </div>
      </div>

      {/* Badges / Chips */}
      <div className="flex items-center gap-2 flex-wrap pt-1">
        {periodosDetectados.length === 0 ? (
          <div className="text-xs text-slate-400 italic py-1">
            Nenhum período detectado na planilha.
          </div>
        ) : (
          periodosDetectados.map((periodo) => {
            const isSelected = periodosSelecionados.includes(periodo);
            const count = todosAlunosContagemPorPeriodo[periodo] || 0;

            return (
              <button
                key={periodo}
                id={`btn-period-${periodo}`}
                type="button"
                onClick={() => onTogglePeriodo(periodo)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`h-4 w-4 rounded flex items-center justify-center ${
                    isSelected ? 'bg-emerald-500 text-white' : 'border border-slate-300'
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
                <span>{periodo}</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] ${
                    isSelected ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count} alunos
                </span>
              </button>
            );
          })
        )}
      </div>

      {periodosSelecionados.length === 0 && (
        <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <Filter className="h-4 w-4 shrink-0 text-amber-600" />
          <span>Atenção: Nenhum período selecionado. Os relatórios gerados estarão vazios até que ao menos um período seja marcado.</span>
        </div>
      )}
    </div>
  );
};
