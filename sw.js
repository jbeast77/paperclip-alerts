// Shows each alert. There is no server here: alerts arrive through the browser's push service, encrypted so only this phone can read them.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data.json(); } catch {}
  event.waitUntil(self.registration.showNotification(data.title || 'Paperclip needs you', {
    body: data.body || 'A decision is waiting. Answer it at your PC.',
    tag: data.tag || 'paperclip',
    renotify: true,
    requireInteraction: true,
    icon: 'icon-192.png',
    badge: 'badge-96.png',
    vibrate: [200, 100, 200],
    // Where a tap goes: the card's address when the alert carries one (set by the Paperclip server's alert program).
    data: { url: typeof data.url === 'string' ? data.url : null },
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification.data && event.notification.data.url;
  if (typeof target === 'string' && target.startsWith('https://')) { event.waitUntil(self.clients.openWindow(target)); return; }
  event.waitUntil((async () => {
    const open = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (open.length) { open[0].postMessage('alert'); return open[0].focus(); }
    return self.clients.openWindow('./?from=alert');
  })());
});
