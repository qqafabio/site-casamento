// Mobile Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
const navbar = document.querySelector('.navbar');

menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Solidify navbar background once the user scrolls past the hero image
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// Close menu when a link is clicked
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// Load and render gifts
async function carregarPresentes() {
    try {
        const response = await fetch('data/presentes.json');
        const data = await response.json();
        renderizarPresentes(data.presentes);
    } catch (error) {
        console.error('Erro ao carregar presentes:', error);
        document.getElementById('presentesGrid').innerHTML =
            '<p style="grid-column: 1/-1; text-align: center;">Erro ao carregar presentes. Verifique o arquivo presentes.json</p>';
    }
}

function renderizarPresentes(presentes) {
    const grid = document.getElementById('presentesGrid');
    grid.innerHTML = '';

    presentes.forEach(presente => {
        const card = document.createElement('div');
        card.className = 'presente-card';
        card.innerHTML = `
            <img src="${presente.imagem}" alt="${presente.nome}" class="presente-image" onerror="this.src='https://via.placeholder.com/280x200?text=Imagem+Indispon%C3%ADvel'">
            <div class="presente-content">
                <h3 class="presente-nome">${presente.nome}</h3>
                <p class="presente-descricao">${presente.descricao}</p>
                <div class="presente-footer">
                    <span class="presente-valor">R$ ${presente.valor.toFixed(2).replace('.', ',')}</span>
                    <a href="${presente.link_mercado_livre}" target="_blank" class="btn-comprar">Comprar</a>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Gallery functionality
async function inicializarGaleria() {
    const galleryGrid = document.getElementById('galleryGrid');

    try {
        const response = await fetch('data/galeria.json');
        const data = await response.json();
        renderizarGaleria(data.fotos);
    } catch (error) {
        console.error('Erro ao carregar galeria:', error);
        galleryGrid.innerHTML =
            '<p class="gallery-placeholder">Erro ao carregar as fotos. Verifique o arquivo galeria.json</p>';
    }
}

function renderizarGaleria(fotos) {
    const galleryGrid = document.getElementById('galleryGrid');

    if (!fotos || fotos.length === 0) {
        return;
    }

    const imagens = fotos.map((foto, index) => ({
        src: `images/fotos/${encodeURIComponent(foto.arquivo)}`,
        alt: foto.descricao || `Foto ${index + 1} do casal`,
        descricao: foto.descricao || ''
    }));

    galleryGrid.innerHTML = '';
    imagens.forEach((img, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.style.animationDelay = `${index * 70}ms`;
        item.innerHTML = `
            <span class="photo-frame">
                <img src="${img.src}" alt="${img.alt}" loading="lazy">
            </span>
            <p class="gallery-caption">${img.descricao}</p>
        `;
        item.addEventListener('click', () => abrirModal(img.src, img.alt, img.descricao));
        galleryGrid.appendChild(item);
    });
}

// Modal functions
const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalCaption = document.getElementById('modalCaption');
const modalClose = document.getElementById('modalClose');

function abrirModal(src, alt, descricao = '') {
    modalImage.src = src;
    modalImage.alt = alt;
    modalCaption.textContent = descricao;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function fecharModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

modalClose.addEventListener('click', fecharModal);
modal.addEventListener('click', (event) => {
    if (event.target === modal) {
        fecharModal();
    }
});

// Keyboard navigation for modal
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        fecharModal();
    }
});

// Guest guide carousel
async function inicializarManual() {
    const track = document.getElementById('manualTrack');
    if (!track) return;

    try {
        const response = await fetch('data/manual.json');
        const data = await response.json();
        renderizarManual(data.orientacoes);
    } catch (error) {
        console.error('Erro ao carregar guia do convidado:', error);
        track.innerHTML = '<p class="manual-erro">Erro ao carregar as orientações. Verifique o arquivo manual.json</p>';
    }
}

function renderizarManual(orientacoes) {
    const track = document.getElementById('manualTrack');
    const dotsContainer = document.getElementById('manualDots');
    const prevBtn = document.getElementById('manualPrev');
    const nextBtn = document.getElementById('manualNext');

    if (!track || !dotsContainer || !orientacoes || orientacoes.length === 0) return;

    track.innerHTML = orientacoes.map(item => `
        <div class="manual-card">
            <div class="manual-icon">${item.icone}</div>
            <h3>${item.titulo}</h3>
            <p>${item.texto}</p>
        </div>
    `).join('');

    dotsContainer.innerHTML = orientacoes
        .map((_, i) => `<button class="manual-dot" data-index="${i}" aria-label="Ir para dica ${i + 1}"></button>`)
        .join('');

    const dots = Array.from(dotsContainer.querySelectorAll('.manual-dot'));
    const total = orientacoes.length;
    let indiceAtual = 0;
    let autoplayTimer = null;

    function irParaSlide(indice) {
        indiceAtual = (indice + total) % total;
        track.style.transform = `translateX(-${indiceAtual * 100}%)`;
        dots.forEach((dot, i) => dot.classList.toggle('active', i === indiceAtual));
    }

    function iniciarAutoplay() {
        autoplayTimer = setInterval(() => irParaSlide(indiceAtual + 1), 6000);
    }

    function reiniciarAutoplay() {
        clearInterval(autoplayTimer);
        iniciarAutoplay();
    }

    prevBtn?.addEventListener('click', () => {
        irParaSlide(indiceAtual - 1);
        reiniciarAutoplay();
    });

    nextBtn?.addEventListener('click', () => {
        irParaSlide(indiceAtual + 1);
        reiniciarAutoplay();
    });

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            irParaSlide(Number(dot.dataset.index));
            reiniciarAutoplay();
        });
    });

    // Swipe support for touch devices
    let touchStartX = 0;
    track.addEventListener('touchstart', (event) => {
        touchStartX = event.touches[0].clientX;
    }, { passive: true });

    track.addEventListener('touchend', (event) => {
        const diferenca = event.changedTouches[0].clientX - touchStartX;
        if (Math.abs(diferenca) > 40) {
            irParaSlide(diferenca < 0 ? indiceAtual + 1 : indiceAtual - 1);
            reiniciarAutoplay();
        }
    }, { passive: true });

    const carousel = track.closest('.manual-carousel');
    carousel?.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
    carousel?.addEventListener('mouseleave', iniciarAutoplay);

    irParaSlide(0);
    iniciarAutoplay();
}

// Pre-wedding shoot: photo strip + chapters (data/ensaio.json)
const ENSAIO_PASTA = 'images/ensaio/';
const ENSAIO_LADO_MINIATURA = 900;

async function inicializarEnsaio() {
    const capitulosEl = document.getElementById('ensaioCapitulos');
    const faixaTrack = document.getElementById('faixaTrack');

    try {
        const response = await fetch('data/ensaio.json');
        const data = await response.json();
        renderizarFaixa(faixaTrack, data.faixa);
        renderizarCapitulos(capitulosEl, data.capitulos);
    } catch (error) {
        console.error('Erro ao carregar ensaio:', error);
        if (capitulosEl) {
            capitulosEl.innerHTML =
                '<p style="text-align: center;">Erro ao carregar as fotos do ensaio. Verifique o arquivo ensaio.json</p>';
        }
    }
}

function renderizarFaixa(track, arquivos) {
    if (!track || !arquivos || arquivos.length === 0) return;

    // A lista é repetida duas vezes: a animação anda metade da largura e recomeça sem salto
    [...arquivos, ...arquivos].forEach(arquivo => {
        const img = document.createElement('img');
        img.src = ENSAIO_PASTA + arquivo;
        img.alt = '';
        img.height = 180;
        img.decoding = 'async';
        track.appendChild(img);
    });
}

function renderizarCapitulos(container, capitulos) {
    if (!container || !capitulos) return;

    capitulos.forEach(capitulo => {
        const secao = document.createElement('article');
        secao.className = 'capitulo';

        const cabecalho = document.createElement('header');
        cabecalho.className = 'capitulo-cabecalho reveal';

        const numero = document.createElement('span');
        numero.className = 'capitulo-numero';
        numero.textContent = `Capítulo ${capitulo.numero}`;

        const titulo = document.createElement('h3');
        titulo.className = 'capitulo-titulo';
        titulo.textContent = capitulo.titulo;

        const frase = document.createElement('p');
        frase.className = 'capitulo-frase';
        frase.textContent = capitulo.frase;

        cabecalho.append(numero, titulo, frase);
        secao.appendChild(cabecalho);

        // "linhas" diz quantas fotos entram em cada linha; as fotos de uma linha dividem a largura
        // na proporção da própria forma, então todas ficam com a mesma altura
        let indice = 0;
        capitulo.linhas.forEach(quantidade => {
            const linha = document.createElement('div');
            linha.className = 'ensaio-linha';

            capitulo.fotos.slice(indice, indice + quantidade).forEach(foto => {
                linha.appendChild(criarFotoEnsaio(foto, capitulo.titulo));
            });

            indice += quantidade;
            secao.appendChild(linha);
        });

        container.appendChild(secao);
    });

    observarReveal(container);
}

function criarFotoEnsaio(foto, tituloCapitulo) {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'ensaio-foto reveal';
    botao.style.flexGrow = foto.largura / foto.altura;
    botao.setAttribute('aria-label', `Ampliar foto: ${foto.descricao}`);

    const larguraMiniatura = Math.round(foto.largura * ENSAIO_LADO_MINIATURA / Math.max(foto.largura, foto.altura));
    const img = document.createElement('img');
    img.src = ENSAIO_PASTA + foto.miniatura;
    img.srcset = `${ENSAIO_PASTA}${foto.miniatura} ${larguraMiniatura}w, ${ENSAIO_PASTA}${foto.arquivo} ${foto.largura}w`;
    img.sizes = '(max-width: 768px) 100vw, 50vw';
    img.alt = foto.descricao;
    img.width = foto.largura;
    img.height = foto.altura;
    img.loading = 'lazy';
    img.decoding = 'async';

    botao.appendChild(img);
    botao.addEventListener('click', () => abrirModal(ENSAIO_PASTA + foto.arquivo, foto.descricao, tituloCapitulo));
    return botao;
}

// Fade-in as elements enter the viewport
function observarReveal(container) {
    const elementos = container.querySelectorAll('.reveal');

    if (!('IntersectionObserver' in window)) {
        elementos.forEach(el => el.classList.add('visivel'));
        return;
    }

    const observer = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                entrada.target.classList.add('visivel');
                observer.unobserve(entrada.target);
            }
        });
    }, { threshold: 0.12 });

    elementos.forEach(el => observer.observe(el));
}

// Parallax on the photo dividers: the background drifts slower than the page
function inicializarParallax() {
    const divisores = document.querySelectorAll('.divisor');
    if (divisores.length === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let agendado = false;

    function atualizar() {
        agendado = false;
        divisores.forEach(divisor => {
            const caixa = divisor.getBoundingClientRect();
            if (caixa.bottom < 0 || caixa.top > window.innerHeight) return;

            // 0 quando o divisor está no centro da tela; limitado à folga de 15% criada no CSS
            const distancia = caixa.top + caixa.height / 2 - window.innerHeight / 2;
            const limite = caixa.height * 0.15;
            const deslocamento = Math.max(-limite, Math.min(limite, -distancia * 0.15));
            divisor.style.setProperty('--parallax', `${deslocamento.toFixed(1)}px`);
        });
    }

    window.addEventListener('scroll', () => {
        if (!agendado) {
            agendado = true;
            requestAnimationFrame(atualizar);
        }
    }, { passive: true });

    atualizar();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    carregarPresentes();
    inicializarGaleria();
    inicializarManual();
    inicializarEnsaio();
    inicializarParallax();
});