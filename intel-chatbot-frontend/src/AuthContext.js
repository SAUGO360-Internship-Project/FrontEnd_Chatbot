import React, { createContext, useState, useEffect } from 'react';
import { getUserToken, saveUserToken, clearUserToken } from './localStorage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getUserToken();
    if (token) {
      setAuth(token);
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    saveUserToken(token);
    setAuth(token);
  };

  const logout = () => {
    clearUserToken();
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, clearUserToken, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
