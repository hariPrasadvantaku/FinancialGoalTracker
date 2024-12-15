import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBoy7ROcgrk6-Rb0L20DehdQD_4k09K7xc",
    authDomain: "goaltracker-76.firebaseapp.com",
    projectId: "goaltracker-76",
    storageBucket: "goaltracker-76.appspot.com",
    messagingSenderId: "910571995639",
    appId: "1:910571995639:web:7dca0fd37eea22ee55aef2",
    measurementId: "G-E6QZ0FG1NY"
  };
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Login form submission handler
document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.querySelector('input[name="email"]').value.trim();
    const password = document.querySelector('input[name="password"]').value;

    if (!email || !password) {
        alert("Both fields are required.");
        return;
    }

    try {
        // Sign in with Firebase Authentication
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Fetch additional user data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            alert("Login successful!");
            sessionStorage.setItem("userId", user.uid);
            window.location.href = "goal.html";
        } else {
            alert("User data not found.");
        }
    } catch (error) {
        console.error("Error logging in:", error.message);
        alert("Error: " + error.message);
    }
});
