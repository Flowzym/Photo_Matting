import * as ort from 'onnxruntime-web'

const base = (import.meta as any).env?.BASE_URL || '/'

export async function setupOrt() {
  // Serve ORT assets from /ort (or BASE_URL + 'ort')
  ort.env.wasm.wasmPaths = base + 'ort'
  if (!(globalThis as any).crossOriginIsolated) {
    ort.env.wasm.numThreads = 1
  }
  return { backend: 'wasm', threads: ort.env.wasm.numThreads ?? 1, wasmPaths: ort.env.wasm.wasmPaths }
}

export function getOrt() { return ort }
export function getBase() { return base }
