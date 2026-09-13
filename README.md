# BelleFacite Equipamentos Estéticos

Site de uma página para a locação de equipamentos estéticos da BelleFacite,
em João Pessoa – PB.

HTML, CSS e JavaScript puros, sem build e sem dependência de CDN. Para publicar,
basta subir a pasta inteira em qualquer hospedagem estática (Netlify, Vercel,
GitHub Pages, cPanel).

## Rodar localmente

```bash
node .claude/serve.cjs
```

Abre em `http://localhost:4321`. Qualquer outro servidor estático serve; o
`file://` não funciona porque as fontes são carregadas por caminho relativo.

## Estrutura

```
index.html            a página inteira, incluindo as 5 fichas de equipamento
assets/css/site.css   um único stylesheet, com os tokens no topo
assets/js/site.js     navegação, calculadora, fichas e revelação no scroll
assets/fonts/         Outfit, Geist e Geist Mono (subset latin, auto-hospedadas)
assets/img/           imagens já otimizadas em WebP
.icons/               SVGs originais do Phosphor usados no sprite
imagens/              fotos originais, fonte do build de imagens
build-images.sh       gera assets/img/ a partir de imagens/
build-sprite.cjs      regera o sprite de ícones embutido no index.html
```

## Decisões que valem saber antes de mexer

**Cor da marca.** O briefing sugeria `#E91E8C`, mas o rosa real do logo é
`#E83868`. O site usa o do logo, para a página e a marca combinarem. A rampa
fica no topo do CSS: `--brand-500` é a identidade, `--brand-600` é o tom dos
botões (texto branco passa AA, 5,2:1) e `--brand-700` é o tom de texto rosa
sobre branco (7,1:1). Trocar `--brand-500` sozinho quebra o contraste; troque
os três juntos.

**Tema claro travado.** Não há modo escuro. As fotos de produto e o logo são
rosa sobre fundo claro; inverter o tema descaracterizaria o material da marca.

**Cantos.** Uma regra só, documentada no topo do CSS: botões e pills são
`--r-pill`, painéis e cartões são `--r-lg`, campos são `--r-md`, miniaturas são
`--r-sm`.

**Nada de travessão.** O texto usa hífen (`-`), nunca `—` nem `–`, inclusive em
"João Pessoa - PB".

## Atualizar conteúdo

**Preços.** Aparecem em três lugares e os três precisam mudar juntos:

1. a tabela da seção `#precos` no `index.html`;
2. as fichas (`<dialog id="ficha-...">`), no bloco `.sheet__prices`;
3. a constante `TABELA` no `assets/js/site.js`, que alimenta a calculadora.

Os valores de insumo ficam em `CARTUCHO` e `PONTEIRA`, no mesmo arquivo.

**Chutes iniciais da calculadora.** A constante `PADRAO` define quantas sessões
e qual preço por sessão aparecem ao escolher cada equipamento. São só pontos de
partida que o visitante ajusta, não tabela de preço, e a página diz isso.

**WhatsApp.** O número está uma vez só, na constante `WHATSAPP` do
`assets/js/site.js`. Cada botão define a mensagem pré-preenchida no atributo
`data-zap`.

**Fotos.** Coloque os arquivos novos em `imagens/` com os mesmos nomes e rode:

```bash
bash build-images.sh
```

O script recorta, redimensiona e converte para WebP. As fotos de produto são
padronizadas em um quadrado de 1200 px, preenchendo as sobras com uma cópia
desfocada da própria imagem; como o fundo de estúdio é um degradê liso, a
emenda não aparece.

**Ícones.** São SVGs do [Phosphor](https://phosphoricons.com) (MIT) embutidos
como sprite no `index.html`. Para usar um ícone novo, salve o SVG em `.icons/`,
referencie como `<use href="#i-nome">` e rode:

```bash
node build-sprite.cjs
```

O script inclui no sprite apenas os ícones que a página realmente usa e falha
se algum estiver faltando.

## Acessibilidade e desempenho

- Carga inicial em torno de 200 KB, com a foto do hero pré-carregada.
- Todo texto passa no WCAG AA; os tons usados em cada caso estão comentados no CSS.
- As animações respeitam `prefers-reduced-motion`.
- Se o JavaScript falhar, a página continua legível: a regra que esconde as
  seções depende da classe `js`, que só existe com o script rodando.
- As fichas usam `<dialog>` nativo, com foco devolvido ao botão de origem.
- `#ficha-hifu`, `#ficha-criopad`, `#ficha-microneedle`, `#ficha-lipocavity` e
  `#ficha-stimcare` abrem a ficha correspondente direto pela URL.

## Dados estruturados

O `index.html` traz JSON-LD de `LocalBusiness` (com as cinco ofertas de diária)
e de `FAQPage`. Ao mudar preço ou resposta de dúvida, atualize também o bloco
`application/ld+json` no fim do arquivo.

O domínio nas tags canônicas e de Open Graph está como
`https://bellefacite.com.br/`. Troque se o endereço final for outro.
