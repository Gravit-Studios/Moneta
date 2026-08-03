// Service worker mínimo — cache-first para os assets estáticos do build,
// permitindo instalar o Moneta como PWA. Sem cache de chamadas ao Supabase
// (dados financeiros nunca devem servir de um cache stale).
const CACHE_NAME = 'moneta-shell-v1';
const APP_SHELL = ['/', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Nunca intercepta chamadas para o Supabase — só o app shell é cacheado.
  if (url.hostname.endsWith('.supabase.co')) return;
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => cached ?? fetch(event.request)),
  );
});
