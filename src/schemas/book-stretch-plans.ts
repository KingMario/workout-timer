import { withBuiltInPlanAudio } from './built-in-plan-audio';
import type { WorkoutPlan } from './workout-plan';

const RAW_BOOK_FULL_BODY_STRETCH_PLAN: WorkoutPlan = [
  {
    name: '下肢动态唤醒',
    tips: '动作缓慢进入幅度，保持均匀呼吸，不要弹震或追求疼痛。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '臀部外侧动态拉伸 左侧',
        desc: '站立，抱住左侧小腿上部和脚踝，向左肩方向轻拉，腰背保持直立。',
        duration: 30,
      },
      {
        name: '臀部外侧动态拉伸 右侧',
        desc: '站立，抱住右侧小腿上部和脚踝，向右肩方向轻拉，腰背保持直立。',
        duration: 30,
      },
      {
        name: '臀部动态拉伸 左侧',
        desc: '站立，抱左膝向躯干方向轻拉，同时右脚踮起，再平稳落地。',
        duration: 30,
      },
      {
        name: '臀部动态拉伸 右侧',
        desc: '站立，抱右膝向躯干方向轻拉，同时左脚踮起，再平稳落地。',
        duration: 30,
      },
      {
        name: '竖叉动态拉伸 左侧',
        desc: '双手撑地，左腿伸直置于双手之间，右腿向后蹬直再还原。',
        duration: 30,
      },
      {
        name: '竖叉动态拉伸 右侧',
        desc: '双手撑地，右腿伸直置于双手之间，左腿向后蹬直再还原。',
        duration: 30,
      },
      {
        name: '交替前踢触脚尖',
        desc: '站姿直膝向前踢腿，对侧手顺势触碰脚尖，左右交替，背部保持挺直。',
        duration: 60,
      },
      {
        name: '蛙式动态拉伸',
        desc: '俯撑屈肘，双腿屈髋外展，呼气臀部向后坐，吸气回到前方。',
        duration: 60,
      },
    ],
  },
  {
    name: '上肢和躯干打开',
    tips: '肩颈保持放松，动作过程中不要耸肩，胸背都要打开。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '扩胸运动',
        desc: '屈肘抬臂与肩同高，双臂先向前伸直，再向两侧和身后打开，感受胸部伸展。',
        duration: 60,
      },
      {
        name: '双臂水平胸前移动',
        desc: '双臂侧平举，拳心朝前，双臂水平内收到胸前，再外展回到身体两侧。',
        duration: 60,
      },
      {
        name: '肩胛骨前伸后缩',
        desc: '双臂向前平举，肩胛骨同时向后夹紧，再同时向前推出，手臂保持伸直。',
        duration: 60,
      },
      {
        name: '肩部画圈',
        desc: '双肩同时向前、向上、向后、向下缓慢画圈，再反向完成。',
        duration: 60,
      },
      {
        name: '手腕旋转',
        desc: '肘关节弯曲，手指伸直分开，双手手腕缓慢绕环。',
        duration: 60,
      },
    ],
  },
  {
    name: '静态收尾',
    tips: '进入拉伸后放慢呼吸，每个动作保持到中等拉伸感即可。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '站姿屈髋肌拉伸 左侧',
        desc: '左腿向前跨成箭步，身体下降至右侧髋前方有拉伸感。',
        duration: 30,
      },
      {
        name: '站姿屈髋肌拉伸 右侧',
        desc: '右腿向前跨成箭步，身体下降至左侧髋前方有拉伸感。',
        duration: 30,
      },
      {
        name: '胸部拉伸',
        desc: '双手叉腰，肩部向后展开，双肘在身后逐渐靠拢，感受胸部打开。',
        duration: 60,
      },
      {
        name: '站姿颈部拉伸 左侧',
        desc: '左手轻扶头部向左侧侧倒，右肩保持放松，不要耸肩。',
        duration: 30,
      },
      {
        name: '站姿颈部拉伸 右侧',
        desc: '右手轻扶头部向右侧侧倒，左肩保持放松，不要耸肩。',
        duration: 30,
      },
      {
        name: '婴儿式',
        desc: '跪姿坐向脚跟，身体向前放松，双手向前伸展，感受背部放松。',
        duration: 60,
      },
      {
        name: '腹式呼吸',
        desc: '坐姿或仰卧，吸气腹部鼓起，呼气腹部回收，逐渐让身体安静下来。',
        duration: 60,
      },
    ],
  },
];

const RAW_BOOK_NECK_SHOULDER_RELIEF_PLAN: WorkoutPlan = [
  {
    name: '颈部减压',
    tips: '不要用力压头，保持肩部下沉，拉伸到中等感觉即可。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '站姿颈部拉伸 左侧',
        desc: '站直，左手绕过头顶轻扶右侧头部，把头轻拉向左侧。',
        duration: 30,
      },
      {
        name: '站姿颈部拉伸 右侧',
        desc: '站直，右手绕过头顶轻扶左侧头部，把头轻拉向右侧。',
        duration: 30,
      },
      {
        name: '坐姿颈部后侧拉伸 左侧',
        desc: '坐直，左手按住右侧头部，轻轻向左下方按压，感受颈后侧放松。',
        duration: 30,
      },
      {
        name: '坐姿颈部后侧拉伸 右侧',
        desc: '坐直，右手按住左侧头部，轻轻向右下方按压，感受颈后侧放松。',
        duration: 30,
      },
      {
        name: '坐姿颈部旋转拉伸 左侧',
        desc: '斜坐在椅子上，右手扶住椅背，头部缓慢向左侧旋转。',
        duration: 30,
      },
      {
        name: '坐姿颈部旋转拉伸 右侧',
        desc: '斜坐在椅子上，左手扶住椅背，头部缓慢向右侧旋转。',
        duration: 30,
      },
    ],
  },
  {
    name: '肩胛和肩关节活动',
    tips: '动作做慢，肩胛骨主动前伸后缩，避免耸肩代偿。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '手臂环绕',
        desc: '双手抬至胸前，手背相对，前臂由内向外摊开，掌心朝上后还原。',
        duration: 60,
      },
      {
        name: '肩部画圈',
        desc: '两侧肩胛骨同时向前伸并上提，再向后缩并下降，缓慢画圈。',
        duration: 60,
      },
      {
        name: '肩外展运动',
        desc: '双臂伸直，在下腹前交叉，再向两侧外展并于头顶上方交叉。',
        duration: 60,
      },
      {
        name: '肩部向前绕环',
        desc: '双手搭肩，肘关节向下、后、上、前依次画圈，幅度逐渐打开。',
        duration: 60,
      },
    ],
  },
  {
    name: '胸背平衡放松',
    tips: '胸部打开后，再做肩后侧和上背部放松，帮助抵消久坐圆肩。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '站姿三角肌后束拉伸 左侧',
        desc: '左臂伸直平举到身体右侧，右手托住左前臂向身体方向轻拉。',
        duration: 30,
      },
      {
        name: '站姿三角肌后束拉伸 右侧',
        desc: '右臂伸直平举到身体左侧，左手托住右前臂向身体方向轻拉。',
        duration: 30,
      },
      {
        name: '单侧肩部拉伸 左侧',
        desc: '左臂向身体右侧平举，右手握住左手腕轻拉，肩外侧有拉伸感即可。',
        duration: 30,
      },
      {
        name: '单侧肩部拉伸 右侧',
        desc: '右臂向身体左侧平举，左手握住右手腕轻拉，肩外侧有拉伸感即可。',
        duration: 30,
      },
      {
        name: '坐姿上背部拉伸',
        desc: '坐直，双臂向前伸直，十指交叉掌心向外，弓起上背并向前伸展。',
        duration: 60,
      },
    ],
  },
];

const RAW_BOOK_LOWER_BACK_RELIEF_PLAN: WorkoutPlan = [
  {
    name: '腰背动态活动',
    tips: '先用温和动态动作让腰背进入状态，不做突然发力。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '下背部动态拉伸',
        desc: '仰卧屈髋屈膝，双膝抱向胸前，身体顺势前后轻柔滚动。',
        duration: 60,
      },
      {
        name: '俯身转体',
        desc: '站姿俯身约四十五度，双手置于下腰背，躯干向左右交替转动。',
        duration: 60,
      },
      {
        name: '站姿骨盆倾斜',
        desc: '站直双手叉腰，先骨盆前倾，再臀部收缩顶髋做骨盆后倾。',
        duration: 60,
      },
      {
        name: '猫式拉伸',
        desc: '四足跪姿，吸气腹部向下头上抬，呼气上背拱起并低头。',
        duration: 60,
      },
    ],
  },
  {
    name: '髋腰侧链拉伸',
    tips: '腰背紧张常和髋前侧、侧腰、背阔肌有关，动作保持稳定。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '髂腰肌拉伸 左侧',
        desc: '左腿在前成弓步，身体向左侧缓慢旋转，感受左侧髂腰肌拉伸。',
        duration: 30,
      },
      {
        name: '髂腰肌拉伸 右侧',
        desc: '右腿在前成弓步，身体向右侧缓慢旋转，感受右侧髂腰肌拉伸。',
        duration: 30,
      },
      {
        name: '弓步侧向拉伸 左侧',
        desc: '左腿在前成弓步，右手向上伸展，躯干向左侧侧屈。',
        duration: 30,
      },
      {
        name: '弓步侧向拉伸 右侧',
        desc: '右腿在前成弓步，左手向上伸展，躯干向右侧侧屈。',
        duration: 30,
      },
      {
        name: '腰背部拉伸 左侧',
        desc: '站姿双手叉腰，躯干保持挺直并转向左侧，感受右侧腰部拉伸。',
        duration: 30,
      },
      {
        name: '腰背部拉伸 右侧',
        desc: '站姿双手叉腰，躯干保持挺直并转向右侧，感受左侧腰部拉伸。',
        duration: 30,
      },
    ],
  },
  {
    name: '地面放松',
    tips: '最后进入静态放松，呼吸放慢，腰背不要硬撑。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '跪姿背部拉伸 左侧',
        desc: '跪坐后俯身，双手向左侧前伸，躯干向左侧屈。',
        duration: 30,
      },
      {
        name: '跪姿背部拉伸 右侧',
        desc: '跪坐后俯身，双手向右侧前伸，躯干向右侧屈。',
        duration: 30,
      },
      {
        name: '婴儿式',
        desc: '跪姿坐向脚跟，身体向前放松，前臂贴近垫面，感受背部放松。',
        duration: 60,
      },
      {
        name: '仰卧扭转拉伸 左侧',
        desc: '仰卧，右腿屈膝跨向左侧，左手轻压右膝，右侧肩背尽量贴地。',
        duration: 30,
      },
      {
        name: '仰卧扭转拉伸 右侧',
        desc: '仰卧，左腿屈膝跨向右侧，右手轻压左膝，左侧肩背尽量贴地。',
        duration: 30,
      },
    ],
  },
];

const RAW_BOOK_RUNNER_RECOVERY_PLAN: WorkoutPlan = [
  {
    name: '跑后动态降温',
    tips: '先让心率平稳下降，动作轻柔，不追求速度。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '臀部外侧动态拉伸 左侧',
        desc: '站立抱住左侧小腿上部和脚踝，向左肩方向轻拉。',
        duration: 30,
      },
      {
        name: '臀部外侧动态拉伸 右侧',
        desc: '站立抱住右侧小腿上部和脚踝，向右肩方向轻拉。',
        duration: 30,
      },
      {
        name: '交替前踢触脚尖',
        desc: '直膝向前踢腿，手顺势触碰脚尖，左右交替，背部保持挺直。',
        duration: 60,
      },
      {
        name: '交替侧弓步',
        desc: '双脚分开，身体重心左右平移进入侧弓步，感受内收肌拉伸。',
        duration: 60,
      },
      {
        name: '前后踮脚尖',
        desc: '站直，重心从前脚掌过渡到脚后跟，连续完成，活动小腿和脚踝。',
        duration: 60,
      },
      {
        name: '前后摆腿 左侧',
        desc: '扶住椅背，左腿支撑站稳，右腿直膝前后摆动。',
        duration: 30,
      },
      {
        name: '前后摆腿 右侧',
        desc: '扶住椅背，右腿支撑站稳，左腿直膝前后摆动。',
        duration: 30,
      },
    ],
  },
  {
    name: '髋前侧和躯干恢复',
    tips: '跑后髋前侧容易紧，保持骨盆稳定，不要塌腰代偿。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '跪姿屈髋肌拉伸 左侧',
        desc: '左腿在前成跪姿弓步，身体重心前移，右侧髋前方充分伸展。',
        duration: 30,
      },
      {
        name: '跪姿屈髋肌拉伸 右侧',
        desc: '右腿在前成跪姿弓步，身体重心前移，左侧髋前方充分伸展。',
        duration: 30,
      },
      {
        name: '俯卧腹部拉伸',
        desc: '俯卧双手置于肩旁，手臂撑起上半身，髋部和下肢尽量不离地。',
        duration: 60,
      },
      {
        name: '站姿侧屈 左侧',
        desc: '左手臂举过头顶，带动躯干向右侧侧屈，感受左侧腹部拉伸。',
        duration: 30,
      },
      {
        name: '站姿侧屈 右侧',
        desc: '右手臂举过头顶，带动躯干向左侧侧屈，感受右侧腹部拉伸。',
        duration: 30,
      },
      {
        name: '麻花式拉伸 左侧',
        desc: '左侧卧，左腿向后屈膝，右手拉住左脚踝，感受左侧大腿前侧和臀部放松。',
        duration: 30,
      },
      {
        name: '麻花式拉伸 右侧',
        desc: '右侧卧，右腿向后屈膝，左手拉住右脚踝，感受右侧大腿前侧和臀部放松。',
        duration: 30,
      },
      {
        name: '站姿四字臀部拉伸 左侧',
        desc: '左脚踝放在右膝上方，右腿缓慢下蹲，保持躯干挺直。',
        duration: 30,
      },
      {
        name: '站姿四字臀部拉伸 右侧',
        desc: '右脚踝放在左膝上方，左腿缓慢下蹲，保持躯干挺直。',
        duration: 30,
      },
    ],
  },
  {
    name: '腿后侧和小腿静态拉伸',
    tips: '最后拉伸腘绳肌、小腿和足踝，保持均匀呼吸。',
    allowRounds: false,
    defaultRounds: 1,
    maxRounds: 1,
    steps: [
      {
        name: '仰卧交替直腿抬腿 左侧',
        desc: '仰卧，左腿抬起并轻抱向身体，右腿伸直贴地。',
        duration: 30,
      },
      {
        name: '仰卧交替直腿抬腿 右侧',
        desc: '仰卧，右腿抬起并轻抱向身体，左腿伸直贴地。',
        duration: 30,
      },
      {
        name: '抱腿体前屈',
        desc: '坐姿双腿并拢伸直，双手抱于膝后，躯干向大腿方向靠近。',
        duration: 60,
      },
      {
        name: '坐姿小腿拉伸 左侧',
        desc: '坐姿伸直左腿，手轻抓脚尖向身体方向拉，膝关节不要弯曲。',
        duration: 30,
      },
      {
        name: '坐姿小腿拉伸 右侧',
        desc: '坐姿伸直右腿，手轻抓脚尖向身体方向拉，膝关节不要弯曲。',
        duration: 30,
      },
      {
        name: '踝关节动态屈伸',
        desc: '坐姿双腿伸直，脚尖先绷直，再向身体方向勾起，缓慢重复。',
        duration: 60,
      },
      {
        name: '腹式呼吸',
        desc: '坐姿或仰卧，吸气腹部鼓起，呼气腹部回收，让身体彻底降下来。',
        duration: 60,
      },
    ],
  },
];

export const BOOK_FULL_BODY_STRETCH_PLAN = withBuiltInPlanAudio(
  'planE',
  RAW_BOOK_FULL_BODY_STRETCH_PLAN,
);

export const BOOK_NECK_SHOULDER_RELIEF_PLAN = withBuiltInPlanAudio(
  'planF',
  RAW_BOOK_NECK_SHOULDER_RELIEF_PLAN,
);

export const BOOK_LOWER_BACK_RELIEF_PLAN = withBuiltInPlanAudio(
  'planG',
  RAW_BOOK_LOWER_BACK_RELIEF_PLAN,
);

export const BOOK_RUNNER_RECOVERY_PLAN = withBuiltInPlanAudio(
  'planH',
  RAW_BOOK_RUNNER_RECOVERY_PLAN,
);
