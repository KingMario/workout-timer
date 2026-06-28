import { describe, expect, it } from 'vitest';
import { BUILT_IN_PLANS } from '.';
import {
  getBuiltInSectionAudioPath,
  getBuiltInStepAudioPath,
  getBuiltInStepNameAudioPath,
  withBuiltInPlanAudio,
} from './built-in-plan-audio';
import { DEFAULT_PLAN } from './default-plan';
import type { WorkoutPlan } from './workout-plan';

describe('built-in plan audio helpers', () => {
  it('builds section and exercise audio paths from plan structure', () => {
    expect(getBuiltInSectionAudioPath('planA', 0)).toBe(
      'audio/built-in-plans/yunxi/planA-s1.mp3',
    );
    expect(getBuiltInStepAudioPath('planA', 0, 0)).toBe(
      'audio/built-in-plans/yunxi/planA-s1-e1.mp3',
    );
    expect(getBuiltInStepNameAudioPath('planA', 0, 0)).toBe(
      'audio/built-in-plans/yunxi/planA-s1-e1-name.mp3',
    );
  });

  it('adds structured audio paths without mutating the source plan', () => {
    const rawPlan: WorkoutPlan = [
      {
        name: '阶段',
        tips: '提示',
        allowRounds: false,
        defaultRounds: 1,
        maxRounds: 1,
        steps: [{ name: '动作', desc: '说明', duration: 30 }],
      },
    ];

    const withAudio = withBuiltInPlanAudio('planB', rawPlan);

    expect(withAudio[0].audio).toBe('audio/built-in-plans/yunxi/planB-s1.mp3');
    expect(withAudio[0].steps[0].audio).toBe(
      'audio/built-in-plans/yunxi/planB-s1-e1.mp3',
    );
    expect(withAudio[0].steps[0].nameAudio).toBe(
      'audio/built-in-plans/yunxi/planB-s1-e1-name.mp3',
    );
    expect(rawPlan[0].audio).toBeUndefined();
    expect(rawPlan[0].steps[0].audio).toBeUndefined();
    expect(rawPlan[0].steps[0].nameAudio).toBeUndefined();
  });

  it('exports default workout steps with structured audio paths', () => {
    expect(DEFAULT_PLAN[0].audio).toBe(
      'audio/built-in-plans/yunxi/planA-s1.mp3',
    );
    expect(DEFAULT_PLAN[0].steps[0].audio).toBe(
      'audio/built-in-plans/yunxi/planA-s1-e1.mp3',
    );
    expect(DEFAULT_PLAN[0].steps[0].nameAudio).toBe(
      'audio/built-in-plans/yunxi/planA-s1-e1-name.mp3',
    );
    expect(DEFAULT_PLAN[1].steps[9].audio).toBe(
      'audio/built-in-plans/yunxi/planA-s2-e10.mp3',
    );
  });

  it('registers book-derived stretch plans as built-in plans with structured audio', () => {
    const planIds = BUILT_IN_PLANS.map((plan) => plan.id);

    expect(planIds).toContain('book-full-body-stretch');
    expect(planIds).toContain('book-neck-shoulder-relief');
    expect(planIds).toContain('book-lower-back-relief');
    expect(planIds).toContain('book-runner-recovery');

    const fullBody = BUILT_IN_PLANS.find(
      (plan) => plan.id === 'book-full-body-stretch',
    );

    expect(fullBody?.data[0].audio).toBe(
      'audio/built-in-plans/yunxi/planE-s1.mp3',
    );
    expect(fullBody?.data[2].steps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: '站姿屈髋肌拉伸 左侧' }),
        expect.objectContaining({ name: '站姿屈髋肌拉伸 右侧' }),
      ]),
    );
    expect(
      fullBody?.data
        .flatMap((section) => section.steps)
        .map((step) => step.desc),
    ).not.toEqual(
      expect.arrayContaining([expect.stringContaining('各半时间')]),
    );
  });
});
