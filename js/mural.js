// Mural de Recados - integração com Firebase Firestore
//
// COMO CONFIGURAR:
// 1. Crie um projeto gratuito em https://console.firebase.google.com/
// 2. No projeto, ative o "Firestore Database" (modo produção)
// 3. Em "Configurações do projeto" > "Seus apps", registre um app Web e copie o objeto de configuração
// 4. Substitua os valores de "firebaseConfig" abaixo pelos do seu projeto
// 5. Configure as regras de segurança do Firestore (veja o README para o texto sugerido)
//
// Enquanto os valores abaixo não forem substituídos, o mural mostra um aviso e fica desativado.

import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js';
import {
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyBdroefdAobwTpjxw1Qs8xSfik_HMSIzgQ",
    authDomain: "recados-site-casamento.firebaseapp.com",
    projectId: "recados-site-casamento",
    storageBucket: "recados-site-casamento.firebasestorage.app",
    messagingSenderId: "186289011688",
    appId: "1:186289011688:web:cd2f4bc7657a5e05bb825d",
    measurementId: "G-2EYVKT7R51"
};

const NOME_MIN = 2;
const NOME_MAX = 60;
const MENSAGEM_MIN = 3;
const MENSAGEM_MAX = 400;

const form = document.getElementById('muralForm');
const feedback = document.getElementById('muralFeedback');
const lista = document.getElementById('muralLista');
const submitBtn = document.getElementById('muralSubmitBtn');

const configuracaoPendente = Object.values(firebaseConfig)
    .some(valor => typeof valor === 'string' && (valor.startsWith('SUA_') || valor.startsWith('SEU_')));

if (configuracaoPendente) {
    if (lista) {
        lista.innerHTML = '';
        const aviso = document.createElement('p');
        aviso.className = 'mural-aviso';
        aviso.textContent = 'O mural ainda não foi configurado. Adicione as chaves do Firebase em js/mural.js para ativar os recados.';
        lista.appendChild(aviso);
    }
    if (submitBtn) {
        submitBtn.disabled = true;
    }
} else {
    iniciarMural();
}

function iniciarMural() {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const recadosRef = collection(db, 'recados');

    // Escuta em tempo real: qualquer recado novo aparece para todos os visitantes automaticamente
    const recadosQuery = query(recadosRef, orderBy('criadoEm', 'desc'), limit(50));
    onSnapshot(recadosQuery, (snapshot) => {
        const recados = snapshot.docs.map(doc => doc.data());
        renderizarRecados(recados);
    }, (error) => {
        console.error('Erro ao carregar recados:', error);
        mostrarAviso('Não foi possível carregar os recados agora.');
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Honeypot: campo invisível que só bots costumam preencher
        const honeypot = document.getElementById('muralHoneypot');
        if (honeypot && honeypot.value) {
            form.reset();
            return;
        }

        const nome = form.nome.value.trim();
        const mensagem = form.mensagem.value.trim();

        if (nome.length < NOME_MIN || nome.length > NOME_MAX) {
            mostrarFeedback(`Digite um nome válido (${NOME_MIN} a ${NOME_MAX} caracteres).`, true);
            return;
        }

        if (mensagem.length < MENSAGEM_MIN || mensagem.length > MENSAGEM_MAX) {
            mostrarFeedback(`Escreva uma mensagem entre ${MENSAGEM_MIN} e ${MENSAGEM_MAX} caracteres.`, true);
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';

        try {
            await addDoc(recadosRef, {
                nome,
                mensagem,
                criadoEm: serverTimestamp()
            });
            form.reset();
            mostrarFeedback('Recado enviado com sucesso! Obrigado :)', false);
        } catch (error) {
            console.error('Erro ao enviar recado:', error);
            mostrarFeedback('Não foi possível enviar seu recado. Tente novamente.', true);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar Recado';
        }
    });
}

function mostrarFeedback(mensagem, isErro) {
    if (!feedback) return;
    feedback.textContent = mensagem;
    feedback.classList.toggle('mural-feedback-erro', isErro);
    feedback.classList.toggle('mural-feedback-sucesso', !isErro);
}

function mostrarAviso(mensagem) {
    if (!lista) return;
    lista.innerHTML = '';
    const aviso = document.createElement('p');
    aviso.className = 'mural-aviso';
    aviso.textContent = mensagem;
    lista.appendChild(aviso);
}

function renderizarRecados(recados) {
    if (!lista) return;
    lista.innerHTML = '';

    if (recados.length === 0) {
        mostrarAviso('Seja o primeiro a deixar um recado para os noivos!');
        return;
    }

    recados.forEach(recado => {
        const card = document.createElement('div');
        card.className = 'recado-card';

        // Uso de textContent (nunca innerHTML) para o texto vindo dos convidados,
        // evitando qualquer risco de injeção de HTML/script (XSS).
        const mensagemEl = document.createElement('p');
        mensagemEl.className = 'recado-mensagem';
        mensagemEl.textContent = `"${recado.mensagem}"`;

        const nomeEl = document.createElement('p');
        nomeEl.className = 'recado-nome';
        nomeEl.textContent = `— ${recado.nome}`;

        card.appendChild(mensagemEl);
        card.appendChild(nomeEl);

        if (recado.criadoEm && typeof recado.criadoEm.toDate === 'function') {
            const dataEl = document.createElement('p');
            dataEl.className = 'recado-data';
            dataEl.textContent = recado.criadoEm.toDate().toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            card.appendChild(dataEl);
        }

        lista.appendChild(card);
    });
}
