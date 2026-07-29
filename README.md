# 💍 Cibele & Fábio - Website de Casamento

Bem-vindo! Este é um site personalizado para celebrar o casamento, com informações do evento, galeria de fotos, mural de recados dos convidados e lista de presentes.

---

## 🚀 Como Começar

### 1. Estrutura do Projeto

```
site-casamento/
├── index.html              # Página principal
├── css/
│   └── style.css           # Estilos (Dourado + Charcoal + Terracota)
├── js/
│   ├── script.js           # Navegação, galeria e presentes
│   └── mural.js            # Mural de recados (Firebase Firestore)
├── data/
│   ├── presentes.json      # Lista de presentes
│   └── galeria.json        # Fotos e legendas da galeria
├── images/
│   ├── fotos/              # Fotos do casal / evento
│   └── presentes/          # Imagens dos presentes
└── README.md               # Este arquivo
```

### 2. Testar Localmente

**Importante:** o Mural de Recados usa um módulo JavaScript (`js/mural.js`) que só funciona quando o site é servido por `http://`, não abrindo o `index.html` direto pelo `file://`. Execute sempre um servidor local:

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
```

Substitua pelos seus dados.

Os endereços da cerimônia e da recepção (nos cards do evento e no rodapé) usam um link `.map-link` que abre o Google Maps em uma nova aba:

```html
<a class="map-link" href="https://www.google.com/maps/search/?api=1&query=SEU_ENDERECO_CODIFICADO" target="_blank" rel="noopener noreferrer" title="Ver no Google Maps">Texto do endereço</a>
```

Para atualizar, troque o texto do link e gere a URL com o endereço codificado (substitua espaços por `%20`, vírgulas por `%2C`, etc). Esse mesmo endereço aparece tanto na seção "O Casamento" quanto no rodapé — atualize os dois lugares.

### 2. **Adicionar Fotos da Galeria**

1. Coloque suas fotos na pasta `images/fotos/` (jpg, png, etc)
2. Edite `data/galeria.json` e adicione uma entrada para cada foto, com o nome exato do arquivo e uma legenda:

```json
{
  "fotos": [
    { "arquivo": "foto1.jpg", "descricao": "Nosso primeiro encontro" },
    { "arquivo": "foto2.jpg", "descricao": "Pedido de namoro" }
  ]
}
```

A galeria é carregada dinamicamente por `js/script.js`, no estilo polaroid, com animação e legendas. Ao clicar em uma foto, ela abre ampliada (modal) junto com a legenda.

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
    --primary: #B8905F;      /* Dourado - cor principal */
    --secondary: #221F1A;    /* Charcoal - títulos */
    --dark: #14120F;         /* Quase preto - navbar/hero/rodapé */
    --light: #F7F3EC;        /* Creme - fundo das seções */
    --white: #FFFFFF;        /* Branco */
    --gray: #6B6B6B;         /* Textos secundários */
    --border: #E6DED0;       /* Bordas suaves */
    --terracotta: #C1502E;   /* Destaques e hover */
}
```

Você pode alterar os códigos de cor hex para personalizar.

---

## 💌 Mural de Recados

Os convidados podem deixar uma mensagem para o casal diretamente no site (seção "Mural de Recados"). Como o site é estático (sem servidor próprio), essa funcionalidade usa o **Firebase Firestore** (banco de dados gratuito do Google) para guardar os recados e mostrá-los em tempo real para todos os visitantes.

### Passo 1: Criar um projeto Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com/) e crie um projeto gratuito
2. Ative o **Cloud Firestore** (em modo produção)
3. Em "Configurações do projeto" → "Seus apps", registre um app Web e copie o objeto de configuração (`firebaseConfig`)

### Passo 2: Configurar `js/mural.js`

Abra `js/mural.js` e substitua os valores de exemplo pelos do seu projeto:

```javascript
const firebaseConfig = {
    apiKey: 'SUA_API_KEY',
    authDomain: 'SEU_PROJETO.firebaseapp.com',
    projectId: 'SEU_PROJETO',
    storageBucket: 'SEU_PROJETO.appspot.com',
    messagingSenderId: 'SEU_SENDER_ID',
    appId: 'SEU_APP_ID'
};
```

Enquanto esses valores não forem substituídos, o mural exibe um aviso de "não configurado" e fica desativado — o resto do site continua funcionando normalmente.

### Passo 3: Configurar as regras de segurança do Firestore

No console do Firebase, em **Firestore Database → Regras**, use:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /recados/{recadoId} {
      allow read: if true;
      allow create: if request.resource.data.keys().hasOnly(['nome', 'mensagem', 'criadoEm'])
                    && request.resource.data.nome is string
                    && request.resource.data.nome.size() > 0
                    && request.resource.data.nome.size() <= 60
                    && request.resource.data.mensagem is string
                    && request.resource.data.mensagem.size() > 0
                    && request.resource.data.mensagem.size() <= 400;
      allow update, delete: if false;
    }
  }
}
```

Isso permite que qualquer pessoa leia e crie recados válidos, mas ninguém consegue editar ou apagar recados de outra pessoa pelo site.

**Observação de segurança:** os valores em `firebaseConfig` não são secretos — são identificadores públicos do projeto, e o próprio Google recomenda publicá-los no código do site. A segurança real vem das regras do Firestore acima, não de esconder a `apiKey`.

### Passo 4 (recomendado): Restringir a API key ao seu domínio

Mesmo não sendo secreta, você pode impedir que outras pessoas usem sua `apiKey` em outro site:

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (mesmo projeto do Firebase)
2. Em "Credenciais", clique na chave de API usada pelo Firebase (o nome costuma ser "Browser key (auto created by Firebase)")
3. Em "Restrições de aplicativo", escolha **"Referenciadores HTTP (sites)"**
4. Adicione os domínios onde o site roda, por exemplo:
   - `https://seu-usuario.github.io/*`
   - `http://localhost:8000/*` (para testes locais)
5. Salve

A partir daí, mesmo que alguém copie a `apiKey` do código-fonte público, ela só funcionará nos domínios que você autorizou.

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

- **Dourado (#B8905F)**: Cor principal, elegância e destaque
- **Charcoal (#221F1A)**: Títulos e contraste
- **Quase preto (#14120F)**: Navbar, hero e rodapé
- **Creme (#F7F3EC)**: Fundo das seções
- **Terracota (#C1502E)**: Destaques, hover e valores
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

### Fotos ou legendas da galeria não aparecem
- Verifique se o campo `arquivo` em `data/galeria.json` bate exatamente com o nome do arquivo em `images/fotos/` (incluindo maiúsculas/minúsculas e espaços)
- Abra o console do navegador (F12) para ver erros de carregamento
- Certifique-se de executar em um servidor local, não diretamente do arquivo

### Links do Mercado Livre não funcionam
- Copie o link completo do produto
- Teste o link diretamente no navegador antes de adicionar

### Mural de Recados mostra aviso de "não configurado"
- Verifique se os valores em `firebaseConfig` (`js/mural.js`) foram substituídos pelos do seu projeto Firebase
- Confirme que o Cloud Firestore foi ativado no console do Firebase
- Certifique-se de acessar o site via `http://` (servidor local ou publicado) — módulos ES não funcionam com `file://`

### Recados não aparecem para outros visitantes
- Confira as regras de segurança do Firestore (veja a seção "Mural de Recados" acima)
- Abra o console do navegador (F12) na página do mural para ver mensagens de erro do Firebase

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
- `js/script.js` - Navegação, galeria e presentes
- `js/mural.js` - Mural de recados (Firebase)
- `data/presentes.json` - Dados dos presentes
- `data/galeria.json` - Fotos e legendas da galeria

---

**Que seu casamento seja inesquecível! 💕**