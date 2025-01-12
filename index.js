// Utility functions
function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

// Password validation function
function validatePassword(password) {
  const minLength = 8;
  const regexUpperCase = /[A-Z]/;
  const regexLowerCase = /[a-z]/;
  const regexNumber = /[0-9]/;
  const regexSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

  let errors = [];
  if (password.length < minLength) errors.push("At least 8 characters.");
  if (!regexUpperCase.test(password)) errors.push("At least one uppercase letter.");
  if (!regexLowerCase.test(password)) errors.push("At least one lowercase letter.");
  if (!regexNumber.test(password)) errors.push("At least one number.");
  if (!regexSpecialChar.test(password)) errors.push("At least one special character.");

  return errors;
}

// Function to display password validation feedback
function showPasswordFeedback(errors) {
  const feedbackElement = document.getElementById("passwordFeedback");
  if (errors.length > 0) {
    feedbackElement.innerHTML = `<ul class="text-danger">${errors.map(error => `<li>${error}</li>`).join("")}</ul>`;
  } else {
    feedbackElement.innerHTML = `<span class="text-success">Password is strong!</span>`;
  }
}

// Function to handle sign-up
document.getElementById("createAccountForm")?.addEventListener("submit", (event) => {
  event.preventDefault(); // Prevent form from reloading the page

    const username = document.getElementById("createUsername").value.trim();
    const password = document.getElementById("createPassword").value.trim();

    if (!username || !password) {
      alert("Please fill in all fields.");
      return;
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      showPasswordFeedback(passwordErrors);
      return;
    }

    const users = getUsers();
    const existingUser = users.find(user => user.username === username);

    if (existingUser) {
      alert("Username already exists. Please choose a different username.");
      return;
    }

    const user = {
      username: username,
      password: password,
      level: "Mougou",
      category: "Music",
      gamesHistory: []
    };
    // Save user information in local storage
    users.push(user);
    saveUsers(users);

    alert("Account created successfully!");

  //save the player info to be used later
  localStorage.setItem("player", JSON.stringify(user));
    window.location.href = "./categories.html"; // Redirect to login page
  });

  // Function to handle login
  document.getElementById("loginForm")?.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent the form from reloading the page

    const username = document.getElementById("Username").value.trim();
    const password = document.getElementById("Password").value.trim();
    const loginError = document.getElementById("loginError");

    // Clear any previous error message
    loginError.style.display = "none";

  // Validate input
  if (!username || !password) {
    loginError.textContent = "Please fill in all fields.";
    loginError.style.display = "block";
    return;
  }

  // Retrieve users from local storage
  const users = JSON.parse(localStorage.getItem("users")) || [];

  // Check if the user exists and the password matches
  const user = users.find(user => user.username === username && user.password === password);

  if (!user) {
    loginError.textContent = "Invalid username or password. Please try again.";
    loginError.style.display = "block";
    return;
  }

  if (document.getElementById("rememberMe").checked) {
    localStorage.setItem("rememberedUsername", username);
  } else {
    localStorage.removeItem("rememberedUsername");
  }

  // Handle successful login
  localStorage.setItem("player", JSON.stringify(user));
  alert("Login successful!");
  window.location.href = "./Categories.html"; // Redirect to the dashboard or homepage
});



document.addEventListener("DOMContentLoaded", () => {
  const rememberedUsername = localStorage.getItem("rememberedUsername");
  if (rememberedUsername) {
    document.getElementById("Username").value = rememberedUsername;
    document.getElementById("rememberMe").checked = true;
  }
  });

  // Function to auto-fill login form if user info is remembered
document.addEventListener("DOMContentLoaded", () => {
    const rememberedUser = JSON.parse(localStorage.getItem("rememberedUser"));
    if (rememberedUser) {
      document.getElementById("Username").value = rememberedUser.username;
      document.getElementById("Password").value = rememberedUser.password;
      document.getElementById("terms").checked = true;
    }
  });

// Handle Forgot Password
document.getElementById("forgotPasswordForm")?.addEventListener("submit", (event) => {
    event.preventDefault();

    const username = document.getElementById("forgotUsername").value.trim();

    if (!username) {
      showModal("Please enter your username.");
      return;
    }

    const users = getUsers();
    const user = users.find(user => user.username === username);
    if (!user) {
      showModal("User not found. Please check your username.");
      return;
    }

    // Simulate a password reset process (e.g., generating a temporary password)
    const tempPassword = Math.random().toString(36).substr(2, 8); // Random 8-character password
    user.password = tempPassword;
    saveUsers(users);

    showModal(`Your password has been reset. Your temporary password is: ${tempPassword}`);
    window.location.href = "./login.html"; // Redirect back to login
  });

// Function to show the modal with a custom message
function showModal(message) {
    const modal = new bootstrap.Modal(document.getElementById("notificationModal"));
    document.querySelector("#notificationModal .modal-body").innerText = message;
    modal.show();
  }

// Select tabs and forms
// const createAccountForm = document.getElementById('createAccountForm');
// const loginForm = document.getElementById('loginForm');

// Handle "Create Account" form submission
// createAccountForm.addEventListener('submit', (event) => {
//     event.preventDefault();
//     alert('Account created successfully! Redirecting to the quiz game...');
//     window.location.href = 'Home.html'; // Replace with your quiz game path
// });

// Handle "Log In" form submission
// loginForm.addEventListener('submit', (event) => {
//     event.preventDefault();
//     alert('Login successful! Redirecting to the quiz game...');
//     window.location.href = 'Home.html'; // Replace with your quiz game path
// });

// function showToast(message, title = 'Bootstrap', time = 'Just now') {
//     const toastElement = document.getElementById('myToast');

//     // Update the content dynamically
//     toastElement.querySelector('.toast-header strong').textContent = title;
//     toastElement.querySelector('.toast-header small').textContent = time;
//     toastElement.querySelector('.toast-body').textContent = message;

//     const toast = new bootstrap.Toast(toastElement); // Initialize the toast
//     toast.show(); // Show the toast
// }


