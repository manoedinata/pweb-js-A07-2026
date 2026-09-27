const logoutButton = document.getElementById('logout-button');

logoutButton.addEventListener('click', function () {
    // Clear user data from localStorage
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    localStorage.removeItem('email');

    // Redirect to login page
    window.location.href = 'login.html';
});