# BelleFacite — Locação de Tecnologias Estéticas

Site institucional da **BelleFacite Equipamentos Estéticos**, de João Pessoa – PB.
Locação de equipamentos estéticos com Registro ANVISA, com treinamento, suporte e entrega inclusos.

🔗 https://bellefacite.com.br

## Stack

Site estático de página única. Sem build, sem dependências de runtime — apenas HTML, CSS e JavaScript
puro, com as fontes servidas pelo Google Fonts.

```
index.html          página completa (CSS e JS inline)
assets/img/         imagens otimizadas usadas em produção
imgens/             arquivos originais, em alta resolução (não usados pelo site)
.claude/            servidor estático local para preview
```

## Rodando localmente

```bash
node .claude/serve.cjs
```

Depois abra http://localhost:4321.

Qualquer servidor de arquivos estáticos serve — não há etapa de build.

## Publicação

Basta servir a raiz do repositório. Funciona direto em GitHub Pages, Vercel, Netlify ou
qualquer hospedagem estática.

## Estrutura da página

Hero · Alugar ou comprar (comparativo) · Calculadora de retorno · Portfólio (5 tecnologias,
cada uma com ficha lateral: galeria, especificações, indicações e tabela de preços) ·
Tabela comparativa de preços · Como funciona · Quem somos · Depoimentos · FAQ · CTA · Rodapé

### Calculadora de retorno

Simulador na seção `#retorno`: o visitante escolhe a tecnologia, o número de sessões do dia e
quanto cobra por sessão. O cálculo usa os valores reais de locação e os custos variáveis
(disparos do HIFU, ponteiras do Microneedle) e devolve faturamento, custos, lucro do dia e
em qual sessão a locação se paga.

Para ajustar preços ou estimativas, edite o objeto `EQUIP` no script ao final de `index.html`:
`diaria` é o valor real da locação, `preco` e `sessoes` são apenas os valores iniciais
sugeridos ao visitante, e `varPreco`/`varQtd` cobrem os consumíveis cobrados à parte.

## Otimizações

- Imagens reprocessadas com sharp: 2,25 MB → 1,03 MB
- Carga inicial de ~341 KB; as imagens das fichas só carregam ao abrir a ficha
- `loading="lazy"` em todas as imagens abaixo da dobra, `fetchpriority="high"` no hero
- Animações respeitam `prefers-reduced-motion`
- Dados estruturados Schema.org (LocalBusiness e FAQPage)
