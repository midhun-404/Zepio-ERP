import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Removed conflicting axios.defaults.baseURL line to respect global config

    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                const storedUser = localStorage.getItem('user');

                if (token && storedUser) {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    try {
                        const savedUser = JSON.parse(storedUser);
                        // Optimistically set stored user first
                        setUser(savedUser);

                        // Background sync with server to get latest settings (Currency, etc.)
                        // DISABLED for Demo: Prevents overwriting local changes with hardcoded backend defaults
                        /* 
                        axios.get('/settings').then(res => {
                            const settings = res.data;
                            setUser(prev => {
                                const updated = { ...prev, ...settings };
                                localStorage.setItem('user', JSON.stringify(updated));
                                return updated;
                            });
                        }).catch(err => console.error('Background sync failed', err));
                        */

                    } catch (parseError) {
                        console.error('Failed to parse stored user', parseError);
                        localStorage.removeItem('user');
                        localStorage.removeItem('token');
                    }
                }
            } catch (error) {
                console.error('Auth Init Error', error);
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await axios.post('/auth/login', { email, password });
            const { token, user } = res.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
            return { success: true };
        } catch (error) {
            console.error('Login failed', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Login failed'
            };
        }
    };

    const signup = async (data) => {
        try {
            const res = await axios.post('/auth/signup', data);
            const { token, user } = res.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Registration failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const updateUser = (userData) => {
        setUser(prev => {
            const newUser = { ...prev, ...userData };
            localStorage.setItem('user', JSON.stringify(newUser));
            return newUser;
        });
    };

    const value = {
        newUser: user, // Alias for backward compat if needed, but mainly correct below
        user,
        updateUser,
        login,
        signup,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
