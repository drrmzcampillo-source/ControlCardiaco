const CACHE = 'control-cardiaco-v2';
const ARCHIVOS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(claves => Promise.all(claves.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Primero la red (para recibir siempre la versión nueva); sin internet, usa lo guardado.
// Las llamadas a Supabase (otro dominio) nunca se guardan.
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    fetch(r)
      .then(res => { const copia = res.clone(); caches.open(CACHE).then(c => c.put(r, copia)); return res; })
      .catch(() => caches.match(r).then(m => m || caches.match('./index.html')))
  );
});
