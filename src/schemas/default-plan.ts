import type { WorkoutPlan } from './workout-plan';

export const DEFAULT_PLAN: WorkoutPlan = [
  {
    name: '热身',
    tips: '唤醒身体，润滑关节，为运动做好准备。全程保持自然呼吸。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '颈部画圆',
        desc: '坐或站，下巴带动头部，缓慢向前、向下、向左、向后画半圆，再反向。重复。仅活动颈部。',
        duration: 60,
      },
      {
        name: '肩部时钟',
        desc: '双臂自然下垂。想象肩膀是时针，缓慢地向前、向上、向后、向下画圈。正反方向各30秒。',
        duration: 60,
      },
      {
        name: '猫牛式',
        desc: '四足跪姿。吸气塌腰抬头（牛式），呼气拱背低头（猫式）。感受脊柱一节节活动。',
        duration: 60,
      },
      {
        name: '原地提膝走',
        desc: '缓慢进行，将膝盖轻松地抬向胸前，手臂自然摆动。目的是温和提升心率。',
        duration: 60,
      },
      {
        name: '脚踝与手腕绕环',
        desc: '坐姿，伸直腿和手臂，缓慢活动踝关节和手腕。',
        duration: 60,
      },
    ],
  },
  {
    name: '力量训练',
    tips: '注重肌肉感受与控制，而非速度和次数。',
    allowRounds: true,
    defaultRounds: 2,
    maxRounds: 2,
    steps: [
      {
        name: '靠墙天使',
        desc: '背靠墙站立，头、上背、臀部贴墙。手臂呈“达不溜”形贴墙，缓慢上举至向上“八”字形，再下放。感受肩胛骨的活动。',
        duration: 45,
      },
      { name: '休息', desc: '', duration: 15 },
      {
        name: '坐姿自重深蹲',
        desc: '坐在椅子边缘，双脚与肩同宽。缓慢站起至完全直立，再缓慢控制下坐（臀部轻触椅子即起）。全程核心收紧，背部挺直。',
        duration: 45,
      },
      { name: '休息', desc: '', duration: 15 },
      {
        name: '臀桥',
        desc: '仰卧，屈膝，双脚平放。缓慢将臀部抬离地面，至膝、髋、肩呈直线，顶峰收缩1秒，缓慢下放。',
        duration: 45,
      },
      { name: '休息', desc: '', duration: 15 },
      {
        name: '跪姿俯卧撑',
        desc: '采用跪姿，双手略宽于肩。身体下降时感受胸部拉伸，推起时不必完全伸直手臂，保持微屈。',
        duration: 45,
      },
      { name: '休息', desc: '', duration: 15 },
      {
        name: '鸟狗式',
        desc: '四足跪姿。缓慢将对侧的手和腿向前向后伸直，与身体成一直线，保持核心收紧，身体稳定，缓慢收回。换边。',
        duration: 45,
      },
      { name: '休息', desc: '', duration: 15 },
    ],
  },
  {
    name: '有氧',
    tips: '采用“低冲击、持续性”动作，将心率维持在温和提升的水平。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      { name: '原地踏步', desc: '正常速度。', duration: 60 },
      {
        name: '踏步+侧抬腿',
        desc: '每侧交替进行，腿向外侧平缓抬起，感受髋部活动。',
        duration: 60,
      },
      {
        name: '踏步+轻微提膝',
        desc: '回到温和踏步，偶尔轻抬膝盖。',
        duration: 60,
      },
    ],
  },
  {
    name: '放松',
    tips: '专注于拉伸和呼吸，帮助身体恢复平静。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '股四头肌拉伸',
        desc: '站立，一手扶墙，另一手抓住同侧脚踝，将脚跟轻轻拉向臀部，感受大腿前侧拉伸。',
        duration: 30,
      },
      { name: '换边', desc: '换另一侧拉伸。', duration: 30 },
      {
        name: '胸部与肩部拉伸',
        desc: '站立，双手在背后十指相扣，轻轻将手臂向上抬（如做不到，可双手扶墙，身体前倾）。',
        duration: 30,
      },
      {
        name: '腹式深呼吸',
        desc: '坐或躺，一手放腹部。用鼻子缓慢吸气4秒，感受腹部鼓起；用嘴巴缓慢呼气6秒，感受腹部收紧。重复。',
        duration: 30,
      },
    ],
  },
];
