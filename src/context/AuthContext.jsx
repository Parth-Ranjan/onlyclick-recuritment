import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';


export const AuthContext = createContext();


export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserData();
    } else {
      setIsLoading(false);
    }
  }, []);


  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      
      const response = await axios.get('https://jsonplaceholder.typicode.com/users/1');
      setCurrentUser(response.data);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching user data:', err);
      logout(); 
      setIsLoading(false);
    }
  };

  
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      setError('');
      
      
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        email,
        password
      });
      
      const { token } = response.data;
      
      if (token) {
        localStorage.setItem('authToken', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
       n
        await fetchUserData();
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login');
      setIsLoading(false);
      return false;
    }
  };

  // Signup function
  const signup = async (email, password, name) => {
    try {
      setIsLoading(true);
      setError('');
      
      
      const response = await axios.post('http://localhost:3000/api/auth/signup', {
        email,
        password,
        name
      });
      
      const { token } = response.data;
      
      if (token) {
        localStorage.setItem('authToken', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        
        await fetchUserData();
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register');
      setIsLoading(false);
      return false;
    }
  };


  const logout = () => {
    localStorage.removeItem('authToken');
    delete axios.defaults.headers.common['Authorization'];
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    isLoading,
    error,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};