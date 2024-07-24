import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Snackbar, Grid, Avatar, Typography, TextField, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getUserToken, clearUserEmail, clearUserName, clearUserToken } from '../localStorage';
import { SERVER_URL } from '../App';
import './ProfilePage.css';

function ProfilePage() {
    const [userToken, setUserToken] = useState(getUserToken());
    const [userProfile, setUserProfile] = useState({
        user_name: '',
        email: '',
        phone_number: '',
        gender: '',
        bio_description: '',
        address: '',
        profile_image: '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_new_password: ''
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${SERVER_URL}/user/profile`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userToken}`
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Fetching profile failed");
                }
                return response.json();
            })
            .then((data) => {
                setUserProfile(data);
                setFormData(data);
            })
            .catch((error) => {
                setSnackbarMessage(error.message);
                setOpenSnackbar(true);
            });
    }, [userToken]);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        const updateData = new FormData();
        for (const key in formData) {
            if (formData[key] !== userProfile[key]) {
                updateData.append(key, formData[key]);
            }
        }

        if (imageFile) {
            updateData.append('profile_image', imageFile);
        }

        fetch(`${SERVER_URL}/user/profile`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${userToken}`
            },
            body: updateData,
        })
            .then((response) => {
                if (response.status === 400) {
                    return response.json().then((data) => {
                        setSnackbarMessage(data.message || "Couldn't update profile");
                        setOpenSnackbar(true);
                        throw new Error(data.message || "Couldn't update profile");
                    });
                } else if (!response.ok) {
                    return response.json().then((data) => {
                        setSnackbarMessage(data.message || "Couldn't update profile");
                        setOpenSnackbar(true);
                        throw new Error(data.message || "Couldn't update profile");
                    });
                }
                return response.json();
            })
            .then(() => {
                setUserProfile({ ...userProfile, ...formData });
                setIsEditing(false);
                setSnackbarMessage("Profile updated successfully");
                setOpenSnackbar(true);
            })
            .catch((error) => {
                console.error(error);
            });
    };


    const handleCancel = () => {
        setIsEditing(false);
        setFormData(userProfile);
        setImageFile(null); // Reset the image file input
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, profile_image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData({ ...passwordData, [name]: value });
    };

    const handlePasswordSubmit = () => {
        if (passwordData.new_password !== passwordData.confirm_new_password) {
            setSnackbarMessage("New password and confirmation do not match");
            setOpenSnackbar(true);
            return;
        }

        fetch(`${SERVER_URL}/user/profile/password`, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userToken}`
            },
            body: JSON.stringify(passwordData),
        })
            .then((response) => {
                if (response.status === 400) {
                    return response.json().then((data) => {
                        setSnackbarMessage(data.message || "Password change failed");
                        setOpenSnackbar(true);
                        throw new Error(data.message || "Password change failed");
                    });
                } else if (!response.ok) {
                    return response.json().then((data) => {
                        setSnackbarMessage(data.message || "Password change failed");
                        setOpenSnackbar(true);
                        throw new Error(data.message || "Password change failed");
                    });
                }
                return response.json();
            })
            .then(() => {
                setSnackbarMessage("Password changed successfully");
                setOpenSnackbar(true);
                setIsChangingPassword(false);
                setPasswordData({
                    current_password: '',
                    new_password: '',
                    confirm_new_password: ''
                });
            })
            .catch((error) => {
                console.error(error); // Log the error to the console for debugging
            });
    };

    const handleDeleteAccount = () => {
        fetch(`${SERVER_URL}/user/user`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Couldn't delete account");
                }
                return response.json();
            })
            .then(() => {
                setSnackbarMessage("Account deleted successfully");
                setOpenSnackbar(true);
                setUserToken(null);
                setUserProfile({
                    user_name: '',
                    email: '',
                    phone_number: '',
                    gender: '',
                    bio_description: '',
                    address: '',
                    profile_image: '',
                });
                setImageFile(null);
                clearUserToken();
                clearUserEmail();
                clearUserName();
                navigate('App');
            })
            .catch((error) => {
                setSnackbarMessage(error.message);
                setOpenSnackbar(true);
            });
    };

    useEffect(() => {
        return () => {
            if (imageFile) {
                URL.revokeObjectURL(imageFile);
            }
        };
    }, [imageFile]);

    return (
        <div>

            <Container className='profile-page-container'>
                <IconButton onClick={() => navigate('/pages/ChatPage')}>
                    <ArrowBackIcon />
                </IconButton>
                <div className='profile-header'>
                    <h2>My chatbot profile page</h2>
                    <p>Welcome to Intelligent Chatbot</p>
                </div>
                <Container className="profile-container">
                    <Grid container spacing={3} className="profile-content">
                        <Grid item xs={12} sm={4} align="center">
                            {isEditing && (
                                <input
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="profile-image-upload"
                                    type="file"
                                    onChange={(e) => {
                                        handleImageChange(e);
                                        e.target.value = '';
                                    }}
                                />
                            )}
                            <label htmlFor="profile-image-upload">
                                <Avatar
                                    style={{ height: '200px', width: '200px', marginBottom: 10, marginTop: 20, cursor: isEditing ? 'pointer' : 'default' }}
                                    src={imageFile ? URL.createObjectURL(imageFile) : (formData.profile_image ? `${SERVER_URL}${formData.profile_image}` : '/default-profile.png')}
                                    alt={formData.user_name}
                                />
                            </label>
                            <Typography variant="h6" gutterBottom>
                                <strong>{formData.user_name || "not available yet"}</strong>
                            </Typography>
                            <Typography variant="body1">
                                {formData.address || "not available yet"}
                            </Typography>
                            <Typography variant="body1">
                                {formData.bio_description || "not available yet"}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={8}>
                            <div className="profile-details">
                                <div className="profile-details-section">
                                    {isEditing ? (
                                        <>
                                            <TextField
                                                label="Username"
                                                name="user_name"
                                                value={formData.user_name}
                                                onChange={handleChange}
                                                fullWidth
                                                margin="normal"
                                            />
                                            <TextField
                                                label="Email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                fullWidth
                                                margin="normal"
                                            />
                                            <TextField
                                                label="Phone Number"
                                                name="phone_number"
                                                value={formData.phone_number}
                                                onChange={handleChange}
                                                fullWidth
                                                margin="normal"
                                            />
                                            <TextField
                                                label="Gender"
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleChange}
                                                fullWidth
                                                margin="normal"
                                            />
                                            <TextField
                                                label="Address"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                fullWidth
                                                margin="normal"
                                            />
                                            <TextField
                                                label="Bio Description"
                                                name="bio_description"
                                                value={formData.bio_description}
                                                onChange={handleChange}
                                                fullWidth
                                                margin="normal"
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <Typography variant="subtitle1">
                                                <strong>Username:</strong> {formData.user_name || "not available yet"}
                                            </Typography>
                                            <Typography variant="subtitle1">
                                                <strong>Email:</strong> {formData.email || "not available yet"}
                                            </Typography>
                                            <Typography variant="subtitle1">
                                                <strong>Phone Number:</strong> {formData.phone_number || "not available yet"}
                                            </Typography>
                                            <Typography variant="subtitle1">
                                                <strong>Gender:</strong> {formData.gender || "not available yet"}
                                            </Typography>
                                            <Typography variant="subtitle1">
                                                <strong>Address:</strong> {formData.address || "not available yet"}
                                            </Typography>
                                            <Typography variant="subtitle1">
                                                <strong>Bio Description:</strong> {formData.bio_description || "not available yet"}
                                            </Typography>
                                        </>
                                    )}
                                </div>
                                <div className="profile-edit-buttons">
                                    {isEditing ? (
                                        <>
                                            <Button variant="contained" onClick={handleSave}>
                                                Save
                                            </Button>
                                            <Button variant="contained" onClick={handleCancel}>
                                                Cancel
                                            </Button>
                                        </>
                                    ) : (
                                        <Button variant="contained" onClick={handleEditClick}>
                                            Edit
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Grid>
                    </Grid>
                </Container>
                <Container className="profile-privacy">
                    <h3>Profile Privacy</h3>
                    <div className="password-change-section">
                        {isChangingPassword ? (
                            <div>
                                <TextField
                                    label="Current Password"
                                    name="current_password"
                                    type="password"
                                    value={passwordData.current_password}
                                    onChange={handlePasswordChange}
                                    fullWidth
                                    margin="normal"
                                />
                                <TextField
                                    label="New Password"
                                    name="new_password"
                                    type="password"
                                    value={passwordData.new_password}
                                    onChange={handlePasswordChange}
                                    fullWidth
                                    margin="normal"
                                />
                                <TextField
                                    label="Confirm New Password"
                                    name="confirm_new_password"
                                    type="password"
                                    value={passwordData.confirm_new_password}
                                    onChange={handlePasswordChange}
                                    fullWidth
                                    margin="normal"
                                />
                                <div className='privacy-edit-buttons'>
                                    <Button variant="contained" onClick={handlePasswordSubmit}>
                                        Submit
                                    </Button>
                                    <Button variant="contained" onClick={() => setIsChangingPassword(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className='privacy-edit-buttons'>
                                    <Button variant="contained" onClick={() => setIsChangingPassword(true)}>
                                        Change Password
                                    </Button>
                                </div>
                                <p>If you wish to change your password, an email will be send to your inbox to verify your identity</p>
                            </div>

                        )}

                    </div>
                    <div className="delete-account-section">
                        <div className='privacy-edit-buttons'>
                            <Button variant="contained" onClick={() => setOpenDeleteDialog(true)}>
                                Delete Account
                            </Button>

                        </div>
                        <p>Deleting your account will also delete all your history, make sure to save any data you want before deleting</p>

                        <Dialog
                            open={openDeleteDialog}
                            onClose={() => setOpenDeleteDialog(false)}
                        >
                            <DialogTitle>Delete Account</DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    Are you sure you want to delete your account? This action cannot be undone.
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
                                    Cancel
                                </Button>
                                <Button onClick={handleDeleteAccount} color="error">
                                    Delete
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </div>
                </Container>
            </Container>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={() => setOpenSnackbar(false)}
                message={snackbarMessage}
            />
        </div>
    );
}

export default ProfilePage;

