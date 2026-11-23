// Confirmação de presença -> planilha (aba "CONFIRMAÇÕES")
//
// COMO USAR (resumo; passo a passo completo no README):
// 1. Abra a planilha > Extensões > Apps Script e cole este arquivo
// 2. Implantar > Nova implantação > App da Web
//    - Executar como: Eu
//    - Quem tem acesso: Qualquer pessoa
// 3. Copie a URL gerada e cole em ENDPOINT, no arquivo js/rsvp.js do site
//
// Este script só GRAVA. Ele nunca devolve a lista de confirmados, então os dados
// (telefone, e-mail) não ficam acessíveis pelo site.

const NOME_ABA = 'CONFIRMAÇÕES';
const FUSO = 'America/Sao_Paulo';

const MAX_POR_FAIXA = 8;
const TEMPO_MINIMO_MS = 1500;
const LIMITE_POR_MINUTO = 30;
const TAMANHO_MAXIMO_BYTES = 10000;

const GRUPOS = {
  'adulto': 'Adultos (acima de 11 anos)',
  'crianca-6-10': 'Crianças (6 a 10 anos)',
  'crianca-ate-5': 'Crianças (até 5 anos)'
};

const CABECALHO = [
  'Primeira resposta',
  'Última atualização',
  'Nome',
  'Grupo',
  'Vai ao evento?',
  'Telefone',
  'E-mail',
  'Adultos (acima de 11 anos)',
  'Crianças (6 a 10 anos)',
  'Crianças (até 5 anos)',
  'Nomes dos acompanhantes',
  'Total de pessoas'
];

// Posição (1 = coluna A) da coluna do telefone, usada para achar respostas repetidas
const COLUNA_TELEFONE = 6;
// Colunas numéricas (contagens e total); as demais são gravadas como texto
const COLUNAS_NUMERICAS = [8, 9, 10, 12];

function doGet() {
  return resposta_({ ok: true, servico: 'confirmacoes-casamento' });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return resposta_({ ok: false, erro: 'Requisição vazia.' });
    if (e.postData.contents.length > TAMANHO_MAXIMO_BYTES) return resposta_({ ok: false, erro: 'Requisição grande demais.' });

    let dados;
    try {
      dados = JSON.parse(e.postData.contents);
    } catch (erro) {
      return resposta_({ ok: false, erro: 'Dados inválidos.' });
    }

    // Campo-isca: só robôs preenchem. Finge sucesso e não grava.
    if (dados && dados.site) return resposta_({ ok: true });

    const validacao = validarConfirmacao_(dados);
    if (!validacao.ok) return resposta_({ ok: false, erro: validacao.erro });

    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      if (excedeuLimite_()) return resposta_({ ok: false, erro: 'Muitas respostas em sequência. Tente novamente em instantes.' });
      return resposta_(gravar_(validacao.dados));
    } finally {
      lock.releaseLock();
    }
  } catch (erro) {
    console.error(erro);
    return resposta_({ ok: false, erro: 'Erro interno ao registrar a resposta.' });
  }
}

function resposta_(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto)).setMimeType(ContentService.MimeType.JSON);
}


// ---------- Validação (funções puras, testáveis fora do Google) ----------

function limparTexto_(valor, maximo) {
  if (typeof valor !== 'string') return '';
  return valor.replace(/\s+/g, ' ').trim().slice(0, maximo);
}

function normalizarTelefone_(valor) {
  let digitos = String(valor || '').replace(/\D/g, '');
  if (digitos.length > 11 && digitos.indexOf('55') === 0) digitos = digitos.slice(2);
  if (!/^[1-9][1-9](9\d{8}|\d{8})$/.test(digitos)) return null;

  return digitos.length === 11
    ? '(' + digitos.slice(0, 2) + ') ' + digitos.slice(2, 7) + '-' + digitos.slice(7)
    : '(' + digitos.slice(0, 2) + ') ' + digitos.slice(2, 6) + '-' + digitos.slice(6);
}

function validarConfirmacao_(bruto) {
  if (!bruto || typeof bruto !== 'object') return { ok: false, erro: 'Dados inválidos.' };

  if (typeof bruto.tempoMs !== 'number' || bruto.tempoMs < TEMPO_MINIMO_MS) {
    return { ok: false, erro: 'Não foi possível validar o envio. Tente novamente.' };
  }

  const nome = limparTexto_(bruto.nome, 80);
  if (nome.length < 2) return { ok: false, erro: 'Informe o nome completo.' };

  if (!Object.prototype.hasOwnProperty.call(GRUPOS, bruto.grupo)) return { ok: false, erro: 'Selecione o grupo.' };

  if (bruto.vai !== 'sim' && bruto.vai !== 'nao') return { ok: false, erro: 'Informe se irá ao evento.' };

  const telefone = normalizarTelefone_(bruto.telefone);
  if (!telefone) return { ok: false, erro: 'Informe um telefone válido com DDD.' };

  const email = limparTexto_(bruto.email, 120);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, erro: 'Informe um e-mail válido.' };

  const acompanhantes = { adultos: [], criancas6a10: [], criancasAte5: [] };
  if (bruto.vai === 'sim') {
    const informados = bruto.acompanhantes || {};
    for (const chave in acompanhantes) {
      const lista = informados[chave];
      if (lista === undefined) continue;
      if (!Array.isArray(lista) || lista.length > MAX_POR_FAIXA) return { ok: false, erro: 'Quantidade de acompanhantes inválida.' };

      for (let i = 0; i < lista.length; i++) {
        const nomeAcompanhante = limparTexto_(lista[i], 80);
        if (nomeAcompanhante.length < 2) return { ok: false, erro: 'Informe o nome de cada acompanhante.' };
        acompanhantes[chave].push(nomeAcompanhante);
      }
    }
  }

  return {
    ok: true,
    dados: { nome: nome, grupo: bruto.grupo, vai: bruto.vai, telefone: telefone, email: email, acompanhantes: acompanhantes }
  };
}

function montarLinha_(dados, primeiraResposta, ultimaAtualizacao) {
  const a = dados.acompanhantes.adultos;
  const c1 = dados.acompanhantes.criancas6a10;
  const c2 = dados.acompanhantes.criancasAte5;
  const vai = dados.vai === 'sim';

  const partes = [];
  if (a.length) partes.push('Adultos: ' + a.join(', '));
  if (c1.length) partes.push('Crianças 6-10: ' + c1.join(', '));
  if (c2.length) partes.push('Crianças até 5: ' + c2.join(', '));

  return [
    primeiraResposta,
    ultimaAtualizacao,
    dados.nome,
    GRUPOS[dados.grupo],
    vai ? 'Sim' : 'Não',
    dados.telefone,
    dados.email,
    a.length,
    c1.length,
    c2.length,
    partes.join(' | '),
    vai ? 1 + a.length + c1.length + c2.length : 0
  ];
}

// ---------- Planilha ----------

// Limite simples de respostas por minuto, para frear envios em massa
function excedeuLimite_() {
  const cache = CacheService.getScriptCache();
  const total = Number(cache.get('rsvp_por_minuto') || 0);
  if (total >= LIMITE_POR_MINUTO) return true;
  cache.put('rsvp_por_minuto', String(total + 1), 60);
  return false;
}

function prepararAba_() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  let aba = planilha.getSheetByName(NOME_ABA);
  if (!aba) aba = planilha.insertSheet(NOME_ABA);

  const primeiraLinha = aba.getRange(1, 1, 1, CABECALHO.length).getValues()[0];
  const vazia = primeiraLinha.every(function (celula) { return celula === ''; });

  if (vazia) {
    aba.getRange(1, 1, 1, CABECALHO.length).setValues([CABECALHO]).setFontWeight('bold');
    aba.setFrozenRows(1);
    return aba;
  }

  // Evita bagunçar uma aba que já tem outra estrutura
  const igual = CABECALHO.every(function (titulo, i) { return primeiraLinha[i] === titulo; });
  if (!igual) throw new Error('A aba ' + NOME_ABA + ' já tem outro cabeçalho. Ajuste a linha 1 conforme o README.');

  return aba;
}

function gravar_(dados) {
  const aba = prepararAba_();
  const agora = Utilities.formatDate(new Date(), FUSO, 'dd/MM/yyyy HH:mm:ss');

  // Procura uma resposta anterior com o mesmo telefone para atualizar em vez de duplicar
  let linhaExistente = 0;
  const ultima = aba.getLastRow();
  if (ultima > 1) {
    const telefones = aba.getRange(2, COLUNA_TELEFONE, ultima - 1, 1).getValues();
    for (let i = 0; i < telefones.length; i++) {
      if (String(telefones[i][0]).replace(/\D/g, '') === dados.telefone.replace(/\D/g, '')) {
        linhaExistente = i + 2;
        break;
      }
    }
  }

  const primeiraResposta = linhaExistente ? String(aba.getRange(linhaExistente, 1).getValue()) : agora;
  const linha = montarLinha_(dados, primeiraResposta, agora);
  const destino = linhaExistente || ultima + 1;
  const faixa = aba.getRange(destino, 1, 1, CABECALHO.length);

  // Texto puro: impede que algo digitado começando com "=" seja tratado como fórmula
  faixa.setNumberFormat('@');
  COLUNAS_NUMERICAS.forEach(function (coluna) { aba.getRange(destino, coluna).setNumberFormat('0'); });
  faixa.setValues([linha]);

  return { ok: true, atualizado: Boolean(linhaExistente) };
}

// Permite testar a lógica pura fora do Google (Node). No Apps Script esta linha é ignorada.
if (typeof module !== 'undefined') {
  module.exports = { validarConfirmacao_, montarLinha_, normalizarTelefone_, CABECALHO, GRUPOS };
}
