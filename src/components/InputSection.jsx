import React, { useState } from 'react';
import { Send, Zap, X, CornerDownLeft, BookOpen, AlertCircle, Sparkles } from 'lucide-react';

const PRESET_TOPICS = [
  {
    label: 'React 19 & Fiber',
    text: 'React 19 Concurrent Mode, Fiber architecture, state reconciliation, stale closures in useEffect, and AbortController race-condition protection in asynchronous web applications.'
  },
  {
    label: 'CAP Theorem & Quorums',
    text: 'Distributed data consistency: CAP Theorem trade-offs (CP vs AP), network partition tolerance, quorum consensus (N/2 + 1), and split-brain resolution in distributed databases.'
  },
  {
    label: 'Mitochondrial Bioenergetics',
    text: 'Cellular respiration: Glycolysis in cytoplasm, Krebs cycle in mitochondrial matrix, electron transport chain across inner membrane, proton gradient, and ATP synthase mechanics.'
  }
];

export function InputSection({ onGenerate, status, onCancel, lastInput }) {
  const [inputText, setInputText] = useState(lastInput || '');
  const [streamEnabled, setStreamEnabled] = useState(true);
  const [provider, setProvider] = useState('auto');

  const isLoading = status === 'generating' || status === 'streaming';

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onGenerate(inputText.trim(), { stream: streamEnabled, provider });
  };

  const handleKeyDown = (e) => {
    // Ctrl+Enter or Cmd+Enter submits
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-4 sm:p-6 transition-colors">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Label & Presets */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label htmlFor="notes-input" className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center space-x-1.5">
            <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Paste your lecture notes, textbook excerpt, or topic</span>
          </label>
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
            <span className="text-zinc-400 font-medium whitespace-nowrap">Examples:</span>
            {PRESET_TOPICS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setInputText(preset.text)}
                className="whitespace-nowrap px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Free-form Text Input */}
        <div className="relative">
          <textarea
            id="notes-input"
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Paste notes on Photosynthesis, AWS IAM Policies, or write 'Explain Quantum Computing fundamentals'..."
            disabled={isLoading}
            className="w-full p-3.5 sm:p-4 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all resize-y disabled:opacity-60"
          />
          {inputText && (
            <button
              type="button"
              onClick={() => setInputText('')}
              className="absolute right-3 top-3 p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              title="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Controls row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Options: Stream & Provider */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600 dark:text-zinc-300">
            {/* Stream checkbox */}
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={streamEnabled}
                onChange={(e) => setStreamEnabled(e.target.checked)}
                disabled={isLoading}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800"
              />
              <span className="flex items-center space-x-1 font-medium">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Stream output</span>
              </span>
            </label>

            {/* Provider Selector */}
            <div className="flex items-center space-x-1.5">
              <span className="text-zinc-400">Engine:</span>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                disabled={isLoading}
                className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="auto">Auto Detect</option>
                <option value="gemini">Google Gemini</option>
                <option value="groq">Groq (Llama 3.3)</option>
                <option value="openai">OpenAI (GPT-4o-mini)</option>
                <option value="ollama">Local Ollama</option>
                <option value="mock">Simulated Mock Engine</option>
              </select>
            </div>

            <span className="text-zinc-400 hidden lg:inline">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 rounded">Ctrl+Enter</kbd> to submit
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2 ml-auto">
            {isLoading && (
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors border border-rose-200 dark:border-rose-800"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-500/20"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generating Study Deck...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Interactive Deck</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
