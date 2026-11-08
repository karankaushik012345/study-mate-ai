import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  CheckCircle,
  XCircle,
  RotateCcw,
  Trophy,
  ArrowRight,
  Info,
  Flame,
  Award
} from 'lucide-react';

export function QuizBlock({ quiz }) {
  const [questions, setQuestions] = useState(quiz || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: chosenOptionIndex }
  const [wrongQuestionIds, setWrongQuestionIds] = useState(new Set());
  const [isCompleted, setIsCompleted] = useState(false);
  const [isRetestMode, setIsRetestMode] = useState(false);

  // Sync when deck changes
  useEffect(() => {
    setQuestions(quiz || []);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setWrongQuestionIds(new Set());
    setIsCompleted(false);
    setIsRetestMode(false);
  }, [quiz]);

  const activeQuestion = questions[currentIndex];
  const hasAnsweredCurrent = activeQuestion ? selectedAnswers[activeQuestion.id] !== undefined : false;
  const currentChosenIndex = activeQuestion ? selectedAnswers[activeQuestion.id] : null;

  // Handle option selection
  const handleSelectOption = useCallback((optionIdx) => {
    if (!activeQuestion || hasAnsweredCurrent) return;

    const isCorrect = optionIdx === activeQuestion.correctIndex;

    setSelectedAnswers(prev => ({
      ...prev,
      [activeQuestion.id]: optionIdx
    }));

    if (!isCorrect) {
      setWrongQuestionIds(prev => new Set([...prev, activeQuestion.id]));
    }
  }, [activeQuestion, hasAnsweredCurrent]);

  // Navigate to next question or complete quiz
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
      // If scored 100%, trigger confetti celebration
      const totalCorrect = questions.filter(
        q => selectedAnswers[q.id] === q.correctIndex
      ).length;

      if (totalCorrect === questions.length) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore confetti on headless env
        }
      }
    }
  };

  // Keyboard shortcut listener for options (1, 2, 3, 4)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (isCompleted || !activeQuestion) return;

      if (!hasAnsweredCurrent) {
        if (['1', '2', '3', '4'].includes(e.key)) {
          const idx = parseInt(e.key, 10) - 1;
          if (idx < (activeQuestion.options?.length || 0)) {
            e.preventDefault();
            handleSelectOption(idx);
          }
        }
      } else {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeQuestion, hasAnsweredCurrent, isCompleted, handleSelectOption]);

  // Retake full quiz
  const handleRetakeFull = () => {
    setQuestions(quiz || []);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setWrongQuestionIds(new Set());
    setIsCompleted(false);
    setIsRetestMode(false);
  };

  // Re-test wrong answers ONLY (Crucial assignment requirement)
  const handleRetestWrong = () => {
    const missed = (quiz || []).filter(q => wrongQuestionIds.has(q.id));
    if (missed.length === 0) return;

    setQuestions(missed);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setWrongQuestionIds(new Set());
    setIsCompleted(false);
    setIsRetestMode(true);
  };

  if (!questions || questions.length === 0) return null;

  // Calculate live score
  const totalCorrect = questions.filter(
    q => selectedAnswers[q.id] === q.correctIndex
  ).length;
  const scorePercent = Math.round((totalCorrect / questions.length) * 100);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs p-5 sm:p-6 transition-colors space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-indigo-500" />
              <span>Interactive Quiz</span>
            </h3>
            {isRetestMode && (
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                Targeted Re-Test
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Press keys 1-4 to select options · Instant explanations provided
          </p>
        </div>

        {/* Live Score Pill */}
        <div className="flex items-center space-x-2 self-start sm:self-center">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
            Score: {totalCorrect} / {questions.length} ({scorePercent}%)
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-indigo-600 h-full transition-all duration-300 ease-out"
          style={{ width: `${((currentIndex + (isCompleted ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      {/* Completion View */}
      {isCompleted ? (
        <div className="py-8 text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            {scorePercent === 100 ? (
              <Trophy className="w-8 h-8 text-amber-500" />
            ) : scorePercent >= 70 ? (
              <Award className="w-8 h-8 text-indigo-500" />
            ) : (
              <Flame className="w-8 h-8 text-rose-500" />
            )}
          </div>

          <div>
            <h4 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {scorePercent === 100
                ? 'Flawless Mastery! 100%'
                : scorePercent >= 70
                ? 'Great Job! Strong Understanding'
                : 'Good Effort! Review & Solidify'}
            </h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              You answered <span className="font-semibold text-zinc-900 dark:text-zinc-200">{totalCorrect}</span> out of{' '}
              <span className="font-semibold text-zinc-900 dark:text-zinc-200">{questions.length}</span> questions correctly.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {/* Re-test wrong answers only */}
            {wrongQuestionIds.size > 0 && (
              <button
                type="button"
                onClick={handleRetestWrong}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Re-Test {wrongQuestionIds.size} Missed Question{wrongQuestionIds.size > 1 ? 's' : ''}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleRetakeFull}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Entire Quiz</span>
            </button>
          </div>
        </div>
      ) : (
        /* Active Question Card */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 dark:text-zinc-500">
            <span className="uppercase tracking-wider">Question {currentIndex + 1} of {questions.length}</span>
            <span>Single Choice</span>
          </div>

          <h4 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
            {activeQuestion.question}
          </h4>

          {/* Options List */}
          <div className="space-y-2.5 pt-1">
            {activeQuestion.options.map((opt, idx) => {
              const isSelected = currentChosenIndex === idx;
              const isCorrectOption = idx === activeQuestion.correctIndex;

              let btnStyle = 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-indigo-300 dark:hover:border-indigo-700';

              if (hasAnsweredCurrent) {
                if (isCorrectOption) {
                  btnStyle = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/20';
                } else if (isSelected && !isCorrectOption) {
                  btnStyle = 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 dark:border-rose-700 text-rose-950 dark:text-rose-100 ring-2 ring-rose-500/20 animate-shake';
                } else {
                  btnStyle = 'bg-zinc-50 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(idx)}
                  disabled={hasAnsweredCurrent}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm flex items-start space-x-3 transition-all ${btnStyle}`}
                >
                  <span className="w-5 h-5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="grow">{opt}</span>
                  {hasAnsweredCurrent && isCorrectOption && (
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  {hasAnsweredCurrent && isSelected && !isCorrectOption && (
                    <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Callout after answering */}
          {hasAnsweredCurrent && (
            <div className="space-y-3 pt-2 animate-fadeIn">
              <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 space-y-1">
                <div className="flex items-center space-x-1.5 font-bold text-indigo-900 dark:text-indigo-300">
                  <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Explanation:</span>
                </div>
                <p className="leading-relaxed pl-5">{activeQuestion.explanation}</p>
              </div>

              {/* Next Question Button */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'View Results'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
