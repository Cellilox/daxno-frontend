self.addEventListener('install', () => {
    // Skip over the "waiting" lifecycle state, to ensure that our
    // new service worker is activated immediately, even if there's
    // another tab open using the old service worker.
    self.skipWaiting();
});

self.addEventListener('activate', () => {
    // Optional: Get a list of all the current open windows/tabs under
    // our service worker's control, and force them to reload.
    // This can "reset" the open pages to a fresh state.
    self.clients.matchAll({ type: 'window' }).then(windowClients => {
        windowClients.forEach(windowClient => {
            windowClient.navigate(windowClient.url);
        });
    });

    // Unregister all service workers
    self.registration.unregister().then(function () {
        console.log('Service Worker unregistered.');
    });
});
