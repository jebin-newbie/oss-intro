// 로컬에서 MP4/PNG 프레임을 뽑는 보조 도구 (서버 배포와 무관, 내 컴퓨터에서만 실행)
// 사용: npm run render -- calvin        → out/calvin.mp4
//       npm run render -- group          → out/group_intro.mp4 (4인 인트로 구간)
// 필요: Node 18+, `npm install`, `npx playwright install chromium`, ffmpeg (brew install ffmpeg)
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const id = process.argv[2] || 'calvin';
const OUT = path.join(ROOT, 'out'); const FR = path.join(OUT, `frames_${id}`);
fs.rmSync(FR, { recursive: true, force: true }); fs.mkdirSync(FR, { recursive: true });

const types = { '.html': 'text/html', '.webp': 'image/webp', '.woff2': 'font/woff2', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0].split('#')[0]) === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); res.end(d); });
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1200, height: 1700 } })).newPage();
await page.goto(`http://localhost:${port}/index.html#${id === 'group' ? 'capture-group' : 'capture'}`);
await page.evaluate(() => window.TEMPLATE.ready);
if (id !== 'group') await page.evaluate(i => window.TEMPLATE.select(i), id);
await page.evaluate(() => document.fonts.ready);
const { duration, fps } = await page.evaluate(() => ({ duration: window.TEMPLATE.duration, fps: window.TEMPLATE.fps }));
const n = Math.round(duration * fps), stage = await page.$('#stage');
for (let i = 0; i < n; i++) {
  await page.evaluate(t => window.TEMPLATE.renderAt(t), i / fps);
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  await stage.screenshot({ path: path.join(FR, `${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 92 });
  if (i % 30 === 0) console.log(`frame ${i}/${n}`);
}
await browser.close(); server.close();
const mp4 = path.join(OUT, `${id === 'group' ? 'group_intro' : id}.mp4`);
execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(fps), '-i', path.join(FR, '%04d.jpg'), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '22', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4]);
console.log('done →', mp4);
