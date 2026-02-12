import type { WorkoutPlan } from '../schemas/workout-plan';

export interface SavedPlan {
  id: string;
  title: string;
  createdAt: number;
  data: WorkoutPlan;
}

const STORAGE_KEY = 'mario_workout_timer_plans';
const ACTIVE_PLAN_KEY = 'mario_workout_timer_active_plan';

// Fallback UUID generator for environments without crypto.randomUUID
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

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
    id: generateUUID(),
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

export const getActivePlan = (): {
  plan: WorkoutPlan;
  id?: string;
} | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = localStorage.getItem(ACTIVE_PLAN_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    // Backward compatibility or direct plan storage
    if (Array.isArray(parsed)) {
      return { plan: parsed };
    }

    // Check if it has an ID, verify it exists
    if (parsed.id) {
      const allPlans = getSavedPlans();
      const found = allPlans.find((p) => p.id === parsed.id);
      if (!found) {
        // Plan was deleted, return null to trigger fallback
        return null;
      }
      return { plan: found.data, id: found.id };
    }

    return { plan: parsed.plan || parsed };
  } catch (e) {
    console.error('Failed to load active plan', e);
    return null;
  }
};

export const saveActivePlan = (plan: WorkoutPlan, id?: string) => {
  localStorage.setItem(ACTIVE_PLAN_KEY, JSON.stringify({ plan, id }));
};

export const clearActivePlan = () => {
  localStorage.removeItem(ACTIVE_PLAN_KEY);
};
