import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';
import App from './App';
import ChatPage from './pages/ChatPage';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider, createTheme } from '@mui/material/styles';


const root = ReactDOM.createRoot(document.getElementById('root'));
const theme = createTheme(); // This creates the default theme
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/pages/ChatPage" element={<ChatPage />} />
          <Route path="*" element={<App />} />
        </Routes>
      </Router>
    </ThemeProvider>,

  </React.StrictMode>
);

reportWebVitals();
