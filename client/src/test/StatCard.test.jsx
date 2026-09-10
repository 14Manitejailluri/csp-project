import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from '../components/common/StatCard';
import { Package } from 'lucide-react';

describe('StatCard Component', () => {
  it('renders title, value, and subtitle correctly', () => {
    render(
      <StatCard
        title="Food Rescued"
        value="450 kg"
        subtitle="1,070 meals served"
        icon={Package}
      />
    );
    expect(screen.getByText('Food Rescued')).toBeInTheDocument();
    expect(screen.getByText('450 kg')).toBeInTheDocument();
    expect(screen.getByText('1,070 meals served')).toBeInTheDocument();
  });
});
