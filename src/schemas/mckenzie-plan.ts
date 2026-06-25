import { withBuiltInPlanAudio } from './built-in-plan-audio';
import type { WorkoutPlan } from './workout-plan';

const RAW_MCKENZIE_PLAN: WorkoutPlan = [
  {
    name: '预备',
    tips: '麦肯基疗法预备阶段，放松腰椎，请用硬板床或瑜伽垫。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '俯卧趴姿',
        desc: '身体俯卧趴在地面或硬板床上，双腿伸直，双臂放在身体两侧，头部自然转向一侧，保持放松呼吸。',
        duration: 180,
      },
    ],
  },
  {
    name: '俯撑',
    tips: '俯撑阶段有助于减轻椎间盘压力，请根据自身感受重复最多三次。',
    allowRounds: true,
    defaultRounds: 1,
    maxRounds: 3,
    steps: [
      {
        name: '肘撑',
        desc: '保持俯卧姿势，用双肘和前臂支撑身体，使胸部轻轻抬离地面，腰部完全放松，保持髋部贴地，自然呼吸。',
        duration: 180,
      },
      {
        name: '手撑',
        desc: '从肘撑姿势开始，双手撑地，伸直双臂将上半身推起，骨盆保持贴地，腰部无压力，感受腰椎前侧拉伸，保持呼吸。',
        duration: 180,
      },
    ],
  },
  {
    name: '放松',
    tips: '结束阶段放松脊柱，缓解腰部紧张。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '仰卧抱膝',
        desc: '仰卧，双腿弯曲，双手抱住膝盖靠近胸口，轻轻前后滚动或静态保持，放松腰背部。',
        duration: 60,
      },
    ],
  },
];

export const MCKENZIE_PLAN = withBuiltInPlanAudio('planD', RAW_MCKENZIE_PLAN);
