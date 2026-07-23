# 💍 Nosso Casamento - Website

Bem-vindo! Este é um site personalizado para celebrar seu casamento com informações do evento, galeria de fotos e lista de presentes.

---

## 🚀 Como Começar

### 1. Estrutura do Projeto

```
site-casamento/
├── index.html              # Página principal
├── css/
│   └── style.css           # Estilos (Terracota + Azul Marinho)
├── js/
│   └── script.js           # Funcionalidades
├── data/
│   └── presentes.json      # Lista de presentes
├── images/
│   ├── fotos/              # Suas fotos do evento
│   └── presentes/          # Imagens dos presentes
└── README.md               # Este arquivo
```

### 2. Testar Localmente

1. Abra o arquivo `index.html` no navegador
2. O site carregará com dados de exemplo

**Nota:** Para testar com dados locais (imagens/fotos), execute em um servidor local:

```bash
# Python 3
python -m http.server 8000

# Ou com Node.js (http-server)
npx http-server
```

Depois acesse: `http://localhost:8000`

---

## ✏️ Personalizando o Site

### 1. **Editar Informações do Evento** (index.html)

Abra `index.html` e procure por:

```html
<!-- Hero Section -->
<p class="hero-date">Digite a data aqui</p>

<!-- Event Information -->
<p>Insira a data do casamento</p>
<p>Insira o horário da cerimônia</p>
<p>Insira o local do evento</p>
```

Substitua pelos seus dados.

### 2. **Adicionar Fotos da Galeria**

1. Crie uma pasta `images/fotos/` no seu projeto
2. Coloque suas fotos lá (jpg, png, etc)
3. Abra `js/script.js` e na função `inicializarGaleria()`, descomente e adicione suas fotos:

```javascript
const imagensPadrao = [
    { src: 'images/fotos/foto1.jpg', alt: 'Foto 1' },
    { src: 'images/fotos/foto2.jpg', alt: 'Foto 2' },
    { src: 'images/fotos/foto3.jpg', alt: 'Foto 3' },
];
```

### 3. **Configurar Lista de Presentes**

Edite `data/presentes.json`:

```json
{
  "presentes": [
    {
      "id": 1,
      "nome": "Nome do Presente",
      "descricao": "Descrição breve",
      "valor": 199.90,
      "imagem": "https://link-da-imagem.jpg",
      "link_mercado_livre": "https://www.mercadolivre.com.br/seu-link-aqui"
    }
  ]
}
```

**Campos importantes:**
- `nome`: Nome do item
- `valor`: Preço em reais
- `imagem`: URL da imagem (pode ser local: `images/presentes/foto.jpg`)
- `link_mercado_livre`: Link do produto no Mercado Livre

### 4. **Editar Cores**

Abra `css/style.css` e procure por `:root`:

```css
:root {
    --primary: #C85A3A;      /* Terracota - cor principal */
    --secondary: #003366;    /* Azul marinho - cor secundária */
    --light: #F5F1E8;        /* Bege claro */
    --white: #FFFFFF;        /* Branco */
}
```

Você pode alterar os códigos de cor hex para personalizar.

---

## 🛒 Integração com Mercado Livre

### Passo 1: Criar Produtos no Mercado Livre

1. Acesse [mercadolivre.com.br](https://www.mercadolivre.com.br)
2. Faça login ou crie uma conta
3. Vá para "Minhas Vendas" → "Listar produtos"
4. Crie cada presente como um produto

### Passo 2: Obter Links dos Produtos

1. Para cada produto criado, copie o URL
2. Cole em `data/presentes.json` no campo `link_mercado_livre`

Exemplo:
```json
"link_mercado_livre": "https://www.mercadolivre.com.br/seu-produto-xxx"
```

### Passo 3: Testar

Clique em "Comprar" no site e verifique se redireciona corretamente.

---

## 🌐 Hospedagem no GitHub Pages

### Passo 1: Criar Repositório

1. Acesse [github.com](https://github.com) e faça login
2. Clique em "+" no canto superior direito → "New repository"
3. Nome: `site-casamento`
4. Escolha "Public"
5. Clique "Create repository"

### Passo 2: Push do Código

```bash
# Na pasta do projeto
git init
git add .
git commit -m "Initial commit: Wedding website"
git branch -M main
git remote add origin https://github.com/seu-usuario/site-casamento.git
git push -u origin main
```

### Passo 3: Ativar GitHub Pages

1. Vá para o repositório no GitHub
2. Clique em "Settings"
3. Procure por "Pages" (menu esquerdo)
4. Em "Source", selecione "Deploy from a branch"
5. Branch: `main` | Pasta: `/ (root)`
6. Clique "Save"

### Passo 4: Seu Site está Online! 🎉

Acesse: `https://seu-usuario.github.io/site-casamento`

---

## 🎨 Paleta de Cores Sugerida

- **Terracota (#C85A3A)**: Cor quente e aconchegante
- **Azul Marinho (#003366)**: Elegância e sofisticação
- **Creme (#F5F1E8)**: Suavidade
- **Branco (#FFFFFF)**: Limpeza e clareza

---

## 📱 Responsividade

O site é totalmente responsivo:
- ✅ Desktop (1024px+)
- ✅ Tablet (768px)
- ✅ Mobile (320px)

---

## 🐛 Troubleshooting

### Presentes não carregam
- Verifique se `data/presentes.json` está no caminho correto
- Abra o console do navegador (F12) para ver erros
- Certifique-se de executar em um servidor local, não diretamente do arquivo

### Fotos não aparecem
- Verifique se o caminho das imagens está correto
- Use paths relativos: `images/fotos/foto.jpg`
- Certifique-se de que o arquivo existe na pasta

### Links do Mercado Livre não funcionam
- Copie o link completo do produto
- Teste o link diretamente no navegador antes de adicionar

---

## 📝 Dicas Finais

1. **Faça backup** de suas alterações regularmente
2. **Teste responsividade** em diferentes devices
3. **Compartilhe o link** com convidados após publicar
4. **Atualize presentes** conforme necessário editando `presentes.json`

---

## 💌 Dúvidas?

Consulte os comentários no código:
- `index.html` - Estrutura
- `css/style.css` - Estilos
- `js/script.js` - Lógica
- `data/presentes.json` - Dados

---

**Que seu casamento seja inesquecível! 💕**