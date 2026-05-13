import React, { useState } from 'react';
import './RSVPForm.css';
import Logo from './Logo';
import { submitFamilyRSVP } from '../services/rsvp';

const MEAL_OPTIONS = ['Steak', 'Salmon'];

const RSVPForm = ({ guestData, onLogout }) => {
  const { family, guests } = guestData;

  const [guestForms, setGuestForms] = useState(
    guests.map((g) => ({
      id: g.id,
      full_name: g.full_name,
      church_attendance: g.church_attendance || '',
      reception_attendance: g.reception_attendance || '',
      meal_preference: g.meal_preference || '',
      dietary_restrictions: g.dietary_restrictions || '',
    }))
  );

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const updateGuestField = (id, field, value) => {
    setGuestForms((prev) =>
      prev.map((g) => (g.id === id ? { ...g, [field]: value } : g))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSuccess(false);

    try {
      await submitFamilyRSVP(guestForms);
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(
        'Unable to save your RSVP. Please try again or contact Nicholas and Elisabeth directly.'
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const headerName =
    guests.length === 1 ? guests[0].full_name : family?.family_name || 'Friends';

  return (
    <div className="rsvp-container">
      <div className="rsvp-card">
        <Logo />

        <div className="rsvp-header">
          <h1>Welcome, {headerName}!</h1>
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
              <a 
                href="https://www.google.com/maps/search/?api=1&query=St.+Peter's+Roman+Catholic+Church+100+Bainbridge+Ave+Woodbridge+ON+L4L+3Y1+Canada" 
                target="_blank" 
                rel="noopener noreferrer"
                className="event-address-link"
              >
                <p className="event-address">100 Bainbridge Ave</p>
                <p className="event-address">Woodbridge, ON L4L 3Y1, Canada</p>
              </a>
              <p className="event-time">Please arrive by 12:15 PM</p>
            </div>
          </div>

          <div className="event-divider"></div>

          <div className="event-section">
            <div className="event-icon">🥂</div>
            <div className="event-info">
              <h3>Reception</h3>
              <p className="event-venue">Chateau Le Parc</p>
              <a 
                href="https://www.google.com/maps/search/?api=1&query=Chateau+Le+Parc+1745+Langstaff+Road+W+Vaughan+ON+L4K+2H2" 
                target="_blank" 
                rel="noopener noreferrer"
                className="event-address-link"
              >
                <p className="event-address">1745 Langstaff Road W</p>
                <p className="event-address">Vaughan, ON L4K 2H2, Canada</p>
              </a>
              <p className="event-time">Cocktails at 5:00 PM</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rsvp-form">
          <h2>Your RSVP</h2>

          {guestForms.map((g, idx) => (
            <div key={g.id} className="guest-block">
              <div className="guest-block-header">
                <span className="guest-block-name">{g.full_name}</span>
                {guestForms.length > 1 && (
                  <span className="guest-block-count">
                    Guest {idx + 1} of {guestForms.length}
                  </span>
                )}
              </div>

              <div className="form-section">
                <label className="form-label">
                  Will {g.full_name.split(' ')[0]} be attending the Church Ceremony?
                </label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name={`church_${g.id}`}
                      value="Yes"
                      checked={g.church_attendance === 'Yes'}
                      onChange={(e) =>
                        updateGuestField(g.id, 'church_attendance', e.target.value)
                      }
                      required
                    />
                    <span>Yes, attending</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name={`church_${g.id}`}
                      value="No"
                      checked={g.church_attendance === 'No'}
                      onChange={(e) =>
                        updateGuestField(g.id, 'church_attendance', e.target.value)
                      }
                    />
                    <span>Unable to attend</span>
                  </label>
                </div>
              </div>

              <div className="form-section">
                <label className="form-label">
                  Will {g.full_name.split(' ')[0]} be attending the Reception?
                </label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name={`reception_${g.id}`}
                      value="Yes"
                      checked={g.reception_attendance === 'Yes'}
                      onChange={(e) =>
                        updateGuestField(g.id, 'reception_attendance', e.target.value)
                      }
                      required
                    />
                    <span>Yes, attending</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name={`reception_${g.id}`}
                      value="No"
                      checked={g.reception_attendance === 'No'}
                      onChange={(e) =>
                        updateGuestField(g.id, 'reception_attendance', e.target.value)
                      }
                    />
                    <span>Unable to attend</span>
                  </label>
                </div>
              </div>

              {g.reception_attendance === 'Yes' && (
                <>
                  <div className="form-section">
                    <label className="form-label">Meal Preference</label>
                    <div className="radio-group">
                      {MEAL_OPTIONS.map((meal) => (
                        <label key={meal} className="radio-label">
                          <input
                            type="radio"
                            name={`meal_${g.id}`}
                            value={meal}
                            checked={g.meal_preference === meal}
                            onChange={(e) =>
                              updateGuestField(
                                g.id,
                                'meal_preference',
                                e.target.value
                              )
                            }
                            required
                          />
                          <span>{meal}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-section">
                    <label
                      className="form-label"
                      htmlFor={`diet_${g.id}`}
                    >
                      Dietary Restrictions or Allergies
                    </label>
                    <input
                      type="text"
                      id={`diet_${g.id}`}
                      value={g.dietary_restrictions}
                      onChange={(e) =>
                        updateGuestField(
                          g.id,
                          'dietary_restrictions',
                          e.target.value
                        )
                      }
                      placeholder="Please list any dietary restrictions or allergies"
                      className="form-input"
                    />
                    <p className="form-help">Leave blank if none</p>
                  </div>
                </>
              )}
            </div>
          ))}

          <button type="submit" className="submit-btn" disabled={loading}>
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
