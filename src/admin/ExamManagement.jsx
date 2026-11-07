
import React, { useState } from "react";

function ExamManagement() {
    const [questions] = useState(() => {
        let savedQuestions = localStorage.getItem("questions");
        return savedQuestions ? JSON.parse(savedQuestions) : [];
    });

    const [exams, setExams] = useState(() => {
        let savedExams = localStorage.getItem("exams");
        return savedExams ? JSON.parse(savedExams) : [];
    });

    const [examName, setExamName] = useState("");
    const [duration, setDuration] = useState("");
    const [passingMarks, setPassingMarks] = useState("");
    const [attemptPolicy, setAttemptPolicy] = useState("single");
    const [selectedSubject, setSelectedSubject] = useState("All");
    const [selectedQuestions, setSelectedQuestions] = useState([]);

    const subjects = [
        ...new Set(questions.map(q => q.subject))
    ];

    const filteredQuestions = questions.filter(q => {
        return selectedSubject === "All" ||
            q.subject === selectedSubject;
    });

    const totalMarks = questions
        .filter(q => selectedQuestions.includes(q.id))
        .reduce((total, q) => total + Number(q.marks), 0);

    function toggleQuestion(id) {
        if (selectedQuestions.includes(id)) {
            setSelectedQuestions(
                selectedQuestions.filter(qId => qId !== id)
            );
        } else {
            setSelectedQuestions([
                ...selectedQuestions,
                id
            ]);
        }
    }

    function createExam() {
        if (!examName.trim() || !duration || passingMarks === "") {
            alert("Please fill all exam details");
            return;
        }

        if (Number(duration) <= 0) {
            alert("Duration must be greater than zero");
            return;
        }

        if (selectedQuestions.length === 0) {
            alert("Please select at least one question");
            return;
        }

        if (
            Number(passingMarks) < 0 ||
            Number(passingMarks) > totalMarks
        ) {
            alert("Passing marks must be between 0 and total marks");
            return;
        }

        let newId = exams.length > 0
            ? Math.max(...exams.map(e => e.id)) + 1
            : 1;

        let newExam = {
            id: newId,
            examName: examName.trim(),
            duration: Number(duration),
            totalMarks: totalMarks,
            passingMarks: Number(passingMarks),
            questionIds: selectedQuestions,
            attemptPolicy: attemptPolicy
        };

        let updatedExams = [...exams, newExam];

        setExams(updatedExams);
        localStorage.setItem("exams", JSON.stringify(updatedExams));

        setExamName("");
        setDuration("");
        setPassingMarks("");
        setAttemptPolicy("single");
        setSelectedSubject("All");
        setSelectedQuestions([]);

        alert("Exam created successfully");
    }

    function updateAttemptPolicy(examId, newPolicy) {
        let updatedExams = exams.map(exam => {
            if (exam.id === examId) {
                return {
                    ...exam,
                    attemptPolicy: newPolicy
                };
            }

            return exam;
        });

        setExams(updatedExams);
        localStorage.setItem("exams", JSON.stringify(updatedExams));

        alert("Exam attempt policy updated successfully");
    }

    function deleteExam(id) {
        let confirmDelete = window.confirm(
            "Are you sure you want to delete this exam?"
        );

        if (confirmDelete) {
            let updatedExams = exams.filter(e => e.id !== id);

            setExams(updatedExams);
            localStorage.setItem("exams", JSON.stringify(updatedExams));

            alert("Exam deleted successfully");
        }
    }

    return (
        <div className="exam-management">
            <h1>Admin Exam Management</h1>

            <button
                onClick={() => window.location.href = "/admin"}
            >
                Back to Question Bank
            </button>

            <div className="exam-form">
                <h2>Create New Exam</h2>

                <label>Exam Name</label>

                <input
                    type="text"
                    placeholder="Enter exam name"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                />

                <label>Exam Duration (Minutes)</label>

                <input
                    type="number"
                    min="1"
                    placeholder="Enter duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                />

                <label>Passing Marks</label>

                <input
                    type="number"
                    min="0"
                    placeholder="Enter passing marks"
                    value={passingMarks}
                    onChange={(e) => setPassingMarks(e.target.value)}
                />

                <label>Student Attempt Policy</label>

                <select
                    value={attemptPolicy}
                    onChange={(e) => setAttemptPolicy(e.target.value)}
                >
                    <option value="single">One Attempt Only</option>
                    <option value="multiple">Multiple Attempts Allowed</option>
                </select>

                <h2>Select Questions</h2>

                <label>Filter by Subject</label>

                <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                >
                    <option value="All">All Subjects</option>

                    {subjects.map(subject => (
                        <option key={subject} value={subject}>
                            {subject}
                        </option>
                    ))}
                </select>

                <table>
                    <thead>
                        <tr>
                            <th>Select</th>
                            <th>Subject</th>
                            <th>Question</th>
                            <th>Marks</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredQuestions.length > 0 ? (
                            filteredQuestions.map(q => (
                                <tr key={q.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedQuestions.includes(q.id)}
                                            onChange={() => toggleQuestion(q.id)}
                                        />
                                    </td>

                                    <td>{q.subject}</td>
                                    <td>{q.question}</td>
                                    <td>{q.marks}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4">
                                    No questions available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div className="exam-summary">
                    <p>Selected Questions: {selectedQuestions.length}</p>
                    <p>Total Marks: {totalMarks}</p>
                </div>

                <button onClick={createExam}>
                    Create Exam
                </button>
            </div>

            <div className="created-exams">
                <h2>Created Exams</h2>

                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Exam Name</th>
                            <th>Duration</th>
                            <th>Total Marks</th>
                            <th>Passing Marks</th>
                            <th>Questions</th>
                            <th>Attempt Policy</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {exams.length > 0 ? (
                            exams.map(exam => (
                                <tr key={exam.id}>
                                    <td>{exam.id}</td>
                                    <td>{exam.examName}</td>
                                    <td>{exam.duration} min</td>
                                    <td>{exam.totalMarks}</td>
                                    <td>{exam.passingMarks}</td>
                                    <td>{exam.questionIds.length}</td>

                                    <td>
                                        <select
                                            value={exam.attemptPolicy || "single"}
                                            onChange={(e) => updateAttemptPolicy(
                                                exam.id,
                                                e.target.value
                                            )}
                                        >
                                            <option value="single">
                                                One Attempt
                                            </option>
                                            <option value="multiple">
                                                Multiple Attempts
                                            </option>
                                        </select>
                                    </td>

                                    <td>
                                        <button
                                            onClick={() => deleteExam(exam.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8">
                                    No exams created yet
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ExamManagement;
