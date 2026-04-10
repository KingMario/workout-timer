import { describe, expect, it } from 'vitest';
import type { FormData } from './utils';
import {
  DEFAULT_FORM_VALUES,
  FormDataSchema,
  generatePromptFromData,
} from './utils';

// ─── FormDataSchema validation ───────────────────────────────────────────────

describe('FormDataSchema – duration', () => {
  const base = { ...DEFAULT_FORM_VALUES };

  it('accepts valid duration', () => {
    expect(FormDataSchema.safeParse({ ...base, duration: '30' }).success).toBe(
      true,
    );
    expect(FormDataSchema.safeParse({ ...base, duration: '1' }).success).toBe(
      true,
    );
    expect(FormDataSchema.safeParse({ ...base, duration: '300' }).success).toBe(
      true,
    );
  });

  it('rejects empty duration', () => {
    const r = FormDataSchema.safeParse({ ...base, duration: '' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0].message).toBe('请输入时长');
    }
  });

  it('rejects duration < 1', () => {
    const r = FormDataSchema.safeParse({ ...base, duration: '0' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0].message).toBe('时长建议在 1-300 分钟内');
    }
  });

  it('rejects duration > 300', () => {
    const r = FormDataSchema.safeParse({ ...base, duration: '301' });
    expect(r.success).toBe(false);
  });
});

describe('FormDataSchema – age (optional)', () => {
  const base = { ...DEFAULT_FORM_VALUES };

  it('accepts empty age', () => {
    expect(FormDataSchema.safeParse({ ...base, age: '' }).success).toBe(true);
    expect(FormDataSchema.safeParse({ ...base, age: undefined }).success).toBe(
      true,
    );
  });

  it('accepts valid age', () => {
    expect(FormDataSchema.safeParse({ ...base, age: '5' }).success).toBe(true);
    expect(FormDataSchema.safeParse({ ...base, age: '25' }).success).toBe(true);
    expect(FormDataSchema.safeParse({ ...base, age: '120' }).success).toBe(
      true,
    );
  });

  it('rejects age < 5', () => {
    const r = FormDataSchema.safeParse({ ...base, age: '4' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0].message).toBe('年龄须在 5-120 岁之间');
    }
  });

  it('rejects age > 120', () => {
    const r = FormDataSchema.safeParse({ ...base, age: '121' });
    expect(r.success).toBe(false);
  });

  it('rejects non-integer age', () => {
    const r = FormDataSchema.safeParse({ ...base, age: '25.5' });
    expect(r.success).toBe(false);
  });
});

describe('FormDataSchema – height (optional)', () => {
  const base = { ...DEFAULT_FORM_VALUES };

  it('accepts empty height', () => {
    expect(FormDataSchema.safeParse({ ...base, height: '' }).success).toBe(
      true,
    );
  });

  it('accepts valid height', () => {
    expect(FormDataSchema.safeParse({ ...base, height: '170' }).success).toBe(
      true,
    );
    expect(FormDataSchema.safeParse({ ...base, height: '50' }).success).toBe(
      true,
    );
    expect(FormDataSchema.safeParse({ ...base, height: '250' }).success).toBe(
      true,
    );
  });

  it('rejects height < 50', () => {
    const r = FormDataSchema.safeParse({ ...base, height: '49' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0].message).toBe('身高须在 50-250 厘米之间');
    }
  });

  it('rejects height > 250', () => {
    const r = FormDataSchema.safeParse({ ...base, height: '251' });
    expect(r.success).toBe(false);
  });
});

describe('FormDataSchema – weight (optional)', () => {
  const base = { ...DEFAULT_FORM_VALUES };

  it('accepts empty weight', () => {
    expect(FormDataSchema.safeParse({ ...base, weight: '' }).success).toBe(
      true,
    );
  });

  it('accepts valid weight', () => {
    expect(FormDataSchema.safeParse({ ...base, weight: '60' }).success).toBe(
      true,
    );
    expect(FormDataSchema.safeParse({ ...base, weight: '20' }).success).toBe(
      true,
    );
    expect(FormDataSchema.safeParse({ ...base, weight: '300' }).success).toBe(
      true,
    );
  });

  it('rejects weight < 20', () => {
    const r = FormDataSchema.safeParse({ ...base, weight: '19' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0].message).toBe('体重须在 20-300 公斤之间');
    }
  });

  it('rejects weight > 300', () => {
    const r = FormDataSchema.safeParse({ ...base, weight: '301' });
    expect(r.success).toBe(false);
  });
});

// ─── generatePromptFromData ──────────────────────────────────────────────────

describe('generatePromptFromData', () => {
  const baseData: FormData = {
    duration: '30',
    age: '25',
    gender: 'Male',
    height: '175',
    weight: '70',
    injuries: '膝盖酸痛',
    level: 'Intermediate',
    goal: 'Fat loss',
    frequency: 'Every weekday',
    style: 'Energetic & Sweaty',
    styleOther: '',
    preferences: '不喜欢波比跳',
  };

  it('includes duration in the prompt', () => {
    const prompt = generatePromptFromData(baseData);
    expect(prompt).toContain('30 分钟');
  });

  it('includes personal info', () => {
    const prompt = generatePromptFromData(baseData);
    expect(prompt).toContain('Male');
    expect(prompt).toContain('25');
    expect(prompt).toContain('175cm');
    expect(prompt).toContain('70kg');
  });

  it('includes injuries section', () => {
    const prompt = generatePromptFromData(baseData);
    expect(prompt).toContain('膝盖酸痛');
  });

  it('includes level and goal', () => {
    const prompt = generatePromptFromData(baseData);
    expect(prompt).toContain('Intermediate');
    expect(prompt).toContain('Fat loss');
  });

  it('includes preferences', () => {
    const prompt = generatePromptFromData(baseData);
    expect(prompt).toContain('不喜欢波比跳');
  });

  it('uses "Other" style override when style is Other', () => {
    const data: FormData = {
      ...baseData,
      style: 'Other',
      styleOther: '某种特殊风格',
    };
    const prompt = generatePromptFromData(data);
    expect(prompt).toContain('某种特殊风格');
  });

  it('falls back to "Unspecified" when styleOther is empty', () => {
    const data: FormData = { ...baseData, style: 'Other', styleOther: '' };
    const prompt = generatePromptFromData(data);
    expect(prompt).toContain('Unspecified');
  });

  it('uses "保密" for unknown/empty personal fields', () => {
    const data: FormData = {
      ...baseData,
      age: '',
      gender: '',
      height: '',
      weight: '',
      injuries: '',
      preferences: '',
    };
    const prompt = generatePromptFromData(data);
    // Empty optional fields should show 保密 or 无
    expect(prompt).toContain('保密');
    expect(prompt).toContain('无');
  });

  it('contains JSON schema block', () => {
    const prompt = generatePromptFromData(baseData);
    expect(prompt).toContain('```json');
  });

  it('contains TTS-friendly instruction about Chinese-only output', () => {
    const prompt = generatePromptFromData(baseData);
    expect(prompt).toContain('纯中文');
  });
});
