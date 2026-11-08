import React from 'react';
import { X, ShieldAlert, Bug, Clock, ServerCrash, FileQuestion, ArrowRightLeft, Sparkles } from 'lucide-react';

export function FailureSimulatorModal({ isOpen, onClose, onTestMode }) {
  if (!isOpen) return null;

  const failureScenarios = [
    {
      mode: 'malformed_json',
      title: 'Malformed / Broken JSON Syntax',
      description: 'Simulates the model cutting off mid-stream or returning invalid JSON syntax with unclosed braces.',
      icon: Bug,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800'
    },
    {
      mode: 'wrong_shape',
      title: 'Wrong Schema / Missing Keys',
      description: 'Simulates the model returning valid JSON, but in an unexpected conversational format lacking flashcards or quiz arrays.',
      icon: FileQuestion,
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800'
    },
    {
      mode: 'empty_response',
      title: 'Empty Response ({})',
      description: 'Simulates the AI returning an empty object or zero content.',
      icon: ShieldAlert,
      color: 'text-zinc-500 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'
    },
    {
      mode: 'slow_timeout',
      title: 'Slow Server / Client Timeout',
      description: 'Simulates a 15-second hang to test the timeout safeguard and user cancel/abort capability.',
      icon: Clock,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800'
    },
    {
      mode: 'http_500',
      title: 'Upstream HTTP 500 Outage',
      description: 'Simulates an upstream provider error or rate-limit exhaustion.',
      icon: ServerCrash,
      color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800'
    },
    {
      mode: 'stale_race',
      title: 'Stale Request Race Condition',
      description: 'Fires slow Request #1 (takes 3s) and immediate Request #2 (300ms). Proves Request #1 NEVER overwrites newer state!',
      icon: ArrowRightLeft,
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800'
    }
  ];

  const handleSelect = (mode) => {
    onTestMode(mode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                AI Failure & Edge-Case Test Harness
              </h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Directly verify how the app defends against unpredictable LLM outputs without crashing.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Test Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {failureScenarios.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.mode}
                type="button"
                onClick={() => handleSelect(item.mode)}
                className="text-left p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-zinc-50/50 dark:bg-zinc-950/50 hover:bg-white dark:hover:bg-zinc-900 transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className={`p-2 rounded-xl border ${item.color}`}>
                      <IconComponent className="w-4 h-4" />
                    </span>
                    <span className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center space-x-1 pt-1">
                  <span>Trigger Simulation</span>
                  <span>→</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info note */}
        <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
          <strong>Evaluation Note:</strong> Each scenario tests specific defensive mechanisms: JSON repair heuristics, Zod/schema validation guards, AbortController cancellation, sequence token matching, and user retry UI.
        </div>
      </div>
    </div>
  );
}
