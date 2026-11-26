// ==========================================
// 4. DASHBOARD STATISTICS
// ==========================================


function updateDashboardStats() {

    // Helper to update each dashboard card
    function setCard(titleId, valueId, descriptionId, title, value, description) {
        document.getElementById(titleId).textContent = title;
        document.getElementById(valueId).textContent = value;
        document.getElementById(descriptionId).textContent = description;
    }

    const role = currentUser?.role || "admin";

    // =====================================
    // ADMIN DASHBOARD
    // =====================================
    if (role === "admin") {

        const activeCount = students.filter(student =>
            student.status === "Active"
        ).length;

        setCard(
            "total-students-title",
            "total-students-count",
            "total-students-description",
            "Total Students",
            students.length,
            "Registered students"
        );

        setCard(
            "active-students-title",
            "active-students-count",
            "active-students-description",
            "Active Students",
            activeCount,
            "Currently active students"
        );

        setCard(
            "total-courses-title",
            "total-courses-count",
            "total-courses-description",
            "Total Courses",
            courses.length,
            "Available courses"
        );

        setCard(
            "total-enrollments-title",
            "total-enrollments",
            "total-enrollments-description",
            "Total Enrollments",
            enrollments.length,
            "Current enrollments"
        );

        setCard(
            "total-departments-title",
            "total-departments-count",
            "total-departments-description",
            "Departments",
            getDepartmentCounts().length,
            "Academic departments"
        );

        updateReportsStats();
    }

    // =====================================
    // TEACHER DASHBOARD
    // =====================================
    else if (role === "teacher") {

        const teacherCourses = courses.filter(course =>
            course.instructorId === currentUser.teacherId
        );

        const teacherCourseCodes = teacherCourses.map(course =>
            course.code
        );
        const teacherEnrollments = enrollments.filter(enrollment =>
            teacherCourseCodes.includes(enrollment.courseCode) &&
            (enrollment.status || "Enrolled") === "Enrolled"
        );

        const uniqueStudents = new Set(
            teacherEnrollments.map(enrollment =>
                String(enrollment.studentId)
            )
        );

        const teacherGrades = grades.filter(grade =>
            teacherCourseCodes.includes(grade.courseCode)
        );

        const averageScore = teacherGrades.length > 0
            ? Math.round(
                teacherGrades.reduce((total, grade) =>
                    total + Number(grade.score), 0
                ) / teacherGrades.length
            )
            : 0;

        setCard(
            "total-students-title",
            "total-students-count",
            "total-students-description",
            "Assigned Courses",
            teacherCourses.length,
            "Courses you teach"
        );

        setCard(
            "active-students-title",
            "active-students-count",
            "active-students-description",
            "Enrolled Students",
            uniqueStudents.size,
            "Students in your courses"
        );

        setCard(
            "total-courses-title",
            "total-courses-count",
            "total-courses-description",
            "Active Enrollments",
            teacherEnrollments.length,
            "Current course enrollments"
        );

        setCard(
            "total-enrollments-title",
            "total-enrollments",
            "total-enrollments-description",
            "Grade Records",
            teacherGrades.length,
            "Grades in your courses"
        );

        setCard(
            "total-departments-title",
            "total-departments-count",
            "total-departments-description",
            "Average Score",
            teacherGrades.length > 0 ? averageScore + "%" : "—",
            "Average student score"
        );
    }

    // =====================================
    // STUDENT DASHBOARD
    // =====================================
    else if (role === "student") {

        const myEnrollments = enrollments.filter(enrollment =>
            String(enrollment.studentId) === String(currentStudent?.id)
        );

        const activeEnrollments = myEnrollments.filter(enrollment =>
            (enrollment.status || "Enrolled") === "Enrolled"
        );

        const completedEnrollments = myEnrollments.filter(enrollment =>
            (enrollment.status || "").toLowerCase() === "completed"
        );

        const myGrades = grades.filter(grade =>
            String(grade.studentId) === String(currentStudent?.id)
        );

        const averageScore = myGrades.length > 0
            ? Math.round(
                myGrades.reduce((total, grade) =>
                    total + Number(grade.score), 0
                ) / myGrades.length
            )
            : 0;

        const completionRate = myEnrollments.length > 0
            ? Math.round(
                (completedEnrollments.length / myEnrollments.length) * 100
            )
            : 0;

        setCard(
            "total-students-title",
            "total-students-count",
            "total-students-description",
            "My Courses",
            activeEnrollments.length,
            "Currently enrolled courses"
        );

        setCard(
            "active-students-title",
            "active-students-count",
            "active-students-description",
            "Completed Courses",
            completedEnrollments.length,
            "Courses you completed"
        );

        setCard(
            "total-courses-title",
            "total-courses-count",
            "total-courses-description",
            "My Grades",
            myGrades.length,
            "Available grade records"
        );

        setCard(
            "total-enrollments-title",
            "total-enrollments",
            "total-enrollments-description",
            "Average Score",
            myGrades.length > 0 ? averageScore + "%" : "—",
            "Your average score"
        );

        setCard(
            "total-departments-title",
            "total-departments-count",
            "total-departments-description",
            "Course Completion",
            completionRate + "%",
            "Percentage of completed courses"
        );
    }
}


// ==========================================
// REPORTS STATISTICS
// ==========================================

function updateReportsStats() {

    document.getElementById("report-total-students").textContent =
        students.length;

    document.getElementById("report-total-courses").textContent =
        courses.length;

    document.getElementById("report-total-enrollments").textContent =
        enrollments.length;

    document.getElementById("report-total-grades").textContent =
        grades.length;

    // Students by Department
    const departmentList = getDepartmentCounts();

    const departmentReport = document.getElementById("department-report");

    departmentReport.innerHTML = "";
    if (students.length === 0) {
        departmentReport.textContent = "No students registered yet";
        departmentReport.classList.add("empty-state");
    } else {
        departmentReport.classList.remove("empty-state");
    }

    const maxStudents = Math.max(1, ...departmentList.map(item => item.count));

    const totalStudents = students.length;

    departmentList.forEach(item => {

        const reportItem = document.createElement("div");
        reportItem.classList.add("department-item");

        const label = document.createElement("p");
        label.textContent = item.label;

        const percentage = (item.count / totalStudents * 100).toFixed(1);

        const barContainer = document.createElement("div");
        barContainer.classList.add("progress-bar");

        const bar = document.createElement("div");
        bar.classList.add("progress-fill");

        bar.style.width = (item.count / maxStudents * 100) + "%";

        const countText = document.createElement("span");
        countText.textContent = item.count + " students (" + percentage + "%)";

        barContainer.appendChild(bar);

        reportItem.appendChild(label);
        reportItem.appendChild(barContainer);
        reportItem.appendChild(countText);

        departmentReport.appendChild(reportItem);
    });

    // Grade Distribution
    const gradeCounts = {};

    grades.forEach(grade => {

        const letter = grade.letter;

        if (gradeCounts[letter]) {
            gradeCounts[letter]++;
        } else {
            gradeCounts[letter] = 1;
        }

    });

    const gradeReport = document.getElementById("grade-report");

    gradeReport.innerHTML = "";

    if (grades.length === 0) {
        gradeReport.textContent = "No grades available yet.";
        gradeReport.classList.add("empty-state");
    } else {
        gradeReport.classList.remove("empty-state");
    }

    const maxGrades = Math.max(1, ...Object.values(gradeCounts));

    const totalGrades = grades.length;

    for (const letter in gradeCounts) {

        const count = gradeCounts[letter];

        const percentage = (count / totalGrades * 100).toFixed(1);

        const reportItem = document.createElement("div");
        reportItem.classList.add("department-item");

        const label = document.createElement("p");
        label.textContent = letter;

        const barContainer = document.createElement("div");
        barContainer.classList.add("progress-bar");

        const bar = document.createElement("div");
        bar.classList.add("progress-fill");

        bar.style.width = (count / maxGrades * 100) + "%";

        const countText = document.createElement("span");
        countText.textContent = count + " records (" + percentage + "%)";

        barContainer.appendChild(bar);

        reportItem.appendChild(label);
        reportItem.appendChild(barContainer);
        reportItem.appendChild(countText);

        gradeReport.appendChild(reportItem);
    }
}