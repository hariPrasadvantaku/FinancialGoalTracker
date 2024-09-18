// import firebase from "https://www.gstatic.com/firebasejs/8.0.0/firebase-app.js";
// import "https://www.gstatic.com/firebasejs/8.0.0/firebase-firestore.js";

// Your Firebase configuration
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
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let editedTransaction = null;

// Get user ID from session storage
function getUserId() {
    const userId = sessionStorage.getItem("userId");
    console.log("Retrieved User ID from session storage:", userId);
    return userId;
}

// Load data from Firestore
function loadData() {
    console.log("Loading data...");
    const userId = getUserId();
    if (!userId) {
        console.error("User ID not found. Redirecting to login.");
        window.location.href = "index.html"; // Redirect to login if user is not authenticated
        return;
    }

    const transactionsRef = db.collection(`users/${userId}/transactions`);

    transactionsRef.onSnapshot((snapshot) => {
        const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Transactions loaded:", transactions);
        sessionStorage.setItem("transactions", JSON.stringify(transactions)); // Store transactions in sessionStorage
        updateTransactionTable(transactions);
        updateBalance(transactions);
    });
}

// Add a transaction
async function addTransaction() {
    console.log("Adding transaction...");
    const userId = getUserId();
    if (!userId) {
        console.error("User ID is not set. Cannot add transaction.");
        return;
    }

    const descriptionInput = document.getElementById("description");
    const amountInput = document.getElementById("amount");
    const typeInput = document.getElementById("type");
    const dateInput = document.getElementById("date");

    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const type = typeInput.value;
    const chosenDate = new Date(dateInput.value);

    if (description === "" || isNaN(amount) || isNaN(chosenDate.getTime())) {
        alert("Please fill in all fields correctly.");
        return;
    }

    const transaction = {
        amount,
        date: chosenDate, // Store as JavaScript Date
        description,
        type,
    };

    const transactionsRef = db.collection(`users/${userId}/transactions`);

    await transactionsRef.add(transaction);
    console.log("Transaction added:", transaction);

    // Update local transactions array and UI
    loadData();

    // Clear input fields
    descriptionInput.value = '';
    amountInput.value = '';
    dateInput.value = '';
}

// Delete a transaction
async function deleteTransaction(transactionId) {
    console.log("Deleting transaction...");
    const userId = getUserId();
    const transactionRef = db.collection(`users/${userId}/transactions`).doc(transactionId);

    await transactionRef.delete();
    console.log("Transaction deleted:", transactionId);

    // Reload data after deletion
    loadData();
}

// Edit a transaction
async function editTransaction(transactionId) {
    console.log("Editing transaction...");
    const userId = getUserId();
    const transactionRef = db.collection(`users/${userId}/transactions`).doc(transactionId);

    const transactionDoc = await transactionRef.get();
    const transaction = transactionDoc.data();

    if (transaction) {
        document.getElementById("description").value = transaction.description;
        document.getElementById("amount").value = transaction.amount;
        document.getElementById("type").value = transaction.type;
        document.getElementById("date").value = new Date(transaction.date.seconds * 1000).toISOString().split('T')[0];
        document.getElementById("save-transaction-btn").style.display = "inline";
        document.getElementById("add-transaction-btn").style.display = "none";
        editedTransaction = { id: transactionId, ...transaction };
    } else {
        console.warn("Transaction not found.");
    }
}

// Save edited transaction
async function saveTransaction() {
    console.log("Saving transaction...");
    if (editedTransaction) {
        const descriptionInput = document.getElementById("description");
        const amountInput = document.getElementById("amount");
        const typeInput = document.getElementById("type");
        const dateInput = document.getElementById("date");

        const description = descriptionInput.value.trim();
        const amount = parseFloat(amountInput.value);
        const type = typeInput.value;
        const chosenDate = new Date(dateInput.value);

        if (description === "" || isNaN(amount) || isNaN(chosenDate.getTime())) {
            alert("Please fill in all fields correctly.");
            return;
        }

        const updatedTransaction = {
            amount,
            date: chosenDate, // Store as JavaScript Date
            description,
            type,
        };

        const userId = getUserId();
        const transactionRef = db.collection(`users/${userId}/transactions`).doc(editedTransaction.id);

        await transactionRef.set(updatedTransaction);
        console.log("Transaction updated:", updatedTransaction);

        // Reset editedTransaction and UI
        editedTransaction = null;
        document.getElementById("description").value = '';
        document.getElementById("amount").value = '';
        document.getElementById("date").value = '';
        document.getElementById("save-transaction-btn").style.display = "none";
        document.getElementById("add-transaction-btn").style.display = "inline";

        // Reload data after saving
        loadData();
    } else {
        console.warn("No transaction selected for editing.");
    }
}

// Update the transaction table
function updateTransactionTable(transactions) {
    const tableBody = document.querySelector("#transaction-table tbody");
    tableBody.innerHTML = '';

    transactions.forEach(transaction => {
        const row = document.createElement("tr");
        const transactionDate = transaction.date instanceof Date ? transaction.date : new Date(transaction.date.seconds * 1000);
        row.innerHTML = `
            <td>${transactionDate.toLocaleDateString()}</td>
            <td>${transaction.description}</td>
            <td>${transaction.amount.toFixed(2)}</td>
            <td>${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</td>
            <td>
                <button class="edit-btn" data-id="${transaction.id}">Edit</button>
                <button class="delete-btn" data-id="${transaction.id}">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Reattach event listeners after updating the table
    document.querySelectorAll(".edit-btn").forEach(button => {
        button.addEventListener("click", (event) => {
            const id = event.target.dataset.id;
            editTransaction(id);
        });
    });

    document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", (event) => {
            const id = event.target.dataset.id;
            deleteTransaction(id);
        });
    });
}

// Update the balance
function updateBalance(transactions) {
    const balanceElement = document.getElementById("balance");
    const totalIncome = transactions
        .filter(transaction => transaction.type === 'income')
        .reduce((total, transaction) => total + transaction.amount, 0);

    const totalExpenses = transactions
        .filter(transaction => transaction.type === 'expense')
        .reduce((total, transaction) => total + transaction.amount, 0);

    const balance = totalIncome - totalExpenses;
    balanceElement.textContent = `Balance: ₹${balance.toFixed(2)}`; // Updated to INR (₹)
}

// Function to convert transactions to CSV format
function convertTransactionsToCSV(transactions) {
    const headers = ["Date", "Description", "Amount", "Type"];
    const csvRows = [headers.join(",")];

    transactions.forEach(transaction => {
        const row = [
            new Date(transaction.date.seconds * 1000).toLocaleDateString(), // Convert Firebase Timestamp to Date
            transaction.description,
            transaction.amount.toFixed(2),
            transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)
        ];
        csvRows.push(row.join(","));
    });

    return csvRows.join("\n");
}

// Function to trigger download of CSV file
function downloadCSV(csvData, filename) {
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Event listener for export button
document.getElementById("export-btn").addEventListener("click", function () {
    const transactions = JSON.parse(sessionStorage.getItem("transactions") || "[]"); // Assuming transactions are stored in sessionStorage
    const csvData = convertTransactionsToCSV(transactions);
    downloadCSV(csvData, 'transactions.csv');
});

// Event listeners
document.getElementById("add-transaction-btn").addEventListener("click", addTransaction);
document.getElementById("save-transaction-btn").addEventListener("click", saveTransaction);

// Load data when the page loads
document.addEventListener("DOMContentLoaded", loadData);
