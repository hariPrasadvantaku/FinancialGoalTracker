// Your Firebase configuration
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
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

let editedTransaction = null;

auth.onAuthStateChanged((user) => {
    if (!user) {
        // User is not signed in, redirect to login or home page
        window.location.href = 'index.html';
    }
});

// Get user ID from session storage
function getUserId() {
    const userId = sessionStorage.getItem("userId");
    return userId;
}

// Load data from Firestore
function loadData() {
    const userId = getUserId();
    if (!userId) {
        window.location.href = "index.html";
        return;
    }

    const transactionsRef = db.collection(`users/${userId}/transactions`);

    transactionsRef.onSnapshot((snapshot) => {
        const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        sessionStorage.setItem("transactions", JSON.stringify(transactions));
        updateTransactionTable(transactions);
        updateBalance(transactions);
    });
}

// Add a transaction
async function addTransaction() {
    const userId = getUserId();
    if (!userId) return;

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
        date: chosenDate,
        description,
        type,
    };

    const transactionsRef = db.collection(`users/${userId}/transactions`);

    await transactionsRef.add(transaction);
    loadData();

    descriptionInput.value = '';
    amountInput.value = '';
    dateInput.value = '';
}

// Delete a transaction
async function deleteTransaction(transactionId) {
    const userId = getUserId();
    const transactionRef = db.collection(`users/${userId}/transactions`).doc(transactionId);

    await transactionRef.delete();
    loadData();
}

// Edit a transaction
async function editTransaction(transactionId) {
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
    }
}

// Save edited transaction
async function saveTransaction() {
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
            date: chosenDate,
            description,
            type,
        };

        const userId = getUserId();
        const transactionRef = db.collection(`users/${userId}/transactions`).doc(editedTransaction.id);

        await transactionRef.set(updatedTransaction);

        editedTransaction = null;
        document.getElementById("description").value = '';
        document.getElementById("amount").value = '';
        document.getElementById("date").value = '';
        document.getElementById("save-transaction-btn").style.display = "none";
        document.getElementById("add-transaction-btn").style.display = "inline";

        loadData();
    }
}

// Update the transaction table
function updateTransactionTable(transactions) {
    const tableBody = document.querySelector("#transaction-table tbody");

    if (!tableBody) return;

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
                <button class="edit-btn btn btn-sm btn-edit" data-id="${transaction.id}">Edit</button>
                <button class="delete-btn btn btn-sm btn-delete" data-id="${transaction.id}">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

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
    balanceElement.textContent = `Balance: ₹${balance.toFixed(2)}`;
}

// Function to trigger download of CSV file
function downloadCSV(csvData, filename) {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        // Create a download link
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Export transactions to CSV
function exportToCSV() {
    const transactions = JSON.parse(sessionStorage.getItem("transactions"));

    if (!transactions || transactions.length === 0) {
        alert("No transactions to export.");
        return;
    }

    // Generate the CSV data
    const csvData = convertTransactionsToCSV(transactions);

    // Append total income, total expenses, and balance at the end of the CSV
    const totalIncome = transactions
        .filter(transaction => transaction.type === 'income')
        .reduce((total, transaction) => total + transaction.amount, 0);

    const totalExpenses = transactions
        .filter(transaction => transaction.type === 'expense')
        .reduce((total, transaction) => total + transaction.amount, 0);

    const balance = totalIncome - totalExpenses;

    const summary = `\nTotal Income,₹${totalIncome.toFixed(2)}\nTotal Expenses,₹${totalExpenses.toFixed(2)}\nRemaining Balance,₹${balance.toFixed(2)}`;
    const finalCSVData = `${csvData}${summary}`;

    downloadCSV(finalCSVData, 'transactions.csv');
}

// Event listeners for buttons
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById("add-transaction-btn").addEventListener("click", addTransaction);
    document.getElementById("save-transaction-btn").addEventListener("click", saveTransaction);
    document.getElementById("export-csv-btn").addEventListener("click", exportToCSV);

    // Load initial data
    loadData();
});

// Helper function to convert transactions to CSV format
function convertTransactionsToCSV(transactions) {
    const headers = ['Date', 'Description', 'Amount', 'Type'];
    const rows = transactions.map(transaction => {
        const date = new Date(transaction.date.seconds * 1000).toLocaleDateString();
        return [date, transaction.description, transaction.amount.toFixed(2), transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
}
