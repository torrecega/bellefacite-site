#!/usr/bin/env bash
# Gera os assets otimizados em assets/img a partir de imagens/.
# Requer ffmpeg com libwebp. Rode de novo sempre que trocar uma foto de origem.
set -euo pipefail
SRC="imagens"
OUT="assets/img"
mkdir -p "$OUT"

ff() { ffmpeg -v error -y "$@"; }

# Padroniza uma foto de produto em um quadrado 1200x1200, preenchendo as sobras
# com uma copia desfocada da propria imagem (o fundo de estudio e um degrade liso,
# entao a emenda fica invisivel).
square() {
  ff -i "$1" -filter_complex \
    "[0:v]split=2[bg][fg];\
     [bg]scale=1200:1200:force_original_aspect_ratio=increase,crop=1200:1200,gblur=sigma=60[bgb];\
     [fg]scale=1200:1200:force_original_aspect_ratio=decrease:flags=lanczos[fgs];\
     [bgb][fgs]overlay=(W-w)/2:(H-h)/2" \
    -c:v libwebp -quality 82 -compression_level 6 "$2"
}

detail() { ff -i "$1" -vf "${3:-null},scale=1000:-2:flags=lanczos" -c:v libwebp -quality 76 -compression_level 6 "$2"; }

# --- logo (PNG de origem ja tem canal alpha; 66px de margem transparente a esquerda) ---
ff -i "$SRC/ChatGPT Image Sep 12, 2026, 12_50_57 PM.png" -vf "crop=1236:1135:66:0,scale=400:-1:flags=lanczos" -c:v libwebp -quality 78 -compression_level 6 "$OUT/logo.webp"
ff -i "$SRC/ChatGPT Image Sep 12, 2026, 12_50_57 PM.png" -vf "crop=1236:1061:66:0,scale=240:-1:flags=lanczos" -c:v libwebp -quality 80 -compression_level 6 "$OUT/logo-mark.webp"
ff -i "$SRC/ChatGPT Image Sep 12, 2026, 12_50_57 PM.png" -vf "crop=1236:1135:66:0,scale=512:-1:flags=lanczos" "$OUT/logo.png"
ff -i "$SRC/ChatGPT Image Sep 12, 2026, 12_50_57 PM.png" -vf "crop=1236:1135:66:0,scale=432:-1:flags=lanczos,pad=512:512:(ow-iw)/2:(oh-ih)/2:white" "$OUT/icon-512.png"

# --- hero: recorta a area dos equipamentos, descartando o vazio da esquerda ---
ff -i "$SRC/imagem hero.jpg" -vf "crop=1160:1107:760:0" -c:v libwebp -quality 84 -compression_level 6 "$OUT/hero.webp"

# --- faixa de manipulos (metade de baixo do post, sem o texto) ---
ff -i "$SRC/imagem 1.jpg" -vf "crop=1080:400:0:950,scale=1080:-2:flags=lanczos" -c:v libwebp -quality 80 -compression_level 6 "$OUT/versatilidade.webp"

# --- equipamentos ---
square "$SRC/produto - herus hifu 4d.jpg"    "$OUT/eq-hifu.webp"
square "$SRC/produto - axcel criopad.jpg"    "$OUT/eq-criopad.webp"
square "$SRC/produto - axcel microneedle.jpg" "$OUT/eq-microneedle.webp"
square "$SRC/produto lipocavity.jpg"         "$OUT/eq-lipocavity.webp"
square "$SRC/produto strim care.jpg"         "$OUT/eq-stimcare.webp"

# --- detalhes (galeria da ficha) ---
detail "$SRC/herus especificação 1.jpg"             "$OUT/det-hifu-1.webp"
detail "$SRC/herus especificação 2.jpg"             "$OUT/det-hifu-2.webp"
detail "$SRC/herus especificação 3.jpg"             "$OUT/det-hifu-3.webp" "crop=1080:500:0:0"
detail "$SRC/especificação axcel criopad 1.jpg"     "$OUT/det-criopad-1.webp"
detail "$SRC/especificação axcel criopad 2.jpg"     "$OUT/det-criopad-2.webp"
detail "$SRC/especificação axcel criopad 3.jpg"     "$OUT/det-criopad-3.webp"
detail "$SRC/especificação axcel microneedle 1.jpg" "$OUT/det-microneedle-1.webp"
detail "$SRC/especificação axcel microneedle 2.jpg" "$OUT/det-microneedle-2.webp"
detail "$SRC/especificação axcel microneedle 3.jpg" "$OUT/det-microneedle-3.webp"
detail "$SRC/especificação axcel microneedle 4.jpg" "$OUT/det-microneedle-4.webp"

# --- open graph: hero em 1200x630 com o logo aplicado ---
ff -i "$SRC/imagem hero.jpg" -i "$SRC/ChatGPT Image Sep 12, 2026, 12_50_57 PM.png" -filter_complex \
  "[0:v]scale=1200:-2:flags=lanczos,crop=1200:630:0:60[bg];\
   [1:v]crop=1236:1135:66:0,scale=300:-1:flags=lanczos[lg];\
   [bg][lg]overlay=70:175" -frames:v 1 -q:v 3 "$OUT/og.jpg"

echo "ok"
ls -la "$OUT"
