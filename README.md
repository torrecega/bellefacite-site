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

Hero · Problema e solução · Diferenciais · Sobre · Depoimentos · Portfólio de equipamentos
(5 tecnologias, cada uma com galeria, especificações e tabela de preços em modal) · FAQ · CTA · Rodapé

## Otimizações

- Imagens reprocessadas com sharp: 2,25 MB → 1,03 MB
- Carga inicial de ~261 KB
- `loading="lazy"` em todas as imagens abaixo da dobra, `fetchpriority="high"` no hero
- Animações respeitam `prefers-reduced-motion`
- Dados estruturados Schema.org (LocalBusiness e FAQPage)
