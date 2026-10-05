// Keeps the app shell on the phone so it opens instantly and without signal. Data always comes live from Supabase.
const VERSION = 'ops-preview-v18';
const SHELL = ['./','index.html','style.css','app.js','config.js','manifest.webmanifest','icons/apple-touch-icon.png','icons/icon-192.png',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/dist/umd/supabase.min.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.hostname.endsWith('supabase.co')) return;
  // Network first for the app's own files so updates arrive; cache when offline. 'no-cache' makes the browser
  // check GitHub for a newer file instead of reusing its own copy (GitHub lets it keep one for 10 minutes).
  const req = url.origin === location.origin ? new Request(e.request.url, {cache:'no-cache', credentials:'same-origin'}) : e.request;
  e.respondWith(fetch(req).then(res => {
    if (res.ok && (url.origin === location.origin || url.hostname === 'cdn.jsdelivr.net' || url.hostname.endsWith('gstatic.com') || url.hostname.endsWith('googleapis.com'))) {
      const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy));
    }
    return res;
  }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});

// Push: show the notification, keep at most 5 on screen (oldest go first), and open the right screen on tap.
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data.json(); } catch { d = {title:'Operations', body:e.data ? e.data.text() : ''}; }
  e.waitUntil((async () => {
    await self.registration.showNotification(d.title || 'Operations', {
      body: d.body || '', icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: d.tag || ('ops-' + Date.now()), data: {url: d.url || '#'}
    });
    const shown = await self.registration.getNotifications();
    shown.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)).slice(0, Math.max(0, shown.length - 5)).forEach(n => n.close());
  })());
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const target = self.registration.scope + (e.notification.data?.url || '');
  e.waitUntil(self.clients.matchAll({type:'window', includeUncontrolled:true}).then(list => {
    for (const c of list) if ('focus' in c) { if ('navigate' in c) c.navigate(target).catch(()=>{}); return c.focus(); }
    return self.clients.openWindow(target);
  }));
});
