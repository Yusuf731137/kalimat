/* =========================================================
   sw.js — Service Worker لكلماتي
   =========================================================
   ⚠️ عند كل تحديث للعبة:
      غيّر رقم CACHE_NAME (مثلاً: kalimati-v1 → kalimati-v2)
      وارفع هذا الملف مع index.html الجديد.
   ========================================================= */

const CACHE_NAME = 'kalimati-v1'; // 🔴 غيّر هذا الرقم مع كل تحديث

// تثبيت: نبقى في مرحلة waiting حتى يوافق المستخدم
self.addEventListener('install', (event) => {
  // لا نستدعي skipWaiting هنا — ننتظر إشارة من الصفحة
});

// تفعيل: نظّف الكاش القديم ثم سيطر على الصفحات المفتوحة
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// استقبال إشارة "skipWaiting" من الصفحة
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// إستراتيجية الجلب: الشبكة أولًا، والكاش احتياطًا
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(res => {
        // لا نخزّن إلا الاستجابات الناجحة
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});