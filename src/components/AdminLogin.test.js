import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminLogin from './AdminLogin';
import { signIn } from '../services/rsvp';

jest.mock('../services/rsvp', () => ({
  signIn: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AdminLogin', () => {
  test('renders email and password fields and a sign-in button', () => {
    render(<AdminLogin onSignedIn={jest.fn()} />);
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('submits credentials and calls onSignedIn on success', async () => {
    signIn.mockResolvedValue({ user: { id: 'u1' } });
    const onSignedIn = jest.fn();
    render(<AdminLogin onSignedIn={onSignedIn} />);

    await userEvent.type(screen.getByPlaceholderText(/email/i), 'admin@example.com');
    await userEvent.type(screen.getByPlaceholderText(/password/i), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('admin@example.com', 'secret123');
      expect(onSignedIn).toHaveBeenCalledTimes(1);
    });
  });

  test('shows an error message when sign-in fails', async () => {
    signIn.mockRejectedValue(new Error('Invalid login credentials'));
    render(<AdminLogin onSignedIn={jest.fn()} />);

    await userEvent.type(screen.getByPlaceholderText(/email/i), 'admin@example.com');
    await userEvent.type(screen.getByPlaceholderText(/password/i), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid login credentials/i)).toBeInTheDocument();
  });
});
