import React, { useState } from 'react';
import { BUILT_IN_PLANS } from '../../schemas';
import { WorkoutPlan } from '../../schemas/workout-plan';
import type { SavedPlan } from '../../utils/storage';

interface WizardSavedPlansProps {
  savedPlans: SavedPlan[];
  activePlanId?: string;
  onLoadPlan: (plan: SavedPlan) => void;
  onLoadBuiltInPlan: (planMap: { data: WorkoutPlan; id: string }) => void;
  onDeletePlan: (id: string) => void;
  onRenamePlan: (id: string, newTitle: string) => void;
  onClose: () => void;
}

export default function WizardSavedPlans({
  savedPlans,
  activePlanId,
  onLoadPlan,
  onLoadBuiltInPlan,
  onDeletePlan,
  onRenamePlan,
  onClose,
}: WizardSavedPlansProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const startEditing = (plan: SavedPlan) => {
    setEditingId(plan.id);
    setEditTitle(plan.title);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const submitRename = (id: string) => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== savedPlans.find((p) => p.id === id)?.title) {
      onRenamePlan(id, trimmed);
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Built-in Plans */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-400 dark:text-zinc-300 uppercase tracking-wider">
          📋 系统内置计划
        </h3>
        {BUILT_IN_PLANS.map((plan) => {
          const isActive =
            (!activePlanId && plan.id === 'default-workout') ||
            activePlanId === plan.id;
          return (
            <div
              key={plan.id}
              className={`flex justify-between items-center p-4 rounded-lg border transition-all ${
                isActive
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-800 ring-1 ring-green-200 dark:ring-green-900/50 shadow-sm'
                  : 'bg-gray-50 dark:bg-zinc-800/50 border-gray-100 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-blue-900'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-bold text-gray-800 dark:text-gray-200">
                    {plan.title}
                  </div>
                  {isActive && (
                    <span className="text-[10px] bg-green-700 text-white px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                      当前使用
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {plan.description}
                </div>
              </div>
              <div className="ml-4">
                <button
                  onClick={() => {
                    onLoadBuiltInPlan({ data: plan.data, id: plan.id });
                    onClose();
                  }}
                  disabled={isActive}
                  className={`px-4 py-1.5 text-sm rounded transition-colors font-medium ${
                    isActive
                      ? 'bg-gray-200 dark:bg-zinc-700 text-gray-400 dark:text-zinc-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isActive ? '已载入' : '载入'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Saved Plans */}
      <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
        <h3 className="text-sm font-bold text-gray-400 dark:text-zinc-300 uppercase tracking-wider">
          💾 我的收藏
        </h3>
        {savedPlans.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm italic">
            暂无收藏的计划
          </div>
        ) : (
          <div className="space-y-3">
            {savedPlans.map((plan) => {
              const isActive = plan.id === activePlanId;
              const isEditing = editingId === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`flex justify-between items-center p-4 rounded-lg border transition-all ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-800 ring-1 ring-blue-200 dark:ring-blue-900/50 shadow-sm'
                      : 'bg-gray-50 dark:bg-zinc-800/50 border-gray-100 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-blue-900'
                  }`}
                >
                  <div className="flex-1 mr-4">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              submitRename(plan.id);
                            }
                            if (e.key === 'Escape') {
                              cancelEditing();
                            }
                          }}
                          onBlur={() => submitRename(plan.id)}
                          className="flex-1 px-2 py-1 text-sm border rounded bg-white dark:bg-zinc-800 border-blue-400 dark:border-blue-600 outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 group">
                          <div className="font-bold text-gray-800 dark:text-gray-200">
                            {plan.title}
                          </div>
                          <button
                            onClick={() => startEditing(plan)}
                            className="p-1 text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                            title="重命名"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </button>
                          {isActive && (
                            <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                              当前使用
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(plan.createdAt).toLocaleDateString()} ·{' '}
                          {plan.data.length} 个阶段
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {!isEditing && (
                      <>
                        <button
                          onClick={() => onLoadPlan(plan)}
                          disabled={isActive}
                          className={`px-3 py-1.5 text-sm rounded transition-colors font-medium ${
                            isActive
                              ? 'bg-gray-200 dark:bg-zinc-700 text-gray-400 dark:text-zinc-500 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {isActive ? '已载入' : '载入'}
                        </button>
                        <button
                          onClick={() => onDeletePlan(plan.id)}
                          className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                        >
                          删除
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
