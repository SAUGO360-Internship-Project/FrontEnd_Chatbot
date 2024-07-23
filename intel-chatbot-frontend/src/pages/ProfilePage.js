import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Snackbar, Grid, Avatar, Typography, TextField, Container } from '@mui/material';
import { getUserToken } from '../localStorage';
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
                "Authorization": `Bearer ${userToken}`
            },
            body: updateData,
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Couldn't update profile");
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
                setSnackbarMessage(error.message);
                setOpenSnackbar(true);
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

    return (
        <Container className="profile-container">
            <Grid container spacing={3} className="profile-content">
                <Grid item xs={12} sm={4} align="center">
                    {isEditing && (
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="profile-image-upload"
                            type="file"
                            onChange={handleImageChange}
                        />
                    )}
                    <label htmlFor="profile-image-upload">
                        <Avatar
                            style={{ height: '200px', width: '200px', marginBottom: 10, marginTop: 20, cursor: isEditing ? 'pointer' : 'default' }}
                            src={formData.profile_image ? `${SERVER_URL}${formData.profile_image}` : '/default-profile.png'}
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
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleSave}
                                    >
                                        Save
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleEditClick}
                                >
                                    Edit
                                </Button>
                            )}
                        </div>
                    </div>
                </Grid>
            </Grid>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={() => setOpenSnackbar(false)}
                message={snackbarMessage}
            />
        </Container>
    );
}

export default ProfilePage;
