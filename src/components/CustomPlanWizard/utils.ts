import { z } from 'zod';
import { getJsonSchemaString } from '../../schemas/workout-plan';

export const GENDER_OPTIONS = [
  { value: 'Male', label: '男 (Male)' },
  { value: 'Female', label: '女 (Female)' },
  { value: 'Private', label: '保密 (Private)' },
];

export const LEVEL_OPTIONS = [
  { value: 'Beginner', label: '初学者 (Beginner)' },
  { value: 'Intermediate', label: '中级/进阶 (Intermediate)' },
  { value: 'Advanced', label: '高级/高阶 (Advanced)' },
];

export const GOAL_OPTIONS = [
  { value: 'Fat loss', label: '减脂 (Fat loss)' },
  { value: 'Mobility', label: '灵活性 (Mobility)' },
  { value: 'Strength', label: '力量 (Strength)' },
  { value: 'General health', label: '综合健康 (General health)' },
  { value: 'Stress relief', label: '缓解压力 (Stress relief)' },
];

export const FREQUENCY_OPTIONS = [
  { value: 'Every weekday', label: '每个工作日 (Every weekday)' },
  { value: 'Every day', label: '每天 (Every day)' },
  { value: '3 times a week', label: '每周3次 (3 times a week)' },
  { value: '4 times a week', label: '每周4次 (4 times a week)' },
  { value: 'Weekend warrior', label: '周末突击 (Weekend warrior)' },
];

export const STYLE_OPTIONS = [
  {
    value: 'Calm & Mobility-focused',
    label: '平静/灵活 (Calm & Mobility-focused)',
  },
  { value: 'Energetic & Sweaty', label: '活力/暴汗 (Energetic & Sweaty)' },
  { value: 'Strength-biased', label: '力量偏向 (Strength-biased)' },
  { value: 'Other', label: '其他 (Other)' },
];

export const FormDataSchema = z.object({
  duration: z
    .string()
    .min(1, '请输入时长')
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num >= 1 && num <= 300;
    }, '时长建议在 1-300 分钟内'),
  age: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) {
        return true;
      }
      const num = Number(val);
      return !isNaN(num) && Number.isInteger(num) && num >= 5 && num <= 120;
    }, '年龄须在 5-120 岁之间'),
  gender: z.string().optional(),
  height: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) {
        return true;
      }
      const num = Number(val);
      return !isNaN(num) && num >= 50 && num <= 250;
    }, '身高须在 50-250 厘米之间'),
  weight: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) {
        return true;
      }
      const num = Number(val);
      return !isNaN(num) && num >= 20 && num <= 300;
    }, '体重须在 20-300 公斤之间'),
  injuries: z.string().optional(),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  goal: z.string().min(1, '请输入目标'),
  frequency: z.string().min(1, '请输入频率'),
  style: z.string().min(1, '请输入风格'),
  styleOther: z.string().optional(),
  preferences: z.string().optional(),
});

export type FormData = z.infer<typeof FormDataSchema>;

export const DEFAULT_FORM_VALUES: FormData = {
  duration: '20',
  age: '',
  gender: 'Private',
  height: '',
  weight: '',
  injuries: '',
  level: 'Beginner',
  goal: 'Fat loss',
  frequency: 'Every weekday',
  style: 'Calm & Mobility-focused',
  styleOther: '',
  preferences: '',
};

export const generatePromptFromData = (data: FormData) => {
  const finalStyle =
    data.style === 'Other' ? data.styleOther || 'Unspecified' : data.style;

  const codeBlockStart = '```json';
  const codeBlockEnd = '```';

  return `设计一套 ${data.duration} 分钟的居家健身方案，无需器械。包含活动性训练、轻量力量训练和有氧运动，并安排快速放松环节。请随时询问任何需要了解的信息，以便优化方案。
下面是我的个人信息：
1. 基本信息: 
   - 性别: ${data.gender || '保密'}
   - 年龄: ${data.age || '保密'}
   - 身高: ${data.height ? data.height + 'cm' : '保密'}
   - 体重: ${data.weight ? data.weight + 'kg' : '保密'}
2. 伤病/关节问题: ${data.injuries || '无'}
3. 级别: ${data.level}
4. 主要目标: ${data.goal}
5. 计划频率: ${data.frequency || '未指定'}
6. 偏好风格: ${finalStyle}
7. 偏好/讨厌的动作: ${data.preferences || '无'}

请输出符合如下 JSON Schema 的健身计划:
${codeBlockStart}
${getJsonSchemaString()}
${codeBlockEnd}
重要要求：
1. 请只返回 JSON 代码块，不要包含任何其他解释文本、Markdown 标题等。
2. JSON 内所有的文本内容（如阶段的 \`name\` 和 \`tips\`，动作的 \`name\` 和 \`desc\`）**必须全是纯中文**（绝不要夹杂任何个别英文单词）。
3. 由于所有的文字将完全用于中文语音(TTS)的口语播报，请**绝对不可以**使用英文字母来指代动作的肢体形状（如 Y字、W字、T型 等等，这会让发音表现极其生硬）。遇到这类情况，请务必使用中国人的本土化体态比喻或音译！例如：请将形如“W字”替换描述为“达不溜字”或者“双臂内收呈波浪”，将“Y字”替换描述为“上八字形”或者“双臂向上斜伸”，将“T字”替换为“双臂向两侧平举成一字”。通过这些自然连贯的描述，让语音教练听起来足够专业和有温度！`;
};
