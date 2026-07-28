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

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    carregarPresentes();
    inicializarGaleria();
});