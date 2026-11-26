
// ==========================================
// 12. ENROLLMENT MODAL ELEMENTS
// ==========================================

const addEnrollmentBtn = document.getElementById("add-enrollment-btn");
const enrollmentModal = document.getElementById("enrollment-modal");

const closeEnrollmentModal = document.getElementById("close-enrollment-modal");
const cancelEnrollmentModal = document.getElementById("cancel-enrollment-modal");

const enrollmentForm = document.getElementById("enrollment-form");

const enrollmentStudent = document.getElementById("enrollment-student");
const enrollmentCourse = document.getElementById("enrollment-course");

const enrollmentSearch = document.getElementById("enrollment-search");
const enrollmentStatusFilter = document.getElementById("enrollment-status-filter");
const enrollmentsTableBody = document.getElementById("enrollments-table-body");


// ==========================================
// 13. POPULATE ENROLLMENT DROPDOWNS
// ==========================================

function populateEnrollmentDropdowns() {

    enrollmentStudent.innerHTML =
        '<option value="">Choose a student</option>';

    students.forEach(student => {

        const option = document.createElement("option");

        option.value = student.id;
        option.textContent = student.name;

        enrollmentStudent.appendChild(option);
    });


    enrollmentCourse.innerHTML =
        '<option value="">Choose a course</option>';

    courses.forEach(course => {

        const option = document.createElement("option");

        option.value = course.code;
        option.textContent = `${course.code} - ${course.name}`;

        enrollmentCourse.appendChild(option);
    });
}


// ==========================================
// 14. OPEN AND CLOSE ENROLLMENT MODAL
// ==========================================

addEnrollmentBtn.addEventListener("click", function () {

    // Only Admin can manage enrollments
    if (!currentUser || currentUser.role !== "admin") {
        alert("Only the Admin can manage enrollments.");
        return;
    }

    enrollmentForm.reset();

    editingEnrollmentId = null;

    populateEnrollmentDropdowns();

    // Automatically set today's date
    document.getElementById("enrollment-date").value =
        new Date().toLocaleDateString("en-CA");

    enrollmentModal.style.display = "flex";
});

closeEnrollmentModal.addEventListener("click", function () {
    enrollmentModal.style.display = "none";
});

cancelEnrollmentModal.addEventListener("click", function () {
    enrollmentModal.style.display = "none";
});


// ==========================================
// ENROLLMENT STATISTICS
// ==========================================

function updateEnrollmentStats() {

    const total = enrollments.length;

    const completed = enrollments.filter(enrollment =>
        enrollment.status === "Completed"
    ).length;

    const dropped = enrollments.filter(enrollment =>
        enrollment.status === "Dropped"
    ).length;

    document.getElementById("enrollment-total-count").textContent = total;

    document.getElementById("enrollment-completed-count").textContent = completed;

    document.getElementById("enrollment-dropped-count").textContent = dropped;
}


// ==========================================
// 15. DISPLAY ENROLLMENTS
// ==========================================

function renderEnrollments(searchTerm = "", statusFilter = "all") {

    enrollmentsTableBody.innerHTML = "";

    const searchValue = searchTerm.toLowerCase();

    // Decide which enrollments the logged-in user can see
    const visibleEnrollments =
        currentUser && currentUser.role === "admin"
            ? enrollments
            : currentUser && currentUser.role === "teacher"
                ? enrollments.filter(enrollment =>
                    courses.some(course =>
                        course.code === enrollment.courseCode &&
                        course.instructorId === currentUser.teacherId
                    )
                )
                : [];

    // Apply search and status filters
    const filteredEnrollments = visibleEnrollments.filter(enrollment => {

        const matchesStatus =
            statusFilter === "all" ||
            (enrollment.status || "Enrolled") === statusFilter;

        const student = students.find(
            student => student.id === enrollment.studentId
        );

        const course = courses.find(
            course => course.code === enrollment.courseCode
        );

        const studentName = student ? student.name : "Unknown Student";
        const courseName = course ? course.name : "Unknown Course";

        return (
            enrollment.id.toString().toLowerCase().includes(searchValue) ||
            studentName.toLowerCase().includes(searchValue) ||
            courseName.toLowerCase().includes(searchValue) ||
            enrollment.courseCode.toLowerCase().includes(searchValue) ||
            enrollment.date.includes(searchValue)
        ) && matchesStatus;
    });

    filteredEnrollments.forEach(enrollment => {

        const student = students.find(
            student => student.id === enrollment.studentId
        );

        const course = courses.find(
            course => course.code === enrollment.courseCode
        );

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${enrollment.id}</td>
            <td>${student ? student.name : "Unknown Student"}</td>
            <td>${course ? course.name : "Unknown Course"}</td>
            <td>${enrollment.courseCode}</td>
            <td>${enrollment.date}</td>

            <td>
                <span class="status-badge ${(enrollment.status || "Enrolled").toLowerCase()}">
                    ${enrollment.status || "Enrolled"}
                </span>
            </td>

            <td>
                ${currentUser && currentUser.role === "admin" ? `
                    <button class="edit-enrollment-btn" data-id="${enrollment.id}">
                        Edit
                    </button>

                    <button class="delete-enrollment-btn" data-id="${enrollment.id}">
                        Delete
                    </button>
                ` : "View Only"}
            </td>
        `;

        enrollmentsTableBody.appendChild(row);
    });

    if (filteredEnrollments.length === 0) {

        let message;

        if (visibleEnrollments.length === 0) {

            if (currentUser && currentUser.role === "admin" && enrollments.length === 0) {
                message = "No enrollments have been created yet.";
            } else if (currentUser && currentUser.role === "teacher") {
                message = "No enrollments are available for your assigned courses yet.";
            } else {
                message = "No enrollments are available for your account yet.";
            }

        } else {
            message = "No enrollments match your search or filter.";
        }

        enrollmentsTableBody.innerHTML = `
        <tr>
            <td colspan="7" class="empty-state">
                <div class="empty-state-content">
                    <span class="empty-state-icon">📝</span>
                    <h3>No Enrollments Found</h3>
                    <p>${message}</p>
                </div>
            </td>
        </tr>
    `;
    }

    updateDashboardStats();
    updateEnrollmentStats();
}


// Enrollment Search

enrollmentSearch.addEventListener("input", function () {
    renderEnrollments(
        enrollmentSearch.value,
        enrollmentStatusFilter.value
    );
});


// Enrollment Status Filter

enrollmentStatusFilter.addEventListener("change", function () {
    renderEnrollments(
        enrollmentSearch.value,
        enrollmentStatusFilter.value
    );
});


// ==========================================
// 16. ADD AND UPDATE ENROLLMENTS
// ==========================================

enrollmentForm.addEventListener("submit", function (event) {

    event.preventDefault();

    // Only Admin can add or update enrollments
    if (!currentUser || currentUser.role !== "admin") {
        alert("Only the Admin can manage enrollments.");
        return;
    }

    const studentId = enrollmentStudent.value;
    const courseCode = enrollmentCourse.value;
    const date = document.getElementById("enrollment-date").value;
    const status = document.getElementById("enrollment-status").value;

    if (!studentId || !courseCode || !date) {
        alert("Please complete all enrollment information.");
        return;
    }

    // Check for duplicate enrollment

    const duplicateEnrollment = enrollments.some(enrollment =>
        enrollment.studentId === studentId &&
        enrollment.courseCode === courseCode &&
        enrollment.id !== editingEnrollmentId
    );

    if (duplicateEnrollment) {
        alert("This student is already enrolled in this course.");
        return;
    }

    if (editingEnrollmentId !== null) {

        // UPDATE EXISTING ENROLLMENT

        const index = enrollments.findIndex(
            enrollment => enrollment.id === editingEnrollmentId
        );

        if (index !== -1) {
            enrollments[index].studentId = studentId;
            enrollments[index].courseCode = courseCode;
            enrollments[index].date = date;
            enrollments[index].status = status;
        }

    } else {

        // CREATE NEW ENROLLMENT

        const newEnrollment = {
            id: Date.now(),
            studentId: studentId,
            courseCode: courseCode,
            date: date,
            status: status
        };

        enrollments.push(newEnrollment);
    }

    saveEnrollments();

    renderEnrollments(enrollmentSearch.value, enrollmentStatusFilter.value);

    enrollmentForm.reset();

    editingEnrollmentId = null;

    enrollmentModal.style.display = "none";
});


// ==========================================
// 17. EDIT AND DELETE ENROLLMENTS
// ==========================================

enrollmentsTableBody.addEventListener("click", function (event) {

    // EDIT ENROLLMENT

    const editButton = event.target.closest(".edit-enrollment-btn");

    if (editButton) {

        // Only Admin can edit enrollments
        if (!currentUser || currentUser.role !== "admin") {
            alert("Only the Admin can edit enrollments.");
            return;
        }

        const enrollmentId = Number(editButton.dataset.id);

        const enrollment = enrollments.find(
            item => item.id === enrollmentId
        );

        if (!enrollment) return;

        editingEnrollmentId = enrollmentId;

        populateEnrollmentDropdowns();

        enrollmentStudent.value = enrollment.studentId;
        enrollmentCourse.value = enrollment.courseCode;

        document.getElementById("enrollment-date").value =
            enrollment.date;

        document.getElementById("enrollment-status").value =
            enrollment.status || "Enrolled";

        enrollmentModal.style.display = "flex";

        return;
    }


    // DELETE ENROLLMENT

    const deleteButton = event.target.closest(".delete-enrollment-btn");

    if (deleteButton) {

        // Only Admin can delete enrollments
        if (!currentUser || currentUser.role !== "admin") {
            alert("Only the Admin can delete enrollments.");
            return;
        }

        const enrollmentId = Number(deleteButton.dataset.id);

        const confirmDelete = confirm(
            "Are you sure you want to delete this enrollment?"
        );

        if (!confirmDelete) return;

        enrollments = enrollments.filter(
            enrollment => enrollment.id !== enrollmentId
        );

        saveEnrollments();

        renderEnrollments(enrollmentSearch.value, enrollmentStatusFilter.value);
    }
});
