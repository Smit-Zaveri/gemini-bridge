import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Sidebar } from '../src/components/layout/Sidebar';
import { UserRole } from '../src/types';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

describe('Sidebar Component', () => {
  it('renders correctly', () => {
    render(
      <BrowserRouter>
        <Sidebar onLogout={() => {}} />
      </BrowserRouter>
    );
    expect(screen.getByText('Gemini Bridge')).toBeInTheDocument();
  });

  it('filters menu items based on CIVILIAN role', () => {
    render(
      <BrowserRouter>
        <Sidebar role={'civilian' as UserRole} onLogout={() => {}} />
      </BrowserRouter>
    );
    
    // Civilian should see Report
    expect(screen.getByText('Report')).toBeInTheDocument();
    
    // Civilian should NOT see Dashboard or Dispatch
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Dispatch')).not.toBeInTheDocument();
  });

  it('filters menu items based on RESPONDER role', () => {
    render(
      <BrowserRouter>
        <Sidebar role={'responder' as UserRole} onLogout={() => {}} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Report')).toBeInTheDocument();
    expect(screen.getByText('Dispatch')).toBeInTheDocument();
    
    // Responder should NOT see Medical
    expect(screen.queryByText('Medical')).not.toBeInTheDocument();
  });

  it('calls onLogout when logout button is clicked', () => {
    const logoutMock = vi.fn();
    render(
      <BrowserRouter>
        <Sidebar onLogout={logoutMock} />
      </BrowserRouter>
    );

    const logoutBtn = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutBtn);
    
    expect(logoutMock).toHaveBeenCalledTimes(1);
  });
});
