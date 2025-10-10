import React from 'react';
import ReactDOM from 'react-dom/client';
import AppWrapper from './App'; // Import the default export from App.jsx
import './index.css'; // Make sure your CSS file is imported

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
);