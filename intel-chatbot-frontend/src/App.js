import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import UserCredentials from './pages/UserCredentials';
import AuthContext from './AuthContext';

export const SERVER_URL = 'http://127.0.0.1:5000';

function App() {
  const navigate = useNavigate();
  const { auth, loading } = useContext(AuthContext);

  useEffect(() => {
    if (!loading) {
      if (auth) {
        navigate('/pages/ChatPage');
      } else {
        navigate('/login');
      }
    }
  }, [auth, loading, navigate]);

  if (loading) {
    return <div>Loading...</div>; 
  }

  return (
    <div>
      <UserCredentials />
    </div>
  );
}

export default App;
