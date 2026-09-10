import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../components/common/StatusBadge';

describe('StatusBadge Component', () => {
  it('renders AVAILABLE status badge correctly', () => {
    render(<StatusBadge status="AVAILABLE" />);
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('renders CLAIMED status badge correctly', () => {
    render(<StatusBadge status="CLAIMED" />);
    expect(screen.getByText('Claimed by NGO')).toBeInTheDocument();
  });

  it('renders DELIVERED status badge correctly', () => {
    render(<StatusBadge status="DELIVERED" />);
    expect(screen.getByText('Delivered')).toBeInTheDocument();
  });
});
