// Keeps the app shell on the phone so it opens instantly and without signal. Data always comes live from Supabase.
const VERSION = 'ops-v6b';
const SHELL = ['./','index.html','style.css','app.js','config.js','manifest.webmanifest','icons/apple-touch-icon.png','icons/icon-192.png',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/dist/umd/supabase.min.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.hostname.endsWith('supabase.co')) return;
  // Network first for the app's own files so updates arrive; cache when offline.
  e.respondWith(fetch(e.request).then(res => {
    if (res.ok && (url.origin === location.origin || url.hostname === 'cdn.jsdelivr.net' || url.hostname.endsWith('gstatic.com') || url.hostname.endsWith('googleapis.com'))) {
      const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy));
    }
    return res;
  }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});
