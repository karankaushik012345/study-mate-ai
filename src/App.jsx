import React, { useState } from 'react';
import { useDarkMode } from './hooks/useDarkMode';
import { useStudyAssistant } from './hooks/useStudyAssistant';
import { useSessions } from './hooks/useSessions';

import { Header } from './components/Header';
import { InputSection } from './components/InputSection';
import { OverviewBlock } from './components/OverviewBlock';
import { DeepDiveBlock } from './components/DeepDiveBlock';
import { FlashcardBlock } from './components/FlashcardBlock';
import { QuizBlock } from './components/QuizBlock';
import { CheatsheetBlock } from './components/CheatsheetBlock';
import { RefinementBar } from './components/RefinementBar';
import { StreamingPreview } from './components/StreamingPreview';
import { FailureSimulatorModal } from './components/FailureSimulatorModal';
import { SessionDrawer } from './components/SessionDrawer';
import { ErrorState } from './components/ErrorState';
import { EmptyState } from './components/EmptyState';
import { StudyStreakWidget } from './components/StudyStreakWidget';

import { RotateCcw, Sparkles, BookOpen, Layers, CheckCircle2, Bookmark } from 'lucide-react';

export default function App() {
  const { isDark, toggleDarkMode } = useDarkMode();
  const {
    deck,
    setDeck,
    status,
    statusMessage,
    error,
    streamBuffer,
    generateDeck,
    refineDeck,
    testFailureMode,
    cancelActiveRequest,
    retryLast,
    reset
  } = useStudyAssistant();

  const {
    sessions,
    saveDeck,
    deleteDeck,
    renameDeck,
    exportSessionsToJSON,
    importSessionsFromJSON
  } = useSessions();

  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'deepdive' | 'flashcards' | 'quiz' | 'cheatsheet'

  const handleGenerate = (text, options) => {
    generateDeck(text, options);
  };

  const handlePresetSelect = (presetTitle) => {
    generateDeck(presetTitle, { stream: true, provider: 'auto' });
  };

  const handleRefine = (instruction) => {
    refineDeck(instruction);
  };

  return (
    <div className={`relative min-h-screen text-zinc-900 dark:text-zinc-100 flex flex-col font-sans overflow-x-hidden ${isDark ? 'animated-bg-dark' : 'animated-bg-light'}`}>
      {/* ── Floating ambient orbs (decorative, pointer-events-none) ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
        {/* Top-left teal orb */}
        <div className="orb-a absolute -top-32 -left-32 w-96 h-96 rounded-full
          bg-emerald-500/10 dark:bg-emerald-400/8 blur-3xl" />
        {/* Bottom-right forest orb */}
        <div className="orb-b absolute -bottom-24 -right-24 w-[480px] h-[480px] rounded-full
          bg-teal-600/10 dark:bg-teal-500/8 blur-3xl" />
        {/* Centre amber glow */}
        <div className="orb-c absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-80 h-80 rounded-full bg-amber-400/6 dark:bg-amber-300/5 blur-3xl" />
        {/* Extra small accent — top-right */}
        <div className="orb-a absolute top-20 right-10 w-48 h-48 rounded-full
          bg-lime-500/8 dark:bg-lime-400/6 blur-2xl" />
      </div>

      {/* ── All content sits above orbs ── */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header Bar */}
        <Header
          isDark={isDark}
          onToggleDark={toggleDarkMode}
          onOpenSessions={() => setIsDrawerOpen(true)}
          onOpenSimulator={() => setIsSimulatorOpen(true)}
          activeStatus={status}
        />

        {/* Main Content Area */}
        <main className="grow max-w-5xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
          {/* Daily Study Streak & Goal Tracker */}
          <StudyStreakWidget />

          {/* Input Section (Always accessible) */}
          <InputSection
            onGenerate={handleGenerate}
            status={status}
            onCancel={cancelActiveRequest}
            lastInput=""
          />

          {/* Error Notification Banner */}
          {error && (
            <ErrorState
              error={error}
              onRetry={retryLast}
              onDismiss={() => {}}
            />
          )}

          {/* Streaming Real-Time Status & Chunk Viewer */}
          {status === 'streaming' && (
            <StreamingPreview
              streamBuffer={streamBuffer}
              statusMessage={statusMessage}
            />
          )}

          {/* Active Study Deck Rendering */}
          {deck ? (
            <div className="space-y-6 animate-fadeIn">
              {/* Action Bar: Deck Title & Tab View Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm p-3 sm:p-4 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 shadow-xs">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mr-1">View:</span>
                  <div className="flex items-center bg-zinc-100/80 dark:bg-zinc-800/80 p-0.5 rounded-xl text-xs font-medium gap-0.5 max-w-full overflow-x-auto study-tabs">
                    {/* All Blocks */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('all')}
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        activeTab === 'all'
                          ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      All
                    </button>
                    {/* Deep Dive */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('deepdive')}
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        activeTab === 'deepdive'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      📖 Deep Dive
                    </button>
                    {/* Flashcards */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('flashcards')}
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        activeTab === 'flashcards'
                          ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      Flashcards ({deck.flashcards?.length || 0})
                    </button>
                    {/* Quiz */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('quiz')}
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        activeTab === 'quiz'
                          ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      Quiz ({deck.quiz?.length || 0})
                    </button>
                    {/* Cheatsheet */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('cheatsheet')}
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        activeTab === 'cheatsheet'
                          ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      Cheatsheet
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => saveDeck(deck)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
                  >
                    Save Deck
                  </button>
                  <button
                    type="button"
                    onClick={reset}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 transition-colors"
                  >
                    Clear Deck
                  </button>
                </div>
              </div>

              {/* Block 1: Overview & Objectives (always visible) */}
              {activeTab === 'all' && <OverviewBlock deck={deck} />}

              {/* Block 2: Deep Dive Explanation */}
              {(activeTab === 'all' || activeTab === 'deepdive') && (
                <DeepDiveBlock deepDive={deck.deepDive} topic={deck.topic} title={deck.title} />
              )}

              {/* Block 3: Interactive Flashcards */}
              {(activeTab === 'all' || activeTab === 'flashcards') && (
                <FlashcardBlock flashcards={deck.flashcards} />
              )}

              {/* Block 4: Interactive Quiz with "Re-Test Wrong Answers" mode */}
              {(activeTab === 'all' || activeTab === 'quiz') && (
                <QuizBlock quiz={deck.quiz} />
              )}

              {/* Block 5: High-Yield Cheatsheet */}
              {(activeTab === 'all' || activeTab === 'cheatsheet') && (
                <CheatsheetBlock cheatsheet={deck.cheatsheet} />
              )}

              {/* Refinement Follow-up Loop */}
              <RefinementBar
                onRefine={handleRefine}
                isRefining={status === 'refining'}
              />
            </div>
          ) : (
            /* Empty / Onboarding State */
            status !== 'streaming' && status !== 'generating' && (
              <EmptyState
                onSelectPreset={handlePresetSelect}
                onLoadSample={(sampleDeck) => setDeck(sampleDeck)}
              />
            )
          )}
        </main>

        {/* Failure Simulator Modal for Live Testing */}
        <FailureSimulatorModal
          isOpen={isSimulatorOpen}
          onClose={() => setIsSimulatorOpen(false)}
          onTestMode={testFailureMode}
        />

        {/* Saved Sessions Drawer */}
        <SessionDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          sessions={sessions}
          activeDeck={deck}
          onLoadDeck={(loadedDeck) => setDeck(loadedDeck)}
          onSaveDeck={saveDeck}
          onDeleteDeck={deleteDeck}
          onRenameDeck={renameDeck}
          onExport={exportSessionsToJSON}
          onImport={importSessionsFromJSON}
        />

        {/* Footer */}
        <footer className="border-t border-zinc-200/60 dark:border-zinc-800/60 py-6 text-center text-xs text-zinc-500 dark:text-zinc-400 mt-auto bg-white/30 dark:bg-zinc-900/30 backdrop-blur-sm">
          <p>Built for the Frontend Internship Assignment · Defensive AI UI Architecture</p>
        </footer>
      </div>
    </div>
  );
}
