import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SERVER_URL } from '../App';
import { Button, Snackbar } from '@mui/material';
import QRCode from 'qrcode.react';
import './LostQrcode.css'

function LostQRCode() {
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [resetCode, setResetCode] = useState("");
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const [step, setStep] = useState(1);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const navigate = useNavigate();

    const handleRequestReset = (e) => {
        e.preventDefault();
        fetch(`${SERVER_URL}/user/lost_qrcode`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_name: userName,
                password: password
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Request is not successful, please try again")
                }
                else if (response.status === 200) {
                    setStep(2);
                }
                return response.json();
            })
            .then((data) => {
                if (data.message) {
                    setSnackbarMessage(data.message);
                    setOpenSnackbar(true);
                    setUserName("");
                    setPassword("");
                }
            })
            .catch((error) => {
                setSnackbarMessage(error.message);
                setOpenSnackbar(true);
            });
    };

    const handleResetQRCode = (e) => {
        e.preventDefault();

        fetch(`${SERVER_URL}/user/get_qrcode`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                reset_code: resetCode
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Couldn't reset the QR code")
                }
                else if (response.status === 200) {
                    return response.json();
                }
            })
            .then((data) => {
                if (data.qr_code_url) {
                    setQrCodeUrl(data.qr_code_url);
                    setSnackbarMessage("QR code reset successfully.");
                    setOpenSnackbar(true);
                } else if (data.message) {
                    setSnackbarMessage(data.message);
                    setOpenSnackbar(true);
                }
            })
            .catch((error) => {
                setSnackbarMessage(error.message);
                setOpenSnackbar(true);
            });
    };

    const handleDone = () => {
        setResetCode("");
        setQrCodeUrl("");
        setUserName("");
        setPassword("");
        navigate('./login');
    }
    return (
        <div className="lost-qrcode-container">
            <div className="lost-qrcode-form">
                {step === 1 ? (
                    <form onSubmit={handleRequestReset}>
                        <h2>Lost QR Code</h2>
                        <p>Please submit both your username and password</p>
                        <input
                            type="text"
                            placeholder="Username"
                            required
                            onChange={(e) => setUserName(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            required
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button style={{ marginRight: 10 }} onClick={() => navigate('/login')} >Cancel</button>
                        <button type="submit">Send Reset Code</button>
                    </form>
                ) : (
                    <form onSubmit={handleResetQRCode}>
                        <h2>Enter Reset Code</h2>
                        <input
                            type="text"
                            placeholder="Reset Code"
                            required
                            onChange={(e) => setResetCode(e.target.value)}
                        />
                        <button type="submit">Reset QR Code</button>
                    </form>
                )}
                {qrCodeUrl && (
                    <div>
                        <h2>Your New QR Code</h2>
                        <QRCode value={qrCodeUrl} />
                        <div>
                            <button onClick={() => handleDone()}>Done</button>
                        </div>
                    </div>
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

export default LostQRCode;
