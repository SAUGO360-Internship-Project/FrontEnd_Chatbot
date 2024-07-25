import React, { useState, useContext } from 'react';
import './UserCredentials.css';
import { useNavigate, Link } from 'react-router-dom';
import { getUserToken, saveUserToken, saveUserName, getUserName } from "../localStorage";
import { SERVER_URL } from '../App';
import AuthContext from '../AuthContext';
import QRCode from 'qrcode.react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Snackbar } from '@mui/material';


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
    let [isSignUp, setIsSignUp] = useState(true);
    let [userToken, setUserToken] = useState(getUserToken());
    let [userName, setUserName] = useState(getUserName());
    let [password, setPassword] = useState("");
    let [otp, setOtp] = useState("");
    let [email, setEmail] = useState("");
    let [confirmPassword, setConfirmPassword] = useState("");
    let [qrcodeUrl, setQrcodeUrl] = useState("");
    let [openDialog, setOpenDialog] = useState(false);
    let [openSnackbar, setOpenSnackbar] = useState(false);


    const { login, setAuth } = useContext(AuthContext);
    const navigate = useNavigate();

    function handleLogIn(username, password, otp) {
        const trimmedUsername = username.trim();
        if (!trimmedUsername || !password || !otp) {
            alert("Please enter all required fields");
            return;
        }

        fetch(`${SERVER_URL}/user/authentication`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_name: trimmedUsername,
                password: password,
                otp: otp
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
                setAuth(body.token);
                login(body.token);
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
            .then((data) => {
                setQrcodeUrl(data.qr_code_url);
                setOpenDialog(true);
                setUserName("");
                setEmail("");
                setPassword("");
                setConfirmPassword("");
                
            })
            .catch((error) => {
                alert(error.message);
            });
    }

    const toggleForm = () => {
        setIsSignUp(!isSignUp);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setOpenSnackbar(true);
        setIsSignUp(false);
        
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
                                <p style={{ fontSize: 12, marginTop: 60 }}>This website uses Two Factor authentication or 2FA, download Microsof App Authenticator on your mobile and scan the QRcode upon registration</p>
                            </>
                        ) : (
                            <>
                                <h2>Don't have an account yet?</h2>
                                <p>Please sign up to continue.</p>
                                <button onClick={toggleForm}>
                                    <span>Sign Up</span>
                                </button>
                                <p style={{ fontSize: 12, marginTop: 60 }}> Inorder to login successfully, you always need to provide the one time password or OTP generated by the Authenticator App</p>
                            </>
                        )}
                    </div>
                </div>
                <div className="right-panel">
                    {isSignUp ? (
                        <form className="sign-up-form" onSubmit={createUser}>
                            <h2>Sign Up</h2>
                            <input type="text" placeholder="Username" value={userName} required onChange={(e) => setUserName(e.target.value)} />
                            <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                            <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                            <input type="password" placeholder="Confirm Password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                            <button type="submit">Submit</button>
                        </form>
                    ) : (
                        <form className="login-form" onSubmit={(e) => { e.preventDefault(); handleLogIn(userName, password, otp) }}>
                            <h2>Sign In</h2>
                            <input type="text" placeholder="Username" required value={userName} onChange={(e) => setUserName(e.target.value)} />
                            <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                            <input type="password" placeholder="Otp" required value={otp} onChange={(e) => setOtp(e.target.value)} />
                            <button type="submit" >Submit</button>
                            <div>
                                <Link style={{ marginRight: 10 }} to="/forgot-password" className="forgot-password-link" >Forgot Password?</Link>
                                <Link to="/lost-qrcode" className="lost-qrcode" >Lost Qrcode?</Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Scan this QR Code</DialogTitle>
                <DialogContent>
                    <QRCode value={qrcodeUrl} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={()=> handleCloseDialog()} color="primary">
                        Done
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={() => setOpenSnackbar(false)}
                message="Account successfully created, please log in"
            />
        </div>
    );
}

export default UserCredentials;