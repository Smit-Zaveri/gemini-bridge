import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Navbar } from '../src/components/layout/Navbar';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

describe('Navbar Component', () => {
  it('renders guest UI correctly when no user is provided', () => {
    render(
      <BrowserRouter>
        <Navbar user={null} />
      </BrowserRouter>
    );
    expect(screen.getByText('Guest')).toBeInTheDocument();
    expect(screen.getByText('Visitor')).toBeInTheDocument();
    // Use aria-label to test if accessible element exists
    expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument();
  });

  it('renders user details correctly when user is authenticated', () => {
    const mockUser = {
      uid: 'user123',
      displayName: 'Alice Responder',
      email: 'alice@example.com',
      role: 'responder' as any,
      createdAt: new Date().toISOString()
    };

    render(
      <BrowserRouter>
        <Navbar user={mockUser} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Alice Responder')).toBeInTheDocument();
  });

  it('contains the search input field', () => {
    render(
      <BrowserRouter>
        <Navbar user={null} />
      </BrowserRouter>
    );

    const searchInput = screen.getByPlaceholderText(/search incidents/i);
    expect(searchInput).toBeInTheDocument();
  });
});
