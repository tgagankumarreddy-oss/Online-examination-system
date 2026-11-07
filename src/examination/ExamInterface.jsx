
import React, { useEffect, useRef, useState } from "react";

function shuffleArray(array) {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[randomIndex]] = [
            shuffled[randomIndex],
            shuffled[i]
        ];
    }

    return shuffled;
}

function ExamInterface() {
    const params = new URLSearchParams(window.location.search);
    const examId = Number(params.get("id"));

    const [student] = useState(() => {
        let savedStudent = localStorage.getItem("currentStudent");
        return savedStudent ? JSON.parse(savedStudent) : null;
    });

    const [exams] = useState(() => {
        let savedExams = localStorage.getItem("exams");
        return savedExams ? JSON.parse(savedExams) : [];
    });

    const [allQuestions] = useState(() => {
        let savedQuestions = localStorage.getItem("questions");
        return savedQuestions ? JSON.parse(savedQuestions) : [];
    });

    const [allAttempts] = useState(() => {
        let savedAttempts = localStorage.getItem("examAttempts");
        return savedAttempts ? JSON.parse(savedAttempts) : [];
    });

    const exam = exams.find(e => Number(e.id) === examId);

    const studentAttempts = allAttempts.filter(
        attempt =>
            attempt.student === student?.registrationNumber &&
            Number(attempt.examId) === examId
    );

    const attemptPolicy = exam?.attemptPolicy || "single";

    const attemptLimitReached =
        attemptPolicy === "single" && studentAttempts.length >= 1;

    const [examQuestions] = useState(() => {
        if (!exam) {
            return [];
        }

        const selectedQuestions = exam.questionIds
            .map(id => allQuestions.find(q => q.id === id))
            .filter(q => q !== undefined);

        const randomizedQuestions = shuffleArray(selectedQuestions);

        return randomizedQuestions.map(question => ({
            ...question,
            options: shuffleArray(question.options)
        }));
    });

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(
        exam ? exam.duration * 60 : 0
    );
    const [submitted, setSubmitted] = useState(false);
    const [secureStarted, setSecureStarted] = useState(false);
    const [warningCount, setWarningCount] = useState(0);
    const [warningMessage, setWarningMessage] = useState("");

    const violationCountRef = useRef(0);
    const submitRef = useRef(false);
    const wasFullscreenRef = useRef(false);
    const handleSubmitRef = useRef(null);

    useEffect(() => {
        if (!exam || attemptLimitReached || submitted || timeLeft <= 0) {
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(previousTime => previousTime - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [exam, attemptLimitReached, submitted, timeLeft]);

    useEffect(() => {
        if (
            timeLeft === 0 &&
            exam &&
            !attemptLimitReached &&
            !submitted
        ) {
            handleSubmitRef.current?.(true, "Time is over.");
        }
    }, [timeLeft, exam, attemptLimitReached, submitted]);

    function recordViolation(message) {
        if (submitted || !secureStarted || submitRef.current) {
            return;
        }

        violationCountRef.current += 1;

        const newCount = violationCountRef.current;

        setWarningCount(newCount);
        setWarningMessage(message);

        if (newCount >= 3) {
            handleSubmitRef.current?.(
                true,
                "You have reached the maximum number of security warnings."
            );
        }
    }

    async function startSecureExam() {
        if (attemptLimitReached) {
            alert("You have already used your allowed attempt for this exam.");
            return;
        }

        setSecureStarted(true);

        try {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            }

            wasFullscreenRef.current = true;
        } catch (error) {
            setWarningMessage(
                "Fullscreen could not be enabled. Please continue in this browser window."
            );
        }
    }

    function selectAnswer(questionId, option) {
        setAnswers(previousAnswers => ({
            ...previousAnswers,
            [questionId]: option
        }));
    }

    function handleSubmit(autoSubmit = false, reason = "") {
        if (submitRef.current || submitted || !exam) {
            return;
        }

        if (!autoSubmit) {
            let confirmSubmit = window.confirm(
                "Are you sure you want to submit the examination?"
            );

            if (!confirmSubmit) {
                return;
            }
        }

        submitRef.current = true;

        const attempt = {
            id: Date.now(),
            examId: exam.id,
            examName: exam.examName,
            student: student.registrationNumber,
            answers: answers,
            submittedAt: new Date().toISOString(),
            autoSubmitted: autoSubmit,
            securityWarnings: violationCountRef.current
        };

        let savedAttempts = localStorage.getItem("examAttempts");
        let attempts = savedAttempts ? JSON.parse(savedAttempts) : [];

        attempts.push(attempt);

        localStorage.setItem(
            "examAttempts",
            JSON.stringify(attempts)
        );

        setSubmitted(true);

        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        }

        if (autoSubmit) {
            alert(reason || "Your examination has been submitted automatically.");
        }

        window.location.href = `/student/results?id=${attempt.id}`;
    }

    handleSubmitRef.current = handleSubmit;

    useEffect(() => {
        if (!secureStarted || submitted) {
            return;
        }

        function handleVisibilityChange() {
            if (document.hidden) {
                recordViolation("Tab switching or leaving the exam window detected.");
            }
        }

        function handleFullscreenChange() {
            if (wasFullscreenRef.current && !document.fullscreenElement) {
                wasFullscreenRef.current = false;
                recordViolation("You exited fullscreen mode.");
            }
        }

        function preventCopy(event) {
            event.preventDefault();
            recordViolation("Copying is not allowed during the examination.");
        }

        function preventPaste(event) {
            event.preventDefault();
            recordViolation("Pasting is not allowed during the examination.");
        }

        function preventCut(event) {
            event.preventDefault();
            recordViolation("Cutting text is not allowed during the examination.");
        }

        function preventContextMenu(event) {
            event.preventDefault();
        }

        function preventShortcuts(event) {
            const key = event.key.toLowerCase();

            if (
                (event.ctrlKey || event.metaKey) &&
                ["c", "v", "x", "a", "p", "s", "u"].includes(key)
            ) {
                event.preventDefault();
                recordViolation("Restricted keyboard shortcut detected.");
            }

            if (event.key === "F12") {
                event.preventDefault();
                recordViolation("Restricted keyboard shortcut detected.");
            }
        }

        document.addEventListener("visibilitychange", handleVisibilityChange);
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("copy", preventCopy);
        document.addEventListener("paste", preventPaste);
        document.addEventListener("cut", preventCut);
        document.addEventListener("contextmenu", preventContextMenu);
        document.addEventListener("keydown", preventShortcuts);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            document.removeEventListener("copy", preventCopy);
            document.removeEventListener("paste", preventPaste);
            document.removeEventListener("cut", preventCut);
            document.removeEventListener("contextmenu", preventContextMenu);
            document.removeEventListener("keydown", preventShortcuts);
        };
    }, [secureStarted, submitted]);

    function formatTime(seconds) {
        let minutes = Math.floor(seconds / 60);
        let remainingSeconds = seconds % 60;

        return (
            String(minutes).padStart(2, "0") +
            ":" +
            String(remainingSeconds).padStart(2, "0")
        );
    }

    if (!student) {
        window.location.href = "/student";
        return null;
    }

    if (!exam) {
        return (
            <div className="exam-interface">
                <h2>Examination not found</h2>
                <button onClick={() => window.location.href = "/student/dashboard"}>
                    Back to Dashboard
                </button>
            </div>
        );
    }

    if (attemptLimitReached) {
        return (
            <div className="exam-interface">
                <div className="security-start">
                    <h1>Exam Attempt Completed</h1>
                    <h2>{exam.examName}</h2>

                    <p>
                        You have already submitted your allowed attempt for this examination.
                    </p>

                    <p>
                        Attempt Policy: One Attempt Only
                    </p>

                    <p>
                        Attempts Used: {studentAttempts.length}
                    </p>

                    <button
                        onClick={() => window.location.href = "/student/dashboard"}
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (examQuestions.length === 0) {
        return (
            <div className="exam-interface">
                <h2>No questions available for this examination.</h2>
                <button onClick={() => window.location.href = "/student/dashboard"}>
                    Back to Dashboard
                </button>
            </div>
        );
    }

    const currentQuestion = examQuestions[currentIndex];
    const answeredCount = Object.keys(answers).length;
    const unansweredCount = examQuestions.length - answeredCount;

    if (!secureStarted) {
        return (
            <div className="exam-interface">
                <div className="security-start">
                    <h1>Secure Examination</h1>
                    <h2>{exam.examName}</h2>

                    <p>Student: {student.name}</p>
                    <p>Registration Number: {student.registrationNumber}</p>
                    <p>Duration: {exam.duration} minutes</p>
                    <p>Total Questions: {examQuestions.length}</p>

                    <p>
                        Attempt Policy: {
                            attemptPolicy === "single"
                                ? "One Attempt Only"
                                : "Multiple Attempts Allowed"
                        }
                    </p>

                    <p>
                        Previous Attempts: {studentAttempts.length}
                    </p>

                    <div className="security-instructions">
                        <h3>Examination Security Instructions</h3>
                        <ul>
                            <li>Remain in fullscreen mode during the examination.</li>
                            <li>Do not switch tabs or leave the exam window.</li>
                            <li>Copying, cutting and pasting are restricted.</li>
                            <li>Right-click and certain keyboard shortcuts are restricted.</li>
                            <li>You will receive a maximum of 3 security warnings.</li>
                            <li>The third violation will automatically submit your exam.</li>
                            <li>Questions and answer options will appear in random order.</li>
                        </ul>
                    </div>

                    <button
                        className="start-secure-button"
                        onClick={startSecureExam}
                    >
                        Start Secure Exam
                    </button>

                    <p className="security-note">
                        The examination timer is already running.
                    </p>

                    <h2 className="exam-start-timer">
                        Time Remaining: {formatTime(timeLeft)}
                    </h2>
                </div>
            </div>
        );
    }

    return (
        <div className="exam-interface">
            <div className="exam-header">
                <div>
                    <h1>{exam.examName}</h1>
                    <p>
                        Student: {student.name} ({student.registrationNumber})
                    </p>
                </div>

                <div className="exam-timer">
                    <h2>Time Remaining</h2>
                    <h1>{formatTime(timeLeft)}</h1>
                </div>
            </div>

            <div className="security-warning-panel">
                <div>
                    <h3>Examination Security</h3>
                    <p>
                        Warnings: {warningCount} / 3
                    </p>
                </div>

                <p>
                    {warningMessage || "Security monitoring is active."}
                </p>
            </div>

            <div className="exam-details">
                <p>Total Questions: {examQuestions.length}</p>
                <p>Total Marks: {exam.totalMarks}</p>
                <p>Answered: {answeredCount}</p>
                <p>Unanswered: {unansweredCount}</p>
            </div>

            <div className="exam-layout">
                <div className="question-section">
                    <h2>
                        Question {currentIndex + 1} of {examQuestions.length}
                    </h2>

                    <p className="question-text">
                        {currentQuestion.question}
                    </p>

                    <p>Marks: {currentQuestion.marks}</p>

                    <div className="options-list">
                        {currentQuestion.options.map((option, index) => (
                            <label
                                className="option-item"
                                key={`${currentQuestion.id}-${index}`}
                            >
                                <input
                                    type="radio"
                                    name={`question-${currentQuestion.id}`}
                                    value={option}
                                    checked={answers[currentQuestion.id] === option}
                                    onChange={() => selectAnswer(
                                        currentQuestion.id,
                                        option
                                    )}
                                />

                                {option}
                            </label>
                        ))}
                    </div>

                    <div className="question-navigation">
                        <button
                            onClick={() => setCurrentIndex(currentIndex - 1)}
                            disabled={currentIndex === 0}
                        >
                            Previous
                        </button>

                        <button
                            onClick={() => setCurrentIndex(currentIndex + 1)}
                            disabled={currentIndex === examQuestions.length - 1}
                        >
                            Next
                        </button>
                    </div>
                </div>

                <div className="question-palette">
                    <h3>Question Palette</h3>

                    <div className="palette-grid">
                        {examQuestions.map((question, index) => (
                            <button
                                key={question.id}
                                className={[
                                    "palette-button",
                                    answers[question.id] ? "answered" : "unanswered",
                                    currentIndex === index ? "active" : ""
                                ].join(" ")}
                                onClick={() => setCurrentIndex(index)}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>

                    <p>
                        <span className="legend answered-legend"></span>
                        Answered
                    </p>

                    <p>
                        <span className="legend unanswered-legend"></span>
                        Unanswered
                    </p>

                    <button
                        className="submit-exam-button"
                        onClick={() => handleSubmit(false)}
                    >
                        Submit Examination
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ExamInterface;
