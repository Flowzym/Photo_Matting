const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const PKG_ROOT = path.join(__dirname, '..', 'node_modules', 'onnxruntime-web');
const DEST = path.join(__dirname, '..', 'public', 'ort');
const WRONG = path.join(__dirname, '..', 'public', 'models'); // Schutz

async function walk(dir) {
  const out = [];
  const ents = await fsp.readdir(dir, { withFileTypes: true });
  for (const e of ents) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(p)); else out.push(p);
  }
  return out;
}
function find(files, re) { return files.find(f => re.test(f)) || null; }

(async () => {
  await fsp.mkdir(DEST, { recursive: true });

  // 0) Aufräumen: falls versehentlich in models/ gelandet, rüber nach /ort
  try {
    const wrong = await fsp.readdir(WRONG);
    for (const name of wrong) {
      if (/^ort-wasm.*\.(mjs|js|wasm)$/.test(name)) {
        await fsp.rename(path.join(WRONG, name), path.join(DEST, name));
        console.log('[sync-ort] moved from models/ -> ort/:', name);
      }
    }
  } catch {}

  // 1) Dateien aus onnxruntime-web suchen/kopieren (robust)
  try { await fsp.access(PKG_ROOT); } catch {
    console.error('[sync-ort] onnxruntime-web nicht gefunden. Erst "npm install" ausführen.');
    process.exit(1);
  }
  const files = await walk(PKG_ROOT);
  const picks = {
    baseJS:  find(files, /dist[\\/](esm[\\/])?ort-wasm(\.min)?\.(mjs|js)$/) || find(files, /dist[\\/]ort(\.min)?\.js$/),
    baseWASM:find(files, /dist[\\/]ort-wasm\.wasm$/),
    simdJS:  find(files, /dist[\\/](esm[\\/])?ort-wasm-simd(\.min)?\.(mjs|js)$/),
    simdWASM:find(files, /dist[\\/]ort-wasm-simd\.wasm$/),
    thJS:    find(files, /dist[\\/](esm[\\/])?ort-wasm-simd-threaded(\.min)?\.(mjs|js)$/),
    thWASM:  find(files, /dist[\\/]ort-wasm-simd-threaded\.wasm$/),
  };
  const plan = [
    ['ort-wasm.mjs', picks.baseJS],
    ['ort-wasm.wasm', picks.baseWASM],
    ['ort-wasm-simd.mjs', picks.simdJS],
    ['ort-wasm-simd.wasm', picks.simdWASM],
    ['ort-wasm-simd-threaded.mjs', picks.thJS],
    ['ort-wasm-simd-threaded.wasm', picks.thWASM],
  ];
  const missing = [];
  for (const [target, src] of plan) {
    if (src) await fsp.copyFile(src, path.join(DEST, target));
    else missing.push(target);
  }
  // Fallback: fehlende Namen aus threaded duplizieren
  if (missing.length) {
    if (picks.thJS) for (const n of ['ort-wasm.mjs','ort-wasm-simd.mjs'])
      if (missing.includes(n)) await fsp.copyFile(picks.thJS, path.join(DEST, n));
    if (picks.thWASM) for (const n of ['ort-wasm.wasm','ort-wasm-simd.wasm'])
      if (missing.includes(n)) await fsp.copyFile(picks.thWASM, path.join(DEST, n));
  }
  console.log('[sync-ort] ready in /public/ort');
})();