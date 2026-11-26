// ==========================================
// 3. STUDENT MODAL ELEMENTS
// ==========================================

const addStudentBtn = document.getElementById("add-student-btn");
document.getElementById("quick-add-student").addEventListener("click", () => {
    addStudentBtn.click();
});
const studentModal = document.getElementById("student-modal");
const studentDetailsModal = document.getElementById("student-details-modal");

const closeDetailsModal = document.getElementById("close-details-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const cancelModalBtn = document.getElementById("cancel-modal-btn");

const studentForm = document.getElementById("student-form");
const studentIdInput = document.getElementById("student-id");

const modalTitle = studentModal.querySelector(".modal-header h2");
const saveStudentBtn = studentForm.querySelector('button[type="submit"]');

const studentsTableBody = document.getElementById("students-table-body");
const studentSearch = document.getElementById("student-search");
const studentStatusFilter = document.getElementById("student-status-filter");


// Open Student Modal

addStudentBtn.addEventListener("click", function () {
    studentForm.reset();

    editingStudentId = null;

    // The ID can be typed only when adding a new student
    studentIdInput.readOnly = false;

    modalTitle.textContent = "Add New Student";
    saveStudentBtn.textContent = "Save Student";

    studentModal.style.display = "flex";
});


// Close Student Modal

closeModalBtn.addEventListener("click", function () {
    studentModal.style.display = "none";
});

cancelModalBtn.addEventListener("click", function () {
    studentModal.style.display = "none";
});


// Close Student Details Modal

closeDetailsModal.addEventListener("click", function () {
    studentDetailsModal.style.display = "none";
});


// ==========================================
// 5. DISPLAY STUDENTS
// ==========================================

function renderStudents(searchTerm = "", statusFilter = "all") {

    studentsTableBody.innerHTML = "";

    updateDashboardStats();

    const searchValue = searchTerm.toLowerCase();

    const filteredStudents = students.filter(student => {

        const matchesSearch =
            student.id.toLowerCase().includes(searchValue) ||
            student.name.toLowerCase().includes(searchValue) ||
            student.email.toLowerCase().includes(searchValue) ||
            student.department.toLowerCase().includes(searchValue);

        const matchesStatus =
            statusFilter === "all" ||
            student.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    filteredStudents.forEach(student => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHtml(student.id)}</td>
            <td>${escapeHtml(student.name)}</td>
            <td>${escapeHtml(student.email)}</td>
            <td>${escapeHtml(student.department)}</td>
            <td>${escapeHtml(student.year)}</td>

            <td>
                <span class="status-badge ${escapeHtml((student.status || "Active").toLowerCase())}">
                    ${escapeHtml(student.status || "Active")}
                </span>
            </td>

            <td>
                <button type="button" class="view-btn" data-id="${escapeHtml(student.id)}">
                    View
                </button>

                <button type="button" class="edit-btn" data-id="${escapeHtml(student.id)}">
                    Edit
                </button>

                <button type="button" class="delete-btn" data-id="${escapeHtml(student.id)}">
                    Delete
                </button>
            </td>
        `;

        studentsTableBody.appendChild(row);
    });

    if (filteredStudents.length === 0) {

        const message = students.length === 0
            ? "No students have been added yet."
            : "No students match your search or filter.";

        studentsTableBody.innerHTML = `
        <tr>
            <td colspan="7" class="empty-state">
                <div class="empty-state-content">
                    <span class="empty-state-icon">📚</span>
                    <h3>No Students Found</h3>
                    <p>${message}</p>
                </div>
            </td>
        </tr>
    `;
    }
}


// Student Search

studentSearch.addEventListener("input", function () {
    renderStudents(studentSearch.value, studentStatusFilter.value);
});


// Student Status Filter

studentStatusFilter.addEventListener("change", function () {
    renderStudents(studentSearch.value, studentStatusFilter.value);
});

// ==========================================
// 6. ADD AND UPDATE STUDENTS
// ==========================================

// Student form validation helpers

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Letters from any language (including Amharic), spaces, apostrophes and hyphens
function isValidName(name) {
    return /^[\p{L}\s'-]+$/u.test(name) && name.trim().length >= 2;
}

studentForm.addEventListener("submit", function (event) {

    event.preventDefault();

    // Only Admin can add or update students
    if (!currentUser || currentUser.role !== "admin") {
        showToast("Only the Admin can manage students.", "error");
        return;
    }

    const student = {
        id: studentIdInput.value.trim(),
        name: document.getElementById("student-name").value.trim(),
        email: document.getElementById("student-email").value.trim(),
        department: document.getElementById("student-department").value.trim(),
        year: document.getElementById("student-year").value,
        status: document.getElementById("student-status").value
    };

    const studentPassword = document.getElementById("student-password").value;

    if (
        !student.id ||
        !student.name ||
        !student.email ||
        !student.department ||
        !student.year ||
        !student.status
    ) {
        showToast("Please fill in all student information.", "error");
        return;
    }

    if (!isValidName(student.name)) {
        showToast("Please enter a valid student name.", "error");
        return;
    }

    if (!isValidEmail(student.email)) {
        showToast("Please enter a valid email address.", "error");
        return;
    }

    // UPDATE EXISTING STUDENT
    if (editingStudentId !== null) {

        const index = students.findIndex(
            existingStudent => existingStudent.id === editingStudentId
        );

        if (index === -1) return;

        const existingStudent = students[index];

        // Check whether another student already uses this email
        const duplicateStudentEmail = students.some(other =>
            other.email.toLowerCase() === student.email.toLowerCase() &&
            other.id !== editingStudentId
        );

        if (duplicateStudentEmail) {
            showToast("Another student already uses this email.", "error");
            return;
        }

        // Find the login account linked to the old student email
        const linkedUser = users.find(user =>
            user.role === "student" &&
            user.email.toLowerCase() === existingStudent.email.toLowerCase()
        );

        // Check whether another login account uses the new email
        const emailTaken = users.some(user =>
            user.email.toLowerCase() === student.email.toLowerCase() &&
            user !== linkedUser
        );

        if (emailTaken) {
            showToast("This email already belongs to another login account.", "error");
            return;
        }

        // A new password is optional when editing
        if (studentPassword.trim() !== "" && studentPassword.length < 6) {
            showToast("Password must be at least 6 characters long.", "error");
            return;
        }

        // Update the student record
        students[index] = student;

        // Update the linked login account
        if (linkedUser) {
            linkedUser.email = student.email;
            linkedUser.name = student.name;

            if (studentPassword.trim() !== "") {
                linkedUser.password = studentPassword;
            }

            saveUsers();
        }

    } else {

        // ADD NEW STUDENT

        const studentExists = students.some(
            existingStudent => existingStudent.id === student.id
        );

        if (studentExists) {
            showToast("A student with this ID already exists.", "error");
            return;
        }

        if (studentPassword.trim() === "") {
            showToast("Please create an initial password for the student.", "error");
            return;
        }

        if (studentPassword.length < 6) {
            showToast("Password must be at least 6 characters long.", "error");
            return;
        }

        const emailExists = users.some(
            user => user.email.toLowerCase() === student.email.toLowerCase()
        );

        if (emailExists) {
            showToast("This email already has a login account.", "error");
            return;
        }

        students.push(student);

        // Create a login account for the new student
        const newStudentUser = {
            email: student.email,
            password: studentPassword,
            role: "student",
            name: student.name
        };

        users.push(newStudentUser);

        saveUsers();
    }

    saveStudents();

    renderStudents(studentSearch.value, studentStatusFilter.value);

    studentForm.reset();

    editingStudentId = null;
    studentIdInput.readOnly = false;

    modalTitle.textContent = "Add New Student";
    saveStudentBtn.textContent = "Save Student";

    studentModal.style.display = "none";

    showToast("Student saved successfully!", "success");
});


// ==========================================
// 7. VIEW, EDIT AND DELETE STUDENTS
// ==========================================

studentsTableBody.addEventListener("click", function (event) {

    // Only Admin can edit or delete students
    if (!currentUser || currentUser.role !== "admin") {
        showToast("Only the Admin can manage students.", "error");
        return;
    }

    // VIEW STUDENT

    const viewButton = event.target.closest(".view-btn");

    if (viewButton) {

        const studentId = viewButton.dataset.id;

        const student = students.find(
            student => student.id === studentId
        );

        if (!student) return;

        document.getElementById("details-id").textContent = student.id;
        document.getElementById("details-name").textContent = student.name;
        document.getElementById("details-email").textContent = student.email;
        document.getElementById("details-department").textContent = student.department;
        document.getElementById("details-year").textContent = student.year;
        document.getElementById("details-status").textContent = student.status || "Not set";

        studentDetailsModal.style.display = "flex";

        return;
    }


    // EDIT STUDENT

    const editButton = event.target.closest(".edit-btn");

    if (editButton) {

        const studentId = editButton.dataset.id;

        const student = students.find(
            student => student.id === studentId
        );

        if (!student) return;

        studentIdInput.value = student.id;
        document.getElementById("student-name").value = student.name;
        document.getElementById("student-email").value = student.email;
        document.getElementById("student-department").value = student.department;
        document.getElementById("student-year").value = student.year;
        document.getElementById("student-status").value = student.status || "";
        // Do not display the existing password
        document.getElementById("student-password").value = "";

        editingStudentId = studentId;

        // Changing the ID would break the student's enrollments and grades
        studentIdInput.readOnly = true;

        modalTitle.textContent = "Edit Student";
        saveStudentBtn.textContent = "Update Student";

        studentModal.style.display = "flex";

        return;
    }


    // DELETE STUDENT

    const deleteButton = event.target.closest(".delete-btn");

    if (deleteButton) {

        const studentId = deleteButton.dataset.id;

        const deletedStudent = students.find(
            student => student.id === studentId
        );

        if (!deletedStudent) return;

        const confirmDelete = confirm(
            "Deleting this student will also delete their login account, enrollments, and grades. Continue?"
        );

        if (!confirmDelete) return;

        // Remove the student
        students = students.filter(
            student => student.id !== studentId
        );

        // Remove the student's login account
        users = users.filter(user =>
            !(
                user.role === "student" &&
                user.email.toLowerCase() === deletedStudent.email.toLowerCase()
            )
        );

        // Remove the student's enrollments
        enrollments = enrollments.filter(
            enrollment => enrollment.studentId !== studentId
        );

        // Remove the student's grades
        grades = grades.filter(
            grade => grade.studentId !== studentId
        );

        // Save all updated data
        saveStudents();
        saveUsers();
        saveEnrollments();
        saveGrades();

        // Refresh the displayed information
        renderStudents(studentSearch.value, studentStatusFilter.value);
        renderEnrollments(enrollmentSearch.value, enrollmentStatusFilter.value);
        renderGrades(gradesSearch.value);

        showToast("Student and associated records deleted successfully.", "success");
    }

});