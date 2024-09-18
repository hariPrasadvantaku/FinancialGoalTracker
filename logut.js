import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js";

// Your web app's Firebase configuration
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

document.addEventListener("DOMContentLoaded", function () {
    document
        .getElementById("logout-btn")
        .addEventListener("click", logout);
});

function logout() {
    signOut(auth).then(() => {
        // Clear all relevant local storage data
        const userId = auth.currentUser ? auth.currentUser.uid : null;
        if (userId) {
            localStorage.removeItem(`transactions_${userId}`);
            localStorage.removeItem(`monthlyIncome_${userId}`);
        }
        
        // Clear other data if necessary
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('editedTransaction');

        // Redirect to login page
        window.location.href = "login.html"; 
    }).catch((error) => {
        console.error("Sign out error:", error.message);
    });
}
    
