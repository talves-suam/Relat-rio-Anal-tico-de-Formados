import React, { useState, useMemo, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Header } from './components/Header';
import { FileUploader } from './components/FileUploader';
import { PeriodSelector } from './components/PeriodSelector';
import { ReportCards } from './components/ReportCards';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { StudentTable } from './components/StudentTable';
import { GasModal } from './components/GasModal';
import { FormulaModal } from './components/FormulaModal';
import { LoginScreen } from './components/LoginScreen';
import { initAuth, logout } from './utils/firebaseAuth';
import { loadSampleDataset, generateSampleWorkbook } from './utils/sampleData';
import { parseWorkbookData } from './utils/excelEngine';
import { ProcessedDataset } from './types';
import { GraduationCap } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function App() {
  // Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (validUser) => {
        setUser(validUser);
        setAuthError(null);
        setAuthLoading(false);
      },
      (errorReason) => {
        setUser(null);
        if (errorReason) {
          setAuthError(errorReason);
        }
        setAuthLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setAuthError(null);
    } catch (err) {
      console.error('Erro no logout:', err);
    }
  };

  // Store raw workbook for instantaneous period re-filtering
  const [currentWb, setCurrentWb] = useState<XLSX.WorkBook | null>(() => generateSampleWorkbook());
  const [currentFilename, setCurrentFilename] = useState<string>('Relatório Analítico de Formado (Exemplo TI).xlsx');
  
  // Period filter state - default 2026-1 and 2026-2 as requested
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>(['2026-1', '2026-2']);

  // Modals state
  const [isGasModalOpen, setIsGasModalOpen] = useState(false);
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);

  // Compute processed dataset based on current workbook & selected periods
  const dataset: ProcessedDataset = useMemo(() => {
    if (!currentWb) {
      return loadSampleDataset();
    }
    return parseWorkbookData(currentWb, currentFilename, selectedPeriods);
  }, [currentWb, currentFilename, selectedPeriods]);

  // Compute all students counts per period (unfiltered) for the period badges
  const todosAlunosContagemPorPeriodo = useMemo(() => {
    if (!currentWb) return {};
    const fullDataset = parseWorkbookData(currentWb, currentFilename, []);
    const counts: Record<string, number> = {};
    for (const a of fullDataset.todosAlunos) {
      const p = a.periodo || 'Outros';
      counts[p] = (counts[p] || 0) + 1;
    }
    return counts;
  }, [currentWb, currentFilename]);

  // Handlers for period selection
  const handleTogglePeriodo = (periodo: string) => {
    if (selectedPeriods.includes(periodo)) {
      setSelectedPeriods(selectedPeriods.filter((p) => p !== periodo));
    } else {
      setSelectedPeriods([...selectedPeriods, periodo]);
    }
  };

  const handleSelectDefaultPeriods = () => {
    const defaults = ['2026-1', '2026-2'];
    const detected = dataset.periodosDetectados;
    const matching = detected.filter((p) => defaults.includes(p));
    setSelectedPeriods(matching.length > 0 ? matching : defaults);
  };

  const handleSelectAllPeriods = () => {
    setSelectedPeriods([...dataset.periodosDetectados]);
  };

  const handleClearAllPeriods = () => {
    setSelectedPeriods([]);
  };

  // Handler for uploading new workbook
  const handleDatasetLoaded = (newDataset: ProcessedDataset, wb: XLSX.WorkBook, filename: string) => {
    setCurrentWb(wb);
    setCurrentFilename(filename);
    const detected = newDataset.periodosDetectados;
    const defaults = ['2026-1', '2026-2'];
    const matching = detected.filter((p) => defaults.includes(p));
    setSelectedPeriods(matching.length > 0 ? matching : detected);
  };

  // Handler for loading sample data
  const handleLoadSample = () => {
    const wb = generateSampleWorkbook();
    setCurrentWb(wb);
    setCurrentFilename('Relatório Analítico de Formado (Exemplo TI).xlsx');
    setSelectedPeriods(['2026-1', '2026-2']);
  };

  // Initial Auth Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white font-sans">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-pulse">
            <GraduationCap className="h-8 w-8" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-slate-200">
              Verificando autenticação Google...
            </p>
            <p className="text-xs text-slate-500">
              Ambiente Institucional UNISUAM
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Not Authenticated or Denied Screen
  if (!user) {
    return (
      <LoginScreen
        onSuccess={(loggedUser) => {
          setUser(loggedUser);
          setAuthError(null);
        }}
        initialError={authError}
      />
    );
  }

  // Authenticated Main Application
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Sticky Header with User Profile and Logout */}
      <Header
        filename={dataset.filename}
        totalAlunos={dataset.todosAlunos.length}
        dataHora={dataset.dataHora}
        user={user}
        onLogout={handleLogout}
        onLoadSample={handleLoadSample}
        onOpenGasModal={() => setIsGasModalOpen(true)}
        onOpenFormulaModal={() => setIsFormulaModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top row: File Uploader & Period Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5">
            <FileUploader
              onDatasetLoaded={(newDs, wb, fn) => {
                handleDatasetLoaded(newDs, wb, fn);
              }}
              currentDataset={dataset}
            />
          </div>
          <div className="lg:col-span-7">
            <PeriodSelector
              periodosDetectados={dataset.periodosDetectados}
              periodosSelecionados={selectedPeriods}
              todosAlunosContagemPorPeriodo={todosAlunosContagemPorPeriodo}
              onTogglePeriodo={handleTogglePeriodo}
              onSelectDefault={handleSelectDefaultPeriods}
              onSelectAll={handleSelectAllPeriods}
              onClearAll={handleClearAllPeriods}
            />
          </div>
        </div>

        {/* 4 Generated Reports & 1-Click ZIP Download */}
        <ReportCards dataset={dataset} />

        {/* Analytics & KPIs */}
        <AnalyticsCharts dataset={dataset} />

        {/* Student Inspection & Search Table */}
        <StudentTable students={dataset.todosAlunos} />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          Processamento de Formandos e Relatórios DRA &bull; Acesso Restrito: @unisuam.edu.br &bull; {new Date().getFullYear()}
        </div>
      </footer>

      {/* Modals */}
      <GasModal
        isOpen={isGasModalOpen}
        onClose={() => setIsGasModalOpen(false)}
      />

      <FormulaModal
        isOpen={isFormulaModalOpen}
        onClose={() => setIsFormulaModalOpen(false)}
      />
    </div>
  );
}
