# University Management System (UMS)

## Overview

The University Management System (UMS) is a web-based application developed to simplify and organize common university management activities. It provides a centralized platform where administrators, teachers, and students can access features according to their assigned roles.

The system aims to make academic information easier to manage, improve access to student and course records, and provide a simple and user-friendly experience.

This project was developed as a Software Engineering academic project to demonstrate practical front-end development, role-based access, and the implementation of a university management application.

## Features

### 1. User Authentication and Role-Based Access

- Login system for administrators, teachers, and students.
- Different dashboards and navigation options based on user roles.
- Session persistence using browser Local Storage.

### 2. Student Management

- Add, view, update, and delete student records.
- Manage student information in an organized table.

### 3. Teacher Management

- Add, view, update, and delete teacher records.
- Maintain teacher information and assignments.

### 4. Course Management

- Create and manage courses.
- View course details, including course codes and credit hours.
- Manage course instructor assignments.

### 5. Enrollment Management

- Register students for courses.
- View and manage enrollment records.
- Allow teachers to view enrollments related to their assigned courses.

### 6. Grade Management

- Record and manage student grades.
- Allow students to view their own academic results.

### 7. Reports

- View academic and management statistics.
- Export reports in PDF and CSV formats.

### 8. Settings

- Update university information and academic settings.
- Change account passwords.

### 9. Responsive Design

- User-friendly interface for desktop and mobile devices.
- Responsive layouts for different screen sizes.

## Technologies Used

- **HTML5** – Structures the application pages and content.
- **CSS3** – Handles styling, layouts, and responsive design.
- **JavaScript** – Implements application functionality, data management, and user interactions.
- **Local Storage** – Stores application data and session information in the browser.
- **jsPDF** – Supports PDF report generation.

## Project Structure

```text
university-management-system/
│
├── index.html
│
├── css/
│   ├── base.css
│   ├── login.css
│   ├── layout.css
│   ├── dashboard.css
│   ├── pages.css
│   ├── tables.css
│   ├── modals-forms.css
│   ├── reports.css
│   ├── settings.css
│   ├── toast.css
│   └── responsive.css
│
└── js/
    ├── helpers.js
    ├── navigation.js
    ├── data.js
    ├── dashboard.js
    ├── students.js
    ├── teachers.js
    ├── courses.js
    ├── enrollments.js
    ├── grades.js
    ├── auth.js
    ├── reports.js
    ├── settings.js
    └── main.js
```

## Demo Accounts

The application provides three sample accounts for testing the different user roles.

| Role          | Email                                      | Password   |
| ------------- | ------------------------------------------ | ---------- |
| Administrator | [admin@ums.com](mailto\:admin@ums.com)     | admin123\* |
| Teacher       | [teacher@ums.com](mailto\:teacher@ums.com) | teacher123 |
| Student       | [student@ums.com](mailto\:student@ums.com) | student123 |

## Author

Developed as a Software Engineering academic project.

## License

This project is intended for educational
