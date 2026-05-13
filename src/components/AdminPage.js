import React, { useEffect, useState } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import { getCurrentSession, onAuthChange } from '../services/rsvp';

const AdminPage = () => {
  const [session, setSession] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let mounted = true;
    getCurrentSession().then((s) => {
      if (!mounted) return;
      setSession(s);
      setChecked(true);
    });
    const sub = onAuthChange((s) => setSession(s));
    return () => {
      mounted = false;
      sub?.unsubscribe?.();
    };
  }, []);

  if (!checked) return null;

  if (!session) {
    return <AdminLogin onSignedIn={() => { /* session listener will update */ }} />;
  }

  return <AdminDashboard onSignedOut={() => setSession(null)} />;
};

export default AdminPage;
