import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = process.cwd();
const AUDIO_DIR = path.join(ROOT, 'public/audio/built-in-plans/yunxi');
const PUBLIC_AUDIO_DIR = 'audio/built-in-plans/yunxi';
const SHOULD_RENAME = process.argv.includes('--rename');

const PLAN_MODULES = [
  {
    key: 'planA',
    id: 'default-workout',
    title: '系统默认计划',
    file: 'src/schemas/default-plan.ts',
    exportName: 'DEFAULT_PLAN',
  },
  {
    key: 'planB',
    id: 'seated-workout',
    title: '坐姿锻炼计划',
    file: 'src/schemas/seated-workout-plan.ts',
    exportName: 'SEATED_WORKOUT_PLAN',
  },
  {
    key: 'planC',
    id: 'break-plan',
    title: '间歇拉伸计划',
    file: 'src/schemas/break-plan.ts',
    exportName: 'BREAK_PLAN',
  },
  {
    key: 'planD',
    id: 'mckenzie',
    title: '麦肯基疗法',
    file: 'src/schemas/mckenzie-plan.ts',
    exportName: 'MCKENZIE_PLAN',
  },
  {
    key: 'planE',
    id: 'book-full-body-stretch',
    title: '全身动态拉伸',
    file: 'src/schemas/book-stretch-plans.ts',
    exportName: 'BOOK_FULL_BODY_STRETCH_PLAN',
  },
  {
    key: 'planF',
    id: 'book-neck-shoulder-relief',
    title: '肩颈压力缓解',
    file: 'src/schemas/book-stretch-plans.ts',
    exportName: 'BOOK_NECK_SHOULDER_RELIEF_PLAN',
  },
  {
    key: 'planG',
    id: 'book-lower-back-relief',
    title: '下腰背放松',
    file: 'src/schemas/book-stretch-plans.ts',
    exportName: 'BOOK_LOWER_BACK_RELIEF_PLAN',
  },
  {
    key: 'planH',
    id: 'book-runner-recovery',
    title: '跑后臀腿恢复',
    file: 'src/schemas/book-stretch-plans.ts',
    exportName: 'BOOK_RUNNER_RECOVERY_PLAN',
  },
  {
    key: 'planI',
    id: 'aging-backwards-posture',
    title: '逆龄姿态训练',
    file: 'src/schemas/aging-backwards-plans.ts',
    exportName: 'AGING_BACKWARDS_POSTURE_PLAN',
  },
  {
    key: 'planJ',
    id: 'aging-backwards-weight-loss',
    title: '逆龄代谢唤醒',
    file: 'src/schemas/aging-backwards-plans.ts',
    exportName: 'AGING_BACKWARDS_WEIGHT_LOSS_PLAN',
  },
  {
    key: 'planK',
    id: 'aging-backwards-joints',
    title: '逆龄关节润滑',
    file: 'src/schemas/aging-backwards-plans.ts',
    exportName: 'AGING_BACKWARDS_JOINTS_PLAN',
  },
  {
    key: 'planL',
    id: 'aging-backwards-energy',
    title: '逆龄能量激活',
    file: 'src/schemas/aging-backwards-plans.ts',
    exportName: 'AGING_BACKWARDS_ENERGY_PLAN',
  },
  {
    key: 'planM',
    id: 'aging-backwards-pain-relief',
    title: '逆龄疼痛缓解',
    file: 'src/schemas/aging-backwards-plans.ts',
    exportName: 'AGING_BACKWARDS_PAIN_RELIEF_PLAN',
  },
  {
    key: 'planN',
    id: 'aging-backwards-balance',
    title: '逆龄平衡训练',
    file: 'src/schemas/aging-backwards-plans.ts',
    exportName: 'AGING_BACKWARDS_BALANCE_PLAN',
  },
  {
    key: 'planO',
    id: 'aging-backwards-mobility',
    title: '逆龄活动度提升',
    file: 'src/schemas/aging-backwards-plans.ts',
    exportName: 'AGING_BACKWARDS_MOBILITY_PLAN',
  },
  {
    key: 'planP',
    id: 'aging-backwards-bones',
    title: '逆龄骨骼保护',
    file: 'src/schemas/aging-backwards-plans.ts',
    exportName: 'AGING_BACKWARDS_BONES_PLAN',
  },
  {
    key: 'planQ',
    id: 'leg-slimming-release',
    title: '下肢线条放松',
    file: 'src/schemas/leg-slimming-plans.ts',
    exportName: 'LEG_SLIMMING_RELEASE_PLAN',
  },
  {
    key: 'planR',
    id: 'leg-slimming-beginner',
    title: '梨形初阶减脂',
    file: 'src/schemas/leg-slimming-plans.ts',
    exportName: 'LEG_SLIMMING_BEGINNER_PLAN',
  },
  {
    key: 'planS',
    id: 'leg-slimming-sculpt',
    title: '梨形高阶塑形',
    file: 'src/schemas/leg-slimming-plans.ts',
    exportName: 'LEG_SLIMMING_SCULPT_PLAN',
  },
  {
    key: 'planT',
    id: 'bed-exercise-morning',
    title: '床上晨间激活',
    file: 'src/schemas/bed-exercise-plans.ts',
    exportName: 'BED_EXERCISE_MORNING_PLAN',
  },
];

const PERIODIC_PROMPTS = [
  {
    name: '间歇拉伸已开启。',
    filename: 'periodic-enabled.mp3',
  },
  {
    name: '休息时间到了。第一个动作：',
    filename: 'periodic-break-start.mp3',
  },
  {
    name: '休息结束，继续工作吧。',
    filename: 'periodic-break-end.mp3',
  },
];

const normalizeGeneratedFilename = (text) =>
  text.replace(/[^一-鿿0-9A-Za-z]/g, '');

const listMp3Files = () =>
  new Set(fs.readdirSync(AUDIO_DIR).filter((file) => file.endsWith('.mp3')));

const indexFilesByNormalizedBase = (files) => {
  const index = new Map();
  for (const filename of files) {
    const base = filename.replace(/\.mp3$/, '');
    const normalized = normalizeGeneratedFilename(base);
    const existing = index.get(normalized) ?? [];
    existing.push(filename);
    index.set(normalized, existing);
  }
  return index;
};

const extractArrayLiteral = (source, file, exportName) => {
  const rawName = exportName.replace(/_PLAN$/, '');
  const candidates = [
    rawName.startsWith('RAW_') ? rawName : `RAW_${rawName}_PLAN`,
    rawName.startsWith('RAW_') ? rawName : `RAW_${rawName}`,
    exportName,
  ];

  const match = candidates
    .map((candidate) => ({
      candidate,
      match: source.match(
        new RegExp(
          `(?:export\\s+)?const\\s+${candidate}\\s*:\\s*WorkoutPlan\\s*=\\s*\\[`,
        ),
      ),
    }))
    .find(({ match }) => match && match.index !== undefined);

  if (!match || match.match?.index === undefined) {
    throw new Error(
      `Could not find WorkoutPlan array for ${exportName} in ${file}`,
    );
  }

  const start = match.match.index + match.match[0].lastIndexOf('[');
  let depth = 0;
  let inString = null;
  let escaping = false;

  for (let index = start; index < source.length; index += 1) {
    const char = source[index];

    if (inString) {
      if (escaping) {
        escaping = false;
      } else if (char === '\\') {
        escaping = true;
      } else if (char === inString) {
        inString = null;
      }
      continue;
    }

    if (char === "'" || char === '"' || char === '`') {
      inString = char;
      continue;
    }

    if (char === '[') {
      depth += 1;
      continue;
    }

    if (char === ']') {
      depth -= 1;
      if (depth === 0) {
        return source.slice(start, index + 1);
      }
    }
  }

  throw new Error(`Could not close WorkoutPlan array in ${file}`);
};

const loadPlan = ({ file, exportName }) => {
  const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const arrayLiteral = extractArrayLiteral(source, file, exportName);
  const plan = vm.runInNewContext(`(${arrayLiteral})`, {}, { filename: file });
  if (!Array.isArray(plan)) {
    throw new Error(`Could not load plan from ${file}`);
  }
  return plan;
};

const chooseSourceFile = (availableFiles, normalizedFileIndex, candidates) => {
  for (const candidate of candidates) {
    const normalized = normalizeGeneratedFilename(candidate.text);
    if (!normalized) {
      continue;
    }
    const filename = `${normalized}.mp3`;
    if (availableFiles.has(filename)) {
      return {
        ...candidate,
        oldFilename: filename,
      };
    }
    const normalizedMatches = normalizedFileIndex.get(normalized) ?? [];
    const availableMatch = normalizedMatches.find((match) =>
      availableFiles.has(match),
    );
    if (availableMatch) {
      return {
        ...candidate,
        oldFilename: availableMatch,
      };
    }
  }
  return {
    ...candidates[0],
    oldFilename: null,
  };
};

const copyIfNeeded = (sourceFilename, newFilename, availableFiles) => {
  if (availableFiles.has(newFilename)) {
    return 'already-structured';
  }
  if (SHOULD_RENAME) {
    fs.copyFileSync(
      path.join(AUDIO_DIR, sourceFilename),
      path.join(AUDIO_DIR, newFilename),
    );
    availableFiles.add(newFilename);
    return 'copied';
  }
  return 'matched';
};

const renameIfNeeded = (oldFilename, newFilename, availableFiles) => {
  if (availableFiles.has(newFilename)) {
    return 'already-structured';
  }
  if (!oldFilename) {
    return 'missing';
  }
  if (oldFilename === newFilename) {
    return 'already-structured';
  }
  if (availableFiles.has(newFilename)) {
    return 'conflict';
  }
  if (SHOULD_RENAME) {
    fs.renameSync(
      path.join(AUDIO_DIR, oldFilename),
      path.join(AUDIO_DIR, newFilename),
    );
    availableFiles.delete(oldFilename);
    availableFiles.add(newFilename);
    return 'renamed';
  }
  return 'matched';
};

const rows = [];
const availableFiles = listMp3Files();
const normalizedFileIndex = indexFilesByNormalizedBase(availableFiles);
const referencedBefore = new Set();
const referencedAfter = new Set();
const reusableStructuredFiles = new Map();

for (const planMeta of PLAN_MODULES) {
  const plan = loadPlan(planMeta);

  plan.forEach((section, sectionIndex) => {
    const sectionNumber = sectionIndex + 1;
    const sectionNewFilename = `${planMeta.key}-s${sectionNumber}.mp3`;
    const sectionSource = chooseSourceFile(
      availableFiles,
      normalizedFileIndex,
      [{ kind: 'section', matchType: 'section-name', text: section.name }],
    );
    if (sectionSource.oldFilename) {
      referencedBefore.add(sectionSource.oldFilename);
    }
    const sectionNormalized = normalizeGeneratedFilename(section.name);
    const reusableSectionSource =
      reusableStructuredFiles.get(sectionNormalized);
    const sectionStatus = sectionSource.oldFilename
      ? renameIfNeeded(
          sectionSource.oldFilename,
          sectionNewFilename,
          availableFiles,
        )
      : reusableSectionSource
        ? copyIfNeeded(
            reusableSectionSource,
            sectionNewFilename,
            availableFiles,
          )
        : renameIfNeeded(null, sectionNewFilename, availableFiles);
    if (sectionStatus !== 'missing') {
      referencedAfter.add(sectionNewFilename);
      reusableStructuredFiles.set(sectionNormalized, sectionNewFilename);
    }
    rows.push({
      planKey: planMeta.key,
      planId: planMeta.id,
      planTitle: planMeta.title,
      section: sectionNumber,
      exercise: null,
      kind: 'section',
      name: section.name,
      desc: section.tips,
      matchedText: sectionSource.text,
      matchType: sectionSource.matchType,
      oldFilename: sectionSource.oldFilename,
      newFilename: sectionNewFilename,
      publicPath: `${PUBLIC_AUDIO_DIR}/${sectionNewFilename}`,
      status: sectionStatus,
    });

    section.steps.forEach((step, stepIndex) => {
      const exerciseNumber = stepIndex + 1;
      const newFilename = `${planMeta.key}-s${sectionNumber}-e${exerciseNumber}.mp3`;
      const exerciseText = step.desc || step.name;
      const source = chooseSourceFile(availableFiles, normalizedFileIndex, [
        {
          kind: 'exercise',
          matchType: step.desc ? 'description' : 'name',
          text: exerciseText,
        },
      ]);
      if (source.oldFilename) {
        referencedBefore.add(source.oldFilename);
      }
      const reusableKeys = [exerciseText].map((text) =>
        normalizeGeneratedFilename(text),
      );
      const reusableSource = reusableKeys
        .map((key) => reusableStructuredFiles.get(key))
        .find(Boolean);
      const status = source.oldFilename
        ? renameIfNeeded(source.oldFilename, newFilename, availableFiles)
        : reusableSource
          ? copyIfNeeded(reusableSource, newFilename, availableFiles)
          : renameIfNeeded(null, newFilename, availableFiles);
      if (status !== 'missing') {
        referencedAfter.add(newFilename);
        reusableKeys.forEach((key) => {
          if (key) {
            reusableStructuredFiles.set(key, newFilename);
          }
        });
      }
      rows.push({
        planKey: planMeta.key,
        planId: planMeta.id,
        planTitle: planMeta.title,
        section: sectionNumber,
        exercise: exerciseNumber,
        kind: 'exercise',
        name: step.name,
        desc: step.desc,
        matchedText: source.text,
        matchType: source.matchType,
        oldFilename: source.oldFilename,
        newFilename,
        publicPath: `${PUBLIC_AUDIO_DIR}/${newFilename}`,
        status,
      });

      const nameNewFilename = `${planMeta.key}-s${sectionNumber}-e${exerciseNumber}-name.mp3`;
      const nameStatus = availableFiles.has(nameNewFilename)
        ? 'already-structured'
        : 'missing';
      if (nameStatus !== 'missing') {
        referencedAfter.add(nameNewFilename);
      }
      rows.push({
        planKey: planMeta.key,
        planId: planMeta.id,
        planTitle: planMeta.title,
        section: sectionNumber,
        exercise: exerciseNumber,
        kind: 'exercise-name',
        name: step.name,
        desc: '',
        matchedText: step.name,
        matchType: 'name',
        oldFilename: null,
        newFilename: nameNewFilename,
        publicPath: `${PUBLIC_AUDIO_DIR}/${nameNewFilename}`,
        status: nameStatus,
      });
    });
  });
}

for (const prompt of PERIODIC_PROMPTS) {
  const status = availableFiles.has(prompt.filename)
    ? 'already-structured'
    : 'missing';
  if (status !== 'missing') {
    referencedAfter.add(prompt.filename);
  }
  rows.push({
    planKey: 'planC',
    planId: 'periodic-break',
    planTitle: '间歇拉伸流程',
    section: null,
    exercise: null,
    kind: 'periodic-prompt',
    name: prompt.name,
    desc: '',
    matchedText: prompt.name,
    matchType: 'fixed-prompt',
    oldFilename: null,
    newFilename: prompt.filename,
    publicPath: `${PUBLIC_AUDIO_DIR}/${prompt.filename}`,
    status,
  });
}

const filesAfter = listMp3Files();
for (const filename of filesAfter) {
  if (referencedAfter.has(filename) || referencedBefore.has(filename)) {
    continue;
  }
  rows.push({
    planKey: null,
    planId: null,
    planTitle: null,
    section: null,
    exercise: null,
    kind: 'unused',
    name: null,
    desc: null,
    matchedText: null,
    matchType: null,
    oldFilename: filename,
    newFilename: null,
    publicPath: `${PUBLIC_AUDIO_DIR}/${filename}`,
    status: 'unused',
  });
}

const counts = rows.reduce((acc, row) => {
  acc[row.status] = (acc[row.status] ?? 0) + 1;
  return acc;
}, {});

const auditJson = {
  generatedAt: new Date().toISOString(),
  renamed: SHOULD_RENAME,
  audioDir: AUDIO_DIR,
  conventions: {
    planA: 'default-workout',
    planB: 'seated-workout',
    planC: 'break-plan',
    planD: 'mckenzie',
    section: 'planX-sN.mp3',
    exercise: 'planX-sN-eM.mp3',
    exerciseName: 'planX-sN-eM-name.mp3',
    periodicPrompt: 'periodic-*.mp3',
  },
  counts,
  rows,
};

fs.writeFileSync(
  path.join(AUDIO_DIR, 'audit.json'),
  `${JSON.stringify(auditJson, null, 2)}\n`,
);

const markdownRows = rows.map((row) =>
  [
    row.status,
    row.planKey ?? '',
    row.kind,
    row.section ?? '',
    row.exercise ?? '',
    row.name ?? '',
    row.matchType ?? '',
    row.oldFilename ?? '',
    row.newFilename ?? '',
  ]
    .map((value) => String(value).replaceAll('|', '\\|'))
    .join(' | '),
);

fs.writeFileSync(
  path.join(AUDIO_DIR, 'audit.md'),
  [
    '# Built-In Plan Audio Audit',
    '',
    `Generated: ${auditJson.generatedAt}`,
    `Rename mode: ${SHOULD_RENAME ? 'yes' : 'no'}`,
    '',
    '## Counts',
    '',
    ...Object.entries(counts).map(([status, count]) => `- ${status}: ${count}`),
    '',
    '## Rows',
    '',
    'status | plan | kind | section | exercise | name | match | old filename | new filename',
    '--- | --- | --- | --- | --- | --- | --- | --- | ---',
    ...markdownRows,
    '',
  ].join('\n'),
);

process.stdout.write(`${JSON.stringify(counts, null, 2)}\n`);
