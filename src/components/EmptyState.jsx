import React from 'react';
import {
  RotateCw,
  HelpCircle,
  Bookmark,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export function EmptyState({ onSelectPreset, onLoadSample }) {
  const starterCards = [
    {
      title: 'React 19 & Fiber Reconciliation',
      description: 'Explore time-slicing, stale closures in useEffect, and AbortController race-condition mitigation.',
      tag: 'Frontend Architecture'
    },
    {
      title: 'Distributed Systems & CAP Theorem',
      description: 'CP vs AP trade-offs, network partition realities, Raft consensus, and quorum quashing.',
      tag: 'System Design'
    },
    {
      title: 'Cellular Respiration & ATP Synthase',
      description: 'Glycolysis, Krebs cycle, mitochondrial electrochemical gradients, and oxidative phosphorylation.',
      tag: 'Bioenergetics'
    }
  ];

  const features = [
    {
      icon: RotateCw,
      title: '3D Flashcards',
      description: 'Active recall with "Mastered" vs "Need Review" tracking, card shuffling, and keyboard shortcuts.'
    },
    {
      icon: HelpCircle,
      title: 'Interactive Quiz & Re-test',
      description: 'Multiple choice with immediate feedback, detailed rationales, and dedicated re-testing of missed questions.'
    },
    {
      icon: Bookmark,
      title: 'High-Yield Cheatsheet',
      description: 'Succinct definitions, practical real-world applications, and fast search filtering.'
    },
    {
      icon: ShieldCheck,
      title: 'Defensive Failure Handling',
      description: 'Repairs broken JSON chunks, rejects invalid shapes, and isolates race conditions with AbortController.'
    }
  ];

  return (
    <div className="space-y-8 py-6">
      {/* Intro hero banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Transform Unstructured Notes Into Reliable Study UI</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
          What would you like to master today?
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Paste your lecture notes, textbook chapters, or any topic above. The AI parses concepts into interactive flashcards, quizzes, and high-yield cheatsheets.
        </p>
      </div>

      {/* 3 Quick Starter Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider">
          <span>Or load an instant pre-built study deck:</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {starterCards.map((starter, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPreset(starter.title)}
              className="text-left p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  {starter.tag}
                </span>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {starter.title}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {starter.description}
                </p>
              </div>

              <div className="flex items-center space-x-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 pt-2">
                <span>Generate this deck</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Feature capabilities grid */}
      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800/60 space-y-2"
              >
                <div className="p-2 w-fit rounded-lg bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs border border-zinc-200/50 dark:border-zinc-700/50">
                  <Icon className="w-4 h-4" />
                </div>
                <h5 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                  {feat.title}
                </h5>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
