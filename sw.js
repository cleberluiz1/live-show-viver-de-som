// Service Worker para LIVE SHOW
const CACHE_NAME = 'live-show-v1.28';
const urlsToCache = [
    '/live-show-viver-de-som/',
    '/live-show-viver-de-som/index.html',
    '/live-show-viver-de-som/manifest.json'
];

// Instalação - cache dos arquivos essenciais
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('✅ Cache criado');
            return cache.addAll(urlsToCache);
        })
    );
    self.skipWaiting();
});

// Ativação - limpa caches antigos
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('🗑️ Cache antigo removido:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Intercepta requisições - estratégia Cache First
self.addEventListener('fetch', (event) => {
    // Não cacheia requisições de áudio (Blob URLs)
    if (event.request.url.startsWith('blob:')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Retorna do cache se existir
            if (cachedResponse) {
                return cachedResponse;
            }
            // Busca da rede
            return fetch(event.request).then((response) => {
                // Não cacheia respostas de erro
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }
                // Clone e cacheia
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });
                return response;
            }).catch(() => {
                // Fallback offline
                return caches.match('/live-show-viver-de-som/');
            });
        })
    );
});