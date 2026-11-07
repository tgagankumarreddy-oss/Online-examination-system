
import React, { useState } from "react";
import questionsData from "../data/questions.json";

function QuestionBank() {

    const [questions, setQuestions] = useState(() => {
        let savedQuestions = localStorage.getItem("questions");

        return savedQuestions
            ? JSON.parse(savedQuestions)
            : questionsData;
    });

    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [search, setSearch] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("All");

    const [formData, setFormData] = useState({
        subject: "",
        question: "",
        option1: "",
        option2: "",
        option3: "",
        option4: "",
        correctAnswer: "",
        marks: 1
    });

    function saveQuestions(updatedQuestions) {
        setQuestions(updatedQuestions);
        localStorage.setItem("questions", JSON.stringify(updatedQuestions));
    }

    function handleChange(e) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    function clearForm() {
        setFormData({
            subject: "",
            question: "",
            option1: "",
            option2: "",
            option3: "",
            option4: "",
            correctAnswer: "",
            marks: 1
        });

        setEditId(null);
    }

    function addQuestion() {

        if (
            !formData.subject ||
            !formData.question ||
            !formData.option1 ||
            !formData.option2 ||
            !formData.option3 ||
            !formData.option4 ||
            !formData.correctAnswer ||
            !formData.marks
        ) {
            alert("Please fill all fields");
            return;
        }

        let newId = questions.length > 0
            ? Math.max(...questions.map(q => q.id)) + 1
            : 1;

        let newQuestion = {
            id: newId,
            subject: formData.subject,
            question: formData.question,
            options: [
                formData.option1,
                formData.option2,
                formData.option3,
                formData.option4
            ],
            correctAnswer: formData.correctAnswer,
            marks: Number(formData.marks)
        };

        saveQuestions([...questions, newQuestion]);

        clearForm();
        setShowForm(false);

        alert("Question added successfully");
    }

    function editQuestion(q) {

        setFormData({
            subject: q.subject,
            question: q.question,
            option1: q.options[0],
            option2: q.options[1],
            option3: q.options[2],
            option4: q.options[3],
            correctAnswer: q.correctAnswer,
            marks: q.marks
        });

        setEditId(q.id);
        setShowForm(true);
    }

    function updateQuestion() {

        if (
            !formData.subject ||
            !formData.question ||
            !formData.option1 ||
            !formData.option2 ||
            !formData.option3 ||
            !formData.option4 ||
            !formData.correctAnswer ||
            !formData.marks
        ) {
            alert("Please fill all fields");
            return;
        }

        let updatedQuestions = questions.map(q => {

            if (q.id === editId) {
                return {
                    ...q,
                    subject: formData.subject,
                    question: formData.question,
                    options: [
                        formData.option1,
                        formData.option2,
                        formData.option3,
                        formData.option4
                    ],
                    correctAnswer: formData.correctAnswer,
                    marks: Number(formData.marks)
                };
            }

            return q;
        });

        saveQuestions(updatedQuestions);

        clearForm();
        setShowForm(false);

        alert("Question updated successfully");
    }

    function deleteQuestion(id) {

        let confirmDelete = window.confirm(
            "Are you sure you want to delete this question?"
        );

        if (confirmDelete) {

            let updatedQuestions = questions.filter(q => q.id !== id);

            saveQuestions(updatedQuestions);

            if (editId === id) {
                clearForm();
                setShowForm(false);
            }

            alert("Question deleted successfully");
        }
    }

    let subjects = [
        ...new Set(questions.map(q => q.subject))
    ];

    let filteredQuestions = questions.filter(q => {

        let matchesSearch =
            q.question.toLowerCase().includes(search.toLowerCase()) ||
            q.subject.toLowerCase().includes(search.toLowerCase());

        let matchesSubject =
            selectedSubject === "All" ||
            q.subject === selectedSubject;

        return matchesSearch && matchesSubject;
    });

    return (

        <div className="question-bank">

            <h1>Admin Question Bank</h1>

            <button
                onClick={() => window.location.href = "/admin/exams"}
            >
                Manage Exams
            </button>

            <button onClick={() => {
                clearForm();
                setShowForm(!showForm);
            }}>
                Add New Question
            </button>

            {showForm && (

                <div className="question-form">

                    <h2>
                        {editId ? "Edit Question" : "Add Question"}
                    </h2>

                    <input
                        type="text"
                        name="subject"
                        placeholder="Enter Subject"
                        value={formData.subject}
                        onChange={handleChange}
                    />

                    <textarea
                        name="question"
                        placeholder="Enter Question"
                        value={formData.question}
                        onChange={handleChange}
                    />

                    <input
                        type="text"
                        name="option1"
                        placeholder="Option 1"
                        value={formData.option1}
                        onChange={handleChange}
                    />

                    <input
                        type="text"
                        name="option2"
                        placeholder="Option 2"
                        value={formData.option2}
                        onChange={handleChange}
                    />

                    <input
                        type="text"
                        name="option3"
                        placeholder="Option 3"
                        value={formData.option3}
                        onChange={handleChange}
                    />

                    <input
                        type="text"
                        name="option4"
                        placeholder="Option 4"
                        value={formData.option4}
                        onChange={handleChange}
                    />

                    <input
                        type="text"
                        name="correctAnswer"
                        placeholder="Enter Correct Answer"
                        value={formData.correctAnswer}
                        onChange={handleChange}
                    />

                    <input
                        type="number"
                        name="marks"
                        placeholder="Enter Marks"
                        value={formData.marks}
                        onChange={handleChange}
                    />

                    {editId ? (

                        <button onClick={updateQuestion}>
                            Update Question
                        </button>

                    ) : (

                        <button onClick={addQuestion}>
                            Save Question
                        </button>

                    )}

                    <button onClick={() => {
                        clearForm();
                        setShowForm(false);
                    }}>
                        Cancel
                    </button>

                </div>
            )}

            <h2>Manage Questions</h2>

            <input
                type="text"
                placeholder="Search by question or subject"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

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
                        <th>ID</th>
                        <th>Subject</th>
                        <th>Question</th>
                        <th>Marks</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>

                    {filteredQuestions.length > 0 ? (

                        filteredQuestions.map(q => (

                            <tr key={q.id}>

                                <td>{q.id}</td>
                                <td>{q.subject}</td>
                                <td>{q.question}</td>
                                <td>{q.marks}</td>

                                <td>
                                    <button onClick={() => editQuestion(q)}>
                                        Edit
                                    </button>

                                    <button onClick={() => deleteQuestion(q.id)}>
                                        Delete
                                    </button>
                                </td>

                            </tr>

                        ))

                    ) : (

                        <tr>
                            <td colSpan="5">No questions found</td>
                        </tr>

                    )}

                </tbody>

            </table>

            <p>Total Questions: {filteredQuestions.length}</p>

        </div>
    );
}

export default QuestionBank;
