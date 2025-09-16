const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const PKG_ROOT = path.join(__dirname, '..', 'node_modules', 'onnxruntime-web');
const DEST = path.join(__dirname, '..', 'public', 'ort');

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
  try { await fsp.access(PKG_ROOT); } catch {
    console.error(`[sync-ort] onnxruntime-web nicht gefunden unter ${PKG_ROOT}. Erst "npm install" laufen lassen.`);
    process.exit(1);
  }
  const files = await walk(PKG_ROOT);
  await fsp.mkdir(DEST, { recursive: true });

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

  const copied = [];
  const missing = [];

  for (const [target, src] of plan) {
    if (src) {
      await fsp.copyFile(src, path.join(DEST, target));
      copied.push(`${target}`);
    } else {
      missing.push(target);
    }
  }

  // Last-resort: fehlen base/simd, dupliziere threaded als Platzhalter
  if (missing.length) {
    if (picks.thJS) {
      for (const name of ['ort-wasm.mjs','ort-wasm-simd.mjs']) {
        if (missing.includes(name)) {
          await fsp.copyFile(picks.thJS, path.join(DEST, name));
          copied.push(`${name} [dup->threaded]`);
        }
      }
    }
    if (picks.thWASM) {
      for (const name of ['ort-wasm.wasm','ort-wasm-simd.wasm']) {
        if (missing.includes(name)) {
          await fsp.copyFile(picks.thWASM, path.join(DEST, name));
          copied.push(`${name} [dup->threaded]`);
        }
      }
    }
  }

  console.log('[sync-ort] ready:', copied.join(', '));
  // Wichtig: nicht mit Fehlercode beenden, auch wenn etwas fehlte.
})();