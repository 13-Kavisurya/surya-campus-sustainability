import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoggedIn = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                if (storedUser && storedUser.token) {
                    // Verify token with profile endpoint
                    const res = await api.get('/auth/profile');
                    setUser({ ...res.data, token: storedUser.token });
                }
            } catch (error) {
                console.error('User Auth Check Error:', error);
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };

        checkLoggedIn();
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('user', JSON.stringify(res.data));
        setUser(res.data);
    };

    const register = async (name, email, password, user_type) => {
        const res = await api.post('/auth/register', { name, email, password, user_type });
        localStorage.setItem('user', JSON.stringify(res.data));
        setUser(res.data);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token'); // Cleanup old keys
        localStorage.removeItem('adminToken'); // Cleanup old keys
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
