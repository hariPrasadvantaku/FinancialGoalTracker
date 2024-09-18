import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-firestore.js";
import { Chart, registerables } from "https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.esm.js";

Chart.register(...registerables);


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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Event listener for DOM content loaded
document.addEventListener("DOMContentLoaded", () => {
    const userId = sessionStorage.getItem("userId");
    
    if (userId) {
        console.log(`User ID from session: ${userId}`);

        // Load user details and transactions
        loadUserDetails(userId);
        loadTransactions(userId);

        document.getElementById("update-income-btn").addEventListener("click", () => updateMonthlyIncome(userId));
    } else {
        window.location.href = "login.html";
    }
});

// Function to load user details
async function loadUserDetails(userId) {
    try {
        const userRef = doc(db, `users/${userId}`);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
            const userData = docSnap.data();
            console.log("User data fetched:", userData);

            const userName = userData.name || 'N/A';
            const userEmail = userData.email || 'N/A';
            const monthlyIncome = (userData.monthlyIncome || 0).toFixed(2);

            document.getElementById('user-name').textContent = `Name: ${userName}`;
            document.getElementById('user-email').textContent = `Email: ${userEmail}`;
            document.getElementById('monthly-income-display').textContent = `₹${monthlyIncome}`;
        } else {
            console.error("User document does not exist.");
            clearDashboardData();
        }
    } catch (error) {
        console.error("Error fetching user details:", error);
        clearDashboardData();
    }
}

// Function to load transactions
async function loadTransactions(userId) {
    try {
        const transactionsRef = collection(db, `users/${userId}/transactions`);
        const querySnapshot = await getDocs(transactionsRef);

        if (!querySnapshot.empty) {
            const transactions = querySnapshot.docs.map(doc => doc.data());

            console.log(`Number of transactions found: ${transactions.length}`);

            if (transactions.length === 0) {
                console.warn("No transactions found for the user.");
                clearDashboardData();
            } else {
                const formattedTransactions = transactions.map(transaction => {
                    let transactionDate;
                    if (transaction.date && transaction.date.seconds) {
                        transactionDate = new Date(transaction.date.seconds * 1000);
                    } else {
                        transactionDate = new Date(transaction.date || Date.now());
                    }

                    return {
                        amount: transaction.amount || 0,
                        type: transaction.type || "expense",
                        date: transactionDate,
                        description: transaction.description || ""
                    };
                });

                updateBalance(userId, formattedTransactions);
                createCharts(formattedTransactions);
            }
        } else {
            console.error("No transactions found for the user.");
            clearDashboardData();
        }
    } catch (error) {
        console.error("Error fetching transactions:", error);
    }
}

// Function to update monthly income
async function updateMonthlyIncome(userId) {
    const newIncome = prompt("Enter new monthly income:");
    if (newIncome && !isNaN(newIncome)) {
        const incomeValue = parseFloat(newIncome);
        try {
            const userRef = doc(db, `users/${userId}`);
            await updateDoc(userRef, { monthlyIncome: incomeValue });
            document.getElementById('monthly-income-display').textContent = `₹${incomeValue.toFixed(2)}`;
            loadTransactions(userId);
        } catch (error) {
            console.error("Error updating income:", error);
            alert("Failed to update income. Please try again.");
        }
    } else {
        alert("Please enter a valid number.");
    }
}

// Function to update balance
async function updateBalance(userId, transactions) {
    try {
        const userRef = doc(db, `users/${userId}`);
        const docSnap = await getDoc(userRef);
        const userData = docSnap.data() || {};
        const monthlyIncome = userData.monthlyIncome || 0;

        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach((transaction) => {
            if (transaction.type === "income") {
                totalIncome += transaction.amount;
            } else if (transaction.type === "expense") {
                totalExpense += transaction.amount;
            }
        });

        const remainingBalance = monthlyIncome + (totalIncome - totalExpense);
        const balanceElement = document.getElementById("balance");
        balanceElement.textContent = `₹${remainingBalance.toFixed(2)}`;
        balanceElement.style.color = remainingBalance >= 0 ? 'green' : 'red';
    } catch (error) {
        console.error("Error fetching user data for balance update:", error);
    }
}

// Function to create charts
function createCharts(transactions) {
    createBarChart(transactions);
    createPieChart(transactions);
}

// Function to create bar chart
function createBarChart(transactions) {
    const ctx = document.getElementById("income-expense-chart").getContext("2d");
    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
        existingChart.destroy();
    }

    const labels = [];
    const incomeData = [];
    const expenseData = [];

    transactions.forEach((transaction) => {
        const date = new Date(transaction.date).toLocaleDateString();
        const label = `${date} - ${transaction.description}`;

        if (!labels.includes(label)) {
            labels.push(label);
            incomeData.push(0);
            expenseData.push(0);
        }

        const index = labels.indexOf(label);
        if (transaction.type === "income") {
            incomeData[index] += transaction.amount;
        } else if (transaction.type === "expense") {
            expenseData[index] += transaction.amount;
        }
    });

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Income",
                    data: incomeData,
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1
                },
                {
                    label: "Expense",
                    data: expenseData,
                    backgroundColor: "rgba(255, 99, 132, 0.2)",
                    borderColor: "rgba(255, 99, 132, 1)",
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                x: {
                    beginAtZero: true,
                    grid: {
                        color: "rgba(200, 200, 200, 0.2)"
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: "rgba(200, 200, 200, 0.2)"
                    }
                }
            }
        }
    });
}

// Function to create pie chart
function createPieChart(transactions) {
    const ctx = document.getElementById("balance-overview-chart").getContext("2d");
    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
        existingChart.destroy();
    }

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((transaction) => {
        if (transaction.type === "income") {
            totalIncome += transaction.amount;
        } else if (transaction.type === "expense") {
            totalExpense += transaction.amount;
        }
    });

    new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Income", "Expenses"],
            datasets: [{
                label: "Balance Overview",
                data: [totalIncome, totalExpense],
                backgroundColor: [
                    "rgba(75, 192, 192, 0.2)",
                    "rgba(255, 99, 132, 0.2)"
                ],
                borderColor: [
                    "rgba(75, 192, 192, 1)",
                    "rgba(255, 99, 132, 1)"
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "top"
                },
                tooltip: {
                    callbacks: {
                        label: (tooltipItem) => {
                            return `${tooltipItem.label}: ₹${tooltipItem.raw.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
}

// Function to clear dashboard data
function clearDashboardData() {
    document.getElementById('user-name').textContent = 'Name: N/A';
    document.getElementById('user-email').textContent = 'Email: N/A';
    document.getElementById('monthly-income-display').textContent = '₹0.00';
    
    const balanceElement = document.getElementById('balance');
    balanceElement.textContent = '₹0.00';
    balanceElement.style.color = 'black';

    const incomeExpenseChartCtx = document.getElementById("income-expense-chart").getContext("2d");
    const balanceOverviewChartCtx = document.getElementById("balance-overview-chart").getContext("2d");
    const existingIncomeExpenseChart = Chart.getChart(incomeExpenseChartCtx);
    const existingBalanceOverviewChart = Chart.getChart(balanceOverviewChartCtx);
    
    if (existingIncomeExpenseChart) {
        existingIncomeExpenseChart.destroy();
    }
    if (existingBalanceOverviewChart) {
        existingBalanceOverviewChart.destroy();
    }
}
