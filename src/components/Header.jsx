import React, { useState, useEffect } from 'react';
import { Sparkles, Moon, Sun, FolderHeart, ShieldAlert, Cpu } from 'lucide-react';

export function Header({ isDark, onToggleDark, onOpenSessions, onOpenSimulator, activeStatus }) {
  const [backendHealth, setBackendHealth] = useState({ provider: 'checking...', status: 'loading' });

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setBackendHealth({
          provider: data.hasApiKey ? data.activeProvider : 'mock engine',
          status: 'ready'
        });
      })
      .catch(() => {
        setBackendHealth({ provider: 'offline / mock', status: 'ready' });
      });
  }, []);

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-zinc-900 dark:text-white tracking-tight">
                StudyMate <span className="text-indigo-600 dark:text-indigo-400">AI</span>
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                v1.0
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
              Free-form Notes → Interactive Study Tools
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Active Provider Badge */}
          <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
            <Cpu className="w-3.5 h-3.5 text-indigo-500" />
            <span className="capitalize">{backendHealth.provider}</span>
          </div>

          {/* Failure Simulator Demo Button */}
          <button
            onClick={onOpenSimulator}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors shadow-xs"
            title="Test how the UI handles broken, empty, malformed, or slow AI output"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span className="hidden sm:inline">Test Failure Modes</span>
            <span className="sm:hidden">Fail Tests</span>
          </button>

          {/* Saved Sessions Drawer Button */}
          <button
            onClick={onOpenSessions}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <FolderHeart className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Saved Decks</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDark}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
          </button>
        </div>
      </div>
    </header>
  );
}
