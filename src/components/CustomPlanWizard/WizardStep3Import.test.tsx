import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import WizardStep3Import from './WizardStep3Import';

describe('WizardStep3Import', () => {
  const mockSetPlanTitle = vi.fn();
  const mockSetJsonInput = vi.fn();

  it('renders textarea and title input correctly', () => {
    render(
      <WizardStep3Import
        planTitle="My Test Plan"
        setPlanTitle={mockSetPlanTitle}
        jsonInput=""
        setJsonInput={mockSetJsonInput}
      />,
    );

    expect(screen.getByDisplayValue('My Test Plan')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/\[\{"name": "热身"/),
    ).toBeInTheDocument();
  });

  it('calls setters on user input', () => {
    render(
      <WizardStep3Import
        planTitle=""
        setPlanTitle={mockSetPlanTitle}
        jsonInput=""
        setJsonInput={mockSetJsonInput}
      />,
    );

    fireEvent.input(screen.getByPlaceholderText('例如: 减脂计划, 周末暴汗'), {
      target: { value: 'New Plan' },
    });
    expect(mockSetPlanTitle).toHaveBeenCalledWith('New Plan');

    fireEvent.input(screen.getByPlaceholderText(/\[\{"name": "热身"/), {
      target: { value: '{}' },
    });
    expect(mockSetJsonInput).toHaveBeenCalledWith('{}');
  });

  it('displays syntax or validation error if provided', () => {
    render(
      <WizardStep3Import
        planTitle=""
        setPlanTitle={mockSetPlanTitle}
        jsonInput=""
        setJsonInput={mockSetJsonInput}
        error="Invalid JSON Format"
      />,
    );

    expect(screen.getByText('Invalid JSON Format')).toBeInTheDocument();
  });
});
