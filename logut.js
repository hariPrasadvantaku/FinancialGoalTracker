import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js";

// Your web app's Firebase configuration
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
const auth = getAuth(app); // Initialize auth here

document.addEventListener("DOMContentLoaded", function () {
    const logoutButton = document.getElementById("logout-button"); // Ensure this matches your HTML

    if (logoutButton) {
        logoutButton.addEventListener("click", function() {
            // Sign out from Firebase
            signOut(auth).then(() => {
                // Successfully logged out
                alert('Successfully logged out.');
                window.location.href = 'index.html'; // Redirect to index or login page
            }).catch((error) => {
                // An error occurred
                alert('Error logging out. Please try again.');
                console.error('Logout error:', error);
            });
        });
    } else {
        console.error("Logout button not found!");
    }
});
