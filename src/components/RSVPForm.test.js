import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RSVPForm from './RSVPForm';
import { submitFamilyRSVP } from '../services/rsvp';

jest.mock('../services/rsvp', () => ({
  submitFamilyRSVP: jest.fn(),
}));

const makeGuest = (overrides = {}) => ({
  id: 'g1',
  full_name: 'John Smith',
  is_child: false,
  church_attendance: '',
  reception_attendance: '',
  meal_preference: '',
  dietary_restrictions: '',
  ...overrides,
});

const renderForm = (guestData, onLogout = jest.fn()) => {
  render(<RSVPForm guestData={guestData} onLogout={onLogout} />);
  return { onLogout };
};

beforeEach(() => {
  jest.clearAllMocks();
  window.scrollTo = jest.fn();
});

describe('RSVPForm', () => {
  test('greets the household by their family name', () => {
    renderForm({ family: { family_name: 'Smith' }, guests: [makeGuest()] });
    expect(screen.getByText(/welcome, the smith family!/i)).toBeInTheDocument();
  });

  test('greets multiple guests by the family name', () => {
    renderForm({
      family: { family_name: 'Smith' },
      guests: [makeGuest(), makeGuest({ id: 'g2', full_name: 'Jane Smith' })],
    });
    expect(screen.getByText(/welcome, the smith family!/i)).toBeInTheDocument();
  });

  test('shows ceremony and reception event details', () => {
    renderForm({ family: { family_name: 'The Smiths' }, guests: [makeGuest()] });
    expect(screen.getByRole('heading', { name: 'Ceremony' })).toBeInTheDocument();
    expect(screen.getByText(/st\. peter's roman catholic church/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Reception' })).toBeInTheDocument();
    expect(screen.getByText('Chateau Le Parc')).toBeInTheDocument();
  });

  test('renders a block per guest with a guest counter for multiple guests', () => {
    renderForm({
      family: { family_name: 'The Smiths' },
      guests: [makeGuest(), makeGuest({ id: 'g2', full_name: 'Jane Smith' })],
    });
    expect(screen.getByText(/guest 1 of 2/i)).toBeInTheDocument();
    expect(screen.getByText(/guest 2 of 2/i)).toBeInTheDocument();
  });

  test('meal preference appears only after choosing to attend the reception', async () => {
    renderForm({ family: { family_name: 'The Smiths' }, guests: [makeGuest()] });

    expect(screen.queryByText(/meal preference/i)).not.toBeInTheDocument();

    // Select "Yes" for the reception (second attendance question).
    const yesRadios = screen.getAllByDisplayValue('Yes');
    // index 0 = church, index 1 = reception
    await userEvent.click(yesRadios[1]);

    expect(await screen.findByText(/meal preference/i)).toBeInTheDocument();
    // The adult meal choices are rendered as radio inputs with these values.
    expect(screen.getByDisplayValue('Beef Short Rib')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Salmon')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Vegetarian')).toBeInTheDocument();
    expect(screen.getByText(/dietary restrictions or allergies/i)).toBeInTheDocument();
  });

  test('children see the child meal option instead of the adult meals', async () => {
    renderForm({
      family: { family_name: 'The Smiths' },
      guests: [makeGuest({ is_child: true, full_name: 'Tiny Smith' })],
    });

    await userEvent.click(screen.getAllByDisplayValue('Yes')[1]); // reception yes

    expect(await screen.findByText(/children's meal/i)).toBeInTheDocument();
    // No adult meal radios are offered to children.
    expect(screen.queryByDisplayValue('Beef Short Rib')).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('Salmon')).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('Vegetarian')).not.toBeInTheDocument();
  });

  test('submitting saves the RSVP and shows a success message', async () => {
    submitFamilyRSVP.mockResolvedValue(true);
    renderForm({ family: { family_name: 'The Smiths' }, guests: [makeGuest()] });

    await userEvent.click(screen.getAllByDisplayValue('Yes')[0]); // church yes
    await userEvent.click(screen.getAllByDisplayValue('No')[0]); // reception no
    await userEvent.click(screen.getByRole('button', { name: /save rsvp/i }));

    await waitFor(() => expect(submitFamilyRSVP).toHaveBeenCalledTimes(1));
    expect(await screen.findByText(/your rsvp has been successfully saved/i)).toBeInTheDocument();
  });

  test('a failed submit shows an error message', async () => {
    submitFamilyRSVP.mockRejectedValue(new Error('db error'));
    renderForm({ family: { family_name: 'The Smiths' }, guests: [makeGuest()] });

    await userEvent.click(screen.getAllByDisplayValue('Yes')[0]);
    await userEvent.click(screen.getAllByDisplayValue('No')[0]);
    await userEvent.click(screen.getByRole('button', { name: /save rsvp/i }));

    expect(await screen.findByText(/unable to save your rsvp/i)).toBeInTheDocument();
  });

  test('the sign-out button calls onLogout', async () => {
    const { onLogout } = renderForm({
      family: { family_name: 'The Smiths' },
      guests: [makeGuest()],
    });
    await userEvent.click(screen.getByRole('button', { name: /sign out/i }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  test('a chosen meal preference is reflected in the selected radio', async () => {
    renderForm({ family: { family_name: 'The Smiths' }, guests: [makeGuest()] });
    await userEvent.click(screen.getAllByDisplayValue('Yes')[1]); // reception yes
    const beef = await screen.findByDisplayValue('Beef Short Rib');
    await userEvent.click(beef);
    expect(beef).toBeChecked();
  });

  test('an adult can choose the vegetarian meal and it is submitted', async () => {
    submitFamilyRSVP.mockResolvedValue(true);
    renderForm({ family: { family_name: 'The Smiths' }, guests: [makeGuest()] });

    await userEvent.click(screen.getAllByDisplayValue('Yes')[0]); // church yes
    await userEvent.click(screen.getAllByDisplayValue('Yes')[1]); // reception yes
    const vegetarian = await screen.findByDisplayValue('Vegetarian');
    await userEvent.click(vegetarian);
    expect(vegetarian).toBeChecked();

    await userEvent.click(screen.getByRole('button', { name: /save rsvp/i }));

    await waitFor(() => expect(submitFamilyRSVP).toHaveBeenCalledTimes(1));
    const submittedGuests = submitFamilyRSVP.mock.calls[0][0];
    expect(submittedGuests[0].meal_preference).toBe('Vegetarian');
  });
});
