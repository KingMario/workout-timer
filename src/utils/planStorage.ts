import type { WorkoutPlan } from '../schemas/workout-plan';

export interface SavedPlan {
  id: string;
  title: string;
  createdAt: number;
  data: WorkoutPlan;
}

const STORAGE_KEY = 'mario_workout_timer_plans';

export const getSavedPlans = (): SavedPlan[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load plans', e);
    return [];
  }
};

export const savePlan = (title: string, data: WorkoutPlan): SavedPlan => {
  const plans = getSavedPlans();
  const newPlan: SavedPlan = {
    id: crypto.randomUUID(),
    title: title || `未命名计划 ${new Date().toLocaleDateString()}`,
    createdAt: Date.now(),
    data,
  };
  const updatedPlans = [newPlan, ...plans];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlans));
  return newPlan;
};

export const deletePlan = (id: string) => {
  const plans = getSavedPlans();
  const updatedPlans = plans.filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlans));
};
