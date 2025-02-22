import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';
import App from './App';
import ChatPage from './pages/ChatPage';
import reportWebVitals from './reportWebVitals';
import PrivateRoute from './PrivateRoute';
import { AuthProvider } from './AuthContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ForgotPassword from './components/ForgotPassword';
import LostQRCode from './components/LostQrcode';
import ProfilePage from './pages/ProfilePage';
import theme from './theme'


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<App />} />
            <Route path="/pages/ChatPage" element={<PrivateRoute element={<ChatPage />} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/pages/ProfilePage" element={<ProfilePage />} /> 
            <Route path="/lost-qrcode" element={<LostQRCode />} />
            <Route path="*" element={<App />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>

  </React.StrictMode>
);

reportWebVitals();
