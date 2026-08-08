const studentForm = document.getElementById('student-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const studentError = document.getElementById('student-error');
const studentsBody = document.getElementById('students-body');
const emptyState = document.getElementById('empty-state');
const searchInput = document.getElementById('search');
const userDisplay = document.getElementById('user-display');
const logoutBtn = document.getElementById('logout-btn');


let allStudents = [];
let editingId = null;


function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}


function resetForm() {
  editingId = null;
  studentForm.reset();
  formTitle.textContent = 'Add Student';
  submitBtn.textContent = 'Add Student';
  cancelBtn.style.display = 'none';
  studentError.textContent = '';
}


async function loadStudents() {
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
    }
  } catch {
    studentError.textContent = 'Could not load students.';
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
    emptyState.classList.remove('hidden');
    emptyState.textContent = allStudents.length
      ? 'No matching students.'
      : 'No students yet. Add one above.';
    return;
  }
  emptyState.classList.add('hidden');


  filtered.forEach((s) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(s.name)}</td>
      <td>${escapeHtml(s.roll)}</td>
      <td>${escapeHtml(s.class)}</td>
      <td>${escapeHtml(s.section)}</td>
      <td class="actions-cell">
        <button class="btn-ghost btn-sm" data-action="edit" data-id="${s.id}">Edit</button>
        <button class="btn-danger btn-sm" data-action="delete" data-id="${s.id}">Delete</button>
      </td>
    `;
    studentsBody.appendChild(tr);
  });
}

async function loadUser() {
  try {
    const res = await fetch('/api/profile');
    if (res.status === 401) {
      window.location.href = '/login.html';
      return;
    }
    const data = await res.json();
    if (res.ok && data.user) {
      userDisplay.textContent = `Welcome, ${data.user.username}`;
    }
  } catch {
    // ignore
  }
}

async function saveStudent(e) {
  e.preventDefault();
  studentError.textContent = '';

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
      studentError.textContent = data.errors ? data.errors.join(' ') : 'Could not save student.';
      return;
    }
    resetForm();
    loadStudents();
  } catch {
    studentError.textContent = 'Network error. Please try again.';
  }
}

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
  submitBtn.textContent = 'Save Changes';
  cancelBtn.style.display = 'inline-block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteStudent(id) {
  if (!confirm('Delete this student?')) return;
  try {
    const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      studentError.textContent = data.errors ? data.errors.join(' ') : 'Could not delete student.';
      return;
    }
    if (String(editingId) === String(id)) resetForm();
    loadStudents();
  } catch {
    studentError.textContent = 'Network error. Please try again.';
  }
}

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
  if (btn.dataset.action === 'delete') deleteStudent(id);
});

loadUser();
loadStudents();