import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Users,
  Award,
  FileCheck,
  GraduationCap,
  BookOpen,
  AlertTriangle,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { ProcessedDataset } from '../types';

interface AnalyticsChartsProps {
  dataset: ProcessedDataset;
}

const COLORS = ['#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#f59e0b', '#ef4444'];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ dataset }) => {
  const {
    todosAlunos,
    alunosEnade,
    alunos137,
    alunos100,
    alunos139,
    totalIgnoradosColacao137,
    totalLinhasFiltradasPeriodo,
    totalLinhasLidas,
  } = dataset;

  // Compute blocked students
  const alunosBloqueados = todosAlunos.filter(
    (a) => !a.exportar137 && !a.exportar100 && !a.exportar139 && !a.exportarEnade
  );

  // Data for Processes Bar Chart
  const processosData = [
    { name: 'ENADE Concluintes', total: alunosEnade.length, fill: '#10b981' },
    { name: 'DRA137 (Colação Especial)', total: alunos137.length, fill: '#3b82f6' },
    { name: 'DRA100 (Docs Finais)', total: alunos100.length, fill: '#6366f1' },
    { name: 'DRA139 (Cerimônia)', total: alunos139.length, fill: '#8b5cf6' },
  ];

  // Data for ENADE Situation Pie Chart
  const enadeCounts: Record<string, number> = {};
  alunosEnade.forEach((a) => {
    const sit = a.situacaoEnade || 'Regular / Habilitado';
    enadeCounts[sit] = (enadeCounts[sit] || 0) + 1;
  });

  const enadePieData = Object.keys(enadeCounts).map((key) => ({
    name: key,
    value: enadeCounts[key],
  }));

  // Data for Period Distribution
  const periodCounts: Record<string, number> = {};
  todosAlunos.forEach((a) => {
    const p = a.periodo || 'Não informado';
    periodCounts[p] = (periodCounts[p] || 0) + 1;
  });

  const periodData = Object.keys(periodCounts).map((key) => ({
    name: key,
    alunos: periodCounts[key],
  }));

  // Reasons for block / status breakdown
  const motivoCounts: Record<string, number> = {};
  todosAlunos.forEach((a) => {
    if (a.motivoBloqueio) {
      const shortMotivo = a.motivoBloqueio.replace('Bloqueado por: ', '').replace(/"/g, '');
      motivoCounts[shortMotivo] = (motivoCounts[shortMotivo] || 0) + 1;
    }
  });

  const motivoData = Object.keys(motivoCounts).map((key) => ({
    name: key.length > 28 ? key.slice(0, 28) + '...' : key,
    fullName: key,
    quantidade: motivoCounts[key],
  }));

  return (
    <div className="space-y-5">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Users className="h-4 w-4 text-slate-700" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Analisados
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {todosAlunos.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            de {totalLinhasLidas} no arquivo
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <BookOpen className="h-4 w-4" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              ENADE
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {alunosEnade.length}
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
            Concluintes aptos
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Award className="h-4 w-4" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              DRA137
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {alunos137.length}
          </div>
          <div className="text-[10px] text-blue-600 font-medium mt-0.5">
            Colação de Ofício
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <FileCheck className="h-4 w-4" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              DRA100
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {alunos100.length}
          </div>
          <div className="text-[10px] text-indigo-600 font-medium mt-0.5">
            Emitir Documentos
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <div className="flex items-center gap-2 text-violet-600 mb-1">
            <GraduationCap className="h-4 w-4" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              DRA139
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {alunos139.length}
          </div>
          <div className="text-[10px] text-violet-600 font-medium mt-0.5">
            Cerimônia Formatura
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Travas / Exigências
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {alunosBloqueados.length + totalIgnoradosColacao137}
          </div>
          <div className="text-[10px] text-amber-600 font-medium mt-0.5">
            {totalIgnoradosColacao137} já colaram grau
          </div>
        </div>
      </div>

      {/* Analytical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Volume de Processos */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Volume de Alunos por Processo & Relatório
              </h3>
              <p className="text-xs text-slate-500">
                Quantitativo consolidado que será exportado nas planilhas
              </p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processosData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-5} textAnchor="middle" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  formatter={(value: any) => [`${value} alunos`, 'Total']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="total" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Distribuição por Período */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Distribuição de Alunos por Período de Conclusão
              </h3>
              <p className="text-xs text-slate-500">
                Alunos ativos no filtro selecionado (Coluna I)
              </p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={periodData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  formatter={(value: any) => [`${value} alunos`, 'Total']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="alunos" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Motivos de Bloqueio / Exigências */}
        {motivoData.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Exigências e Travas de Bloqueio Identificadas
                </h3>
                <p className="text-xs text-slate-500">
                  Alunos retidos por pendência de CH, DRA045 ou colação prévia
                </p>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={motivoData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} width={140} />
                  <Tooltip
                    formatter={(value: any, name: any, item: any) => [`${value} alunos`, item?.payload?.fullName || name]}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="quantidade" fill="#f59e0b" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Chart 4: Situação ENADE */}
        {enadePieData.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Situação Cadastral ENADE dos Concluintes
                </h3>
                <p className="text-xs text-slate-500">
                  Classificação baseada nas regras de ciclo e regularidade
                </p>
              </div>
            </div>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={enadePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {enadePieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${value} alunos`, 'Total']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
