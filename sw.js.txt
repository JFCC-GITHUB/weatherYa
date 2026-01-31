/**
 * RetroWeather Service Worker
 * 功能：提供離線瀏覽支援並加速 App 啟動速度
 * 內容出處：參考 Google WebDev PWA Caching 策略 (Cache-First)
 */

const CACHE_NAME = 'retroweather-pro-v1';
const ASSETS_TO_CACHE = [
  'RetroWeather.html',
  'manifest.json',
  'icon-512.png'
];

// 安裝階段：將核心檔案存入快取
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// 激活階段：清理舊版快取
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// 攔截請求：優先使用快取內容，若無則連網抓取
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果在快取中找到，就直接回傳快取內容
        if (response) {
          return response;
        }
        // 否則進行網路請求
        return fetch(event.request);
      })
  );
});

