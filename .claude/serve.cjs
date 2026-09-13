// Servidor estático mínimo para revisar o site localmente.
// node .claude/serve.cjs [porta]
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.argv[2] || process.env.PORT || 4321);

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon'
};

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  let alvo = path.join(ROOT, url === '/' ? 'index.html' : url);

  // Nunca sair da raiz do projeto.
  if (!alvo.startsWith(ROOT)) {
    res.writeHead(403).end('403');
    return;
  }

  fs.stat(alvo, (err, st) => {
    if (!err && st.isDirectory()) alvo = path.join(alvo, 'index.html');
    fs.readFile(alvo, (err2, buf) => {
      if (err2) {
        res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('404 ' + url);
        return;
      }
      res.writeHead(200, {
        'content-type': TIPOS[path.extname(alvo).toLowerCase()] || 'application/octet-stream',
        'cache-control': 'no-cache'
      }).end(buf);
    });
  });
}).listen(PORT, () => {
  console.log('BelleFacite em http://localhost:' + PORT);
});
