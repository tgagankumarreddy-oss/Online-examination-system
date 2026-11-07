
import React, { useState } from "react";

function StudentDashboard() {
    const [student] = useState(() => {
        let savedStudent = localStorage.getItem("currentStudent");
        return savedStudent ? JSON.parse(savedStudent) : null;
    });

    const [exams] = useState(() => {
        let savedExams = localStorage.getItem("exams");
        return savedExams ? JSON.parse(savedExams) : [];
    });

    const [questions] = useState(() => {
        let savedQuestions = localStorage.getItem("questions");
        return savedQuestions ? JSON.parse(savedQuestions) : [];
    });

    const [results] = useState(() => {
        let savedResults = localStorage.getItem("examResults");
        return savedResults ? JSON.parse(savedResults) : [];
    });

    const [attempts] = useState(() => {
        let savedAttempts = localStorage.getItem("examAttempts");
        return savedAttempts ? JSON.parse(savedAttempts) : [];
    });

    const studentResults = results.filter(
        result => result.student === student?.registrationNumber
    );

    const studentAttempts = attempts.filter(
        attempt => attempt.student === student?.registrationNumber
    );

    function getAttemptCount(examId) {
        return studentAttempts.filter(
            attempt => Number(attempt.examId) === Number(examId)
        ).length;
    }

    function canStartExam(exam) {
        const policy = exam.attemptPolicy || "single";
        const attemptCount = getAttemptCount(exam.id);

        if (policy === "single" && attemptCount >= 1) {
            return false;
        }

        return true;
    }

    function logout() {
        localStorage.removeItem("currentStudent");
        window.location.href = "/student";
    }

    function startExam(examId) {
        const selectedExam = exams.find(
            exam => Number(exam.id) === Number(examId)
        );

        if (!selectedExam || !canStartExam(selectedExam)) {
            alert("You have already used your allowed attempt for this exam.");
            return;
        }

        window.location.href = `/student/exam?id=${examId}`;
    }

    function viewResult(attemptId) {
        window.location.href = `/student/results?id=${attemptId}`;
    }

    if (!student) {
        window.location.href = "/student";
        return null;
    }

    return (
        <div className="student-dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Student Dashboard</h1>
                    <p>Welcome, {student.name}</p>
                    <p>
                        Registration Number: {student.registrationNumber}
                    </p>
                </div>

                <button onClick={logout}>
                    Logout
                </button>
            </div>

            <div className="dashboard-summary">
                <div className="summary-card">
                    <h3>Available Exams</h3>
                    <p>{exams.length}</p>
                </div>

                <div className="summary-card">
                    <h3>Question Bank</h3>
                    <p>{questions.length}</p>
                </div>

                <div className="summary-card">
                    <h3>Completed Exams</h3>
                    <p>{studentAttempts.length}</p>
                </div>
            </div>

            <div className="available-exams">
                <h2>Available Examinations</h2>

                {exams.length > 0 ? (
                    <div className="exam-list">
                        {exams.map(exam => {
                            let availableQuestions = exam.questionIds.filter(
                                id => questions.some(q => q.id === id)
                            ).length;

                            let attemptCount = getAttemptCount(exam.id);
                            let policy = exam.attemptPolicy || "single";
                            let eligible = canStartExam(exam);

                            return (
                                <div className="student-exam-card" key={exam.id}>
                                    <h3>{exam.examName}</h3>

                                    <p>Duration: {exam.duration} minutes</p>
                                    <p>Total Marks: {exam.totalMarks}</p>
                                    <p>Passing Marks: {exam.passingMarks}</p>
                                    <p>Number of Questions: {availableQuestions}</p>

                                    <p>
                                        Attempt Policy: {
                                            policy === "single"
                                                ? "One Attempt Only"
                                                : "Multiple Attempts Allowed"
                                        }
                                    </p>

                                    <p>
                                        Attempts Used: {attemptCount}
                                    </p>

                                    <p>
                                        Exam Status: {
                                            availableQuestions === 0
                                                ? "Unavailable"
                                                : eligible
                                                    ? attemptCount > 0
                                                        ? "Available for Retake"
                                                        : "Not Started"
                                                    : "Completed"
                                        }
                                    </p>

                                    <button
                                        onClick={() => startExam(exam.id)}
                                        disabled={availableQuestions === 0 || !eligible}
                                    >
                                        {!eligible
                                            ? "Attempt Completed"
                                            : attemptCount > 0
                                                ? "Retake Exam"
                                                : "Start Exam"}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p>No examinations are currently available.</p>
                )}
            </div>

            <div className="exam-history">
                <h2>Exam History</h2>

                {studentResults.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Exam Name</th>
                                <th>Marks</th>
                                <th>Percentage</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {studentResults.map(result => (
                                <tr key={result.attemptId}>
                                    <td>{result.examName}</td>

                                    <td>
                                        {result.marksObtained} / {result.totalMarks}
                                    </td>

                                    <td>{result.percentage}%</td>
                                    <td>{result.status}</td>

                                    <td>
                                        <button
                                            onClick={() => viewResult(result.attemptId)}
                                        >
                                            View Result
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>You have not completed any examinations yet.</p>
                )}
            </div>
        </div>
    );
}

export default StudentDashboard;
