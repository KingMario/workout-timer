'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { WorkoutPlan } from '../../schemas/workout-plan';
import { useWizardState } from './useWizardState';
import WizardSavedPlans from './WizardSavedPlans';
import WizardStep1Form from './WizardStep1Form';
import WizardStep2AI from './WizardStep2AI';
import WizardStep3Import from './WizardStep3Import';

export interface CustomPlanWizardProps {
  onClose: () => void;
  onPlanLoaded: (plan: WorkoutPlan, id?: string) => void;
  activePlanId?: string;
}

export default function CustomPlanWizard({
  onClose,
  onPlanLoaded,
  activePlanId,
}: CustomPlanWizardProps) {
  const [isMounted, setIsMounted] = useState(false);

  const { state, actions } = useWizardState(onPlanLoaded, onClose);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  // Keyboard shortcut for Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (
          state.mode === 'create' &&
          (state.step > 1 ||
            state.isFormDirty ||
            state.jsonInput.length > 0 ||
            state.planTitle.length > 0) &&
          !confirm('您有未保存的更改，确定要关闭吗？')
        ) {
          return;
        }
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    state.mode,
    state.step,
    state.jsonInput.length,
    state.planTitle.length,
    state.isFormDirty,
    onClose,
  ]);

  // Focus the close button for keyboard users ONLY when modal opens
  useEffect(() => {
    const closeBtn = document.getElementById(
      'custom-plan-close-btn',
    ) as HTMLButtonElement | null;
    if (closeBtn) {
      closeBtn.focus();
    }
  }, []);

  if (!isMounted) {
    return null;
  }

  const handleCancelClick = () => {
    if (
      state.mode === 'create' &&
      (state.step > 1 ||
        state.isFormDirty ||
        state.jsonInput.length > 0 ||
        state.planTitle.length > 0) &&
      !confirm('您有未保存的更改，确定要关闭吗？')
    ) {
      return;
    }
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="custom-plan-dialog-title"
        className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col transition-all"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900 z-10 shrink-0">
          <h2
            id="custom-plan-dialog-title"
            className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2"
          >
            {state.mode === 'saved' ? (
              '📚 计划库'
            ) : (
              <>
                {state.step === 1 && '1. 定制需求'}
                {state.step === 2 && '2. 获取 AI 方案'}
                {state.step === 3 && '3. 导入方案'}
              </>
            )}
          </h2>
          <div className="flex items-center gap-2">
            {state.mode === 'create' && (
              <button
                onClick={actions.showSavedView}
                className="text-sm px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
              >
                计划库
              </button>
            )}
            {state.mode === 'saved' && (
              <button
                onClick={actions.enterCreateMode}
                className="text-sm px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                + 新建计划
              </button>
            )}
            <button
              id="custom-plan-close-btn"
              onClick={handleCancelClick}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-2"
              aria-label="关闭"
              autoFocus
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {state.mode === 'saved' ? (
            <WizardSavedPlans
              savedPlans={state.savedPlans}
              activePlanId={activePlanId}
              onLoadPlan={actions.handleLoadPlan}
              onLoadBuiltInPlan={(planMap) => {
                onPlanLoaded(planMap.data, planMap.id);
              }}
              onDeletePlan={actions.handleDeletePlan}
              onRenamePlan={actions.handleRenamePlan}
              onCopyPlan={actions.handleCopyPlanJSON}
              onClose={onClose}
            />
          ) : (
            <>
              {state.step === 1 && (
                <WizardStep1Form
                  onManualGenerate={actions.onGeneratePrompt}
                  onAiGenerate={actions.handleAiGenerate}
                  aiConfig={state.aiConfig}
                  setAiConfig={actions.setAiConfig}
                  showAiSettings={state.showAiSettings}
                  setShowAiSettings={actions.setShowAiSettings}
                  showOllamaHelp={state.showOllamaHelp}
                  setShowOllamaHelp={actions.setShowOllamaHelp}
                  onSaveConfig={actions.saveConfig}
                  error={state.error}
                  setIsFormDirty={actions.setIsFormDirty}
                />
              )}
              {state.step === 2 && (
                <WizardStep2AI
                  generatedPrompt={state.generatedPrompt}
                  onCopy={actions.handleCopyToClipboard}
                />
              )}
              {state.step === 3 && (
                <WizardStep3Import
                  planTitle={state.planTitle}
                  setPlanTitle={actions.setPlanTitle}
                  jsonInput={state.jsonInput}
                  setJsonInput={actions.setJsonInput}
                  error={state.error}
                />
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 rounded-b-xl flex justify-between shrink-0">
          {state.mode === 'create' ? (
            <>
              {state.step > 1 && (
                <button
                  onClick={() => {
                    if (state.step === 3 && state.entryPath === 'ai') {
                      actions.setStep(1);
                    } else {
                      actions.setStep(state.step - 1);
                    }
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  上一步
                </button>
              )}

              {/* Ensure spacing if there is no back button */}
              {state.step === 1 && <div></div>}

              {state.step === 1 && (
                <div className="flex gap-2">
                  <button
                    type="submit"
                    form="wizard-form"
                    className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    手动 (生成提示词)
                  </button>
                  <button
                    type="button"
                    disabled={state.isGenerating}
                    onClick={() => {
                      const hiddenBtn = document.getElementById(
                        'hidden-ai-submit-btn',
                      );
                      if (hiddenBtn) {
                        hiddenBtn.click();
                      }
                    }}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-bold flex items-center gap-2 disabled:opacity-50"
                  >
                    {state.isGenerating ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        生成中...
                      </>
                    ) : (
                      '✨ 自动生成 (AI)'
                    )}
                  </button>
                </div>
              )}

              {state.step === 2 && (
                <button
                  onClick={() => actions.setStep(3)}
                  className="px-6 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors"
                >
                  我已获得 JSON，下一步
                </button>
              )}

              {state.step === 3 && (
                <button
                  onClick={actions.handleJsonSubmit}
                  disabled={state.isJsonEmpty}
                  className={`px-6 py-2 rounded-lg transition-colors font-bold ${
                    state.isJsonEmpty
                      ? 'bg-green-700/40 text-white cursor-not-allowed opacity-60'
                      : 'bg-green-700 hover:bg-green-800 text-white'
                  }`}
                >
                  保存并应用
                </button>
              )}
            </>
          ) : (
            <div className="flex justify-end w-full">
              <button
                onClick={handleCancelClick}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                关闭
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
