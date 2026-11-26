
// ==========================================
// GRADE MODAL ELEMENTS
// ==========================================

const addGradeBtn = document.getElementById("add-grade-btn");
const gradeModal = document.getElementById("grade-modal");

const closeGradeModal = document.getElementById("close-grade-modal");
const cancelGradeModal = document.getElementById("cancel-grade-modal");

const gradeForm = document.getElementById("grade-form");

const gradeStudent = document.getElementById("grade-student");

// Update courses when student selection changes
gradeStudent.addEventListener("change", function () {
    populateGradeCourses();
});

const gradeCourse = document.getElementById("grade-course");
const gradeScore = document.getElementById("grade-score");

const gradesSearch = document.getElementById("grades-search");
const gradesTableBody = document.getElementById("grades-table-body");


// ==========================================
// OPEN GRADE MODAL
// ==========================================

addGradeBtn.addEventListener("click", function () {

    // Only Admin and Teachers can add grades
    if (
        !currentUser ||
        (currentUser.role !== "admin" &&
            currentUser.role !== "teacher")
    ) {
        alert("You are not allowed to manage grades.");
        return;
    }

    gradeForm.reset();

    // Make sure we are in "add" mode, not left over from an edit
    editingGradeId = null;

    gradeModal.querySelector(".modal-header h2").textContent =
        "Add New Grade";

    gradeForm.querySelector('button[type="submit"]').textContent =
        "Save Grade";

    populateGradeStudents();

    gradeModal.style.display = "flex";
});


// Close Grade Modal
closeGradeModal.addEventListener("click", function () {
    gradeModal.style.display = "none";
});


// Cancel Grade Modal
cancelGradeModal.addEventListener("click", function () {
    gradeModal.style.display = "none";
});


// ==========================================
// POPULATE GRADE STUDENT DROPDOWN
// ==========================================

function populateGradeStudents() {

    gradeStudent.innerHTML =
        '<option value="">Choose a student</option>';

    // Get students from active enrollments
    const activeEnrollments = enrollments.filter(enrollment =>
        enrollment.status === "Enrolled"
    );

    // Determine which enrollments the user can access
    const visibleEnrollments =
        currentUser && currentUser.role === "teacher"
            ? activeEnrollments.filter(enrollment =>
                courses.some(course =>
                    course.code === enrollment.courseCode &&
                    course.instructorId === currentUser.teacherId
                )
            )
            : activeEnrollments;

    // Get unique student IDs
    const uniqueStudentIds = [
        ...new Set(
            visibleEnrollments.map(enrollment => enrollment.studentId)
        )
    ];

    uniqueStudentIds.forEach(studentId => {

        const student = students.find(
            student => student.id === studentId
        );

        if (student) {

            const option = document.createElement("option");

            option.value = student.id;
            option.textContent = student.name;

            gradeStudent.appendChild(option);
        }
    });
}


// ==========================================
// ADD NEW GRADE
// ==========================================

gradeForm.addEventListener("submit", function (event) {

    event.preventDefault();

    // Only Admin and Teachers can manage grades
    if (
        !currentUser ||
        (currentUser.role !== "admin" &&
            currentUser.role !== "teacher")
    ) {
        alert("You are not allowed to manage grades.");
        return;
    }

    const studentId = gradeStudent.value;
    const courseCode = gradeCourse.value;
    const score = Number(gradeScore.value);

    if (!studentId || !courseCode || gradeScore.value === "") {
        alert("Please complete all grade information.");
        return;
    }

    // Prevent duplicate grades for the same student and course
    const duplicateGrade = grades.some(grade =>
        String(grade.studentId) === String(studentId) &&
        grade.courseCode === courseCode &&
        grade.id !== editingGradeId
    );

    if (duplicateGrade) {
        alert("This student already has a grade for this course. Please edit the existing grade instead.");
        return;
    }

    // Find the selected course
    const selectedCourse = courses.find(
        course => course.code === courseCode
    );

    if (!selectedCourse) {
        alert("Invalid course selected.");
        return;
    }

    // Check whether the student is actively enrolled
    const isEnrolled = enrollments.some(enrollment =>
        enrollment.studentId === studentId &&
        enrollment.courseCode === courseCode &&
        enrollment.status === "Enrolled"
    );

    if (!isEnrolled) {
        alert("This student is not actively enrolled in the selected course.");
        return;
    }

    // Teacher permission checks
    if (currentUser.role === "teacher") {

        // Check whether this course belongs to the teacher
        if (selectedCourse.instructorId !== currentUser.teacherId) {
            alert("You can only manage grades for your assigned courses.");
            return;
        }

        // When editing, verify the existing grade belongs to an assigned course
        if (editingGradeId !== null) {

            const existingGrade = grades.find(
                grade => grade.id === editingGradeId
            );

            if (
                !existingGrade ||
                !courses.some(course =>
                    course.code === existingGrade.courseCode &&
                    course.instructorId === currentUser.teacherId
                )
            ) {
                alert("You cannot modify another teacher's grades.");
                return;
            }
        }
    }

    if (!Number.isFinite(score) || score < 0 || score > 100) {
        alert("Please enter a valid score between 0 and 100.");
        return;
    }

    const result = calculateGrade(score);

    if (editingGradeId !== null) {

        // UPDATE EXISTING GRADE

        const index = grades.findIndex(
            grade => grade.id === editingGradeId
        );

        if (index !== -1) {
            grades[index] = {
                ...grades[index],
                studentId: studentId,
                courseCode: courseCode,
                score: score,
                letter: result.letter,
                point: result.point
            };
        }

    } else {

        // CREATE NEW GRADE

        const newGrade = {
            id: Date.now(),
            studentId: studentId,
            courseCode: courseCode,
            score: score,
            letter: result.letter,
            point: result.point
        };

        grades.push(newGrade);
    }

    saveGrades();

    renderGrades();

    gradeForm.reset();

    editingGradeId = null;

    gradeModal.querySelector(".modal-header h2").textContent =
        "Add New Grade";

    gradeForm.querySelector('button[type="submit"]').textContent =
        "Save Grade";

    gradeModal.style.display = "none";

    alert("Grade saved successfully!");
});


// ==========================================
// POPULATE GRADE COURSE DROPDOWN
// ==========================================

function populateGradeCourses() {

    gradeCourse.innerHTML =
        '<option value="">Choose a course</option>';

    const selectedStudentId = gradeStudent.value;

    const enrolledCourseCodes = enrollments
        .filter(enrollment =>
            String(enrollment.studentId) === String(selectedStudentId) &&
            enrollment.status === "Enrolled"
        )
        .map(enrollment => enrollment.courseCode);

    // Remove duplicate course codes
    const uniqueCourseCodes = [...new Set(enrolledCourseCodes)];

    uniqueCourseCodes.forEach(courseCode => {

        const course = courses.find(
            course => course.code === courseCode
        );

        if (!course) return;

        // Teachers can only select their assigned courses
        if (
            currentUser &&
            currentUser.role === "teacher" &&
            course.instructorId !== currentUser.teacherId
        ) {
            return;
        }

        const option = document.createElement("option");

        option.value = course.code;
        option.textContent = `${course.code} - ${course.name}`;

        gradeCourse.appendChild(option);
    });
}


// ==========================================
// CALCULATE LETTER GRADE AND GRADE POINT
// ==========================================

function calculateGrade(score) {

    if (score >= 90) {
        return { letter: "A+", point: 4.0 };
    } else if (score >= 85) {
        return { letter: "A", point: 4.0 };
    } else if (score >= 80) {
        return { letter: "A-", point: 3.75 };
    } else if (score >= 75) {
        return { letter: "B+", point: 3.5 };
    } else if (score >= 70) {
        return { letter: "B", point: 3.0 };
    } else if (score >= 65) {
        return { letter: "B-", point: 2.75 };
    } else if (score >= 60) {
        return { letter: "C+", point: 2.5 };
    } else if (score >= 50) {
        return { letter: "C", point: 2.0 };
    } else {
        return { letter: "F", point: 0 };
    }
}


// ==========================================
// DISPLAY GRADES
// ==========================================

function renderGrades(searchTerm = "") {

    gradesTableBody.innerHTML = "";

    const searchValue = searchTerm.toLowerCase();

    const isStudent =
        currentUser && currentUser.role === "student";

    const isTeacher =
        currentUser && currentUser.role === "teacher";

    // Determine which grades each role can access
    let visibleGrades = [];

    if (isStudent) {

        // Students see only their own grades
        visibleGrades = grades.filter(grade =>
            String(grade.studentId) === String(currentStudent?.id)
        );

    } else if (isTeacher) {

        // Teachers see grades only for their assigned courses
        visibleGrades = grades.filter(grade =>
            courses.some(course =>
                course.code === grade.courseCode &&
                course.instructorId === currentUser.teacherId
            )
        );

    } else if (currentUser && currentUser.role === "admin") {

        // Admin sees all grades
        visibleGrades = grades;
    }

    // Apply search filter
    const filteredGrades = visibleGrades.filter(grade => {

        const student = students.find(
            student => student.id === grade.studentId
        );

        const course = courses.find(
            course => course.code === grade.courseCode
        );

        const studentName = student ? student.name : "Unknown Student";
        const courseName = course ? course.name : "Unknown Course";

        return (
            studentName.toLowerCase().includes(searchValue) ||
            courseName.toLowerCase().includes(searchValue) ||
            grade.courseCode.toLowerCase().includes(searchValue)
        );
    });

    // Display grades
    filteredGrades.forEach(grade => {

        const student = students.find(
            student => student.id === grade.studentId
        );

        const course = courses.find(
            course => course.code === grade.courseCode
        );

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${student ? student.name : "Unknown Student"}</td>
            <td>${course ? course.name : "Unknown Course"}</td>
            <td>${grade.courseCode}</td>
            <td>${grade.score}</td>
            <td>${grade.letter}</td>
            <td>${grade.point.toFixed(2)}</td>

            <td>
                ${!isStudent ? `
                    <button class="edit-grade-btn" data-id="${grade.id}">
                        Edit
                    </button>

                    <button class="delete-grade-btn" data-id="${grade.id}">
                        Delete
                    </button>
                ` : "View Only"}
            </td>
        `;

        gradesTableBody.appendChild(row);
    });

    if (filteredGrades.length === 0) {

        let message;

        if (visibleGrades.length === 0) {

            if (currentUser && currentUser.role === "admin" && grades.length === 0) {
                message = "No grades have been recorded yet.";
            } else {
                message = "No grades are available for your account yet.";
            }

        } else {
            message = "No grades match your search.";
        }

        gradesTableBody.innerHTML = `
        <tr>
            <td colspan="7" class="empty-state">
                <div class="empty-state-content">
                    <span class="empty-state-icon">📊</span>
                    <h3>No Grades Found</h3>
                    <p>${message}</p>
                </div>
            </td>
        </tr>
    `;
    }

    updateGradeStats(visibleGrades);

    // Only Admin gets university-wide report statistics
    if (currentUser && currentUser.role === "admin") {
        updateReportsStats();
    }
}


// Grade Search
gradesSearch.addEventListener("input", function () {
    renderGrades(gradesSearch.value);
});


// ==========================================
// EDIT AND DELETE GRADE
// ==========================================

gradesTableBody.addEventListener("click", function (event) {

    // EDIT GRADE

    const editButton = event.target.closest(".edit-grade-btn");

    if (editButton) {

        // Only Admin and Teachers can edit grades
        if (
            !currentUser ||
            (currentUser.role !== "admin" &&
                currentUser.role !== "teacher")
        ) {
            alert("You are not allowed to edit grades.");
            return;
        }

        const gradeId = Number(editButton.dataset.id);

        const grade = grades.find(
            grade => grade.id === gradeId
        );

        if (!grade) return;

        // Teachers can edit only grades for their assigned courses
        if (currentUser.role === "teacher") {

            const assignedCourse = courses.some(course =>
                course.code === grade.courseCode &&
                course.instructorId === currentUser.teacherId
            );

            if (!assignedCourse) {
                alert("You cannot edit another teacher's grades.");
                return;
            }
        }

        editingGradeId = gradeId;

        populateGradeStudents();

        gradeStudent.value = grade.studentId;

        populateGradeCourses();

        gradeCourse.value = grade.courseCode;

        gradeScore.value = grade.score;

        gradeModal.querySelector(".modal-header h2").textContent =
            "Edit Grade";

        gradeForm.querySelector('button[type="submit"]').textContent =
            "Update Grade";

        gradeModal.style.display = "flex";

        return;
    }


    // DELETE GRADE

    const deleteButton = event.target.closest(".delete-grade-btn");

    if (deleteButton) {

        // Only Admin and Teachers can delete grades
        if (
            !currentUser ||
            (currentUser.role !== "admin" &&
                currentUser.role !== "teacher")
        ) {
            alert("You are not allowed to delete grades.");
            return;
        }

        const gradeId = Number(deleteButton.dataset.id);

        const grade = grades.find(
            grade => grade.id === gradeId
        );

        if (!grade) return;

        // Teachers can delete only grades for their assigned courses
        if (currentUser.role === "teacher") {

            const assignedCourse = courses.some(course =>
                course.code === grade.courseCode &&
                course.instructorId === currentUser.teacherId
            );

            if (!assignedCourse) {
                alert("You cannot delete another teacher's grades.");
                return;
            }
        }

        const confirmDelete = confirm(
            "Are you sure you want to delete this grade?"
        );

        if (!confirmDelete) return;

        grades = grades.filter(
            grade => grade.id !== gradeId
        );

        saveGrades();

        renderGrades(gradesSearch.value);
    }
});


// ==========================================
// UPDATE GRADE STATISTICS
// ==========================================

function updateGradeStats(gradesToDisplay = grades) {

    // Total Grade Records
    document.getElementById("total-grades-count").textContent =
        gradesToDisplay.length;

    // Average Score
    const totalScore = gradesToDisplay.reduce(
        (sum, grade) => sum + grade.score,
        0
    );

    const averageScore = gradesToDisplay.length > 0
        ? totalScore / gradesToDisplay.length
        : 0;

    document.getElementById("average-grade-score").textContent =
        averageScore.toFixed(2);

    // Unique Students Who Passed
    const passedStudentIds = gradesToDisplay
        .filter(grade => grade.score >= 50)
        .map(grade => grade.studentId);

    const uniquePassedStudents = new Set(passedStudentIds);

    document.getElementById("passed-students-count").textContent =
        uniquePassedStudents.size;
}
