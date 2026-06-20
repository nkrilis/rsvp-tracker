import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminDashboard from './AdminDashboard';
import {
  listFamilies,
  createFamily,
  deleteFamily,
  addGuest,
  updateFamily,
  updateGuest,
  deleteGuest,
  signOut,
} from '../services/rsvp';

jest.mock('../services/rsvp', () => ({
  listFamilies: jest.fn(),
  createFamily: jest.fn(),
  updateFamily: jest.fn(),
  deleteFamily: jest.fn(),
  addGuest: jest.fn(),
  updateGuest: jest.fn(),
  deleteGuest: jest.fn(),
  signOut: jest.fn(),
}));

const SAMPLE = [
  {
    id: 'f1',
    family_name: 'The Smiths',
    address: '1 Main St',
    guests: [
      {
        id: 'g1',
        full_name: 'John Smith',
        is_child: false,
        church_attendance: 'Yes',
        reception_attendance: 'Yes',
        meal_preference: 'Steak',
        dietary_restrictions: '',
        rsvp_submitted_at: '2026-01-01T00:00:00Z',
      },
      {
        id: 'g2',
        full_name: 'Jane Smith',
        is_child: true,
        church_attendance: 'No',
        reception_attendance: 'Yes',
        meal_preference: 'Salmon',
        dietary_restrictions: 'Nuts',
        rsvp_submitted_at: null,
      },
    ],
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  listFamilies.mockResolvedValue(SAMPLE);
});

describe('AdminDashboard', () => {
  test('renders families and their guests after loading', async () => {
    render(<AdminDashboard onSignedOut={jest.fn()} />);
    expect(await screen.findByText('The Smiths')).toBeInTheDocument();
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  test('computes the summary stats from guest data', async () => {
    render(<AdminDashboard onSignedOut={jest.fn()} />);
    await screen.findByText('The Smiths');

    // 1 family, 2 guests, 1 responded, 1 church yes, 2 reception yes.
    const familiesStat = screen.getByText('Families').closest('.stat');
    expect(within(familiesStat).getByText('1')).toBeInTheDocument();
    const guestsStat = screen.getByText('Guests').closest('.stat');
    expect(within(guestsStat).getByText('2')).toBeInTheDocument();
    const respondedStat = screen.getByText('RSVPs in').closest('.stat');
    expect(within(respondedStat).getByText('1')).toBeInTheDocument();
    const receptionStat = screen.getByText('Reception Yes').closest('.stat');
    expect(within(receptionStat).getByText('2')).toBeInTheDocument();
  });

  test('adding a family calls createFamily and refreshes', async () => {
    createFamily.mockResolvedValue({ id: 'f2' });
    render(<AdminDashboard onSignedOut={jest.fn()} />);
    await screen.findByText('The Smiths');

    await userEvent.type(
      screen.getByPlaceholderText(/new family name/i),
      'The Joneses'
    );
    await userEvent.type(
      screen.getByPlaceholderText(/mailing address/i),
      '2 Oak Ave'
    );
    await userEvent.click(screen.getByRole('button', { name: /add family/i }));

    await waitFor(() => {
      expect(createFamily).toHaveBeenCalledWith('The Joneses', '2 Oak Ave');
      // refresh = a second listFamilies call after the initial load.
      expect(listFamilies).toHaveBeenCalledTimes(2);
    });
  });

  test('adding a guest calls addGuest with the family id and name', async () => {
    addGuest.mockResolvedValue({ id: 'g3' });
    render(<AdminDashboard onSignedOut={jest.fn()} />);
    await screen.findByText('The Smiths');

    await userEvent.type(
      screen.getByPlaceholderText(/add guest full name/i),
      'Baby Smith'
    );
    await userEvent.click(screen.getByRole('button', { name: /add guest/i }));

    await waitFor(() =>
      expect(addGuest).toHaveBeenCalledWith('f1', 'Baby Smith', false)
    );
  });

  test('adding a guest with the Child box checked flags them as a child', async () => {
    addGuest.mockResolvedValue({ id: 'g3' });
    render(<AdminDashboard onSignedOut={jest.fn()} />);
    await screen.findByText('The Smiths');

    await userEvent.type(
      screen.getByPlaceholderText(/add guest full name/i),
      'Tiny Smith'
    );
    await userEvent.click(screen.getByRole('checkbox', { name: /child/i }));
    await userEvent.click(screen.getByRole('button', { name: /add guest/i }));

    await waitFor(() =>
      expect(addGuest).toHaveBeenCalledWith('f1', 'Tiny Smith', true)
    );
  });

  test('the guest table shows an Adult/Child type indicator', async () => {
    render(<AdminDashboard onSignedOut={jest.fn()} />);
    await screen.findByText('The Smiths');

    const adultRow = screen.getByText('John Smith').closest('tr');
    expect(within(adultRow).getByText('Adult')).toBeInTheDocument();
    const childRow = screen.getByText('Jane Smith').closest('tr');
    expect(within(childRow).getByText('Child')).toBeInTheDocument();
  });

  test('toggling a guest type calls updateGuest with the flipped is_child', async () => {
    updateGuest.mockResolvedValue(true);
    render(<AdminDashboard onSignedOut={jest.fn()} />);
    await screen.findByText('The Smiths');

    // John is an adult → "Make child" sets is_child true.
    const adultRow = screen.getByText('John Smith').closest('tr');
    await userEvent.click(within(adultRow).getByRole('button', { name: /make child/i }));

    await waitFor(() =>
      expect(updateGuest).toHaveBeenCalledWith('g1', { is_child: true })
    );
  });

  test('deleting a family asks for confirmation before calling deleteFamily', async () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    deleteFamily.mockResolvedValue(true);
    render(<AdminDashboard onSignedOut={jest.fn()} />);
    await screen.findByText('The Smiths');

    await userEvent.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => expect(deleteFamily).toHaveBeenCalledWith('f1'));
    confirmSpy.mockRestore();
  });

  test('cancelling the delete confirmation does not call deleteFamily', async () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
    render(<AdminDashboard onSignedOut={jest.fn()} />);
    await screen.findByText('The Smiths');

    await userEvent.click(screen.getByRole('button', { name: /delete/i }));

    expect(deleteFamily).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  test('renaming a family uses the prompt value', async () => {
    const promptSpy = jest.spyOn(window, 'prompt').mockReturnValue('The Smith Family');
    updateFamily.mockResolvedValue(true);
    render(<AdminDashboard onSignedOut={jest.fn()} />);
    await screen.findByText('The Smiths');

    // Scope to the family header so we don't match the per-guest Rename buttons.
    const familyHeader = screen.getByText('The Smiths').closest('.admin-family-header');
    await userEvent.click(within(familyHeader).getByRole('button', { name: /rename/i }));

    await waitFor(() =>
      expect(updateFamily).toHaveBeenCalledWith('f1', { family_name: 'The Smith Family' })
    );
    promptSpy.mockRestore();
  });

  test('sign out calls signOut and the onSignedOut callback', async () => {
    signOut.mockResolvedValue();
    const onSignedOut = jest.fn();
    render(<AdminDashboard onSignedOut={onSignedOut} />);
    await screen.findByText('The Smiths');

    await userEvent.click(screen.getByRole('button', { name: /sign out/i }));

    await waitFor(() => {
      expect(signOut).toHaveBeenCalled();
      expect(onSignedOut).toHaveBeenCalled();
    });
  });

  test('shows an error if loading families fails', async () => {
    listFamilies.mockRejectedValue(new Error('load failed'));
    render(<AdminDashboard onSignedOut={jest.fn()} />);
    expect(await screen.findByText(/load failed/i)).toBeInTheDocument();
  });
});
