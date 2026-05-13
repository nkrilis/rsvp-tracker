import React, { useEffect, useState, useCallback } from 'react';
import './AdminDashboard.css';
import {
  listFamilies,
  createFamily,
  updateFamily,
  deleteFamily,
  addGuest,
  updateGuest,
  deleteGuest,
  signOut,
} from '../services/rsvp';

const AdminDashboard = ({ onSignedOut }) => {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newFamilyAddress, setNewFamilyAddress] = useState('');
  const [newGuestNameByFamily, setNewGuestNameByFamily] = useState({});

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listFamilies();
      setFamilies(data);
    } catch (err) {
      setError(err.message || 'Failed to load.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleCreateFamily = async (e) => {
    e.preventDefault();
    const name = newFamilyName.trim();
    if (!name) return;
    try {
      await createFamily(name, newFamilyAddress.trim() || null);
      setNewFamilyName('');
      setNewFamilyAddress('');
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRenameFamily = async (id, current) => {
    const next = window.prompt('Family name:', current);
    if (next == null) return;
    const trimmed = next.trim();
    if (!trimmed || trimmed === current) return;
    try {
      await updateFamily(id, { family_name: trimmed });
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditAddress = async (id, current) => {
    const next = window.prompt('Mailing address:', current || '');
    if (next == null) return;
    const trimmed = next.trim();
    try {
      await updateFamily(id, { address: trimmed || null });
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteFamily = async (id, name) => {
    if (!window.confirm(`Delete family "${name}" and all its guests?`)) return;
    try {
      await deleteFamily(id);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddGuest = async (familyId) => {
    const name = (newGuestNameByFamily[familyId] || '').trim();
    if (!name) return;
    try {
      await addGuest(familyId, name);
      setNewGuestNameByFamily((p) => ({ ...p, [familyId]: '' }));
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRenameGuest = async (id, current) => {
    const next = window.prompt('Guest full name:', current);
    if (next == null) return;
    const trimmed = next.trim();
    if (!trimmed || trimmed === current) return;
    try {
      await updateGuest(id, { full_name: trimmed });
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteGuest = async (id, name) => {
    if (!window.confirm(`Remove guest "${name}"?`)) return;
    try {
      await deleteGuest(id);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    if (onSignedOut) onSignedOut();
  };

  const stats = families.reduce(
    (acc, f) => {
      for (const g of f.guests || []) {
        acc.total += 1;
        if (g.rsvp_submitted_at) acc.responded += 1;
        if (g.church_attendance === 'Yes') acc.church += 1;
        if (g.reception_attendance === 'Yes') acc.reception += 1;
      }
      return acc;
    },
    { total: 0, responded: 0, church: 0, reception: 0 }
  );

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={handleSignOut} className="admin-signout">
          Sign Out
        </button>
      </div>

      <div className="admin-stats">
        <div className="stat"><span>{families.length}</span>Families</div>
        <div className="stat"><span>{stats.total}</span>Guests</div>
        <div className="stat"><span>{stats.responded}</span>RSVPs in</div>
        <div className="stat"><span>{stats.church}</span>Church Yes</div>
        <div className="stat"><span>{stats.reception}</span>Reception Yes</div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <form className="admin-add-family" onSubmit={handleCreateFamily}>
        <input
          type="text"
          value={newFamilyName}
          onChange={(e) => setNewFamilyName(e.target.value)}
          placeholder="New family name (e.g. The Smiths)"
        />
        <input
          type="text"
          value={newFamilyAddress}
          onChange={(e) => setNewFamilyAddress(e.target.value)}
          placeholder="Mailing address (optional)"
        />
        <button type="submit">Add Family</button>
      </form>

      {loading ? (
        <p>Loading…</p>
      ) : families.length === 0 ? (
        <p className="admin-empty">No families yet. Add one above.</p>
      ) : (
        families.map((f) => (
          <div key={f.id} className="admin-family">
            <div className="admin-family-header">
              <div>
                <h2>{f.family_name}</h2>
                <p className="admin-family-address">
                  {f.address || <em>No address on file</em>}
                </p>
              </div>
              <div className="admin-family-actions">
                <button
                  className="link-btn"
                  onClick={() => handleRenameFamily(f.id, f.family_name)}
                >
                  Rename
                </button>
                <button
                  className="link-btn"
                  onClick={() => handleEditAddress(f.id, f.address)}
                >
                  Edit Address
                </button>
                <button
                  className="link-btn danger"
                  onClick={() => handleDeleteFamily(f.id, f.family_name)}
                >
                  Delete
                </button>
              </div>
            </div>

            <table className="admin-guests">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Church</th>
                  <th>Reception</th>
                  <th>Meal</th>
                  <th>Dietary</th>
                  <th>Responded</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {(f.guests || []).length === 0 && (
                  <tr>
                    <td colSpan={7} className="muted">
                      No guests yet.
                    </td>
                  </tr>
                )}
                {(f.guests || []).map((g) => (
                  <tr key={g.id}>
                    <td>{g.full_name}</td>
                    <td>{g.church_attendance || '—'}</td>
                    <td>{g.reception_attendance || '—'}</td>
                    <td>{g.meal_preference || '—'}</td>
                    <td>{g.dietary_restrictions || '—'}</td>
                    <td>
                      {g.rsvp_submitted_at
                        ? new Date(g.rsvp_submitted_at).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="row-actions">
                      <button
                        className="link-btn"
                        onClick={() => handleRenameGuest(g.id, g.full_name)}
                      >
                        Rename
                      </button>
                      <button
                        className="link-btn danger"
                        onClick={() => handleDeleteGuest(g.id, g.full_name)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="admin-add-guest">
              <input
                type="text"
                placeholder="Add guest full name"
                value={newGuestNameByFamily[f.id] || ''}
                onChange={(e) =>
                  setNewGuestNameByFamily((p) => ({
                    ...p,
                    [f.id]: e.target.value,
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddGuest(f.id);
                  }
                }}
              />
              <button onClick={() => handleAddGuest(f.id)}>Add Guest</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminDashboard;
