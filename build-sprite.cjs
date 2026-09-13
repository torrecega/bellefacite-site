// Regera o sprite de ícones embutido no index.html.
// Lê os SVGs originais do Phosphor em .icons/ e inclui apenas os que a página usa.
//   node build-sprite.cjs
const fs = require('fs');
const path = require('path');

const ICONS = path.join(__dirname, '.icons');
const HTML = path.join(__dirname, 'index.html');

let html = fs.readFileSync(HTML, 'utf8');

const usados = [...new Set([...html.matchAll(/href="#i-([a-z0-9-]+)"/g)].map(m => m[1]))].sort();

const faltando = usados.filter(n => !fs.existsSync(path.join(ICONS, n + '.svg')));
if (faltando.length) {
  console.error('SVG ausente em .icons/: ' + faltando.join(', '));
  process.exit(1);
}

let sprite = '<svg xmlns="http://www.w3.org/2000/svg" class="sprite" aria-hidden="true">';
for (const nome of usados) {
  const raw = fs.readFileSync(path.join(ICONS, nome + '.svg'), 'utf8');
  const inner = raw.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').trim();
  sprite += '<symbol id="i-' + nome + '" viewBox="0 0 256 256">' + inner + '</symbol>';
}
sprite += '</svg>';

const marcador = '<!-- ícones: Phosphor Icons (MIT), estilo regular -->';
const anterior = new RegExp(marcador.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*<svg[^>]*class="sprite"[\\s\\S]*?<\\/svg>');

if (anterior.test(html)) {
  html = html.replace(anterior, marcador + '\n' + sprite);
} else if (html.includes('<!--SPRITE-->')) {
  html = html.replace('<!--SPRITE-->', marcador + '\n' + sprite);
} else {
  console.error('nada para substituir no index.html');
  process.exit(1);
}

fs.writeFileSync(HTML, html);
console.log('sprite regerado com ' + usados.length + ' ícones: ' + usados.join(', '));
