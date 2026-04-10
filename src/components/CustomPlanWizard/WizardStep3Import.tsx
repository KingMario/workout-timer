import React from 'react';

interface WizardStep3ImportProps {
  planTitle: string;
  setPlanTitle: (title: string) => void;
  jsonInput: string;
  setJsonInput: (json: string) => void;
  error: string | null;
}

export default function WizardStep3Import({
  planTitle,
  setPlanTitle,
  jsonInput,
  setJsonInput,
  error,
}: WizardStep3ImportProps) {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/50">
        <label
          htmlFor="plan-title-input"
          className="block text-sm font-bold text-blue-800 dark:text-blue-300 mb-1"
        >
          给计划起个名字（可选，默认自动生成）
        </label>
        <input
          id="plan-title-input"
          value={planTitle}
          onChange={(e) => setPlanTitle(e.target.value)}
          className="wizard-input"
          placeholder="例如: 减脂计划, 周末暴汗"
        />
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
          * 计划将自动保存到“我的计划”中，方便下次直接使用。
        </p>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400">
        将 AI 返回的 JSON 代码粘贴到下方：
      </p>
      <textarea
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        className="wizard-input min-h-[200px] font-mono text-sm"
        placeholder='[{"name": "热身", ...}]'
      />
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded border border-red-100 dark:border-red-800">
          {error}
        </div>
      )}
    </div>
  );
}
