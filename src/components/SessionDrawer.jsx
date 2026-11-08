import React, { useState, useRef } from 'react';
import {
  X,
  FolderHeart,
  Download,
  Upload,
  Trash2,
  Edit2,
  Check,
  BookOpen,
  PlusCircle,
  FileCode2
} from 'lucide-react';

export function SessionDrawer({
  isOpen,
  onClose,
  sessions,
  activeDeck,
  onLoadDeck,
  onSaveDeck,
  onDeleteDeck,
  onRenameDeck,
  onExport,
  onImport
}) {
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleStartRename = (deck) => {
    setEditingId(deck.id);
    setEditingTitle(deck.title);
  };

  const handleSaveRename = (deckId) => {
    if (editingTitle.trim()) {
      onRenameDeck(deckId, editingTitle.trim());
    }
    setEditingId(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const result = onImport(content);
        if (!result.success) {
          alert(`Import failed: ${result.error}`);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col justify-between transition-colors">
          {/* Header */}
          <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FolderHeart className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50">
                Study Decks & Sessions
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sessions List */}
          <div className="p-5 overflow-y-auto space-y-3 grow">
            {/* Save current deck action if loaded */}
            {activeDeck && (
              <button
                type="button"
                onClick={() => onSaveDeck(activeDeck)}
                className="w-full p-3 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Save Active Deck to Local Storage</span>
              </button>
            )}

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Saved Decks ({sessions.length})
              </span>

              {sessions.map((deck) => {
                const isActive = activeDeck?.id === deck.id;
                const isEditing = editingId === deck.id;

                return (
                  <div
                    key={deck.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isActive
                        ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    {isEditing ? (
                      <div className="flex items-center space-x-1">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="grow text-xs p-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                        />
                        <button
                          onClick={() => handleSaveRename(deck.id)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <div
                          onClick={() => { onLoadDeck(deck); onClose(); }}
                          className="cursor-pointer grow space-y-0.5"
                        >
                          <div className="flex items-center space-x-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <h4 className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 transition-colors">
                              {deck.title}
                            </h4>
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            {deck.topic} · {deck.flashcards?.length || 0} cards · {deck.quiz?.length || 0} quiz
                          </p>
                        </div>

                        {/* Deck actions */}
                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            onClick={() => handleStartRename(deck)}
                            className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                            title="Rename deck"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteDeck(deck.id)}
                            className="p-1 rounded text-zinc-400 hover:text-rose-600"
                            title="Delete deck"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Import / Export Actions */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onExport}
              className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import JSON</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
