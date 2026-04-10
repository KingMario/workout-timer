import React from 'react';
import { BUILT_IN_PLANS } from '../../schemas';
import { WorkoutPlan } from '../../schemas/workout-plan';
import type { SavedPlan } from '../../utils/storage';

interface WizardSavedPlansProps {
  savedPlans: SavedPlan[];
  activePlanId?: string;
  onLoadPlan: (plan: SavedPlan) => void;
  onLoadBuiltInPlan: (planMap: { data: WorkoutPlan; id: string }) => void;
  onDeletePlan: (id: string) => void;
  onClose: () => void;
}

export default function WizardSavedPlans({
  savedPlans,
  activePlanId,
  onLoadPlan,
  onLoadBuiltInPlan,
  onDeletePlan,
  onClose,
}: WizardSavedPlansProps) {
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
              return (
                <div
                  key={plan.id}
                  className={`flex justify-between items-center p-4 rounded-lg border transition-all ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-800 ring-1 ring-blue-200 dark:ring-blue-900/50 shadow-sm'
                      : 'bg-gray-50 dark:bg-zinc-800/50 border-gray-100 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-blue-900'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-gray-800 dark:text-gray-200">
                        {plan.title}
                      </div>
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
                  </div>
                  <div className="flex gap-2 ml-4">
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
