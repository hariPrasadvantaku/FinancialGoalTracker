import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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

// Signup form submission handler
document.getElementById('signup-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.querySelector('input[name="name"]').value.trim();
    const email = document.querySelector('input[name="email"]').value.trim();
    const password = document.querySelector('input[name="password"]').value;
    // const confirmPassword = document.querySelector('input[name="confirm_password"]').value;
    // const phoneNumber = document.querySelector('input[name="phoneNumber"]').value.trim();

    // Input validation
    if (!name || !email || !password) {
        alert("All fields are required.");
        return;
    }

    if (!validateEmail(email)) {
        alert("Invalid email format.");
        return;
    }

    // Password constraints
    const passwordMinLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < passwordMinLength) {
        alert(`Password must be at least ${passwordMinLength} characters long.`);
        return;
    }

    if (!hasUppercase) {
        alert("Password must contain at least one uppercase letter.");
        return;
    }

    if (!hasLowercase) {
        alert("Password must contain at least one lowercase letter.");
        return;
    }

    if (!hasNumber) {
        alert("Password must contain at least one digit.");
        return;
    }

    if (!hasSpecialChar) {
        alert("Password must contain at least one special character.");
        return;
    }

    // `if (password !== confirmPassword) {
    //     alert("Passwords do not match!");
    //     return;
    // }`

    try {
        // Create user with Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store additional user data in Firestore
        await setDoc(doc(db, "users", user.uid), {
            name: name,
            email: email,
            // phoneNumber: phoneNumber,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        alert("Signup successful!");
        window.location.href = "index.html";
    } catch (error) {
        console.error("Error signing up:", error.message);
        alert("Error: " + error.message);
    }
});

// Helper function to validate email format
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}
