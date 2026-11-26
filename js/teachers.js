// ==========================================
// TEACHER MANAGEMENT
// ==========================================

// Teacher Modal Elements

const addTeacherBtn = document.getElementById("add-teacher-btn");
const teacherModal = document.getElementById("teacher-modal");
const teacherForm = document.getElementById("teacher-form");

const closeTeacherModal = document.getElementById("close-teacher-modal");
const cancelTeacherModal = document.getElementById("cancel-teacher-modal");

const teachersTableBody = document.getElementById("teachers-table-body");
const teacherSearch = document.getElementById("teacher-search");

let editingTeacherEmail = null;


// Open Teacher Modal

addTeacherBtn.addEventListener("click", function () {

    teacherForm.reset();

    editingTeacherEmail = null;

    teacherModal.querySelector(".modal-header h2").textContent =
        "Add New Teacher";

    teacherForm.querySelector('button[type="submit"]').textContent =
        "Save Teacher";

    document.getElementById("teacher-email").readOnly = false;
    document.getElementById("teacher-password").required = true;

    teacherModal.style.display = "flex";
});


// Close Teacher Modal

closeTeacherModal.addEventListener("click", function () {
    teacherModal.style.display = "none";
});

cancelTeacherModal.addEventListener("click", function () {
    teacherModal.style.display = "none";
});


// Display Teachers

function renderTeachers(searchTerm = "") {

    teachersTableBody.innerHTML = "";

    const searchValue = searchTerm.toLowerCase();

    const teacherAccounts = users.filter(user =>
        user.role === "teacher"
    );

    const filteredTeachers = teacherAccounts.filter(teacher => {

        const teacherName = teacher.name || "";

        return (
            teacherName.toLowerCase().includes(searchValue) ||
            teacher.email.toLowerCase().includes(searchValue)
        );
    });

    filteredTeachers.forEach(teacher => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHtml(teacher.name || "Unnamed Teacher")}</td>
            <td>${escapeHtml(teacher.email)}</td>
            <td>Teacher</td>

            <td>
                <button type="button" class="edit-teacher-btn"
                    data-email="${escapeHtml(teacher.email)}">
                    Edit
                </button>

                <button type="button" class="delete-teacher-btn"
                    data-email="${escapeHtml(teacher.email)}">
                    Delete
                </button>
            </td>
        `;

        teachersTableBody.appendChild(row);
    });

    if (filteredTeachers.length === 0) {

        const message = teacherAccounts.length === 0
            ? "No teachers have been added yet."
            : "No teachers match your search.";

        teachersTableBody.innerHTML = `
        <tr>
            <td colspan="4" class="empty-state">
                <div class="empty-state-content">
                    <span class="empty-state-icon">👨‍🏫</span>
                    <h3>No Teachers Found</h3>
                    <p>${message}</p>
                </div>
            </td>
        </tr>
    `;
    }
}


// Teacher Search

teacherSearch.addEventListener("input", function () {
    renderTeachers(teacherSearch.value);
});


// Add and Update Teacher Accounts

teacherForm.addEventListener("submit", function (event) {

    event.preventDefault();

    // Only Admin can manage teacher accounts
    if (!currentUser || currentUser.role !== "admin") {
        showToast("Only the Admin can manage teacher accounts.", "error");
        return;
    }

    const firstName = document.getElementById("teacher-first-name").value.trim();
    const lastName = document.getElementById("teacher-last-name").value.trim();
    const email = document.getElementById("teacher-email").value.trim();
    const password = document.getElementById("teacher-password").value;

    const fullName = firstName + " " + lastName;

    if (!firstName || !lastName || !email) {
        showToast("Please complete all teacher information.", "error");
        return;
    }

    if (!isValidName(firstName) || !isValidName(lastName)) {
        showToast("Please enter valid teacher names.", "error");
        return;
    }

    if (!isValidEmail(email)) {
        showToast("Please enter a valid email address.", "error");
        return;
    }

    // UPDATE EXISTING TEACHER

    if (editingTeacherEmail !== null) {

        const teacher = users.find(user =>
            user.role === "teacher" &&
            user.email.toLowerCase() === editingTeacherEmail.toLowerCase()
        );

        if (!teacher) return;

        // Check whether another account uses the new email

        const emailTaken = users.some(user =>
            user.email.toLowerCase() === email.toLowerCase() &&
            user !== teacher
        );

        if (emailTaken) {
            showToast("This email already belongs to another account.", "error");
            return;
        }

        // Validate the new password BEFORE changing anything

        if (password.trim() !== "" && password.length < 6) {
            showToast("Password must be at least 6 characters long.", "error");
            return;
        }

        // Update teacher information

        teacher.name = fullName;
        teacher.firstName = firstName;
        teacher.lastName = lastName;
        teacher.email = email;

        // Update password only if a new one was entered

        if (password.trim() !== "") {
            teacher.password = password;
        }

        // Keep the instructor name on courses up to date
        courses.forEach(course => {
            if (course.instructorId === teacher.teacherId) {
                course.instructor = teacher.name;
            }
        });

        saveCourses();

        editingTeacherEmail = null;

    } else {

        // CREATE NEW TEACHER

        if (!password.trim()) {
            showToast("Please create an initial password.", "error");
            return;
        }

        if (password.length < 6) {
            showToast("Password must be at least 6 characters long.", "error");
            return;
        }

        const emailExists = users.some(user =>
            user.email.toLowerCase() === email.toLowerCase()
        );

        if (emailExists) {
            showToast("This email already belongs to another account.", "error");
            return;
        }

        const newTeacher = {
            teacherId: "T-" + Date.now() + "-" +
                Math.floor(Math.random() * 10000),
            firstName: firstName,
            lastName: lastName,
            name: fullName,
            email: email,
            password: password,
            role: "teacher"
        };

        users.push(newTeacher);
    }

    saveUsers();

    renderTeachers(teacherSearch.value);
    renderCourses(courseSearch.value);

    teacherForm.reset();

    teacherModal.style.display = "none";

    showToast("Teacher account saved successfully!", "success");
});


// Edit and Delete Teacher Accounts

teachersTableBody.addEventListener("click", function (event) {

    // Only Admin can edit or delete teacher accounts
    if (!currentUser || currentUser.role !== "admin") {
        showToast("Only the Admin can manage teacher accounts.", "error");
        return;
    }

    // EDIT TEACHER

    const editButton = event.target.closest(".edit-teacher-btn");

    if (editButton) {

        const teacherEmail = editButton.dataset.email;

        const teacher = users.find(user =>
            user.role === "teacher" &&
            user.email.toLowerCase() === teacherEmail.toLowerCase()
        );

        if (!teacher) return;

        const nameParts = (teacher.name || "").trim().split(" ");

        document.getElementById("teacher-first-name").value =
            teacher.firstName || nameParts.shift() || "";

        document.getElementById("teacher-last-name").value =
            teacher.lastName || nameParts.join(" ");

        document.getElementById("teacher-email").value = teacher.email;

        document.getElementById("teacher-password").value = "";
        document.getElementById("teacher-password").required = false;

        editingTeacherEmail = teacher.email;

        teacherModal.querySelector(".modal-header h2").textContent =
            "Edit Teacher";

        teacherForm.querySelector('button[type="submit"]').textContent =
            "Update Teacher";

        teacherModal.style.display = "flex";

        return;
    }


    // DELETE TEACHER

    const deleteButton = event.target.closest(".delete-teacher-btn");

    if (deleteButton) {

        const teacherEmail = deleteButton.dataset.email;

        const teacher = users.find(user =>
            user.role === "teacher" &&
            user.email.toLowerCase() === teacherEmail.toLowerCase()
        );

        if (!teacher) return;

        const assignedCourses = courses.filter(course =>
            course.instructorId === teacher.teacherId
        ).length;

        const confirmDelete = confirm(
            "Delete this teacher account? " + assignedCourses +
            " course(s) will become unassigned."
        );

        if (!confirmDelete) return;

        // Remove the teacher account
        users = users.filter(user => user !== teacher);

        // Unassign the teacher from their courses
        courses.forEach(course => {
            if (course.instructorId === teacher.teacherId) {
                course.instructorId = "";
                course.instructor = "";
            }
        });

        saveUsers();
        saveCourses();

        renderTeachers(teacherSearch.value);
        renderCourses(courseSearch.value);

        showToast("Teacher account deleted successfully.", "success");
    }

});