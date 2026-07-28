import React, { useEffect, useState, useCallback } from 'react';
import './AdminDashboard.css';
import AddressAutocomplete from './AddressAutocomplete';
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
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [editingAddressValue, setEditingAddressValue] = useState('');
  const [newGuestNameByFamily, setNewGuestNameByFamily] = useState({});
  const [newGuestIsChildByFamily, setNewGuestIsChildByFamily] = useState({});
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const refresh = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const data = await listFamilies();
      setFamilies(data);
    } catch (err) {
      setError(err.message || 'Failed to load.');
    } finally {
      if (!silent) setLoading(false);
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
      const created = await createFamily(name, newFamilyAddress.trim() || null);
      setNewFamilyName('');
      setNewFamilyAddress('');
      // Append with an empty guests array so the card renders immediately.
      const withGuests = { ...created, guests: [] };
      setFamilies((prev) => [...prev, withGuests]);
      // Scroll to the newly-added family on the next tick.
      setTimeout(() => {
        const el = document.getElementById(`family-${created.id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
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
      setFamilies((prev) =>
        prev.map((f) => (f.id === id ? { ...f, family_name: trimmed } : f))
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditAddress = (id, current) => {
    setEditingAddressId(id);
    setEditingAddressValue(current || '');
  };

  const handleCancelEditAddress = () => {
    setEditingAddressId(null);
    setEditingAddressValue('');
  };

  const handleSaveAddress = async () => {
    if (!editingAddressId) return;
    const trimmed = editingAddressValue.trim();
    const id = editingAddressId;
    const nextAddress = trimmed || null;
    try {
      await updateFamily(id, { address: nextAddress });
      setFamilies((prev) =>
        prev.map((f) => (f.id === id ? { ...f, address: nextAddress } : f))
      );
      setEditingAddressId(null);
      setEditingAddressValue('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteFamily = async (id, name) => {
    if (!window.confirm(`Delete family "${name}" and all its guests?`)) return;
    try {
      await deleteFamily(id);
      setFamilies((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddGuest = async (familyId) => {
    const name = (newGuestNameByFamily[familyId] || '').trim();
    if (!name) return;
    const isChild = !!newGuestIsChildByFamily[familyId];
    try {
      const guest = await addGuest(familyId, name, isChild);
      setNewGuestNameByFamily((p) => ({ ...p, [familyId]: '' }));
      setNewGuestIsChildByFamily((p) => ({ ...p, [familyId]: false }));
      setFamilies((prev) =>
        prev.map((f) =>
          f.id === familyId
            ? { ...f, guests: [...(f.guests || []), guest] }
            : f
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleChild = async (id, current) => {
    try {
      await updateGuest(id, { is_child: !current });
      setFamilies((prev) =>
        prev.map((f) => ({
          ...f,
          guests: (f.guests || []).map((g) =>
            g.id === id ? { ...g, is_child: !current } : g
          ),
        }))
      );
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
      setFamilies((prev) =>
        prev.map((f) => ({
          ...f,
          guests: (f.guests || []).map((g) =>
            g.id === id ? { ...g, full_name: trimmed } : g
          ),
        }))
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteGuest = async (id, name) => {
    if (!window.confirm(`Remove guest "${name}"?`)) return;
    try {
      await deleteGuest(id);
      setFamilies((prev) =>
        prev.map((f) => ({
          ...f,
          guests: (f.guests || []).filter((g) => g.id !== id),
        }))
      );
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
        if (g.is_child) acc.children += 1;
        if (g.rsvp_submitted_at) acc.responded += 1;
        if (g.church_attendance === 'Yes') acc.church += 1;
        if (g.reception_attendance === 'Yes') acc.reception += 1;
      }
      return acc;
    },
    { total: 0, children: 0, responded: 0, church: 0, reception: 0 }
  );

  const familiesMissingAddress = families.filter(
    (f) => !f.address || !f.address.trim()
  );

  const jumpToFamilyAddress = (familyId) => {
    const family = families.find((f) => f.id === familyId);
    handleEditAddress(familyId, family?.address);
    // Wait a tick so the editor renders before scrolling.
    setTimeout(() => {
      const el = document.getElementById(`family-${familyId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  // Filter families based on search query
  const filteredFamilies = families.filter((family) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const familyNameMatch = family.family_name?.toLowerCase().includes(query);
    const addressMatch = family.address?.toLowerCase().includes(query);
    const guestMatch = (family.guests || []).some((guest) =>
      guest.full_name?.toLowerCase().includes(query)
    );
    
    return familyNameMatch || addressMatch || guestMatch;
  });

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
        <div className="stat"><span>{stats.children}</span>Children</div>
        <div className="stat"><span>{stats.responded}</span>RSVPs in</div>
        <div className="stat"><span>{stats.church}</span>Church Yes</div>
        <div className="stat"><span>{stats.reception}</span>Reception Yes</div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {familiesMissingAddress.length > 0 && (
        <div className="admin-missing-addresses">
          <div className="admin-missing-addresses-header">
            <strong>{familiesMissingAddress.length}</strong>{' '}
            {familiesMissingAddress.length === 1 ? 'family is' : 'families are'}{' '}
            missing an address:
          </div>
          <div className="admin-missing-addresses-list">
            {familiesMissingAddress.map((f) => (
              <button
                key={f.id}
                type="button"
                className="admin-missing-address-chip"
                onClick={() => jumpToFamilyAddress(f.id)}
              >
                {f.family_name}
              </button>
            ))}
          </div>
        </div>
      )}

      <form className="admin-add-family" onSubmit={handleCreateFamily}>
        <input
          type="text"
          value={newFamilyName}
          onChange={(e) => setNewFamilyName(e.target.value)}
          placeholder="New family name (e.g. The Smiths)"
        />
        <AddressAutocomplete
          value={newFamilyAddress}
          onChange={setNewFamilyAddress}
          placeholder="Mailing address (optional)"
        />
        <button type="submit">Add Family</button>
      </form>

      {families.length > 0 && (
        <div className="admin-search">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search families, guests, or addresses..."
            className="admin-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="admin-search-clear"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
          {searchQuery && (
            <p className="admin-search-results">
              Showing {filteredFamilies.length} of {families.length} families
            </p>
          )}
        </div>
      )}

      {loading ? (
        <p>Loading…</p>
      ) : families.length === 0 ? (
        <p className="admin-empty">No families yet. Add one above.</p>
      ) : filteredFamilies.length === 0 ? (
        <p className="admin-empty">No families match your search.</p>
      ) : (
        filteredFamilies.map((f) => (
          <div key={f.id} id={`family-${f.id}`} className="admin-family">
            <div className="admin-family-header">
              <div className="admin-family-heading">
                <h2>{f.family_name}</h2>
                {editingAddressId === f.id ? (
                  <div className="admin-address-edit">
                    <AddressAutocomplete
                      value={editingAddressValue}
                      onChange={setEditingAddressValue}
                      placeholder="Search address"
                      autoFocus
                    />
                    <div className="admin-address-edit-actions">
                      <button className="link-btn" onClick={handleSaveAddress}>
                        Save
                      </button>
                      <button
                        className="link-btn"
                        onClick={handleCancelEditAddress}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="admin-family-address">
                    {f.address || <em>No address on file</em>}
                  </p>
                )}
              </div>
              <div className="admin-family-actions">
                <button
                  className="link-btn"
                  onClick={() => handleRenameFamily(f.id, f.family_name)}
                >
                  Rename
                </button>
                {editingAddressId !== f.id && (
                  <button
                    className="link-btn"
                    onClick={() => handleEditAddress(f.id, f.address)}
                  >
                    Edit Address
                  </button>
                )}
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
                  <th>Type</th>
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
                    <td colSpan={8} className="muted">
                      No guests yet.
                    </td>
                  </tr>
                )}
                {(f.guests || []).map((g) => (
                  <tr key={g.id}>
                    <td>{g.full_name}</td>
                    <td>
                      <span
                        className={`guest-type-badge${g.is_child ? ' child' : ''}`}
                      >
                        {g.is_child ? 'Child' : 'Adult'}
                      </span>
                    </td>
                    <td>{g.church_attendance || '\u2014'}</td>
                    <td>{g.reception_attendance || '\u2014'}</td>
                    <td>{g.meal_preference || '\u2014'}</td>
                    <td>{g.dietary_restrictions || '\u2014'}</td>
                    <td>
                      {g.rsvp_submitted_at
                        ? new Date(g.rsvp_submitted_at).toLocaleDateString()
                        : '\u2014'}
                    </td>
                    <td className="row-actions">
                      <button
                        className="link-btn"
                        onClick={() => handleToggleChild(g.id, g.is_child)}
                      >
                        {g.is_child ? 'Make adult' : 'Make child'}
                      </button>
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
              <label className="admin-child-checkbox">
                <input
                  type="checkbox"
                  checked={!!newGuestIsChildByFamily[f.id]}
                  onChange={(e) =>
                    setNewGuestIsChildByFamily((p) => ({
                      ...p,
                      [f.id]: e.target.checked,
                    }))
                  }
                />
                Child
              </label>
              <button onClick={() => handleAddGuest(f.id)}>Add Guest</button>
            </div>
          </div>
        ))
      )}

      {showBackToTop && (
        <button
          type="button"
          className="admin-back-to-top"
          onClick={() =>
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
          aria-label="Back to top"
          title="Back to top"
        >
          ↑
        </button>
      )}
    </div>
  );
};

export default AdminDashboard;
