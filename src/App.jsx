import React, { useState } from 'react';
import { useDarkMode } from './hooks/useDarkMode';
import { useStudyAssistant } from './hooks/useStudyAssistant';
import { useSessions } from './hooks/useSessions';

import { Header } from './components/Header';
import { InputSection } from './components/InputSection';
import { OverviewBlock } from './components/OverviewBlock';
import { FlashcardBlock } from './components/FlashcardBlock';
import { QuizBlock } from './components/QuizBlock';
import { CheatsheetBlock } from './components/CheatsheetBlock';
import { RefinementBar } from './components/RefinementBar';
import { StreamingPreview } from './components/StreamingPreview';
import { FailureSimulatorModal } from './components/FailureSimulatorModal';
import { SessionDrawer } from './components/SessionDrawer';
import { ErrorState } from './components/ErrorState';
import { EmptyState } from './components/EmptyState';

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
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'flashcards' | 'quiz' | 'cheatsheet'

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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors">
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Viewing Mode:</span>
                <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-xl text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      activeTab === 'all'
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    All Blocks
                  </button>
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
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
                >
                  Save Deck
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Clear Deck
                </button>
              </div>
            </div>

            {/* Block 1: Overview & Objectives */}
            <OverviewBlock deck={deck} />

            {/* Block 2: Interactive Flashcards */}
            {(activeTab === 'all' || activeTab === 'flashcards') && (
              <FlashcardBlock flashcards={deck.flashcards} />
            )}

            {/* Block 3: Interactive Quiz with "Re-Test Wrong Answers" mode */}
            {(activeTab === 'all' || activeTab === 'quiz') && (
              <QuizBlock quiz={deck.quiz} />
            )}

            {/* Block 4: High-Yield Cheatsheet */}
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
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6 text-center text-xs text-zinc-500 dark:text-zinc-400 mt-auto">
        <p>Built for the Frontend Internship Assignment · Defensive AI UI Architecture</p>
      </footer>
    </div>
  );
}
