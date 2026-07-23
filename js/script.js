// Mobile Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
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
function inicializarGaleria() {
    // Verifica se há imagens na pasta images/fotos/
    // Por enquanto, mostra placeholder. As imagens devem ser adicionadas pelo usuário
    const galleryGrid = document.getElementById('galleryGrid');

    // Exemplo de como estruturar imagens (será necessário adicionar as imagens reais)
    const imagensPadrao = [
        // { src: 'images/fotos/foto1.jpg', alt: 'Foto 1' },
        // { src: 'images/fotos/foto2.jpg', alt: 'Foto 2' },
    ];

    if (imagensPadrao.length > 0) {
        galleryGrid.innerHTML = '';
        imagensPadrao.forEach((img, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.innerHTML = `<img src="${img.src}" alt="${img.alt}">`;
            item.addEventListener('click', () => abrirModal(img.src, img.alt));
            galleryGrid.appendChild(item);
        });
    }
}

// Modal functions
const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalClose = document.getElementById('modalClose');

function abrirModal(src, alt) {
    modal.style.display = 'block';
    modalImage.src = src;
    modalImage.alt = alt;
}

function fecharModal() {
    modal.style.display = 'none';
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