import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SubmitVideo = () => {
    const [link, setLink] = useState('');
    const [description, setDescription] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategory1, setSelectedCategory1] = useState('');
    const [selectedCategory2, setSelectedCategory2] = useState('');
    const [isAboutOpen, setIsAboutOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Submit";
        const existingFavicon = document.querySelector('link[rel="icon"]');
        if (existingFavicon) {
            document.head.removeChild(existingFavicon);
        }
        const favicon = document.createElement('link');        favicon.rel = 'icon';
        favicon.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 0 384 512"><path d="M336 0H48C21.5 0 0 21.5 0 48v416c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V48c0-26.5-21.5-48-48-48zm0 480H48V48h288v432zm-192-240h96c13.3 0 24 10.7 24 24s-10.7 24-24 24h-96c-13.3 0-24-10.7-24-24s10.7-24 24-24zm0-64h96c13.3 0 24 10.7 24 24s-10.7 24-24 24h-96c-13.3 0-24-10.7-24-24s10.7-24 24-24zm0-64h96c13.3 0 24 10.7 24 24s-10.7-24 24-24h-96c-13.3 0-24-10.7-24-24s10.7-24 24-24z"/></svg>';
        document.head.appendChild(favicon);

        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/categories/');
                setCategories(response.data);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };
        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const selectedCategories = [selectedCategory1, selectedCategory2].filter(Boolean);

        try {
            await axios.post('http://127.0.0.1:8000/videos/', 
                { 
                    link, 
                    description, 
                    categories: selectedCategories 
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            navigate('/main');
        } catch (error) {
            if (error.response && error.response.data.link) {
                alert('This video link has already been submitted or this is an invalid link.');
            } else {
                console.error('Error submitting video:', error.message);
            }
        }
    };

    return (
        <div>
            {/* About Bubble */}
            <div
                className="about-bubble"
                style={{
                    position: 'fixed',
                    top: '10px',
                    right: '10px',
                    width: isAboutOpen ? '300px' : '50px',
                    height: isAboutOpen ? '410px' : '50px',
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
                        This is where you submit videos from youtube.
                        To submit a video to be displayed on this website click the "Submit" button after filling the blank spaces and an admin will go over it to check if the video is suitable for this website.
                        </p>
                        <p style={{ fontSize: '0.8rem', marginTop: '5px' }}>
                        Rules: Do not submit videos under a minute in length, try to find the best videos that you would want everyone to see that could teach or help others something
                        </p>
                    </div>
                ) : (
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>?</span>
                )}
            </div>
            <div className="container mt-5" style={{ maxWidth: '850px' }}>
                <div className="row justify-content-center">
                    <div className="col-md-12">
                        <div>
                            <h2 className="text-center mb-4" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: '2rem', color: '#343a40' }}>Submit a Video</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <input
                                        type="text"
                                        className="form-control shadow-sm"
                                        style={{ borderRadius: '8px', padding: '10px', fontSize: '1rem' }}
                                        placeholder="YouTube Link"
                                        value={link}
                                        onChange={(e) => setLink(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <textarea
                                        className="form-control shadow-sm"
                                        style={{ borderRadius: '8px', padding: '10px', fontSize: '1rem', height: '100px' }}
                                        placeholder="Description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <select
                                        className="form-select shadow-sm"
                                        style={{ borderRadius: '8px', padding: '10px', fontSize: '1rem' }}
                                        value={selectedCategory1}
                                        onChange={(e) => setSelectedCategory1(e.target.value)}
                                        required
                                    >
                                        <option value="">Select First Category</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <select
                                        className="form-select shadow-sm"
                                        style={{ borderRadius: '8px', padding: '10px', fontSize: '1rem' }}
                                        value={selectedCategory2}
                                        onChange={(e) => setSelectedCategory2(e.target.value)}
                                    >
                                        <option value="">Select Second Category (Optional)</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button type="submit" className="btngreen btn-primary w-100 shadow" style={{ borderRadius: '10px', fontSize: '1.1rem', padding: '10px 0', transition: 'background-color 0.3s' }}>Submit</button>
                                <div className="d-flex justify-content-between mt-3">
                                    <button 
                                        type="button" 
                                        onClick={() => navigate('/main')} 
                                        className="btn btn-secondary shadow" 
                                        style={{ borderRadius: '10px', fontSize: '1.1rem', padding: '10px 0', width: '48%', transition: 'background-color 0.3s' }}
                                    >
                                        Enter Main Page
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => navigate('/profile')} 
                                        className="btn btn-secondary shadow" 
                                        style={{ borderRadius: '10px', fontSize: '1.1rem', padding: '10px 0', width: '48%', transition: 'background-color 0.3s' }}
                                    >
                                        Enter Profile
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubmitVideo;
