
const loginForm = document.getElementById("login-form");
const loginPage = document.getElementById("login-page");
const loginError = document.getElementById("login-error");

// ==========================================
// LOGIN / RESTORE SESSION
// ==========================================

function completeLogin(user, showWelcome = true) {

    currentUser = user;

    // Find the student record linked to this login account
    if (user.role === "student") {
        currentStudent = students.find(student =>
            student.email.toLowerCase() === user.email.toLowerCase()
        );

        if (!currentStudent) {
            currentUser = null;
            localStorage.removeItem("umsSession");
            loginError.textContent = "No student record is linked to this account.";
            return false;
        }
    } else {
        currentStudent = null;
    }

    // Save session
    localStorage.setItem("umsSession", user.email);

    // Load profile
    document.getElementById("profile-name").value = user.name;
    document.getElementById("profile-email").value = user.email;
    document.getElementById("profile-role").value =
        user.role.charAt(0).toUpperCase() + user.role.slice(1);

    // Navigation
    navLinks.forEach(link => link.classList.remove("active"));
    document.querySelector('.nav-link[data-page="dashboard"]').classList.add("active");

    pages.forEach(page => page.classList.remove("active"));
    document.getElementById("dashboard").classList.add("active");

    pageTitle.textContent = "Dashboard";

    applyRolePermissions();
    renderGrades();

    addGradeBtn.style.display = user.role === "student" ? "none" : "";
    addCourseBtn.style.display = user.role === "admin" ? "" : "none";
    addEnrollmentBtn.style.display = user.role === "admin" ? "" : "none";
    addTeacherBtn.style.display = user.role === "admin" ? "" : "none";

    // Quick actions
    document.getElementById("admin-quick-actions").style.display =
        user.role === "admin" ? "" : "none";

    document.getElementById("teacher-quick-actions").style.display =
        user.role === "teacher" ? "" : "none";

    document.getElementById("student-quick-actions").style.display =
        user.role === "student" ? "" : "none";

    // Refresh dashboard data
    renderCourses(courseSearch.value);
    renderMyCourses();

    // Refresh enrollments based on the logged-in user's role
    renderEnrollments(
        enrollmentSearch.value,
        enrollmentStatusFilter.value
    );

    updateDashboardStats();

    // User information
    document.getElementById("logged-in-name").textContent = user.name;
    document.getElementById("welcome-message").textContent =
        "Welcome back, " + user.name + "!";
    document.getElementById("topbar-user-name").textContent = user.name;

    const roleNames = {
        admin: "Administrator",
        teacher: "Teacher",
        student: "Student"
    };

    document.getElementById("logged-in-role").textContent = roleNames[user.role];

    loginError.textContent = "";

    loginPage.style.display = "none";
    document.querySelector(".sidebar").style.display = "block";
    document.querySelector(".main-content").style.display = "block";

    if (showWelcome) {
        alert("Welcome, " + user.name + "!");
    }

    return true;
}

// ==========================================
// LOGIN
// ==========================================

loginForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    const user = users.find(account =>
        account.email.toLowerCase() === email.toLowerCase() &&
        account.password === password
    );

    if (user) {
        completeLogin(user, true);
    } else {
        loginError.textContent = "Invalid email or password.";
    }
});

// ==========================================
// RESTORE SESSION
// ==========================================

function restoreSession() {

    const savedEmail = localStorage.getItem("umsSession");

    if (!savedEmail) return;

    const user = users.find(account =>
        account.email.toLowerCase() === savedEmail.toLowerCase()
    );

    if (user) {
        completeLogin(user, false);
    } else {
        localStorage.removeItem("umsSession");
    }
}

restoreSession();

// ==========================================
// LOGOUT
// ==========================================

const logoutBtn = document.getElementById("logout-btn");

logoutBtn.addEventListener("click", function () {

    localStorage.removeItem("umsSession");

    currentUser = null;
    currentStudent = null;

    loginPage.style.display = "flex";
    document.querySelector(".sidebar").style.display = "none";
    document.querySelector(".main-content").style.display = "none";

    loginForm.reset();
    loginError.textContent = "";
});
