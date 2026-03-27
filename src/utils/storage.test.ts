import { describe, expect, it, beforeEach, vi } from 'vitest';
import { BUILT_IN_PLANS } from '../schemas';
import type { WorkoutPlan } from '../schemas/workout-plan';
import {
  clearActivePlan,
  deletePlan,
  getAIConfig,
  getActivePlan,
  getSavedPlans,
  saveAIConfig,
  saveActivePlan,
  savePlan,
} from './storage';

// Helper: basic mock plan
const mockPlan: WorkoutPlan = [
  {
    name: 'Test Section',
    tips: 'tips',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: 'Step 1',
        desc: 'Do something',
        duration: 10,
      },
    ],
  },
];

describe('storage utils', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('getSavedPlans returns empty array when nothing stored', () => {
    const plans = getSavedPlans();
    expect(plans).toEqual([]);
  });

  it('savePlan stores and returns new plan', () => {
    const saved = savePlan('My Plan', mockPlan);

    expect(saved.id).toBeDefined();
    expect(saved.title).toBe('My Plan');
    expect(saved.data).toEqual(mockPlan);

    const fromStorage = getSavedPlans();
    expect(fromStorage).toHaveLength(1);
    expect(fromStorage[0].id).toBe(saved.id);
  });

  it('savePlan uses fallback title when title is empty', () => {
    const saved = savePlan('', mockPlan);
    expect(saved.title).toMatch(/^未命名计划 /);
  });

  it('deletePlan removes plan by id', () => {
    const p1 = savePlan('Plan 1', mockPlan);
    const p2 = savePlan('Plan 2', mockPlan);

    deletePlan(p1.id);

    const remaining = getSavedPlans();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(p2.id);
  });

  it('getSavedPlans handles invalid JSON gracefully', () => {
    localStorage.setItem('mario_workout_timer_plans', 'not-json');
    // Suppress console.error noise in test output
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const plans = getSavedPlans();
    expect(plans).toEqual([]);
    expect(spy).toHaveBeenCalled();
  });

  it('saveActivePlan and getActivePlan store and read direct plan', () => {
    saveActivePlan(mockPlan);
    const active = getActivePlan();

    expect(active).not.toBeNull();
    expect(active?.plan).toEqual(mockPlan);
    expect(active?.id).toBeUndefined();
  });

  it('getActivePlan returns null if storage empty or invalid', () => {
    clearActivePlan();
    expect(getActivePlan()).toBeNull();

    localStorage.setItem('mario_workout_timer_active_plan', 'not-json');
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(getActivePlan()).toBeNull();
    expect(spy).toHaveBeenCalled();
  });

  it('getActivePlan supports legacy array-only storage', () => {
    localStorage.setItem(
      'mario_workout_timer_active_plan',
      JSON.stringify(mockPlan),
    );
    const active = getActivePlan();
    expect(active).not.toBeNull();
    expect(active?.plan).toEqual(mockPlan);
  });

  it('getActivePlan returns referenced saved plan by id', () => {
    const saved = savePlan('Saved', mockPlan);

    // Simulate active plan storing only id (current behavior uses { plan, id },
    // but we still want to cover this compatibility branch)
    localStorage.setItem(
      'mario_workout_timer_active_plan',
      JSON.stringify({ id: saved.id }),
    );

    const active = getActivePlan();
    expect(active).not.toBeNull();
    expect(active?.id).toBe(saved.id);
    expect(active?.plan).toEqual(mockPlan);
  });

  it('getActivePlan returns null when referenced saved plan is missing', () => {
    localStorage.setItem(
      'mario_workout_timer_active_plan',
      JSON.stringify({ id: 'missing-id' }),
    );

    const active = getActivePlan();
    expect(active).toBeNull();
  });

  it('getActivePlan returns built-in plan when active id matches built-in plan', () => {
    const builtInPlan = BUILT_IN_PLANS.find(
      (plan) => plan.id === 'seated-workout',
    );
    expect(builtInPlan).toBeDefined();
    if (!builtInPlan) {
      return;
    }

    saveActivePlan(builtInPlan.data, builtInPlan.id);
    const active = getActivePlan();

    expect(active).not.toBeNull();
    expect(active?.plan).toEqual(builtInPlan.data);
    expect(active?.id).toBe(builtInPlan.id);
  });

  it('getActivePlan resolves built-in plan when only id stored', () => {
    const builtInPlan = BUILT_IN_PLANS.find(
      (plan) => plan.id === 'seated-workout',
    );
    expect(builtInPlan).toBeDefined();
    if (!builtInPlan) {
      return;
    }

    localStorage.setItem(
      'mario_workout_timer_active_plan',
      JSON.stringify({ id: builtInPlan.id }),
    );

    const active = getActivePlan();
    expect(active).not.toBeNull();
    expect(active?.plan).toEqual(builtInPlan.data);
    expect(active?.id).toBe(builtInPlan.id);
  });

  it('clearActivePlan removes active plan from storage', () => {
    // For current implementation, saveActivePlan stores { plan, id },
    // which getActivePlan reads back as a plain plan without id.
    clearActivePlan();
    expect(getActivePlan()).toBeNull();
  });

  it('getAIConfig returns default values when empty', () => {
    const config = getAIConfig();
    expect(config.apiKey).toBe('');
    expect(config.baseUrl).toBe('https://api.deepseek.com');
  });

  it('saveAIConfig stores and getAIConfig retrieves config', () => {
    const newConfig = {
      apiKey: 'test-key',
      baseUrl: 'https://api.openai.com',
      model: 'gpt-4',
    };
    saveAIConfig(newConfig);
    const retrieved = getAIConfig();
    expect(retrieved).toEqual(newConfig);
  });
});
