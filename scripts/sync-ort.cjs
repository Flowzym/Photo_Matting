const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const SRC = path.join(__dirname, '..', 'node_modules', 'onnxruntime-web', 'dist');
const DEST = path.join(__dirname, '..', 'public', 'ort');
const FILES = [
  'ort-wasm.mjs', 'ort-wasm.wasm',
  'ort-wasm-simd.mjs', 'ort-wasm-simd.wasm',
  'ort-wasm-simd-threaded.mjs', 'ort-wasm-simd-threaded.wasm'
];

(async () => {
  try {
    await fsp.mkdir(DEST, { recursive: true });
    const copied = [];
    for (const f of FILES) {
      const from = path.join(SRC, f);
      const to = path.join(DEST, f);
      await fsp.copyFile(from, to);
      copied.push(f);
    }
    console.log('[sync-ort] Copied:\n - ' + copied.join('\n - '));
  } catch (e) {
    console.error('[sync-ort] Failed:', e?.message || e);
    process.exit(1);
  }
})();
