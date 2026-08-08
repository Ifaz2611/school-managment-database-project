const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');


function showLogin() {
  tabLogin.classList.add('active');
  tabRegister.classList.remove('active');
  loginForm.classList.add('active-form');
  registerForm.classList.remove('active-form');
  loginError.textContent = '';
  registerError.textContent = '';
}


function showRegister() {
  tabRegister.classList.add('active');
  tabLogin.classList.remove('active');
  registerForm.classList.add('active-form');
  loginForm.classList.remove('active-form');
  loginError.textContent = '';
  registerError.textContent = '';
}


tabLogin.addEventListener('click', showLogin);
tabRegister.addEventListener('click', showRegister);


loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;


  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      loginError.textContent = data.errors ? data.errors.join(' ') : 'Login failed.';
      return;
    }
    window.location.href = '/dashboard.html';
  } catch {
    loginError.textContent = 'Network error. Please try again.';
  }
});


registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  registerError.textContent = '';
  const username = document.getElementById('reg-username').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;


  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      registerError.textContent = data.errors ? data.errors.join(' ') : 'Registration failed.';
      return;
    }
    window.location.href = '/dashboard.html';
  } catch {
    registerError.textContent = 'Network error. Please try again.';
  }
});