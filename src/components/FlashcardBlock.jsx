import React, { useState, useEffect, useCallback } from 'react';
import {
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Lightbulb,
  CheckCircle2,
  Clock,
  Sparkles,
  Keyboard,
  HelpCircle,
  Volume2
} from 'lucide-react';
import { sound } from '../utils/soundEffects';

export function FlashcardBlock({ flashcards }) {
  const [cards, setCards] = useState(flashcards || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'review' | 'mastered'
  const [cardStatus, setCardStatus] = useState({}); // { [id]: 'mastered' | 'review' }

  // Sync if incoming cards change
  useEffect(() => {
    setCards(flashcards || []);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setCardStatus({});
  }, [flashcards]);

  // Derived filtered card list
  const filteredCards = cards.filter(card => {
    if (filterMode === 'mastered') return cardStatus[card.id] === 'mastered';
    if (filterMode === 'review') return cardStatus[card.id] === 'review';
    return true;
  });

  const activeCard = filteredCards[currentIndex] || filteredCards[0];

  const handleNext = useCallback(() => {
    if (filteredCards.length === 0) return;
    sound.playClick();
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex(prev => (prev + 1) % filteredCards.length);
  }, [filteredCards.length]);

  const handlePrev = useCallback(() => {
    if (filteredCards.length === 0) return;
    sound.playClick();
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex(prev => (prev - 1 + filteredCards.length) % filteredCards.length);
  }, [filteredCards.length]);

  const handleFlip = useCallback(() => {
    sound.playFlip();
    setIsFlipped(prev => !prev);
  }, []);

  const handleMarkStatus = useCallback((status) => {
    if (!activeCard) return;
    if (status === 'mastered') sound.playCorrect();
    else sound.playClick();
    setCardStatus(prev => ({ ...prev, [activeCard.id]: status }));
    handleNext();
  }, [activeCard, handleNext]);

  const handleShuffle = () => {
    sound.playClick();
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        handleMarkStatus('mastered');
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleMarkStatus('review');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, handleMarkStatus]);

  if (!cards || cards.length === 0) return null;

  const masteredCount = Object.values(cardStatus).filter(s => s === 'mastered').length;
  const reviewCount = Object.values(cardStatus).filter(s => s === 'review').length;
  const progressPercent = Math.round((masteredCount / cards.length) * 100);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-md p-5 sm:p-7 transition-colors space-y-6">
      {/* Block Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 flex items-center space-x-2">
              <RotateCw className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Interactive Active-Recall Cards</span>
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {progressPercent}% Mastered
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Tap Space to flip · Arrow keys to navigate · K for Mastered · R for Review
          </p>
        </div>

        {/* Filter Pills & Shuffle */}
        <div className="flex items-center space-x-1.5 self-start sm:self-center">
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setFilterMode('all'); setCurrentIndex(0); sound.playClick(); }}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterMode === 'all'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              All ({cards.length})
            </button>
            <button
              type="button"
              onClick={() => { setFilterMode('review'); setCurrentIndex(0); sound.playClick(); }}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterMode === 'review'
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              Review ({reviewCount})
            </button>
            <button
              type="button"
              onClick={() => { setFilterMode('mastered'); setCurrentIndex(0); sound.playClick(); }}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterMode === 'mastered'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              Known ({masteredCount})
            </button>
          </div>

          <button
            type="button"
            onClick={handleShuffle}
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-zinc-200/60 dark:border-zinc-800 shadow-xs"
            title="Shuffle flashcards"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full transition-all duration-300 ease-out"
          style={{ width: `${((currentIndex + 1) / (filteredCards.length || 1)) * 100}%` }}
        />
      </div>

      {filteredCards.length === 0 ? (
        <div className="py-14 text-center text-zinc-500 dark:text-zinc-400 space-y-2">
          <p className="text-sm font-semibold">No flashcards match the "{filterMode}" filter.</p>
          <button
            onClick={() => setFilterMode('all')}
            className="text-xs text-emerald-600 dark:text-emerald-400 underline font-bold"
          >
            Show all flashcards
          </button>
        </div>
      ) : (
        /* The Realistic Physical Card Stack */
        <div className="space-y-5">
          {/* Stack effect wrappers */}
          <div className="relative pt-3 pb-2 px-2">
            {/* Card layer 3 (farthest behind) */}
            <div className="absolute inset-x-8 top-0 h-full bg-zinc-200/50 dark:bg-zinc-800/40 rounded-3xl -translate-y-2 shadow-xs" />
            {/* Card layer 2 (middle stack) */}
            <div className="absolute inset-x-4 top-1 h-full bg-zinc-100 dark:bg-zinc-800/70 rounded-3xl -translate-y-1 shadow-xs border border-zinc-200/50 dark:border-zinc-700/50" />

            {/* Active Card with 3D Flip */}
            <div
              onClick={handleFlip}
              className="relative min-h-[240px] sm:min-h-[280px] w-full rounded-3xl cursor-pointer perspective-1000 select-none group z-10"
              role="button"
              tabIndex={0}
              aria-label="Click to flip flashcard"
            >
              <div
                className={`w-full h-full min-h-[240px] sm:min-h-[280px] duration-500 transform-style-preserve-3d transition-transform relative rounded-3xl ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* Front of Card */}
                <div className="absolute inset-0 backface-hidden w-full h-full bg-gradient-to-b from-white via-zinc-50/50 to-zinc-100/50 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-950 border-2 border-zinc-200/90 dark:border-zinc-750 group-hover:border-emerald-500 dark:group-hover:border-emerald-500 rounded-3xl p-6 sm:p-9 flex flex-col justify-between shadow-xl transition-all">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-400 dark:text-zinc-500">
                    <span className="flex items-center space-x-1.5 uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-extrabold">
                      <HelpCircle className="w-4 h-4" />
                      <span>Recall Prompt</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                      {currentIndex + 1} of {filteredCards.length}
                    </span>
                  </div>

                  <div className="my-auto py-4 text-center px-2">
                    <h4 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 leading-snug">
                      {activeCard.front}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="flex items-center space-x-1.5 font-medium">
                      <Keyboard className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Click or Space to flip</span>
                    </span>
                    {activeCard.hint && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playClick();
                          setShowHint(prev => !prev);
                        }}
                        className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold hover:bg-amber-100 transition-colors shadow-xs"
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                        <span>{showHint ? 'Hide Hint' : 'Hint'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Back of Card */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 w-full h-full bg-gradient-to-b from-emerald-50/90 via-white to-teal-50/60 dark:from-emerald-950/60 dark:via-zinc-900 dark:to-zinc-950 border-2 border-emerald-500 dark:border-emerald-600 rounded-3xl p-6 sm:p-9 flex flex-col justify-between shadow-xl transition-all">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    <span className="flex items-center space-x-1.5 uppercase tracking-wider">
                      <Sparkles className="w-4 h-4" />
                      <span>Synthesis & Answer</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200">
                      {currentIndex + 1} of {filteredCards.length}
                    </span>
                  </div>

                  <div className="my-auto py-4 text-center px-2">
                    <p className="text-base sm:text-xl text-zinc-900 dark:text-zinc-100 leading-relaxed font-semibold">
                      {activeCard.back}
                    </p>
                  </div>

                  <div className="text-center text-xs text-zinc-400 font-medium">
                    Tap to flip back to prompt
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hint Dropdown if revealed */}
          {showHint && activeCard.hint && (
            <div className="text-xs bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 p-3.5 rounded-2xl flex items-center space-x-2.5 animate-fadeIn">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
              <span><strong>Recall Hint:</strong> {activeCard.hint}</span>
            </div>
          )}

          {/* Navigation & Active Recall Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors shadow-xs"
                title="Previous card (Left Arrow)"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors shadow-xs"
                title="Next card (Right Arrow)"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Active Recall Scoring: Mastered vs Need Review */}
            <div className="flex items-center space-x-2.5 ml-auto">
              <button
                type="button"
                onClick={() => handleMarkStatus('review')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all shadow-xs ${
                  cardStatus[activeCard.id] === 'review'
                    ? 'bg-amber-100 dark:bg-amber-950 border-amber-400 text-amber-900 dark:text-amber-200'
                    : 'bg-zinc-50 dark:bg-zinc-800/90 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-amber-400'
                }`}
                title="Need more practice (Press R)"
              >
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Review Later</span>
              </button>

              <button
                type="button"
                onClick={() => handleMarkStatus('mastered')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all shadow-xs ${
                  cardStatus[activeCard.id] === 'mastered'
                    ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-400 text-emerald-900 dark:text-emerald-200'
                    : 'bg-zinc-50 dark:bg-zinc-800/90 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-emerald-400'
                }`}
                title="I know this! (Press K)"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Mastered</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
