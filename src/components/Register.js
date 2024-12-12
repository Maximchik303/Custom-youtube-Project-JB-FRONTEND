import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Register";
        const existingFavicon = document.querySelector('link[rel="icon"]');
        if (existingFavicon) {
            document.head.removeChild(existingFavicon);
        }
        const favicon = document.createElement('link');        favicon.rel = 'icon';
        favicon.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 0 599 544"><path d="M502.6 233.4l-96-96c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9L419.1 232H176c-13.3 0-24 10.7-24 24s10.7 24 24 24h243.1l-46.4 46.4c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l96-96c9.5-9.4 9.5-24.6.1-34zm-262.6 198c-13.3 0-24-10.7-24-24v-64c0-13.3-10.7-24-24-24s-24 10.7-24 24v64c0 57.3 46.7 104 104 104h192c57.3 0 104-46.7 104-104V128c0-57.3-46.7-104-104-104H320c-57.3 0-104 46.7-104 104v64c0 13.3 10.7 24 24 24s24-10.7 24-24v-64c0-31.8 25.9-57.6 57.6-57.6H448c31.8 0 57.6 25.9 57.6 57.6v256c0 31.8-25.9 57.6-57.6 57"/></svg>';
        document.head.appendChild(favicon);
    }, []);

    const validatePassword = (password) => {
        const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/; // At least 1 letter, 1 number, 6 characters
        return passwordPattern.test(password);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validatePassword(password)) {
            setError('Password must be at least 6 characters long and contain at least 1 letter and 1 number.');
            return;
        }

        try {
            await axios.post('http://127.0.0.1:8000/api/register/', { username, email, password });
            navigate('/');
        } catch (error) {
            console.error('Registration failed:', error);
            setError('Registration failed. Please try again.');
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-4">
                    <h2 className="text-center">Register</h2>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <form onSubmit={handleSubmit} className="shadow p-4 rounded bg-light">
                        <div className="mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <input
                                type="email"
                                className="form-control"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btngreen btn-primary w-100" style={{borderRadius:8, padding:6}}>Register</button>
                    </form>
                    <p className="mt-3 text-center">
                        Have an account? <a href="/">Log In</a>
                    </p>
                    <p className="mt-3 text-center">
                         <a href="/About">About Page</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
