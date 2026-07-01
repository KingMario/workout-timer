import { withBuiltInPlanAudio } from './built-in-plan-audio';
import type { WorkoutPlan } from './workout-plan';

const RAW_BED_EXERCISE_MORNING_PLAN: WorkoutPlan = [
  {
    name: '呼吸准备',
    tips: '适合刚醒来或需要低冲击活动时完成。所有动作保持顺畅呼吸，不憋气。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '仰卧鼻吸慢呼',
        desc: '仰卧或侧卧，一手放在腹部。用鼻子缓慢吸气，再用更慢的速度呼气，让胸腹自然起伏。',
        duration: 60,
      },
      {
        name: '全身轻绷放松',
        desc: '仰卧，双手放在胸前或身体两侧。轻轻绷紧全身两秒，然后完全放松，不要用全力。',
        duration: 45,
      },
      {
        name: '肩胛轻耸',
        desc: '仰卧或侧卧，肩膀向耳朵方向轻轻耸起，再放下。动作小而慢，脖子保持放松。',
        duration: 45,
      },
    ],
  },
  {
    name: '侧卧上肢',
    tips: '侧卧动作先完成一侧再换边。发力以温和到中等为准，肩颈不夹紧。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '左侧上臂屈伸',
        desc: '右侧卧，左上臂贴近身体。弯曲左肘轻轻收紧上臂，再慢慢伸直放松。',
        duration: 30,
      },
      {
        name: '右侧上臂屈伸',
        desc: '左侧卧，右上臂贴近身体。弯曲右肘后伸直，感受上臂温和收缩和放松。',
        duration: 30,
      },
      {
        name: '左侧手臂旋转',
        desc: '右侧卧，左臂伸直与身体平行，握拳但不锁死手肘。前后小幅旋转手臂。',
        duration: 30,
      },
      {
        name: '右侧手臂旋转',
        desc: '左侧卧，右臂伸直与身体平行。前后小幅旋转，动作控制在肩膀舒服范围内。',
        duration: 30,
      },
      {
        name: '左侧手腕轻抗阻',
        desc: '右侧卧，用右手托住左手腕。左手轻轻上推，右手给一点阻力，再放松。',
        duration: 30,
      },
      {
        name: '右侧手腕轻抗阻',
        desc: '左侧卧，用左手托住右手腕。右手轻轻上推，对抗一小段时间后放松。',
        duration: 30,
      },
      {
        name: '左侧膝盖牵拉',
        desc: '右侧卧，左手轻扶左膝，把膝盖向身体方向轻轻带近，停一秒后放松。',
        duration: 30,
      },
      {
        name: '右侧膝盖牵拉',
        desc: '左侧卧，右手轻扶右膝，把膝盖向身体方向轻轻带近，腰背保持舒适。',
        duration: 30,
      },
    ],
  },
  {
    name: '腰腿激活',
    tips: '这些动作来自书中的床上低冲击思路，已改成保守强度。腰腹、髋或膝不适时跳过。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '左侧体侧小抬',
        desc: '右侧卧，头和双脚只离开床面一点点，感受左侧腰腹参与，马上放下。',
        duration: 20,
      },
      {
        name: '右侧体侧小抬',
        desc: '左侧卧，头和双脚只离开床面一点点，动作宁小勿大，避免憋气。',
        duration: 20,
      },
      {
        name: '左膝内收抬髋',
        desc: '仰卧，左膝弯曲向上向内带近，左侧臀部轻轻离床，再慢慢放回。',
        duration: 30,
      },
      {
        name: '右膝内收抬髋',
        desc: '仰卧，右膝弯曲向上向内带近，右侧臀部轻轻离床，腹部保持稳定。',
        duration: 30,
      },
      {
        name: '左脚前掌轻压',
        desc: '仰卧或侧卧，左前脚掌轻轻抵住床尾或右脚，像踩踏板一样压住再放松。',
        duration: 40,
      },
      {
        name: '右脚前掌轻压',
        desc: '仰卧或侧卧，右前脚掌轻轻抵住床尾或左脚，压住再放松，膝盖保持舒适。',
        duration: 40,
      },
    ],
  },
  {
    name: '颈肩收尾',
    tips: '颈部动作只做轻柔版本，不追求幅度。出现头晕、麻木或刺痛时立即停止。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '后脑轻推等长',
        desc: '仰卧，双手托住后脑。后脑轻轻向手上发力两秒，再完全放松，脖子不要用力过猛。',
        duration: 30,
      },
      {
        name: '左侧下巴靠肩',
        desc: '右侧卧，下巴轻轻朝左肩方向靠近，再回到中间。只做到舒服范围。',
        duration: 30,
      },
      {
        name: '右侧下巴靠肩',
        desc: '左侧卧，下巴轻轻朝右肩方向靠近，再回到中间，保持呼吸自然。',
        duration: 30,
      },
      {
        name: '仰卧慢呼吸',
        desc: '回到仰卧，放松手脚。缓慢吸气和呼气，让身体恢复平静。',
        duration: 60,
      },
    ],
  },
];

export const BED_EXERCISE_MORNING_PLAN = withBuiltInPlanAudio(
  'planT',
  RAW_BED_EXERCISE_MORNING_PLAN,
);
