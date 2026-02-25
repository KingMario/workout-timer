'use client';

import React, { useState } from 'react';
import PeriodicTab from '../components/PeriodicTab';
import WorkoutTab from '../components/WorkoutTab';

export default function WorkoutTimer() {
  const [mode, setMode] = useState<'workout' | 'periodic'>('workout');

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
      <a
        href="https://github.com/KingMario/workout-timer"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open GitHub repository"
        className="fixed top-4 right-4 z-50 p-2 rounded-md text-gray-700 dark:text-gray-100 bg-white/80 dark:bg-zinc-900/60 shadow hover:scale-105 transition-transform"
      >
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.11.82-.26.82-.577 0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.305 3.492.998.108-.775.418-1.305.76-1.605-2.665-.305-5.467-1.335-5.467-5.93 0-1.31.468-2.38 1.235-3.22-.125-.305-.535-1.53.115-3.185 0 0 1.005-.322 3.295 1.23A11.47 11.47 0 0112 5.8c1.02.005 2.045.138 3.005.405 2.29-1.552 3.295-1.23 3.295-1.23.655 1.655.245 2.88.12 3.185.77.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.37.815 1.096.815 2.21 0 1.595-.015 2.88-.015 3.27 0 .32.215.695.825.575C20.565 21.795 24 17.295 24 12 24 5.37 18.63 0 12 0z" />
        </svg>
      </a>

      {/* Header - tabs */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-5 py-4 border-b border-gray-100 dark:border-zinc-800 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex bg-gray-100 dark:bg-zinc-900 p-1 rounded-lg">
            <button
              onClick={() => setMode('workout')}
              className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${mode === 'workout' ? 'bg-white dark:bg-zinc-800 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
            >
              专注锻炼
            </button>
            <button
              onClick={() => setMode('periodic')}
              className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${mode === 'periodic' ? 'bg-white dark:bg-zinc-800 shadow-sm text-green-600 dark:text-green-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
            >
              间歇拉伸
            </button>
          </div>

          <div />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden px-5 pb-32 pt-2">
        {mode === 'workout' ? <WorkoutTab /> : <PeriodicTab />}
      </div>
    </div>
  );
}
