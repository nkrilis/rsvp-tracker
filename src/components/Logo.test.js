import React from 'react';
import { render, screen } from '@testing-library/react';
import Logo from './Logo';

describe('Logo', () => {
  test('renders the monogram image with date from public assets', () => {
    render(<Logo />);
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img.getAttribute('src')).toContain('/assets/EN-Monogram-with-date.svg');
  });

  test('has descriptive alt text for accessibility', () => {
    render(<Logo />);
    expect(screen.getByAltText(/monogram/i)).toBeInTheDocument();
  });
});
