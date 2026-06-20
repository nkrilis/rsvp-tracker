import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { getCurrentSession, onAuthChange, listFamilies } from './services/rsvp';

// App wires routing (HashRouter) around the guest flow and the admin page.
// Mock the data layer so the routed components mount without network calls.
jest.mock('./services/rsvp', () => ({
  findFamily: jest.fn(),
  loadFamilyById: jest.fn(),
  getCurrentSession: jest.fn(),
  onAuthChange: jest.fn(),
  listFamilies: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// CRA enables resetMocks, so (re)configure implementations before each test.
beforeEach(() => {
  getCurrentSession.mockResolvedValue(null);
  onAuthChange.mockReturnValue({ unsubscribe: jest.fn() });
  listFamilies.mockResolvedValue([]);
});

afterEach(() => {
  window.location.hash = '';
});

describe('App routing', () => {
  test('the default route renders the guest login', async () => {
    window.location.hash = '#/';
    render(<App />);
    expect(
      await screen.findByText(/please enter your name and family name/i)
    ).toBeInTheDocument();
  });

  test('the /admin route renders the admin sign-in', async () => {
    window.location.hash = '#/admin';
    render(<App />);
    expect(await screen.findByText(/admin sign in/i)).toBeInTheDocument();
  });
});
