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
  Award,
  Sparkles
} from 'lucide-react';
import { sound } from '../utils/soundEffects';

export function QuizBlock({ quiz }) {
  const [questions, setQuestions] = useState(quiz || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [wrongQuestionIds, setWrongQuestionIds] = useState(new Set());
  const [isCompleted, setIsCompleted] = useState(false);
  const [isRetestMode, setIsRetestMode] = useState(false);

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

  const handleSelectOption = useCallback((optionIdx) => {
    if (!activeQuestion || hasAnsweredCurrent) return;

    const isCorrect = optionIdx === activeQuestion.correctIndex;
    if (isCorrect) {
      sound.playCorrect();
    } else {
      sound.playIncorrect();
    }

    setSelectedAnswers(prev => ({
      ...prev,
      [activeQuestion.id]: optionIdx
    }));

    if (!isCorrect) {
      setWrongQuestionIds(prev => new Set([...prev, activeQuestion.id]));
    }
  }, [activeQuestion, hasAnsweredCurrent]);

  const handleNext = () => {
    sound.playClick();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
      const totalCorrect = questions.filter(
        q => selectedAnswers[q.id] === q.correctIndex
      ).length;

      if (totalCorrect === questions.length) {
        sound.playCorrect();
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch {}
      }
    }
  };

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

  const handleRetakeFull = () => {
    sound.playClick();
    setQuestions(quiz || []);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setWrongQuestionIds(new Set());
    setIsCompleted(false);
    setIsRetestMode(false);
  };

  const handleRetestWrong = () => {
    sound.playClick();
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

  const totalCorrect = questions.filter(
    q => selectedAnswers[q.id] === q.correctIndex
  ).length;
  const scorePercent = Math.round((totalCorrect / questions.length) * 100);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-md p-5 sm:p-7 transition-colors space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-indigo-500" />
              <span>Interactive Knowledge Check</span>
            </h3>
            {isRetestMode && (
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                Targeted Re-Test
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Keys 1-4 to select options · Real-time conceptual explanations
          </p>
        </div>

        {/* Live Score Pill */}
        <div className="flex items-center space-x-2 self-start sm:self-center">
          <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-xs">
            Score: {totalCorrect} / {questions.length} ({scorePercent}%)
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-indigo-500 to-violet-600 h-full transition-all duration-300 ease-out"
          style={{ width: `${((currentIndex + (isCompleted ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      {/* Completion View */}
      {isCompleted ? (
        <div className="py-10 text-center space-y-6 animate-fadeIn">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-xl shadow-orange-500/25">
            {scorePercent === 100 ? (
              <Trophy className="w-10 h-10 fill-white" />
            ) : scorePercent >= 70 ? (
              <Award className="w-10 h-10" />
            ) : (
              <Flame className="w-10 h-10" />
            )}
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h4 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
              {scorePercent === 100
                ? 'Flawless Mastery! 100%'
                : scorePercent >= 70
                ? 'Great Performance!'
                : 'Keep Practicing!'}
            </h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              You answered <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{totalCorrect}</span> out of{' '}
              <span className="font-extrabold text-zinc-900 dark:text-zinc-100">{questions.length}</span> questions correctly.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {wrongQuestionIds.size > 0 && (
              <button
                type="button"
                onClick={handleRetestWrong}
                className="flex items-center space-x-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-600 active:scale-95 text-white shadow-lg shadow-amber-500/25 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Re-Test {wrongQuestionIds.size} Missed Question{wrongQuestionIds.size > 1 ? 's' : ''}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleRetakeFull}
              className="flex items-center space-x-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Entire Exam</span>
            </button>
          </div>
        </div>
      ) : (
        /* Active Question Card */
        <div className="space-y-5">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
            <span className="uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
              Single Choice
            </span>
          </div>

          <h4 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
            {activeQuestion.question}
          </h4>

          {/* Options List with Real SaaS Styling */}
          <div className="space-y-3 pt-1">
            {activeQuestion.options.map((opt, idx) => {
              const isSelected = currentChosenIndex === idx;
              const isCorrectOption = idx === activeQuestion.correctIndex;

              let btnStyle = 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-xs';

              if (hasAnsweredCurrent) {
                if (isCorrectOption) {
                  btnStyle = 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/20 shadow-md';
                } else if (isSelected && !isCorrectOption) {
                  btnStyle = 'bg-rose-50 dark:bg-rose-950/70 border-rose-500 text-rose-950 dark:text-rose-100 ring-2 ring-rose-500/20 animate-shake shadow-md';
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
                  className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm flex items-start space-x-3.5 transition-all ${btnStyle}`}
                >
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 transition-colors ${
                    hasAnsweredCurrent && isCorrectOption
                      ? 'bg-emerald-600 text-white'
                      : hasAnsweredCurrent && isSelected && !isCorrectOption
                      ? 'bg-rose-600 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="grow font-medium leading-relaxed">{opt}</span>
                  {hasAnsweredCurrent && isCorrectOption && (
                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  {hasAnsweredCurrent && isSelected && !isCorrectOption && (
                    <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Callout after answering */}
          {hasAnsweredCurrent && (
            <div className="space-y-4 pt-2 animate-fadeIn">
              <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 space-y-1.5 shadow-xs">
                <div className="flex items-center space-x-2 font-extrabold text-indigo-950 dark:text-indigo-200">
                  <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Cognitive Rationale & Misconception Analysis:</span>
                </div>
                <p className="leading-relaxed pl-6 text-zinc-700 dark:text-zinc-300">{activeQuestion.explanation}</p>
              </div>

              {/* Next Question Button */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-500/25"
                >
                  <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'View Exam Results'}</span>
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
