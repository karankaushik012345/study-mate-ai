import React, { useState } from 'react';
import { Clock, BarChart3, CheckSquare, Square, Layers, BookMarked, Sparkles, Award } from 'lucide-react';
import { getTopicVisuals } from '../utils/topicImages';
import { sound } from '../utils/soundEffects';

export function OverviewBlock({ deck }) {
  const [checkedTakeaways, setCheckedTakeaways] = useState({});

  if (!deck) return null;

  const visuals = getTopicVisuals(deck.topic, deck.title);

  const toggleCheck = (idx) => {
    sound.playClick();
    setCheckedTakeaways(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const difficultyColors = {
    Beginner: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    Intermediate: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    Advanced: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800'
  };

  const badgeClass = difficultyColors[deck.difficulty] || difficultyColors.Intermediate;
  const completedCount = Object.values(checkedTakeaways).filter(Boolean).length;
  const totalObjectives = deck.keyTakeaways?.length || 0;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-md overflow-hidden transition-colors">
      {/* Visual Cover Banner with Photographic Background */}
      <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-zinc-900">
        <img
          src={visuals.cover}
          alt={deck.topic}
          className="w-full h-full object-cover opacity-60 scale-105 hover:scale-100 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

        {/* Floating Badges on Top */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs">
          <span className="px-3 py-1 rounded-full font-bold bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-white backdrop-blur-md border border-white/20 shadow-md flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>{visuals.badge}</span>
          </span>

          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full font-bold backdrop-blur-md border shadow-md flex items-center space-x-1 ${badgeClass}`}>
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{deck.difficulty}</span>
            </span>
          </div>
        </div>

        {/* Title over Banner */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex items-center space-x-2 text-indigo-300 text-xs font-semibold mb-1">
            <BookMarked className="w-3.5 h-3.5" />
            <span className="uppercase tracking-widest">{deck.topic}</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight drop-shadow-sm text-white">
            {deck.title}
          </h2>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 sm:p-7 space-y-5">
        {/* Study Stats Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pb-2">
          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800/80">
            <span className="text-[11px] font-medium text-zinc-400 block">Est. Duration</span>
            <span className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>{deck.estimatedMinutes} mins</span>
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800/80">
            <span className="text-[11px] font-medium text-zinc-400 block">Interactive Cards</span>
            <span className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center space-x-1">
              <Layers className="w-3.5 h-3.5 text-violet-500" />
              <span>{deck.flashcards?.length || 0} items</span>
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800/80">
            <span className="text-[11px] font-medium text-zinc-400 block">Test Questions</span>
            <span className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center space-x-1">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>{deck.quiz?.length || 0} Qs</span>
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800/80">
            <span className="text-[11px] font-medium text-zinc-400 block">Active Retention</span>
            <span className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>94% High</span>
            </span>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800/80 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <p>{deck.summary}</p>
        </div>

        {/* Key Takeaways Checklist with Live Progress */}
        {deck.keyTakeaways && deck.keyTakeaways.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs">
              <h3 className="font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Core Competencies Checklist
              </h3>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {completedCount} of {totalObjectives} completed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {deck.keyTakeaways.map((takeaway, idx) => {
                const isChecked = Boolean(checkedTakeaways[idx]);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleCheck(idx)}
                    className={`text-left flex items-start space-x-3 p-3 rounded-2xl border text-xs sm:text-sm transition-all ${
                      isChecked
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 shadow-xs'
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
                    <span className={isChecked ? 'line-through opacity-80' : 'font-medium'}>
                      {takeaway}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
