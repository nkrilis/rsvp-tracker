import React, { useState } from 'react';
import './RSVPForm.css';
import Logo from './Logo';
import { updateGuestRSVP } from '../services/googleSheets';

const RSVPForm = ({ guestData, onLogout }) => {
  const [formData, setFormData] = useState({
    churchAttendance: guestData.churchAttendance || '',
    receptionAttendance: guestData.receptionAttendance || '',
    mealPreference: guestData.mealPreference || '',
    dietaryRestrictions: guestData.dietaryRestrictions || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSuccess(false);

    try {
      await updateGuestRSVP(guestData.rowIndex, formData);
      setSuccess(true);
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError('Unable to save your RSVP. Please try again or contact Nicholas and Elisabeth directly.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rsvp-container">
      <div className="rsvp-card">
        <Logo />
        
        <div className="rsvp-header">
          <h1>Welcome, {guestData.fullName}!</h1>
          <p className="thank-you-text">
            We are overjoyed that you will be sharing in our special day. 
            Your presence means the world to us, and we cannot wait to celebrate 
            this momentous occasion with you.
          </p>
        </div>

        {success && (
          <div className="success-message">
            <strong>Thank you!</strong> Your RSVP has been successfully saved. 
            We look forward to celebrating with you!
          </div>
        )}

        {error && (
          <div className="error-message">{error}</div>
        )}

        <div className="event-details">
          <h2>Event Details</h2>
          
          <div className="event-section">
            <div className="event-icon">⛪</div>
            <div className="event-info">
              <h3>Ceremony</h3>
              <p className="event-venue">St. Peter's Roman Catholic Church</p>
              <p className="event-address">100 Bainbridge Ave</p>
              <p className="event-address">Woodbridge, ON L4L 3Y1, Canada</p>
              <p className="event-time">Please arrive by 2:30 PM</p>
            </div>
          </div>

          <div className="event-divider"></div>

          <div className="event-section">
            <div className="event-icon">🥂</div>
            <div className="event-info">
              <h3>Reception</h3>
              <p className="event-venue">Chateau Le Parc</p>
              <p className="event-address">1745 Langstaff Road W</p>
              <p className="event-address">Vaughan, ON L4K 2H2, Canada</p>
              <p className="event-time">Cocktails at 5:00 PM</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rsvp-form">
          <h2>Your RSVP</h2>

          <div className="form-section">
            <label className="form-label">
              Will you be attending the Church Ceremony?
            </label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="churchAttendance"
                  value="Yes"
                  checked={formData.churchAttendance === 'Yes'}
                  onChange={handleInputChange}
                  required
                />
                <span>Yes, I'll be there</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="churchAttendance"
                  value="No"
                  checked={formData.churchAttendance === 'No'}
                  onChange={handleInputChange}
                />
                <span>Unable to attend</span>
              </label>
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">
              Will you be attending the Reception?
            </label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="receptionAttendance"
                  value="Yes"
                  checked={formData.receptionAttendance === 'Yes'}
                  onChange={handleInputChange}
                  required
                />
                <span>Yes, I'll be there</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="receptionAttendance"
                  value="No"
                  checked={formData.receptionAttendance === 'No'}
                  onChange={handleInputChange}
                />
                <span>Unable to attend</span>
              </label>
            </div>
          </div>

          {formData.receptionAttendance === 'Yes' && (
            <>
              <div className="form-section">
                <label className="form-label">
                  Meal Preference
                </label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="mealPreference"
                      value="Beef"
                      checked={formData.mealPreference === 'Beef'}
                      onChange={handleInputChange}
                      required
                    />
                    <span>Beef</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="mealPreference"
                      value="Chicken"
                      checked={formData.mealPreference === 'Chicken'}
                      onChange={handleInputChange}
                    />
                    <span>Chicken</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="mealPreference"
                      value="Fish"
                      checked={formData.mealPreference === 'Fish'}
                      onChange={handleInputChange}
                    />
                    <span>Fish</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="mealPreference"
                      value="Vegetarian"
                      checked={formData.mealPreference === 'Vegetarian'}
                      onChange={handleInputChange}
                    />
                    <span>Vegetarian</span>
                  </label>
                </div>
              </div>

              <div className="form-section">
                <label className="form-label" htmlFor="dietaryRestrictions">
                  Dietary Restrictions or Allergies
                </label>
                <input
                  type="text"
                  id="dietaryRestrictions"
                  name="dietaryRestrictions"
                  value={formData.dietaryRestrictions}
                  onChange={handleInputChange}
                  placeholder="Please list any dietary restrictions or allergies"
                  className="form-input"
                />
                <p className="form-help">Leave blank if none</p>
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save RSVP'}
          </button>
        </form>

        <div className="rsvp-footer">
          <p className="appreciation-text">
            Thank you for taking the time to RSVP. Your friendship and support 
            mean everything to us. We are blessed to have you in our lives and 
            cannot wait to share this joyous celebration with you!
          </p>
          <p className="signature">With love and gratitude,<br/>Nicholas & Elisabeth</p>
          
          <button onClick={onLogout} className="logout-btn">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default RSVPForm;
