import React from 'react';

interface WizardStep2AIProps {
  generatedPrompt: string;
  onCopy: () => void;
}

export default function WizardStep2AI({
  generatedPrompt,
  onCopy,
}: WizardStep2AIProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        提示词已生成。如果您没有配置 API，可以点击下方按钮复制提示词，然后发送给
        DeepSeek、ChatGPT 或其他 AI 助手。
      </p>
      <pre
        tabIndex={0}
        role="region"
        aria-label="生成的 AI 提示词"
        className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-md text-xs font-mono overflow-x-auto whitespace-pre-wrap max-h-60 border border-gray-200 dark:border-zinc-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none text-gray-900 dark:text-zinc-100"
      >
        <code>{generatedPrompt}</code>
      </pre>
      <button
        onClick={onCopy}
        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        复制提示词 (手动模式)
      </button>
    </div>
  );
}
