import * as ort from 'onnxruntime-web'

const base = (import.meta as any).env?.BASE_URL || '/';

export async function setupOrt() {
  // Serve ORT assets from /ort (or BASE_URL + 'ort')
  ort.env.wasm.wasmPaths = base + 'ort/'
  ort.env.wasm.simd = false
  ort.env.wasm.proxy = false
  ort.env.webgl.disabled = true
  ort.env.webgpu.disabled = true
  if (!(globalThis as any).crossOriginIsolated) {
    ort.env.wasm.numThreads = 1
  }
  return { backend: 'wasm', threads: ort.env.wasm.numThreads ?? 1, wasmPaths: ort.env.wasm.wasmPaths }
}

export { ort }
export { base as getBase }
export function getOrt() { return ort }
