# UniConnect - Smart Campus Management System

UniConnect is a comprehensive MERN stack web application designed to streamline campus management. It provides a unified platform for Administrators, Faculty, and Students to manage academic activities, attendance, exams, and communication.

## Features

### 1. Unified Authentication
- **Initial Setup**: Role-based access (Student, Faculty, Admin).
- **Security**: JWT Authentication, Password Hashing (bcrypt).

### 2. Role-Based Dashboards
- **Admin**: Manage Users (Future), Courses, Exams, and Campus Notices.
- **Faculty**: Manage Subjects, Mark Attendance, Upload Exam Marks.
- **Student**: View Enrolled Courses, Check Attendance, View Exam Results.

### 3. Course & Academic Management
- Create and Manage Courses and Subjects.
- Assign Faculty to Subjects.
- Student Enrollment (Simulated via Semester/Department logic).

### 4. Digital Attendance System
- **Faculty**: Mark daily attendance for assigned subjects.
- **Student**: View subject-wise attendance percentage and status.

### 5. Examination & Results
- **Admin**: Schedule Exams (Mid-Sem, Finals, etc.).
- **Faculty**: Upload marks for students.
- **Student**: View academic performance and grades.

### 6. Notifications
- **Admin**: Post campus-wide or role-specific notices.
- **All Users**: Real-time access to relevant notices on the dashboard.

## Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Axios, React Router, React Toastify.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose).
- **Tools**: Postman (API Testing), Git.

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB (Local or Atlas) running on port 27017

### Installation

1.  **Clone the Repository**
    ```bash
    git clone <repository_url>
    cd SmartCampus
    ```

2.  **Server Setup**
    ```bash
    cd server
    npm install
    # Define .env file:
    # PORT=5000
    # MONGO_URI=mongodb://localhost:27017/uniconnect
    # JWT_SECRET=your_secret_key
    ```
    Start the server:
    ```bash
    node index.js
    ```

3.  **Client Setup**
    ```bash
    cd ../client
    npm install
    ```
    Start the frontend:
    ```bash
    npm run dev
    ```

4.  **Access the Application**
    Open `http://localhost:5173` in your browser.

## Default Credentials (for testing)

Ensure you register at least one user for each role via the `/register` page to get started.
- **Admin Code**: (Not implemented in this demo, manually update role in DB or add logic)
    - *Note*: You can manually update a user's role to 'admin' in MongoDB Compass.

## License
MIT
