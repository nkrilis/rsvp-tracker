import React, { useState } from 'react';
import './Login.css';
import Logo from './Logo';
import { findFamily, loadFamilyById } from '../services/rsvp';

const Login = ({ onLoginSuccess }) => {
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [candidates, setCandidates] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCandidates(null);
    setLoading(true);

    try {
      const trimmed = fullName.trim().replace(/\s+/g, ' ');
      if (!trimmed.includes(' ')) {
        setError(
          'Please enter your first name AND family name, for example "John Smiths".'
        );
        setLoading(false);
        return;
      }

      const res = await findFamily({ fullName: trimmed });

      if (res.status === 'ok') {
        onLoginSuccess(res.result);
      } else if (res.status === 'ambiguous') {
        setCandidates(res.candidates);
      } else {
        setError(
          "We couldn't find your name on our guest list. Please double-check the spelling of your first name and family name, or contact the couple."
        );
      }
    } catch (err) {
      setError('An error occurred while searching. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFamily = async (familyId) => {
    setError('');
    setLoading(true);
    try {
      const result = await loadFamilyById(familyId);
      onLoginSuccess(result);
    } catch (err) {
      setError('An error occurred while loading your RSVP. Please try again.');
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
          <p>
            Enter your first name followed by your family name
            (e.g. <em>John Smiths</em>) to access your family's RSVP.
          </p>
        </div>

        {candidates ? (
          <div className="family-chooser">
            <p className="family-chooser-prompt">
              We found more than one household that matches. Please choose yours:
            </p>
            <div className="family-choice-list">
              {candidates.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="family-choice"
                  onClick={() => handleSelectFamily(c.id)}
                  disabled={loading}
                >
                  <span className="family-choice-name">{c.family_name}</span>
                  {c.memberNames && c.memberNames.length > 0 && (
                    <span className="family-choice-members">
                      {c.memberNames.join(', ')}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="link-back-btn"
              onClick={() => setCandidates(null)}
              disabled={loading}
            >
              ← Back
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Smiths"
                required
                className="form-input"
                disabled={loading}
                autoComplete="off"
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
        )}

        {error && candidates && <div className="error-message">{error}</div>}

        <div className="login-footer">
          <p>Having trouble? Please contact Nicholas or Elisabeth</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
