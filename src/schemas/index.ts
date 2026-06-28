import {
  BOOK_FULL_BODY_STRETCH_PLAN,
  BOOK_LOWER_BACK_RELIEF_PLAN,
  BOOK_NECK_SHOULDER_RELIEF_PLAN,
  BOOK_RUNNER_RECOVERY_PLAN,
} from './book-stretch-plans';
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
  {
    id: 'book-full-body-stretch',
    title: '全身动态拉伸',
    data: BOOK_FULL_BODY_STRETCH_PLAN,
    description: '源自《全身拉伸》的 15 分钟全身动态唤醒与静态收尾。',
  },
  {
    id: 'book-neck-shoulder-relief',
    title: '肩颈压力缓解',
    data: BOOK_NECK_SHOULDER_RELIEF_PLAN,
    description: '适合久坐和写代码后的 10 分钟肩颈、肩胛与上背放松。',
  },
  {
    id: 'book-lower-back-relief',
    title: '下腰背放松',
    data: BOOK_LOWER_BACK_RELIEF_PLAN,
    description: '针对久坐腰背紧张的 10 分钟髋腰侧链与地面放松。',
  },
  {
    id: 'book-runner-recovery',
    title: '跑后臀腿恢复',
    data: BOOK_RUNNER_RECOVERY_PLAN,
    description: '跑步后使用的 15 分钟臀腿、髋前侧和小腿恢复拉伸。',
  },
];

export {
  BOOK_FULL_BODY_STRETCH_PLAN,
  BOOK_LOWER_BACK_RELIEF_PLAN,
  BOOK_NECK_SHOULDER_RELIEF_PLAN,
  BOOK_RUNNER_RECOVERY_PLAN,
  DEFAULT_PLAN,
  MCKENZIE_PLAN,
  SEATED_WORKOUT_PLAN,
  BREAK_PLAN,
};
