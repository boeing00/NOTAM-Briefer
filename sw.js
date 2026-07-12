/* Pilot Ops Center — offline app shell
   - 같은 출처(앱 셸): 네트워크 우선 → 새 배포가 즉시 반영, 오프라인이면 캐시 사용
   - CDN(pdf.js, fonts): 캐시 우선, no-cors(opaque) 응답도 저장
   - Gemini API: 캐시하지 않음(항상 네트워크) */
const CACHE = 'pilot-ops-v6';
const CDN_RE = /(^|\.)cdnjs\.cloudflare\.com$|(^|\.)cdn\.jsdelivr\.net$|(^|\.)unpkg\.com$|(^|\.)fonts\.googleapis\.com$|(^|\.)fonts\.gstatic\.com$/;
const SHELL = ['./', './index.html', './notam.html', './IntegratedFlightBriefer.html'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // Gemini API 호출은 캐시하지 않음(항상 네트워크)
  if (url.hostname === 'generativelanguage.googleapis.com') return;

  const sameOrigin = url.origin === location.origin;
  if (sameOrigin){
    // 앱 셸: 네트워크 우선 + 캐시 갱신, 오프라인이면 캐시(없으면 './' 또는 './index.html')
    e.respondWith(
      fetch(e.request).then((res) => {
        if (res && res.ok){
          const copy = res.clone();
          e.waitUntil(caches.open(CACHE).then((c) => c.put(e.request, copy)));
        }
        return res;
      }).catch(() =>
        caches.match(e.request, { ignoreSearch: true })
          .then((hit) => hit
            || (e.request.mode === 'navigate'
              ? caches.match('./').then((h) => h || caches.match('./index.html'))
              : Response.error()))
      )
    );
    return;
  }

  if (!CDN_RE.test(url.hostname)) return;
  // CDN 자산: 캐시 우선, 없으면 네트워크 후 저장 (script/link 등 no-cors 요청은 opaque라 res.ok가 false여도 저장)
  e.respondWith(
    caches.match(e.request).then((hit) => {
      if (hit) return hit;
      return fetch(e.request).then((res) => {
        if (res && (res.ok || res.type === 'opaque')){
          const copy = res.clone();
          e.waitUntil(caches.open(CACHE).then((c) => c.put(e.request, copy)));
        }
        return res;
      }).catch(() => hit || Response.error());
    })
  );
});
