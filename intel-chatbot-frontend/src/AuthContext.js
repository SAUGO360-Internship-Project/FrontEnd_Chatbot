import React, { createContext, useState, useEffect } from 'react';
import { getUserToken, clearUserToken } from './localStorage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    const token = getUserToken();
    if (token) {
      setAuth(token); 
    }
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth, clearUserToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
