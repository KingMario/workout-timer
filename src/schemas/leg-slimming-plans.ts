import { withBuiltInPlanAudio } from './built-in-plan-audio';
import type { WorkoutPlan } from './workout-plan';

const RAW_LEG_SLIMMING_RELEASE_PLAN: WorkoutPlan = [
  {
    name: '大腿前侧和髋部',
    tips: '动作只做到中等拉伸感，保持呼吸，不要为了追求幅度而压腰。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '左侧髋屈肌侧卧拉伸',
        desc: '右侧卧支撑身体，左膝弯曲，左手抓住脚背，把脚跟轻轻带向臀部。',
        duration: 30,
      },
      {
        name: '右侧髋屈肌侧卧拉伸',
        desc: '左侧卧支撑身体，右膝弯曲，右手抓住脚背，感受大腿前侧放松。',
        duration: 30,
      },
      {
        name: '左腿站姿主动屈膝',
        desc: '扶住椅背站稳，左脚跟主动靠近臀部，再缓慢放下。',
        duration: 30,
      },
      {
        name: '右腿站姿主动屈膝',
        desc: '扶住椅背站稳，右脚跟主动靠近臀部，骨盆保持稳定。',
        duration: 30,
      },
      {
        name: '动态屈膝坐',
        desc: '跪姿脚背贴地，臀部向后坐到舒适位置，再回到直立跪姿。',
        duration: 45,
      },
      {
        name: '左侧前倾拉伸',
        desc: '右腿在前、左腿在后跪姿，左手向上伸，右手辅助左脚靠近臀部。',
        duration: 30,
      },
      {
        name: '右侧前倾拉伸',
        desc: '左腿在前、右腿在后跪姿，右手向上伸，左手辅助右脚靠近臀部。',
        duration: 30,
      },
    ],
  },
  {
    name: '大腿内侧',
    tips: '背部尽量保持延展，内侧拉伸不要用弹震动作。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '动态坐式跨坐',
        desc: '坐姿双腿打开，双手撑在身体后侧，背部拉长后轻轻前倾再回正。',
        duration: 45,
      },
      {
        name: '蛙式跨坐',
        desc: '前臂撑地，双膝打开，髋部向后坐到大腿内侧有温和牵拉。',
        duration: 45,
      },
      {
        name: '蝴蝶式体前屈',
        desc: '脚掌相对坐姿，双手扶脚踝，身体从髋部向前折叠。',
        duration: 45,
      },
      {
        name: '左腿站姿侧抬',
        desc: '右手扶稳，左手叉腰，左腿向左侧抬起再放下，控制身体不歪斜。',
        duration: 30,
      },
      {
        name: '右腿站姿侧抬',
        desc: '左手扶稳，右手叉腰，右腿向右侧抬起再放下，保持核心收紧。',
        duration: 30,
      },
    ],
  },
  {
    name: '小腿和足部',
    tips: '脚踝动作要慢，足底按摩以舒适为准，避免压到尖锐疼痛点。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '左侧屈膝脚跟按压',
        desc: '左脚在后前后站立，双膝弯曲，左脚跟压向地面拉伸小腿深层。',
        duration: 30,
      },
      {
        name: '右侧屈膝脚跟按压',
        desc: '右脚在后前后站立，双膝弯曲，右脚跟压向地面。',
        duration: 30,
      },
      {
        name: '左侧腓肠肌拉伸',
        desc: '左前脚掌踩在台阶边缘，脚跟缓慢下沉，膝盖保持微松。',
        duration: 30,
      },
      {
        name: '右侧腓肠肌拉伸',
        desc: '右前脚掌踩在台阶边缘，脚跟缓慢下沉，感受小腿后侧拉长。',
        duration: 30,
      },
      {
        name: '左脚脚踝屈伸',
        desc: '坐姿把左脚放到右腿上，用手扶住脚踝，主动完成脚尖上勾和下压。',
        duration: 30,
      },
      {
        name: '右脚脚踝屈伸',
        desc: '坐姿把右脚放到左腿上，主动完成脚踝屈伸，动作保持缓慢。',
        duration: 30,
      },
      {
        name: '左足底按摩',
        desc: '坐姿托住左脚，用双手从脚跟到前脚掌轻柔按揉足底。',
        duration: 45,
      },
      {
        name: '右足底按摩',
        desc: '坐姿托住右脚，用双手从脚跟到前脚掌轻柔按揉足底。',
        duration: 45,
      },
      {
        name: '左脚踝转动',
        desc: '坐姿扶住左脚，脚踝顺时针和逆时针缓慢绕环。',
        duration: 30,
      },
      {
        name: '右脚踝转动',
        desc: '坐姿扶住右脚，脚踝顺时针和逆时针缓慢绕环。',
        duration: 30,
      },
    ],
  },
];

const RAW_LEG_SLIMMING_BEGINNER_PLAN: WorkoutPlan = [
  {
    name: '力量唤醒',
    tips: '每个动作按计时完成，动作之间短暂调整，整段做完后休息再进入有氧。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '靠墙下蹲',
        desc: '背靠墙，双脚向前，膝盖对准脚尖，下蹲到可控角度后站起。',
        duration: 60,
      },
      {
        name: '静态臀桥',
        desc: '仰卧屈膝，脚跟踩地，臀部向上抬到肩髋膝成斜线，再缓慢放下。',
        duration: 60,
      },
      {
        name: '左侧徒手单腿蹲',
        desc: '右脚轻点地辅助，左腿主导小幅下蹲再站起，膝盖保持稳定。',
        duration: 45,
      },
      {
        name: '右侧徒手单腿蹲',
        desc: '左脚轻点地辅助，右腿主导小幅下蹲再站起，控制身体不晃动。',
        duration: 45,
      },
      {
        name: '左侧侧平板抬腿',
        desc: '左侧平板支撑，右腿向上抬起再放下，保持腰腹稳定。',
        duration: 45,
      },
      {
        name: '右侧侧平板抬腿',
        desc: '右侧平板支撑，左腿向上抬起再放下，臀部不要后坐。',
        duration: 45,
      },
    ],
  },
  {
    name: '低冲击有氧',
    tips: '保持能说短句的强度，膝盖不舒服时把跳跃改成踏步。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '上下踏板',
        desc: '交替上下台阶或稳固踏板，脚掌踩实，身体保持直立。',
        duration: 180,
      },
      {
        name: '原地跑',
        desc: '原地轻跑或快走，手臂自然摆动，落地保持轻柔。',
        duration: 180,
      },
    ],
  },
  {
    name: '静态拉伸',
    tips: '每个动作保持三十秒，左右侧分开完成，呼吸放慢。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '左侧大腿前侧拉伸',
        desc: '站姿扶稳，左膝弯曲，左脚跟靠近臀部，保持骨盆中立。',
        duration: 30,
      },
      {
        name: '右侧大腿前侧拉伸',
        desc: '站姿扶稳，右膝弯曲，右脚跟靠近臀部，避免腰部前顶。',
        duration: 30,
      },
      {
        name: '蛙式内侧拉伸',
        desc: '前臂撑地，双膝打开，髋部向后坐，保持内侧温和拉伸。',
        duration: 30,
      },
      {
        name: '左侧小腿后侧拉伸',
        desc: '左脚向后踩远，脚跟压地，身体轻轻前移。',
        duration: 30,
      },
      {
        name: '右侧小腿后侧拉伸',
        desc: '右脚向后踩远，脚跟压地，保持后侧小腿拉长。',
        duration: 30,
      },
    ],
  },
];

const RAW_LEG_SLIMMING_SCULPT_PLAN: WorkoutPlan = [
  {
    name: '单侧力量',
    tips: '高阶计划适合已有训练基础的人；动作质量下降时减少幅度或暂停。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '左腿后撤弓步',
        desc: '左脚在前，右腿向后撤步下蹲，再推回站立，膝盖对准脚尖。',
        duration: 45,
      },
      {
        name: '右腿后撤弓步',
        desc: '右脚在前，左腿向后撤步下蹲，再推回站立，躯干保持直立。',
        duration: 45,
      },
      {
        name: '左侧单腿臀桥',
        desc: '左脚踩地，右脚搭在左膝上，臀部向上抬起再放下。',
        duration: 45,
      },
      {
        name: '右侧单腿臀桥',
        desc: '右脚踩地，左脚搭在右膝上，用臀部发力完成抬放。',
        duration: 45,
      },
      {
        name: '左侧保加利亚深蹲',
        desc: '右脚放在身后椅面，左腿主导下蹲再站起，保持骨盆平稳。',
        duration: 45,
      },
      {
        name: '右侧保加利亚深蹲',
        desc: '左脚放在身后椅面，右腿主导下蹲再站起，膝盖不要内扣。',
        duration: 45,
      },
      {
        name: '左侧蚌式支撑开合',
        desc: '左侧卧屈髋屈膝，双脚并拢，上侧膝盖打开再合回。',
        duration: 45,
      },
      {
        name: '右侧蚌式支撑开合',
        desc: '右侧卧屈髋屈膝，双脚并拢，上侧膝盖打开再合回。',
        duration: 45,
      },
    ],
  },
  {
    name: '塑形有氧',
    tips: '跳跃动作和原地踏步交替进行，落地轻柔，膝踝保持同向。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '开合跳',
        desc: '双脚开合跳动，双臂随节奏上举和放下，不能跳时改成开合踏步。',
        duration: 60,
      },
      {
        name: '原地踏步恢复',
        desc: '原地踏步放缓呼吸，手臂自然摆动，为下一组做准备。',
        duration: 60,
      },
      {
        name: '滑雪跳',
        desc: '左右斜向跳或跨步，髋部向后坐，保持身体稳定。',
        duration: 60,
      },
      {
        name: '原地踏步恢复',
        desc: '原地踏步放缓呼吸，脚掌轻落地，保持连续移动。',
        duration: 60,
      },
      {
        name: '提踵蹲跳',
        desc: '小幅下蹲后抬脚跟或轻跳，落地时膝盖顺着脚尖方向。',
        duration: 60,
      },
      {
        name: '原地踏步收尾',
        desc: '原地踏步，把呼吸和心率逐渐降下来。',
        duration: 60,
      },
    ],
  },
  {
    name: '拉伸收尾',
    tips: '重点放松大腿内侧、小腿和足部，动作不需要追求最大幅度。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '蝴蝶式体前屈',
        desc: '脚掌相对坐姿，身体从髋部前倾，保持背部尽量延展。',
        duration: 30,
      },
      {
        name: '左侧小腿后侧拉伸',
        desc: '左脚向后踩远，脚跟压地，身体轻轻前移。',
        duration: 30,
      },
      {
        name: '右侧小腿后侧拉伸',
        desc: '右脚向后踩远，脚跟压地，放松小腿后侧。',
        duration: 30,
      },
      {
        name: '左足底按摩',
        desc: '坐姿托住左脚，用拇指从脚跟到前脚掌缓慢按揉。',
        duration: 30,
      },
      {
        name: '右足底按摩',
        desc: '坐姿托住右脚，用拇指从脚跟到前脚掌缓慢按揉。',
        duration: 30,
      },
    ],
  },
];

export const LEG_SLIMMING_RELEASE_PLAN = withBuiltInPlanAudio(
  'planQ',
  RAW_LEG_SLIMMING_RELEASE_PLAN,
);

export const LEG_SLIMMING_BEGINNER_PLAN = withBuiltInPlanAudio(
  'planR',
  RAW_LEG_SLIMMING_BEGINNER_PLAN,
);

export const LEG_SLIMMING_SCULPT_PLAN = withBuiltInPlanAudio(
  'planS',
  RAW_LEG_SLIMMING_SCULPT_PLAN,
);
