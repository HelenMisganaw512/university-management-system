
const addCourseBtn = document.getElementById("add-course-btn");

document.getElementById("quick-add-course").addEventListener("click", () => {
    addCourseBtn.click();
});

const courseModal = document.getElementById("course-modal");

const closeCourseModal = document.getElementById("close-course-modal");
const cancelCourseModal = document.getElementById("cancel-course-modal");

const courseForm = document.getElementById("course-form");
const coursesTableBody = document.getElementById("courses-table-body");
const courseSearch = document.getElementById("course-search");

// Populate the course instructor dropdown
function populateTeacherDropdown() {

    const instructorSelect =
        document.getElementById("course-instructor");

    instructorSelect.innerHTML =
        '<option value="">Select a teacher</option>';

    const teacherAccounts = users.filter(user =>
        user.role === "teacher"
    );

    teacherAccounts.forEach(teacher => {

        const option = document.createElement("option");

        option.value = teacher.teacherId;
        option.textContent = teacher.name;

        instructorSelect.appendChild(option);
    });
}

// Open Course Modal
addCourseBtn.addEventListener("click", function () {

    if (!currentUser || currentUser.role !== "admin") {
        alert("Only the Admin can manage courses.");
        return;
    }

    courseForm.reset();

    populateTeacherDropdown();

    editingCourseCode = null;

    courseModal.querySelector(".modal-header h2").textContent =
        "Add New Course";

    courseForm.querySelector('button[type="submit"]').textContent =
        "Save Course";

    courseModal.style.display = "flex";
});

// Close Course Modal
closeCourseModal.addEventListener("click", function () {
    courseModal.style.display = "none";
});

cancelCourseModal.addEventListener("click", function () {
    courseModal.style.display = "none";
});

// ==========================================
// DISPLAY COURSES
// ==========================================

function renderCourses(searchTerm = "") {

    coursesTableBody.innerHTML = "";

    // Teachers can only see their assigned courses
    const visibleCourses =
        currentUser && currentUser.role === "teacher"
            ? courses.filter(course =>
                course.instructorId === currentUser.teacherId
            )
            : courses;

    const filteredCourses = visibleCourses.filter(course => {

        return (
            course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.department.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    filteredCourses.forEach(course => {

        const assignedTeacher = users.find(user =>
            user.role === "teacher" &&
            user.teacherId === course.instructorId
        );

        const instructorName = assignedTeacher
            ? assignedTeacher.name
            : course.instructor || "Unassigned";

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${course.code}</td>
            <td>${course.name}</td>
            <td>${course.department}</td>
            <td>${course.credits}</td>
            <td>${instructorName}</td>
            <td>
                ${currentUser && currentUser.role === "admin" ? `
                    <button class="edit-course-btn" data-code="${course.code}">
                        Edit
                    </button>

                    <button class="delete-course-btn" data-code="${course.code}">
                        Delete
                    </button>
                ` : "View Only"}
            </td>
        `;

        coursesTableBody.appendChild(row);
    });

    if (filteredCourses.length === 0) {

        let message;

        if (visibleCourses.length === 0) {
            message = currentUser && currentUser.role === "teacher"
                ? "No courses have been assigned to you yet."
                : "No courses have been added yet.";
        } else {
            message = "No courses match your search.";
        }

        coursesTableBody.innerHTML = `
        <tr>
            <td colspan="6" class="empty-state">
                <div class="empty-state-content">
                    <span class="empty-state-icon">📚</span>
                    <h3>No Courses Found</h3>
            <p>${message}</p>
                </div>
            </td>
        </tr>
        `;
    }

    updateDashboardStats();
}

// Course Search
courseSearch.addEventListener("input", function () {
    renderCourses(courseSearch.value);
});

// ==========================================
// ADD AND UPDATE COURSES
// ==========================================

courseForm.addEventListener("submit", function (event) {

    // Always stop the browser from submitting the form natively
    event.preventDefault();

    if (!currentUser || currentUser.role !== "admin") {
        alert("Only the Admin can manage courses.");
        return;
    }

    const selectedTeacherId =
        document.getElementById("course-instructor").value;

    const selectedTeacher = users.find(user =>
        user.role === "teacher" &&
        user.teacherId === selectedTeacherId
    );

    if (!selectedTeacher) {
        alert("Please select a valid teacher.");
        return;
    }

    const newCourse = {
        code: document.getElementById("course-code").value.trim(),
        name: document.getElementById("course-name").value.trim(),
        department: document.getElementById("course-department").value.trim(),
        credits: document.getElementById("course-credits").value,
        instructorId: selectedTeacher.teacherId,
        instructor: selectedTeacher.name
    };

    const duplicateCourse = courses.some(course =>
        course.code.toLowerCase() === newCourse.code.toLowerCase() &&
        course.code !== editingCourseCode
    );

    if (duplicateCourse) {
        alert("A course with this code already exists.");
        return;
    }

    if (editingCourseCode !== null) {

        // UPDATE EXISTING COURSE
        const index = courses.findIndex(
            course => course.code === editingCourseCode
        );

        if (index !== -1) {

            // Keep existing enrollments connected to the updated course
            enrollments.forEach(enrollment => {
                if (enrollment.courseCode === editingCourseCode) {
                    enrollment.courseCode = newCourse.code;
                }
            });

            // Keep existing grades connected to the updated course
            grades.forEach(grade => {
                if (grade.courseCode === editingCourseCode) {
                    grade.courseCode = newCourse.code;
                }
            });

            courses[index] = newCourse;

            saveEnrollments();
            saveGrades();
        }

        editingCourseCode = null;

    } else {
        courses.push(newCourse);
    }

    saveCourses();

    renderCourses(courseSearch.value);

    courseForm.reset();

    courseModal.style.display = "none";

    courseModal.querySelector(".modal-header h2").textContent =
        "Add New Course";

    courseForm.querySelector('button[type="submit"]').textContent =
        "Save Course";

    renderEnrollments();
});

// ==========================================
// EDIT AND DELETE COURSES
// ==========================================

coursesTableBody.addEventListener("click", function (event) {

    if (!currentUser || currentUser.role !== "admin") {
        alert("Only the Admin can edit or delete courses.");
        return;
    }

    const editButton = event.target.closest(".edit-course-btn");
    const deleteButton = event.target.closest(".delete-course-btn");

    // EDIT COURSE
    if (editButton) {

        const courseCode = editButton.dataset.code;

        const course = courses.find(
            course => course.code === courseCode
        );

        if (!course) return;

        document.getElementById("course-code").value = course.code;
        document.getElementById("course-name").value = course.name;
        document.getElementById("course-department").value = course.department;
        document.getElementById("course-credits").value = course.credits;

        populateTeacherDropdown();

        document.getElementById("course-instructor").value =
            course.instructorId || "";

        editingCourseCode = course.code;

        courseModal.querySelector(".modal-header h2").textContent =
            "Edit Course";

        courseForm.querySelector('button[type="submit"]').textContent =
            "Update Course";

        courseModal.style.display = "flex";

        return;
    }

    // DELETE COURSE
    if (deleteButton) {

        const courseCode = deleteButton.dataset.code;

        const confirmDelete = confirm(
            "Are you sure you want to delete this course?"
        );

        if (!confirmDelete) return;

        // Remove the course
        courses = courses.filter(
            course => course.code !== courseCode
        );

        // Remove enrollments connected to this course
        enrollments = enrollments.filter(
            enrollment => enrollment.courseCode !== courseCode
        );

        // Remove grades connected to this course
        grades = grades.filter(
            grade => grade.courseCode !== courseCode
        );

        // Save all updated data
        saveCourses();
        saveEnrollments();
        saveGrades();

        // Refresh tables and statistics
        renderCourses(courseSearch.value);
        renderEnrollments(enrollmentSearch.value, enrollmentStatusFilter.value);
        renderGrades(gradesSearch.value);
    }

});

// ==========================================
// STUDENT: MY COURSES
// ==========================================

const myCoursesTableBody = document.getElementById("my-courses-table-body");

function renderMyCourses() {

    if (!myCoursesTableBody) return;

    myCoursesTableBody.innerHTML = "";

    if (!currentUser || currentUser.role !== "student" || !currentStudent) {
        return;
    }

    const myEnrollments = enrollments.filter(enrollment =>
        String(enrollment.studentId) === String(currentStudent.id)
    );

    myEnrollments.forEach(enrollment => {

        const course = courses.find(course =>
            course.code === enrollment.courseCode
        );

        if (!course) return;

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${course.code}</td>
            <td>${course.name}</td>
            <td>${course.credits}</td>
            <td>${course.instructor || "Not Assigned"}</td>
            <td>${enrollment.date}</td>
            <td>
                <span class="status-badge ${(enrollment.status || "Enrolled").toLowerCase()}">
                    ${enrollment.status || "Enrolled"}
                </span>
            </td>
        `;

        myCoursesTableBody.appendChild(row);
    });

    if (myCoursesTableBody.children.length === 0) {
        myCoursesTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    You are not registered for any courses yet.
                </td>
            </tr>
        `;
    }
}