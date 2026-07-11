/* Pilot Ops Center — offline app shell (cache-first for same-origin + CDN assets) */
const CACHE = 'pilot-ops-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./'])));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // API 호출은 캐시하지 않음(항상 네트워크)
  if (url.hostname.endsWith('googleapis.com')) return;
  if (e.request.method !== 'GET') return;

  // 앱 셸 + CDN(tailwind, pdf.js, fonts)은 캐시 우선, 없으면 네트워크 후 캐시에 저장
  e.respondWith(
    caches.match(e.request, { ignoreSearch: url.origin === location.origin }).then((hit) => {
      if (hit) return hit;
      return fetch(e.request).then((res) => {
        if (res && res.ok && (url.origin === location.origin ||
            /cdnjs\.cloudflare\.com|cdn\.tailwindcss\.com|fonts\.(googleapis|gstatic)\.com/.test(url.hostname))){
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      }).catch(() => hit);
    })
  );
});
