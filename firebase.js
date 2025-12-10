// firebase.js content (Global Style - Matches your login/dashboard code)

// Your web app's Firebase configuration (using const/var for global scope)
const firebaseConfig = {
    // NOTE: I am using the API Key from your screenshot. Ensure this is correct.
    apiKey: "AIzaSyCARoTyrO8zuIh0A1oPG6tMpesn_lR9S3U",
    authDomain: "user-database-f8129.firebaseapp.com",
    projectId: "user-database-f8129",
    storageBucket: "user-database-f8129.firebasestorage.app",
    messagingSenderId: "265686623860",
    appId: "1:265686623860:web:7025d13e3ec82bd0a51321"
};

// Initialize Firebase using the global 'firebase' object (which is defined by the SDK links in your HTML)
firebase.initializeApp(firebaseConfig);

// Define global service objects accessible by your login/dashboard functions
const auth = firebase.auth();
const db = firebase.firestore();
