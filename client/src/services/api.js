import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to headers if it exists
api.interceptors.request.use((config) => {
    try {
        // Try standard user token first
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        } else {
            // Fall back to admin token
            const adminToken = localStorage.getItem('adminToken');
            if (adminToken) {
                config.headers.Authorization = `Bearer ${adminToken}`;
            }
        }
    } catch (e) {
        console.error('Error parsing user from localStorage', e);
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
