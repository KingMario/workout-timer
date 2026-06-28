import { withBuiltInPlanAudio } from './built-in-plan-audio';
import type { WorkoutPlan } from './workout-plan';

const RAW_AGING_BACKWARDS_POSTURE_PLAN: WorkoutPlan = [
  {
    name: '姿态打开',
    tips: '动作保持缓慢和拉长，重点是让脊柱、胸腔和髋部重新展开。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '左臂向上延伸',
        desc: '站稳，左臂贴近耳侧向上伸长，肋骨不要外翻，感受身体左侧被拉长。',
        duration: 30,
      },
      {
        name: '右臂向上延伸',
        desc: '换右臂向上伸长，肩膀下沉，头顶和指尖同时向远处延展。',
        duration: 30,
      },
      {
        name: '左腿腿后侧伸展',
        desc: '左脚跟放在椅面或台阶上，膝盖微松，身体从髋部向前折叠。',
        duration: 30,
      },
      {
        name: '右腿腿后侧伸展',
        desc: '右脚跟放高，脊柱保持长，轻轻把胸口靠向大腿方向。',
        duration: 30,
      },
      {
        name: '左侧髂胫束伸展',
        desc: '左腿交叉到右腿后方，髋部向左推，身体向右侧延伸。',
        duration: 30,
      },
      {
        name: '右侧髂胫束伸展',
        desc: '右腿交叉到左腿后方，髋部向右推，保持外侧大腿有温和牵拉。',
        duration: 30,
      },
      {
        name: '婴儿式伸展',
        desc: '跪坐向脚跟，双臂向前伸，胸口放松靠近地面，后背自然展开。',
        duration: 60,
      },
      {
        name: '天鹅开胸',
        desc: '俯卧或站姿扶椅，胸腔向前上方打开，肩胛向后下方收。',
        duration: 45,
      },
      {
        name: '左侧弓步侧弯',
        desc: '左脚在前进入弓步，右臂向上越过头顶，拉长右侧腰和髋前侧。',
        duration: 30,
      },
      {
        name: '右侧弓步侧弯',
        desc: '右脚在前进入弓步，左臂向上越过头顶，保持骨盆稳定。',
        duration: 30,
      },
      {
        name: '左侧卧抬腿',
        desc: '右侧卧，左腿伸长后向上抬起再放下，骨盆不要向后翻。',
        duration: 45,
      },
      {
        name: '右侧卧抬腿',
        desc: '左侧卧，右腿伸长后平稳抬放，用臀部外侧发力。',
        duration: 45,
      },
      {
        name: '坐姿脊柱左旋',
        desc: '坐高，双手辅助身体向左旋转，脊柱保持向上延展。',
        duration: 30,
      },
      {
        name: '坐姿脊柱右旋',
        desc: '坐高，双手辅助身体向右旋转，避免塌腰或憋气。',
        duration: 30,
      },
      {
        name: '僵尸前伸',
        desc: '双臂向前平举，背部向后圆起，再慢慢回到直立，感受肩胛前后滑动。',
        duration: 45,
      },
    ],
  },
];

const RAW_AGING_BACKWARDS_WEIGHT_LOSS_PLAN: WorkoutPlan = [
  {
    name: '代谢唤醒',
    tips: '节奏保持连续但不急促，让大肌群参与，同时维持关节轻松。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '左腿站姿抬腿序列',
        desc: '扶椅站稳，左腿向前、向侧、向后小幅抬放，脚尖和膝盖保持同向。',
        duration: 60,
      },
      {
        name: '右腿站姿抬腿序列',
        desc: '换右腿完成向前、向侧、向后的抬放，躯干保持直立。',
        duration: 60,
      },
      {
        name: '芭蕾屈膝',
        desc: '双脚外开，膝盖顺着脚尖方向弯曲再伸直，脚跟稳定踩地。',
        duration: 60,
      },
      {
        name: '拔草左转',
        desc: '身体向左侧斜下方伸手，再用背部和腰腹力量拉回直立。',
        duration: 45,
      },
      {
        name: '拔草右转',
        desc: '身体向右侧斜下方伸手，再平稳拉回，保持膝盖柔软。',
        duration: 45,
      },
      {
        name: '站姿左侧弯',
        desc: '左手向下滑，右臂向上越过头顶，拉长右侧身体。',
        duration: 30,
      },
      {
        name: '站姿右侧弯',
        desc: '右手向下滑，左臂向上越过头顶，侧腰保持伸展。',
        duration: 30,
      },
      {
        name: '左斜向伸展',
        desc: '双臂向左上方伸出，身体形成长斜线，再回到中立。',
        duration: 45,
      },
      {
        name: '右斜向伸展',
        desc: '双臂向右上方伸出，保持脚底压稳，躯干主动拉长。',
        duration: 45,
      },
      {
        name: '腹部卷起',
        desc: '仰卧屈膝，呼气时上背轻轻卷起，吸气时慢慢放下。',
        duration: 60,
      },
      {
        name: '左侧南瓜弓步',
        desc: '左脚向侧前方跨步屈膝，双手顺势向下触碰，再推回站立。',
        duration: 45,
      },
      {
        name: '右侧南瓜弓步',
        desc: '右脚向侧前方跨步屈膝，臀部向后坐，再用脚底推回。',
        duration: 45,
      },
      {
        name: '左斜杠拉伸',
        desc: '身体向左上方拉长，再向右下方回收，像拉长一条斜线。',
        duration: 30,
      },
      {
        name: '右斜杠拉伸',
        desc: '身体向右上方拉长，再向左下方回收，动作保持顺滑。',
        duration: 30,
      },
    ],
  },
];

const RAW_AGING_BACKWARDS_JOINTS_PLAN: WorkoutPlan = [
  {
    name: '关节润滑',
    tips: '每个动作都控制在舒适范围，目标是让髋、膝、踝、肩和手腕更顺畅。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '左髋活动',
        desc: '扶椅站稳，左膝轻轻抬起并向外打开，再回到身体前方。',
        duration: 45,
      },
      {
        name: '右髋活动',
        desc: '换右膝抬起并向外打开，骨盆保持稳定，不要扭腰代偿。',
        duration: 45,
      },
      {
        name: '脚踝和膝盖活动',
        desc: '双脚踩稳，脚跟轻提再放下，膝盖随脚尖方向轻柔弯伸。',
        duration: 60,
      },
      {
        name: '左髋椅上伸展',
        desc: '左脚踝放到右大腿上方，身体从髋部前倾，保持背部延展。',
        duration: 45,
      },
      {
        name: '右髋椅上伸展',
        desc: '右脚踝放到左大腿上方，轻轻前倾，感受臀部深层放松。',
        duration: 45,
      },
      {
        name: '左大腿前侧伸展',
        desc: '左手扶住左脚背或裤脚，膝盖向下，髋部轻轻向前。',
        duration: 30,
      },
      {
        name: '右大腿前侧伸展',
        desc: '右手扶住右脚背或裤脚，保持身体直立，拉长大腿前侧。',
        duration: 30,
      },
      {
        name: '手指手腕展开',
        desc: '双手向前伸，手指张开再握拳，随后手腕缓慢画圈。',
        duration: 60,
      },
      {
        name: '肩和手腕串联',
        desc: '双臂前伸，肩胛向前推出再向后收，同时手腕轻轻旋转。',
        duration: 60,
      },
      {
        name: '脚跟抬起屈膝',
        desc: '双脚外开屈膝，脚跟轻轻抬起再放下，膝盖始终对准脚尖。',
        duration: 60,
      },
      {
        name: '擦桌子',
        desc: '双手想象按在桌面上，身体左右移动，肩胛和胸椎随动作滑动。',
        duration: 45,
      },
      {
        name: '擦窗户',
        desc: '双臂在身体前方大幅画弧，手腕柔软，肩膀保持下沉。',
        duration: 45,
      },
    ],
  },
];

const RAW_AGING_BACKWARDS_ENERGY_PLAN: WorkoutPlan = [
  {
    name: '能量激活',
    tips: '用脚底和腿部带动全身循环，动作轻快但不要冲击关节。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '扶椅脚步热身',
        desc: '双手轻扶椅背，脚跟交替抬起，像原地轻轻踏步。',
        duration: 60,
      },
      {
        name: '左小腿伸展',
        desc: '左脚向后踩远，脚跟压地，身体微微前移，感受小腿后侧拉长。',
        duration: 30,
      },
      {
        name: '右小腿伸展',
        desc: '右脚向后踩远，脚跟压地，膝盖伸直但不锁死。',
        duration: 30,
      },
      {
        name: '双脚脚跟抬放',
        desc: '双脚平行站立，脚跟抬起到舒适高度，再缓慢落回地面。',
        duration: 60,
      },
      {
        name: '左侧仰卧抬腿',
        desc: '仰卧，左腿伸直向上抬起再放下，腰背保持稳定贴近地面。',
        duration: 45,
      },
      {
        name: '右侧仰卧抬腿',
        desc: '换右腿伸直抬放，脚尖回勾，动作保持可控。',
        duration: 45,
      },
      {
        name: '左侧站姿抬腿',
        desc: '扶椅站稳，左腿向侧方抬起再放下，用臀部外侧发力。',
        duration: 45,
      },
      {
        name: '右侧站姿抬腿',
        desc: '扶椅站稳，右腿向侧方抬起再放下，身体不要倾斜。',
        duration: 45,
      },
      {
        name: '能量屈膝',
        desc: '双脚外开，连续完成小幅屈膝和伸膝，保持呼吸顺畅。',
        duration: 60,
      },
    ],
  },
];

const RAW_AGING_BACKWARDS_PAIN_RELIEF_PLAN: WorkoutPlan = [
  {
    name: '疼痛缓解',
    tips: '所有动作只做到温和拉伸感，疼痛加重时立即减小幅度或停止。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '腰部旋转',
        desc: '双脚站稳，骨盆和胸腔缓慢左右转动，手臂自然跟随摆动。',
        duration: 60,
      },
      {
        name: '手臂放松',
        desc: '双臂向前、向侧、向上轻柔摆动，肩膀保持下沉。',
        duration: 60,
      },
      {
        name: '左髋椅上放松',
        desc: '坐在椅上，左脚踝放到右大腿上，身体轻轻前倾。',
        duration: 45,
      },
      {
        name: '右髋椅上放松',
        desc: '坐在椅上，右脚踝放到左大腿上，保持呼吸放慢。',
        duration: 45,
      },
      {
        name: '左侧腰大肌椅上伸展',
        desc: '左腿向后放到椅侧或身后，髋部轻轻向前，胸口保持打开。',
        duration: 30,
      },
      {
        name: '右侧腰大肌椅上伸展',
        desc: '右腿向后放到椅侧或身后，感受髋前侧逐渐放松。',
        duration: 30,
      },
      {
        name: '左腿后侧和外侧伸展',
        desc: '左腿伸直放高，脚尖回勾，身体从髋部前倾并略向内侧转。',
        duration: 45,
      },
      {
        name: '右腿后侧和外侧伸展',
        desc: '右腿伸直放高，脊柱保持长，找到大腿后侧和外侧的牵拉。',
        duration: 45,
      },
      {
        name: '左小腿放松',
        desc: '左脚向后踩远，脚跟落地，身体重量慢慢向前移动。',
        duration: 30,
      },
      {
        name: '右小腿放松',
        desc: '右脚向后踩远，脚跟落地，保持小腿后侧有温和拉伸。',
        duration: 30,
      },
      {
        name: '左肩紧张释放',
        desc: '左臂横过胸前，右手轻扶左前臂，肩膀远离耳朵。',
        duration: 30,
      },
      {
        name: '右肩紧张释放',
        desc: '右臂横过胸前，左手轻扶右前臂，感受肩后侧放松。',
        duration: 30,
      },
      {
        name: '护膝屈膝',
        desc: '双脚外开，小幅屈膝再伸直，膝盖顺着脚尖方向移动。',
        duration: 60,
      },
      {
        name: '肩部激活序列',
        desc: '双臂从前方向两侧打开，再向上延伸，肩胛向后下方稳定。',
        duration: 60,
      },
    ],
  },
];

const RAW_AGING_BACKWARDS_BALANCE_PLAN: WorkoutPlan = [
  {
    name: '平衡训练',
    tips: '站在椅子旁边，必要时轻扶椅背，重点是脚踝和髋部的细小控制。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '左脚空中写字',
        desc: '站稳后抬起左脚，用脚尖在空中缓慢写字，动作从脚踝开始。',
        duration: 60,
      },
      {
        name: '右脚空中写字',
        desc: '换右脚在空中写字，支撑腿膝盖微松，身体保持高而稳。',
        duration: 60,
      },
      {
        name: '左腿单脚站立',
        desc: '左脚踩稳，右脚轻轻离地，眼睛看向前方固定一点。',
        duration: 45,
      },
      {
        name: '右腿单脚站立',
        desc: '右脚踩稳，左脚轻轻离地，必要时用指尖扶椅保持安全。',
        duration: 45,
      },
      {
        name: '脚跟脚尖转换',
        desc: '双脚站立，重心从脚跟缓慢移到前脚掌，再回到脚跟。',
        duration: 60,
      },
    ],
  },
];

const RAW_AGING_BACKWARDS_MOBILITY_PLAN: WorkoutPlan = [
  {
    name: '活动度提升',
    tips: '把动作做成流动的拉伸，持续探索可控范围，不要用惯性甩动。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '左腿时钟点地',
        desc: '右腿支撑，左脚依次向前、侧、后轻点地，像沿着钟面移动。',
        duration: 60,
      },
      {
        name: '右腿时钟点地',
        desc: '左腿支撑，右脚依次向前、侧、后轻点地，骨盆保持平稳。',
        duration: 60,
      },
      {
        name: '髋膝躯干屈膝',
        desc: '双脚外开屈膝，躯干轻轻左右转动，让髋和胸椎同时参与。',
        duration: 60,
      },
      {
        name: '坐姿腹股沟伸展',
        desc: '坐姿脚掌相对，膝盖自然向两侧打开，身体从髋部前倾。',
        duration: 45,
      },
      {
        name: '深侧弓步移动',
        desc: '双脚宽站，重心向左再向右移动，臀部向后坐，另一侧腿伸长。',
        duration: 60,
      },
      {
        name: '左臂八字绕环',
        desc: '左臂在身体前方画大八字，胸腔跟随旋转，肩膀保持放松。',
        duration: 45,
      },
      {
        name: '右臂八字绕环',
        desc: '右臂在身体前方画大八字，动作从肩胛和胸椎启动。',
        duration: 45,
      },
      {
        name: '脊柱逐节卷动',
        desc: '从头部开始慢慢向下卷脊柱，再从骨盆开始逐节回到直立。',
        duration: 60,
      },
      {
        name: '左侧斜向风车',
        desc: '左手向下寻找右脚方向，右臂向上打开，胸腔随之旋转。',
        duration: 45,
      },
      {
        name: '右侧斜向风车',
        desc: '右手向下寻找左脚方向，左臂向上打开，保持呼吸连续。',
        duration: 45,
      },
      {
        name: '左髋清理',
        desc: '扶椅站立，左膝抬起后向外绕圈，再回到身体前方。',
        duration: 45,
      },
      {
        name: '右髋清理',
        desc: '扶椅站立，右膝抬起后向外绕圈，避免身体左右晃动。',
        duration: 45,
      },
      {
        name: '左侧坐姿脊柱伸展',
        desc: '坐高，身体向左旋转，一手扶大腿一手扶椅背，脊柱向上延展。',
        duration: 30,
      },
      {
        name: '右侧坐姿脊柱伸展',
        desc: '坐高，身体向右旋转，保持肩膀放松和呼吸顺畅。',
        duration: 30,
      },
      {
        name: '左侧握脚外侧伸展',
        desc: '坐姿扶住左脚或小腿，腿向前伸长，轻轻牵拉大腿外侧。',
        duration: 30,
      },
      {
        name: '右侧握脚外侧伸展',
        desc: '坐姿扶住右脚或小腿，腿向前伸长，保持背部尽量挺直。',
        duration: 30,
      },
    ],
  },
];

const RAW_AGING_BACKWARDS_BONES_PLAN: WorkoutPlan = [
  {
    name: '骨骼保护',
    tips: '用站姿力量和伸展刺激骨骼，同时保持动作轻柔、稳定和可控。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '手臂力量激活',
        desc: '双臂向前、向侧、向上伸展，像推开空气一样主动用力。',
        duration: 60,
      },
      {
        name: '投球动作',
        desc: '一手向后蓄力再向前投出，躯干跟随旋转，左右自然交替。',
        duration: 60,
      },
      {
        name: '左斜向拉伸',
        desc: '双臂向左上方伸长，右脚踩稳，身体形成稳定斜线。',
        duration: 30,
      },
      {
        name: '右斜向拉伸',
        desc: '双臂向右上方伸长，左脚踩稳，胸口保持打开。',
        duration: 30,
      },
      {
        name: '星形站姿',
        desc: '双脚打开，双臂向两侧上方伸出，身体像星形一样向外扩展。',
        duration: 45,
      },
      {
        name: '扶椅脚步力量',
        desc: '扶椅站立，脚跟抬起再放下，脚趾和前脚掌主动压地。',
        duration: 60,
      },
      {
        name: '胫骨脚背激活',
        desc: '脚跟踩地，脚尖抬起再放下，感受小腿前侧参与。',
        duration: 60,
      },
      {
        name: '左髋骨力量',
        desc: '扶椅站立，左腿向侧方小幅抬起，脚跟向外推远。',
        duration: 45,
      },
      {
        name: '右髋骨力量',
        desc: '扶椅站立，右腿向侧方小幅抬起，身体保持直立。',
        duration: 45,
      },
      {
        name: '椅上手臂后侧',
        desc: '双手扶椅边，肘部向后弯曲再伸直，肩膀不要耸起。',
        duration: 45,
      },
      {
        name: '左腿站姿踢腿',
        desc: '扶椅站稳，左腿向前轻踢再收回，膝盖保持柔软。',
        duration: 45,
      },
      {
        name: '右腿站姿踢腿',
        desc: '扶椅站稳，右腿向前轻踢再收回，动作小而有控制。',
        duration: 45,
      },
      {
        name: '左髋站姿强化',
        desc: '左膝抬起后向外打开再回到前方，用髋部控制动作轨迹。',
        duration: 45,
      },
      {
        name: '右髋站姿强化',
        desc: '右膝抬起后向外打开再回到前方，支撑脚稳定压地。',
        duration: 45,
      },
      {
        name: '侧向和向上延伸',
        desc: '双臂交替向侧方和头顶延伸，想象脊柱被轻轻拉长。',
        duration: 60,
      },
    ],
  },
];

export const AGING_BACKWARDS_POSTURE_PLAN = withBuiltInPlanAudio(
  'planI',
  RAW_AGING_BACKWARDS_POSTURE_PLAN,
);

export const AGING_BACKWARDS_WEIGHT_LOSS_PLAN = withBuiltInPlanAudio(
  'planJ',
  RAW_AGING_BACKWARDS_WEIGHT_LOSS_PLAN,
);

export const AGING_BACKWARDS_JOINTS_PLAN = withBuiltInPlanAudio(
  'planK',
  RAW_AGING_BACKWARDS_JOINTS_PLAN,
);

export const AGING_BACKWARDS_ENERGY_PLAN = withBuiltInPlanAudio(
  'planL',
  RAW_AGING_BACKWARDS_ENERGY_PLAN,
);

export const AGING_BACKWARDS_PAIN_RELIEF_PLAN = withBuiltInPlanAudio(
  'planM',
  RAW_AGING_BACKWARDS_PAIN_RELIEF_PLAN,
);

export const AGING_BACKWARDS_BALANCE_PLAN = withBuiltInPlanAudio(
  'planN',
  RAW_AGING_BACKWARDS_BALANCE_PLAN,
);

export const AGING_BACKWARDS_MOBILITY_PLAN = withBuiltInPlanAudio(
  'planO',
  RAW_AGING_BACKWARDS_MOBILITY_PLAN,
);

export const AGING_BACKWARDS_BONES_PLAN = withBuiltInPlanAudio(
  'planP',
  RAW_AGING_BACKWARDS_BONES_PLAN,
);
