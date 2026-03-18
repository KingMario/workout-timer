import type { WorkoutPlan } from './workout-plan';

export const SEATED_WORKOUT_PLAN: WorkoutPlan = [
  {
    name: '活动性训练',
    tips: '针对颈椎、腰椎和膝盖的温和活动，地铁中可坐姿完成，动作舒缓不引人注目',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '坐姿颈部和缓转头',
        desc: '端坐，脊柱拉长，呼气时缓慢将头转向右侧，吸气回正，左右交替，感受侧颈温和拉伸',
        duration: 60,
      },
      {
        name: '坐姿收下巴',
        desc: '坐直，目视前方，下巴水平后收（不是低头），感觉颈后伸展，保持温和收缩',
        duration: 60,
      },
      {
        name: '坐姿猫牛式',
        desc: '双手扶膝，吸气挺胸微抬头（牛式），呼气拱背后缩下巴（猫式），腰椎温和活动',
        duration: 60,
      },
      {
        name: '坐姿髋屈肌伸展',
        desc: '坐于座椅前1/3，右踝放左膝上（翘二郎腿姿势），背挺直，轻压右膝，换边',
        duration: 60,
      },
      {
        name: '坐姿提踵',
        desc: '坐正，双脚平放，缓慢提脚跟再落下，促进小腿血液循环，不伤膝盖',
        duration: 60,
      },
    ],
  },
  {
    name: '轻量力量训练',
    tips: '全程坐姿，利用自身体重，无冲击，关注核心与上肢稳定，保护腰椎颈椎',
    allowRounds: true,
    defaultRounds: 2,
    maxRounds: 3,
    steps: [
      {
        name: '坐姿肩胛后收',
        desc: '坐直，双手前平举，呼气肩胛骨向后夹紧，手肘微曲后拉，吸气还原',
        duration: 45,
      },
      {
        name: '坐姿手臂交替前伸',
        desc: '坐直，核心微收，左臂向前延伸，右臂屈手向后拉，模拟爬行，交替进行',
        duration: 45,
      },
      {
        name: '坐姿单腿提膝',
        desc: '坐直，缓慢将左膝抬向胸口，手轻扶小腿，感受腹肌轻柔收缩，缓慢放下，换边',
        duration: 45,
      },
      {
        name: '坐姿躯干旋转',
        desc: '双手胸前合十，呼气躯干缓慢向右转，保持骨盆中立，吸气回正，左右交替',
        duration: 45,
      },
    ],
  },
  {
    name: '有氧运动',
    tips: '低强度、低出汗、地铁友好。坐姿完成，以增加心率但不造成气喘为度',
    allowRounds: true,
    defaultRounds: 2,
    maxRounds: 3,
    steps: [
      {
        name: '坐姿踏步',
        desc: '坐直，双脚交替轻抬，如原地踏步，手臂自然摆动，节奏平稳',
        duration: 60,
      },
      {
        name: '坐姿脚跟点地',
        desc: '双脚交替向前脚跟轻点地面，另一脚踩地支撑，配合对侧手臂前伸',
        duration: 60,
      },
      {
        name: '坐姿拳击手',
        desc: '双手握虚拳，交替向前轻出拳，伴随躯干轻微旋转，保持呼吸',
        duration: 60,
      },
    ],
  },
  {
    name: '快速放松',
    tips: '在地铁到站前完成，帮助身心平复，减少久坐僵硬',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '坐姿侧颈拉伸',
        desc: '坐直，右手放臀下，左手轻扶头部左侧，呼气头侧倒向右，保持20秒，换边',
        duration: 50,
      },
      {
        name: '坐姿脊柱扭转',
        desc: '身体向右扭转，左手扶右膝外侧，右手扶椅背，保持温和扭转，换边',
        duration: 50,
      },
      {
        name: '腹式呼吸',
        desc: '闭眼，手放腹部，吸气腹部鼓起，呼气腹部凹陷，深长缓慢',
        duration: 40,
      },
    ],
  },
];
