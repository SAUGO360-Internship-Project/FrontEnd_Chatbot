import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SERVER_URL } from '../App';
import { Snackbar } from '@mui/material';
import './ForgotPassword.css';

function ForgotPassword() {
    const [userName, setUserName] = useState("");
    const [resetCode, setResetCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [step, setStep] = useState(1);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const navigate = useNavigate();

    const handleRequestReset = (e) => {
        e.preventDefault();
        fetch(`${SERVER_URL}/user/forgot_password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_name: userName }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Request is not successful, please try again");
                }
                if (response.status === 200) {
                    setStep(2);
                }
                return response.json();
            })
            .then((data) => {
                if (data.message) {
                    setSnackbarMessage(data.message);
                    setOpenSnackbar(true);
                    setUserName("");
                }
            })
            .catch((error) => {
                setSnackbarMessage(error.message);
                setOpenSnackbar(true);
            });
    };

    const handleResetPassword = (e) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            setSnackbarMessage("Passwords do not match.");
            setOpenSnackbar(true);
            return;
        }

        fetch(`${SERVER_URL}/user/reset_password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reset_code: resetCode, new_password: newPassword }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Couldn't reset the password");
                }
                if (response.status === 200) {
                    setSnackbarMessage("Password reset successfully.");
                    setOpenSnackbar(true);
                    setTimeout(() => {
                        navigate('/login');
                    }, 3000);
                    setResetCode("");
                    setNewPassword("");
                    setConfirmNewPassword("");
                }
                return response.json();
            })
            .catch((error) => {
                setSnackbarMessage(error.message);
                setOpenSnackbar(true);
            });
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-form">
                {step === 1 ? (
                    <form onSubmit={handleRequestReset}>
                        <h2>Forgot Password</h2>
                        <p>Please submit your username and check your inbox</p>
                        <input
                            type="text"
                            placeholder="Username"
                            required
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                        />
                        <button style={{ marginRight: 10, backgroundColor: '#DEAC80' }} onClick={() => navigate('/login')} >Cancel</button>
                        <button style={{ backgroundColor: '#DEAC80' }} type="submit">Send Reset Code</button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword}>
                        <h2>Reset Password</h2>
                        <p>Please enter the reset code you received by email</p>
                        <input
                            type="text"
                            placeholder="Reset Code"
                            required
                            value={resetCode}
                            onChange={(e) => setResetCode(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="New Password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            required
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                        />
                        <button style={{ backgroundColor: '#DEAC80' }} type="submit">Reset Password</button>
                    </form>
                )}
                <Snackbar
                    open={openSnackbar}
                    autoHideDuration={6000}
                    onClose={() => setOpenSnackbar(false)}
                    message={snackbarMessage}
                />
            </div>
        </div>
    );
}

export default ForgotPassword;
