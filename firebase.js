// firebase.js content (Global Style - Matches your login/dashboard code)

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBv0Z-xF1-M3Hfe078dT6tpOj096IusQWU",
    authDomain: "accounts-database-5b52b.firebaseapp.com",
    projectId: "accounts-database-5b52b",
    storageBucket: "accounts-database-5b52b.appspot.com",
    messagingSenderId: "889753057532",
    appId: "1:889753057532:web:531b7a357dc4e9aa93bf79"
};

// Initialize Firebase using the global 'firebase' object (defined by SDK links in your HTML)
firebase.initializeApp(firebaseConfig);

// Define global service objects accessible by your login/dashboard functions
const auth = firebase.auth();
const db = firebase.firestore();


