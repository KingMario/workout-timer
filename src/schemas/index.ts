import { DEFAULT_PLAN } from './default-plan';
import { MCKENZIE_PLAN } from './mckenzie-plan';
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
  {
    id: 'break-plan',
    title: '间歇拉伸计划',
    data: BREAK_PLAN,
    description: '适合在办公桌前快速进行，缓解久坐带来的颈肩腰背压力。',
  },
  {
    id: 'mckenzie',
    title: '麦肯基疗法',
    data: MCKENZIE_PLAN,
    description: '经典腰椎康复方案，通过俯卧伸展动作缓解腰椎间盘压力。',
  },
];

export { DEFAULT_PLAN, MCKENZIE_PLAN, SEATED_WORKOUT_PLAN, BREAK_PLAN };
