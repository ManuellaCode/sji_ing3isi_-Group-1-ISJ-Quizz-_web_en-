// Select tabs and forms
const createAccountForm = document.getElementById('createAccountForm');
const loginForm = document.getElementById('loginForm');

// Handle "Create Account" form submission
createAccountForm.addEventListener('submit', (event) => {
    event.preventDefault();
    alert('Account created successfully! Redirecting to the quiz game...');
    window.location.href = 'Home.html'; // Replace with your quiz game path
});

// Handle "Log In" form submission
loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    alert('Login successful! Redirecting to the quiz game...');
    window.location.href = 'Home.html'; // Replace with your quiz game path
});
