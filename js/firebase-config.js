// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your web app's Firebase configuration
// REPLACE THE VALUES BELOW WITH YOUR OWN FROM THE FIREBASE CONSOLE
const firebaseConfig = {
    apiKey: "AIzaSyAOCj-cpR8fQpKmmIcxsmq4HJ_RJyXkYvo",
    authDomain: "sanjaybharadwaj-6041d.firebaseapp.com",
    projectId: "sanjaybharadwaj-6041d",
    storageBucket: "sanjaybharadwaj-6041d.firebasestorage.app",
    messagingSenderId: "902217076442",
    appId: "1:902217076442:web:5164c30e91b67a38891fe3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
