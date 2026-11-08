import React, { useState } from 'react';
import { AlertTriangle, RotateCcw, ChevronDown, ChevronUp, Bug } from 'lucide-react';

export function ErrorState({ error, onRetry, onDismiss }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!error) return null;

  return (
    <div className="bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl p-5 shadow-xs transition-colors space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm sm:text-base text-rose-950 dark:text-rose-200">
              {error.type === 'timeout'
                ? 'Request Timed Out'
                : error.type === 'validation'
                ? 'Validation Notice'
                : 'Defensive Handler Caught Error'}
            </h4>
            <p className="text-xs sm:text-sm text-rose-800 dark:text-rose-300 mt-1 leading-relaxed">
              {error.message}
            </p>
          </div>
        </div>

        {/* Retry button */}
        {error.recoverable && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition-all shadow-sm shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        )}
      </div>

      {/* Raw error payload toggle */}
      {error.rawResponse && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowDetails(prev => !prev)}
            className="flex items-center space-x-1 text-[11px] font-medium text-rose-700 dark:text-rose-400 hover:underline"
          >
            <Bug className="w-3 h-3" />
            <span>{showDetails ? 'Hide Diagnostics' : 'Inspect Raw Payload / Diagnostics'}</span>
            {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showDetails && (
            <pre className="mt-2 p-3 rounded-xl bg-zinc-900 text-zinc-300 text-[11px] font-mono whitespace-pre-wrap break-all border border-zinc-800 max-h-40 overflow-y-auto">
              {typeof error.rawResponse === 'string'
                ? error.rawResponse
                : JSON.stringify(error.rawResponse, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
