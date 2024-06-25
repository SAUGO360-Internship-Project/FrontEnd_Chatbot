import React, { useState } from 'react';
import './UserCredentials.css';
import { useNavigate } from 'react-router-dom';
import { getUserToken, saveUserToken, saveUserName, getUserName } from "../localStorage";
import { SERVER_URL } from '../App';

export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function validatePassword(password) {
    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;
    const numberRegex = /\d/;
    const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    return (
        uppercaseRegex.test(password) &&
        lowercaseRegex.test(password) &&
        numberRegex.test(password) &&
        specialCharRegex.test(password)
    );
}

export function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

function UserCredentials() {
    const [isSignUp, setIsSignUp] = useState(true);
    const [userToken, setUserToken] = useState(getUserToken());
    const [userName, setUserName] = useState(getUserName());
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const navigate = useNavigate();

    function login(username, password) {
        const trimmedUsername = username.trim();
        if (!trimmedUsername || !password) {
            alert("Please enter all required fields");
            return;
        }

        fetch(`${SERVER_URL}/user/authentication`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_name: trimmedUsername,
                password: password,
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to login. Please check your credentials.");
                }
                return response.json();
            })
            .then((body) => {
                saveUserName(trimmedUsername);
                saveUserToken(body.token);
                setUserToken(body.token);
                navigate('/pages/ChatPage');
            })
            .catch((error) => {
                alert(error.message);
            });
    }

    function createUser(e) {
        e.preventDefault();
        const username = userName.trim();
        const userEmail = email.trim();

        if (!username || !password || !userEmail || !confirmPassword) {
            alert("Please enter all required fields");
            return;
        }

        if (!validateEmail(userEmail)) {
            alert("Please enter a valid email address");
            return;
        }

        if (password.length < 8) {
            alert("Password must be at least 8 characters long");
            return;
        }

        if (!validatePassword(password)) {
            alert("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Confirm pass does not match password");
            return;
        }

        fetch(`${SERVER_URL}/user/user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_name: username,
                email: userEmail,
                password: password,
            }),
        })
            .then((response) => {
                if (response.status === 201) {
                    console.log(response);
                } else if (response.status === 400) {
                    throw new Error("User already exists");
                } else if (!response.ok) {
                    throw new Error("Failed to register please try again");
                }
                return response.json();
            })
            .then(() => {
                setUserName("");
                setEmail("");
                setPassword("");
                setConfirmPassword("");
                login(username, password);
                navigate('/pages/ChatPage');

            })
            .catch((error) => {
                alert(error.message);
            });
    }



    const toggleForm = () => {
        setIsSignUp(!isSignUp);
    };

    return (
        <div className="container">
            <div className={`form-container ${isSignUp ? 'sign-up-mode' : 'login-mode'}`}>
                <div className="left-panel">
                    <div className="content">
                        {isSignUp ? (
                            <>
                                <h2>Welcome to Intelligent Chatbot!</h2>
                                <p>To continue, please create an account.</p>
                                <button onClick={toggleForm}>
                                    Already have an account? <span>Sign In</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <h2>Don't have an account yet?</h2>
                                <p>Please sign up to continue.</p>
                                <button onClick={toggleForm}>
                                    <span>Sign Up</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
                <div className="right-panel">
                    {isSignUp ? (
                        <form className="sign-up-form" onSubmit={createUser}>
                            <h2>Sign Up</h2>
                            <input type="text" placeholder="Username" required onChange={(e) => setUserName(e.target.value)} />
                            <input type="email" placeholder="Email" required onChange={(e) => setEmail(e.target.value)} />
                            <input type="password" placeholder="Password" required onChange={(e) => setPassword(e.target.value)} />
                            <input type="password" placeholder="Confirm Password" required onChange={(e) => setConfirmPassword(e.target.value)} />
                            <button type="submit">Submit</button>
                        </form>
                    ) : (
                        <form className="login-form" onSubmit={(e) => { e.preventDefault(); login(userName, password) }}>
                            <h2>Sign In</h2>
                            <input type="text" placeholder="Username" required onChange={(e) => setUserName(e.target.value)} />
                            <input type="password" placeholder="Password" required onChange={(e) => setPassword(e.target.value)} />
                            <button type="submit">Submit</button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserCredentials;