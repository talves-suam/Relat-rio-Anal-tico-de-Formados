import React, { useState } from 'react';
import {
  Copy,
  Check,
  Code2,
  FileCode,
  Globe,
  HelpCircle,
  Download,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import JSZip from 'jszip';
import {
  GAS_SERVER_CODE,
  GAS_INDEX_HTML,
  GAS_DIRECT_SCRIPT,
} from '../utils/gasCode';

interface GasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GasModal: React.FC<GasModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'webapp_html' | 'webapp_gs' | 'direct'>('webapp_html');
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  if (!isOpen) return null;

  let currentCode = GAS_INDEX_HTML;
  let currentFilename = 'Index.html';

  if (activeTab === 'webapp_gs') {
    currentCode = GAS_SERVER_CODE;
    currentFilename = 'Code.gs';
  } else if (activeTab === 'direct') {
    currentCode = GAS_DIRECT_SCRIPT;
    currentFilename = 'MenuPlanilha.gs';
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();

      // Add files
      zip.file('Code.gs', GAS_SERVER_CODE);
      zip.file('Index.html', GAS_INDEX_HTML);
      zip.file('MenuPlanilha.gs', GAS_DIRECT_SCRIPT);
      zip.file(
        'LEIA-ME_Instrucoes_Apps_Script.txt',
        `===================================================================
COMO IMPLANTAR O SISTEMA COMPLETO NO GOOGLE APPS SCRIPT (UNISUAM)
===================================================================

1. Acesse https://script.google.com/ ou abra sua planilha no Google Sheets
   e vá no menu superior: "Extensões" > "Apps Script".

2. No painel esquerdo do editor do Apps Script:
   - Abra o arquivo "Code.gs", apague tudo e cole o conteúdo de "Code.gs".
   - Clique no ícone de "+" ao lado de "Arquivos" > escolha "HTML".
   - Nomeie o arquivo como: Index (o Apps Script adiciona .html automaticamente).
   - Apague o código padrão e cole o conteúdo de "Index.html".

3. Salve o projeto (ícone de disquete ou Ctrl+S).

4. No canto superior direito, clique em "Implantar" > "Nova implantação".
   - No ícone de engrenagem (Configurações), selecione: "App da Web".
   - Descrição: "Sistema DRA e ENADE UNISUAM"
   - Executar como: "Usuário que está acessando o app da web" (recomendado)
   - Quem tem acesso: "Qualquer pessoa dentro de UNISUAM" (ou apenas você).

5. Clique em "Implantar" e copie a URL gerada pelo Google.

Pronto! Seu site estará 100% hospedado no Google da UNISUAM, funcionando
de forma totalmente independente, com login institucional nativo, visual idêntico
e com opção de salvar planilhas direto no Google Drive!`
      );

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Google_Apps_Script_DRA_UNISUAM.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao gerar ZIP do Apps Script:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-950 text-white">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  Publicar Sistema Standalone no Google Apps Script
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-slate-950">
                  HTML + GS
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Execute o site com o mesmo visual e funções dentro dos servidores do Google da UNISUAM
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-download-gas-zip"
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{isZipping ? 'Criando ZIP...' : 'Baixar Pacote Completo (.zip)'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-2.5 py-1 text-xs font-semibold text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-slate-800">
          
          {/* Instructions banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="font-bold flex items-center gap-1.5 text-slate-900">
                <HelpCircle className="h-4 w-4 text-emerald-600" />
                <span>Como colocar este site para funcionar no seu Google Apps Script:</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                <span>Autenticação Google Workspace Nativa</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">1. Criar os 2 Arquivos</span>
                <p className="text-slate-600 text-[11px]">
                  No Apps Script, cole o código do <strong>Code.gs</strong> e crie um arquivo HTML chamado <strong>Index</strong> para colar o <strong>Index.html</strong>.
                </p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">2. Implantar App da Web</span>
                <p className="text-slate-600 text-[11px]">
                  Clique em <strong>Implantar &gt; Nova Implantação</strong>, escolha tipo <strong>App da Web</strong> e selecione acesso para <em>Qualquer pessoa na UNISUAM</em>.
                </p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">3. Acessar o Link</span>
                <p className="text-slate-600 text-[11px]">
                  O Google gera um link oficial institucional (`script.google.com/.../exec`). O site roda idêntico, com todas as fórmulas e gráficos!
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('webapp_html')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'webapp_html'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileCode className="h-3.5 w-3.5 text-emerald-600" />
                <span>Index.html (Interface Completa do Site)</span>
              </button>

              <button
                onClick={() => setActiveTab('webapp_gs')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'webapp_gs'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Code2 className="h-3.5 w-3.5 text-blue-600" />
                <span>Code.gs (Servidor do Web App)</span>
              </button>

              <button
                onClick={() => setActiveTab('direct')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'direct'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                <span>Menu na Planilha (Opcional)</span>
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors cursor-pointer shadow-xs"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copiado!' : `Copiar ${currentFilename}`}</span>
            </button>
          </div>

          {/* Code Viewer */}
          <div className="relative border border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <div className="flex items-center justify-between bg-slate-900 text-slate-300 px-4 py-2 text-xs font-mono border-b border-slate-800">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                <span>{currentFilename}</span>
              </span>
              <span className="text-[11px] text-slate-500">
                {activeTab === 'webapp_html' ? 'HTML5, Tailwind, SheetJS, JSZip & Motor de Regras' : 'Google Apps Script Service'}
              </span>
            </div>
            <pre className="p-4 bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto max-h-96 select-all">
              {currentCode}
            </pre>
          </div>

        </div>
      </div>
    </div>
  );
};
