import React, { useState } from "react";

function StudentLogin() {

    const [registrationNumber, setRegistrationNumber] = useState("");
    const [password, setPassword] = useState("");

    function handleLogin(e) {
        e.preventDefault();

        // Validate the student login details
        if (
            registrationNumber === "STU001" &&
            password === "student123"
        ) {
            let student = {
                registrationNumber: registrationNumber,
                name: "Demo Student"
            };

            // Store the logged-in student details
            localStorage.setItem(
                "currentStudent",
                JSON.stringify(student)
            );

            // Navigate to the student dashboard
            window.location.href = "/student/dashboard";

        } else {
            alert("Invalid registration number or password");
        }
    }

    return (

        <div className="student-login">

            <h1>Student Login</h1>

            <p>Login to access your examination dashboard</p>

            <form onSubmit={handleLogin}>

                <label>Registration Number</label>

                <input
                    type="text"
                    placeholder="Enter registration number"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    required
                />

                <label>Password</label>

                <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit">
                    Login
                </button>

            </form>

        </div>
    );
}

export default StudentLogin;