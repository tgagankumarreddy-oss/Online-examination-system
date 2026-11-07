
import React from "react";
import "./App.css";

import QuestionBank from "./admin/QuestionBank";
import ExamManagement from "./admin/ExamManagement";
import StudentLogin from "./examination/StudentLogin";
import StudentDashboard from "./examination/StudentDashboard";
import ExamInterface from "./examination/ExamInterface";
import Results from "./examination/Results";

function App() {

    let page = window.location.pathname;

    if (page === "/admin") {
        return <QuestionBank />;
    }

    if (page === "/admin/exams") {
        return <ExamManagement />;
    }

    if (page === "/student") {
        return <StudentLogin />;
    }

    if (page === "/student/dashboard") {
        return <StudentDashboard />;
    }

    if (page === "/student/exam") {
        return <ExamInterface />;
    }

    if (page === "/student/results") {
        return <Results />;
    }

    return (

        <div className="container">

            <h1>Online Examination System</h1>

            <p>Welcome to the Online Examination System</p>

            <div className="buttons">

                <button
                    onClick={() => window.location.href = "/admin"}
                >
                    Admin Login
                </button>

                <button
                    onClick={() => window.location.href = "/student"}
                >
                    Student Login
                </button>

            </div>

        </div>
    );
}

export default App;
