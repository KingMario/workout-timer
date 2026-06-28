import {
  AGING_BACKWARDS_BALANCE_PLAN,
  AGING_BACKWARDS_BONES_PLAN,
  AGING_BACKWARDS_ENERGY_PLAN,
  AGING_BACKWARDS_JOINTS_PLAN,
  AGING_BACKWARDS_MOBILITY_PLAN,
  AGING_BACKWARDS_PAIN_RELIEF_PLAN,
  AGING_BACKWARDS_POSTURE_PLAN,
  AGING_BACKWARDS_WEIGHT_LOSS_PLAN,
} from './aging-backwards-plans';
import {
  BOOK_FULL_BODY_STRETCH_PLAN,
  BOOK_LOWER_BACK_RELIEF_PLAN,
  BOOK_NECK_SHOULDER_RELIEF_PLAN,
  BOOK_RUNNER_RECOVERY_PLAN,
} from './book-stretch-plans';
import { BREAK_PLAN } from './break-plan';
import { DEFAULT_PLAN } from './default-plan';
import { MCKENZIE_PLAN } from './mckenzie-plan';
import { SEATED_WORKOUT_PLAN } from './seated-workout-plan';
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
  {
    id: 'aging-backwards-posture',
    title: '逆龄姿态训练',
    data: AGING_BACKWARDS_POSTURE_PLAN,
    description: '从脊柱、胸腔和髋部入手的姿态打开训练。',
  },
  {
    id: 'aging-backwards-weight-loss',
    title: '逆龄代谢唤醒',
    data: AGING_BACKWARDS_WEIGHT_LOSS_PLAN,
    description: '连续调动腿部、躯干和核心的大肌群活力训练。',
  },
  {
    id: 'aging-backwards-joints',
    title: '逆龄关节润滑',
    data: AGING_BACKWARDS_JOINTS_PLAN,
    description: '面向髋、膝、踝、肩和手腕的温和活动度训练。',
  },
  {
    id: 'aging-backwards-energy',
    title: '逆龄能量激活',
    data: AGING_BACKWARDS_ENERGY_PLAN,
    description: '用脚底、小腿和站姿动作提升身体循环与清醒感。',
  },
  {
    id: 'aging-backwards-pain-relief',
    title: '逆龄疼痛缓解',
    data: AGING_BACKWARDS_PAIN_RELIEF_PLAN,
    description: '针对髋腰、肩颈和腿部紧张的低强度舒缓计划。',
  },
  {
    id: 'aging-backwards-balance',
    title: '逆龄平衡训练',
    data: AGING_BACKWARDS_BALANCE_PLAN,
    description: '通过脚踝、髋部和单脚控制提升站姿稳定性。',
  },
  {
    id: 'aging-backwards-mobility',
    title: '逆龄活动度提升',
    data: AGING_BACKWARDS_MOBILITY_PLAN,
    description: '用流动拉伸改善髋、脊柱、肩和腿部活动范围。',
  },
  {
    id: 'aging-backwards-bones',
    title: '逆龄骨骼保护',
    data: AGING_BACKWARDS_BONES_PLAN,
    description: '结合站姿力量、伸展和扶椅动作的骨骼支持训练。',
  },
];

export {
  AGING_BACKWARDS_BALANCE_PLAN,
  AGING_BACKWARDS_BONES_PLAN,
  AGING_BACKWARDS_ENERGY_PLAN,
  AGING_BACKWARDS_JOINTS_PLAN,
  AGING_BACKWARDS_MOBILITY_PLAN,
  AGING_BACKWARDS_PAIN_RELIEF_PLAN,
  AGING_BACKWARDS_POSTURE_PLAN,
  AGING_BACKWARDS_WEIGHT_LOSS_PLAN,
  BOOK_FULL_BODY_STRETCH_PLAN,
  BOOK_LOWER_BACK_RELIEF_PLAN,
  BOOK_NECK_SHOULDER_RELIEF_PLAN,
  BOOK_RUNNER_RECOVERY_PLAN,
  DEFAULT_PLAN,
  MCKENZIE_PLAN,
  SEATED_WORKOUT_PLAN,
  BREAK_PLAN,
};
