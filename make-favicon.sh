#!/usr/bin/env bash
# Gera o conjunto de favicons a partir de imagens/logo-circulo.png.
# O PNG de origem e opaco: o circulo rosa vive num quadrado de cantos brancos.
# Recortamos o circulo (1183x1183 no offset 35,35) e aplicamos uma mascara
# circular, para o icone nao virar um quadradinho branco na aba escura.
set -euo pipefail
SRC="imagens/logo-circulo.png"
OUT="assets/img"

# raio 1px menor que a metade, para comer a franja branca do antialias da origem
mascara() { echo "crop=1183:1183:35:35,scale=$1:$1:flags=lanczos,format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='clip((($1/2)-1-hypot(X-($1/2-0.5),Y-($1/2-0.5)))*255,0,255)'"; }

for s in 192 32 16; do
  ffmpeg -v error -y -i "$SRC" -vf "$(mascara $s)" "$OUT/icon-$s.png"
done

# apple-touch: a Apple arredonda sozinha e ignora transparencia, entao entrega
# um quadrado rosa solido em vez de deixar canto branco aparecendo
ffmpeg -v error -y -f lavfi -i "color=c=0xF0346F:s=180x180" -i "$SRC" \
  -filter_complex "[1:v]$(mascara 180)[fg];[0:v][fg]overlay=0:0:format=auto,format=rgb24" \
  -frames:v 1 "$OUT/apple-touch-icon.png"

node - <<'JS'
// Empacota os PNGs de 16 e 32 num favicon.ico (ICO aceita PNG embutido).
const fs = require('fs');
const pngs = [16, 32].map(s => ({ s, buf: fs.readFileSync(`assets/img/icon-${s}.png`) }));
const head = Buffer.alloc(6);
head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(pngs.length, 4);
let offset = 6 + 16 * pngs.length;
const dir = [], dados = [];
for (const { s, buf } of pngs) {
  const e = Buffer.alloc(16);
  e.writeUInt8(s === 256 ? 0 : s, 0); e.writeUInt8(s === 256 ? 0 : s, 1);
  e.writeUInt8(0, 2); e.writeUInt8(0, 3);
  e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6);
  e.writeUInt32LE(buf.length, 8); e.writeUInt32LE(offset, 12);
  dir.push(e); dados.push(buf); offset += buf.length;
}
fs.writeFileSync('favicon.ico', Buffer.concat([head, ...dir, ...dados]));
console.log('favicon.ico:', fs.statSync('favicon.ico').size, 'bytes');
JS

ls -la "$OUT"/icon-*.png "$OUT/apple-touch-icon.png" favicon.ico
