// ==========================================
// 1. SIDEBAR NAVIGATION
// ==========================================

const navLinks = document.querySelectorAll(".nav-link");
const pages = document.querySelectorAll(".page-section");
const pageTitle = document.querySelector(".page-heading h1");

// Pages each role is allowed to access
const pagePermissions = {
    admin: ["dashboard", "students", "teachers", "courses", "enrollments", "grades", "reports", "settings", "profile"],

    teacher: ["dashboard", "courses", "enrollments", "grades", "profile"],
    student: ["dashboard", "my-courses", "grades", "profile"]
};

// Title shown at the top of each page
const pageTitles = {
    "dashboard": "Dashboard",
    "my-courses": "My Courses",
    "students": "Students",
    "teachers": "Teachers",
    "courses": "Courses",
    "enrollments": "Enrollments",
    "grades": "Grades",
    "reports": "Reports",
    "settings": "Settings",
    "profile": "My Profile"
};


// Show only the pages allowed for the logged-in user
function applyRolePermissions() {

    const allowedPages = pagePermissions[currentUser.role];

    navLinks.forEach(link => {

        const pageId = link.dataset.page;

        if (allowedPages.includes(pageId)) {
            link.style.display = "";
        } else {
            link.style.display = "none";
        }

    });
}

// Open a page (used by sidebar links and quick action buttons)
function navigateTo(pageId) {

    if (!currentUser) return;

    const allowedPages = pagePermissions[currentUser.role];

    if (!allowedPages.includes(pageId)) return;

    // Highlight the matching sidebar link only
    document.querySelectorAll(".sidebar-nav .nav-link").forEach(link => {
        link.classList.toggle("active", link.dataset.page === pageId);
    });

    pages.forEach(page => {
        page.classList.toggle("active", page.id === pageId);
    });

    pageTitle.textContent = pageTitles[pageId] || pageId;
}

navLinks.forEach(link => {
    link.addEventListener("click", function (event) {
        event.preventDefault();
        navigateTo(link.dataset.page);
    });
});