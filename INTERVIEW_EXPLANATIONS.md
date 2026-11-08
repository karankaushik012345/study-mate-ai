# StudyMate AI — Complete Code Walkthrough & Interview Preparation Guide

This guide is your personal cheat sheet for explaining **every architectural decision, every hook, every helper function, and every component** during the interview. It is written in plain, human, confident language so you can walk through the codebase effortlessly, fix bugs on the fly, and extend features live.

---

## 1. Executive Summary: What You Built & Why

### The Elevator Pitch
> *"I built **StudyMate AI**, an interactive study tool that takes raw, unstructured notes and transforms them into structured educational components: 3D active-recall flashcards, interactive quizzes with instant feedback, targeted re-testing of missed questions, and high-yield cheatsheets.
> 
> The core challenge of this project isn't calling an AI model—it's **turning unpredictable AI output into reliable, resilient UI**. Models hallucinate, drop JSON keys, get cut off mid-stream, or return responses out of order. I engineered this application with defensive parsing, heuristic JSON repair, strict schema validation, AbortController race-condition mitigation, and a live Failure Simulator modal so reviewers can test failure handling with one click."*

---

## 2. Architecture & Design Decisions

### Q: Why route through an Express backend instead of calling the LLM directly from React?
**Your Answer:**
1. **Security & Key Protection**: Shipping API keys (`process.env.GEMINI_API_KEY`) in client-side React bundles exposes them in the browser's Network tab and source code to anyone inspecting the page.
2. **Provider Agnostic Abstraction**: The backend acts as a gateway. The frontend doesn't need to know whether Gemini, Groq, OpenAI, or a local Ollama instance is serving the response.
3. **CORS & Rate Limiting**: Avoids browser CORS restrictions and allows centralized server-side caching or rate-limiting.
4. **Instant Zero-Config Mock Engine**: If the interviewer runs `npm install && npm start` without an API key, the backend seamlessly falls back to a realistic mock engine so they can test every feature immediately without friction.

### Q: Why is this NOT a chatbot?
**Your Answer:**
> *"A chatbot dumps unstructured markdown into a scrolling text stream. StudyMate AI enforces a strict JSON schema contract on the model (`{ title, summary, keyTakeaways, flashcards, quiz, cheatsheet }`). The frontend takes that validated object and mounts stateful, interactive widgets—like flippable 3D cards, multiple-choice quizzes with live score calculation, and interactive objective checklists."*

---

## 3. Step-by-Step Building Process (How you built it)

1. **Step 1: Data Contract Definition (`studySchema.js`)**: Defined the target JSON schema before writing any UI code. Established what a "valid study deck" requires (title, flashcards with front/back, quiz with question/options/correctIndex, etc.).
2. **Step 2: Defensive Parsing & Heuristic Repair**: Built `extractAndParseJSON` and `repairPartialJSON` to handle markdown fences, preambles, and unclosed JSON brackets from streaming cutoffs.
3. **Step 3: Secure Express Gateway (`server/index.js`)**: Implemented REST and Server-Sent Events (SSE) streaming endpoints, multi-provider routing (Gemini, Groq, OpenAI, Ollama, Mock), and the `/api/simulate-failure` testing endpoint.
4. **Step 4: Central Engine Hook (`useStudyAssistant.js`)**: Built the state machine managing generation, streaming, timeout cancellation via `AbortController`, sequence token verification (`activeRequestIdRef`) to prevent stale responses, and the refinement loop.
5. **Step 5: Interactive UI Components**:
   - `FlashcardBlock`: 3D CSS perspective card flips, mastery tracking ("Known" vs "Need Review"), keyboard shortcuts, and shuffle logic.
   - `QuizBlock`: Multiple-choice with instant feedback, explanations, celebration confetti, and the **"Re-Test Wrong Answers" mode**.
   - `OverviewBlock` & `CheatsheetBlock`: Summary badges, interactive objectives checklist, and search-filtered reference terms with copy-to-clipboard.
   - `RefinementBar`: Follow-up prompting loop that edits existing decks in-place.
6. **Step 6: Persistence & Portability (`useSessions.js`)**: Added `localStorage` session storage with pre-loaded sample decks, rename/delete, and JSON export/import.
7. **Step 7: Failure Simulator Modal (`FailureSimulatorModal.jsx`)**: Built a 1-click test suite directly in the UI to demonstrate handling of malformed JSON, wrong shape, empty responses, slow timeouts, 500 errors, and stale race conditions.
8. **Step 8: Polish & Accessibility**: Tailwind CSS dark mode toggle, keyboard navigation (Space, Arrows, 1-4, K, R), and responsive mobile design.

---

## 4. Deep Dive: Codebase File by File

### 1. `src/types/studySchema.js` — Defensive Parsing Engine

This file is your safety net against AI unpredictability.

- **`repairPartialJSON(jsonStr)`**:
  - *Problem*: When an LLM streams or hits a token limit, it cuts off mid-string or mid-array (e.g. `{"cards": [{"front": "Q"`). Standard `JSON.parse` crashes with a `SyntaxError`.
  - *How it works*: It iterates through the string, ignores escaped quotes, detects whether it's currently inside a string literal (closing it with a quote if open), and tracks unmatched opening `{` and `[` characters. It then appends the exact matching `]` and `}` in reverse order to close the JSON cleanly.
- **`extractAndParseJSON(rawText)`**:
  - *Problem*: LLMs often prepend `Here is your JSON:\n```json` or append trailing comments.
  - *How it works*: Locates the first `{` and last `}` in the text, slices the substring, strips backticks, and tries standard `JSON.parse`. If that fails, it passes the candidate to `repairPartialJSON`.
- **`validateStudyDeck(data)`**:
  - *Problem*: What if the model returned valid JSON, but the keys are completely wrong (e.g. `{ "message": "hello" }` or `flashcards: "not an array"`)?
  - *How it works*:
    - Checks that root is an object and not empty.
    - Sanitizes `title`, `topic`, `difficulty`, and `summary` with fallback defaults.
    - Maps `flashcards`: ensures each card has a unique `id`, non-empty `front`, and `back`.
    - Maps `quiz`: ensures each question has at least 2 options, normalizes `correctIndex` to stay within array bounds (`0` to `options.length - 1`), and ensures an `explanation` exists.
    - Maps `cheatsheet` items.
    - Throws an informative error *only* if the payload is fundamentally unrecoverable, triggering the user-friendly Error UI with a Retry button.

---

### 2. `server/index.js` — Secure Backend Gateway

- **Lines 10-17 (`getAvailableProvider`)**: Inspects `process.env` for `GEMINI_API_KEY`, `GROQ_API_KEY`, or `OPENAI_API_KEY`. If none are set, defaults to `'mock'` so the project runs out of the box with zero setup friction!
- **Lines 19-61 (`SYSTEM_INSTRUCTION`)**: Strict system prompt that tells the LLM to act as a curriculum architect and output **only** valid JSON matching our exact TypeScript-like structure without markdown banter.
- **Lines 63-180 (`generateMockDeck`)**: High-quality realistic study deck generator with rich questions, explanations, and cheatsheets used for offline testing and reviewer demonstrations.
- **Lines 262-280 (`POST /api/generate`)**: Standard non-streaming generation endpoint.
- **Lines 282-324 (`POST /api/generate-stream`)**: SSE (Server-Sent Events) endpoint. Sets `Content-Type: text/event-stream`, pipes status messages (`event: status`), chunks (`event: chunk`), and final payload (`event: complete`).
- **Lines 326-353 (`POST /api/refine`)**: The refinement loop endpoint. Accepts `{ existingDeck, instruction }`, prompts the model to update the existing deck JSON based on the user's follow-up request, and returns the modified deck.
- **Lines 355-404 (`POST /api/simulate-failure`)**: Test harness allowing the evaluator to trigger:
  - `malformed_json`: Deliberately truncated string with missing closing brackets.
  - `wrong_shape`: Valid JSON with conversational keys instead of deck arrays.
  - `empty_response`: Returns `{}`.
  - `slow_timeout`: Sleeps 15 seconds to test client abort/timeout.
  - `http_500`: Returns 500 error status.
  - `stale_race`: Deliberate 3-second delay to test race condition handling.

---

### 3. `src/hooks/useStudyAssistant.js` — Core Engine Hook

This is the brain of the frontend state.

#### How Stale Responses & Race Conditions are Prevented:
```javascript
const activeRequestIdRef = useRef(0);
const abortControllerRef = useRef(null);

const cancelActiveRequest = useCallback(() => {
  if (abortControllerRef.current) {
    abortControllerRef.current.abort(); // 1. Abort physical HTTP connection
    abortControllerRef.current = null;
  }
}, []);

// Inside generateDeck:
cancelActiveRequest(); // Cancel any existing in-flight request
const requestId = ++activeRequestIdRef.current; // Increment sequence token
const controller = new AbortController();
abortControllerRef.current = controller;

// When response arrives:
if (activeRequestIdRef.current !== requestId) return; // Discard stale response!
```
- **Explanation to Interviewer**: *"If a user fires Request #1 (slow, 3s) and then immediately fires Request #2 (fast, 500ms), two things protect the UI: first, `controller.abort()` cancels the physical connection of Request #1. Second, even if Request #1 had already resolved over the wire, its `requestId` will not match `activeRequestIdRef.current`, so its data is discarded before calling `setDeck`."*

#### SSE Streaming Reader Loop:
- Uses `response.body.getReader()` with `TextDecoder`.
- Accumulates chunks, updates `streamBuffer` in real time so the user sees live progress, and parses the final JSON when done.

#### Refinement Function (`refineDeck`):
- Takes user instruction (e.g. *"Make questions harder"*), passes current deck to `/api/refine`, and updates the deck in-place without resetting user's viewing mode.

---

### 4. `src/components/FlashcardBlock.jsx` — 3D Interactive Cards

- **CSS 3D Perspective**:
  - Parent container: `perspective-1000` + `cursor-pointer`.
  - Inner card: `transform-style-preserve-3d` + `transition-transform duration-500`.
  - Back face: `rotate-y-180` + `backface-hidden`.
  - Toggling `isFlipped` adds the `rotate-y-180` class, creating a realistic physical card flip.
- **Active Recall Tracking**:
  - `cardStatus` dictionary tracks `{ [cardId]: 'mastered' | 'review' }`.
  - Calculates live mastery percentage: `(masteredCount / totalCards) * 100`.
  - Filter tabs allow viewing: `All`, `Need Review`, or `Mastered`.
- **Keyboard Shortcuts**:
  - Global `keydown` listener (disabled when focus is inside `INPUT` or `TEXTAREA`):
    - `Space` / `Enter`: Flip card
    - `ArrowLeft` / `ArrowRight`: Previous / Next card
    - `K`: Mark as Mastered
    - `R`: Mark as Review Later
- **Card Shuffling**:
  - Uses `[...cards].sort(() => Math.random() - 0.5)` to randomize study order.

---

### 5. `src/components/QuizBlock.jsx` — Interactive Quiz & Re-Test Mode

- **Instant Visual Feedback**:
  - Clicking an option records `selectedAnswers[activeQuestion.id] = optionIndex`.
  - Correct option immediately turns green with a `CheckCircle`.
  - If user selects the wrong option, it turns red with a subtle shake animation (`animate-shake`), and the correct option is highlighted simultaneously.
  - An explanation callout box opens directly underneath explaining *why* that answer is correct.
- **Keyboard Shortcuts**:
  - Keys `1`, `2`, `3`, `4` select the corresponding option.
  - `Enter` advances to the next question.
- **Completion & Celebration**:
  - When the user finishes the quiz, if they scored 100%, `confetti()` triggers.
- **Targeted "Re-Test Wrong Answers" Mode**:
  - *The problem it solves*: When students take a quiz, taking the entire 20-question quiz again to review 2 mistakes is frustrating.
  - *How it works*: When wrong answers occur, their IDs are collected in a `wrongQuestionIds` Set.
  - On the completion screen, a prominent **"Re-Test Missed Questions"** button appears. Clicking it sets `questions` to *only* the missed questions and resets answer states, allowing targeted drill until 100% mastery is achieved!

---

### 6. `src/components/CheatsheetBlock.jsx` — Quick Reference

- Renders concise terms, definitions, and real-world application examples.
- Includes a live search filter input that filters terms as you type.
- Includes a **Copy to Clipboard** button with a 2-second checkmark confirmation.

---

### 7. `src/components/RefinementBar.jsx` — Follow-Up Modification Loop

- Provides a dedicated input bar below the study deck.
- Includes one-click quick suggestion chips:
  - `+ Add 2 Harder Questions`
  - `Simplify Flashcard Explanations`
  - `Add 3 More Cheatsheet Terms`
  - `Focus On Real-World Edge Cases`
- Sends the follow-up prompt to `/api/refine` and updates the deck without resetting page state.

---

### 8. `src/components/FailureSimulatorModal.jsx` — The Reviewer's Dream

This component demonstrates your product maturity. It allows the interviewer to test all 6 core failure modes with a single click:
1. **Malformed JSON**: Model drops closing brace $\rightarrow$ defensive parser catches it, reports informative error with a Retry button.
2. **Wrong Shape**: Model returns valid JSON but with conversational keys $\rightarrow$ `validateStudyDeck` catches missing components and prevents undefined render errors.
3. **Empty Response**: Model returns `{}` $\rightarrow$ caught and reported cleanly.
4. **Slow Timeout**: Model hangs for 15s $\rightarrow$ client-side 25s timeout safeguard or manual user Cancel button aborts cleanly.
5. **HTTP 500 Outage**: Upstream API outage $\rightarrow$ rendered in the `ErrorState` banner with expandable diagnostics.
6. **Stale Request Race Condition**: Simulates slow Request #1 followed by fast Request #2 $\rightarrow$ proves Request #1 is discarded and never overwrites Request #2.

---

### 9. `src/hooks/useSessions.js` — Persistence & Portability

- Syncs saved study decks to browser `localStorage`.
- Includes 2 rich pre-loaded decks:
  1. *React Internals & Web Performance*
  2. *Distributed Systems & CAP Theorem*
- Provides **Export JSON** (downloads `.json` file to computer) and **Import JSON** (uploads `.json` file back into app).

---

## 5. Potential Live Interview Scenarios & How to Handle Them

### Scenario A: "Walk me through how data flows when the user clicks 'Generate'."
**Step-by-step Answer:**
1. The user inputs text in `InputSection.jsx` and clicks "Generate".
2. `useStudyAssistant.generateDeck()` is invoked.
3. It immediately calls `cancelActiveRequest()`, aborting any prior pending `fetch` call and increments `activeRequestIdRef.current`.
4. It issues a `POST` request to `/api/generate-stream` on the Express backend.
5. The backend checks available API keys (Gemini, Groq, OpenAI, Ollama, or Mock), generates the structured payload matching `SYSTEM_INSTRUCTION`, and streams chunks via SSE.
6. The client's `ReadableStream` reader receives chunks, updates `streamBuffer` for the live preview, and accumulates the text.
7. Upon stream completion, `extractAndParseJSON()` parses the payload (applying heuristic bracket repairs if needed).
8. `validateStudyDeck()` sanitizes fields, enforces array defaults, and validates index bounds.
9. If `activeRequestIdRef.current === requestId`, the verified deck is stored in `deck` state, transitioning status to `'success'`.
10. `App.jsx` unmounts the empty state and mounts `OverviewBlock`, `FlashcardBlock`, `QuizBlock`, `CheatsheetBlock`, and `RefinementBar`.

---

### Scenario B: "The model returned `NaN` for `estimatedMinutes` or `null` for `keyTakeaways`. Will your app crash?"
**Your Answer:**
> *"No, because of `validateStudyDeck` in `src/types/studySchema.js`.
> Notice lines 105-115:
> ```javascript
> const estimatedMinutes = typeof data.estimatedMinutes === 'number' && data.estimatedMinutes > 0
>   ? Math.min(Math.max(data.estimatedMinutes, 5), 180)
>   : 15;
> 
> const keyTakeaways = Array.isArray(data.keyTakeaways)
>   ? data.keyTakeaways.filter(item => typeof item === 'string' && item.trim().length > 0)
>   : [];
> ```
> Every field is explicitly type-checked and filtered. If `keyTakeaways` is `null` or not an array, it defaults to `[]`, preventing any `.map is not a function` runtime crashes."*

---

### Scenario C: "Fix a bug we introduce: What if a quiz question has 3 options but `correctIndex` is 3 (out of bounds)?"
**Your Answer:**
> *"In `src/types/studySchema.js` lines 145-155:
> ```javascript
> let correctIndex = typeof q.correctIndex === 'number' ? q.correctIndex : 0;
> if (correctIndex < 0 || correctIndex >= options.length) {
>   correctIndex = 0; // Safely clamped to first option
> }
> ```
> We defend against zero-based index mismatches where LLMs treat 1 as 0 or output an index equal to `options.length`."*

---

### Scenario D: "Add a small feature: How would you add a 'Time Elapsed' stopwatch for the quiz?"
**How to do it live:**
1. In `src/components/QuizBlock.jsx`, add a timer state:
```javascript
const [secondsElapsed, setSecondsElapsed] = useState(0);

useEffect(() => {
  if (isCompleted) return;
  const timer = setInterval(() => setSecondsElapsed(s => s + 1), 1000);
  return () => clearInterval(timer);
}, [isCompleted]);
```
2. Render in the quiz header:
```jsx
<span className="text-xs font-mono px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800">
  ⏱️ {Math.floor(secondsElapsed / 60)}:{(secondsElapsed % 60).toString().padStart(2, '0')}
</span>
```
Takes less than 2 minutes to write live!

---

## 6. Summary Checklist Before Your Interview

- [x] Run `npm start` to make sure both backend (port 3001) and frontend (port 5173) start up cleanly.
- [x] Open `http://localhost:5173` and click on one of the example topics (e.g. *React 19 & Fiber*).
- [x] Flip a few flashcards using `Space` and navigate using Arrow keys.
- [x] Answer a quiz question, deliberately pick a wrong answer to demonstrate the explanation callout, finish the quiz, and click **"Re-Test Missed Questions"**.
- [x] Click **"Test Failure Modes"** in the top navigation and trigger **"Malformed / Broken JSON Syntax"** to show the graceful error boundary.
- [x] Trigger **"Stale Request Race Condition"** in the modal to prove out-of-order responses never corrupt UI state.
- [x] Show the **"Saved Decks"** drawer and export a JSON session file.

You are completely prepared. Every line of code is structured, human-readable, and backed by solid frontend engineering principles. Good luck!
