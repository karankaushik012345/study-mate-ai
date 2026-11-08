import React, { useState, useEffect } from 'react';
import { Sparkles, Moon, Sun, FolderHeart, ShieldAlert, Cpu, Volume2, VolumeX, GraduationCap } from 'lucide-react';
import { sound } from '../utils/soundEffects';

export function Header({ isDark, onToggleDark, onOpenSessions, onOpenSimulator, activeStatus }) {
  const [backendHealth, setBackendHealth] = useState({ provider: 'checking...', status: 'loading' });
  const [isMuted, setIsMuted] = useState(sound.isMuted);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setBackendHealth({
          provider: data.hasApiKey ? data.activeProvider : 'instant engine',
          status: 'ready'
        });
      })
      .catch(() => {
        setBackendHealth({ provider: 'offline / mock', status: 'ready' });
      });
  }, []);

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playClick();
  };

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/85 dark:bg-zinc-950/85 border-b border-zinc-200/80 dark:border-zinc-800 transition-colors shadow-xs">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand / Logo with Real Product Icon */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-500/20">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg text-zinc-900 dark:text-white tracking-tight">
                StudyMate<span className="text-indigo-600 dark:text-indigo-400">.ai</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Pro Suite</span>
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:block">
              Interactive EdTech Workspace · Active Recall & Testing
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Sound FX Toggle */}
          <button
            onClick={handleToggleSound}
            aria-label="Toggle Sound Effects"
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
            title={isMuted ? 'Sound FX Muted (Click to enable)' : 'Sound FX Enabled (Click to mute)'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-zinc-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-indigo-500" />
            )}
          </button>

          {/* Active Provider Badge */}
          <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100/80 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
            <Cpu className="w-3.5 h-3.5 text-indigo-500" />
            <span className="capitalize">{backendHealth.provider}</span>
          </div>

          {/* Failure Simulator Demo Button */}
          <button
            onClick={onOpenSimulator}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all shadow-xs"
            title="Test how the UI defends against broken, empty, malformed, or slow AI output"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span className="hidden sm:inline">Failure Simulator</span>
            <span className="sm:hidden">Tests</span>
          </button>

          {/* Saved Sessions Drawer Button */}
          <button
            onClick={onOpenSessions}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all shadow-xs"
          >
            <FolderHeart className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Decks</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDark}
            aria-label="Toggle theme"
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
          </button>

          {/* Student Avatar Icon */}
          <div className="hidden lg:flex items-center pl-1 border-l border-zinc-200 dark:border-zinc-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-white dark:ring-zinc-900 shadow-xs" title="Logged in as Student">
              KK
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
