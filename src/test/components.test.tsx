import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DailyChallenge from '../components/task/DailyChallenge';
import React from 'react';

describe('DailyChallenge Component', () => {
  it('should render the Daily Challenge heading', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <DailyChallenge />
      </MemoryRouter>
    );

    const heading = screen.getByText(/Daily Challenge/i);
    expect(heading).toBeDefined();
  });

  it('should render a start button', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <DailyChallenge />
      </MemoryRouter>
    );

    const button = screen.getByRole('button');
    expect(button).toBeDefined();
  });
});
