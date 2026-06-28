import type { WorkoutPlan } from './workout-plan';

export type BuiltInPlanAudioKey =
  | 'planA'
  | 'planB'
  | 'planC'
  | 'planD'
  | 'planE'
  | 'planF'
  | 'planG'
  | 'planH'
  | 'planI'
  | 'planJ'
  | 'planK'
  | 'planL'
  | 'planM'
  | 'planN'
  | 'planO'
  | 'planP'
  | 'planQ'
  | 'planR'
  | 'planS';

const BUILT_IN_AUDIO_BASE_PATH = 'audio/built-in-plans/yunxi';

export const getBuiltInAudioAssetPath = (filename: string) =>
  `${BUILT_IN_AUDIO_BASE_PATH}/${filename}`;

export const getBuiltInSectionAudioPath = (
  planKey: BuiltInPlanAudioKey,
  sectionIndex: number,
) => getBuiltInAudioAssetPath(`${planKey}-s${sectionIndex + 1}.mp3`);

export const getBuiltInStepAudioPath = (
  planKey: BuiltInPlanAudioKey,
  sectionIndex: number,
  stepIndex: number,
) =>
  getBuiltInAudioAssetPath(
    `${planKey}-s${sectionIndex + 1}-e${stepIndex + 1}.mp3`,
  );

export const getBuiltInStepNameAudioPath = (
  planKey: BuiltInPlanAudioKey,
  sectionIndex: number,
  stepIndex: number,
) =>
  getBuiltInAudioAssetPath(
    `${planKey}-s${sectionIndex + 1}-e${stepIndex + 1}-name.mp3`,
  );

export const withBuiltInPlanAudio = (
  planKey: BuiltInPlanAudioKey,
  plan: WorkoutPlan,
): WorkoutPlan =>
  plan.map((section, sectionIndex) => ({
    ...section,
    audio: getBuiltInSectionAudioPath(planKey, sectionIndex),
    steps: section.steps.map((step, stepIndex) => ({
      ...step,
      nameAudio: getBuiltInStepNameAudioPath(planKey, sectionIndex, stepIndex),
      audio: getBuiltInStepAudioPath(planKey, sectionIndex, stepIndex),
    })),
  }));
