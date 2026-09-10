import React from 'react';
import {
  FileSpreadsheet,
  Code2,
  Sparkles,
  HelpCircle,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  filename?: string;
  totalAlunos: number;
  dataHora?: string;
  user?: User | null;
  onLogout?: () => void;
  onLoadSample: () => void;
  onOpenGasModal: () => void;
  onOpenFormulaModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  filename,
  totalAlunos,
  dataHora,
  user,
  onLogout,
  onLoadSample,
  onOpenGasModal,
  onOpenFormulaModal,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs shrink-0">
            <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                Processamento DRA &amp; ENADE
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Google Apps Script Ready
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {filename ? (
                <span>
                  Arquivo ativo: <strong className="text-slate-700">{filename}</strong> • {totalAlunos} alunos processados • Atualizado às {dataHora}
                </span>
              ) : (
                'Automação completa de fórmulas Excel, filtros de formandos e relatórios em lote'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-between md:justify-end">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-load-sample"
              onClick={onLoadSample}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              title="Carregar dados fictícios realistas da TI para testar a aplicação imediatamente"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span>Exemplo TI</span>
            </button>

            <button
              id="btn-open-gas"
              onClick={onOpenGasModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
              title="Ver código pronto para rodar direto no Google Planilhas via Apps Script"
            >
              <Code2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Apps Script</span>
            </button>

            <button
              id="btn-open-formulas"
              onClick={onOpenFormulaModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 transition-colors cursor-pointer"
              title="Ver a lógica das fórmulas Excel e do script Python"
            >
              <HelpCircle className="h-3.5 w-3.5 text-slate-500" />
              <span>Fórmulas</span>
            </button>
          </div>

          {/* User Profile & Logout */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Usuário'}
                    className="h-8 w-8 rounded-full border border-slate-200 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="hidden sm:block text-left text-xs">
                  <div className="font-semibold text-slate-800 leading-tight truncate max-w-[140px]">
                    {user.displayName || user.email?.split('@')[0]}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                    <ShieldCheck className="h-3 w-3 text-emerald-600" />
                    <span>@unisuam.edu.br</span>
                  </div>
                </div>
              </div>

              {onLogout && (
                <button
                  id="btn-logout"
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Sair da conta"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
