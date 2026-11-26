
function loadSettings() {

    const savedSettings = localStorage.getItem("universitySettings");

    if (!savedSettings) {
        return;
    }

    const settings = JSON.parse(savedSettings);

    document.getElementById("university-name").value = settings.universityName || "";
    document.getElementById("university-email").value = settings.universityEmail || "";
    document.getElementById("university-phone").value = settings.universityPhone || "";
    document.getElementById("academic-year").value = settings.academicYear || "";
    document.getElementById("semester").value = settings.semester || "First Semester";
}

loadSettings();

// ==========================================
// SAVE UNIVERSITY SETTINGS
// ==========================================

document.getElementById("save-settings-btn").addEventListener("click", function () {

    const email = document.getElementById("university-email").value.trim();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email !== "" && !emailPattern.test(email)) {
        alert("Please enter a valid email address!");
        return;
    }

    const settings = {
        universityName: document.getElementById("university-name").value,
        universityEmail: document.getElementById("university-email").value,
        universityPhone: document.getElementById("university-phone").value,
        academicYear: document.getElementById("academic-year").value,
        semester: document.getElementById("semester").value
    };

    localStorage.setItem("universitySettings", JSON.stringify(settings));

    alert("Settings saved successfully!");
});

// ==========================================
// CHANGE PASSWORD
// ==========================================

document.getElementById("change-password-btn").addEventListener("click", function () {

    if (!currentUser) {
        alert("Please log in first.");
        return;
    }

    const currentPassword = document.getElementById("current-password").value;
    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        alert("Please fill in all password fields.");
        return;
    }

    if (currentPassword !== currentUser.password) {
        alert("Your current password is incorrect.");
        return;
    }

    if (newPassword.length < 8) {
        alert("Your new password must be at least 8 characters long.");
        return;
    }

    if (newPassword !== confirmPassword) {
        alert("The new passwords do not match.");
        return;
    }

    if (newPassword === currentPassword) {
        alert("Your new password must be different from your current password.");
        return;
    }

    currentUser.password = newPassword;

    localStorage.setItem("umsUsers", JSON.stringify(users));

    document.getElementById("current-password").value = "";
    document.getElementById("new-password").value = "";
    document.getElementById("confirm-password").value = "";

    alert("Password changed successfully!");
});

// ==========================================
// PROFILE MANAGEMENT
// ==========================================

document.getElementById("save-profile-btn").addEventListener("click", function () {

    if (!currentUser) {
        alert("Please log in first.");
        return;
    }

    const newName = document.getElementById("profile-name").value.trim();

    if (!newName) {
        alert("Name cannot be empty.");
        return;
    }

    currentUser.name = newName;

    // Update the linked student record
    if (currentUser.role === "student" && currentStudent) {
        currentStudent.name = newName;
        saveStudents();
    }

    localStorage.setItem("umsUsers", JSON.stringify(users));

    // Update sidebar and topbar names
    document.getElementById("logged-in-name").textContent = newName;
    document.getElementById("topbar-user-name").textContent = newName;

    // Update welcome message
    document.getElementById("welcome-message").textContent =
        "Welcome back, " + newName + "!";

    alert("Profile updated successfully!");
});
