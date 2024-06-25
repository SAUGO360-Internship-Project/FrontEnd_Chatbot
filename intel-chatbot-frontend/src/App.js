import React from 'react';
import './App.css';
import UserCredentials from './pages/UserCredentials';

export var SERVER_URL = 'http://127.0.0.1:5000'

function App() {
  return (
    <div>
      <UserCredentials></UserCredentials>
    </div>
  )
}
export default App;
