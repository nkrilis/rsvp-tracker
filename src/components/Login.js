import React, { useState } from 'react';
import './Login.css';
import Logo from './Logo';
import { findFamilyByGuestName } from '../services/rsvp';

const Login = ({ onLoginSuccess }) => {
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await findFamilyByGuestName(fullName);

      if (result) {
        onLoginSuccess(result);
      } else {
        setError(
          "We couldn't find your name on our guest list. Please check your spelling or contact the couple."
        );
      }
    } catch (err) {
      setError('An error occurred while searching. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <Logo />
        
        <div className="login-welcome">
          <h2>Welcome</h2>
          <p>Please enter your full name to access your family's RSVP</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full Name"
              required
              className="form-input"
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Continue'}
          </button>
        </form>

        <div className="login-footer">
          <p>Having trouble? Please contact Nicholas or Elisabeth</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
