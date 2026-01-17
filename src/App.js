import React, { useState } from 'react';
import './App.css';
import Login from './components/Login';
import RSVPForm from './components/RSVPForm';

function App() {
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

  return (
    <div className="App">
      {!isAuthenticated ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <RSVPForm guestData={guestData} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
