import React, { createContext, useState, useEffect, useContext } from 'react';


export const ThemeContext = createContext();


export const useTheme = () => {
  return useContext(ThemeContext);
};

export const ThemeProvider = ({ children }) => {
 
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    const userPreference = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    return savedTheme === 'dark' || (!savedTheme && userPreference) ? 'dark' : 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);

  
  useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    localStorage.setItem('theme', theme);
  }, [theme]);


  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};