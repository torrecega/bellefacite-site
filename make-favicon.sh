#!/usr/bin/env bash
# Gera o conjunto de favicons a partir de imagens/logo-circulo.png.
#
# O PNG de origem e opaco: o circulo rosa vive dentro de um quadrado de cantos
# brancos. Recortar sem mascara deixaria um quadradinho branco na aba escura do
# navegador, entao aqui a gente localiza o circulo, recorta e aplica mascara
# circular. A posicao e o tamanho do circulo sao medidos a cada execucao, para
# o script continuar valendo se o logo for trocado por outro enquadramento.
set -euo pipefail

SRC="imagens/logo-circulo.png"
OUT="assets/img"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

[ -f "$SRC" ] || { echo "faltando $SRC"; exit 1; }

DIM=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$SRC")
W="${DIM%%,*}"; H="${DIM##*,}"

ffmpeg -v error -y -i "$SRC" -f rawvideo -pix_fmt rgba "$TMP/src.raw"

# Mede o circulo e devolve o maior quadrado inscrito nele.
CROP=$(node -e '
const fs = require("fs");
const B = fs.readFileSync(process.argv[1]);
const W = +process.argv[2], H = +process.argv[3];
const rosa = (r, g, b) => r > 150 && g < 150 && (r - g) > 60 && (b - g) > 10;
let minX = W, maxX = -1, minY = H, maxY = -1;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const i = (y * W + x) * 4;
  if (rosa(B[i], B[i + 1], B[i + 2])) {
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
}
if (maxX < 0) { console.error("nenhum pixel rosa encontrado"); process.exit(1); }
// O circulo raramente sai perfeitamente redondo do gerador de imagem; usamos o
// menor dos dois eixos e centralizamos, para a mascara nao cortar um lado.
const lado = Math.min(maxX - minX + 1, maxY - minY + 1);
const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
const x = Math.round(cx - lado / 2), y = Math.round(cy - lado / 2);
console.log(lado + ":" + x + ":" + y);
' "$TMP/src.raw" "$W" "$H")

LADO="${CROP%%:*}"; RESTO="${CROP#*:}"; X="${RESTO%%:*}"; Y="${RESTO##*:}"
echo "circulo: ${LADO}px em ($X,$Y)"

# Mascara circular com raio 1px menor que a metade, para comer a franja branca
# do antialias da imagem de origem.
mascara() {
  local s=$1
  echo "crop=$LADO:$LADO:$X:$Y,scale=$s:$s:flags=lanczos,format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='clip((($s/2)-1-hypot(X-($s/2-0.5),Y-($s/2-0.5)))*255,0,255)'"
}

for s in 192 32 16; do
  ffmpeg -v error -y -i "$SRC" -vf "$(mascara $s)" "$OUT/icon-$s.png"
done

# Rosa exato do circulo, para o fundo do icone da Apple casar sem emenda.
ROSA=$(node -e '
const fs = require("fs");
const B = fs.readFileSync(process.argv[1]);
const W = +process.argv[2], lado = +process.argv[3], x = +process.argv[4], y = +process.argv[5];
// ponto bem dentro do circulo, perto da borda de cima, longe do desenho branco
const px = x + Math.round(lado / 2), py = y + Math.round(lado * 0.06);
const i = (py * W + px) * 4;
console.log("0x" + [B[i], B[i + 1], B[i + 2]].map(v => v.toString(16).padStart(2, "0")).join(""));
' "$TMP/src.raw" "$W" "$LADO" "$X" "$Y")
echo "rosa do circulo: $ROSA"

# apple-touch: o iOS arredonda sozinho e ignora transparencia, entao entregamos
# um quadrado rosa solido em vez de deixar canto branco aparecendo.
ffmpeg -v error -y -f lavfi -i "color=c=$ROSA:s=180x180" -i "$SRC" \
  -filter_complex "[1:v]$(mascara 180)[fg];[0:v][fg]overlay=0:0:format=auto,format=rgb24" \
  -frames:v 1 "$OUT/apple-touch-icon.png"

# Empacota os PNGs de 16 e 32 num favicon.ico (o formato aceita PNG embutido).
node -e '
const fs = require("fs");
const pngs = [16, 32].map(s => ({ s, buf: fs.readFileSync("assets/img/icon-" + s + ".png") }));
const head = Buffer.alloc(6);
head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(pngs.length, 4);
let offset = 6 + 16 * pngs.length;
const dir = [], dados = [];
for (const { s, buf } of pngs) {
  const e = Buffer.alloc(16);
  e.writeUInt8(s, 0); e.writeUInt8(s, 1);
  e.writeUInt8(0, 2); e.writeUInt8(0, 3);
  e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6);
  e.writeUInt32LE(buf.length, 8); e.writeUInt32LE(offset, 12);
  dir.push(e); dados.push(buf); offset += buf.length;
}
fs.writeFileSync("favicon.ico", Buffer.concat([head, ...dir, ...dados]));
console.log("favicon.ico:", fs.statSync("favicon.ico").size, "bytes");
'

ls -la "$OUT"/icon-*.png "$OUT/apple-touch-icon.png" favicon.ico
