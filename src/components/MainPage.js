import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './MainPage.css';



const MainPage = () => {
    const [videos, setVideos] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState([]);
    const [userName, setUserName] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortOrder, setSortOrder] = useState('newest');
    const [likedVideos, setLikedVideos] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [view, setView] = useState('submitted');
    const [popularVideos, setPopularVideos] = useState([]);
    const [popularVideosAlways, setPopularVideosAlways] = useState([]);
    const [recommendedVideos, setRecommendedVideos] = useState([]);
    const [noVideosMessage, setNoVideosMessage] = useState('');
    const [favoriteCategory, setFavoriteCategory] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        setSelectedCategory('');
    }, [view]);

    useEffect(() => {
        document.title = "Main Page";
        const existingFavicon = document.querySelector('link[rel="icon"]');
        if (existingFavicon) {
            document.head.removeChild(existingFavicon);
        }
        const favicon = document.createElement('link');        favicon.rel = 'icon';
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

        const fetchPopularVideos = async () => {
            try {
                const response = await fetch("http://127.0.0.1:8000/api/popular-videos/");
                const data = await response.json();
                setPopularVideos(data.videos);
                setPopularVideosAlways(data.videos)
            } catch (error) {
                console.error("Error fetching popular videos:", error);
            }
        };

        const fetchRecommendedVideos = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }
        
            const decodedToken = jwtDecode(token);
            setUserName(decodedToken.username || 'User');
            setIsAdmin(decodedToken.is_staff);
        
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/recommend-videos/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
        
                // Get the favorite category from the response
                const favoriteCategory = response.data.favorite_category;
                setFavoriteCategory(favoriteCategory); // Save the favorite category in state (add this state)
        
                const recommendedVideosWithDetails = await Promise.all(response.data.recommended_videos.map(async (video) => {
                    const videoId = getYoutubeVideoId(video.link);
                    const videoDetails = await fetchYouTubeDetails(videoId);
                    return {
                        ...video,
                        title: videoDetails.title,
                        thumbnail: videoDetails.thumbnail_url,
                    };
                }));
        
                setRecommendedVideos(recommendedVideosWithDetails);
            } catch (error) {
                console.error('Failed to fetch recommended videos:', error);
            }
        };
        
    
            fetchVideos();
            fetchCategories();
            fetchLikedVideos();
            fetchPopularVideos(); 
            fetchRecommendedVideos();

    }, [navigate, filterStatus, view]);

    

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

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const handleCategoryChange = async (categoryId) => {
        setSelectedCategory(categoryId);  // Store the selected category as a scalar value
    
        const token = localStorage.getItem('token');
        try {
            // Prepare the filter based on selected category and filter status
            let filter = '';
    
            if (filterStatus === 'approved') {
                filter = `?approved=true&denied=false&category_1=${categoryId}`;
            } else if (filterStatus === 'not_approved') {
                filter = `?approved=false&denied=false&category_1=${categoryId}`;
            } else {
                filter = categoryId ? `?category_1=${categoryId}` : '';  // Only add category if selected
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

    const handleCategoryChangePopular = async (categoryId) => {
        setSelectedCategory(categoryId); // Store the selected category ID
    
        try {
            // Filter videos based on selected category
            const filteredVideos = popularVideosAlways.filter(video => {
                console.log('categoryId to filter by:', categoryId);
                return categoryId ? Number(video.categoryId) === Number(categoryId) : true;
            });
    
            if (filteredVideos.length === 0) {
                // If no videos are found, display a message
                setPopularVideos([]);  // Clear the videos array
                setNoVideosMessage('No popular videos right now with this category on YouTube.');
            } else {
                // Update the state with filtered videos
                setPopularVideos(filteredVideos); 
                setNoVideosMessage(''); // Clear "no videos" message
            }
    
            // Log the filtered data directly
            console.log("Filtered videos:", filteredVideos);
        } catch (error) {
            console.error('Failed to fetch popular videos by category:', error);
            setNoVideosMessage('Failed to fetch videos. Please try again later.');
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
            setRecommendedVideos((prevRecommendedVideos) =>
                prevRecommendedVideos.map((video) =>
                    video.id === videoId ? { ...video, likes: video.likes + 1 } : video
                )
            );
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
            setRecommendedVideos((prevRecommendedVideos) =>
                prevRecommendedVideos.map((video) =>
                    video.id === videoId ? { ...video, likes: video.likes - 1 } : video
                )
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

    const sortVideos2 = (videos, order) => {
        return videos.sort((a, b) => {
            if (order === 'desc') {
                return b.likes - a.likes; // Sort by likes in descending order
            } else {
                return a.likes - b.likes; // Sort by likes in ascending order
            }
        });
    };

    const handleCategoryChangeForVideo = async (videoId, newCategoryIds) => {
        const token = localStorage.getItem('token');
        try {
            await axios.patch(`http://127.0.0.1:8000/videos/${videoId}/`, { categories: newCategoryIds }, {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            setVideos((prevVideos) =>
                prevVideos.map((video) =>
                    video.id === videoId ? { ...video, categories: newCategoryIds } : video
                )
            );
        } catch (error) {
            console.error('Failed to update video categories:', error.response?.data?.detail || error.message);
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
                {(view === 'submitted' || view === 'popular') && (
    <>

                <select
        onChange={(e) => {
            // Call the appropriate handler based on the view
            if (view === 'popular') {
                handleCategoryChangePopular(e.target.value);  // Use the popular view handler
            } else {
                handleCategoryChange(e.target.value);  // Use the regular view handler
            }
        }}
        value={selectedCategory}  // Ensure this is a scalar value (string or number)
    >
        <option value="">All Categories</option>
        {categories.map((category) => (
            <option key={category.id} value={category.id}>
                {category.name}
            </option>
        ))}
    </select>
    </>
)}
    {view === 'submitted' && (
    <>
                <input
                    type="text"
                    placeholder="Search by title"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ borderRadius: '8px', border: '1px solid green' }}
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
                    </>
)}
            </nav>
    
            <div style={{ marginTop: '30px' }}>
                <h3>
                    <div className="button-container">
                        <button className="styled-button" onClick={() => setView('submitted')}>
                            Submitted Videos
                        </button>
                        <button className="styled-button" onClick={() => setView('popular')}>
                            Popular Today On Youtube
                        </button>
                        <button className="styled-button" onClick={() => setView('recommended')}>
                            Recommended For You
                        </button>
                    </div>
                </h3>
                <ul>
                    {view === 'submitted' &&
                        sortVideos(filteredVideos, sortOrder).map((video) => (
                            <li key={video.id}>
                                <a href={video.link} target="_blank" rel="noopener noreferrer">
                                    <img src={video.thumbnail} alt={video.title} style={{ width: '120px', marginRight: '10px' }} />
                                    <strong>{video.title}</strong>
                                </a>{' '}
                                <strong>Description:</strong> {video.description}
                                <br />
                                <strong>Categories:</strong> {video.categories?.map((categoryId) => categoryMap[categoryId]).join(', ')} <br />
                                {isAdmin && (
                                    <>
                                        <select
                                            multiple
                                            onChange={(e) => handleCategoryChangeForVideo(video.id, Array.from(e.target.selectedOptions, option => option.value))}
                                            value={video.categories}
                                            style={{ width: '15%', whiteSpace: 'normal', wordWrap: 'break-word', overflowWrap: 'break-word' }}
                                        >
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
                                    onClick={() =>
                                        likedVideos.some((likedVideo) => likedVideo.id === video.id)
                                            ? handleUnlike(video.id)
                                            : handleLike(video.id)
                                    }
                                    className={likedVideos.some((likedVideo) => likedVideo.id === video.id) ? 'liked' : ''}
                                >
                                    {likedVideos.some((likedVideo) => likedVideo.id === video.id) ? 'Unlike' : 'Like'}
                                </button>
                            </li>
                        ))}
{view === 'popular' && (
    <ul>
        {popularVideos && popularVideos.length > 0 ? (
            popularVideos.map((video) => (
                <li key={video.id}>
                    <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer">
                        <img src={video.thumbnail} alt={video.title} style={{ width: '120px', marginRight: '10px' }} />
                        <strong>{video.title}</strong>
                    </a>
                    <p>{video.description}</p>
                    <p>Channel: {video.channelTitle}</p>
                    <p>Published: {new Date(video.publishedAt).toLocaleString()}</p>
                    <p>Category: {video.category || "Error"}</p>
                </li>
            ))
        ) : (
            <p>{noVideosMessage || "Popular videos loading..."}</p>
        )}
    </ul>
)}


{view === 'recommended' &&
    sortVideos2(recommendedVideos.filter((video) => video.approved), 'desc').map((video) => (
        <li key={video.id}>
            <a href={video.link} target="_blank" rel="noopener noreferrer">
                <img src={video.thumbnail} alt={video.title} style={{ width: '120px', marginRight: '10px' }} />
                <strong>{video.title}</strong>
            </a>{' '}
            <strong>Description:</strong> {video.description}
            <br />
            <strong>Categories:</strong> {video.categories?.map((categoryId) => categoryMap[categoryId]).join(', ')} <br />
            {isAdmin && (
                <>
                    <select
                        multiple
                        onChange={(e) => handleCategoryChangeForVideo(video.id, Array.from(e.target.selectedOptions, option => option.value))}
                        value={video.categories}
                        style={{ width: '15%', whiteSpace: 'normal', wordWrap: 'break-word', overflowWrap: 'break-word' }}
                    >
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
                onClick={() =>
                    likedVideos.some((likedVideo) => likedVideo.id === video.id)
                        ? handleUnlike(video.id)
                        : handleLike(video.id)
                }
                className={likedVideos.some((likedVideo) => likedVideo.id === video.id) ? 'liked' : ''}
            >
                {likedVideos.some((likedVideo) => likedVideo.id === video.id) ? 'Unlike' : 'Like'}
            </button>
        </li>
    ))}

                </ul>
            </div>

        </div>
    );
    
    };

    export default MainPage;
