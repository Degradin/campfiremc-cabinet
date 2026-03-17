import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// TODO: Use environment variable for API URL
const API_URL = 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for a token in local storage to maintain session
    const token = localStorage.getItem('token');
    if (token) {
      // TODO: Add a /me endpoint to verify token and get user data
      // For now, we'll just assume the token is valid and decode it
      // This is not secure for production!
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUser({ id: decoded.id, uuid: decoded.uuid, token });
      } catch (error) {
        console.error("Failed to decode token", error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const response = await axios.post(`${API_URL}/auth/authenticate`, { username, password });
    const { accessToken, selectedProfile } = response.data;
    const userData = { ...selectedProfile, token: accessToken };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return response.data;
  };

  const register = async (username, email, password) => {
    return await axios.post(`${API_URL}/auth/register`, { username, email, password });
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
