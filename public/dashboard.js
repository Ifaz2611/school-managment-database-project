document.addEventListener('DOMContentLoaded', () => {
  const studentForm = document.getElementById('student-form');
  const formTitle = document.getElementById('form-title');
  const formBadge = document.getElementById('form-badge');
  const submitBtn = document.getElementById('submit-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const studentError = document.getElementById('student-error');
  const studentsBody = document.getElementById('students-body');
  const emptyState = document.getElementById('empty-state');
  const emptyText = document.getElementById('empty-text');
  const searchInput = document.getElementById('search');
  const userDisplay = document.getElementById('user-display');
  const userAvatar = document.getElementById('user-avatar');
  const logoutBtn = document.getElementById('logout-btn');
  const deleteModal = document.getElementById('delete-modal');

  let allStudents = [];
  let editingId = null;
  let pendingDeleteId = null;

  // ---------- Helpers ----------

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initials(name) {
    return String(name)
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  const avatarPalette = [
    ['bg-brand-100', 'text-brand-700'],
    ['bg-violet-100', 'text-violet-700'],
    ['bg-emerald-100', 'text-emerald-700'],
    ['bg-amber-100', 'text-amber-700'],
    ['bg-rose-100', 'text-rose-700'],
    ['bg-sky-100', 'text-sky-700'],
  ];
  const avatarDarkPalette = [
    ['dark:bg-brand-900', 'dark:text-brand-300'],
    ['dark:bg-violet-900', 'dark:text-violet-300'],
    ['dark:bg-emerald-900', 'dark:text-emerald-300'],
    ['dark:bg-amber-900', 'dark:text-amber-300'],
    ['dark:bg-rose-900', 'dark:text-rose-300'],
    ['dark:bg-sky-900', 'dark:text-sky-300'],
  ];

  function avatarClasses(name) {
    let hash = 0;
    for (let i = 0; i < String(name).length; i++) {
      hash = (hash * 31 + String(name).charCodeAt(i)) >>> 0;
    }
    const idx = hash % avatarPalette.length;
    return avatarPalette[idx].join(' ') + ' ' + avatarDarkPalette[idx].join(' ');
  }

  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const icons = {
      success:
        '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />',
      error:
        '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />',
      info: '<path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />',
    };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'status');
    toast.innerHTML = `
      <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">${icons[type] || icons.info}</svg>
      <span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('toast-out');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function showError(el, message) {
    if (!message) {
      el.classList.add('hidden');
      el.textContent = '';
      return;
    }
    el.textContent = message;
    el.classList.remove('hidden');
  }

  function setEmptyState(message) {
    emptyText.textContent = message;
    emptyState.style.display = message ? 'flex' : 'none';
  }

  function skeletonRows() {
    return Array.from({ length: 4 })
      .map(
        () => `
      <tr>
        <td class="px-6 py-4">
          <div class="flex items-center gap-3">
            <div class="skeleton w-8 h-8 rounded-full"></div>
            <div class="skeleton h-4 w-32"></div>
          </div>
        </td>
        <td class="px-6 py-4"><div class="skeleton h-4 w-12"></div></td>
        <td class="px-6 py-4"><div class="skeleton h-4 w-10"></div></td>
        <td class="px-6 py-4"><div class="skeleton h-4 w-8"></div></td>
        <td class="px-6 py-4"><div class="skeleton h-4 w-16"></div></td>
      </tr>`
      )
      .join('');
  }

  // ---------- Form ----------

  function resetForm() {
    editingId = null;
    studentForm.reset();
    formTitle.textContent = 'Add Student';
    formBadge.classList.add('hidden');
    submitBtn.textContent = 'Add Student';
    cancelBtn.classList.add('hidden');
    showError(studentError, '');
  }

  // ---------- Stats ----------

  function updateStats() {
    document.getElementById('stat-students').textContent = allStudents.length;
    document.getElementById('stat-classes').textContent = new Set(
      allStudents.map((s) => s.class)
    ).size;
    document.getElementById('stat-sections').textContent = new Set(
      allStudents.map((s) => s.section)
    ).size;
  }

  // ---------- Students ----------

  async function loadStudents() {
    studentsBody.innerHTML = skeletonRows();
    setEmptyState('');
    try {
      const res = await fetch('/api/students');
      if (res.status === 401) {
        window.location.href = '/login.html';
        return;
      }
      const data = await res.json();
      if (res.ok) {
        allStudents = data;
        renderStudents();
        updateStats();
      }
    } catch {
      studentsBody.innerHTML = '';
      setEmptyState('Could not load students.');
    }
  }

  function renderStudents() {
    const query = searchInput.value.trim().toLowerCase();
    const filtered = query
      ? allStudents.filter(
          (s) =>
            s.name.toLowerCase().includes(query) ||
            s.roll.toLowerCase().includes(query)
        )
      : allStudents;

    studentsBody.innerHTML = '';
    if (!filtered.length) {
      setEmptyState(
        allStudents.length
          ? 'No matching students.'
          : 'No students yet. Add one to get started.'
      );
      return;
    }
    setEmptyState('');

    filtered.forEach((s, i) => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors duration-150';
      tr.style.animationDelay = `${Math.min(i * 40, 320)}ms`;
      tr.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap fade-in">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full ${avatarClasses(
              s.name
            )} flex items-center justify-center text-xs font-bold flex-shrink-0">
              ${escapeHtml(initials(s.name))}
            </div>
            <span class="text-sm font-semibold text-gray-900 dark:text-white">
              ${escapeHtml(s.name)}
            </span>
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap fade-in text-sm font-mono text-gray-600 dark:text-gray-300">
          ${escapeHtml(s.roll)}
        </td>
        <td class="px-6 py-4 whitespace-nowrap fade-in text-sm text-gray-500 dark:text-gray-400">
          ${escapeHtml(s.class)}
        </td>
        <td class="px-6 py-4 whitespace-nowrap fade-in">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 border border-brand-100 dark:border-brand-800">
            ${escapeHtml(s.section)}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium fade-in">
          <button data-action="edit" data-id="${
            s.id
          }" class="text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/40 rounded-lg px-2.5 py-1.5 transition-colors duration-150" title="Edit">
            <svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button data-action="delete" data-id="${
            s.id
          }" class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-lg px-2.5 py-1.5 ml-2 transition-colors duration-150" title="Delete">
            <svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </td>
      `;
      studentsBody.appendChild(tr);
    });
  }

  // ---------- User ----------

  async function loadUser() {
    try {
      const res = await fetch('/api/profile');
      if (res.status === 401) {
        window.location.href = '/login.html';
        return;
      }
      const data = await res.json();
      if (res.ok && data.user) {
        userDisplay.textContent = data.user.username;
        userAvatar.textContent = initials(data.user.username);
      }
    } catch {
      // ignore
    }
  }

  // ---------- Save ----------

  async function saveStudent(e) {
    e.preventDefault();
    showError(studentError, '');

    const name = document.getElementById('name').value.trim();
    const roll = document.getElementById('roll').value.trim();
    const className = document.getElementById('class').value.trim();
    const section = document.getElementById('section').value.trim();

    const payload = { name, roll, class: className, section };

    try {
      const url = editingId ? `/api/students/${editingId}` : '/api/students';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        showError(
          studentError,
          data.errors ? data.errors.join(' ') : 'Could not save student.'
        );
        return;
      }
      const wasEditing = editingId;
      resetForm();
      showToast(
        wasEditing ? 'Student updated successfully.' : 'Student added successfully.',
        'success'
      );
      loadStudents();
    } catch {
      showError(studentError, 'Network error. Please try again.');
    }
  }

  // ---------- Edit ----------

  function editStudent(id) {
    const student = allStudents.find((s) => String(s.id) === String(id));
    if (!student) return;

    editingId = id;
    document.getElementById('student-id').value = id;
    document.getElementById('name').value = student.name;
    document.getElementById('roll').value = student.roll;
    document.getElementById('class').value = student.class;
    document.getElementById('section').value = student.section;
    formTitle.textContent = 'Edit Student';
    formBadge.classList.remove('hidden');
    submitBtn.textContent = 'Save Changes';
    cancelBtn.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---------- Delete ----------

  function openDeleteModal(id) {
    pendingDeleteId = id;
    deleteModal.classList.add('open');
    deleteModal.setAttribute('aria-hidden', 'false');
  }

  function closeDeleteModal() {
    pendingDeleteId = null;
    deleteModal.classList.remove('open');
    deleteModal.setAttribute('aria-hidden', 'true');
  }

  async function deleteStudent(id) {
    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        showError(
          studentError,
          data.errors ? data.errors.join(' ') : 'Could not delete student.'
        );
        showToast(
          data.errors ? data.errors.join(' ') : 'Could not delete student.',
          'error'
        );
        return;
      }
      if (String(editingId) === String(id)) resetForm();
      showToast('Student deleted successfully.', 'success');
      loadStudents();
    } catch {
      showToast('Network error. Please try again.', 'error');
    }
  }

  // ---------- Events ----------

  studentForm.addEventListener('submit', saveStudent);
  cancelBtn.addEventListener('click', resetForm);
  searchInput.addEventListener('input', renderStudents);

  logoutBtn.addEventListener('click', async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    window.location.href = '/login.html';
  });

  studentsBody.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.dataset.action === 'edit') editStudent(id);
    if (btn.dataset.action === 'delete') openDeleteModal(id);
  });

  document.getElementById('delete-cancel-btn').addEventListener('click', closeDeleteModal);
  document.getElementById('delete-confirm-btn').addEventListener('click', async () => {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    closeDeleteModal();
    await deleteStudent(id);
  });
  document.getElementById('delete-backdrop').addEventListener('click', closeDeleteModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && deleteModal.classList.contains('open')) {
      closeDeleteModal();
    }
  });

  loadUser();
  loadStudents();
});
