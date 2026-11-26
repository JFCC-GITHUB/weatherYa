/**
 * RetroWeather Service Worker
 * 功能：提供離線瀏覽支援並加速 App 啟動速度
 * 策略：同源檔案採「網路優先、失敗時用快取」，確保更新後能取得新版；
 *       跨網域請求（天氣 API、CDN、地圖）不攔截，直接交給瀏覽器。
 */

const CACHE_NAME = 'retroweather-pro-v3';
const ASSETS_TO_CACHE = [
  'RetroWeather.html',
  'manifest.json',
  'tailwind.css',
  'icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});
