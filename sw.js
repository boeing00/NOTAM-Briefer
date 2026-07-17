/* Pilot Ops Center — offline app shell
   v3: 앱 셸(index.html)은 네트워크 우선(온라인이면 항상 최신, 오프라인이면 캐시)
       → 이후 index.html만 GitHub에 올려도 자동 반영, 캐시 버전 올릴 필요 없음
       CDN 자산(tailwind, pdf.js, fonts, firebase)은 캐시 우선(빠름+오프라인) */
const CACHE = 'pilot-ops-v3';

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

  // ① 앱 셸(HTML 탐색 요청): 네트워크 우선 → 성공 시 캐시 갱신, 실패(오프라인) 시 캐시
  const isShell = e.request.mode === 'navigate' ||
                  (url.origin === location.origin && (url.pathname.endsWith('/') || url.pathname.endsWith('.html')));
  if (isShell){
    e.respondWith(
      fetch(e.request).then((res) => {
        if (res && res.ok){
          const copy = res.clone();
          caches.open(CACHE).then((c) => { c.put(e.request, copy); c.put('./', res.clone()); });
        }
        return res;
      }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || caches.match('./')))
    );
    return;
  }

  // ② CDN(tailwind, pdf.js, fonts, firebase) 및 기타 정적 자산: 캐시 우선, 없으면 네트워크 후 저장
  e.respondWith(
    caches.match(e.request, { ignoreSearch: url.origin === location.origin }).then((hit) => {
      if (hit) return hit;
      return fetch(e.request).then((res) => {
        if (res && res.ok && (url.origin === location.origin ||
            /cdnjs\.cloudflare\.com|cdn\.tailwindcss\.com|fonts\.(googleapis|gstatic)\.com|www\.gstatic\.com/.test(url.hostname))){
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      }).catch(() => hit);
    })
  );
});
