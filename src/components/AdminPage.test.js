import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AdminPage from './AdminPage';
import { getCurrentSession, onAuthChange, listFamilies } from '../services/rsvp';

// Mock the whole data layer. AdminPage decides between AdminLogin and
// AdminDashboard based on the session; AdminDashboard calls listFamilies.
jest.mock('../services/rsvp', () => ({
  getCurrentSession: jest.fn(),
  onAuthChange: jest.fn(() => ({ unsubscribe: jest.fn() })),
  listFamilies: jest.fn(() => Promise.resolve([])),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  onAuthChange.mockReturnValue({ unsubscribe: jest.fn() });
});

describe('AdminPage', () => {
  test('shows the admin sign-in when there is no session', async () => {
    getCurrentSession.mockResolvedValue(null);
    render(<AdminPage />);
    expect(await screen.findByText(/admin sign in/i)).toBeInTheDocument();
  });

  test('shows the dashboard when a session exists', async () => {
    getCurrentSession.mockResolvedValue({ user: { id: 'u1' } });
    listFamilies.mockResolvedValue([]);
    render(<AdminPage />);

    expect(await screen.findByText(/admin dashboard/i)).toBeInTheDocument();
    await waitFor(() => expect(listFamilies).toHaveBeenCalled());
  });
});
