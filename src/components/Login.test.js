import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from './Login';
import { findFamily, loadFamilyById } from '../services/rsvp';

// Mock the data layer so tests exercise UI behaviour without network calls.
jest.mock('../services/rsvp', () => ({
  findFamily: jest.fn(),
  loadFamilyById: jest.fn(),
}));

const renderLogin = () => {
  const onLoginSuccess = jest.fn();
  render(<Login onLoginSuccess={onLoginSuccess} />);
  return { onLoginSuccess };
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Login', () => {
  test('renders both the name and family-name fields plus the continue button', () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/your full name/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/family name \(as on your invitation\)/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
  });

  test('both fields are required', () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/your full name/i)).toBeRequired();
    expect(
      screen.getByPlaceholderText(/family name \(as on your invitation\)/i)
    ).toBeRequired();
  });

  test('successful lookup calls onLoginSuccess with the returned family', async () => {
    const result = { family: { id: 'f1', family_name: 'The Smiths' }, guests: [] };
    findFamily.mockResolvedValue({ status: 'ok', result });
    const { onLoginSuccess } = renderLogin();

    await userEvent.type(screen.getByPlaceholderText(/your full name/i), 'John Smith');
    await userEvent.type(
      screen.getByPlaceholderText(/family name/i),
      'The Smiths'
    );
    await userEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(findFamily).toHaveBeenCalledWith({
        fullName: 'John Smith',
        familyName: 'The Smiths',
      });
      expect(onLoginSuccess).toHaveBeenCalledWith(result);
    });
  });

  test('not-found shows an error and does not log in', async () => {
    findFamily.mockResolvedValue({ status: 'not_found' });
    const { onLoginSuccess } = renderLogin();

    await userEvent.type(screen.getByPlaceholderText(/your full name/i), 'Nobody');
    await userEvent.type(screen.getByPlaceholderText(/family name/i), 'Unknown');
    await userEvent.click(screen.getByRole('button', { name: /continue/i }));

    expect(await screen.findByText(/couldn't find your name/i)).toBeInTheDocument();
    expect(onLoginSuccess).not.toHaveBeenCalled();
  });

  test('ambiguous result shows the household chooser with member-name hints', async () => {
    findFamily.mockResolvedValue({
      status: 'ambiguous',
      candidates: [
        { id: 'f1', family_name: 'The Smiths', memberNames: ['John Smith', 'Jane Smith'] },
        { id: 'f2', family_name: 'The Smiths', memberNames: ['John Smith', 'Bob Smith'] },
      ],
    });
    renderLogin();

    await userEvent.type(screen.getByPlaceholderText(/your full name/i), 'John Smith');
    await userEvent.type(screen.getByPlaceholderText(/family name/i), 'The Smiths');
    await userEvent.click(screen.getByRole('button', { name: /continue/i }));

    expect(await screen.findByText(/more than one household/i)).toBeInTheDocument();
    expect(screen.getByText(/jane smith/i)).toBeInTheDocument();
    expect(screen.getByText(/bob smith/i)).toBeInTheDocument();
  });

  test('selecting a household loads it and logs in', async () => {
    findFamily.mockResolvedValue({
      status: 'ambiguous',
      candidates: [
        { id: 'f1', family_name: 'The Smiths', memberNames: ['John Smith', 'Jane Smith'] },
        { id: 'f2', family_name: 'The Smiths', memberNames: ['John Smith', 'Bob Smith'] },
      ],
    });
    const loaded = { family: { id: 'f2', family_name: 'The Smiths' }, guests: [] };
    loadFamilyById.mockResolvedValue(loaded);
    const { onLoginSuccess } = renderLogin();

    await userEvent.type(screen.getByPlaceholderText(/your full name/i), 'John Smith');
    await userEvent.type(screen.getByPlaceholderText(/family name/i), 'The Smiths');
    await userEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Click the second household (identified by its unique member, Bob Smith).
    const bob = await screen.findByText(/bob smith/i);
    await userEvent.click(bob.closest('button'));

    await waitFor(() => {
      expect(loadFamilyById).toHaveBeenCalledWith('f2');
      expect(onLoginSuccess).toHaveBeenCalledWith(loaded);
    });
  });

  test('the back button returns from the chooser to the form', async () => {
    findFamily.mockResolvedValue({
      status: 'ambiguous',
      candidates: [
        { id: 'f1', family_name: 'The Smiths', memberNames: ['John Smith'] },
        { id: 'f2', family_name: 'The Smiths', memberNames: ['John Smith', 'Bob Smith'] },
      ],
    });
    renderLogin();

    await userEvent.type(screen.getByPlaceholderText(/your full name/i), 'John Smith');
    await userEvent.type(screen.getByPlaceholderText(/family name/i), 'The Smiths');
    await userEvent.click(screen.getByRole('button', { name: /continue/i }));

    await userEvent.click(await screen.findByRole('button', { name: /back/i }));

    expect(screen.getByPlaceholderText(/your full name/i)).toBeInTheDocument();
    expect(screen.queryByText(/more than one household/i)).not.toBeInTheDocument();
  });

  test('a thrown error is surfaced to the user', async () => {
    findFamily.mockRejectedValue(new Error('network down'));
    renderLogin();

    await userEvent.type(screen.getByPlaceholderText(/your full name/i), 'John Smith');
    await userEvent.type(screen.getByPlaceholderText(/family name/i), 'The Smiths');
    await userEvent.click(screen.getByRole('button', { name: /continue/i }));

    expect(await screen.findByText(/an error occurred/i)).toBeInTheDocument();
  });
});
