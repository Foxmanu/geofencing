import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

// TODO: Replace these with your actual Firebase project config values
const firebaseConfig = {
    apiKey: "AIzaSyCMIRukNkEeUTr0m5BMdRQu-OyhehoVBzI",
    authDomain: "geofecning-24f26.firebaseapp.com",
    projectId: "geofecning-24f26",
    storageBucket: "geofecning-24f26.firebasestorage.app",
    messagingSenderId: "388291811127",
    appId: "1:388291811127:web:3187c01f861546742cecb2",
    measurementId: "G-NNWRZ6MYNM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
export const messaging = getMessaging(app);
