/* ==========================================
   18. INITIALIZE APPLICATION
========================================== */

seedDemoDataIfNeeded();

loadCourses();
loadStudents();

ensureDemoStudent();  // ← add here

loadEnrollments();
loadGrades();

renderStudents();
renderTeachers();
renderGrades();

updateDashboardStats();