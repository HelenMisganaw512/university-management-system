// ==========================================
// 2. DATA AND LOCAL STORAGE
// ==========================================

// Test user accounts
const defaultUsers = [
    {
        email: "admin@ums.com",
        password: "admin123",
        role: "admin",
        name: "Admin User"
    },
    {
        email: "teacher@ums.com",
        password: "teacher123",
        role: "teacher",
        name: "Teacher User"
    }
];

let users = readList("umsUsers").filter(user => user && user.email);

// Make sure the default admin account exists
const adminAccount = users.find(user =>
    user.email.toLowerCase() === "admin@ums.com"
);

if (!adminAccount) {
    // First run only: create the admin with the default password
    users.push(defaultUsers[0]);
} else {
    // Keep the saved password, only make sure this account stays an admin
    adminAccount.role = "admin";
}

// Make sure the default teacher account exists
const teacherAccount = users.find(user =>
    user.email.toLowerCase() === "teacher@ums.com"
);

if (!teacherAccount) {
    users.push(defaultUsers[1]);
}

function saveUsers() {
    localStorage.setItem("umsUsers", JSON.stringify(users));
}

// Give every teacher a permanent ID
users.forEach(user => {

    if (user.role === "teacher" && !user.teacherId) {
        user.teacherId = "T-" + Date.now() + "-" +
            Math.floor(Math.random() * 10000);
    }

});

// Save the corrected accounts
saveUsers();

let students = [];
let courses = [];
let enrollments = [];
let grades = [];
let currentUser = null;
let currentStudent = null;

let editingStudentId = null;
let editingCourseCode = null;
let editingEnrollmentId = null;
let editingGradeId = null;


function saveStudents() {
    localStorage.setItem("students", JSON.stringify(students));
}

function saveCourses() {
    localStorage.setItem("courses", JSON.stringify(courses));
}

function saveEnrollments() {
    localStorage.setItem("enrollments", JSON.stringify(enrollments));
}

function saveGrades() {
    localStorage.setItem("grades", JSON.stringify(grades));
}

function loadGrades() {
    grades = readList("grades");
}

function loadStudents() {
    students = readList("students");
    renderStudents();
}

function loadCourses() {

    courses = readList("courses");

    // Connect old courses to teacher accounts where possible
    courses.forEach(course => {

        if (!course.instructorId) {

            const matchingTeacher = users.find(user =>
                user.role === "teacher" &&
                (
                    (user.name || "").toLowerCase() ===
                    (course.instructor || "").toLowerCase() ||

                    user.email.toLowerCase() ===
                    (course.instructor || "").toLowerCase()
                )
            );

            if (matchingTeacher) {
                course.instructorId = matchingTeacher.teacherId;
                course.instructor = matchingTeacher.name;
            }
        }

    });

    saveCourses();

    renderCourses();
}

function loadEnrollments() {
    enrollments = readList("enrollments");
    renderEnrollments();
}


// ==========================================
// DEMO DATA (created only the first time the app runs)
// ==========================================

function seedDemoDataIfNeeded() {

    // Only run once per browser
    if (localStorage.getItem("umsSeeded")) return;
    localStorage.setItem("umsSeeded", "true");

    // Never overwrite data that already exists
    const alreadyHasData = ["students", "courses", "enrollments", "grades"]
        .some(key => readList(key).length > 0);

    if (alreadyHasData) return;

    const demoTeacher = users.find(user => user.role === "teacher");

    const demoStudents = [
        { id: "UMS-001", name: "Abebe Kebede", email: "abebe@ums.com", department: "Computer Science", year: "3", status: "Active" },
        { id: "UMS-002", name: "Selam Tadesse", email: "selam@ums.com", department: "Computer Science", year: "2", status: "Active" },
        { id: "UMS-003", name: "Mulugeta Alemu", email: "mulugeta@ums.com", department: "Information Technology", year: "4", status: "Active" },
        { id: "UMS-004", name: "Hana Girma", email: "hana@ums.com", department: "Software Engineering", year: "1", status: "Active" },
        { id: "UMS-005", name: "Dawit Bekele", email: "dawit@ums.com", department: "Software Engineering", year: "3", status: "Inactive" },
        { id: "UMS-006", name: "Tigist Haile", email: "student@ums.com", department: "Software Engineering", year: "4", status: "Active" }
    ];

    const demoCourses = [
        { code: "CS101", name: "Introduction to Programming", department: "Computer Science", credits: "3" },
        { code: "SE201", name: "Data Structures and Algorithms", department: "Software Engineering", credits: "4" },
        { code: "IT210", name: "Database Systems", department: "Information Technology", credits: "3" },
        { code: "SE305", name: "Web Development", department: "Software Engineering", credits: "3" }
    ].map(course => ({
        ...course,
        instructorId: demoTeacher ? demoTeacher.teacherId : "",
        instructor: demoTeacher ? demoTeacher.name : ""
    }));

    const enrollmentList = [
        ["UMS-001", "CS101", "2026-09-15", "Enrolled"],
        ["UMS-001", "SE201", "2026-09-15", "Enrolled"],
        ["UMS-002", "CS101", "2026-09-16", "Enrolled"],
        ["UMS-002", "IT210", "2026-02-10", "Completed"],
        ["UMS-003", "IT210", "2026-09-17", "Enrolled"],
        ["UMS-003", "SE305", "2026-09-17", "Enrolled"],
        ["UMS-004", "SE201", "2026-09-18", "Enrolled"],
        ["UMS-005", "CS101", "2026-09-18", "Dropped"],
        ["UMS-006", "SE305", "2026-09-19", "Enrolled"],
        ["UMS-006", "SE201", "2026-02-12", "Completed"],
        ["UMS-006", "CS101", "2026-09-19", "Enrolled"]
    ];

    const demoEnrollments = enrollmentList.map((item, index) => ({
        id: Date.now() + index,
        studentId: item[0],
        courseCode: item[1],
        date: item[2],
        status: item[3]
    }));

    const gradeList = [
        ["UMS-001", "CS101", 76],
        ["UMS-002", "IT210", 82],
        ["UMS-003", "IT210", 68],
        ["UMS-006", "SE201", 91]
    ];

    const demoGrades = gradeList.map((item, index) => {

        const result = calculateGrade(item[2]);

        return {
            id: Date.now() + 100 + index,
            studentId: item[0],
            courseCode: item[1],
            score: item[2],
            letter: result.letter,
            point: result.point
        };
    });

    // Create a login account for every demo student (password: student123)
    demoStudents.forEach(student => {

        const hasAccount = users.some(user =>
            user.email.toLowerCase() === student.email.toLowerCase()
        );

        if (!hasAccount) {
            users.push({
                email: student.email,
                password: "student123",
                role: "student",
                name: student.name
            });
        }
    });

    saveUsers();

    localStorage.setItem("students", JSON.stringify(demoStudents));
    localStorage.setItem("courses", JSON.stringify(demoCourses));
    localStorage.setItem("enrollments", JSON.stringify(demoEnrollments));
    localStorage.setItem("grades", JSON.stringify(demoGrades));
}

function ensureDemoStudent() {
    const demoStudent = {
        id: "UMS-006",
        name: "Tigist Haile",
        email: "student@ums.com",
        department: "Software Engineering",
        year: "4",
        status: "Active"
    };

    // Check whether the student record already exists
    const studentExists = students.some(student =>
        student.email?.toLowerCase() === demoStudent.email.toLowerCase()
    );

    if (!studentExists) {
        students.push(demoStudent);
        saveStudents();
    }

    // Check whether the login account already exists
    const accountExists = users.some(user =>
        user.email.toLowerCase() === demoStudent.email.toLowerCase()
    );

    if (!accountExists) {
        users.push({
            email: "student@ums.com",
            password: "student123",
            role: "student",
            name: "Tigist Haile"
        });
        saveUsers();
    }
}