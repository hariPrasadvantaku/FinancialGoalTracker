import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

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

// Forgot password form submission handler
document.getElementById('forgot-password-form').addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent the default form submission

    const email = document.getElementById('email').value.trim();

    if (!email) {
        document.getElementById('message').textContent = "Please enter your email.";
        return;
    }

    try {
        await sendPasswordResetEmail(auth, email);
        document.getElementById('message').style.color = 'green';
        document.getElementById('message').textContent = "Password reset email sent!";
    } catch (error) {
        console.error("Error resetting password:", error.message);
        document.getElementById('message').textContent = "Error: " + error.message;
    }
});
