import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import MainPage from './components/MainPage';
import SubmitVideo from './components/SubmitVideo';
import Profile from './components/profile';
import Users from './components/Users';
import 'bootstrap/dist/css/bootstrap.min.css';


const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/main" element={<MainPage />} />
                <Route path="/submit-video" element={<SubmitVideo />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/users" element={<Users />} />

            </Routes>
        </Router>
    );
};

export default App;
