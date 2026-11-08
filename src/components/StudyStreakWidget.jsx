import React, { useState, useEffect } from 'react';
import { Flame, Target, Trophy, Sparkles, TrendingUp } from 'lucide-react';

export function StudyStreakWidget() {
  const [streakData, setStreakData] = useState(() => {
    try {
      const stored = localStorage.getItem('studymate_streak_v1');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      streakDays: 4,
      cardsToday: 14,
      dailyGoal: 20,
      xp: 420,
      level: 'Level 2 · Curious Explorer'
    };
  });

  const percent = Math.min(100, Math.round((streakData.cardsToday / streakData.dailyGoal) * 100));

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-violet-500/10 dark:from-amber-950/20 dark:via-indigo-950/20 dark:to-violet-950/20 border border-amber-200/60 dark:border-zinc-800 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Streak Counter */}
      <div className="flex items-center space-x-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/30">
          <Flame className="w-5 h-5 fill-white" />
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
              {streakData.streakDays} Day Streak!
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-bold uppercase">
              On Fire
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Study today to keep your streak alive
          </p>
        </div>
      </div>

      {/* Daily Goal Progress Bar */}
      <div className="flex items-center space-x-3 grow max-w-xs">
        <div className="grow space-y-1">
          <div className="flex justify-between text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">
            <span className="flex items-center space-x-1">
              <Target className="w-3.5 h-3.5 text-indigo-500" />
              <span>Daily Target</span>
            </span>
            <span>{streakData.cardsToday}/{streakData.dailyGoal} cards</span>
          </div>
          <div className="w-full bg-zinc-200/70 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Gamified XP & Scholar Badge */}
      <div className="hidden sm:flex items-center space-x-2 bg-white/80 dark:bg-zinc-900/80 px-3 py-1.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
        <Trophy className="w-4 h-4 text-amber-500" />
        <div>
          <span className="font-bold text-[11px] text-zinc-800 dark:text-zinc-200">
            {streakData.xp} XP
          </span>
          <span className="text-[10px] text-zinc-400 block -mt-0.5">
            {streakData.level}
          </span>
        </div>
      </div>
    </div>
  );
}
