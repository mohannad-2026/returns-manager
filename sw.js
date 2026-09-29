/* نظام المرتجعات — عامل الخدمة
   الإنترنت أولاً دايماً (عشان أي تحديث ترفعه يوصل فوراً)، ولو النت فاصل يفتح آخر نسخة محفوظة على الجهاز.
   البيانات نفسها مش بتعدّي من هنا — بتروح على السيرفر مباشرة. */
const CACHE = 'rm-shell-v1';
const SHELL = ['/', '/manifest.json', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // Firebase, fonts, libraries: untouched
  e.respondWith(
    fetch(req).then(res => {
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req.mode === 'navigate' ? '/' : req, copy));
      }
      return res;
    }).catch(() =>
      caches.match(req.mode === 'navigate' ? '/' : req).then(r => r || caches.match('/'))
    )
  );
});
