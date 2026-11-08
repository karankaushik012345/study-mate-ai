import React, { useState } from 'react';
import { Clock, BarChart3, CheckSquare, Square, Layers, BookMarked } from 'lucide-react';

export function OverviewBlock({ deck }) {
  const [checkedTakeaways, setCheckedTakeaways] = useState({});

  if (!deck) return null;

  const toggleCheck = (idx) => {
    setCheckedTakeaways(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const difficultyColors = {
    Beginner: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    Intermediate: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    Advanced: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800'
  };

  const badgeClass = difficultyColors[deck.difficulty] || difficultyColors.Intermediate;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs p-5 sm:p-6 transition-colors space-y-4">
      {/* Title & Meta Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
        <div>
          <div className="flex items-center space-x-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-1">
            <BookMarked className="w-3.5 h-3.5 text-indigo-500" />
            <span className="uppercase tracking-wider">{deck.topic}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            {deck.title}
          </h2>
        </div>

        {/* Badges */}
        <div className="flex items-center space-x-2 shrink-0">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${badgeClass}`}>
            <BarChart3 className="w-3.5 h-3.5 mr-1" />
            {deck.difficulty}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
            <Clock className="w-3.5 h-3.5 mr-1 text-zinc-500" />
            {deck.estimatedMinutes} mins
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
            <Layers className="w-3.5 h-3.5 mr-1 text-zinc-500" />
            {deck.flashcards?.length || 0} Cards · {deck.quiz?.length || 0} Qs
          </span>
        </div>
      </div>

      {/* Summary Narrative */}
      <div className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/60">
        <p>{deck.summary}</p>
      </div>

      {/* Key Takeaways Checklist */}
      {deck.keyTakeaways && deck.keyTakeaways.length > 0 && (
        <div className="space-y-2 pt-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Key Objectives Checklist ({Object.values(checkedTakeaways).filter(Boolean).length}/{deck.keyTakeaways.length} mastered)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {deck.keyTakeaways.map((takeaway, idx) => {
              const isChecked = Boolean(checkedTakeaways[idx]);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleCheck(idx)}
                  className={`text-left flex items-start space-x-2.5 p-2.5 rounded-lg border text-xs sm:text-sm transition-all ${
                    isChecked
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <span className="mt-0.5 shrink-0">
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-zinc-400" />
                    )}
                  </span>
                  <span className={isChecked ? 'line-through opacity-85' : ''}>{takeaway}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
