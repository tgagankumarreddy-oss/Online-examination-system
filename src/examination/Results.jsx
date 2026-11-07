
import React, { useState } from "react";

function Results() {

    const params = new URLSearchParams(window.location.search);
    const attemptId = Number(params.get("id"));

    const [student] = useState(() => {
        let savedStudent = localStorage.getItem("currentStudent");
        return savedStudent ? JSON.parse(savedStudent) : null;
    });

    const [attempts] = useState(() => {
        let savedAttempts = localStorage.getItem("examAttempts");
        return savedAttempts ? JSON.parse(savedAttempts) : [];
    });

    const [questions] = useState(() => {
        let savedQuestions = localStorage.getItem("questions");
        return savedQuestions ? JSON.parse(savedQuestions) : [];
    });

    const [exams] = useState(() => {
        let savedExams = localStorage.getItem("exams");
        return savedExams ? JSON.parse(savedExams) : [];
    });

    const attempt = attempts.find(a => a.id === attemptId);

    if (!student) {
        window.location.href = "/student";
        return null;
    }

    if (!attempt || attempt.student !== student.registrationNumber) {
        return (
            <div className="results-page">
                <h2>Result not found</h2>
                <button onClick={() => window.location.href = "/student/dashboard"}>
                    Back to Dashboard
                </button>
            </div>
        );
    }

    const exam = exams.find(e => e.id === attempt.examId);

    const examQuestions = exam
        ? exam.questionIds
            .map(id => questions.find(q => q.id === id))
            .filter(q => q !== undefined)
        : [];

    const correctCount = examQuestions.filter(q =>
        attempt.answers[q.id] === q.correctAnswer
    ).length;

    const wrongCount = examQuestions.filter(q =>
        attempt.answers[q.id] &&
        attempt.answers[q.id] !== q.correctAnswer
    ).length;

    const unansweredCount = examQuestions.filter(q =>
        !attempt.answers[q.id]
    ).length;

    const marksObtained = examQuestions.reduce((total, q) => {
        if (attempt.answers[q.id] === q.correctAnswer) {
            return total + Number(q.marks);
        }

        return total;
    }, 0);

    const totalMarks = examQuestions.reduce(
        (total, q) => total + Number(q.marks),
        0
    );

    const percentage = totalMarks > 0
        ? (marksObtained / totalMarks) * 100
        : 0;

    const passed = exam
        ? marksObtained >= exam.passingMarks
        : false;

    const result = {
        attemptId: attempt.id,
        examId: attempt.examId,
        examName: attempt.examName,
        student: attempt.student,
        marksObtained,
        totalMarks,
        percentage: Number(percentage.toFixed(2)),
        correctCount,
        wrongCount,
        unansweredCount,
        passingMarks: exam ? exam.passingMarks : 0,
        status: passed ? "Pass" : "Fail",
        submittedAt: attempt.submittedAt
    };

    let savedResults = localStorage.getItem("examResults");
    let previousResults = savedResults ? JSON.parse(savedResults) : [];

    let existingResult = previousResults.find(
        r => r.attemptId === attempt.id
    );

    if (!existingResult) {
        previousResults.push(result);
        localStorage.setItem(
            "examResults",
            JSON.stringify(previousResults)
        );
    }

    function goToDashboard() {
        window.location.href = "/student/dashboard";
    }

    return (

        <div className="results-page">

            <h1>Examination Result</h1>

            <div className="result-header">

                <h2>{attempt.examName}</h2>

                <p>
                    Student: {student.name}
                </p>

                <p>
                    Registration Number: {student.registrationNumber}
                </p>

                <h2 className={passed ? "pass-status" : "fail-status"}>
                    {passed ? "PASS" : "FAIL"}
                </h2>

            </div>

            <div className="result-summary">

                <div className="result-card">
                    <h3>Marks Obtained</h3>
                    <p>{marksObtained} / {totalMarks}</p>
                </div>

                <div className="result-card">
                    <h3>Percentage</h3>
                    <p>{percentage.toFixed(2)}%</p>
                </div>

                <div className="result-card">
                    <h3>Correct Answers</h3>
                    <p>{correctCount}</p>
                </div>

                <div className="result-card">
                    <h3>Wrong Answers</h3>
                    <p>{wrongCount}</p>
                </div>

                <div className="result-card">
                    <h3>Unanswered</h3>
                    <p>{unansweredCount}</p>
                </div>

            </div>

            <div className="result-details">

                <h2>Result Details</h2>

                <p>Total Questions: {examQuestions.length}</p>

                <p>Passing Marks: {exam ? exam.passingMarks : 0}</p>

                <p>Marks Obtained: {marksObtained}</p>

                <p>Percentage: {percentage.toFixed(2)}%</p>

                <p>Status: {passed ? "Pass" : "Fail"}</p>

            </div>

            <div className="answer-review">

                <h2>Answer Review</h2>

                {examQuestions.map((q, index) => {

                    let selectedAnswer = attempt.answers[q.id];
                    let isCorrect = selectedAnswer === q.correctAnswer;
                    let isUnanswered = !selectedAnswer;

                    return (

                        <div className="review-question" key={q.id}>

                            <h3>
                                Question {index + 1}: {q.question}
                            </h3>

                            <p>
                                Your Answer: {selectedAnswer || "Not Answered"}
                            </p>

                            <p>
                                Correct Answer: {q.correctAnswer}
                            </p>

                            <p>
                                Marks: {isCorrect ? q.marks : 0} / {q.marks}
                            </p>

                            <p className={
                                isUnanswered
                                    ? "review-unanswered"
                                    : isCorrect
                                        ? "review-correct"
                                        : "review-wrong"
                            }>
                                {isUnanswered
                                    ? "Unanswered"
                                    : isCorrect
                                        ? "Correct"
                                        : "Incorrect"}
                            </p>

                        </div>

                    );
                })}

            </div>

            <button onClick={goToDashboard}>
                Back to Dashboard
            </button>

        </div>
    );
}

export default Results;
