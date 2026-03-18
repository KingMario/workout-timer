import { DEFAULT_PLAN } from './default-plan';
import { SEATED_WORKOUT_PLAN } from './seated-workout-plan';
import { BREAK_PLAN } from './break-plan';
import type { WorkoutPlan } from './workout-plan';

export interface BuiltInPlan {
  id: string;
  title: string;
  data: WorkoutPlan;
  description: string;
}

export const BUILT_IN_PLANS: BuiltInPlan[] = [
  {
    id: 'default-workout',
    title: '系统默认计划',
    data: DEFAULT_PLAN,
    description: '综合性居家健身方案，包含热身、力量、有氧和放松。',
  },
  {
    id: 'seated-workout',
    title: '坐姿锻炼计划',
    data: SEATED_WORKOUT_PLAN,
    description: '针对久坐人群，可在工位或交通工具上完成的温和锻炼。',
  },
];

export { DEFAULT_PLAN, SEATED_WORKOUT_PLAN, BREAK_PLAN };
