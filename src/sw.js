// Service Worker for "In the margins" - Web Push Notifications & Offline Shell
const CACHE_NAME = 'margins-cache-v1';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Push notification listener
self.addEventListener('push', event => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { body: event.data.text() };
    }
  }

  const title = data.title || 'In the margins';
  const options = {
    body: data.body || 'A new page has been published in the journal.',
    icon: data.icon || './assets/icon-192.png',
    badge: data.badge || './assets/icon-192.png',
    tag: data.tag || 'margins-entry',
    renotify: true,
    data: {
      url: data.url || data.link || './'
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click listener: focuses tab if already open, or opens new window
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || './', self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
