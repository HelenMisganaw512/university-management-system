
function exportReportsToExcel() {

    const csvRows = [];

    // Report Title
    csvRows.push(["UNIVERSITY MANAGEMENT SYSTEM REPORT"]);
    csvRows.push([]);

    // Summary Statistics
    csvRows.push(["Summary Statistics"]);
    csvRows.push(["Total Students", students.length]);
    csvRows.push(["Total Courses", courses.length]);
    csvRows.push(["Total Enrollments", enrollments.length]);
    csvRows.push(["Total Grades", grades.length]);
    csvRows.push([]);

    // Students by Department
    csvRows.push(["Students by Department"]);
    csvRows.push(["Department", "Students", "Percentage"]);

    const departmentCounts = {};

    students.forEach(student => {
        const department = student.department;
        departmentCounts[department] =
            (departmentCounts[department] || 0) + 1;
    });

    for (const department in departmentCounts) {
        const count = departmentCounts[department];
        const percentage = students.length > 0
            ? (count / students.length * 100).toFixed(1)
            : "0.0";

        csvRows.push([department, count, percentage + "%"]);
    }

    csvRows.push([]);

    // Grade Distribution
    csvRows.push(["Grade Distribution"]);
    csvRows.push(["Grade", "Records", "Percentage"]);

    const gradeCounts = {};

    grades.forEach(grade => {
        const letter = grade.letter;
        gradeCounts[letter] = (gradeCounts[letter] || 0) + 1;
    });

    for (const letter in gradeCounts) {
        const count = gradeCounts[letter];
        const percentage = grades.length > 0
            ? (count / grades.length * 100).toFixed(1)
            : "0.0";

        csvRows.push([letter, count, percentage + "%"]);
    }

    // Convert data to CSV
    const csvContent = csvRows.map(row =>
        row.map(value =>
            '"' + String(value).replace(/"/g, '""') + '"'
        ).join(",")
    ).join("\n");

    // Create downloadable file
    const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;"
    });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.href = url;
    link.download = "University_Reports.csv";

    link.click();

    URL.revokeObjectURL(url);

}

// Connect CSV Export Button
const exportCSVBtn = document.getElementById("export-csv-btn");

if (exportCSVBtn) {
    exportCSVBtn.addEventListener("click", exportReportsToExcel);
}


// ==========================================
// EXPORT REPORTS TO PDF
// ==========================================

function exportReportsToPDF() {

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    // Professional Report Header

    // University name
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("UNIVERSITY MANAGEMENT SYSTEM", 105, 20, {
        align: "center"
    });

    // Report title
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text("Academic Statistics Report", 105, 29, {
        align: "center"
    });

    // Generation date
    const reportDate = new Date().toLocaleDateString();

    doc.setFontSize(10);
    doc.text("Generated on: " + reportDate, 105, 37, {
        align: "center"
    });

    // Horizontal line
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.8);
    doc.line(20, 43, 190, 43);

    // Summary Statistics
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235);
    doc.text("Summary Statistics", 20, 55);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);

    doc.text("Total Students: " + students.length, 20, 65);
    doc.text("Total Courses: " + courses.length, 20, 73);
    doc.text("Total Enrollments: " + enrollments.length, 20, 81);
    doc.text("Total Grades: " + grades.length, 20, 89);

    // Students by Department
    doc.setFontSize(14);
    doc.text("Students by Department", 20, 105);

    doc.setFontSize(11);

    const departmentCounts = {};

    students.forEach(student => {
        const department = student.department;
        departmentCounts[department] =
            (departmentCounts[department] || 0) + 1;
    });

    let y = 115;

    for (const department in departmentCounts) {

        const count = departmentCounts[department];
        const percentage = students.length > 0
            ? (count / students.length * 100).toFixed(1)
            : "0.0";

        if (y > 270) {
            doc.addPage();
            y = 20;
        }

        doc.text(
            department + ": " + count + " students (" + percentage + "%)",
            20,
            y
        );

        y += 8;
    }

    // Grade Distribution
    y += 12;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235);
    doc.text("Grade Distribution", 20, y);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    y += 10;

    const gradeCounts = {};

    grades.forEach(grade => {
        const letter = grade.letter;
        gradeCounts[letter] = (gradeCounts[letter] || 0) + 1;
    });

    for (const letter in gradeCounts) {

        const count = gradeCounts[letter];
        const percentage = grades.length > 0
            ? (count / grades.length * 100).toFixed(1)
            : "0.0";

        if (y > 270) {
            doc.addPage();
            y = 20;
        }

        doc.text(
            letter + ": " + count + " records (" + percentage + "%)",
            20,
            y
        );

        y += 8;
    }

    // Download PDF
    doc.save("University_Reports.pdf");
}

// Connect PDF Export Button
const exportPDFBtn = document.getElementById("export-pdf-btn");

if (exportPDFBtn) {
    exportPDFBtn.addEventListener("click", exportReportsToPDF);
}
