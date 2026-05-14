const form = document.getElementById('login-form') as HTMLFormElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;
const loginError = document.getElementById('login-error') as HTMLDivElement;

const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (passwordInput.value === adminPassword) {
    // Store session in sessionStorage
    sessionStorage.setItem('admin-authenticated', 'true');
    window.location.href = 'admin-events.html';
  } else {
    loginError.textContent = 'Incorrect password. Please try again.';
  }
});