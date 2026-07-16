// Service Worker Simples para Adicionares PWA
// Permite instalação e funcionamento básico

self.addEventListener('install', (event) => {
    // Forçar ativação imediata
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // Reivindicar controle imediato
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Pass-through básico (Network Only com Fallback futuro se necessário)
    // Para permitir instalação, o fetch handler deve existir.
    event.respondWith(fetch(event.request));
});
