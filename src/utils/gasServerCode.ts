// Google Apps Script Server Files (Code.gs e MenuPlanilha.gs)

export const GAS_SERVER_CODE = `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT: BACKEND DO WEB APP (Code.gs)
 * =========================================================================
 * 1. Cole este código no arquivo "Code.gs".
 * 2. Crie um arquivo HTML chamado "Index" e cole o código do Index.html.
 * 3. Clique em "Implantar" > "Nova Implantação" > Tipo: "App da Web".
 * 4. Executar como: "Usuário que está acessando o app da web".
 * 5. Quem tem acesso: "Qualquer pessoa dentro de UNISUAM" (ou apenas você).
 */

function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Processamento DRA & ENADE • UNISUAM')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Retorna os dados do usuário autenticado no Google Workspace
 */
function getCurrentUser() {
  try {
    var email = Session.getActiveUser().getEmail();
    return {
      email: email || '',
      isUnisuam: email.toLowerCase().indexOf('@unisuam.edu.br') !== -1 || email.toLowerCase().indexOf('unisuam.edu.br') !== -1,
      authenticated: !!email
    };
  } catch (err) {
    return { email: '', isUnisuam: false, error: err.toString() };
  }
}

/**
 * Salva os 4 relatórios diretamente em uma nova Planilha do Google Drive
 */
function exportarParaGoogleDrive(nomeBase, enadeRows, dra137Rows, dra100Rows, dra139Rows) {
  try {
    var dataFormatada = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
    var titulo = 'Relatórios Processados DRA (' + (nomeBase || 'Planilha') + ') - ' + dataFormatada;
    
    var ss = SpreadsheetApp.create(titulo);
    
    // 1. ENADE
    gravarAba(ss, 'Participações ENADE', ['matricula', 'nome', 'anoenade_concluinte', 'condicaoenade_concluinte', 'situacaoenade_concluinte', 'motivoenade_concluinte'], enadeRows);
    
    // 2. DRA137
    gravarAba(ss, 'Processos em Massa DRA137', ['Matrícula', 'Solicitação', 'Status', 'Esclarecimento', 'Parecer Interno', 'Parecer Externo'], dra137Rows);
    
    // 3. DRA100
    gravarAba(ss, 'Processos em Massa DRA100', ['Matrícula', 'Solicitação', 'Status', 'Esclarecimento', 'Parecer Interno', 'Parecer Externo'], dra100Rows);
    
    // 4. DRA139
    gravarAba(ss, 'Processos em Massa DRA139', ['Matrícula', 'Solicitação', 'Status', 'Esclarecimento', 'Parecer Interno', 'Parecer Externo'], dra139Rows);
    
    // Remove a aba padrão 'Página1' / 'Sheet1'
    var sheets = ss.getSheets();
    if (sheets.length > 4) {
      for (var s = 0; s < sheets.length; s++) {
        var n = sheets[s].getName();
        if (n === 'Página1' || n === 'Sheet1') {
          ss.deleteSheet(sheets[s]);
          break;
        }
      }
    }
    
    return {
      success: true,
      spreadsheetUrl: ss.getUrl(),
      spreadsheetName: titulo
    };
  } catch (err) {
    return {
      success: false,
      error: err.toString()
    };
  }
}

function gravarAba(ss, nomeAba, header, linhas) {
  var sheet = ss.getSheetByName(nomeAba);
  if (!sheet) {
    sheet = ss.insertSheet(nomeAba);
  } else {
    sheet.clear();
  }

  var allData = [header].concat(linhas || []);
  if (allData.length > 0 && allData[0].length > 0) {
    var range = sheet.getRange(1, 1, allData.length, allData[0].length);
    range.setValues(allData);
    sheet.getRange(1, 1, 1, allData[0].length).setFontWeight('bold').setBackground('#E2E8F0');
    sheet.autoResizeColumns(1, allData[0].length);
  }
}
`;

export const GAS_DIRECT_SCRIPT = `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT: MACRO DIRETA NA PLANILHA (Extensões > Apps Script)
 * =========================================================================
 * Cole este código em: Extensões > Apps Script na sua planilha do Google.
 * Ele adicionará um menu personalizado "🎓 Processamento DRA" no topo da planilha.
 */

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🎓 Processamento DRA')
    .addItem('🚀 Processar e Gerar as 4 Abas (2026-1 e 2026-2)', 'processarRelatorioDRA')
    .addItem('⚙️ Filtrar por Outro Período...', 'processarComFiltroPeriodo')
    .addToUi();
}

var PERIODOS_PADRAO = ['2026-1', '2026-2'];

var DENY_PHRASES = [
  'resolver exigencia',
  'aguardar finalizacao',
  'processo concluido',
  'pendencia de carga horaria',
  'abrir dra045',
  'sem pendencia de carga horaria'
];

var CERIMONIA_PARECER = 
  "Coruja, a Cerimônia de Formatura é um momento especial e insubstituível, " +
  "dedicado exclusivamente à celebração desta grande conquista acadêmica. " +
  "Trata-se de uma solenidade simbólica e social, na qual você compartilhará a vitória " +
  "com familiares, amigos e colegas que estiveram presentes em sua jornada. " +
  "Para conferir todos os detalhes logísticos, prazos e normas do evento, é indispensável " +
  "a leitura completa do documento 'Regras e Orientações Gerais da Cerimônia de Formatura', " +
  "publicado e disponível para consulta no seu Ambiente do Aluno.";

var ESCLARECIMENTO = "Protocolo aberto automaticamente";

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
  var s = val.toString().trim();
  if (s.indexOf('.0') === s.length - 2) s = s.substring(0, s.length - 2);
  var digits = s.replace(/\\D/g, '');
  if (!digits) return s;
  while (digits.length < 8) digits = '0' + digits;
  return digits.length > 8 ? digits.substring(digits.length - 8) : digits;
}

function extrairPeriodoNormalizado(val) {
  if (!val) return '';
  var s = val.toString().trim();
  var m = s.match(/(20\\d{2})[-/._\\s]?([12])/);
  if (m) return m[1] + '-' + m[2];
  return s;
}

function mapEnade(enadeText) {
  var txt = normText(enadeText);
  var anoMatch = (enadeText || '').toString().match(/(20\\d{2})/g);
  var ano = anoMatch ? anoMatch[anoMatch.length - 1] : '2026';
  var condicao = 'Concluinte';

  if (txt.indexOf('nao habilitado') !== -1) {
    return [ano, condicao, 'Não Habilitado', 'Estudante não habilitado ao Enade, em razão do calendário do ciclo avaliativo'];
  }
  if (txt.indexOf('habilitado') !== -1 && txt.indexOf('regular') !== -1) {
    return [ano, condicao, 'Habilitado', 'Não Possui'];
  }
  return [ano, condicao, txt.indexOf('irregular') !== -1 ? 'Irregular' : '', ''];
}

function processarRelatorioDRA(periodosFiltro) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  var sheet = ss.getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  var hasMatricula = false;
  for (var r = 0; r < Math.min(data.length, 25); r++) {
    for (var c = 0; c < data[r].length; c++) {
      if (normText(data[r][c]).indexOf('matricula') !== -1) {
        hasMatricula = true;
        break;
      }
    }
    if (hasMatricula) break;
  }

  if (!hasMatricula) {
    for (var s = 0; s < sheets.length; s++) {
      var sName = normText(sheets[s].getName());
      if (sName.indexOf('participac') !== -1 || sName.indexOf('processo') !== -1) continue;
      var testData = sheets[s].getDataRange().getValues();
      for (var tr = 0; tr < Math.min(testData.length, 25); tr++) {
        for (var tc = 0; tc < testData[tr].length; tc++) {
          if (normText(testData[tr][tc]).indexOf('matricula') !== -1) {
            sheet = sheets[s];
            data = testData;
            hasMatricula = true;
            break;
          }
        }
        if (hasMatricula) break;
      }
      if (hasMatricula) break;
    }
  }

  if (data.length < 2) {
    SpreadsheetApp.getUi().alert('Aviso: Nenhuma aba com dados de alunos/matrícula foi localizada.');
    return;
  }

  var targetPeriods = (periodosFiltro || PERIODOS_PADRAO).map(extrairPeriodoNormalizado);
  var headerRow = 0;
  var rowStr = [];

  for (var r = 0; r < Math.min(data.length, 25); r++) {
    var rNormalized = data[r].map(normText);
    var foundMat = rNormalized.findIndex(function(c) { return c.indexOf('matricula') !== -1; });
    if (foundMat !== -1) {
      headerRow = r;
      rowStr = rNormalized;
      break;
    }
  }

  var isNewLayout = rowStr.some(function(c) { return c.indexOf('cargahoraria_acursar') !== -1 || c.indexOf('ultimo_status_documentosfinais') !== -1; }) || rowStr.length >= 33;

  function findCol(matchers) {
    for (var m = 0; m < matchers.length; m++) {
      var idx = rowStr.findIndex(matchers[m]);
      if (idx !== -1) return idx;
    }
    return null;
  }

  var colMat = findCol([function(s) { return s === 'matricula'; }, function(s) { return s.indexOf('matricula') !== -1; }]) || 0;
  var colNome = findCol([function(s) { return s === 'nome'; }, function(s) { return s.indexOf('nome') !== -1 && s.indexOf('mae') === -1; }]) || 1;
  var colCurso = findCol([function(s) { return s === 'curso'; }, function(s) { return s.indexOf('curso') !== -1 && s.indexOf('modalidade') === -1; }]) || 4;
  var colStatus = findCol([function(s) { return s === 'status_historico'; }, function(s) { return s.indexOf('status_historico') !== -1; }, function(s) { return s.indexOf('status') !== -1; }]) || 7;
  var colPeriodo = findCol([function(s) { return s === 'periodoletivo_conclusao'; }, function(s) { return s.indexOf('periodo') !== -1; }]) || 8;

  var colChExtensao = findCol([function(s) { return s === 'ch_extensao_a_cursar'; }, function(s) { return s.indexOf('ch_extensao') !== -1; }]) || 9;
  var colChAtividade = findCol([function(s) { return s === 'ch_atividadecomplementar_a_cursar'; }, function(s) { return s.indexOf('atividadecomplementar') !== -1; }]) || 10;
  var colCreditos = findCol([function(s) { return s === 'creditos_acursar'; }, function(s) { return s.indexOf('creditos') !== -1; }]) || 11;
  var colChCargaHoraria = findCol([function(s) { return s === 'cargahoraria_acursar'; }, function(s) { return s.indexOf('cargahoraria') !== -1; }]) || (isNewLayout ? 12 : null);

  var colColacao = findCol([function(s) { return s === 'data_colacaograu'; }, function(s) { return s.indexOf('data') !== -1 && s.indexOf('colacao') !== -1; }]) || (isNewLayout ? 13 : 12);

  var colDra045Possui = findCol([function(s) { return s.indexOf('045') !== -1 && s.indexOf('possui') !== -1; }]) || (isNewLayout ? 14 : 13);
  var colDra045Status = findCol([function(s) { return s.indexOf('045') !== -1 && s.indexOf('status') !== -1; }]) || (isNewLayout ? 15 : 14);
  var colDra045Parecer = findCol([function(s) { return s.indexOf('045') !== -1 && s.indexOf('parecer') !== -1; }]) || (isNewLayout ? 16 : 15);

  var colDra138Possui = findCol([function(s) { return s.indexOf('138') !== -1 && s.indexOf('possui') !== -1; }]) || (isNewLayout ? 17 : 16);
  var colDra138Status = findCol([function(s) { return s.indexOf('138') !== -1 && s.indexOf('status') !== -1; }]) || (isNewLayout ? 18 : 17);

  var colDra137Possui = findCol([function(s) { return s.indexOf('137') !== -1 && s.indexOf('possui') !== -1; }]) || (isNewLayout ? 20 : 19);
  var colDra137Status = findCol([function(s) { return s.indexOf('137') !== -1 && s.indexOf('status') !== -1; }]) || (isNewLayout ? 21 : 20);

  var colDra100Possui = findCol([function(s) { return s.indexOf('100') !== -1 && s.indexOf('possui') !== -1; }]) || (isNewLayout ? 23 : 22);
  var colDra100Status = findCol([function(s) { return s.indexOf('100') !== -1 && s.indexOf('status') !== -1; }]) || (isNewLayout ? 24 : 23);

  var colDra139Possui = findCol([function(s) { return s.indexOf('139') !== -1 && s.indexOf('possui') !== -1; }]) || (isNewLayout ? 26 : 25);
  var colDra139Status = findCol([function(s) { return s.indexOf('139') !== -1 && s.indexOf('status') !== -1; }]) || (isNewLayout ? 27 : 26);

  var colEnade = findCol([function(s) { return s.indexOf('enade_concluinte') !== -1; }, function(s) { return s.indexOf('enade') !== -1 && s.indexOf('ingressante') === -1; }]) || (isNewLayout ? 32 : 30);
  var colResFound = findCol([function(s) { return s === 'resultado' || s.indexOf('resultado') !== -1; }]);
  var colRes = colResFound !== null ? colResFound : (isNewLayout ? 33 : 31);

  // Check for Colação Realizada auxiliary sheet
  var colacaoSheet = ss.getSheetByName('Colação Realizada') || ss.getSheetByName('Colacao Realizada');
  var colacaoMap = {};
  if (colacaoSheet) {
    var cData = colacaoSheet.getDataRange().getValues();
    for (var cr = 0; cr < cData.length; cr++) {
      if (cData[cr] && cData[cr][0]) {
        var cMat = normalizeMatricula(cData[cr][0]);
        if (cMat) colacaoMap[cMat] = true;
      }
    }
  }

  var alunosEnade = [], alunos137 = [], alunos100 = [], alunos139 = [];
  var vistosEnade = {}, vistos137 = {}, vistos100 = {}, vistos139 = {};
  var ignoradosColacao137 = 0;
  var hoje = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy');

  function isNaoVal(v) {
    var nv = normText(v);
    return nv === 'nao' || nv === 'n' || nv === 'false';
  }

  for (var i = headerRow + 1; i < data.length; i++) {
    var row = data[i];
    var mat = normalizeMatricula(row[colMat]);
    if (!mat) continue;

    var perRaw = (row[colPeriodo] || '').toString().trim();
    var perNorm = extrairPeriodoNormalizado(perRaw);
    if (targetPeriods.length > 0 && targetPeriods.indexOf(perNorm) === -1 && targetPeriods.indexOf(normText(perRaw)) === -1) {
      continue;
    }

    var nome = row[colNome] || '';
    var curso = (row[colCurso] || '').toString().trim();
    var valColacao = (row[colColacao] || '').toString().trim();
    var jaColouGrau = (valColacao !== '' && valColacao !== '-' && valColacao !== 'null' && valColacao !== '0');
    var txtEnade = (row[colEnade] || '').toString();

    var rawRes = (colRes < row.length && row[colRes] !== undefined ? (row[colRes] || '').toString().trim() : '');
    if (!rawRes) {
      var u137 = (row[colDra137Status] || '').toString().trim();
      var t137 = (row[colDra137Possui] || '').toString().trim();
      var x100 = (row[colDra100Status] || '').toString().trim();
      var w100 = (row[colDra100Possui] || '').toString().trim();
      var aa139 = (row[colDra139Status] || '').toString().trim();
      var z139 = (row[colDra139Possui] || '').toString().trim();

      var pParts = [];
      if (normText(u137) === 'em exigencia') pParts.push('Resolver Exigência do DRA137 (Colação Especial)');
      else if (isNaoVal(t137)) pParts.push('Abrir DRA137 (Colação Especial)');

      if (normText(x100) === 'em exigencia') pParts.push('Resolver Exigência do DRA100 (Emitir Doc. Finais)');
      else if (isNaoVal(w100)) pParts.push('Abrir DRA100 (Emitir Doc. Finais)');

      if (normText(aa139) === 'em exigencia') pParts.push('Resolver Exigência do DRA139 (Cerimônia de Formatura)');
      else if (isNaoVal(z139)) {
        if (colacaoMap[mat] || (curso && colacaoMap[curso])) pParts.push('Cerimônia de Formatura Realizada, NÃO Abrir DRA139');
        else pParts.push('Abrir DRA139 (Cerimônia de Formatura)');
      }

      var pJoined = pParts.join(', ');
      var nVal = (row[colDra045Possui] || '').toString().trim();
      var oVal = (row[colDra045Status] || '').toString().trim();
      var hVal = (row[colStatus] || '').toString().trim();

      if (!nVal && !oVal && !hVal) {
        rawRes = '';
      } else if (jaColouGrau) {
        rawRes = pJoined === '' ? 'Processo Concluído / Tudo OK' : pJoined;
      } else {
        var jNum = Number(row[colChExtensao]) || 0;
        var kNum = Number(row[colChAtividade]) || 0;
        var lNum = Number(row[colCreditos]) || 0;
        var mChNum = (colChCargaHoraria !== null ? Number(row[colChCargaHoraria]) : 0) || 0;

        if (jNum + kNum + lNum + mChNum > 0) {
          rawRes = 'Pendência de Carga Horária / Créditos';
        } else if (isNaoVal(nVal)) {
          rawRes = 'Abrir DRA045 (Análise Documental) e DRA138 (Validação de Dados Pessoais)';
        } else if (normText(oVal) === 'em exigencia') {
          rawRes = 'Resolver Exigência do DRA045 (Análise Documental)';
        } else if (normText(oVal) !== 'finalizado' && normText(oVal) !== 'pronto') {
          rawRes = 'Aguardar Finalização do DRA045 (Análise Documental)';
        } else if (normText(hVal) !== 'formado') {
          rawRes = 'Sem pendência de carga horária e créditos, mas não está com o status de formado';
        } else {
          var pText = (row[colDra045Parecer] || '').toString().trim();
          var qVal = (row[colDra138Possui] || '').toString().trim();
          var rVal = (row[colDra138Status] || '').toString().trim();

          var normP = normText(pText);
          var isNaoNecessidade = normP.indexOf('nao havera necessidade') !== -1 || normP.indexOf('nao necessita') !== -1;
          var hasConfirmeCorrija = normP.indexOf('confirme') !== -1 || normP.indexOf('corrija') !== -1;
          var qIsFilledAndNotNao = !isNaoVal(qVal) && qVal !== '';

          if (!isNaoNecessidade && (qIsFilledAndNotNao || hasConfirmeCorrija)) {
            if (isNaoVal(qVal)) rawRes = 'Abrir DRA138 (Validação de Dados Pessoais)';
            else if (normText(rVal) === 'em exigencia') rawRes = 'Resolver Exigência do DRA138 (Validação de Dados Pessoais)';
            else if (normText(rVal) !== 'finalizado') rawRes = 'Aguardar Finalização do DRA138 (Validação de Dados Pessoais)';
            else rawRes = pJoined === '' ? 'Processo Concluído / Tudo OK' : pJoined;
          } else {
            rawRes = pJoined === '' ? 'Processo Concluído / Tudo OK' : pJoined;
          }
        }
      }
    }

    var txtRes = normText(rawRes);
    var valColacao = (row[colColacao] || '').toString().trim();
    var jaColouGrau = (valColacao !== '' && valColacao !== '-' && valColacao !== 'null');
    var txtEnade = (row[colEnade] || '').toString();

    var bloqueado = false;
    for (var d = 0; d < DENY_PHRASES.length; d++) {
      if (txtRes.indexOf(DENY_PHRASES[d]) !== -1) {
        bloqueado = true;
        break;
      }
    }
    if (bloqueado) continue;

    var tem137 = txtRes.indexOf('dra137') !== -1 || txtRes.indexOf('137') !== -1;
    var tem100 = txtRes.indexOf('dra100') !== -1 || txtRes.indexOf('100') !== -1;
    var tem139 = txtRes.indexOf('dra139') !== -1 || txtRes.indexOf('139') !== -1;
    var bloqueio139 = (txtRes.indexOf('nao abrir') !== -1 && txtRes.indexOf('139') !== -1) ||
                      (txtRes.indexOf('cerimonia de formatura realizada') !== -1);

    if ((tem137 || tem100) && !vistosEnade[mat]) {
      vistosEnade[mat] = true;
      var enadeMapped = mapEnade(txtEnade);
      alunosEnade.push([mat, nome, enadeMapped[0], enadeMapped[1], enadeMapped[2], enadeMapped[3]]);
    }

    if (tem137) {
      if (jaColouGrau) {
        ignoradosColacao137++;
      } else if (!vistos137[mat]) {
        vistos137[mat] = true;
        var p137 = 'Colação de Grau Especial (De Ofício) realizada em ' + hoje + '.';
        alunos137.push([mat, 'DRA137', 'Finalizado', ESCLARECIMENTO, p137, p137]);
      }
    }

    if (tem100 && !vistos100[mat]) {
      vistos100[mat] = true;
      var p100 = 'Emissão de Documentos Finais realizada em ' + hoje + '.';
      alunos100.push([mat, 'DRA100', 'Finalizado', ESCLARECIMENTO, p100, p100]);
    }

    if (tem139 && !bloqueio139 && !vistos139[mat]) {
      vistos139[mat] = true;
      alunos139.push([mat, 'DRA139', 'Aguardando Atendimento', ESCLARECIMENTO, CERIMONIA_PARECER, CERIMONIA_PARECER]);
    }
  }

  gravarAba(ss, 'Participações ENADE', ['matricula', 'nome', 'anoenade_concluinte', 'condicaoenade_concluinte', 'situacaoenade_concluinte', 'motivoenade_concluinte'], alunosEnade);
  gravarAba(ss, 'Processos em Massa DRA137', ['Matrícula', 'Solicitação', 'Status', 'Esclarecimento', 'Parecer Interno', 'Parecer Externo'], alunos137);
  gravarAba(ss, 'Processos em Massa DRA100', ['Matrícula', 'Solicitação', 'Status', 'Esclarecimento', 'Parecer Interno', 'Parecer Externo'], alunos100);
  gravarAba(ss, 'Processos em Massa DRA139', ['Matrícula', 'Solicitação', 'Status', 'Esclarecimento', 'Parecer Interno', 'Parecer Externo'], alunos139);

  SpreadsheetApp.getUi().alert(
    '✅ Relatórios gerados com sucesso!\\n\\n' +
    '• Participações ENADE: ' + alunosEnade.length + ' alunos\\n' +
    '• Processos DRA137: ' + alunos137.length + ' alunos\\n' +
    '• Processos DRA100: ' + alunos100.length + ' alunos\\n' +
    '• Processos DRA139: ' + alunos139.length + ' alunos\\n' +
    '• Alunos ignorados no DRA137 (já colaram grau): ' + ignoradosColacao137
  );
}

function processarComFiltroPeriodo() {
  var ui = SpreadsheetApp.getUi();
  var resp = ui.prompt('Filtro de Período Letivo', 'Informe os períodos separados por vírgula (Ex: 2026-1, 2026-2):', ui.ButtonSet.OK_CANCEL);
  if (resp.getSelectedButton() == ui.Button.OK) {
    var val = resp.getResponseText();
    var list = val.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
    if (list.length > 0) processarRelatorioDRA(list);
  }
}
`;
