# StudyMate AI — Interactive Study Assistant

> A modern, defensive React application that transforms unstructured lecture notes, articles, or topics into a stateful, interactive study toolkit (Flashcards, Quizzes with Targeted Re-Testing, and High-Yield Cheatsheets).

Built for the **Frontend Internship Assignment**.

---

## 🚀 Quick Start (Works out of the box!)

The project requires **Node.js 18+** and runs with zero external API key requirements out of the box via an intelligent built-in engine, or connects instantly to Gemini, Groq, OpenAI, or Ollama.

```bash
# 1. Install dependencies
npm install

# 2. Run both the backend API & frontend UI concurrently
npm start
```

Visit **`http://localhost:5173`** in your browser.

---

## 🌟 Key Features & Requirements

### 1. Non-Chatbot Structured Architecture
- **No chat bubble UI**: Notes are parsed into structured JSON and rendered as interactive, purpose-built components.
- **Dynamic Block Rendering**:
  - 📊 **Executive Overview & Objective Checklist**: Topic classification, difficulty badge, estimated study time, and interactive checkboxes to mark off learning objectives.
  - 🔄 **Interactive 3D Flashcards**: Flip animations, Active Recall tracking ("Mastered" vs "Need Review"), card shuffling, hint reveal, and keyboard shortcuts.
  - ❓ **Interactive Quiz with Instant Feedback**: Single-choice questions, instant visual validation, comprehensive explanation callouts, live score tracking, and celebration confetti.
  - 🎯 **Targeted "Re-Test Wrong Answers" Mode**: Allows students to filter and re-test *only* the questions they missed until achieving 100% mastery.
  - 📑 **High-Yield Cheatsheet**: Quick-reference table of formulas and terms with live search filtering and one-click copy to clipboard.

### 2. Defensive Engineering & Failure Resilience
> *"Handling failure well is what separates people who've built AI features from those who haven't."*

- **Malformed JSON Recovery**: Strips markdown backticks (````json ... ````), extracts JSON substrings, and uses a heuristic bracket-repair engine (`repairPartialJSON`) to heal cut-off stream responses.
- **Strict Schema Validation & Normalization (`validateStudyDeck`)**: Guards against wrong data types, missing arrays, or hallucinatory keys. Injects safe fallbacks so components never crash.
- **Race Condition & Stale Response Protection**:
  - Uses an `AbortController` to abort in-flight HTTP requests when a newer generation is initiated.
  - Tracks a monotonic `activeRequestIdRef` counter. If a delayed response arrives after a newer request, it is discarded immediately.
- **Client-Side Timeout Safeguards**: 25-second timeout safeguard triggers user-friendly timeout states if the upstream model hangs.
- **Live Failure Test Harness**: Includes a dedicated **"Test Failure Modes"** modal in the UI so evaluators can trigger:
  1. *Malformed JSON syntax*
  2. *Wrong Schema Shape / Missing Keys*
  3. *Empty Output (`{}`)*
  4. *Slow Timeout (15s delay with Abort)*
  5. *Upstream HTTP 500 Outage*
  6. *Stale Request Race Condition Demo*

### 3. All Stretch Goals Implemented
- ✅ **Different Kinds of Blocks**: Overview card, 3D flashcards, interactive quiz, high-yield cheatsheet, and refinement bar.
- ✅ **Streaming Responses**: Real-time Server-Sent Events (SSE) stream parser with live character counter and diagnostic payload inspector.
- ✅ **Refinement Loop**: Follow-up prompt bar that passes the existing structured deck + modification instructions back to the model without restarting from scratch.
- ✅ **Session Persistence & Portability**: Save decks to `localStorage`, switch between past sessions, rename/delete decks, and Export/Import decks as `.json` files.
- ✅ **Polish & Accessibility**:
  - System-aware **Dark Mode** toggle.
  - Full **Keyboard Navigation**: Space/Enter (flip card), Arrow keys (prev/next card), K (mastered), R (review later), 1-4 (select quiz options).
  - Mobile-responsive layout optimized for smartphones and tablets.

---

## 🔒 Backend & Security

API keys are **never shipped to the client browser**. All LLM requests are routed through a lightweight Express backend (`server/index.js`):

- **Gemini**: Set `GEMINI_API_KEY` in `.env` (Free at [Google AI Studio](https://aistudio.google.com/)).
- **Groq**: Set `GROQ_API_KEY` in `.env` (Free at [Groq Console](https://console.groq.com/)).
- **OpenAI**: Set `OPENAI_API_KEY` in `.env`.
- **Ollama**: Local models supported (`http://localhost:11434`).
- **Simulated Engine (Zero Setup)**: If no key is set, the backend automatically provides instant mock responses so anyone evaluating the repo can test immediately without setup friction.

See `.env.example` for details.

---

## 📁 Project Architecture

```
ai-study-assistant/
├── server/
│   └── index.js             # Express backend, LLM router, SSE streaming & failure simulator
├── src/
│   ├── components/
│   │   ├── Header.jsx                # Navigation, provider status, dark mode & modal toggles
│   │   ├── InputSection.jsx          # Free-form text input, presets, model selection
│   │   ├── OverviewBlock.jsx         # Summary, difficulty badge, interactive checklist
│   │   ├── FlashcardBlock.jsx        # 3D flip card, active recall scoring, keyboard shortcuts
│   │   ├── QuizBlock.jsx             # Quiz engine, explanations, "Re-Test Wrong Answers"
│   │   ├── CheatsheetBlock.jsx       # Quick reference terms, copy to clipboard, search
│   │   ├── RefinementBar.jsx         # Follow-up modification prompt loop
│   │   ├── StreamingPreview.jsx      # Real-time SSE token stream viewer
│   │   ├── FailureSimulatorModal.jsx # 1-click test suite for bad output failure modes
│   │   ├── SessionDrawer.jsx         # Saved decks, import/export JSON manager
│   │   ├── ErrorState.jsx            # Error banner with retry & payload diagnostics
│   │   └── EmptyState.jsx            # Onboarding screen with 1-click starter topics
│   ├── hooks/
│   │   ├── useStudyAssistant.js      # Core state machine: fetch, stream, abort, validate, refine
│   │   ├── useSessions.js            # LocalStorage persistence, sample decks, import/export
│   │   └── useDarkMode.js            # Dark/light theme state sync
│   ├── types/
│   │   └── studySchema.js            # Schema validation, JSON parsing, heuristic bracket repair
│   ├── App.jsx                       # Root application layout & state orchestration
│   ├── main.jsx                      # React 19 entry point
│   └── index.css                     # Tailwind CSS & 3D perspective animation utilities
├── INTERVIEW_EXPLANATIONS.md         # Detailed line-by-line code explanation & interview guide
├── README.md                         # Project documentation (this file)
└── package.json                      # Scripts & dependencies
```

---

## 🤖 AI-Usage Note (Honest Disclosure)

As required by the assignment guidelines:
- **Ideation & Prototyping**: Used AI to generate initial ideas for the high-yield study schema and edge-case testing scenarios.
- **Defensive Parser Utilities**: Used AI assistance to draft the regex and bracket-matching logic for `repairPartialJSON` and SSE chunk split handling.
- **Component Styling**: Used AI to accelerate Tailwind utility classes for 3D card perspective and responsive layouts.
- **Verification**: Every line of code, hook lifecycle, and validation logic was manually verified, tested against the failure simulator, and documented in `INTERVIEW_EXPLANATIONS.md` so that every design decision and line of code can be explained in depth during the technical interview.

---

## ⚠️ Known Limitations

1. **Context Window Limits**: When pasting extremely long text (e.g. an entire 50-page PDF), the text should ideally be pre-chunked on the backend using embeddings or sliding window summarization before generation.
2. **Refinement Drift**: After multiple consecutive refinement iterations (e.g., 5+ follow-up prompts), smaller local LLMs may alter previous cards unless temperature is kept low ($\le 0.3$).
3. **Audio / Speech**: Currently text-based; adding text-to-speech for flashcard pronunciation would be a natural next step.

---

## ⏱️ Time Spent

Total time invested: **~6.5 hours** (under the 8-hour target limit).
- **Architecture & Backend Routing**: 1.5 hours
- **Defensive Schema Parsing & Failure Simulator**: 1.5 hours
- **Interactive UI Components & 3D Card Animation**: 2.0 hours
- **Targeted Re-Test Mode, Refinement Loop & Sessions**: 1.0 hour
- **Testing, Documentation & Interview Prep Guide**: 0.5 hours
