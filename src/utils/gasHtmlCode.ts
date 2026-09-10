// Google Apps Script Standalone Web App HTML/JS (Index.html)

export const GAS_INDEX_HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Processamento DRA & ENADE • UNISUAM</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    .custom-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
    .custom-scroll::-webkit-scrollbar-track { background: #f1f5f9; }
    .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased">
  
  <!-- Header -->
  <header class="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl shadow-xs">
          🎓
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-base font-extrabold text-slate-900 tracking-tight">Processamento DRA & ENADE</h1>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              UNISUAM • Apps Script Standalone
            </span>
          </div>
          <p class="text-xs text-slate-500 hidden sm:block">Automação de fórmulas Excel, filtros de formandos e geração em lote</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button id="btn-demo" onclick="carregarExemploTI()" class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1.5 cursor-pointer">
          <span>✨ Carregar Exemplo TI</span>
        </button>
        <button onclick="abrirModalFormulas()" class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer">
          <span>ℹ️ Regras & Fórmulas</span>
        </button>
        <div id="user-badge" class="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 text-xs text-slate-600">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span id="user-email" class="font-medium truncate max-w-[150px]">Google Workspace</span>
        </div>
      </div>
    </div>
  </header>

  <!-- Main Container -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
    
    <!-- Top Grid: File Upload & Period Filter -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <!-- File Upload Box (5 cols) -->
      <div class="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-2">
            <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>📁 Relatório Analítico da TI</span>
            </h2>
            <span id="status-tag" class="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              Aguardando arquivo
            </span>
          </div>
          <p class="text-xs text-slate-500 mb-4">
            Carregue a planilha bruta com a coluna AL de Resultado e Coluna I de Período.
          </p>
        </div>

        <div id="drop-area" class="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/30 rounded-xl p-5 text-center cursor-pointer transition-all">
          <input type="file" id="file-input" accept=".xlsx,.xls,.csv" class="hidden" onchange="handleFileSelect(event)">
          <div class="flex flex-col items-center gap-2">
            <div class="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-lg">
              📊
            </div>
            <div>
              <p class="text-xs font-bold text-slate-800">Clique para selecionar ou arraste o relatório</p>
              <p class="text-[11px] text-slate-500 mt-0.5">Suporta formatos .xlsx, .xls e .csv</p>
            </div>
          </div>
        </div>

        <div id="file-info" class="hidden mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
          <div class="truncate mr-2">
            <div id="file-name" class="font-bold truncate">arquivo.xlsx</div>
            <div id="file-stats" class="text-[11px] text-emerald-700">0 linhas lidas</div>
          </div>
          <button onclick="limparArquivo()" class="px-2 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 rounded">
            Trocar
          </button>
        </div>
      </div>

      <!-- Period Filter Box (7 cols) -->
      <div class="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-2">
            <div>
              <h2 class="text-sm font-bold text-slate-900">
                Filtro de Período Letivo (Coluna I)
              </h2>
              <p class="text-xs text-slate-500">
                Filtre apenas os alunos concluintes dos períodos desejados
              </p>
            </div>
            <div class="flex items-center gap-1.5">
              <button onclick="selecionarPeriodosPadrao()" class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
                Padrão (2026-1 / 2026-2)
              </button>
              <button onclick="selecionarTodosPeriodos()" class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
                Todos
              </button>
              <button onclick="limparPeriodos()" class="px-2 py-1 text-xs font-semibold rounded-lg text-slate-400 hover:text-slate-600">
                Limpar
              </button>
            </div>
          </div>

          <div id="periodos-container" class="flex flex-wrap gap-2 pt-2 min-h-[70px]">
            <span class="text-xs text-slate-400 italic">Carregue um arquivo para detectar os períodos da Coluna I</span>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span id="periodos-selecionados-label">2 períodos ativos</span>
          <span class="text-[11px] text-slate-400">Normalização automática (ex: 20261 / 2026-1 / 2026.1)</span>
        </div>
      </div>
    </div>

    <!-- Analytics Dashboard: 6 KPI Cards & 4 Charts -->
    <div id="analytics-section" class="hidden space-y-5">
      <!-- 6 KPI Cards Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div class="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <div class="flex items-center gap-2 text-slate-500 mb-1">
            <span class="text-slate-700 text-sm">👥</span>
            <span class="text-[11px] font-semibold uppercase tracking-wider">Analisados</span>
          </div>
          <div id="kpi-analisados" class="text-2xl font-black text-slate-900 tracking-tight">0</div>
          <div id="kpi-analisados-sub" class="text-[10px] text-slate-400 mt-0.5">de 0 no arquivo</div>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <div class="flex items-center gap-2 text-emerald-600 mb-1">
            <span class="text-sm">📖</span>
            <span class="text-[11px] font-semibold uppercase tracking-wider">ENADE</span>
          </div>
          <div id="kpi-enade" class="text-2xl font-black text-slate-900 tracking-tight">0</div>
          <div class="text-[10px] text-emerald-600 font-medium mt-0.5">Concluintes aptos</div>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <div class="flex items-center gap-2 text-blue-600 mb-1">
            <span class="text-sm">🎖️</span>
            <span class="text-[11px] font-semibold uppercase tracking-wider">DRA137</span>
          </div>
          <div id="kpi-dra137" class="text-2xl font-black text-slate-900 tracking-tight">0</div>
          <div class="text-[10px] text-blue-600 font-medium mt-0.5">Colação de Ofício</div>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <div class="flex items-center gap-2 text-indigo-600 mb-1">
            <span class="text-sm">📋</span>
            <span class="text-[11px] font-semibold uppercase tracking-wider">DRA100</span>
          </div>
          <div id="kpi-dra100" class="text-2xl font-black text-slate-900 tracking-tight">0</div>
          <div class="text-[10px] text-indigo-600 font-medium mt-0.5">Emitir Documentos</div>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <div class="flex items-center gap-2 text-violet-600 mb-1">
            <span class="text-sm">🎓</span>
            <span class="text-[11px] font-semibold uppercase tracking-wider">DRA139</span>
          </div>
          <div id="kpi-dra139" class="text-2xl font-black text-slate-900 tracking-tight">0</div>
          <div class="text-[10px] text-violet-600 font-medium mt-0.5">Cerimônia Formatura</div>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <div class="flex items-center gap-2 text-amber-600 mb-1">
            <span class="text-sm">⚠️</span>
            <span class="text-[11px] font-semibold uppercase tracking-wider">Travas / Exigências</span>
          </div>
          <div id="kpi-travas" class="text-2xl font-black text-slate-900 tracking-tight">0</div>
          <div id="kpi-travas-sub" class="text-[10px] text-amber-600 font-medium mt-0.5">0 já colaram grau</div>
        </div>
      </div>

      <!-- 4 Charts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <!-- Chart 1: Volume de Processos -->
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div class="mb-3">
            <h3 class="text-sm font-bold text-slate-900">Volume de Alunos por Processo & Relatório</h3>
            <p class="text-xs text-slate-500">Quantitativo consolidado que será exportado nas planilhas</p>
          </div>
          <div class="h-64 relative">
            <canvas id="chart-processos"></canvas>
          </div>
        </div>

        <!-- Chart 2: Distribuição por Período -->
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div class="mb-3">
            <h3 class="text-sm font-bold text-slate-900">Distribuição de Alunos por Período de Conclusão</h3>
            <p class="text-xs text-slate-500">Alunos ativos no filtro selecionado (Coluna I)</p>
          </div>
          <div class="h-64 relative">
            <canvas id="chart-periodos"></canvas>
          </div>
        </div>

        <!-- Chart 3: Motivos de Bloqueio -->
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div class="mb-3">
            <h3 class="text-sm font-bold text-slate-900">Exigências e Travas de Bloqueio Identificadas</h3>
            <p class="text-xs text-slate-500">Alunos retidos por pendência de CH, DRA045 ou bloqueios</p>
          </div>
          <div class="h-64 relative">
            <canvas id="chart-motivos"></canvas>
          </div>
        </div>

        <!-- Chart 4: Situação ENADE -->
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div class="mb-3">
            <h3 class="text-sm font-bold text-slate-900">Situação Cadastral ENADE dos Concluintes</h3>
            <p class="text-xs text-slate-500">Classificação baseada nas regras de ciclo e regularidade</p>
          </div>
          <div class="h-64 relative flex items-center justify-center">
            <canvas id="chart-enade"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Reports Section (Black top bar + 4 Cards) -->
    <div id="reports-section" class="hidden space-y-4">
      <!-- Top Action Bar -->
      <div class="bg-slate-900 text-white rounded-2xl p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="text-xs font-bold tracking-wider uppercase text-emerald-400">Geração de Relatórios Concluída</span>
            <span id="batch-tag" class="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">TAG</span>
          </div>
          <p id="batch-summary" class="text-xs text-slate-300">
            0 registros distribuídos nos 4 relatórios acadêmicos oficiais
          </p>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <button onclick="baixarAuditoriaConsolidada()" class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer">
            <span>📑 Auditoria (.xlsx)</span>
          </button>
          <button onclick="salvarNoGoogleDrive()" class="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer">
            <span>💾 Salvar no Google Drive</span>
          </button>
          <button onclick="baixarTodosZip()" class="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer">
            <span>📦 Baixar Todos os 4 Relatórios (ZIP)</span>
          </button>
        </div>
      </div>

      <!-- 4 Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Card 1: ENADE -->
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500 transition-colors">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
                📖
              </div>
              <div class="text-right">
                <span id="card-count-enade" class="text-2xl font-black text-slate-900">0</span>
                <span class="text-xs text-slate-500 block">alunos</span>
              </div>
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900">Participações ENADE</h3>
              <p class="text-xs text-emerald-600 font-medium">Inscrições Concluintes</p>
              <p class="text-xs text-slate-500 mt-1 line-clamp-2">
                Alunos com processos DRA137 ou DRA100 elegíveis para o ciclo avaliativo do ENADE.
              </p>
            </div>
          </div>
          <div class="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
            <button onclick="baixarRelatorioIndividual('enade')" class="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
              <span>⬇️ Baixar XLSX</span>
            </button>
            <button id="btn-preview-enade" onclick="abrirPreview('enade')" class="p-2 rounded-lg text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer" title="Visualizar alunos deste relatório">
              👁️
            </button>
          </div>
        </div>

        <!-- Card 2: DRA137 -->
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-blue-500 transition-colors">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold">
                🎖️
              </div>
              <div class="text-right">
                <span id="card-count-dra137" class="text-2xl font-black text-slate-900">0</span>
                <span class="text-xs text-slate-500 block">alunos</span>
              </div>
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900">Processos DRA137</h3>
              <p class="text-xs text-blue-600 font-medium">Colação de Grau Especial</p>
              <p class="text-xs text-slate-500 mt-1 line-clamp-2">
                Abertura de processos para colação de ofício com parecer padrão homologado.
              </p>
            </div>
            <div id="badge-dra137-ignorados" class="hidden text-[11px] font-medium text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
              ⚠️ <span id="count-dra137-ignorados">0</span> ignorados (já colaram grau)
            </div>
          </div>
          <div class="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
            <button onclick="baixarRelatorioIndividual('dra137')" class="flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
              <span>⬇️ Baixar XLSX</span>
            </button>
            <button id="btn-preview-dra137" onclick="abrirPreview('dra137')" class="p-2 rounded-lg text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer" title="Visualizar alunos deste relatório">
              👁️
            </button>
          </div>
        </div>

        <!-- Card 3: DRA100 -->
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-indigo-500 transition-colors">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
                📋
              </div>
              <div class="text-right">
                <span id="card-count-dra100" class="text-2xl font-black text-slate-900">0</span>
                <span class="text-xs text-slate-500 block">alunos</span>
              </div>
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900">Processos DRA100</h3>
              <p class="text-xs text-indigo-600 font-medium">Emitir Documentos Finais</p>
              <p class="text-xs text-slate-500 mt-1 line-clamp-2">
                Abertura de processos para emissão de histórico escolar e diploma com status Finalizado.
              </p>
            </div>
          </div>
          <div class="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
            <button onclick="baixarRelatorioIndividual('dra100')" class="flex-1 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
              <span>⬇️ Baixar XLSX</span>
            </button>
            <button id="btn-preview-dra100" onclick="abrirPreview('dra100')" class="p-2 rounded-lg text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer" title="Visualizar alunos deste relatório">
              👁️
            </button>
          </div>
        </div>

        <!-- Card 4: DRA139 -->
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-violet-500 transition-colors">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="h-10 w-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center text-xl font-bold">
                🎓
              </div>
              <div class="text-right">
                <span id="card-count-dra139" class="text-2xl font-black text-slate-900">0</span>
                <span class="text-xs text-slate-500 block">alunos</span>
              </div>
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900">Processos DRA139</h3>
              <p class="text-xs text-violet-600 font-medium">Cerimônia de Formatura</p>
              <p class="text-xs text-slate-500 mt-1 line-clamp-2">
                Abertura de processos para solenidade presencial com parecer institucional 'Coruja'.
              </p>
            </div>
          </div>
          <div class="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
            <button onclick="baixarRelatorioIndividual('dra139')" class="flex-1 py-2 px-3 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
              <span>⬇️ Baixar XLSX</span>
            </button>
            <button id="btn-preview-dra139" onclick="abrirPreview('dra139')" class="p-2 rounded-lg text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer" title="Visualizar alunos deste relatório">
              👁️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Student Table & Audit Section -->
    <div id="table-section" class="hidden bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 class="text-sm font-bold text-slate-900">
            Conferência & Auditoria dos Alunos da Planilha
          </h2>
          <p class="text-xs text-slate-500">
            Pesquise por matrícula, nome ou CPF para conferir a aplicação das fórmulas e destinos
          </p>
        </div>

        <!-- Search Bar -->
        <div class="relative w-full md:w-80">
          <input
            id="input-search"
            type="text"
            placeholder="Pesquisar matrícula, nome, CPF..."
            oninput="filtrarTabela()"
            class="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800"
          >
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div id="table-tabs" class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-medium">
        <button onclick="trocarAbaFiltro('all')" id="tab-all" class="px-3 py-1.5 rounded-lg whitespace-nowrap bg-slate-900 text-white shadow-xs">
          Todos (<span id="count-tab-all">0</span>)
        </button>
        <button onclick="trocarAbaFiltro('enade')" id="tab-enade" class="px-3 py-1.5 rounded-lg whitespace-nowrap bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
          ENADE (<span id="count-tab-enade">0</span>)
        </button>
        <button onclick="trocarAbaFiltro('137')" id="tab-137" class="px-3 py-1.5 rounded-lg whitespace-nowrap bg-blue-50 text-blue-700 hover:bg-blue-100">
          DRA137 (<span id="count-tab-137">0</span>)
        </button>
        <button onclick="trocarAbaFiltro('100')" id="tab-100" class="px-3 py-1.5 rounded-lg whitespace-nowrap bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
          DRA100 (<span id="count-tab-100">0</span>)
        </button>
        <button onclick="trocarAbaFiltro('139')" id="tab-139" class="px-3 py-1.5 rounded-lg whitespace-nowrap bg-violet-50 text-violet-700 hover:bg-violet-100">
          DRA139 (<span id="count-tab-139">0</span>)
        </button>
        <button onclick="trocarAbaFiltro('colou')" id="tab-colou" class="px-3 py-1.5 rounded-lg whitespace-nowrap bg-cyan-50 text-cyan-700 hover:bg-cyan-100">
          Já Colou Grau (<span id="count-tab-colou">0</span>)
        </button>
        <button onclick="trocarAbaFiltro('blocked')" id="tab-blocked" class="px-3 py-1.5 rounded-lg whitespace-nowrap bg-amber-50 text-amber-700 hover:bg-amber-100">
          Bloqueados/Exigência (<span id="count-tab-blocked">0</span>)
        </button>
      </div>

      <!-- Table Container -->
      <div class="overflow-x-auto rounded-xl border border-slate-200 custom-scroll">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
              <th class="py-2.5 px-3">Matrícula</th>
              <th class="py-2.5 px-3">Nome do Aluno</th>
              <th class="py-2.5 px-3">Período (Col. I)</th>
              <th class="py-2.5 px-3">Colação (Col. Q)</th>
              <th class="py-2.5 px-3">Resultado Calculado (Col. AL)</th>
              <th class="py-2.5 px-3">Destinos Habilitados</th>
              <th class="py-2.5 px-3">Situação ENADE</th>
              <th class="py-2.5 px-3 text-center">Detalhes</th>
            </tr>
          </thead>
          <tbody id="student-table-body" class="divide-y divide-slate-100 text-slate-800">
            <!-- Dynamic rows -->
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-500">
        <div class="flex items-center gap-2">
          <span>Exibindo</span>
          <select id="select-page-size" onchange="mudarPageSize(this.value)" class="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-800 font-medium">
            <option value="10">10</option>
            <option value="25" selected>25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span id="pagination-info">de 0 alunos filtrados</span>
        </div>
        <div class="flex items-center gap-1 self-center">
          <button id="btn-prev-page" onclick="mudarPagina(-1)" class="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer">
            ◀
          </button>
          <span id="page-indicator" class="px-3 py-1 font-medium text-slate-700">Página 1 de 1</span>
          <button id="btn-next-page" onclick="mudarPagina(1)" class="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer">
            ▶
          </button>
        </div>
      </div>
    </div>
  </main>

  <!-- Modal 1: Preview de Alunos do Relatório (Acionado pelo Olhinho nos Cards) -->
  <div id="modal-preview" class="hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden" onclick="event.stopPropagation()">
      <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div>
          <h3 id="modal-preview-title" class="text-base font-bold text-slate-900">Alunos do Relatório</h3>
          <p id="modal-preview-subtitle" class="text-xs text-slate-500">0 registros prontos para exportação</p>
        </div>
        <div class="flex items-center gap-2">
          <button id="modal-preview-btn-download" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer">
            <span>⬇️ Baixar Planilha</span>
          </button>
          <button onclick="fecharModalPreview()" class="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-200 rounded-lg cursor-pointer">
            Fechar
          </button>
        </div>
      </div>
      <div class="p-4 overflow-y-auto flex-1 custom-scroll">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr id="modal-preview-thead" class="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
              <!-- Dynamic headers -->
            </tr>
          </thead>
          <tbody id="modal-preview-tbody" class="divide-y divide-slate-100 text-slate-800">
            <!-- Dynamic rows -->
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Modal 2: Auditoria Detalhada do Aluno (Acionado pelo Olhinho na Tabela) -->
  <div id="modal-aluno" class="hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden" onclick="event.stopPropagation()">
      <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div>
          <h3 id="modal-aluno-nome" class="text-base font-bold text-slate-900">Nome do Aluno</h3>
          <p id="modal-aluno-info" class="text-xs text-slate-500 font-mono">Matrícula: 00000000 • CPF: Não informado</p>
        </div>
        <button onclick="fecharModalAluno()" class="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-200 rounded-lg cursor-pointer">
          Fechar
        </button>
      </div>
      <div class="p-5 overflow-y-auto space-y-4 text-xs custom-scroll">
        <!-- 4 Status flags -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2" id="modal-aluno-flags">
          <!-- Rendered via JS -->
        </div>

        <!-- Resultado & Bloqueios -->
        <div class="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
          <div class="font-bold text-slate-800">Resultado Avaliado (Coluna AL):</div>
          <div id="modal-aluno-resultado" class="bg-white p-2.5 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800">
            -
          </div>
          <div id="modal-aluno-bloqueio" class="hidden text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 text-[11px] flex items-center gap-1.5">
            ⚠️ <span id="modal-aluno-bloqueio-texto">-</span>
          </div>
        </div>

        <!-- Colação & Período -->
        <div class="grid grid-cols-2 gap-3">
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span class="font-bold text-slate-700 block mb-1">Data de Colação (Coluna Q):</span>
            <span id="modal-aluno-colacao" class="text-slate-900 font-medium">Não registrada (vazio)</span>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span class="font-bold text-slate-700 block mb-1">Período de Conclusão:</span>
            <span id="modal-aluno-periodo" class="text-slate-900 font-medium">-</span>
          </div>
        </div>

        <!-- ENADE Info -->
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
          <span class="font-bold text-slate-700 block">Classificação ENADE Concluinte:</span>
          <p id="modal-aluno-enade-detalhes" class="text-slate-600 text-[11px]">-</p>
          <p id="modal-aluno-enade-motivo" class="text-slate-500 text-[11px]">-</p>
        </div>

        <!-- Pareceres -->
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
          <span class="font-bold text-slate-700 block">Parecer Interno / Externo nos Processos:</span>
          <div id="modal-aluno-pareceres" class="space-y-1 text-slate-600 text-[11px]">
            <!-- Rendered via JS -->
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal 3: Regras & Fórmulas -->
  <div id="modal-formulas" class="hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden" onclick="event.stopPropagation()">
      <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
        <div class="flex items-center gap-2.5">
          <div class="h-8 w-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-lg">
            📜
          </div>
          <div>
            <h3 class="text-sm font-bold text-white">Regras das Fórmulas Excel & Lógica Python</h3>
            <p class="text-xs text-slate-300">Detalhamento das condições avaliadas para geração dos relatórios</p>
          </div>
        </div>
        <button onclick="fecharModalFormulas()" class="px-2.5 py-1 text-xs font-semibold text-slate-400 hover:text-white rounded-lg cursor-pointer">
          Fechar
        </button>
      </div>

      <div class="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 custom-scroll">
        <!-- Section 1 -->
        <div class="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
          <h4 class="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            ✅ 1. Fórmulas de Concatenação de Processos (DRA137, DRA100, DRA139)
          </h4>
          <p class="text-slate-600 leading-relaxed">
            O sistema avalia as colunas T/U (DRA137), W/X (DRA100) e Z/AA (DRA139):
          </p>
          <ul class="list-disc list-inside space-y-1 text-slate-600 pl-2">
            <li><strong>DRA137 (Colação Especial):</strong> Se U="Em Exigência" ou T="NÃO"/"NAO" &rarr; Adiciona <em>"Abrir DRA137 (Colação Especial)"</em>.</li>
            <li><strong>DRA100 (Emitir Documentos Finais):</strong> Se X="Em Exigência" ou W="NÃO"/"NAO" &rarr; Adiciona <em>"Abrir DRA100 (Emitir Doc. Finais)"</em>.</li>
            <li><strong>DRA139 (Cerimônia de Formatura):</strong> Se AA="Em Exigência" ou Z="NÃO"/"NAO" &rarr; Se já constar na aba 'Colação Realizada', gera <em>"Cerimônia de Formatura Realizada, NÃO Abrir DRA139"</em>; caso contrário, <em>"Abrir DRA139 (Cerimônia de Formatura)"</em>.</li>
          </ul>
        </div>

        <!-- Section 2 -->
        <div class="bg-amber-50 rounded-xl p-4 border border-amber-200 space-y-2">
          <h4 class="text-sm font-bold text-amber-900 flex items-center gap-1.5">
            ⚠️ 2. Travas de Bloqueio Geral (Regra Python)
          </h4>
          <p class="text-amber-800 leading-relaxed">
            Se a Coluna AL (Resultado) contiver qualquer uma das seguintes frases de bloqueio, o aluno <strong>NÃO</strong> é exportado para nenhum relatório:
          </p>
          <div class="grid grid-cols-2 gap-2 text-amber-900 font-mono text-[11px] bg-white p-2.5 rounded-lg border border-amber-200">
            <div>• "resolver exigencia"</div>
            <div>• "aguardar finalizacao"</div>
            <div>• "processo concluido"</div>
            <div>• "pendencia de carga horaria"</div>
            <div>• "abrir dra045"</div>
            <div>• "sem pendencia de carga horaria"</div>
          </div>
        </div>

        <!-- Section 3 -->
        <div class="bg-blue-50 rounded-xl p-4 border border-blue-200 space-y-2">
          <h4 class="text-sm font-bold text-blue-900 flex items-center gap-1.5">
            🎖️ 3. Regra Especial do Processo DRA137 (Coluna Q)
          </h4>
          <p class="text-blue-800 leading-relaxed">
            Mesmo que a coluna Resultado indique DRA137, o script verifica a <strong>Coluna Q (Data de Colação de Grau)</strong>:
          </p>
          <p class="text-blue-700 bg-white p-2.5 rounded-lg border border-blue-200">
            Se a Coluna Q contiver uma data de colação preenchida (aluno já colou grau), ele é <strong>automaticamente ignorado do relatório DRA137</strong>, mas continua sendo exportado para os outros relatórios (DRA100, DRA139, ENADE) se elegível.
          </p>
        </div>

        <!-- Section 4 -->
        <div class="bg-emerald-50 rounded-xl p-4 border border-emerald-200 space-y-2">
          <h4 class="text-sm font-bold text-emerald-900 flex items-center gap-1.5">
            📖 4. Mapeamento ENADE Concluinte
          </h4>
          <p class="text-emerald-800 leading-relaxed">
            Alunos com solicitações DRA137 ou DRA100 são avaliados para participação ENADE:
          </p>
          <ul class="list-disc list-inside space-y-1 text-emerald-700 pl-2">
            <li>Se contém "não habilitado" &rarr; Situação: <strong>Não Habilitado</strong> | Motivo: <em>Estudante não habilitado ao Enade, em razão do calendário do ciclo avaliativo</em>.</li>
            <li>Se contém "habilitado" e "regular" &rarr; Situação: <strong>Habilitado</strong> | Motivo: <em>Não Possui</em>.</li>
            <li>Ano extraído automaticamente do texto ou padronizado em <strong>2026</strong>.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- Application Logic -->
  <script>
    // State variables
    let rawWorkbook = null;
    let currentDataset = null;
    let allStudents = [];
    let activeFilterTab = 'all';
    let searchQuery = '';
    let currentPage = 1;
    let pageSize = 25;
    let currentPreviewType = 'enade';
    let selectedPeriods = new Set(['2026-1', '2026-2']);

    // Chart instances
    let chartProcessos = null;
    let chartPeriodos = null;
    let chartMotivos = null;
    let chartEnade = null;

    const DENY_PHRASES = [
      'resolver exigencia',
      'aguardar finalizacao',
      'processo concluido',
      'pendencia de carga horaria',
      'abrir dra045',
      'sem pendencia de carga horaria'
    ];

    const CERIMONIA_PARECER = 
      "Coruja, a Cerimônia de Formatura é um momento especial e insubstituível, " +
      "dedicado exclusivamente à celebração desta grande conquista acadêmica. " +
      "Trata-se de uma solenidade simbólica e social, na qual você compartilhará a vitória " +
      "com familiares, amigos e colegas que estiveram presentes em sua jornada. " +
      "Para conferir todos os detalhes logísticos, prazos e normas do evento, é indispensável " +
      "a leitura completa do documento 'Regras e Orientações Gerais da Cerimônia de Formatura', " +
      "publicado e disponível para consulta no seu Ambiente do Aluno.";

    const ESCLARECIMENTO = "Protocolo aberto automaticamente";

    // Initialize user and drag & drop
    window.addEventListener('DOMContentLoaded', () => {
      // Check Google User
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run.withSuccessHandler(user => {
          if (user && user.email) {
            document.getElementById('user-email').innerText = user.email;
            document.getElementById('user-badge').classList.remove('hidden');
          }
        }).getCurrentUser();
      }

      // Drag & drop
      const dropArea = document.getElementById('drop-area');
      dropArea.addEventListener('click', () => document.getElementById('file-input').click());
      ['dragenter', 'dragover'].forEach(name => {
        dropArea.addEventListener(name, e => { e.preventDefault(); dropArea.classList.add('border-emerald-500', 'bg-emerald-50/50'); });
      });
      ['dragleave', 'drop'].forEach(name => {
        dropArea.addEventListener(name, e => { e.preventDefault(); dropArea.classList.remove('border-emerald-500', 'bg-emerald-50/50'); });
      });
      dropArea.addEventListener('drop', e => {
        if (e.dataTransfer.files.length) processFile(e.dataTransfer.files[0]);
      });
    });

    function normText(text) {
      if (!text) return '';
      return text.toString().toLowerCase()
        .replace(/[áàãâä]/g, 'a')
        .replace(/[éèêë]/g, 'e')
        .replace(/[íìîï]/g, 'i')
        .replace(/[óòõôö]/g, 'o')
        .replace(/[úùûü]/g, 'u')
        .replace(/[ç]/g, 'c')
        .replace(/\\s+/g, ' ').trim();
    }

    function normalizeMatricula(val) {
      if (!val) return '';
      let s = val.toString().trim();
      if (s.endsWith('.0')) s = s.slice(0, -2);
      const digits = s.replace(/\\D/g, '');
      if (!digits) return s;
      return digits.padStart(8, '0').slice(-8);
    }

    function extrairPeriodoNormalizado(val) {
      if (!val) return '';
      const s = val.toString().trim();
      const m = s.match(/(20\\d{2})[-/._\\s]?([12])/);
      if (m) return \`\${m[1]}-\${m[2]}\`;
      return s;
    }

    function handleFileSelect(event) {
      const file = event.target.files[0];
      if (file) processFile(file);
    }

    function processFile(file) {
      document.getElementById('status-tag').innerText = 'Processando...';
      document.getElementById('status-tag').className = 'text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800';

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          rawWorkbook = XLSX.read(data, { type: 'array' });
          document.getElementById('file-name').innerText = file.name;
          document.getElementById('file-info').classList.remove('hidden');
          executarAnalisePlanilha(file.name);
        } catch (err) {
          alert('Erro ao ler a planilha: ' + err.message);
          limparArquivo();
        }
      };
      reader.readAsArrayBuffer(file);
    }

    function limparArquivo() {
      rawWorkbook = null;
      currentDataset = null;
      allStudents = [];
      document.getElementById('file-input').value = '';
      document.getElementById('file-info').classList.add('hidden');
      document.getElementById('status-tag').innerText = 'Aguardando arquivo';
      document.getElementById('status-tag').className = 'text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600';
      document.getElementById('analytics-section').classList.add('hidden');
      document.getElementById('reports-section').classList.add('hidden');
      document.getElementById('table-section').classList.add('hidden');
      document.getElementById('periodos-container').innerHTML = '<span class="text-xs text-slate-400 italic">Carregue um arquivo para detectar os períodos da Coluna I</span>';
    }

    function executarAnalisePlanilha(nomeArquivo = 'Planilha_Processada.xlsx') {
      if (!rawWorkbook) return;

      // Locate sheet with 'Matrícula'
      let targetSheet = rawWorkbook.Sheets[rawWorkbook.SheetNames[0]];
      for (const sheetName of rawWorkbook.SheetNames) {
        const s = rawWorkbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(s, { header: 1 });
        const hasMat = data.slice(0, 25).some(row => (row || []).some(cell => normText(cell).includes('matricula')));
        if (hasMat) {
          targetSheet = s;
          break;
        }
      }

      const rawRows = XLSX.utils.sheet_to_json(targetSheet, { header: 1 });
      if (rawRows.length < 2) {
        alert('Nenhuma linha de dados encontrada na planilha.');
        return;
      }

      // Check for auxiliary sheets in workbook
      const colacaoSheet = rawWorkbook.Sheets['Colação Realizada'] || rawWorkbook.Sheets['Colacao Realizada'];
      const colacaoMatriculas = new Set();
      if (colacaoSheet) {
        const cRows = XLSX.utils.sheet_to_json(colacaoSheet, { header: 1 });
        for (const r of cRows) {
          if (r && r[0]) {
            const m = normalizeMatricula(r[0]);
            if (m) colacaoMatriculas.add(m);
          }
        }
      }

      // Detect header row and column mapping
      let headerIndex = 0;
      let rowStr = [];

      for (let r = 0; r < Math.min(rawRows.length, 25); r++) {
        const row = (rawRows[r] || []).map(cell => normText(cell));
        const matIdx = row.findIndex(c => c.includes('matricula'));
        if (matIdx !== -1) {
          headerIndex = r;
          rowStr = row;
          break;
        }
      }

      const isNewLayout = rowStr.some(c => c.includes('cargahoraria_acursar') || c.includes('ultimo_status_documentosfinais')) || rowStr.length >= 33;

      const findCol = (matchers) => {
        for (const m of matchers) {
          const idx = rowStr.findIndex(m);
          if (idx !== -1) return idx;
        }
        return null;
      };

      const colMat = findCol([s => s === 'matricula', s => s.startsWith('matricula'), s => s.includes('matricula')]) ?? 0;
      const colNome = findCol([s => s === 'nome', s => s === 'nome do aluno', s => s.includes('nome do aluno'), s => s.includes('nome') && !s.includes('mae') && !s.includes('pai')]) ?? 1;
      const colCpf = findCol([s => s === 'cpf', s => s.includes('cpf')]) ?? 2;
      const colCurso = findCol([s => s === 'curso', s => s.includes('curso') && !s.includes('modalidade')]) ?? 4;
      const colStatus = findCol([s => s === 'status_historico', s => s.includes('status_historico'), s => s.includes('status historico'), s => s === 'status', s => s.includes('status aluno')]) ?? 7;
      const colPeriodo = findCol([s => s === 'periodoletivo_conclusao', s => s.includes('periodoletivo'), s => s.includes('periodo letivo'), s => s.includes('conclusao provavel'), s => s.includes('periodo de conclusao')]) ?? 8;

      const colChExtensao = findCol([s => s === 'ch_extensao_a_cursar', s => s.includes('ch_extensao'), s => s.includes('extensao')]) ?? 9;
      const colChAtividade = findCol([s => s === 'ch_atividadecomplementar_a_cursar', s => s.includes('atividadecomplementar'), s => s.includes('ch_atividade')]) ?? 10;
      const colCreditos = findCol([s => s === 'creditos_acursar', s => s.includes('creditos_acursar'), s => s.includes('creditos')]) ?? 11;
      const colChCargaHoraria = findCol([s => s === 'cargahoraria_acursar', s => s.includes('cargahoraria')]) ?? (isNewLayout ? 12 : null);

      const colColacao = findCol([s => s === 'data_colacaograu', s => s.includes('data_colacao'), s => s.includes('data') && s.includes('colacao')]) ?? (isNewLayout ? 13 : 12);

      const colDra045Possui = findCol([s => s.includes('possuiprotocolo_dra045'), s => s.includes('045') && s.includes('possui')]) ?? (isNewLayout ? 14 : 13);
      const colDra045Status = findCol([s => s.includes('ultimostatus_dra045'), s => s.includes('045') && s.includes('status')]) ?? (isNewLayout ? 15 : 14);
      const colDra045Parecer = findCol([s => s.includes('ultimo_parecer_externo_dra045'), s => s.includes('045') && s.includes('parecer')]) ?? (isNewLayout ? 16 : 15);

      const colDra138Possui = findCol([s => s.includes('possuiprotocolo_dra138'), s => s.includes('138') && s.includes('possui')]) ?? (isNewLayout ? 17 : 16);
      const colDra138Status = findCol([s => s.includes('ultimostatus_dra138'), s => s.includes('138') && s.includes('status')]) ?? (isNewLayout ? 18 : 17);
      const colDra138Parecer = findCol([s => s.includes('ultimoparecerexterno_dra138'), s => s.includes('138') && s.includes('parecer')]) ?? (isNewLayout ? 19 : 18);

      const colDra137Possui = findCol([s => s.includes('possuiprotocolo_dra137'), s => s.includes('137') && s.includes('possui')]) ?? (isNewLayout ? 20 : 19);
      const colDra137Status = findCol([s => s.includes('ultimostatus_dra137'), s => s.includes('137') && s.includes('status')]) ?? (isNewLayout ? 21 : 20);

      const colDra100Possui = findCol([s => s.includes('possuiprotocolo_dra100'), s => s.includes('100') && s.includes('possui')]) ?? (isNewLayout ? 23 : 22);
      const colDra100Status = findCol([s => s.includes('ultimostatus_dra100'), s => s.includes('100') && s.includes('status')]) ?? (isNewLayout ? 24 : 23);

      const colDra139Possui = findCol([s => s.includes('possuiprotocolo_dra139'), s => s.includes('139') && s.includes('possui')]) ?? (isNewLayout ? 26 : 25);
      const colDra139Status = findCol([s => s.includes('ultimostatus_dra139'), s => s.includes('139') && s.includes('status')]) ?? (isNewLayout ? 27 : 26);

      const colEnade = findCol([s => s.includes('participacoes_enade_concluinte'), s => s.includes('enade concluinte'), s === 'enade', s => s.includes('enade') && !s.includes('ingressante')]) ?? (isNewLayout ? 32 : 30);
      const colResFound = findCol([s => s === 'resultado', s => s.includes('resultado')]);
      const colRes = colResFound !== null ? colResFound : (isNewLayout ? 33 : 31);

      // Collect available periods
      const periodCounts = {};
      for (let i = headerIndex + 1; i < rawRows.length; i++) {
        const row = rawRows[i] || [];
        const perRaw = (row[colPeriodo] || '').toString().trim();
        const perNorm = extrairPeriodoNormalizado(perRaw);
        if (perNorm) {
          periodCounts[perNorm] = (periodCounts[perNorm] || 0) + 1;
        }
      }

      renderizarSeletorPeriodos(periodCounts);

      // Evaluate Students
      const targetPeriods = Array.from(selectedPeriods);
      const alunosEnade = [], alunos137 = [], alunos100 = [], alunos139 = [];
      const todosAlunos = [];
      let totalIgnoradosColacao137 = 0;
      let totalLinhasFiltradasPeriodo = 0;
      const hoje = new Date().toLocaleDateString('pt-BR');

      const isNao = (v) => {
        const nv = normText(v);
        return nv === 'nao' || nv === 'n' || nv === 'false';
      };

      for (let i = headerIndex + 1; i < rawRows.length; i++) {
        const row = rawRows[i] || [];
        const mat = normalizeMatricula(row[colMat]);
        if (!mat) continue;

        const perRaw = (row[colPeriodo] || '').toString().trim();
        const perNorm = extrairPeriodoNormalizado(perRaw);

        if (targetPeriods.length > 0 && !targetPeriods.includes(perNorm) && !targetPeriods.includes(normText(perRaw))) {
          totalLinhasFiltradasPeriodo++;
          continue;
        }

        const nome = (row[colNome] || 'Nome não informado').toString().trim();
        const cpf = (row[colCpf] || '').toString().trim();
        const curso = (row[colCurso] || '').toString().trim();
        const valColacao = (row[colColacao] || '').toString().trim();
        const jaColouGrau = (valColacao !== '' && valColacao !== '-' && valColacao !== 'null' && valColacao !== '0');

        // Dynamic formula calculation if result column is missing or blank
        let rawResultado = (colRes < row.length && row[colRes] !== undefined ? (row[colRes] || '').toString().trim() : '');
        if (!rawResultado) {
          const u137 = (row[colDra137Status] || '').toString().trim();
          const t137 = (row[colDra137Possui] || '').toString().trim();
          const x100 = (row[colDra100Status] || '').toString().trim();
          const w100 = (row[colDra100Possui] || '').toString().trim();
          const aa139 = (row[colDra139Status] || '').toString().trim();
          const z139 = (row[colDra139Possui] || '').toString().trim();

          const pParts = [];
          if (normText(u137) === 'em exigencia') {
            pParts.push('Resolver Exigência do DRA137 (Colação Especial)');
          } else if (isNao(t137)) {
            pParts.push('Abrir DRA137 (Colação Especial)');
          }

          if (normText(x100) === 'em exigencia') {
            pParts.push('Resolver Exigência do DRA100 (Emitir Doc. Finais)');
          } else if (isNao(w100)) {
            pParts.push('Abrir DRA100 (Emitir Doc. Finais)');
          }

          if (normText(aa139) === 'em exigencia') {
            pParts.push('Resolver Exigência do DRA139 (Cerimônia de Formatura)');
          } else if (isNao(z139)) {
            const naColacaoRealizada = colacaoMatriculas.has(mat) || (curso && colacaoMatriculas.has(curso));
            if (naColacaoRealizada) {
              pParts.push('Cerimônia de Formatura Realizada, NÃO Abrir DRA139 (Cerimônia de Formatura)');
            } else {
              pParts.push('Abrir DRA139 (Cerimônia de Formatura)');
            }
          }

          const pJoined = pParts.filter(Boolean).join(', ');

          const nVal = (row[colDra045Possui] || '').toString().trim();
          const oVal = (row[colDra045Status] || '').toString().trim();
          const hVal = (row[colStatus] || '').toString().trim();

          if (!nVal && !oVal && !hVal) {
            rawResultado = '';
          } else if (jaColouGrau) {
            rawResultado = pJoined === '' ? 'Processo Concluído / Tudo OK' : pJoined;
          } else {
            const jNum = Number(row[colChExtensao]) || 0;
            const kNum = Number(row[colChAtividade]) || 0;
            const lNum = Number(row[colCreditos]) || 0;
            const mChNum = (colChCargaHoraria !== null ? Number(row[colChCargaHoraria]) : 0) || 0;

            if (jNum + kNum + lNum + mChNum > 0) {
              rawResultado = 'Pendência de Carga Horária / Créditos';
            } else if (isNao(nVal)) {
              rawResultado = 'Abrir DRA045 (Análise Documental) e DRA138 (Validação de Dados Pessoais)';
            } else if (normText(oVal) === 'em exigencia') {
              rawResultado = 'Resolver Exigência do DRA045 (Análise Documental)';
            } else if (normText(oVal) !== 'finalizado' && normText(oVal) !== 'pronto') {
              rawResultado = 'Aguardar Finalização do DRA045 (Análise Documental)';
            } else if (normText(hVal) !== 'formado') {
              rawResultado = 'Sem pendência de carga horária e créditos, mas não está com o status de formado';
            } else {
              const pText = (row[colDra045Parecer] || '').toString().trim();
              const qVal = (row[colDra138Possui] || '').toString().trim();
              const rVal = (row[colDra138Status] || '').toString().trim();

              const normP = normText(pText);
              const isNaoNecessidade = normP.includes('nao havera necessidade') || normP.includes('nao necessita');
              const hasConfirmeCorrija = normP.includes('confirme') || normP.includes('corrija');
              const qIsFilledAndNotNao = !isNao(qVal) && qVal !== '';

              if (!isNaoNecessidade && (qIsFilledAndNotNao || hasConfirmeCorrija)) {
                if (isNao(qVal)) {
                  rawResultado = 'Abrir DRA138 (Validação de Dados Pessoais)';
                } else if (normText(rVal) === 'em exigencia') {
                  rawResultado = 'Resolver Exigência do DRA138 (Validação de Dados Pessoais)';
                } else if (normText(rVal) !== 'finalizado') {
                  rawResultado = 'Aguardar Finalização do DRA138 (Validação de Dados Pessoais)';
                } else {
                  rawResultado = pJoined === '' ? 'Processo Concluído / Tudo OK' : pJoined;
                }
              } else {
                rawResultado = pJoined === '' ? 'Processo Concluído / Tudo OK' : pJoined;
              }
            }
          }
        }

        const txtRes = normText(rawResultado);
        const txtEnade = (row[colEnade] || '').toString().trim();

        // Check Deny phrases
        let bloqueado = false;
        let motivoBloqueio = '';
        for (const deny of DENY_PHRASES) {
          if (txtRes.includes(deny)) {
            bloqueado = true;
            motivoBloqueio = \`Bloqueado por: "\${deny}"\`;
            break;
          }
        }

        // Export flags
        let exportar137 = false, exportar100 = false, exportar139 = false, exportarEnade = false;

        if (!bloqueado) {
          const tem137 = txtRes.includes('dra137') || txtRes.includes('137');
          const tem100 = txtRes.includes('dra100') || txtRes.includes('100');
          const tem139 = txtRes.includes('dra139') || txtRes.includes('139');
          const bloqueio139 = (txtRes.includes('nao abrir') && txtRes.includes('139')) || txtRes.includes('cerimonia de formatura realizada');

          if (tem137 || tem100) exportarEnade = true;

          if (tem137) {
            if (jaColouGrau) {
              totalIgnoradosColacao137++;
            } else {
              exportar137 = true;
            }
          }

          if (tem100) exportar100 = true;
          if (tem139 && !bloqueio139) exportar139 = true;
        }

        // ENADE classification
        const enadeNorm = normText(txtEnade);
        const anoMatch = (txtEnade.match(/(20\\d{2})/g) || []);
        const anoEnade = anoMatch.length ? anoMatch[anoMatch.length - 1] : '2026';
        let situacaoEnade = '', motivoEnade = '';

        if (enadeNorm.includes('nao habilitado')) {
          situacaoEnade = 'Não Habilitado';
          motivoEnade = 'Estudante não habilitado ao Enade, em razão do calendário do ciclo avaliativo';
        } else if (enadeNorm.includes('habilitado') && enadeNorm.includes('regular')) {
          situacaoEnade = 'Habilitado';
          motivoEnade = 'Não Possui';
        } else {
          situacaoEnade = enadeNorm.includes('irregular') ? 'Irregular' : '';
        }

        const parecer137 = \`Colação de Grau Especial (De Ofício) realizada em \${hoje}.\`;
        const parecer100 = \`Emissão de Documentos Finais realizada em \${hoje}.\`;

        const student = {
          matricula: mat,
          cpf,
          nome,
          periodo: perNorm || perRaw || '2026-1',
          dataColacao: valColacao,
          jaColouGrau,
          resultadoOriginal: rawResultado,
          motivoBloqueio,
          exportarEnade,
          exportar137,
          exportar100,
          exportar139,
          anoEnade,
          condicaoEnade: 'Concluinte',
          situacaoEnade,
          motivoEnade,
          esclarecimento: ESCLARECIMENTO,
          parecer137,
          parecer100,
          parecer139: CERIMONIA_PARECER
        };

        todosAlunos.push(student);
        if (exportarEnade) alunosEnade.push(student);
        if (exportar137) alunos137.push(student);
        if (exportar100) alunos100.push(student);
        if (exportar139) alunos139.push(student);
      }

      const tagGerada = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
      currentDataset = {
        filename: nomeArquivo,
        tagGerada,
        totalLinhasLidas: rawRows.length - 1,
        totalLinhasFiltradasPeriodo,
        totalIgnoradosColacao137,
        todosAlunos,
        alunosEnade,
        alunos137,
        alunos100,
        alunos139,
        periodosSelecionados: targetPeriods
      };

      allStudents = todosAlunos;

      // Update UI
      document.getElementById('status-tag').innerText = 'Processado com Sucesso';
      document.getElementById('status-tag').className = 'text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800';
      document.getElementById('file-stats').innerText = \`\${rawRows.length - 1} linhas lidas • \${todosAlunos.length} concluintes analisados\`;

      atualizarKPIs();
      atualizarGraficos();
      atualizarCardsRelatorio();
      atualizarTabelaAlunos();

      document.getElementById('analytics-section').classList.remove('hidden');
      document.getElementById('reports-section').classList.remove('hidden');
      document.getElementById('table-section').classList.remove('hidden');
    }

    function renderizarSeletorPeriodos(periodCounts) {
      const container = document.getElementById('periodos-container');
      const keys = Object.keys(periodCounts);
      if (keys.length === 0) {
        container.innerHTML = '<span class="text-xs text-slate-400">Nenhum período identificado</span>';
        return;
      }

      container.innerHTML = keys.map(p => {
        const isSel = selectedPeriods.has(p);
        const cls = isSel 
          ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200';
        return \`
          <button onclick="togglePeriodo('\${p}')" class="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 \${cls} cursor-pointer">
            <span>\${isSel ? '✓' : ''} \${p}</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded \${isSel ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-700'}">\${periodCounts[p]}</span>
          </button>
        \`;
      }).join('');

      document.getElementById('periodos-selecionados-label').innerText = \`\${selectedPeriods.size} períodos ativos\`;
    }

    function togglePeriodo(p) {
      if (selectedPeriods.has(p)) {
        if (selectedPeriods.size > 1) selectedPeriods.delete(p);
      } else {
        selectedPeriods.add(p);
      }
      if (rawWorkbook) executarAnalisePlanilha(document.getElementById('file-name').innerText);
    }

    function selecionarPeriodosPadrao() {
      selectedPeriods = new Set(['2026-1', '2026-2']);
      if (rawWorkbook) executarAnalisePlanilha(document.getElementById('file-name').innerText);
    }

    function selecionarTodosPeriodos() {
      const btns = document.querySelectorAll('#periodos-container button');
      btns.forEach(b => {
        const txt = b.innerText.split(' ')[1] || b.innerText.split(' ')[0];
        if (txt) selectedPeriods.add(txt.trim());
      });
      if (rawWorkbook) executarAnalisePlanilha(document.getElementById('file-name').innerText);
    }

    function limparPeriodos() {
      selectedPeriods = new Set();
      if (rawWorkbook) executarAnalisePlanilha(document.getElementById('file-name').innerText);
    }

    function atualizarKPIs() {
      if (!currentDataset) return;
      const { todosAlunos, alunosEnade, alunos137, alunos100, alunos139, totalIgnoradosColacao137, totalLinhasLidas } = currentDataset;
      const bloqueados = todosAlunos.filter(a => !a.exportar137 && !a.exportar100 && !a.exportar139 && !a.exportarEnade);

      document.getElementById('kpi-analisados').innerText = todosAlunos.length;
      document.getElementById('kpi-analisados-sub').innerText = \`de \${totalLinhasLidas} no arquivo\`;
      document.getElementById('kpi-enade').innerText = alunosEnade.length;
      document.getElementById('kpi-dra137').innerText = alunos137.length;
      document.getElementById('kpi-dra100').innerText = alunos100.length;
      document.getElementById('kpi-dra139').innerText = alunos139.length;
      document.getElementById('kpi-travas').innerText = bloqueados.length + totalIgnoradosColacao137;
      document.getElementById('kpi-travas-sub').innerText = \`\${totalIgnoradosColacao137} já colaram grau\`;
    }

    function atualizarGraficos() {
      if (!currentDataset) return;
      const { todosAlunos, alunosEnade, alunos137, alunos100, alunos139 } = currentDataset;

      // 1. Chart Processos
      if (chartProcessos) chartProcessos.destroy();
      chartProcessos = new Chart(document.getElementById('chart-processos'), {
        type: 'bar',
        data: {
          labels: ['ENADE Concluintes', 'DRA137 (Colação)', 'DRA100 (Docs Finais)', 'DRA139 (Cerimônia)'],
          datasets: [{
            data: [alunosEnade.length, alunos137.length, alunos100.length, alunos139.length],
            backgroundColor: ['#10b981', '#3b82f6', '#6366f1', '#8b5cf6'],
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
        }
      });

      // 2. Chart Periodos
      const pCounts = {};
      todosAlunos.forEach(a => { pCounts[a.periodo] = (pCounts[a.periodo] || 0) + 1; });
      if (chartPeriodos) chartPeriodos.destroy();
      chartPeriodos = new Chart(document.getElementById('chart-periodos'), {
        type: 'bar',
        data: {
          labels: Object.keys(pCounts),
          datasets: [{
            data: Object.values(pCounts),
            backgroundColor: '#0284c7',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
        }
      });

      // 3. Chart Motivos
      const mCounts = {};
      todosAlunos.forEach(a => {
        if (a.motivoBloqueio) {
          const m = a.motivoBloqueio.replace('Bloqueado por: ', '').replace(/"/g, '');
          mCounts[m] = (mCounts[m] || 0) + 1;
        }
      });
      if (chartMotivos) chartMotivos.destroy();
      chartMotivos = new Chart(document.getElementById('chart-motivos'), {
        type: 'bar',
        data: {
          labels: Object.keys(mCounts),
          datasets: [{
            data: Object.values(mCounts),
            backgroundColor: '#f59e0b',
            borderRadius: 6
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { x: { beginAtZero: true, ticks: { precision: 0 } } }
        }
      });

      // 4. Chart ENADE
      const eCounts = {};
      alunosEnade.forEach(a => {
        const sit = a.situacaoEnade || 'Regular / Habilitado';
        eCounts[sit] = (eCounts[sit] || 0) + 1;
      });
      if (chartEnade) chartEnade.destroy();
      chartEnade = new Chart(document.getElementById('chart-enade'), {
        type: 'doughnut',
        data: {
          labels: Object.keys(eCounts),
          datasets: [{
            data: Object.values(eCounts),
            backgroundColor: ['#10b981', '#3b82f6', '#6366f1', '#f59e0b'],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }

    function atualizarCardsRelatorio() {
      if (!currentDataset) return;
      const { alunosEnade, alunos137, alunos100, alunos139, totalIgnoradosColacao137, tagGerada } = currentDataset;
      const totalRegistros = alunosEnade.length + alunos137.length + alunos100.length + alunos139.length;

      document.getElementById('batch-tag').innerText = \`LOTE \${tagGerada}\`;
      document.getElementById('batch-summary').innerText = \`\${totalRegistros} registros distribuídos nos 4 relatórios acadêmicos oficiais\`;

      document.getElementById('card-count-enade').innerText = alunosEnade.length;
      document.getElementById('card-count-dra137').innerText = alunos137.length;
      document.getElementById('card-count-dra100').innerText = alunos100.length;
      document.getElementById('card-count-dra139').innerText = alunos139.length;

      // Badge ignorados no DRA137
      if (totalIgnoradosColacao137 > 0) {
        document.getElementById('count-dra137-ignorados').innerText = totalIgnoradosColacao137;
        document.getElementById('badge-dra137-ignorados').classList.remove('hidden');
      } else {
        document.getElementById('badge-dra137-ignorados').classList.add('hidden');
      }

      // Disabled preview buttons if 0
      document.getElementById('btn-preview-enade').disabled = alunosEnade.length === 0;
      document.getElementById('btn-preview-dra137').disabled = alunos137.length === 0;
      document.getElementById('btn-preview-dra100').disabled = alunos100.length === 0;
      document.getElementById('btn-preview-dra139').disabled = alunos139.length === 0;
    }

    // Modal Preview de Alunos do Relatório (Olhinho do Card)
    function abrirPreview(tipo) {
      if (!currentDataset) return;
      currentPreviewType = tipo;

      let titulo = '', alunos = [], theadHtml = '';
      if (tipo === 'enade') {
        titulo = 'Participações ENADE (Concluintes)';
        alunos = currentDataset.alunosEnade;
        theadHtml = \`
          <th class="py-2.5 px-3">Matrícula</th>
          <th class="py-2.5 px-3">Nome</th>
          <th class="py-2.5 px-3">Ano</th>
          <th class="py-2.5 px-3">Situação</th>
          <th class="py-2.5 px-3">Motivo</th>
        \`;
      } else if (tipo === 'dra137') {
        titulo = 'Processos em Massa DRA137 (Colação Especial)';
        alunos = currentDataset.alunos137;
        theadHtml = \`
          <th class="py-2.5 px-3">Matrícula</th>
          <th class="py-2.5 px-3">Nome</th>
          <th class="py-2.5 px-3">Status</th>
          <th class="py-2.5 px-3">Parecer Oficial</th>
        \`;
      } else if (tipo === 'dra100') {
        titulo = 'Processos em Massa DRA100 (Emitir Documentos Finais)';
        alunos = currentDataset.alunos100;
        theadHtml = \`
          <th class="py-2.5 px-3">Matrícula</th>
          <th class="py-2.5 px-3">Nome</th>
          <th class="py-2.5 px-3">Status</th>
          <th class="py-2.5 px-3">Parecer Oficial</th>
        \`;
      } else if (tipo === 'dra139') {
        titulo = 'Processos em Massa DRA139 (Cerimônia de Formatura)';
        alunos = currentDataset.alunos139;
        theadHtml = \`
          <th class="py-2.5 px-3">Matrícula</th>
          <th class="py-2.5 px-3">Nome</th>
          <th class="py-2.5 px-3">Status</th>
          <th class="py-2.5 px-3">Parecer Oficial</th>
        \`;
      }

      document.getElementById('modal-preview-title').innerText = titulo;
      document.getElementById('modal-preview-subtitle').innerText = \`\${alunos.length} registros prontos para exportação\`;
      document.getElementById('modal-preview-thead').innerHTML = theadHtml;
      document.getElementById('modal-preview-btn-download').onclick = () => baixarRelatorioIndividual(tipo);

      const tbody = document.getElementById('modal-preview-tbody');
      if (alunos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-6 text-slate-400">Nenhum aluno neste relatório.</td></tr>';
      } else {
        tbody.innerHTML = alunos.map(a => {
          if (tipo === 'enade') {
            return \`
              <tr class="hover:bg-slate-50">
                <td class="py-2 px-3 font-mono font-bold text-slate-900">\${a.matricula}</td>
                <td class="py-2 px-3 font-medium text-slate-800">\${a.nome}</td>
                <td class="py-2 px-3">\${a.anoEnade}</td>
                <td class="py-2 px-3"><span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">\${a.situacaoEnade || 'Habilitado'}</span></td>
                <td class="py-2 px-3 text-slate-500 text-[11px]">\${a.motivoEnade || 'Não Possui'}</td>
              </tr>
            \`;
          } else {
            const status = tipo === 'dra139' ? 'Aguardando Atendimento' : 'Finalizado';
            const statusCls = tipo === 'dra139' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800';
            const parecer = tipo === 'dra137' ? a.parecer137 : tipo === 'dra100' ? a.parecer100 : a.parecer139;
            return \`
              <tr class="hover:bg-slate-50">
                <td class="py-2 px-3 font-mono font-bold text-slate-900">\${a.matricula}</td>
                <td class="py-2 px-3 font-medium text-slate-800">\${a.nome}</td>
                <td class="py-2 px-3"><span class="px-1.5 py-0.5 rounded text-[10px] font-semibold \${statusCls}">\${status}</span></td>
                <td class="py-2 px-3 text-slate-600 text-[11px] max-w-md truncate" title="\${parecer}">\${parecer}</td>
              </tr>
            \`;
          }
        }).join('');
      }

      document.getElementById('modal-preview').classList.remove('hidden');
    }

    function fecharModalPreview() {
      document.getElementById('modal-preview').classList.add('hidden');
    }

    // Modal Auditoria Detalhada do Aluno (Olhinho na Tabela)
    function abrirModalAluno(matricula) {
      if (!currentDataset) return;
      const aluno = currentDataset.todosAlunos.find(a => a.matricula === matricula);
      if (!aluno) return;

      document.getElementById('modal-aluno-nome').innerText = aluno.nome;
      document.getElementById('modal-aluno-info').innerText = \`Matrícula: \${aluno.matricula} • CPF: \${aluno.cpf || 'Não informado'}\`;

      // Flags
      document.getElementById('modal-aluno-flags').innerHTML = \`
        <div class="p-3 rounded-xl border \${aluno.exportarEnade ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-500'}">
          <div class="font-bold flex items-center gap-1.5">
            <span>\${aluno.exportarEnade ? '✓' : '✗'}</span>
            <span>ENADE</span>
          </div>
          <div class="text-[10px] mt-1">\${aluno.exportarEnade ? 'Apto para envio' : 'Não enviado'}</div>
        </div>

        <div class="p-3 rounded-xl border \${aluno.exportar137 ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-slate-50 border-slate-200 text-slate-500'}">
          <div class="font-bold flex items-center gap-1.5">
            <span>\${aluno.exportar137 ? '✓' : '✗'}</span>
            <span>DRA137</span>
          </div>
          <div class="text-[10px] mt-1">\${aluno.exportar137 ? 'Colação Especial' : aluno.jaColouGrau ? 'Ignorado (já colou)' : 'Não solicitado'}</div>
        </div>

        <div class="p-3 rounded-xl border \${aluno.exportar100 ? 'bg-indigo-50 border-indigo-200 text-indigo-800' : 'bg-slate-50 border-slate-200 text-slate-500'}">
          <div class="font-bold flex items-center gap-1.5">
            <span>\${aluno.exportar100 ? '✓' : '✗'}</span>
            <span>DRA100</span>
          </div>
          <div class="text-[10px] mt-1">\${aluno.exportar100 ? 'Docs Finais' : 'Não solicitado'}</div>
        </div>

        <div class="p-3 rounded-xl border \${aluno.exportar139 ? 'bg-violet-50 border-violet-200 text-violet-800' : 'bg-slate-50 border-slate-200 text-slate-500'}">
          <div class="font-bold flex items-center gap-1.5">
            <span>\${aluno.exportar139 ? '✓' : '✗'}</span>
            <span>DRA139</span>
          </div>
          <div class="text-[10px] mt-1">\${aluno.exportar139 ? 'Cerimônia' : 'Não solicitado'}</div>
        </div>
      \`;

      document.getElementById('modal-aluno-resultado').innerText = aluno.resultadoOriginal || 'Vazio';
      if (aluno.motivoBloqueio) {
        document.getElementById('modal-aluno-bloqueio-texto').innerText = aluno.motivoBloqueio;
        document.getElementById('modal-aluno-bloqueio').classList.remove('hidden');
      } else {
        document.getElementById('modal-aluno-bloqueio').classList.add('hidden');
      }

      document.getElementById('modal-aluno-colacao').innerText = aluno.dataColacao ? aluno.dataColacao : 'Não registrada (vazio)';
      document.getElementById('modal-aluno-periodo').innerText = aluno.periodo;

      document.getElementById('modal-aluno-enade-detalhes').innerHTML = \`
        <strong>Ano:</strong> \${aluno.anoEnade} • <strong>Condição:</strong> \${aluno.condicaoEnade} • <strong>Situação:</strong> \${aluno.situacaoEnade || 'Não Habilitado'}
      \`;
      document.getElementById('modal-aluno-enade-motivo').innerHTML = \`
        <strong>Motivo:</strong> \${aluno.motivoEnade || 'Não Possui'}
      \`;

      let pareceresHtml = '';
      if (aluno.exportar137) pareceresHtml += \`<p><strong>DRA137:</strong> \${aluno.parecer137}</p>\`;
      if (aluno.exportar100) pareceresHtml += \`<p><strong>DRA100:</strong> \${aluno.parecer100}</p>\`;
      if (aluno.exportar139) pareceresHtml += \`<p><strong>DRA139:</strong> \${aluno.parecer139}</p>\`;
      if (!pareceresHtml) pareceresHtml = '<p class="text-slate-400 italic">Nenhum processo a ser gerado para este aluno.</p>';
      document.getElementById('modal-aluno-pareceres').innerHTML = pareceresHtml;

      document.getElementById('modal-aluno').classList.remove('hidden');
    }

    function fecharModalAluno() {
      document.getElementById('modal-aluno').classList.add('hidden');
    }

    function abrirModalFormulas() {
      document.getElementById('modal-formulas').classList.remove('hidden');
    }

    function fecharModalFormulas() {
      document.getElementById('modal-formulas').classList.add('hidden');
    }

    // Student Table Logic & Pagination
    function atualizarTabelaAlunos() {
      if (!currentDataset) return;
      const { todosAlunos, alunosEnade, alunos137, alunos100, alunos139 } = currentDataset;

      document.getElementById('count-tab-all').innerText = todosAlunos.length;
      document.getElementById('count-tab-enade').innerText = alunosEnade.length;
      document.getElementById('count-tab-137').innerText = alunos137.length;
      document.getElementById('count-tab-100').innerText = alunos100.length;
      document.getElementById('count-tab-139').innerText = alunos139.length;
      document.getElementById('count-tab-colou').innerText = todosAlunos.filter(a => a.jaColouGrau).length;
      document.getElementById('count-tab-blocked').innerText = todosAlunos.filter(a => !a.exportar137 && !a.exportar100 && !a.exportar139 && !a.exportarEnade).length;

      filtrarTabela();
    }

    function trocarAbaFiltro(tab) {
      activeFilterTab = tab;
      currentPage = 1;

      // Update button styles
      const tabs = ['all', 'enade', '137', '100', '139', 'colou', 'blocked'];
      tabs.forEach(t => {
        const btn = document.getElementById(\`tab-\${t}\`);
        if (t === tab) {
          btn.className = t === 'all' ? 'px-3 py-1.5 rounded-lg whitespace-nowrap bg-slate-900 text-white shadow-xs'
            : t === 'enade' ? 'px-3 py-1.5 rounded-lg whitespace-nowrap bg-emerald-600 text-white shadow-xs'
            : t === '137' ? 'px-3 py-1.5 rounded-lg whitespace-nowrap bg-blue-600 text-white shadow-xs'
            : t === '100' ? 'px-3 py-1.5 rounded-lg whitespace-nowrap bg-indigo-600 text-white shadow-xs'
            : t === '139' ? 'px-3 py-1.5 rounded-lg whitespace-nowrap bg-violet-600 text-white shadow-xs'
            : t === 'colou' ? 'px-3 py-1.5 rounded-lg whitespace-nowrap bg-cyan-600 text-white shadow-xs'
            : 'px-3 py-1.5 rounded-lg whitespace-nowrap bg-amber-600 text-white shadow-xs';
        } else {
          btn.className = t === 'all' ? 'px-3 py-1.5 rounded-lg whitespace-nowrap bg-slate-100 text-slate-600 hover:bg-slate-200'
            : t === 'enade' ? 'px-3 py-1.5 rounded-lg whitespace-nowrap bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            : t === '137' ? 'px-3 py-1.5 rounded-lg whitespace-nowrap bg-blue-50 text-blue-700 hover:bg-blue-100'
            : t === '100' ? 'px-3 py-1.5 rounded-lg whitespace-nowrap bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            : t === '139' ? 'px-3 py-1.5 rounded-lg whitespace-nowrap bg-violet-50 text-violet-700 hover:bg-violet-100'
            : t === 'colou' ? 'px-3 py-1.5 rounded-lg whitespace-nowrap bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
            : 'px-3 py-1.5 rounded-lg whitespace-nowrap bg-amber-50 text-amber-700 hover:bg-amber-100';
        }
      });

      filtrarTabela();
    }

    function filtrarTabela() {
      if (!currentDataset) return;
      searchQuery = document.getElementById('input-search').value.toLowerCase().trim();

      let list = currentDataset.todosAlunos;
      if (activeFilterTab === 'enade') list = list.filter(a => a.exportarEnade);
      else if (activeFilterTab === '137') list = list.filter(a => a.exportar137);
      else if (activeFilterTab === '100') list = list.filter(a => a.exportar100);
      else if (activeFilterTab === '139') list = list.filter(a => a.exportar139);
      else if (activeFilterTab === 'colou') list = list.filter(a => a.jaColouGrau);
      else if (activeFilterTab === 'blocked') list = list.filter(a => !a.exportar137 && !a.exportar100 && !a.exportar139 && !a.exportarEnade);

      if (searchQuery) {
        list = list.filter(a => 
          a.matricula.toLowerCase().includes(searchQuery) ||
          a.nome.toLowerCase().includes(searchQuery) ||
          a.cpf.includes(searchQuery) ||
          a.periodo.toLowerCase().includes(searchQuery) ||
          a.resultadoOriginal.toLowerCase().includes(searchQuery)
        );
      }

      // Pagination
      const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
      if (currentPage > totalPages) currentPage = totalPages;
      const start = (currentPage - 1) * pageSize;
      const paginated = list.slice(start, start + pageSize);

      document.getElementById('pagination-info').innerText = \`de \${list.length} alunos filtrados\`;
      document.getElementById('page-indicator').innerText = \`Página \${currentPage} de \${totalPages}\`;
      document.getElementById('btn-prev-page').disabled = currentPage === 1;
      document.getElementById('btn-next-page').disabled = currentPage === totalPages;

      const tbody = document.getElementById('student-table-body');
      if (paginated.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center py-8 text-slate-400">Nenhum aluno encontrado para os filtros aplicados.</td></tr>';
        return;
      }

      tbody.innerHTML = paginated.map(a => {
        const isBlocked = !a.exportar137 && !a.exportar100 && !a.exportar139 && !a.exportarEnade;
        let badgesHtml = '';
        if (a.exportarEnade) badgesHtml += '<span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 mr-1">ENADE</span>';
        if (a.exportar137) badgesHtml += '<span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 mr-1">DRA137</span>';
        if (a.exportar100) badgesHtml += '<span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-800 mr-1">DRA100</span>';
        if (a.exportar139) badgesHtml += '<span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-violet-100 text-violet-800 mr-1">DRA139</span>';
        if (isBlocked) badgesHtml += \`<span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200" title="\${a.motivoBloqueio}">Bloqueado</span>\`;

        return \`
          <tr class="hover:bg-slate-50/80 transition-colors">
            <td class="py-2.5 px-3 font-mono font-bold text-slate-900">\${a.matricula}</td>
            <td class="py-2.5 px-3 font-medium text-slate-900">\${a.nome}</td>
            <td class="py-2.5 px-3">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                📅 \${a.periodo}
              </span>
            </td>
            <td class="py-2.5 px-3">
              \${a.dataColacao ? \`<span class="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">\${a.dataColacao}</span>\` : '<span class="text-slate-400 text-[11px] italic">Vazio</span>'}
            </td>
            <td class="py-2.5 px-3 max-w-xs truncate text-[11px] text-slate-700 font-medium" title="\${a.resultadoOriginal}">
              \${a.resultadoOriginal || '-'}
            </td>
            <td class="py-2.5 px-3 flex items-center flex-wrap">
              \${badgesHtml}
            </td>
            <td class="py-2.5 px-3 text-[11px] text-slate-600">
              \${a.situacaoEnade || (a.resultadoOriginal.includes('nao habilitado') ? 'Não Habilitado' : '-')}
            </td>
            <td class="py-2.5 px-3 text-center">
              <button onclick="abrirModalAluno('\${a.matricula}')" class="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer" title="Ver auditoria detalhada do aluno">
                👁️
              </button>
            </td>
          </tr>
        \`;
      }).join('');
    }

    function mudarPagina(delta) {
      currentPage += delta;
      filtrarTabela();
    }

    function mudarPageSize(size) {
      pageSize = Number(size);
      currentPage = 1;
      filtrarTabela();
    }

    // Export Functions
    function baixarRelatorioIndividual(tipo) {
      if (!currentDataset) return;
      const { tagGerada } = currentDataset;
      const wb = XLSX.utils.book_new();

      if (tipo === 'enade') {
        const rows = [
          ['matricula', 'nome', 'anoenade_concluinte', 'condicaoenade_concluinte', 'situacaoenade_concluinte', 'motivoenade_concluinte'],
          ...currentDataset.alunosEnade.map(a => [a.matricula, a.nome, a.anoEnade, a.condicaoEnade, a.situacaoEnade, a.motivoEnade])
        ];
        const ws = XLSX.utils.aoa_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, \`Gerado_\${tagGerada}\`.slice(0, 31));
        XLSX.writeFile(wb, \`Participações ENADE (Gerado \${tagGerada}).xlsx\`);
      } else {
        const reqName = tipo.toUpperCase();
        const alunos = tipo === 'dra137' ? currentDataset.alunos137 : tipo === 'dra100' ? currentDataset.alunos100 : currentDataset.alunos139;
        const status = tipo === 'dra139' ? 'Aguardando Atendimento' : 'Finalizado';
        const rows = [
          ['Matrícula', 'Solicitação', 'Status', 'Esclarecimento', 'Parecer Interno', 'Parecer Externo'],
          ...alunos.map(a => {
            const p = tipo === 'dra137' ? a.parecer137 : tipo === 'dra100' ? a.parecer100 : a.parecer139;
            return [a.matricula, reqName, status, a.esclarecimento, p, p];
          })
        ];
        const ws = XLSX.utils.aoa_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, \`Gerado_\${tagGerada}\`.slice(0, 31));
        XLSX.writeFile(wb, \`Processos em Massa \${reqName} (Gerado \${tagGerada}).xlsx\`);
      }
    }

    async function baixarTodosZip() {
      if (!currentDataset) return;
      const { tagGerada } = currentDataset;
      const zip = new JSZip();

      function getBuffer(rows) {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, \`Gerado_\${tagGerada}\`.slice(0, 31));
        return XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      }

      // 1. ENADE
      if (currentDataset.alunosEnade.length > 0) {
        const rows = [
          ['matricula', 'nome', 'anoenade_concluinte', 'condicaoenade_concluinte', 'situacaoenade_concluinte', 'motivoenade_concluinte'],
          ...currentDataset.alunosEnade.map(a => [a.matricula, a.nome, a.anoEnade, a.condicaoEnade, a.situacaoEnade, a.motivoEnade])
        ];
        zip.file(\`Participações ENADE (Gerado \${tagGerada}).xlsx\`, getBuffer(rows));
      }

      // 2. DRA137
      if (currentDataset.alunos137.length > 0) {
        const rows = [
          ['Matrícula', 'Solicitação', 'Status', 'Esclarecimento', 'Parecer Interno', 'Parecer Externo'],
          ...currentDataset.alunos137.map(a => [a.matricula, 'DRA137', 'Finalizado', a.esclarecimento, a.parecer137, a.parecer137])
        ];
        zip.file(\`Processos em Massa DRA137 (Gerado \${tagGerada}).xlsx\`, getBuffer(rows));
      }

      // 3. DRA100
      if (currentDataset.alunos100.length > 0) {
        const rows = [
          ['Matrícula', 'Solicitação', 'Status', 'Esclarecimento', 'Parecer Interno', 'Parecer Externo'],
          ...currentDataset.alunos100.map(a => [a.matricula, 'DRA100', 'Finalizado', a.esclarecimento, a.parecer100, a.parecer100])
        ];
        zip.file(\`Processos em Massa DRA100 (Gerado \${tagGerada}).xlsx\`, getBuffer(rows));
      }

      // 4. DRA139
      if (currentDataset.alunos139.length > 0) {
        const rows = [
          ['Matrícula', 'Solicitação', 'Status', 'Esclarecimento', 'Parecer Interno', 'Parecer Externo'],
          ...currentDataset.alunos139.map(a => [a.matricula, 'DRA139', 'Aguardando Atendimento', a.esclarecimento, a.parecer139, a.parecer139])
        ];
        zip.file(\`Processos em Massa DRA139 (Gerado \${tagGerada}).xlsx\`, getBuffer(rows));
      }

      // Summary text
      const txt = [
        'RELATÓRIO DE PROCESSAMENTO AUTOMÁTICO DE FORMANDOS E PROCESSOS DRA',
        \`Origem: \${currentDataset.filename}\`,
        \`Gerado em: \${new Date().toLocaleString('pt-BR')}\`,
        \`Tag do Lote: \${tagGerada}\`,
        \`Períodos: \${currentDataset.periodosSelecionados.join(', ') || 'Todos'}\`,
        '--------------------------------------------------',
        \`Total de Alunos Analisados: \${currentDataset.totalLinhasLidas}\`,
        \`Alunos Ignorados no DRA137 (já colaram grau): \${currentDataset.totalIgnoradosColacao137}\`,
        '--------------------------------------------------',
        \`- ENADE: \${currentDataset.alunosEnade.length}\`,
        \`- DRA137: \${currentDataset.alunos137.length}\`,
        \`- DRA100: \${currentDataset.alunos100.length}\`,
        \`- DRA139: \${currentDataset.alunos139.length}\`
      ].join('\\n');
      zip.file(\`README_Resumo_Lote_\${tagGerada}.txt\`, txt);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = \`Relatorios_Processados_DRA_\${tagGerada}.zip\`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    function baixarAuditoriaConsolidada() {
      if (!currentDataset) return;
      const { todosAlunos, tagGerada } = currentDataset;
      const rows = [
        ['Matrícula', 'Nome', 'Período Letivo', 'Resultado Avaliado', 'Data de Colação', 'Já Colou Grau?', 'DRA137', 'DRA100', 'DRA139', 'ENADE', 'Situação ENADE', 'Status/Bloqueio'],
        ...todosAlunos.map(a => [
          a.matricula,
          a.nome,
          a.periodo,
          a.resultadoOriginal,
          a.dataColacao || '-',
          a.jaColouGrau ? 'SIM' : 'NÃO',
          a.exportar137 ? 'SIM' : 'NÃO',
          a.exportar100 ? 'SIM' : 'NÃO',
          a.exportar139 ? 'SIM' : 'NÃO',
          a.exportarEnade ? 'SIM' : 'NÃO',
          a.situacaoEnade || a.condicaoEnade,
          a.motivoBloqueio || 'Apto para Exportação'
        ])
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, 'Auditoria_Consolidada');
      XLSX.writeFile(wb, \`Auditoria_Consolidada_Alunos_\${tagGerada}.xlsx\`);
    }

    function salvarNoGoogleDrive() {
      if (!currentDataset) return;
      if (typeof google === 'undefined' || !google.script || !google.script.run) {
        alert('Esta função é executada diretamente quando o Web App está rodando no Google Apps Script.');
        return;
      }

      const enadeRows = currentDataset.alunosEnade.map(a => [a.matricula, a.nome, a.anoEnade, a.condicaoEnade, a.situacaoEnade, a.motivoEnade]);
      const dra137Rows = currentDataset.alunos137.map(a => [a.matricula, 'DRA137', 'Finalizado', a.esclarecimento, a.parecer137, a.parecer137]);
      const dra100Rows = currentDataset.alunos100.map(a => [a.matricula, 'DRA100', 'Finalizado', a.esclarecimento, a.parecer100, a.parecer100]);
      const dra139Rows = currentDataset.alunos139.map(a => [a.matricula, 'DRA139', 'Aguardando Atendimento', a.esclarecimento, a.parecer139, a.parecer139]);

      const btn = event.target;
      const originalText = btn.innerText;
      btn.innerText = '⏳ Criando Planilha no Google Drive...';
      btn.disabled = true;

      google.script.run.withSuccessHandler(res => {
        btn.innerText = originalText;
        btn.disabled = false;
        if (res && res.success) {
          if (confirm(\`Planilha criada com sucesso no seu Google Drive!\\n\\n"\${res.spreadsheetName}"\\n\\nDeseja abrir a planilha agora?\`)) {
            window.open(res.spreadsheetUrl, '_blank');
          }
        } else {
          alert('Erro ao salvar no Google Drive: ' + (res ? res.error : 'Desconhecido'));
        }
      }).withFailureHandler(err => {
        btn.innerText = originalText;
        btn.disabled = false;
        alert('Falha na comunicação com o Google Drive: ' + err);
      }).exportarParaGoogleDrive(currentDataset.filename.replace(/\\.[^/.]+$/, ''), enadeRows, dra137Rows, dra100Rows, dra139Rows);
    }

    // Built-in TI Demo Generator (21 students)
    function carregarExemploTI() {
      const headers = new Array(40).fill('');
      headers[1] = 'Matrícula';
      headers[2] = 'CPF';
      headers[3] = 'Nome do Aluno';
      headers[8] = 'Período Letivo de Conclusão Provável';
      headers[16] = 'Data de Colação de Grau';
      headers[37] = 'Resultado';
      headers[38] = 'ENADE Concluinte';

      const demoStudents = [
        ['20211045', '123.456.789-01', 'Mariana Silva de Oliveira', '2026-1', '', 'Abrir DRA137 (Colação Especial), Abrir DRA100 (Emitir Doc. Finais), Abrir DRA139 (Cerimônia de Formatura)', 'Estudante habilitado, em situação regular no Enade (2025)'],
        ['20211089', '234.567.890-12', 'Lucas Gabriel Pereira Santos', '2026-1', '15/01/2026', 'Abrir DRA137 (Colação Especial), Abrir DRA100 (Emitir Doc. Finais), Abrir DRA139 (Cerimônia de Formatura)', 'Estudante não habilitado ao Enade, em razão do calendário do ciclo avaliativo'],
        ['20212014', '345.678.901-23', 'Beatriz Costa Alcantara', '2026-2', '', 'Abrir DRA100 (Emitir Doc. Finais), Cerimônia de Formatura Realizada, NÃO Abrir DRA139 (Cerimônia de Formatura)', 'Estudante habilitado, em situação regular no Enade (2025)'],
        ['20212055', '456.789.012-34', 'Rodrigo Mendonça Faria', '2026-1', '', 'Abrir DRA137 (Colação Especial), Abrir DRA100 (Emitir Doc. Finais)', 'Estudante habilitado, em situação regular no Enade (2025)'],
        ['20211090', '567.890.123-45', 'Camila Fernandes Rocha', '2026-2', '', 'Resolver Exigência do DRA045 (Análise Documental)', 'Estudante não habilitado ao Enade, em razão do calendário do ciclo avaliativo'],
        ['20212078', '678.901.234-56', 'Thiago Nogueira Lima', '2026-1', '', 'Pendência de Carga Horária / Créditos', 'Estudante habilitado, em situação irregular no Enade (2025)'],
        ['20202011', '789.012.345-67', 'Juliana Barbosa Martins', '2025-2', '', 'Abrir DRA137 (Colação Especial), Abrir DRA100 (Emitir Doc. Finais), Abrir DRA139 (Cerimônia de Formatura)', 'Estudante habilitado, em situação regular no Enade (2025)'],
        ['20211033', '890.123.456-78', 'Guilherme Souza Ramos', '2026-2', '', 'Abrir DRA139 (Cerimônia de Formatura)', 'Estudante não habilitado ao Enade, em razão do calendário do ciclo avaliativo'],
        ['20212099', '901.234.567-89', 'Fernanda Meireles Lima', '2026-1', '', 'Processo Concluído / Tudo OK', 'Estudante habilitado, em situação regular no Enade (2025)'],
        ['20211012', '012.345.678-90', 'Matheus Henrique Silveira', '2026-2', '', 'Abrir DRA137 (Colação Especial), Abrir DRA100 (Emitir Doc. Finais), Abrir DRA139 (Cerimônia de Formatura)', 'Estudante habilitado, em situação regular no Enade (2025)'],
        ['20211066', '123.098.456-21', 'Larissa Moura Dantas', '2026-1', '', 'Aguardar Finalização do DRA045 (Análise Documental)', 'Estudante não habilitado ao Enade, em razão do calendário do ciclo avaliativo'],
        ['20212080', '234.109.567-32', 'Eduardo Castro Pires', '2026-2', '10/02/2026', 'Abrir DRA100 (Emitir Doc. Finais), Abrir DRA139 (Cerimônia de Formatura)', 'Estudante habilitado, em situação regular no Enade (2025)'],
        ['20211054', '345.210.678-43', 'Aline Vasconcelos Ribeiro', '2026-1', '', 'Abrir DRA137 (Colação Especial), Abrir DRA100 (Emitir Doc. Finais)', 'Estudante não habilitado ao Enade, em razão do calendário do ciclo avaliativo'],
        ['20212041', '456.321.789-54', 'Gabriel Antunes Carvalho', '2026-2', '', 'Abrir DRA137 (Colação Especial), Abrir DRA139 (Cerimônia de Formatura)', 'Estudante habilitado, em situação regular no Enade (2025)'],
        ['20211077', '567.432.890-65', 'Patricia Gomes Ferreira', '2026-1', '', 'Sem Pendência de Carga Horária mas Falta DRA045', 'Estudante habilitado, em situação regular no Enade (2025)'],
        ['20212063', '678.543.901-76', 'Vinicius Lopes Miranda', '2026-2', '', 'Abrir DRA100 (Emitir Doc. Finais)', 'Estudante não habilitado ao Enade, em razão do calendário do ciclo avaliativo'],
        ['20211029', '789.654.012-87', 'Isabela Cristina Fonseca', '2026-1', '22/01/2026', 'Abrir DRA137 (Colação Especial), Abrir DRA100 (Emitir Doc. Finais)', 'Estudante habilitado, em situação regular no Enade (2025)'],
        ['20212092', '890.765.123-98', 'Felipe Augusto Barreto', '2026-2', '', 'Abrir DRA137 (Colação Especial), Abrir DRA100 (Emitir Doc. Finais), Abrir DRA139 (Cerimônia de Formatura)', 'Estudante habilitado, em situação regular no Enade (2025)'],
        ['20201088', '901.876.234-09', 'Leticia Maria Guimaraes', '2025-1', '', 'Abrir DRA137 (Colação Especial), Abrir DRA100 (Emitir Doc. Finais)', 'Estudante não habilitado ao Enade, em razão do calendário do ciclo avaliativo'],
        ['20211019', '012.987.345-10', 'Bruno Cesar Albuquerque', '2026-1', '', 'Abrir DRA100 (Emitir Doc. Finais), Abrir DRA139 (Cerimônia de Formatura)', 'Estudante habilitado, em situação regular no Enade (2025)'],
        ['20212035', '123.876.456-21', 'Carolina Dias Monteiro', '2026-2', '', 'Abrir DRA137 (Colação Especial)', 'Estudante habilitado, em situação regular no Enade (2025)']
      ];

      const rows = [headers];
      demoStudents.forEach(s => {
        const r = new Array(40).fill('');
        r[1] = s[0]; // Matrícula
        r[2] = s[1]; // CPF
        r[3] = s[2]; // Nome
        r[8] = s[3]; // Período
        r[16] = s[4]; // Colação
        r[37] = s[5]; // Resultado
        r[38] = s[6]; // ENADE
        rows.push(r);
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, 'Relatorio_Analitico_TI');

      rawWorkbook = wb;
      document.getElementById('file-name').innerText = 'Exemplo_Relatorio_TI_UNISUAM.xlsx';
      document.getElementById('file-info').classList.remove('hidden');
      executarAnalisePlanilha('Exemplo_Relatorio_TI_UNISUAM.xlsx');
    }
  </script>
</body>
</html>
`;
