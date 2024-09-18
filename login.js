import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDBNbDig8qwGQcGKrCEFNZCOy33mv8e96w",
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
