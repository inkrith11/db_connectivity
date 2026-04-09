const API_BASE = "";

const studentForm = document.getElementById("studentForm");
const studentIdInput = document.getElementById("studentId");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const courseInput = document.getElementById("course");
const studentsTable = document.getElementById("studentsTable");
const messageBox = document.getElementById("message");
const formTitle = document.getElementById("formTitle");
const formHint = document.getElementById("formHint");
const cancelEditBtn = document.getElementById("cancelEdit");
const refreshBtn = document.getElementById("refreshBtn");

function showMessage(text, isError = false) {
  messageBox.textContent = text;
  messageBox.classList.remove("hidden");
  messageBox.style.background = isError ? "rgba(185, 28, 28, 0.1)" : "rgba(15, 118, 110, 0.1)";
  messageBox.style.borderColor = isError ? "rgba(185, 28, 28, 0.2)" : "rgba(15, 118, 110, 0.18)";
  messageBox.style.color = isError ? "#7f1d1d" : "var(--primary-strong)";
  window.clearTimeout(showMessage._timer);
  showMessage._timer = window.setTimeout(() => {
    messageBox.classList.add("hidden");
  }, 2600);
}

function resetForm() {
  studentIdInput.value = "";
  studentForm.reset();
  formTitle.textContent = "Add Student";
  formHint.textContent = "Fill out the fields below and save the record.";
  cancelEditBtn.classList.add("hidden");
}

function startEdit(student) {
  studentIdInput.value = student.id;
  nameInput.value = student.name;
  emailInput.value = student.email;
  courseInput.value = student.course;
  formTitle.textContent = `Edit Student #${student.id}`;
  formHint.textContent = "Make your changes and save to update the row.";
  cancelEditBtn.classList.remove("hidden");
  nameInput.focus();
}

function renderRows(students) {
  if (!students.length) {
    studentsTable.innerHTML = '<tr><td colspan="5" class="empty">No student records found.</td></tr>';
    return;
  }

  studentsTable.innerHTML = students
    .map(
      (student) => `
        <tr>
          <td>${student.id}</td>
          <td>${escapeHtml(student.name)}</td>
          <td>${escapeHtml(student.email)}</td>
          <td>${escapeHtml(student.course)}</td>
          <td>
            <div class="row-actions">
              <button class="edit-btn" data-action="edit" data-id="${student.id}">Edit</button>
              <button class="delete-btn" data-action="delete" data-id="${student.id}">Delete</button>
            </div>
          </td>
        </tr>
      `,
    )
    .join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function loadStudents() {
  studentsTable.innerHTML = '<tr><td colspan="5" class="empty">Loading students...</td></tr>';
  try {
    const response = await fetch(`${API_BASE}/students`);
    if (!response.ok) {
      throw new Error("Failed to load students");
    }
    const students = await response.json();
    renderRows(students);
  } catch (error) {
    studentsTable.innerHTML = '<tr><td colspan="5" class="empty">Unable to load student records.</td></tr>';
    showMessage(error.message, true);
  }
}

studentForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    course: courseInput.value.trim(),
  };

  const studentId = studentIdInput.value;
  const method = studentId ? "PUT" : "POST";
  const url = studentId ? `${API_BASE}/students/${studentId}` : `${API_BASE}/students`;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Something went wrong");
    }

    showMessage(data.message || "Saved successfully");
    resetForm();
    await loadStudents();
  } catch (error) {
    showMessage(error.message, true);
  }
});

studentsTable.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const studentId = button.dataset.id;
  const action = button.dataset.action;

  if (action === "edit") {
    try {
      const response = await fetch(`${API_BASE}/students`);
      const students = await response.json();
      const student = students.find((item) => String(item.id) === studentId);
      if (student) {
        startEdit(student);
      }
    } catch (error) {
      showMessage("Unable to open record for editing", true);
    }
    return;
  }

  if (action === "delete") {
    const confirmed = window.confirm("Delete this student record?");
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/students/${studentId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to delete student");
      }
      showMessage(data.message || "Deleted successfully");
      if (studentIdInput.value === studentId) {
        resetForm();
      }
      await loadStudents();
    } catch (error) {
      showMessage(error.message, true);
    }
  }
});

cancelEditBtn.addEventListener("click", resetForm);
refreshBtn.addEventListener("click", loadStudents);
loadStudents();
