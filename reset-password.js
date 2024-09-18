import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "IzaSyDBNbDig8qwGQcGKrCEFNZCOy33mv8e96w",
    authDomain: "goaltracker-012.firebaseapp.com",
    projectId: "goaltracker-012",
    storageBucket: "goaltracker-012.appspot.com",
    messagingSenderId: "205987460323",
    appId: "1:205987460323:web:e0ff2955c8b247fe1201d6",
    measurementId: "G-2G8ZE80Z3B"
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
