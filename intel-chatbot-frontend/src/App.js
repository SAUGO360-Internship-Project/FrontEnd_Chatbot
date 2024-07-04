import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import UserCredentials from './pages/UserCredentials';
import AuthContext from './AuthContext';
import { getUserToken } from './localStorage';

export const SERVER_URL = 'http://127.0.0.1:5000';

function App() {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);

  useEffect(() => {
    const token = getUserToken();
    if (token && !auth) {
      navigate('/pages/ChatPage');
    }
  }, [auth, navigate]);

  return (
    <div>
      <UserCredentials />

    </div>
  );
}

export default App;
