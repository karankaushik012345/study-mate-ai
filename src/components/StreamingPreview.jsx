import React, { useState } from 'react';
import { Terminal, ChevronDown, ChevronUp, Zap } from 'lucide-react';

export function StreamingPreview({ streamBuffer, statusMessage }) {
  const [showRaw, setShowRaw] = useState(false);

  if (!streamBuffer) return null;

  return (
    <div className="bg-zinc-900 text-zinc-200 rounded-2xl border border-zinc-800 p-4 shadow-md space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-indigo-400">
          <Zap className="w-4 h-4 animate-pulse text-amber-400" />
          <span className="font-semibold">{statusMessage || 'Streaming structured payload...'}</span>
        </div>
        <div className="flex items-center space-x-3 text-zinc-400">
          <span>{streamBuffer.length} characters</span>
          <button
            type="button"
            onClick={() => setShowRaw(prev => !prev)}
            className="flex items-center space-x-1 text-zinc-400 hover:text-white transition-colors"
          >
            <span>{showRaw ? 'Hide Raw' : 'View Stream'}</span>
            {showRaw ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Progress animation bar */}
      <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-500 animate-pulse w-3/4 rounded-full" />
      </div>

      {showRaw && (
        <pre className="max-h-48 overflow-y-auto p-3 rounded-lg bg-black/60 text-emerald-400 text-[11px] leading-tight whitespace-pre-wrap break-all border border-zinc-800">
          {streamBuffer}
        </pre>
      )}
    </div>
  );
}
