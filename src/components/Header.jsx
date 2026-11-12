import React, { useState, useEffect } from 'react';
import { Sparkles, Moon, Sun, FolderHeart, ShieldAlert, Cpu, Volume2, VolumeX, GraduationCap, ChevronDown, UserRound, Settings, Flame } from 'lucide-react';
import { sound } from '../utils/soundEffects';

export function Header({ isDark, onToggleDark, onOpenSessions, onOpenSimulator, activeStatus }) {
  const [backendHealth, setBackendHealth] = useState({ provider: 'checking...', status: 'loading' });
  const [isMuted, setIsMuted] = useState(sound.isMuted);
  const [profileOpen, setProfileOpen] = useState(false);

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
      <div className="max-w-6xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2">
        {/* Brand / Logo with Real Product Icon */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/20">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg text-zinc-900 dark:text-white tracking-tight">
                StudyMate<span className="text-emerald-600 dark:text-emerald-400">.ai</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Scholar Pro</span>
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:block">
              Interactive EdTech Workspace · Active Recall & Testing
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1 sm:space-x-3">
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
              <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            )}
          </button>

          {/* Active Provider Badge */}
          <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100/80 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
            <Cpu className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="capitalize">{backendHealth.provider}</span>
          </div>

          {/* Failure Simulator Demo Button */}
          <button
            onClick={onOpenSimulator}
            className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all shadow-xs"
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
            <span className="hidden md:inline">Decks</span>
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
          <div className="relative pl-1 border-l border-zinc-200 dark:border-zinc-800">
            <button type="button" aria-expanded={profileOpen} aria-haspopup="menu" onClick={() => setProfileOpen(value => !value)} className="flex items-center gap-1.5 rounded-xl p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500" aria-label="Open student profile menu">
              <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-700 text-white font-bold text-xs flex items-center justify-center ring-2 ring-white dark:ring-zinc-900 shadow-xs">KK</span><ChevronDown className="hidden sm:block w-3.5 h-3.5 text-zinc-500" />
            </button>
            {profileOpen && <div role="menu" className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2 shadow-xl animate-fadeIn">
              <div className="p-3 border-b border-zinc-100 dark:border-zinc-800"><div className="flex items-center gap-3"><span className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-700 text-white font-bold flex items-center justify-center">KK</span><div><p className="font-bold text-sm text-zinc-900 dark:text-white">Your profile</p><p className="text-xs text-zinc-500">Local learner</p></div></div></div>
              <div className="grid grid-cols-2 gap-2 p-2"><div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-2.5"><p className="text-[10px] text-zinc-500">Study streak</p><p className="font-bold text-sm flex gap-1 items-center"><Flame className="w-3.5 h-3.5 text-orange-500"/>Keep it up</p></div><div className="rounded-xl bg-zinc-50 dark:bg-zinc-800 p-2.5"><p className="text-[10px] text-zinc-500">Workspace</p><p className="font-bold text-sm">Personal</p></div></div>
              <button role="menuitem" onClick={() => { onOpenSessions(); setProfileOpen(false); }} className="w-full text-left flex gap-2 items-center p-2.5 rounded-xl text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"><FolderHeart className="w-4 h-4 text-amber-500"/> My study decks</button>
              <button role="menuitem" onClick={() => { onToggleDark(); setProfileOpen(false); }} className="w-full text-left flex gap-2 items-center p-2.5 rounded-xl text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"><Settings className="w-4 h-4 text-zinc-500"/> Preferences <span className="ml-auto text-xs text-zinc-400">{isDark ? 'Dark' : 'Light'}</span></button>
              <p className="px-2.5 py-2 text-[10px] text-zinc-400">Profile is stored locally on this device</p>
            </div>}
          </div>
        </div>
      </div>
    </header>
  );
}
