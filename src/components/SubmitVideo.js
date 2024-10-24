import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SubmitVideo = () => {
    const [link, setLink] = useState('');
    const [description, setDescription] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
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
        try {
            await axios.post('http://127.0.0.1:8000/videos/', 
                { 
                    link, 
                    description, 
                    category: selectedCategory  
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
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    required
                                >
                                    <option value="">Select a Category</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" className="btn btn-primary w-100 shadow" style={{ borderRadius: '10px', fontSize: '1.1rem', padding: '10px 0', transition: 'background-color 0.3s' }}>Submit</button>
                            <button 
                                type="button" 
                                onClick={() => navigate('/main')} 
                                className="btn btn-secondary w-100 shadow mt-3" 
                                style={{ borderRadius: '10px', fontSize: '1.1rem', padding: '10px 0', transition: 'background-color 0.3s' }}
                            >
                                Back to Main Page
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubmitVideo;