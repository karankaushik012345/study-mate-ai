import React, { useState } from 'react';
import { Wand2, Sparkles, Send } from 'lucide-react';

const REFINEMENT_CHIPS = [
  '+ Add 2 Harder Questions',
  'Simplify Flashcard Explanations',
  'Add 3 More Cheatsheet Terms',
  'Focus On Real-World Edge Cases'
];

export function RefinementBar({ onRefine, isRefining }) {
  const [instruction, setInstruction] = useState('');

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!instruction.trim() || isRefining) return;
    onRefine(instruction.trim());
    setInstruction('');
  };

  const handleChipClick = (chipText) => {
    setInstruction(chipText);
  };

  return (
    <div className="bg-gradient-to-r from-emerald-50/70 to-teal-50/70 dark:from-zinc-900 dark:to-zinc-900 rounded-3xl border border-emerald-200/80 dark:border-zinc-800 p-5 shadow-xs space-y-3 transition-colors">
      <div className="flex items-center space-x-2 text-emerald-950 dark:text-emerald-300">
        <Wand2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <span className="text-xs sm:text-sm font-bold">Refine This Study Deck (Follow-up Loop)</span>
        <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
          Stateful
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="e.g. 'Add 2 harder questions on CAP theorem' or 'Make definitions shorter'..."
          disabled={isRefining}
          className="grow px-4 py-2.5 text-xs sm:text-sm rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all disabled:opacity-60 shadow-inner"
        />

        <button
          type="submit"
          disabled={isRefining || !instruction.trim()}
          className="flex items-center space-x-1.5 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-600/25 shrink-0"
        >
          {isRefining ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Refining...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Refine</span>
            </>
          )}
        </button>
      </form>

      {/* Quick Refinement Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">Quick suggestions:</span>
        {REFINEMENT_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isRefining}
            onClick={() => handleChipClick(chip)}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-white/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}
