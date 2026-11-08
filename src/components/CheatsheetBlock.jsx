import React, { useState } from 'react';
import { Bookmark, Search, Copy, Check, Sparkles } from 'lucide-react';

export function CheatsheetBlock({ cheatsheet }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedIdx, setCopiedIdx] = useState(null);

  if (!cheatsheet || cheatsheet.length === 0) return null;

  const filteredItems = cheatsheet.filter(item => {
    const q = searchTerm.toLowerCase();
    return (
      item.term.toLowerCase().includes(q) ||
      item.definition.toLowerCase().includes(q) ||
      (item.example && item.example.toLowerCase().includes(q))
    );
  });

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs p-5 sm:p-6 transition-colors space-y-4">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center space-x-2">
            <Bookmark className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>High-Yield Cheatsheet & Formulas</span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Quick reference terms, definitions, and practical mnemonics
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter terms..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Grid of items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {filteredItems.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors flex flex-col justify-between space-y-2 group"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  {item.term}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(`${item.term}: ${item.definition}`, idx)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                  title="Copy to clipboard"
                >
                  {copiedIdx === idx ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
                {item.definition}
              </p>
            </div>

            {item.example && (
              <div className="text-[11px] bg-white dark:bg-zinc-900/80 p-2 rounded-lg border border-zinc-200/70 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 flex items-start space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-zinc-700 dark:text-zinc-300">Application:</strong> {item.example}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-6 text-xs text-zinc-400">
          No terms matched your search query.
        </div>
      )}
    </div>
  );
}
