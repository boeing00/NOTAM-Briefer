/* Pilot Ops Center — offline app shell
   v3: 앱 셸(index.html)은 네트워크 우선(온라인이면 항상 최신, 오프라인이면 캐시)
       → 이후 index.html만 GitHub에 올려도 자동 반영, 캐시 버전 올릴 필요 없음
       CDN 자산(tailwind, pdf.js, fonts, firebase)은 캐시 우선(빠름+오프라인)
   v5: 2026-08-09 — "Add files via upload"(b08cb86, 7/17)가 실수로 이전 버전으로
       되돌리면서 생긴 두 가지 회귀를 수정:
       ① cdn.jsdelivr.net(pdf.js의 CMap·표준폰트 출처, PDFJS_DIST)이 캐시 대상
          CDN 화이트리스트에서 빠져있었음 — 매 PDF 파싱마다 CMap 파일을 매번
          네트워크로 새로 받아와야 했고, 기내 와이파이 등 불안정한 연결에서
          응답이 잘리면 pdf.js가 "Malformed CMap" 경고와 함께 한글/CJK 텍스트를
          조용히 깨뜨림(PILOT/JOINT 브리핑 일부 항목이 빈 채로 나오는 원인).
       ② 앱 셸 캐시 갱신 시 res.clone()을 return 이후 비동기 콜백 안에서 한 번 더
          호출해 "Response body is already used" 에러가 콘솔에 발생 — 캐시 쓰기가
          실제로 완료됐다는 보장도 없었음(e.waitUntil 누락). 두 복제본을 응답을
          내보내기 전에 동기적으로 미리 떠두고 e.waitUntil로 감싸도록 복원. */
const CACHE = 'pilot-ops-v5';

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
          // return res로 응답을 내보내기 전에 두 복제본을 미리 동기적으로 떠둔다
          // (비동기 콜백 안에서 res.clone()을 다시 부르면 그 사이 body가 이미
          // 소비되기 시작해 "Response body is already used" 에러가 남).
          const copyForReq = res.clone();
          const copyForRoot = res.clone();
          e.waitUntil(caches.open(CACHE).then((c) => Promise.all([
            c.put(e.request, copyForReq), c.put('./', copyForRoot)
          ])));
        }
        return res;
      }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || caches.match('./')))
    );
    return;
  }

  // ② CDN(tailwind, pdf.js/cmaps/표준폰트, fonts, firebase) 및 기타 정적 자산: 캐시 우선, 없으면 네트워크 후 저장
  e.respondWith(
    caches.match(e.request, { ignoreSearch: url.origin === location.origin }).then((hit) => {
      if (hit) return hit;
      return fetch(e.request).then((res) => {
        if (res && res.ok && (url.origin === location.origin ||
            /cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|unpkg\.com|cdn\.tailwindcss\.com|fonts\.(googleapis|gstatic)\.com|www\.gstatic\.com/.test(url.hostname))){
          const copy = res.clone();
          e.waitUntil(caches.open(CACHE).then((c) => c.put(e.request, copy)));
        }
        return res;
      }).catch(() => hit);
    })
  );
});
