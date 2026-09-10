import React from 'react';
import { HelpCircle, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';

interface FormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FormulaModal: React.FC<FormulaModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Regras das Fórmulas Excel & Lógica Python
              </h3>
              <p className="text-xs text-slate-300">
                Detalhamento das condições avaliadas para geração dos relatórios
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            Fechar
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
          {/* Section 1: Coluna Resultado */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              1. Fórmulas de Concatenação de Processos (DRA137, DRA100, DRA139)
            </h4>
            <p className="text-slate-600 leading-relaxed">
              O sistema avalia as colunas T/U (DRA137), W/X (DRA100) e Z/AA (DRA139):
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-2">
              <li><strong>DRA137 (Colação Especial):</strong> Se U="Em Exigência" ou T="NÃO"/"NAO" &rarr; Adiciona <em>"Abrir DRA137 (Colação Especial)"</em>.</li>
              <li><strong>DRA100 (Emitir Documentos Finais):</strong> Se X="Em Exigência" ou W="NÃO"/"NAO" &rarr; Adiciona <em>"Abrir DRA100 (Emitir Doc. Finais)"</em>.</li>
              <li><strong>DRA139 (Cerimônia de Formatura):</strong> Se AA="Em Exigência" ou Z="NÃO"/"NAO" &rarr; Se já constar na aba 'Colação Realizada', gera <em>"Cerimônia de Formatura Realizada, NÃO Abrir DRA139"</em>; caso contrário, <em>"Abrir DRA139 (Cerimônia de Formatura)"</em>.</li>
            </ul>
          </div>

          {/* Section 2: Travas e Exigências */}
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 space-y-2">
            <h4 className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              2. Travas de Bloqueio Geral (Regra Python)
            </h4>
            <p className="text-amber-800 leading-relaxed">
              Se a Coluna AL (Resultado) contiver qualquer uma das seguintes frases de bloqueio, o aluno <strong>NÃO</strong> é exportado para nenhum relatório:
            </p>
            <div className="grid grid-cols-2 gap-2 text-amber-900 font-mono text-[11px] bg-white p-2.5 rounded-lg border border-amber-200">
              <div>• "resolver exigencia"</div>
              <div>• "aguardar finalizacao"</div>
              <div>• "processo concluido"</div>
              <div>• "pendencia de carga horaria"</div>
              <div>• "abrir dra045"</div>
              <div>• "sem pendencia de carga horaria"</div>
            </div>
          </div>

          {/* Section 3: Regra especial DRA137 */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 space-y-2">
            <h4 className="text-sm font-bold text-blue-900 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              3. Regra Especial do Processo DRA137 (Coluna Q)
            </h4>
            <p className="text-blue-800 leading-relaxed">
              Mesmo que a coluna Resultado indique DRA137, o script verifica a <strong>Coluna Q (Data de Colação de Grau)</strong>:
            </p>
            <p className="text-blue-700 bg-white p-2.5 rounded-lg border border-blue-200">
              Se a Coluna Q contiver uma data de colação preenchida (aluno já colou grau), ele é <strong>automaticamente ignorado do relatório DRA137</strong>, mas continua sendo exportado para os outros relatórios (DRA100, DRA139, ENADE) se elegível.
            </p>
          </div>

          {/* Section 4: ENADE */}
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 space-y-2">
            <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              4. Mapeamento ENADE Concluinte
            </h4>
            <p className="text-emerald-800 leading-relaxed">
              Alunos com solicitações DRA137 ou DRA100 são avaliados para participação ENADE:
            </p>
            <ul className="list-disc list-inside space-y-1 text-emerald-700 pl-2">
              <li>Se contém "não habilitado" &rarr; Situação: <strong>Não Habilitado</strong> | Motivo: <em>Estudante não habilitado ao Enade, em razão do calendário do ciclo avaliativo</em>.</li>
              <li>Se contém "habilitado" e "regular" &rarr; Situação: <strong>Habilitado</strong> | Motivo: <em>Não Possui</em>.</li>
              <li>Ano extraído automaticamente do texto ou padronizado em <strong>2026</strong>.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
