// Paste your Firebase config here
const firebaseConfig = {
  apiKey: "AIzaSyDmsWOiUTgaMg7VkIlIFMUBqqekb8p0ngg",
  authDomain: "user-database-f8129.firebaseapp.com",
  projectId: "user-database-f8129",
  storageBucket: "user-database-f8129.firebasestorage.app",
  messagingSenderId: "265686623860",
  appId: "1:265686623860:web:e79f6475783f428ca51321"

};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
