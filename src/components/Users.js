import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [filterActive, setFilterActive] = useState('all');
    const [filterAdmin, setFilterAdmin] = useState('all');
    const [currentUserId, setCurrentUserId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Users";
        const existingFavicon = document.querySelector('link[rel="icon"]');
        if (existingFavicon) {
            document.head.removeChild(existingFavicon);
        }
        const favicon = document.createElement('link');
        favicon.rel = 'icon';
        favicon.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 0 448 512"><path d="M224 256A128 128 0 1 0 96 128a128 128 0 0 0 128 128zm89.6 32h-16.7a174.7 174.7 0 0 1-145.8 0h-16.7A134.4 134.4 0 0 0 0 422.4v25.6A64 64 0 0 0 64 512h320a64 64 0 0 0 64-64v-25.6A134.4 134.4 0 0 0 313.6 288z"/></svg>';
        document.head.appendChild(favicon);
        const token = localStorage.getItem('token');
        if (!token) {
            alert("You need to be logged in to view this page.");
            navigate('/');
            return;
        }

        const decodedToken = jwtDecode(token);
        setCurrentUserId(decodedToken.user_id);

        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/users/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUsers(response.data);
                setFilteredUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
                if (error.response && error.response.status === 401) {
                    alert('Unauthorized access. Please log in again.');
                    navigate('/');
                }
            }
        };
        fetchUsers();
    }, [navigate]);

    // Filter users based on search input, active status, and admin status
    const applyFilters = useCallback(() => {
        let filtered = [...users];

        if (filterActive !== 'all') {
            const isActive = filterActive === 'active';
            filtered = filtered.filter(user => user.is_active === isActive);
        }

        if (filterAdmin !== 'all') {
            const isAdmin = filterAdmin === 'admin';
            filtered = filtered.filter(user => user.is_staff === isAdmin);
        }

        if (searchText) {
            filtered = filtered.filter(user =>
                user.username.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        setFilteredUsers(filtered);
    }, [users, filterActive, filterAdmin, searchText]);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    const handleSearchChange = (event) => {
        setSearchText(event.target.value);
    };

    const handleFilterChange = (type, value) => {
        if (type === 'active') {
            setFilterActive(value);
        } else if (type === 'admin') {
            setFilterAdmin(value);
        }
    };

    const toggleAdminStatus = async (userId, isAdmin) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("You need to be logged in to perform this action.");
            navigate('/login');
            return;
        }

        if (userId === currentUserId) {
            alert("You cannot revoke your own admin rights.");
            return;
        }

        try {
            await axios.patch(
                `http://127.0.0.1:8000/api/users/${userId}/toggle-admin/`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUsers(users.map(user =>
                user.id === userId ? { ...user, is_staff: !isAdmin } : user
            ));
        } catch (error) {
            console.error('Error toggling admin status:', error);
            alert('An error occurred while changing the admin status.');
        }
    };

    const toggleUserActiveStatus = async (userId, isActive) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("You need to be logged in to perform this action.");
            navigate('/login');
            return;
        }

        if (userId === currentUserId) {
            alert("You cannot deactivate your own account.");
            return;
        }

        try {
            await axios.patch(
                `http://127.0.0.1:8000/users/${userId}/toggle-active/`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUsers(users.map(user =>
                user.id === userId ? { ...user, is_active: !isActive } : user
            ));
        } catch (error) {
            console.error('Error toggling user active status:', error);
            alert('An error occurred while changing the user active status.');
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: '850px' }}>
            <div className="row justify-content-center">
                <div className="col-md-12">
                    <h2 className="text-center mb-4">Users List</h2>
                    <button
                        onClick={() => navigate('/profile')}
                        className="btn btn-secondary mb-4"
                        style={{ borderRadius: '10px', fontSize: '1.1rem', padding: '10px 0' }}
                    >
                        Back to Profile
                    </button>

                    {/* Search Input */}
                    <input
                        type="text"
                        value={searchText}
                        onChange={handleSearchChange}
                        className="form-control mb-2"
                        placeholder="Search by username"
                        style={{ borderRadius: '10px', fontSize: '1rem' }}
                    />

                    {/* Filters */}
                    <div className="mb-4">
                        <select
                            value={filterActive}
                            onChange={(e) => handleFilterChange('active', e.target.value)}
                            className="form-select mb-2"
                        >
                            <option value="all">All Users</option>
                            <option value="active">Active Users</option>
                            <option value="inactive">Inactive Users</option>
                        </select>
                        <select
                            value={filterAdmin}
                            onChange={(e) => handleFilterChange('admin', e.target.value)}
                            className="form-select"
                        >
                            <option value="all">All Users</option>
                            <option value="admin">Admin Users</option>
                            <option value="non-admin">Non-Admin Users</option>
                        </select>
                    </div>

                    <ul className="list-group">
                        {filteredUsers.map((user) => (
                            <li key={user.id} className="list-group-item">
                                <h5>{user.username}</h5>
                                <p>{user.email}</p>
                                <button
                                    onClick={() => toggleAdminStatus(user.id, user.is_staff)}
                                    className={`btn ${user.is_staff ? 'btn-warning' : 'btn-success'}`}
                                    style={{ marginRight: '10px' }}
                                >
                                    {user.is_staff ? 'Revoke Admin' : 'Make Admin'}
                                </button>
                                <button
                                    onClick={() => toggleUserActiveStatus(user.id, user.is_active)}
                                    className={`btn ${user.is_active ? 'btn-danger' : 'btn-primary'}`}
                                >
                                    {user.is_active ? 'Deactivate Account' : 'Activate Account'}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Users;
