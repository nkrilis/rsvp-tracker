import React, { useState } from 'react';
import './RSVPForm.css';
import Logo from './Logo';
import { submitFamilyRSVP } from '../services/rsvp';

const MEAL_OPTIONS = [
  { 
    value: 'Beef Short Rib', 
    label: 'Beef Short Rib', 
    note: 'Contains gluten',
    description: 'Slow braised in Red Wine, Beef Stock, Mire Poix. Served with Potato gratin, broccolini and red peppers.' 
  },
  { 
    value: 'Salmon', 
    label: 'Salmon', 
    note: 'Contains dairy',
    description: 'Seared filet with lemon, dill and butter. Served with Potato gratin, broccolini and red peppers.'
  }
];

const RSVPForm = ({ guestData, onLogout }) => {
  const { family, guests } = guestData;

  const [guestForms, setGuestForms] = useState(
    guests.map((g) => ({
      id: g.id,
      full_name: g.full_name,
      is_child: g.is_child || false,
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
      prev.map((g) => {
        if (g.id !== id) return g;
        
        const updated = { ...g, [field]: value };
        
        // Auto-set meal for children when they select reception attendance
        if (field === 'reception_attendance' && g.is_child) {
          if (value === 'Yes') {
            updated.meal_preference = 'Pasta';
          } else {
            updated.meal_preference = '';
          }
        }
        
        return updated;
      })
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

  const headerName = family?.family_name
    ? `The ${family.family_name} Family`
    : 'Friends';

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

        <div className="menu-section">
          <h2>Menu</h2>
          
          <div className="menu-category">
            <h3>Children's Menu</h3>
            <div className="menu-item">
              <p className="menu-item-name">Pasta</p>
              <p className="menu-item-description">(Included for all children)</p>
            </div>
            <div className="menu-item">
              <p className="menu-item-name">Dessert</p>
            </div>
          </div>

          <div className="menu-divider"></div>

          <div className="menu-category">
            <h3>Adult Menu</h3>
            
            <div className="menu-course">
              <h4>Antipasto</h4>
              <div className="menu-item">
                <p className="menu-item-name">Sicilian Salad</p>
                <p className="menu-item-description">
                  Shaved Fennel, Belgian Endive, Celery, Frisée, Pickled Red Onion, 
                  orange segments, crushed Sicilian olives in a balsamic vinaigrette.
                </p>
              </div>
            </div>

            <div className="menu-course">
              <h4>Pasta</h4>
              <div className="menu-item">
                <p className="menu-item-name">Caserecce</p>
                <p className="menu-item-description">
                  Rose sauce with pancetta, portobellini mushrooms and peas.
                </p>
              </div>
            </div>

            <div className="menu-course">
              <h4>Main (Your Choice)</h4>
              <div className="menu-item">
                <p className="menu-item-name">Beef Short Rib <span className="menu-allergen">*contains gluten*</span></p>
                <p className="menu-item-description">
                  Slow braised in Red Wine, Beef Stock, Mire Poix. Served with Potato gratin, broccolini and red peppers.
                </p>
              </div>
              <div className="menu-item">
                <p className="menu-item-name">Salmon <span className="menu-allergen">*contains dairy*</span></p>
                <p className="menu-item-description">
                  Seared filet with lemon, dill and butter. Served with Potato gratin, broccolini and red peppers.
                </p>
              </div>
            </div>

            <div className="menu-course">
              <h4>Dessert</h4>
              <div className="menu-item">
                <p className="menu-item-name">Sticky Toffee Pudding</p>
                <p className="menu-item-description">
                  Served with Vanilla Ice Cream.
                </p>
              </div>
            </div>
          </div>

          <div className="menu-disclaimer">
            <p><strong>Important:</strong> If you have allergies or dietary restrictions, please note them in the form below.</p>
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
                  {!g.is_child && (
                    <div className="form-section">
                      <label className="form-label">Meal Preference</label>
                      <div className="radio-group">
                        {MEAL_OPTIONS.map((meal) => (
                          <label key={meal.value} className="radio-label">
                            <input
                              type="radio"
                              name={`meal_${g.id}`}
                              value={meal.value}
                              checked={g.meal_preference === meal.value}
                              onChange={(e) =>
                                updateGuestField(
                                  g.id,
                                  'meal_preference',
                                  e.target.value
                                )
                              }
                              required
                            />
                            <span>
                              {meal.label}
                              {meal.note && <span className="meal-note"> ({meal.note})</span>}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {g.is_child && (
                    <div className="form-section">
                      <p className="child-meal-info">
                        <strong>Children's Meal:</strong> Pasta (included for all children)
                      </p>
                    </div>
                  )}

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

        <div className="faq-section">
          <h2>Frequently Asked Questions</h2>
          
          <div className="faq-item">
            <h3>Need a plus one?</h3>
            <p>
              We would love for you to bring a plus one. If we missed anyone, or you are a single invite 
              and would like to bring a guest, please contact Nicholas <a href="tel:+16473308919">(647) 330-8919</a> or 
              Elisabeth <a href="tel:+16472178146">(647) 217-8146</a>. Please note we will do our best to accommodate 
              but no promises can be made. We appreciate your understanding.
            </p>
          </div>

          <div className="faq-item">
            <h3>What should I wear?</h3>
            <p>
              Please dress formal - black tie optional. Please note the bridal party will be wearing espresso brown.
            </p>
          </div>

          <div className="faq-item">
            <h3>Where can I park?</h3>
            <p>
              Both St. Peters Catholic Church and Chateau le Parc have parking lots available for you. 
              Street parking is also available at the church. If you plan to drink, please arrange for an 
              appropriate ride home.
            </p>
          </div>
        </div>

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
