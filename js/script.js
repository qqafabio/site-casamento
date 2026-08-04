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

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    carregarPresentes();
    inicializarGaleria();
    inicializarManual();
});