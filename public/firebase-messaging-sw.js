importScripts('https://www.gstatic.com/firebasejs/10.11.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.11.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyCMIRukNkEeUTr0m5BMdRQu-OyhehoVBzI",
    authDomain: "geofecning-24f26.firebaseapp.com",
    projectId: "geofecning-24f26",
    storageBucket: "geofecning-24f26.firebasestorage.app",
    messagingSenderId: "388291811127",
    appId: "1:388291811127:web:3187c01f861546742cecb2",
    measurementId: "G-NNWRZ6MYNM"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification?.title || 'Notification';
    const notificationOptions = {
        body: payload.notification?.body,
        icon: '/vite.svg'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('message', (event) => {
    if (!event.data || event.data.type !== 'BACKGROUND_LOCATION') return;

    const { latitude, longitude, userId } = event.data.payload;
    if (!userId || latitude == null || longitude == null) return;

    console.log('[firebase-messaging-sw.js] Background location message:', latitude, longitude, userId);

    fetch(`https://e43c-2406-7400-10a-1b0b-89f3-eee4-9595-57c.ngrok-free.app/api/auth/location/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ latitude, longitude })
    }).then((response) => {
        if (!response.ok) {
            console.warn('Background location sync failed');
        }
    }).catch((err) => {
        console.error('Background location sync error:', err);
    });
});

self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'location-sync') {
        event.waitUntil(
            self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then((clients) => {
                if (!clients.length) return;
                // Send a ping message to the visible client tab for it to post location data.
                clients.forEach(client => {
                    client.postMessage({ type: 'REQUEST_LOCATION_UPDATE' });
                });
            })
        );
    }
});
