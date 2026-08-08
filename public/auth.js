document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const loginError = document.getElementById('login-error');
  const registerError = document.getElementById('register-error');

  const activeTabClasses = [
    'bg-brand-600',
    'text-white',
    'shadow-md',
    'shadow-brand-500/30',
  ];
  const inactiveTabClasses = [
    'text-gray-500',
    'dark:text-gray-400',
    'hover:text-gray-700',
    'dark:hover:text-gray-200',
  ];

  function showLogin() {
    tabLogin.classList.add(...activeTabClasses);
    tabLogin.classList.remove(...inactiveTabClasses);
    tabRegister.classList.add(...inactiveTabClasses);
    tabRegister.classList.remove(...activeTabClasses);

    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');

    loginError.textContent = '';
    loginError.classList.add('hidden');
    registerError.textContent = '';
    registerError.classList.add('hidden');
  }

  function showRegister() {
    tabRegister.classList.add(...activeTabClasses);
    tabRegister.classList.remove(...inactiveTabClasses);
    tabLogin.classList.add(...inactiveTabClasses);
    tabLogin.classList.remove(...activeTabClasses);

    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');

    loginError.textContent = '';
    loginError.classList.add('hidden');
    registerError.textContent = '';
    registerError.classList.add('hidden');
  }

  function showError(el, message) {
    el.textContent = message;
    el.classList.remove('hidden');
    el.classList.remove('fade-in');
    void el.offsetWidth; // restart animation
    el.classList.add('fade-in');
  }

  tabLogin.addEventListener('click', showLogin);
  tabRegister.addEventListener('click', showRegister);

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';
    loginError.classList.add('hidden');
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
        showError(loginError, data.errors ? data.errors.join(' ') : 'Login failed.');
        return;
      }
      window.location.href = '/dashboard.html';
    } catch {
      showError(loginError, 'Network error. Please try again.');
    }
  });

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    registerError.textContent = '';
    registerError.classList.add('hidden');
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
        showError(
          registerError,
          data.errors ? data.errors.join(' ') : 'Registration failed.'
        );
        return;
      }
      window.location.href = '/dashboard.html';
    } catch {
      showError(registerError, 'Network error. Please try again.');
    }
  });
});
