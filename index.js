// Function to handle sign-up
document.getElementById("createAccountButton")?.addEventListener("click", function () {
    const username = document.getElementById("createUsername").value;
    const password = document.getElementById("createPassword").value;

    if (!username || !password) {
      alert("Please fill in all fields.");
      return;
    }

    // Save user information in local storage
    const user = { username, password };
    localStorage.setItem("user", JSON.stringify(user));

    alert("Account created successfully!");
    window.location.href = "./login.html"; // Redirect to login page
  });

  // Function to handle login
  document.getElementById("loginButton")?.addEventListener("click", function () {
    const username = document.getElementById("Username").value;
    const password = document.getElementById("Password").value;
    const rememberMe = document.getElementById("terms").checked;

    // Retrieve user info from local storage
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser) {
      alert("No account found. Please sign up.");
      window.location.href = "./index.html"; // Redirect to sign-up page
      return;
    }

    if (storedUser.username === username && storedUser.password === password) {
      alert("Login successful!");

      if (rememberMe) {
        // Save username and password in localStorage if 'Remember Me' is checked
        localStorage.setItem("rememberedUser", JSON.stringify({ username, password }));
      } else {
        // Remove remembered user info if 'Remember Me' is unchecked
        localStorage.removeItem("rememberedUser");
      }

      // Save logged-in status in local storage
      localStorage.setItem("loggedInUser", JSON.stringify(storedUser));
      window.location.href = "./Home.html"; // Redirect to home page
    } else {
      alert("Invalid username or password. Please try again.");
    }
  });

  // Function to auto-fill login form if user info is remembered
document.addEventListener("DOMContentLoaded", function () {
    const rememberedUser = JSON.parse(localStorage.getItem("rememberedUser"));
    if (rememberedUser) {
      document.getElementById("Username").value = rememberedUser.username;
      document.getElementById("Password").value = rememberedUser.password;
      document.getElementById("terms").checked = true;
    }
  });

// Handle Forgot Password
document.getElementById("forgotPasswordForm")?.addEventListener("submit", function (event) {
    event.preventDefault();
    const username = document.getElementById("forgotUsername").value;

    if (!username) {
      showModal("Please enter your username.");
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || storedUser.username !== username) {
      showModal("User not found. Please check your username.");
      return;
    }

    // Simulate a password reset process (e.g., generating a temporary password)
    const tempPassword = Math.random().toString(36).substr(2, 8); // Generate random 8-character password
    storedUser.password = tempPassword;
    localStorage.setItem("user", JSON.stringify(storedUser));

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


