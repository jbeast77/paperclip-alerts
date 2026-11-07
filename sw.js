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
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const open = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (open.length) { open[0].postMessage('alert'); return open[0].focus(); }
    return self.clients.openWindow('./?from=alert');
  })());
});
