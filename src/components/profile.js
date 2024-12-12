import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './Profile.css';

const Profile = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [likedVideos, setLikedVideos] = useState([]);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [categoryMessage, setCategoryMessage] = useState('');
    const [showCategories, setShowCategories] = useState(false);
    const [categories, setCategories] = useState([]);
    const [editCategory, setEditCategory] = useState({});
    const [uploadedVideos, setUploadedVideos] = useState([]);
    const [isAboutOpen, setIsAboutOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Profile";
        const existingFavicon = document.querySelector('link[rel="icon"]');
        if (existingFavicon) {
            document.head.removeChild(existingFavicon);
        }
        const favicon = document.createElement('link');        favicon.rel = 'icon';
        favicon.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 0 448 512"><path d="M224 256A128 128 0 1 0 96 128a128 128 0 0 0 128 128zm89.6 32h-16.7a174.7 174.7 0 0 1-145.8 0h-16.7A134.4 134.4 0 0 0 0 422.4v25.6A64 64 0 0 0 64 512h320a64 64 0 0 0 64-64v-25.6A134.4 134.4 0 0 0 313.6 288z"/></svg>';
        document.head.appendChild(favicon);

        const fetchUserInfo = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }
            try {
                const decodedToken = jwtDecode(token);
                setIsAdmin(decodedToken.is_staff);

                const userResponse = await axios.get('http://127.0.0.1:8000/api/user/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUserInfo(userResponse.data);

                const likedResponse = await axios.get('http://127.0.0.1:8000/api/liked-videos/', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const likedVideosWithDetails = await Promise.all(
                    likedResponse.data.map(async (video) => {
                        const videoId = getYoutubeVideoId(video.link);
                        const videoDetails = await fetchYouTubeDetails(videoId);
                        return {
                            ...video,
                            title: videoDetails.title,
                            thumbnail: videoDetails.thumbnail_url,
                        };
                    })
                );

                setLikedVideos(likedVideosWithDetails);
            } catch (error) {
                console.error('Error fetching user info or liked videos:', error);
            }
        };

        fetchUserInfo();
    }, [navigate]);

    useEffect(() => {
        const fetchUploadedVideos = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/user-videos/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
    
                const videosWithDetails = await Promise.all(
                    response.data.map(async (video) => {
                        const videoId = getYoutubeVideoId(video.link);
                        const videoDetails = await fetchYouTubeDetails(videoId);
                        return {
                            ...video,
                            title: videoDetails.title,
                            thumbnail: videoDetails.thumbnail_url,
                        };
                    })
                );
    
                setUploadedVideos(videosWithDetails);
            } catch (error) {
                console.error('Error fetching uploaded videos:', error);
            }
        };
    
        fetchUploadedVideos();
    }, [navigate]);

    const getYoutubeVideoId = (url) => {
        const urlObj = new URL(url);
        return urlObj.searchParams.get('v');
    };

    const fetchYouTubeDetails = async (videoId) => {
        try {
            const response = await axios.get(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
            return response.data;
        } catch (error) {
            console.error('Error fetching YouTube details:', error);
            return { title: 'Unknown Title', thumbnail_url: '' };
        }
    };

    const validatePassword = (password) => {
        const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/; // At least 1 letter, 1 number, 6 characters
        return passwordPattern.test(password);
    };
    
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordMessage('');
    
        if (newPassword !== confirmPassword) {
            setPasswordMessage('New passwords do not match.');
            return;
        }

        if (!validatePassword(newPassword)) {
            setPasswordMessage('New password must be at least 6 characters long and contain at least 1 letter and 1 number.');
            return;
        }

        const token = localStorage.getItem('token');
        try {
            await axios.post('http://127.0.0.1:8000/api/change-password/', {
                current_password: currentPassword,
                new_password: newPassword,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPasswordMessage('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            setPasswordMessage('Error changing password. Ensure the current password is correct.');
            console.error('Error changing password:', error);
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        setCategoryMessage('');

        const token = localStorage.getItem('token');
        try {
            await axios.post('http://127.0.0.1:8000/categories/', {
                name: newCategoryName,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCategoryMessage('Category added successfully!');
            setNewCategoryName('');
        } catch (error) {
            setCategoryMessage('Error adding category. The category might already exist.');
            console.error('Error adding category:', error);
        }
    };

    const fetchCategories = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get('http://127.0.0.1:8000/categories/', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleShowCategories = () => {
        if (!showCategories) {
            fetchCategories();
        }
        setShowCategories(!showCategories);
    };

    const handleEditCategory = (categoryId, newName) => {
        setEditCategory((prevEdit) => ({ ...prevEdit, [categoryId]: newName }));
    };

    const saveEditedCategory = async (categoryId) => {
        const token = localStorage.getItem('token');
        try {
            await axios.put(`http://127.0.0.1:8000/categories/${categoryId}/`, {
                name: editCategory[categoryId],
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCategoryMessage('Category name updated successfully!');
            setEditCategory({});
            fetchCategories(); 
        } catch (error) {
            setCategoryMessage('Error updating category name.');
            console.error('Error updating category:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token'); 
        navigate('/');
    };

    return (
        <div>
            <nav style={{position: 'fixed', 
            width: '100%', 
            backgroundColor: '#f8f8f8', 
            padding: '8px', 
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'}}>
            <button className="logout-button" onClick={handleLogout}>Logout</button>
            <button className="back-button" onClick={() => navigate('/main')}>Back to Main Page</button>
            {isAdmin && (
            <button className="back-button" onClick={() => navigate('/users')}>Users list</button>
            )}
<div
                className="about-bubble"
                style={{
                    position: 'fixed',
                    top: '5px',
                    right: '10px',
                    width: isAboutOpen ? '400px' : '50px',
                    height: isAboutOpen ? '280px' : '50px',
                    borderRadius: '25px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    cursor: 'pointer',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease-in-out',
                    padding: isAboutOpen ? '15px' : '0',
                    overflow: isAboutOpen ? 'auto' : 'hidden',
                    zIndex: 1000,
                }}
                onClick={() => setIsAboutOpen(!isAboutOpen)}
            >
                {isAboutOpen ? (
                    <div>
                        <p style={{ fontSize: '0.9rem', marginTop: '5px' }}>
                        The main point of the website is to have a selection of the best and useful youtube videos to watch instead of having to scroll on youtube trying to find the perfect video for hours. or suggest you youtube videos on its own
                        </p>
                        <p style={{ fontSize: '0.8rem', marginTop: '5px' }}>
                        This is your profile page where you can change your password, see which videos you submitted and which videos you liked.
                        </p>
                        <p style={{ fontSize: '0.8rem', marginTop: '5px' }}>
                        To submit a video go to the main page and choose the "submit video" button or{' '}
                            <span 
                            onClick={() => navigate('/submit-video')} 
                            style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}>
                            press here
                            </span>.
                        </p>
                    </div>
                ) : (
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>?</span>
                )}
            </div>
            </nav>                
            <div className="profile-container">
                <br></br>
            <h2>Your Profile</h2>
            {userInfo ? (
                <div className="profile-info">
                    <p><strong>Name:</strong> {userInfo.username}</p>
                    <p><strong>Email:</strong> {userInfo.email}</p>

                    {isAdmin && (
                        <div className="admin-category-section">
                            <h3>Add a New Category</h3>
                            <form onSubmit={handleAddCategory} className="category-form">
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="Category Name"
                                    required
                                />
                                &nbsp;
                                <button className="toggle-button" type="submit">Add Category</button>
                            </form>
                            {categoryMessage && <p className="message">{categoryMessage}</p>}

                            <button className="toggle-button" onClick={handleShowCategories}>
                                {showCategories ? 'Hide Categories' : 'Show All Categories'}
                            </button>

                            {showCategories && (
                                <ul className="category-list">
                                    {categories.map(category => (
                                        <li key={category.id} className="category-item">
                                            <input
                                                type="text"
                                                value={editCategory[category.id] || category.name}
                                                onChange={(e) => handleEditCategory(category.id, e.target.value)}
                                            />
                                            <button onClick={() => saveEditedCategory(category.id)}>
                                                Save
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    <h3>Change Password</h3>
                    <form onSubmit={handleChangePassword} className="password-form">
                        <div>
                            <label>Current Password:</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label>New Password:</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label>Confirm New Password:</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button className="pwd-button" type="submit">Change Password</button>
                    </form>
                    {passwordMessage && <p className="message">{passwordMessage}</p>}
                </div>
            ) : (
                <p>Loading...</p>
            )}

<h3>Uploaded Videos:</h3>
{uploadedVideos.length > 0 ? (
    <ul className="liked-videos">
        {uploadedVideos.map((video) => (
            <li key={video.id} className="liked-video-item">
                <a href={video.link} target="_blank" rel="noopener noreferrer">
                    <img src={video.thumbnail} alt={video.title} className="video-thumbnail" />
                    {video.title}
                </a>
                <div className={`video-status ${video.approved ? 'approved' : video.denied ? 'denied' : 'pending'}`}>
                    {video.approved ? 'Approved' : video.denied ? 'Denied' : 'Not Yet Approved'}
                </div>
            </li>
        ))}
    </ul>
) : (
    <div>
        <p>You never submitted a video, why not do it now?</p>
        <button className="Submitbutton" onClick={() => navigate('/submit-video')}>Submit Video</button>
    </div>
)}


            <h3>Liked Videos:</h3>
            <ul className="liked-videos">
                {likedVideos.map(video => (
                    <li key={video.id} className="liked-video-item">
                        <a href={video.link} target="_blank" rel="noopener noreferrer">
                            <img src={video.thumbnail} alt={video.title} className="video-thumbnail" />
                            {video.title}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
        </div>

    );
};

export default Profile;
