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
