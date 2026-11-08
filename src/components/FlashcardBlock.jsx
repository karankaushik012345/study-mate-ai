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
  HelpCircle
} from 'lucide-react';

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

  // Keep index within bounds of filtered list
  const activeCard = filteredCards[currentIndex] || filteredCards[0];

  const handleNext = useCallback(() => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex(prev => (prev + 1) % filteredCards.length);
  }, [filteredCards.length]);

  const handlePrev = useCallback(() => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex(prev => (prev - 1 + filteredCards.length) % filteredCards.length);
  }, [filteredCards.length]);

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  const handleMarkStatus = useCallback((status) => {
    if (!activeCard) return;
    setCardStatus(prev => ({ ...prev, [activeCard.id]: status }));
    // Auto advance to next card for frictionless study flow
    handleNext();
  }, [activeCard, handleNext]);

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in a textarea or input
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
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs p-5 sm:p-6 transition-colors space-y-5">
      {/* Block Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center space-x-2">
              <RotateCw className="w-5 h-5 text-indigo-500" />
              <span>Interactive Flashcards</span>
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
              {progressPercent}% Mastered
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Space to flip · Arrow keys to navigate · K for Mastered · R for Review
          </p>
        </div>

        {/* Filter Pills & Shuffle */}
        <div className="flex items-center space-x-1.5 self-start sm:self-center">
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => { setFilterMode('all'); setCurrentIndex(0); }}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterMode === 'all'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              All ({cards.length})
            </button>
            <button
              type="button"
              onClick={() => { setFilterMode('review'); setCurrentIndex(0); }}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterMode === 'review'
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Review ({reviewCount})
            </button>
            <button
              type="button"
              onClick={() => { setFilterMode('mastered'); setCurrentIndex(0); }}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterMode === 'mastered'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Known ({masteredCount})
            </button>
          </div>

          <button
            type="button"
            onClick={handleShuffle}
            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Shuffle flashcards"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-indigo-600 h-full transition-all duration-300 ease-out"
          style={{ width: `${((currentIndex + 1) / (filteredCards.length || 1)) * 100}%` }}
        />
      </div>

      {/* Empty State for Filter */}
      {filteredCards.length === 0 ? (
        <div className="py-12 text-center text-zinc-500 dark:text-zinc-400 space-y-2">
          <p className="text-sm font-medium">No flashcards match the "{filterMode}" filter.</p>
          <button
            onClick={() => setFilterMode('all')}
            className="text-xs text-indigo-600 dark:text-indigo-400 underline font-semibold"
          >
            Show all flashcards
          </button>
        </div>
      ) : (
        /* The 3D Flip Card Container */
        <div className="space-y-4">
          <div
            onClick={handleFlip}
            className="relative min-h-[220px] sm:min-h-[260px] w-full rounded-2xl cursor-pointer perspective-1000 select-none group"
            role="button"
            tabIndex={0}
            aria-label="Click to flip flashcard"
          >
            <div
              className={`w-full h-full min-h-[220px] sm:min-h-[260px] duration-500 transform-style-preserve-3d transition-transform relative rounded-2xl ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* Front of Card */}
              <div className="absolute inset-0 backface-hidden w-full h-full bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 group-hover:border-indigo-400 dark:group-hover:border-indigo-600/60 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-sm transition-colors">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                  <span className="flex items-center space-x-1 uppercase tracking-wider">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Prompt / Term</span>
                  </span>
                  <span>Card {currentIndex + 1} of {filteredCards.length}</span>
                </div>

                <div className="my-auto py-4 text-center">
                  <h4 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                    {activeCard.front}
                  </h4>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="flex items-center space-x-1">
                    <Keyboard className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Click or Space to flip</span>
                  </span>
                  {activeCard.hint && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowHint(prev => !prev);
                      }}
                      className="flex items-center space-x-1 px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-medium hover:bg-amber-100 transition-colors"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                      <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Back of Card */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 w-full h-full bg-gradient-to-br from-indigo-50/70 to-white dark:from-indigo-950/40 dark:to-zinc-900 border-2 border-indigo-200 dark:border-indigo-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-sm transition-colors">
                <div className="flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  <span className="flex items-center space-x-1 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Explanation / Definition</span>
                  </span>
                  <span className="text-zinc-400">Card {currentIndex + 1} of {filteredCards.length}</span>
                </div>

                <div className="my-auto py-4 text-center">
                  <p className="text-base sm:text-lg text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                    {activeCard.back}
                  </p>
                </div>

                <div className="text-center text-xs text-zinc-400">
                  Click to flip back to prompt
                </div>
              </div>
            </div>
          </div>

          {/* Hint Dropdown if revealed */}
          {showHint && activeCard.hint && (
            <div className="text-xs bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 p-3 rounded-xl flex items-center space-x-2 animate-fadeIn">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
              <span><strong>Hint:</strong> {activeCard.hint}</span>
            </div>
          )}

          {/* Navigation & Active Recall Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {/* Prev / Next buttons */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                title="Previous card (Left Arrow)"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                title="Next card (Right Arrow)"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Active Recall Scoring: Mastered vs Need Review */}
            <div className="flex items-center space-x-2 ml-auto">
              <button
                type="button"
                onClick={() => handleMarkStatus('review')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  cardStatus[activeCard.id] === 'review'
                    ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200'
                    : 'bg-zinc-50 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-amber-300'
                }`}
                title="Need more practice (Press R)"
              >
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Review Later</span>
              </button>

              <button
                type="button"
                onClick={() => handleMarkStatus('mastered')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  cardStatus[activeCard.id] === 'mastered'
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                    : 'bg-zinc-50 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-emerald-300'
                }`}
                title="I know this! (Press K)"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Mastered</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
