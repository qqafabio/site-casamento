// Confirmação de presença (RSVP) - modal + envio para a planilha via Google Apps Script
//
// COMO CONFIGURAR:
// 1. Publique o script de apps-script/confirmacoes.gs como "App da Web" (veja o README)
// 2. Cole a URL gerada em ENDPOINT abaixo
//
// Enquanto ENDPOINT não for substituído, o modal abre normalmente, mas o envio fica desativado.

(function () {
    'use strict';

    const ENDPOINT = 'https://script.google.com/macros/s/AKfycbxxINAGS8UEzW7o5xCylDWl7LBF1UeLC645A5pCK0yzK62FWyq3jwinLw428C7ztdnPoA/exec';

    const MAX_POR_FAIXA = 8;
    const ATRASO_ABERTURA_MS = 1800;
    const CHAVE_VISTO = 'rsvpVisto';
    const CHAVE_RESPONDIDO = 'rsvpRespondido';

    const FAIXAS = ['adultos', 'criancas6a10', 'criancasAte5'];

    const modal = document.getElementById('rsvpModal');
    const form = document.getElementById('rsvpForm');
    if (!modal || !form) return;

    const fab = document.getElementById('rsvpFab');
    const btnFechar = document.getElementById('rsvpFechar');
    const btnEnviar = document.getElementById('rsvpEnviar');
    const feedback = document.getElementById('rsvpFeedback');
    const blocoFormulario = document.getElementById('rsvpFormulario');
    const blocoSucesso = document.getElementById('rsvpSucesso');
    const blocoAcompanhantes = document.getElementById('rsvpAcompanhantes');
    const campoTelefone = document.getElementById('rsvpTelefone');

    const configuracaoPendente = ENDPOINT.startsWith('COLE_');

    // Nomes digitados em cada faixa, na ordem dos campos
    const nomes = { adultos: [], criancas6a10: [], criancasAte5: [] };

    let abertoEm = 0;
    let ultimoFoco = null;

    // ---------- Armazenamento (pode falhar em navegação privada) ----------

    function lerArmazenado(chave) {
        try {
            return window.localStorage.getItem(chave);
        } catch (erro) {
            return null;
        }
    }

    function gravarArmazenado(chave, valor) {
        try {
            window.localStorage.setItem(chave, valor);
        } catch (erro) {
            // sem armazenamento: o modal pode reabrir na próxima visita, sem prejuízo
        }
    }

    function marcarRespondido() {
        gravarArmazenado(CHAVE_RESPONDIDO, '1');
        if (fab) fab.lastElementChild.textContent = ' Alterar minha resposta';
    }

    // ---------- Abrir / fechar ----------

    function abrir() {
        if (modal.classList.contains('ativo')) return;

        ultimoFoco = document.activeElement;
        if (!abertoEm) abertoEm = Date.now();
        gravarArmazenado(CHAVE_VISTO, '1');

        modal.classList.add('ativo');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('rsvp-aberto');

        const primeiro = blocoSucesso.hidden
            ? document.getElementById('rsvpNome')
            : document.getElementById('rsvpSucessoFechar');
        window.setTimeout(() => primeiro && primeiro.focus(), 50);
    }

    function fechar() {
        modal.classList.remove('ativo');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('rsvp-aberto');
        if (ultimoFoco && typeof ultimoFoco.focus === 'function') ultimoFoco.focus();
    }

    document.querySelectorAll('[data-rsvp-abrir]').forEach(botao => {
        botao.addEventListener('click', (evento) => {
            evento.preventDefault();
            mostrarFormulario();
            abrir();
        });
    });

    btnFechar.addEventListener('click', fechar);
    document.getElementById('rsvpSucessoFechar').addEventListener('click', fechar);

    modal.addEventListener('click', (evento) => {
        if (evento.target === modal) fechar();
    });

    document.addEventListener('keydown', (evento) => {
        if (!modal.classList.contains('ativo')) return;

        if (evento.key === 'Escape') {
            fechar();
            return;
        }

        // Mantém o foco dentro do modal
        if (evento.key === 'Tab') {
            const focaveis = Array.from(modal.querySelectorAll('button, input, select, a[href]'))
                .filter(el => !el.disabled && el.offsetParent !== null && el.tabIndex !== -1);
            if (focaveis.length === 0) return;

            const primeiro = focaveis[0];
            const ultimo = focaveis[focaveis.length - 1];
            if (evento.shiftKey && document.activeElement === primeiro) {
                evento.preventDefault();
                ultimo.focus();
            } else if (!evento.shiftKey && document.activeElement === ultimo) {
                evento.preventDefault();
                primeiro.focus();
            }
        }
    });

    // Abre sozinho na primeira visita; depois só pelo botão
    window.setTimeout(() => {
        if (!lerArmazenado(CHAVE_VISTO) && !lerArmazenado(CHAVE_RESPONDIDO)) abrir();
    }, ATRASO_ABERTURA_MS);

    if (lerArmazenado(CHAVE_RESPONDIDO) && fab) {
        fab.lastElementChild.textContent = ' Alterar minha resposta';
    }

    // ---------- Telefone (máscara brasileira) ----------

    function apenasDigitos(texto) {
        return texto.replace(/\D/g, '');
    }

    function formatarTelefone(texto) {
        const d = apenasDigitos(texto).slice(0, 11);
        if (d.length === 0) return '';
        if (d.length <= 2) return `(${d}`;
        if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
        if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
        return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    }

    campoTelefone.addEventListener('input', () => {
        campoTelefone.value = formatarTelefone(campoTelefone.value);
    });

    // ---------- Vai ao evento? ----------

    function vaiAoEvento() {
        return form.elements.vai.value !== 'nao';
    }

    form.querySelectorAll('input[name="vai"]').forEach(radio => {
        radio.addEventListener('change', () => {
            blocoAcompanhantes.classList.toggle('rsvp-oculto', !vaiAoEvento());
        });
    });

    // ---------- Acompanhantes ----------

    function renderizarFaixa(chave) {
        const contador = form.querySelector(`[data-faixa="${chave}"]`);
        const lista = nomes[chave];

        contador.querySelector('.rsvp-quantidade').value = lista.length;
        contador.querySelector('[data-acao="menos"]').disabled = lista.length === 0;
        contador.querySelector('[data-acao="mais"]').disabled = lista.length >= MAX_POR_FAIXA;

        const container = contador.querySelector('.rsvp-nomes');
        container.innerHTML = '';
        lista.forEach((valor, indice) => {
            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 80;
            input.placeholder = 'Nome do acompanhante *';
            input.setAttribute('aria-label', `Nome do acompanhante ${indice + 1}`);
            input.value = valor;
            input.addEventListener('input', () => {
                nomes[chave][indice] = input.value;
            });
            container.appendChild(input);
        });
    }

    form.querySelectorAll('.rsvp-passo').forEach(botao => {
        botao.addEventListener('click', () => {
            const chave = botao.closest('[data-faixa]').dataset.faixa;
            const lista = nomes[chave];

            if (botao.dataset.acao === 'mais' && lista.length < MAX_POR_FAIXA) lista.push('');
            if (botao.dataset.acao === 'menos' && lista.length > 0) lista.pop();

            renderizarFaixa(chave);
        });
    });

    // ---------- Validação ----------

    function coletar() {
        const vai = vaiAoEvento();
        const dados = {
            nome: form.elements.nome.value.trim().replace(/\s+/g, ' '),
            grupo: form.elements.grupo.value,
            vai: vai ? 'sim' : 'nao',
            telefone: campoTelefone.value.trim(),
            email: form.elements.email.value.trim(),
            acompanhantes: {},
            site: form.elements.site.value,
            tempoMs: Date.now() - abertoEm
        };

        FAIXAS.forEach(chave => {
            dados.acompanhantes[chave] = vai ? nomes[chave].map(n => n.trim().replace(/\s+/g, ' ')) : [];
        });

        return dados;
    }

    function validar(dados) {
        const erros = {};
        const digitos = apenasDigitos(dados.telefone);

        if (dados.nome.length < 2) erros.nome = 'Informe seu nome completo.';
        if (!dados.grupo) erros.grupo = 'Selecione a que grupo você pertence.';
        if (!/^[1-9][1-9](9\d{8}|\d{8})$/.test(digitos)) erros.telefone = 'Informe um telefone válido com DDD.';
        if (dados.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
            erros.email = 'Informe um e-mail válido ou deixe em branco.';
        }

        FAIXAS.forEach(chave => {
            if (dados.acompanhantes[chave].some(nome => nome.length < 2)) {
                erros[chave] = 'Informe o nome de cada acompanhante.';
            }
        });

        return erros;
    }

    function mostrarErros(erros) {
        form.querySelectorAll('[data-erro]').forEach(el => {
            el.textContent = erros[el.dataset.erro] || '';
        });
        form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));

        const ordem = ['nome', 'grupo', 'telefone', 'email'];
        const primeiro = ordem.find(chave => erros[chave]);
        if (primeiro) {
            const campo = form.elements[primeiro];
            campo.setAttribute('aria-invalid', 'true');
            campo.focus();
            return;
        }

        const faixa = FAIXAS.find(chave => erros[chave]);
        if (faixa) {
            const vazio = Array.from(form.querySelectorAll(`[data-faixa="${faixa}"] .rsvp-nomes input`))
                .find(input => input.value.trim().length < 2);
            if (vazio) {
                vazio.setAttribute('aria-invalid', 'true');
                vazio.focus();
            }
        }
    }

    // Some com a mensagem de erro assim que a pessoa corrige o campo
    function limparErro(campo) {
        const faixa = campo.closest('[data-faixa]');
        const chave = faixa ? faixa.dataset.faixa : campo.name;
        const mensagem = form.querySelector(`[data-erro="${chave}"]`);
        if (mensagem) mensagem.textContent = '';
        campo.removeAttribute('aria-invalid');
    }

    form.addEventListener('input', (evento) => limparErro(evento.target));
    form.addEventListener('change', (evento) => limparErro(evento.target));

    function mostrarFeedback(texto, isErro) {
        feedback.textContent = texto;
        feedback.classList.toggle('rsvp-feedback-erro', Boolean(isErro));
    }

    // ---------- Envio ----------

    function mostrarFormulario() {
        blocoSucesso.hidden = true;
        blocoFormulario.hidden = false;
        mostrarFeedback('', false);
    }

    function mostrarSucesso(dados, atualizado) {
        const primeiroNome = dados.nome.split(' ')[0];
        const confirmou = dados.vai === 'sim';

        document.getElementById('rsvpSucessoKicker').textContent = confirmou ? 'Presença confirmada' : 'Resposta recebida';
        document.getElementById('rsvpSucessoTitulo').textContent = confirmou
            ? `Obrigado, ${primeiroNome}!`
            : `Sentiremos sua falta, ${primeiroNome}`;

        const texto = confirmou
            ? 'Esperamos você no dia 20/03/2027, às 15:30, no Santuário de Nossa Senhora do Sagrado Coração.'
            : 'Obrigado por nos avisar. Se mudar de ideia, é só responder novamente por aqui.';
        document.getElementById('rsvpSucessoTexto').textContent = atualizado
            ? `Atualizamos a sua resposta. ${texto}`
            : texto;

        blocoFormulario.hidden = true;
        blocoSucesso.hidden = false;
        modal.querySelector('.rsvp-dialog').scrollTop = 0;
        document.getElementById('rsvpSucessoFechar').focus();
    }

    form.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        if (configuracaoPendente) {
            mostrarFeedback('As confirmações ainda não foram configuradas. Tente novamente em breve.', true);
            return;
        }

        const dados = coletar();
        const erros = validar(dados);
        mostrarErros(erros);
        if (Object.keys(erros).length > 0) {
            mostrarFeedback('Confira os campos destacados.', true);
            return;
        }

        btnEnviar.disabled = true;
        btnEnviar.textContent = 'Enviando...';
        mostrarFeedback('', false);

        try {
            // "text/plain" evita o preflight de CORS, que o Apps Script não responde
            const resposta = await fetch(ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(dados)
            });
            const resultado = await resposta.json();

            if (!resultado.ok) throw new Error(resultado.erro || 'Falha ao registrar a resposta.');

            marcarRespondido();
            mostrarSucesso(dados, Boolean(resultado.atualizado));
        } catch (erro) {
            console.error('Erro ao enviar confirmação:', erro);
            mostrarFeedback('Não foi possível enviar sua resposta agora. Tente novamente em instantes.', true);
        } finally {
            btnEnviar.disabled = false;
            btnEnviar.textContent = 'Responder';
        }
    });

    FAIXAS.forEach(renderizarFaixa);
})();
