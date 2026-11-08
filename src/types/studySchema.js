/**
 * Study Assistant Data Schema & Defensive Validation Engine
 * 
 * In real-world AI applications, models frequently hallucinate unexpected formats,
 * omit critical fields, return markdown fences, or truncate JSON responses.
 * 
 * This module guarantees:
 * 1. Safe JSON extraction & markdown fence stripping.
 * 2. Partial JSON heuristic healing (closing open braces/brackets).
 * 3. Strict schema validation with safe fallback defaults so the UI NEVER crashes.
 */

export const DifficultyLevels = ['Beginner', 'Intermediate', 'Advanced'];

/**
 * Attempts to repair truncated or partially malformed JSON strings.
 * Commonly happens during streaming or token cutoff.
 */
export function repairPartialJSON(jsonStr) {
  if (!jsonStr || typeof jsonStr !== 'string') return '{}';

  let cleaned = jsonStr.trim();

  // Strip markdown code fences if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '');
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/\s*```$/, '');
  }

  // Remove any trailing commas before closing braces/brackets
  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');

  // Count unclosed brackets and braces
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    if (char === '\\') {
      escapeNext = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === '{') openBraces++;
      else if (char === '}') openBraces = Math.max(0, openBraces - 1);
      else if (char === '[') openBrackets++;
      else if (char === ']') openBrackets = Math.max(0, openBrackets - 1);
    }
  }

  // If stream cut off inside a string literal, close the string
  if (inString) {
    cleaned += '"';
  }

  // Append missing closing brackets and braces
  while (openBrackets > 0) {
    cleaned += ']';
    openBrackets--;
  }
  while (openBraces > 0) {
    cleaned += '}';
    openBraces--;
  }

  return cleaned;
}

/**
 * Extracts and parses JSON from raw LLM output.
 * Handles chatter before or after the JSON payload.
 */
export function extractAndParseJSON(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Received empty or non-string response from model.');
  }

  let text = rawText.trim();

  // Strip markdown backticks
  if (text.startsWith('```json')) {
    text = text.substring(7);
  } else if (text.startsWith('```')) {
    text = text.substring(3);
  }
  if (text.endsWith('```')) {
    text = text.substring(0, text.length - 3);
  }

  text = text.trim();

  // Find the outermost JSON object
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBrace === -1) {
    throw new Error('No valid JSON object structure found in AI response.');
  }

  let candidate = text;
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    candidate = text.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(candidate);
  } catch (initialError) {
    // Attempt healing
    try {
      const repaired = repairPartialJSON(candidate);
      return JSON.parse(repaired);
    } catch {
      throw new Error(`Malformed JSON syntax: ${initialError.message}`);
    }
  }
}

/**
 * Validates and sanitizes a parsed deck against the expected shape.
 * Injects sensible fallbacks for missing or wrong-typed properties.
 * Throws only if the object is fundamentally irrecoverable.
 */
export function validateStudyDeck(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Invalid output shape: Root must be a JSON object, received ' + typeof data);
  }

  // Check if root is just an error message or empty hallucination
  const keys = Object.keys(data);
  if (keys.length === 0) {
    throw new Error('Empty response: Model returned an empty JSON object {}.');
  }

  // Detect if AI returned an unintended schema (e.g. conversational output)
  if (!data.flashcards && !data.quiz && !data.title && !data.summary) {
    throw new Error(
      `Wrong data shape: Missing study deck components. Found keys: [${keys.join(', ')}]. Expected [title, summary, flashcards, quiz].`
    );
  }

  // 1. Sanitize Title & Topic
  const title = typeof data.title === 'string' && data.title.trim().length > 0
    ? data.title.trim()
    : 'Study Guide';

  const topic = typeof data.topic === 'string' && data.topic.trim().length > 0
    ? data.topic.trim()
    : 'General Knowledge';

  const difficulty = DifficultyLevels.includes(data.difficulty)
    ? data.difficulty
    : 'Intermediate';

  const estimatedMinutes = typeof data.estimatedMinutes === 'number' && data.estimatedMinutes > 0
    ? Math.min(Math.max(data.estimatedMinutes, 5), 180)
    : 15;

  const summary = typeof data.summary === 'string' && data.summary.trim().length > 0
    ? data.summary.trim()
    : 'High-yield interactive study material covering key concepts and practical review.';

  // 2. Sanitize Key Takeaways
  const keyTakeaways = Array.isArray(data.keyTakeaways)
    ? data.keyTakeaways.filter(item => typeof item === 'string' && item.trim().length > 0)
    : [];

  // 3. Sanitize Flashcards
  let flashcards = [];
  if (Array.isArray(data.flashcards)) {
    flashcards = data.flashcards
      .filter(card => card && typeof card === 'object')
      .map((card, idx) => ({
        id: card.id || `fc-${idx + 1}-${Date.now()}`,
        front: typeof card.front === 'string' && card.front.trim().length > 0
          ? card.front.trim()
          : `Concept #${idx + 1}`,
        back: typeof card.back === 'string' && card.back.trim().length > 0
          ? card.back.trim()
          : 'Review explanation unavailable for this card.',
        hint: typeof card.hint === 'string' ? card.hint.trim() : null
      }));
  }

  // 4. Sanitize Quiz Questions
  let quiz = [];
  if (Array.isArray(data.quiz)) {
    quiz = data.quiz
      .filter(q => q && typeof q === 'object')
      .map((q, idx) => {
        // Normalize options array
        let options = Array.isArray(q.options)
          ? q.options.filter(opt => typeof opt === 'string' && opt.trim().length > 0)
          : [];

        if (options.length < 2) {
          options = ['True / Applicable', 'False / Not Applicable'];
        }

        let correctIndex = typeof q.correctIndex === 'number' ? q.correctIndex : 0;
        if (correctIndex < 0 || correctIndex >= options.length) {
          correctIndex = 0;
        }

        return {
          id: q.id || `q-${idx + 1}-${Date.now()}`,
          question: typeof q.question === 'string' && q.question.trim().length > 0
            ? q.question.trim()
            : `Question ${idx + 1}`,
          options,
          correctIndex,
          explanation: typeof q.explanation === 'string' && q.explanation.trim().length > 0
            ? q.explanation.trim()
            : `Option ${correctIndex + 1} is the intended answer.`
        };
      });
  }

  // 5. Sanitize Cheatsheet
  let cheatsheet = [];
  if (Array.isArray(data.cheatsheet)) {
    cheatsheet = data.cheatsheet
      .filter(item => item && typeof item === 'object')
      .map(item => ({
        term: typeof item.term === 'string' ? item.term.trim() : 'Term',
        definition: typeof item.definition === 'string' ? item.definition.trim() : 'Definition unavailable',
        example: typeof item.example === 'string' ? item.example.trim() : null
      }));
  }

  // If both flashcards and quiz are completely empty, consider this a failed deck shape
  if (flashcards.length === 0 && quiz.length === 0) {
    throw new Error('Incomplete output: Deck contains neither flashcards nor quiz questions.');
  }

  return {
    id: data.id || `deck-${Date.now()}`,
    createdAt: data.createdAt || new Date().toISOString(),
    title,
    topic,
    difficulty,
    estimatedMinutes,
    summary,
    keyTakeaways,
    flashcards,
    quiz,
    cheatsheet
  };
}
