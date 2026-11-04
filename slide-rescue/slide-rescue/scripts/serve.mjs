import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { ROOT } from './content.mjs';
const root = path.resolve(ROOT, 'dist');
const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.svg':'image/svg+xml', '.md':'text/plain; charset=utf-8', '.json':'application/json; charset=utf-8' };
const server = http.createServer(async (req, res) => {
  try {
    const requested = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = path.resolve(root, `.${requested}`);
    if (file !== root && !file.startsWith(`${root}${path.sep}`)) { res.writeHead(403); return res.end('Forbidden'); }
    let info = await stat(file);
    if (info.isDirectory()) {
      if (!requested.endsWith('/')) { res.writeHead(301, { Location: `${requested}/` }); return res.end(); }
      file = path.join(file, 'index.html');
    }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control':'no-store' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type':'text/html; charset=utf-8' });
    res.end(await readFile(path.join(root, '404.html')));
  }
});
server.listen(Number(process.env.PORT || 4173), '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${server.address().port}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
