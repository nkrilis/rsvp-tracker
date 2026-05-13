import React, { useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import RSVPForm from './components/RSVPForm';
import AdminPage from './components/AdminPage';

function GuestApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [guestData, setGuestData] = useState(null);

  const handleLoginSuccess = (data) => {
    setGuestData(data);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setGuestData(null);
  };

  return !isAuthenticated ? (
    <Login onLoginSuccess={handleLoginSuccess} />
  ) : (
    <RSVPForm guestData={guestData} onLogout={handleLogout} />
  );
}

function App() {
  return (
    <div className="App">
      <HashRouter>
        <Routes>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<GuestApp />} />
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;
