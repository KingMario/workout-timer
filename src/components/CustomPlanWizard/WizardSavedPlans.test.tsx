import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import WizardSavedPlans from './WizardSavedPlans';

describe('WizardSavedPlans', () => {
  const mockOnLoadPlan = vi.fn();
  const mockOnLoadBuiltInPlan = vi.fn();
  const mockOnDeletePlan = vi.fn();
  const mockOnClose = vi.fn();

  const dummySavedPlans = [
    {
      id: 'saved-1',
      title: 'My Custom Plan',
      createdAt: Date.now(),
      data: [],
    },
  ];

  const defaultProps = {
    savedPlans: dummySavedPlans,
    activePlanId: '',
    onLoadPlan: mockOnLoadPlan,
    onLoadBuiltInPlan: mockOnLoadBuiltInPlan,
    onDeletePlan: mockOnDeletePlan,
    onClose: mockOnClose,
  };

  it('renders built-in plans correctly', () => {
    render(<WizardSavedPlans {...defaultProps} />);
    expect(screen.getByText('📋 系统内置计划')).toBeInTheDocument();

    // Check if the default built in plan shows up
    expect(screen.getByText('系统默认计划')).toBeInTheDocument();
  });

  it('renders user saved plans correctly', () => {
    render(<WizardSavedPlans {...defaultProps} />);
    expect(screen.getByText('💾 我的收藏')).toBeInTheDocument();
    expect(screen.getByText('My Custom Plan')).toBeInTheDocument();
  });

  it('handles loading a custom plan', () => {
    render(<WizardSavedPlans {...defaultProps} />);
    const savedPlanCard = screen
      .getByText('My Custom Plan')
      .closest('div[class*="justify-between"]');
    const loadButton = within(savedPlanCard!).getByText('载入');

    fireEvent.click(loadButton);
    expect(mockOnLoadPlan).toHaveBeenCalledWith(dummySavedPlans[0]);
  });

  it('handles deleting a custom plan', () => {
    render(<WizardSavedPlans {...defaultProps} />);
    const savedPlanCard = screen
      .getByText('My Custom Plan')
      .closest('div[class*="justify-between"]');
    const deleteButton = within(savedPlanCard!).getByRole('button', {
      name: /删除/,
    });

    fireEvent.click(deleteButton);
    expect(mockOnDeletePlan).toHaveBeenCalledWith('saved-1');
  });
});
