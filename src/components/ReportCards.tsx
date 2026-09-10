import React, { useState } from 'react';
import {
  Download,
  Archive,
  GraduationCap,
  FileCheck,
  Award,
  BookOpen,
  Eye,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { ProcessedDataset, StudentEvaluated } from '../types';
import {
  downloadSingleReport,
  downloadAllZip,
  getReportFileName,
  downloadConsolidatedAudit,
} from '../utils/exporter';

interface ReportCardsProps {
  dataset: ProcessedDataset;
  onSelectStudentToInspect?: (student: StudentEvaluated) => void;
}

export const ReportCards: React.FC<ReportCardsProps> = ({ dataset, onSelectStudentToInspect }) => {
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [previewReport, setPreviewReport] = useState<{
    title: string;
    type: 'enade' | 'dra137' | 'dra100' | 'dra139';
    alunos: StudentEvaluated[];
  } | null>(null);

  const handleDownloadZip = async () => {
    try {
      setDownloadingZip(true);
      await downloadAllZip(dataset);
    } catch (err) {
      console.error('Erro ao gerar ZIP:', err);
      alert('Erro ao gerar pacote ZIP com os relatórios.');
    } finally {
      setDownloadingZip(false);
    }
  };

  const reportsConfig = [
    {
      id: 'enade' as const,
      title: 'Participações ENADE',
      subtitle: 'Concluintes Habilitados / Regulares',
      desc: 'Formato ENADE: matricula, nome, ano, condição, situação e motivo',
      alunos: dataset.alunosEnade,
      count: dataset.alunosEnade.length,
      icon: BookOpen,
      color: 'emerald',
      bgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
    {
      id: 'dra137' as const,
      title: 'Processos em Massa DRA137',
      subtitle: 'Colação Especial (De Ofício)',
      desc: 'Status: Finalizado • Parecer de Colação Especial realizada • Exige Coluna Q vazia',
      alunos: dataset.alunos137,
      count: dataset.alunos137.length,
      icon: Award,
      color: 'blue',
      bgLight: 'bg-blue-50 text-blue-700 border-blue-200',
      btnColor: 'bg-blue-600 hover:bg-blue-700 text-white',
      badgeExtra: dataset.totalIgnoradosColacao137 > 0 ? `${dataset.totalIgnoradosColacao137} ignorados (já colaram grau)` : null,
    },
    {
      id: 'dra100' as const,
      title: 'Processos em Massa DRA100',
      subtitle: 'Emitir Documentos Finais',
      desc: 'Status: Finalizado • Parecer de Emissão de Documentos Finais realizada',
      alunos: dataset.alunos100,
      count: dataset.alunos100.length,
      icon: FileCheck,
      color: 'indigo',
      bgLight: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      btnColor: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    },
    {
      id: 'dra139' as const,
      title: 'Processos em Massa DRA139',
      subtitle: 'Cerimônia de Formatura',
      desc: 'Status: Aguardando Atendimento • Parecer Oficial "Coruja..." • Trava para já realizadas',
      alunos: dataset.alunos139,
      count: dataset.alunos139.length,
      icon: GraduationCap,
      color: 'violet',
      bgLight: 'bg-violet-50 text-violet-700 border-violet-200',
      btnColor: 'bg-violet-600 hover:bg-violet-700 text-white',
    },
  ];

  const totalGerados =
    dataset.alunosEnade.length +
    dataset.alunos137.length +
    dataset.alunos100.length +
    dataset.alunos139.length;

  return (
    <div className="space-y-4">
      {/* Top action bar: prominent ZIP Download & Audit Export */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Geração de Relatórios Concluída ({dataset.tagGerada})
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            {totalGerados} registros distribuídos nos 4 relatórios acadêmicos. Baixe o pacote completo ou selecione os arquivos individualmente abaixo.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-download-all-zip"
            type="button"
            onClick={handleDownloadZip}
            disabled={downloadingZip || totalGerados === 0}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
          >
            {downloadingZip ? (
              <div className="h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Archive className="h-4 w-4" />
            )}
            <span>Baixar Todos os 4 Relatórios (ZIP)</span>
          </button>

          <button
            id="btn-download-audit"
            type="button"
            onClick={() => downloadConsolidatedAudit(dataset)}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
            title="Exportar planilha consolidada de auditoria com status de todos os alunos"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            <span>Auditoria (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* 4 Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportsConfig.map((rep) => {
          const IconComponent = rep.icon;
          const fileName = getReportFileName(rep.id, dataset.tagGerada);

          return (
            <div
              key={rep.id}
              id={`card-report-${rep.id}`}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${rep.bgLight}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                      {rep.count}
                    </span>
                    <span className="block text-[11px] text-slate-400 font-medium">
                      alunos
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {rep.title}
                </h3>
                <p className="text-xs font-medium text-slate-600 mb-1">
                  {rep.subtitle}
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed min-h-[32px]">
                  {rep.desc}
                </p>

                {rep.badgeExtra && (
                  <div className="mt-2 text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                    ℹ️ {rep.badgeExtra}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5">
                <button
                  id={`btn-download-${rep.id}`}
                  type="button"
                  onClick={() => downloadSingleReport(rep.id, dataset)}
                  disabled={rep.count === 0}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold ${rep.btnColor} disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-xs`}
                  title={`Baixar ${fileName}`}
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Baixar XLSX</span>
                </button>

                <button
                  id={`btn-preview-${rep.id}`}
                  type="button"
                  onClick={() =>
                    setPreviewReport({
                      title: rep.title,
                      type: rep.id,
                      alunos: rep.alunos,
                    })
                  }
                  disabled={rep.count === 0}
                  className="p-2 rounded-lg text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Visualizar alunos deste relatório"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal for single report */}
      {previewReport && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewReport(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {previewReport.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {previewReport.alunos.length} registros prontos para exportação
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadSingleReport(previewReport.type, dataset)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Baixar Planilha</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewReport(null)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-2 px-3 font-semibold">Matrícula</th>
                    <th className="py-2 px-3 font-semibold">Nome</th>
                    <th className="py-2 px-3 font-semibold">Período</th>
                    {previewReport.type === 'enade' ? (
                      <>
                        <th className="py-2 px-3 font-semibold">Ano</th>
                        <th className="py-2 px-3 font-semibold">Situação ENADE</th>
                        <th className="py-2 px-3 font-semibold">Motivo</th>
                      </>
                    ) : (
                      <>
                        <th className="py-2 px-3 font-semibold">Status</th>
                        <th className="py-2 px-3 font-semibold">Parecer</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {previewReport.alunos.map((a, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono font-medium text-slate-900">
                        {a.matricula}
                      </td>
                      <td className="py-2 px-3 font-medium">{a.nome}</td>
                      <td className="py-2 px-3">{a.periodo}</td>
                      {previewReport.type === 'enade' ? (
                        <>
                          <td className="py-2 px-3">{a.anoEnade}</td>
                          <td className="py-2 px-3">
                            <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-700 font-semibold">
                              {a.situacaoEnade || 'Regular'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-500 text-[11px]">
                            {a.motivoEnade}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-2 px-3">
                            <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-blue-50 text-blue-700 font-semibold">
                              {previewReport.type === 'dra139' ? 'Aguardando Atendimento' : 'Finalizado'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-[11px] text-slate-600 max-w-xs truncate">
                            {previewReport.type === 'dra137'
                              ? a.parecer137
                              : previewReport.type === 'dra100'
                              ? a.parecer100
                              : a.parecer139}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
