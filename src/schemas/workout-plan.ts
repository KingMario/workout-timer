import { z } from 'zod';

export const StepSchema = z.object({
  name: z.string().describe('动作名称'),
  desc: z.string().describe('动作简要描述'),
  duration: z.number().min(1).describe('持续时间(秒)'),
});

export const SectionSchema = z.object({
  name: z.string().describe('阶段名称 (如: 热身, 力量训练, 有氧, 放松)'),
  tips: z.string().describe('该阶段的提示或注意事项'),
  allowRounds: z.boolean().describe('是否允许循环多组'),
  defaultRounds: z.number().min(1).describe('默认循环组数'),
  maxRounds: z.number().min(1).describe('最大建议循环组数'),
  steps: z.array(StepSchema).describe('该阶段包含的动作列表'),
});

export const WorkoutPlanSchema = z
  .array(SectionSchema)
  .describe('完整的健身计划，包含多个阶段');

export type WorkoutPlan = z.infer<typeof WorkoutPlanSchema>;

// Helper to generate a friendly JSON schema string for the prompt
export const getJsonSchemaString = () => {
  // Simplified manual schema string to ensure the LLM understands it easily without extra noise
  return JSON.stringify(
    [
      {
        name: 'string (Phase Name)',
        tips: 'string (Tips)',
        allowRounds: 'boolean',
        defaultRounds: 'number (integer)',
        maxRounds: 'number (integer)',
        steps: [
          {
            name: 'string',
            desc: 'string',
            duration: 'number (seconds)',
          },
        ],
      },
    ],
    null,
    2,
  );
};
