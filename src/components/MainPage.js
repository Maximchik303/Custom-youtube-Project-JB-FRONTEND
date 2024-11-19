import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './MainPage.css';



const MainPage = () => {
    const [videos, setVideos] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [userName, setUserName] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortOrder, setSortOrder] = useState('newest');
    const [likedVideos, setLikedVideos] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Main Page";
        const favicon = document.createElement('link');
        favicon.rel = 'icon';
        favicon.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 0 576 512"><path d="M288 0l-288 288h72v224h144V352h96v160h144V288h72L288 0z"/></svg>';
        document.head.appendChild(favicon);

        const fetchVideos = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }

            const decodedToken = jwtDecode(token);
            setUserName(decodedToken.username || 'User');
            setIsAdmin(decodedToken.is_staff);

            try {
                let filter = '';
                if (filterStatus === 'approved') {
                    filter = '?approved=true&denied=false';
                } else if (filterStatus === 'not_approved') {
                    filter = '?approved=false&denied=false';
                } else if (filterStatus === 'denied') {
                    filter = '?denied=true';    
                }
                

                const response = await axios.get(`http://127.0.0.1:8000/videos/${filter}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const videosWithDetails = await Promise.all(response.data.map(async (video) => {
                    const videoId = getYoutubeVideoId(video.link);
                    const videoDetails = await fetchYouTubeDetails(videoId);
                    return {
                        ...video,
                        title: videoDetails.title,
                        thumbnail: videoDetails.thumbnail_url
                    };
                }));

                setVideos(videosWithDetails);
            } catch (error) {
                console.error('Failed to fetch videos:', error);
            }
        };

        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/categories/');
                setCategories(response.data);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };
        const fetchLikedVideos = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }
            try {
                const decodedToken = jwtDecode(token);
                setIsAdmin(decodedToken.is_staff);
    
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
                console.error('Error fetching liked videos:', error);
            }
        };
    
        fetchVideos();
        fetchCategories();
        fetchLikedVideos();

    }, [navigate, filterStatus]);

    

    const getYoutubeVideoId = (url) => {
        const urlObj = new URL(url);
        return urlObj.searchParams.get('v');
    };

    // Function to fetch YouTube video details using oEmbed
    const fetchYouTubeDetails = async (videoId) => {
        try {
            const response = await axios.get(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
            return response.data;
        } catch (error) {
            console.error('Error fetching YouTube details:', error);
            return { title: 'Unknown Title', thumbnail_url: '' };
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const handleCategoryChange = async (categoryId) => {
        setSelectedCategory(categoryId);
        const token = localStorage.getItem('token');
        try {
            let filter = '';
            if (filterStatus === 'approved') {
                filter = `?approved=true&denied=false&category=${categoryId}`;
            } else if (filterStatus === 'not_approved') {
                filter = `?approved=false&denied=false&category=${categoryId}`;
            } else {
                filter = `?category=${categoryId}`;
            }
    
            const response = await axios.get(`http://127.0.0.1:8000/videos/${filter}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const videosWithDetails = await Promise.all(response.data.map(async (video) => {
                const videoId = getYoutubeVideoId(video.link);
                const videoDetails = await fetchYouTubeDetails(videoId);
                return {
                    ...video,
                    title: videoDetails.title,
                    thumbnail: videoDetails.thumbnail_url,
                };
            }));
            
            setVideos(videosWithDetails);
        } catch (error) {
            console.error('Failed to fetch videos by category:', error);
        }
    };
    

    const handleLike = async (videoId) => {
        const token = localStorage.getItem('token');
        try {
            await axios.post(`http://127.0.0.1:8000/videos/${videoId}/like/`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVideos((prevVideos) =>
                prevVideos.map((video) =>
                    video.id === videoId ? { ...video, likes: video.likes + 1 } : video
                )
            );
            const newLikedVideo = { id: videoId };  
            setLikedVideos((prevLikedVideos) => [...prevLikedVideos, newLikedVideo]);
        } catch (error) {
            console.error('Error liking video:', error.response?.data?.detail || error.message);
        }
    };

    const handleUnlike = async (videoId) => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://127.0.0.1:8000/videos/${videoId}/unlike/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVideos((prevVideos) =>
                prevVideos.map((video) =>
                    video.id === videoId ? { ...video, likes: video.likes - 1 } : video
                )
            );
            setLikedVideos((prevLikedVideos) =>
                prevLikedVideos.filter(likedVideo => likedVideo.id !== videoId)
            );
        } catch (error) {
            console.error('Error unliking video:', error.response?.data?.detail || error.message);
        }
    };
    

    const handleApproveVideo = async (videoId) => {
        const token = localStorage.getItem('token');
        try {
            await axios.patch(`http://127.0.0.1:8000/videos/${videoId}/`, { approved: true }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVideos((prevVideos) => 
                prevVideos.map((video) => 
                    video.id === videoId ? { ...video, approved: true } : video
                )
            );
        } catch (error) {
            console.error('Error approving video:', error.response?.data?.detail || error.message);
        }
    };

    const handleDenyVideo = async (videoId) => {
        const token = localStorage.getItem('token');
        try {
            await axios.patch(`http://127.0.0.1:8000/videos/${videoId}/`, { denied: true }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setVideos((prevVideos) =>
                prevVideos.map((video) =>
                    video.id === videoId ? { ...video, denied: true } : video
                )
            );
        } catch (error) {
            console.error('Error denying video:', error.response?.data?.detail || error.message);
        }
    };
    
    const categoryMap = categories.reduce((acc, category) => {
        acc[category.id] = category.name;
        return acc;
    }, {});

    const handleUndenyVideo = async (videoId) => {
        const token = localStorage.getItem('token');
        try {
            await axios.patch(`http://127.0.0.1:8000/videos/${videoId}/`, { denied: false }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVideos((prevVideos) => 
                prevVideos.map((video) => 
                    video.id === videoId ? { ...video, denied: false } : video
                )
            );
        } catch (error) {
            console.error('Error approving video:', error.response?.data?.detail || error.message);
        }
    };
    
    const handleUnapproveVideo = async (videoId) => {
        const token = localStorage.getItem('token');
        try {
            await axios.patch(`http://127.0.0.1:8000/videos/${videoId}/`, { approved: false }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVideos((prevVideos) =>
                prevVideos.map((video) =>
                    video.id === videoId ? { ...video, approved: false } : video
                )
            );
        } catch (error) {
            console.error('Error unapproving video:', error.response?.data?.detail || error.message);
        }
    };

    const handleSortOrderChange = (event) => {
        setSortOrder(event.target.value);
    };

    const sortVideos = (videos, order) => {
        return [...videos].sort((a, b) => {
            if (order === 'newest') {
                return new Date(b.createdTime) - new Date(a.createdTime);
            } else {
                return new Date(a.createdTime) - new Date(b.createdTime); 
            }
        });
    };


    const handleCategoryChangeForVideo = async (videoId, newCategoryId) => {
        const token = localStorage.getItem('token');
        try {
            await axios.patch(`http://127.0.0.1:8000/videos/${videoId}/`, { category: newCategoryId }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setVideos((prevVideos) =>
                prevVideos.map((video) =>
                    video.id === videoId ? { ...video, category: newCategoryId } : video
                )
            );
        } catch (error) {
            console.error('Failed to update video category:', error.response?.data?.detail || error.message);
        }
    };

    const filteredVideos = videos.filter((video) =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    

    return (
        <div>
            <br />
            <br />
            <br />
            <h2>Welcome {userName}</h2>
            <nav style={{ position: 'fixed', top: 0, width: '100%', backgroundColor: '#f8f8f8', padding: '10px', zIndex: 1000 }}>
                <button onClick={handleLogout}>Logout</button>
                <button onClick={() => navigate('/submit-video')}>Submit Video</button>
                <button onClick={() => navigate('/profile')}>Profile</button>
                <select onChange={(e) => handleCategoryChange(e.target.value)} value={selectedCategory}>
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
                <input
    type="text"
    placeholder="Search by title"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    style={{ borderRadius: '8px' , border : '1px solid, green'}}
/>

                <select onChange={handleSortOrderChange} value={sortOrder} style={{ marginLeft: '10px' }}>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                </select>
            {isAdmin && (
                <select onChange={(e) => setFilterStatus(e.target.value)} value={filterStatus} style={{ marginLeft: '10px' }}>
                  <option value="all">All</option>
                 <option value="approved">Approved</option>
                 <option value="not_approved">Not Approved</option>
                 <option value="denied">Denied</option>
             </select>
            )}
            </nav>

            <div style={{ marginTop: '30px' }}>
                <h3>&nbsp; Submitted Videos</h3>
                <p>&nbsp;&nbsp;&nbsp;&nbsp; Number of videos: {filteredVideos.length}</p>
                <ul>
    {sortVideos(filteredVideos, sortOrder).map((video) => (
        <li key={video.id}>
            <a href={video.link} target="_blank" rel="noopener noreferrer">
                <img src={video.thumbnail} alt={video.title} style={{ width: '120px', marginRight: '10px' }} />
                <strong>{video.title}</strong>
            </a> <strong>Description:</strong> {video.description}
            <br />
            <strong>Category:</strong> {categoryMap[video.category]} <br />
            {isAdmin && (
                                <>
                                    <select onChange={(e) => handleCategoryChangeForVideo(video.id, e.target.value)} value={video.category}>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </>
                            )}
            <strong>Uploaded here by:</strong> {video.user} <br />
            <strong>Uploaded here on:</strong> {new Date(video.createdTime).toLocaleString()} <br />
            <strong className="likes-count">Likes:</strong> <span>{video.likes}</span>
            {isAdmin ? (
                video.approved ? (
                    <>
                    <span style={{ color: 'green' }}> - Approved</span>
                    <button onClick={() => handleUnapproveVideo(video.id)}>Unapprove</button>
                    </>
                ) : (
                    <>
                        {video.denied ? (
                            <>
                                <span style={{ color: 'red' }}> - Denied</span>
                                <button onClick={() => handleUndenyVideo(video.id)}>Undeny</button>
                            </>
                        ) : (
                            <>
                                <span style={{ color: 'red' }}> - Not Approved</span>
                                <button onClick={() => handleApproveVideo(video.id)}>Approve</button>
                                <button onClick={() => handleDenyVideo(video.id)}>Deny</button>
                            </>
                        )}
                    </>
                )
            ) : null}
<button
    onClick={() => likedVideos.some(likedVideo => likedVideo.id === video.id) 
        ? handleUnlike(video.id) 
        : handleLike(video.id)}
    className={likedVideos.some(likedVideo => likedVideo.id === video.id) ? 'liked' : ''}
>
    {likedVideos.some(likedVideo => likedVideo.id === video.id) ? 'Unlike' : 'Like'}
</button>

                    </li>
    ))}
</ul>

            </div>
        </div>
    );
};

export default MainPage;
