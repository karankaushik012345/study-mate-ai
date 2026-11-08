import React from 'react';
import {
  RotateCw,
  HelpCircle,
  Bookmark,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  Users,
  Star,
  CheckCircle2,
  TrendingUp,
  Brain
} from 'lucide-react';
import { TOPIC_COLLECTIONS } from '../utils/topicImages';
import { sound } from '../utils/soundEffects';

export function EmptyState({ onSelectPreset, onLoadSample }) {
  const featuredDecks = [
    {
      title: 'React 19 & Concurrent Fiber Architecture',
      description: 'Reconciliation algorithm, time-slicing, stale closures in useEffect, and AbortController race-condition mitigation.',
      tag: 'Frontend Engineering',
      image: TOPIC_COLLECTIONS.frontend.thumbnail,
      badge: 'Bestseller',
      cardsCount: '15 Cards · 4 Quizzes',
      rating: '4.9 (1.2k reviews)'
    },
    {
      title: 'Distributed Systems & CAP Theorem',
      description: 'CP vs AP trade-offs, network partitions, quorum consensus (N/2 + 1), and Raft leader elections.',
      tag: 'System Design',
      image: TOPIC_COLLECTIONS.systems.thumbnail,
      badge: 'High Yield',
      cardsCount: '18 Cards · 5 Quizzes',
      rating: '5.0 (980 reviews)'
    },
    {
      title: 'Mitochondrial Bioenergetics & ATP Synthase',
      description: 'Glycolysis in cytoplasm, Krebs cycle matrix reactions, and chemiosmotic electrochemical gradient.',
      tag: 'Bio & Medicine',
      image: TOPIC_COLLECTIONS.biology.thumbnail,
      badge: 'Exam Cram',
      cardsCount: '20 Cards · 6 Quizzes',
      rating: '4.8 (850 reviews)'
    }
  ];

  const handlePick = (title) => {
    sound.playClick();
    onSelectPreset(title);
  };

  return (
    <div className="space-y-10 py-6">
      {/* Hero Banner with Social Proof */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        {/* Social Proof Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 shadow-xs">
          <div className="flex -space-x-1.5">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-[10px] text-white font-bold flex items-center justify-center ring-2 ring-white dark:ring-zinc-900">A</span>
            <span className="w-5 h-5 rounded-full bg-teal-600 text-[10px] text-white font-bold flex items-center justify-center ring-2 ring-white dark:ring-zinc-900">M</span>
            <span className="w-5 h-5 rounded-full bg-amber-500 text-[10px] text-white font-bold flex items-center justify-center ring-2 ring-white dark:ring-zinc-900">S</span>
          </div>
          <span className="text-zinc-400">·</span>
          <span>Trusted by 14,000+ STEM & CS students</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight">
          Turn Unstructured Notes into <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 bg-clip-text text-transparent">Active Recall Mastery</span>
        </h1>

        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Paste textbook chapters, code snippets, or lecture slides. StudyMate structures them into interactive 3D flashcards, quizzes with targeted re-testing, and cheatsheets.
        </p>

        {/* Live Metric Stats Bar */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span><strong>94%</strong> Higher Retention</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            <span><strong>Instant</strong> SSE Streaming</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span><strong>100%</strong> Zero Crash Guarantee</span>
          </div>
        </div>
      </div>

      {/* Featured Community Study Decks with Real Photography */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Explore High-Yield Starter Decks</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Click any deck to immediately test all interactive widgets with zero typing
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featuredDecks.map((deck, idx) => (
            <div
              key={idx}
              onClick={() => handlePick(deck.title)}
              className="group cursor-pointer rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden hover:border-emerald-500 dark:hover:border-emerald-500 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              {/* Photo Header */}
              <div className="relative h-36 w-full overflow-hidden bg-zinc-950">
                <img
                  src={deck.image}
                  alt={deck.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/95 dark:bg-zinc-900/95 text-zinc-900 dark:text-white backdrop-blur-md shadow-xs">
                  {deck.tag}
                </span>
                <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                  {deck.badge}
                </span>
                <span className="absolute bottom-2.5 left-3 text-[11px] font-semibold text-zinc-200">
                  {deck.cardsCount}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 space-y-2 grow flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-1 text-[11px] text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span className="font-bold">{deck.rating}</span>
                  </div>
                  <h4 className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-zinc-50 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                    {deck.title}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {deck.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <span>Launch Study Deck</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Value Props Grid */}
      <div className="pt-6 border-t border-zinc-200/60 dark:border-zinc-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800/80 space-y-2">
            <div className="p-2.5 w-fit rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 shadow-xs">
              <RotateCw className="w-4 h-4" />
            </div>
            <h5 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100">
              3D Physical Depth Cards
            </h5>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
              Active recall grading with spacebar flips, hint reveal, and audio synthesis.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800/80 space-y-2">
            <div className="p-2.5 w-fit rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 shadow-xs">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h5 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100">
              Targeted Re-Test Mode
            </h5>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
              Filters down to only missed questions so students can drill until 100% mastery.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800/80 space-y-2">
            <div className="p-2.5 w-fit rounded-xl bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 shadow-xs">
              <Bookmark className="w-4 h-4" />
            </div>
            <h5 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100">
              High-Yield Cheatsheet
            </h5>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
              Searchable formula tables, definitions, and one-click clipboard copying.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800/80 space-y-2">
            <div className="p-2.5 w-fit rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h5 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100">
              Zero-Crash Defensive Engine
            </h5>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
              Heuristic bracket healing, schema bounds checking, and race condition immunity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
