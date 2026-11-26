// ==========================================
// 0. HELPER FUNCTIONS
// ==========================================

const SESSION_KEY = "umsSessionEmail";

// Escape text before putting it inside innerHTML (prevents XSS)
function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// Read a list from localStorage. If the data is missing or broken, return []
function readList(key) {
    try {
        const parsed = JSON.parse(localStorage.getItem(key));
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
}

// Read an object from localStorage. If the data is missing or broken, return null
function readObject(key) {
    try {
        const parsed = JSON.parse(localStorage.getItem(key));
        return parsed && typeof parsed === "object" ? parsed : null;
    } catch (error) {
        return null;
    }
}

// Small message that appears in the corner and disappears by itself
function showToast(message, type = "info") {

    const container = document.getElementById("toast-container");

    const toast = document.createElement("div");
    toast.className = "toast toast-" + type;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(function () {
        toast.classList.add("hide");
        setTimeout(function () {
            toast.remove();
        }, 300);
    }, 3500);
}

// Students grouped by department (not case sensitive: "CS" and "cs" are the same)
function getDepartmentCounts() {

    const groups = {};

    students.forEach(student => {

        const label = (student.department || "Unknown").trim();
        const key = label.toLowerCase();

        if (!groups[key]) {
            groups[key] = { label: label, count: 0 };
        }

        groups[key].count++;
    });

    return Object.values(groups);
}

// A student can receive a grade if the enrollment is Enrolled or Completed
function isGradableEnrollment(enrollment) {
    const status = enrollment.status || "Enrolled";
    return status === "Enrolled" || status === "Completed";
}