import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { parseWorkbookData } from '../utils/excelEngine';
import { ProcessedDataset } from '../types';

interface FileUploaderProps {
  onDatasetLoaded: (dataset: ProcessedDataset, wb: XLSX.WorkBook, filename: string) => void;
  currentDataset?: ProcessedDataset;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onDatasetLoaded,
  currentDataset,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setErrorMsg(null);
    setLoading(true);

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });

      if (!wb.SheetNames || wb.SheetNames.length === 0) {
        throw new Error('O arquivo não possui nenhuma planilha/aba válida.');
      }

      // Default periods: 2026-1 and 2026-2
      const dataset = parseWorkbookData(wb, file.name, ['2026-1', '2026-2']);
      onDatasetLoaded(dataset, wb, file.name);
    } catch (err: any) {
      console.error('Erro ao ler planilha:', err);
      setErrorMsg(
        err?.message || 'Falha ao processar o arquivo. Certifique-se de que é um arquivo Excel (.xlsx, .xls) válido.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
      <div
        id="dropzone-area"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
            : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="h-12 w-12 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-xs">
            {loading ? (
              <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            ) : currentDataset ? (
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            ) : (
              <UploadCloud className="h-6 w-6 text-slate-500" />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800">
              {currentDataset
                ? `Substituir planilha (${currentDataset.filename})`
                : 'Arraste o relatório da TI aqui ou clique para selecionar'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Formatos aceitos: <strong>.xlsx, .xls, .csv</strong> (Relatório Analítico de Formados)
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 mt-2">
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            <span>Aplica fórmulas Excel automaticamente + gera os 4 relatórios em 1 clique</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
