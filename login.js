// fetch from https://dummyjson.com/users for dummy data
async function fetchUsers() {
    try {
        const response = await fetch('https://dummyjson.com/users');
        const data = await response.json();
        return data.users;
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}

function checkUserExists(users, username, password) {
    return users.some(user => user.username === username && user.password === password);
}

function getUserData(users, username, password) {
    return users.find(user => user.username === username && user.password === password);
}

function toggleLoadingIndicator(show) {
    const loadingIndicator = document.querySelector('.loading');
    if (show) {
        loadingIndicator.classList.remove('hidden');
    } else {
        loadingIndicator.classList.add('hidden');
    }
}

var userData = [];
const loginForm = document.getElementById('login-form');

// Fetch users when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {

    // check if user data is already stored in localStorage
    const storedUserData = localStorage.getItem('firstName');
    if (storedUserData) {
        alert('Anda sudah login!');
        window.location.href = 'index.html';
        return;
    }

    // toggleLoadingIndicator(true);
    fetchUsers().then(users => {
        if (users.length === 0) {
            alert('Gagal mengambil data user.');
            return;
        }

        userData = users;
        // toggleLoadingIndicator(false);
    });
});


loginForm.addEventListener('submit', function (event) {
    event.preventDefault();

    toggleLoadingIndicator(true);

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    console.log('Username:', username);
    console.log('Password:', password);

    const user = getUserData(userData, username, password);
    if (user) {
        localStorage.setItem('firstName', user.firstName);
        localStorage.setItem('lastName', user.lastName);
        localStorage.setItem('email', user.email);
        alert('Login successful!');
    } else {
        alert('Invalid username or password.');
    }

    toggleLoadingIndicator(false);

    window.location.href = 'index.html';
});