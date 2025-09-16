self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open('cvphoto-v3').then(cache => cache.addAll([
    '/',
    '/index.html',
    '/manifest.webmanifest',
    '/ort/ort-wasm.mjs',
    '/ort/ort-wasm.wasm',
    '/ort/ort-wasm-simd.mjs',
    '/ort/ort-wasm-simd.wasm',
    '/ort/ort-wasm-simd-threaded.mjs',
    '/ort/ort-wasm-simd-threaded.wasm',
    '/models/u2netp.onnx',
    '/models/modnet.onnx'
  ].filter(Boolean)).catch(()=>{})));
});
self.addEventListener('fetch', (event) => {
  event.respondWith((async () => {
    const cache = await caches.open('cvphoto-v3');
    const cached = await cache.match(event.request);
    if (cached) return cached;
    try {
      const res = await fetch(event.request);
      if (event.request.url.startsWith(self.location.origin)) {
        cache.put(event.request, res.clone());
      }
      return res;
    } catch (e) {
      return cached || Response.error();
    }
  })());
});
