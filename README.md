# Portfólio Ana Beatriz

Portfólio profissional de Ana Beatriz.

##  Sobre o Projeto

Este é um portfólio web moderno e responsivo desenvolvido para showcasing de projetos

## Estrutura do Projeto

```
AnaJuvencio.github.io/
├── index.html          # Página inicial com hero e projetos em destaque
├── sobre.html          # Trajetória profissional e habilidades
├── projetos.html       # Portfolio completo de projetos
├── artigos.html        # Blog e publicações
├── contato.html        # Formulário e informações de contato
├── css/
│   └── styles.css      # Estilos CSS completos
├── js/
│   └── script.js       # JavaScript para interatividade
├── images/             # Pasta para imagens e assets
│   ├── profile.jpg     # Foto de perfil principal
│   ├── profile-about.jpg
│   ├── project1-6.jpg  # Imagens dos projetos
│   └── article1-6.jpg  # Imagens dos artigos
└── README.md           # Este arquivo
```

## PDI protegido por senha

A página `pdi.html` (endereço: `https://anajuvencio.github.io/pdi`) é publicada **criptografada**: quem abre o link vê só uma tela de senha, e o conteúdo é descriptografado no navegador. A senha não fica guardada em nenhum arquivo do repositório.

- O texto aberto fica em `pdi.fonte.html` (ignorado pelo git, nunca é publicado).
- Para gerar ou atualizar a versão publicada, edite a fonte e rode:

```bash
node scripts/proteger-pdi.js
```

O script pede a senha (mínimo de 10 caracteres; prefira uma frase longa) e cria `pdi.html`. Publique esse arquivo junto com `css/pdi.css` e `js/pdi.js`.

## Como Usar

### Instalação Local

1. Clone o repositório:
```bash
git clone https://github.com/AnaJuvencio/AnaJuvencio.github.io.git
```

2. Navegue até a pasta:
```bash
cd AnaJuvencio.github.io
```

3. Abra o `index.html` no seu navegador ou use um servidor local:
```bash
# Com Python
python -m http.server 8000

# Com Node.js (http-server)
npx http-server
```

4. Acesse `http://localhost:8000` no navegador

## 🛠️ Tecnologias Utilizadas

- **HTML5** - Estrutura semântica
- **CSS3** - Estilos modernos com Flexbox e Grid
- **JavaScript** - Interatividade e animações
- **Font Awesome** - Ícones
- **Google Fonts** - Tipografia (Inter e Poppins)

## Responsividade

O site é totalmente responsivo com breakpoints em:
- Desktop: > 992px
- Tablet: 768px - 992px
- Mobile: < 768px

## Licença

Este projeto está sob a licença MIT. Sinta-se livre para usar como base para seu próprio portfólio!

## 📞 Contato

- **Email**: ana.juvencio01@gmail.com
---

**Desenvolvido com ❤️ por Ana Beatriz**

*Última atualização: Novembro 2025*
