import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoggedIn = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                if (token) {
                    const res = await api.get('/admin/auth/profile', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setAdmin({ ...res.data, token });
                }
                // No token = no auto-login. Admin must visit /admin/login explicitly.
            } catch (error) {
                console.error('Admin Auth Check Error:', error);
                localStorage.removeItem('adminToken');
            } finally {
                setLoading(false);
            }
        };

        checkLoggedIn();
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/admin/auth/login', { email, password });
        localStorage.setItem('adminToken', res.data.token);
        setAdmin(res.data);
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        setAdmin(null);
    };

    return (
        <AdminAuthContext.Provider value={{ admin, login, logout, loading }}>
            {children}
        </AdminAuthContext.Provider>
    );
};
