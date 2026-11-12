import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static assets if production build exists
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Determine available API provider
const getAvailableProvider = () => {
  if (process.env.GEMINI_API_KEY) return { provider: 'gemini', key: process.env.GEMINI_API_KEY };
  if (process.env.GROQ_API_KEY) return { provider: 'groq', key: process.env.GROQ_API_KEY };
  if (process.env.OPENAI_API_KEY) return { provider: 'openai', key: process.env.OPENAI_API_KEY };
  return { provider: 'mock', key: null };
};

// System prompt enforcing strict structured JSON output
const SYSTEM_INSTRUCTION = `You are an expert educational curriculum architect.
Your job is to transform raw, unstructured user notes or topics into a rich, structured, interactive study deck.

You MUST respond with ONLY a single, valid JSON object matching this exact specification. No greeting, no markdown formatting outside the JSON, no explanatory banter.

JSON Structure:
{
  "title": "Clear, concise title for the study topic",
  "topic": "Canonical topic name",
  "difficulty": "Beginner" | "Intermediate" | "Advanced",
  "estimatedMinutes": 15,
  "summary": "A cohesive 2-3 sentence executive summary of the core concepts.",
  "keyTakeaways": [
    "Key takeaway 1",
    "Key takeaway 2",
    "Key takeaway 3"
  ],
  "deepDive": {
    "introduction": "A thorough 2-3 paragraph introduction to the topic. Cover the historical context, why it matters, and how it fits into the broader field.",
    "coreConceptsSections": [
      {
        "heading": "Section Title (e.g. 'How It Works')",
        "content": "2-3 paragraphs of clear, in-depth explanation. Use analogies and concrete examples where possible."
      },
      {
        "heading": "Second Section Title",
        "content": "Another 2-3 paragraphs diving deeper into a specific aspect."
      }
    ],
    "realWorldApplications": "A detailed paragraph explaining where and how this topic is applied in industry, research, or everyday life. Include 2-3 real examples.",
    "commonMisconceptions": "A paragraph describing the top 2-3 misconceptions people have about this topic, and why they are wrong.",
    "furtherReadingTopics": ["Related Topic A", "Related Topic B", "Related Topic C"]
  },
  "flashcards": [
    {
      "id": "fc-1",
      "front": "Prompt, term, or question",
      "back": "Clear, memorable explanation or definition",
      "hint": "Optional short hint for recall"
    }
  ],
  "quiz": [
    {
      "id": "q-1",
      "question": "Clear multiple choice question testing conceptual understanding?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why Option A is correct and why common misconceptions fail."
    }
  ],
  "cheatsheet": [
    {
      "term": "Key Term or Law",
      "definition": "Succinct definition",
      "example": "Real-world example or mnemonic"
    }
  ]
}

Ensure at least 4 flashcards, at least 3 quiz questions, at least 3 cheatsheet items, and at least 2 coreConceptsSections in deepDive.`;

// Mock generator for testing without an API key or demo purposes
const generateMockDeck = (input) => {
  const cleanInput = (input || 'Computer Science Fundamentals').trim();
  return {
    title: `Mastering ${cleanInput.slice(0, 40)}`,
    topic: cleanInput.slice(0, 30),
    difficulty: 'Intermediate',
    estimatedMinutes: 20,
    summary: `A high-yield interactive study pack generated for "${cleanInput.slice(0, 60)}". Focuses on fundamental mechanics, core mental models, and practical application questions.`,
    keyTakeaways: [
      `Deconstruct the primary principles of ${cleanInput.slice(0, 30)}.`,
      'Recognize common edge cases and practical trade-offs in real-world scenarios.',
      'Differentiate theoretical definitions from applied implementations.',
      'Test recall on foundational terminology and critical steps.'
    ],
    flashcards: [
      {
        id: 'fc-1',
        front: `What is the primary objective of ${cleanInput.slice(0, 25)}?`,
        back: 'To establish a structured, reliable mental model that enables fast recall and effective problem solving.',
        hint: 'Think about foundational goals rather than minor details.'
      },
      {
        id: 'fc-2',
        front: 'How does Abstraction help reduce cognitive load?',
        back: 'By hiding implementation complexity behind simple, consistent interfaces and clean boundaries.',
        hint: 'Like driving a car without knowing engine physics.'
      },
      {
        id: 'fc-3',
        front: 'Why is Invariant Preservation critical in state machines?',
        back: 'It guarantees that the system always transitions from one valid state to another, preventing corruption.',
        hint: 'A condition that must always hold true.'
      },
      {
        id: 'fc-4',
        front: 'What separates shallow memorization from deep conceptual understanding?',
        back: 'The ability to synthesize concepts, predict outcomes under new constraints, and explain trade-offs.',
        hint: 'Bloom\'s Taxonomy application level.'
      },
      {
        id: 'fc-5',
        front: 'What strategy mitigates race conditions in asynchronous workflows?',
        back: 'Using cancellation tokens (e.g. AbortController) or sequence version tags to discard stale responses.',
        hint: 'Ensures only the latest request updates state.'
      }
    ],
    quiz: [
      {
        id: 'q-1',
        question: `When applying ${cleanInput.slice(0, 30)}, what is the most critical first step?`,
        options: [
          'Jumping immediately into granular optimizations',
          'Establishing clear requirements, constraints, and baseline assumptions',
          'Skipping validation to maximize processing speed',
          'Hardcoding edge cases before testing general logic'
        ],
        correctIndex: 1,
        explanation: 'Establishing clear requirements and constraints ensures that subsequent design decisions are grounded in actual needs.'
      },
      {
        id: 'q-2',
        question: 'How should a client handle unpredictable structured outputs from an LLM?',
        options: [
          'Assume the JSON is always valid and parse it without try/catch',
          'Crash the UI immediately whenever a property is missing',
          'Validate shapes with schemas, repair malformed boundaries, and provide fallback defaults',
          'Discard the UI and force the user to start a completely new session'
        ],
        correctIndex: 2,
        explanation: 'Defensive UI architecture validates shapes, repairs salvageable JSON fragments, and falls back gracefully.'
      },
      {
        id: 'q-3',
        question: 'In an interactive quiz, what pedagogical technique reinforces learning fastest?',
        options: [
          'Showing no feedback until the entire exam is completed',
          'Immediate explanatory feedback with targeted re-testing of missed concepts',
          'Hiding the correct answer forever',
          'Randomly changing the questions on every single click'
        ],
        correctIndex: 1,
        explanation: 'Immediate explanatory feedback paired with active recall re-testing solidifies correct neural pathways and fixes misconceptions.'
      },
      {
        id: 'q-4',
        question: 'Why is an AbortController necessary when firing search or generation requests?',
        options: [
          'It speeds up internet connection bandwidth',
          'It prevents stale network responses from overwriting newer user requests',
          'It eliminates the need for error boundaries',
          'It automatically fixes malformed JSON syntax'
        ],
        correctIndex: 1,
        explanation: 'Network latencies are variable; aborting previous pending requests prevents out-of-order race conditions.'
      }
    ],
    cheatsheet: [
      {
        term: 'Active Recall',
        definition: 'Stimulating memory retrieval during learning instead of passively reading.',
        example: 'Testing yourself with flashcards before flipping to the back.'
      },
      {
        term: 'Spaced Repetition',
        definition: 'Reviewing information at increasing intervals to combat the forgetting curve.',
        example: 'Revisiting difficult concepts 1 day, 3 days, then 1 week later.'
      },
      {
        term: 'First Principles Thinking',
        definition: 'Boiling a problem down to its most fundamental truths and reasoning upward.',
        example: 'Asking "What is physically required here?" rather than reasoning by analogy.'
      },
      {
        term: 'Defensive UI',
        definition: 'Designing user interfaces that anticipate unexpected data structures without crashing.',
        example: 'Safely mapping array properties with optional chaining and fallback empty arrays.'
      }
    ]
  };
};

// Clean raw LLM text into JSON
const extractJSON = (text) => {
  if (!text) throw new Error('Model returned empty response');
  let clean = text.trim();
  // Strip markdown code fences if present
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  // If there is preamble text before the first { and after the last }
  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    clean = clean.substring(firstBrace, lastBrace + 1);
  }
  return JSON.parse(clean);
};

// Call Google Gemini API
const callGemini = async (prompt, apiKey) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: SYSTEM_INSTRUCTION },
          { text: `Create an interactive study deck based on this content:\n\n${prompt}` }
        ]
      }],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return extractJSON(text);
};

// Call Groq / OpenAI compatible API
const callOpenAICompatible = async (prompt, endpoint, apiKey, model) => {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: SYSTEM_INSTRUCTION },
        { role: 'user', content: `Create an interactive study deck based on this content:\n\n${prompt}` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`AI API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  return extractJSON(text);
};

// Call Ollama local instance
const callOllama = async (prompt) => {
  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL || 'llama3.2',
      messages: [
        { role: 'system', content: SYSTEM_INSTRUCTION },
        { role: 'user', content: prompt }
      ],
      format: 'json',
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama connection error (${response.status})`);
  }

  const data = await response.json();
  return extractJSON(data.message?.content);
};

// Primary generation orchestrator
const orchestrateGeneration = async (input, userProvider) => {
  const config = getAvailableProvider();
  const activeProvider = userProvider || config.provider;

  if (activeProvider === 'gemini' && process.env.GEMINI_API_KEY) {
    return await callGemini(input, process.env.GEMINI_API_KEY);
  }
  if (activeProvider === 'groq' && process.env.GROQ_API_KEY) {
    return await callOpenAICompatible(input, 'https://api.groq.com/openai/v1/chat/completions', process.env.GROQ_API_KEY, 'llama-3.3-70b-versatile');
  }
  if (activeProvider === 'openai' && process.env.OPENAI_API_KEY) {
    return await callOpenAICompatible(input, 'https://api.openai.com/v1/chat/completions', process.env.OPENAI_API_KEY, 'gpt-4o-mini');
  }
  if (activeProvider === 'ollama') {
    return await callOllama(input);
  }

  // Fallback to rich mock deck if no key is configured
  return generateMockDeck(input);
};

// Standard Generation Route
app.post('/api/generate', async (req, res) => {
  try {
    const { input, provider } = req.body;
    if (!input || !input.trim()) {
      return res.status(400).json({ error: 'Input text is required' });
    }

    const deck = await orchestrateGeneration(input, provider);
    return res.json({ success: true, data: deck, source: getAvailableProvider().provider });
  } catch (error) {
    console.error('Generation error:', error.message);
    return res.status(500).json({
      error: 'Generation failed',
      details: error.message
    });
  }
});

// SSE Streaming Route
app.post('/api/generate-stream', async (req, res) => {
  const { input, provider } = req.body;

  if (!input || !input.trim()) {
    return res.status(400).json({ error: 'Input text is required' });
  }

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  sendEvent('status', { message: 'Analyzing notes and structuring study concepts...' });

  try {
    // Generate deck
    const deck = await orchestrateGeneration(input, provider);

    // Stream out chunks progressively to simulate or pipe real LLM streaming tokens
    const jsonString = JSON.stringify(deck, null, 2);
    const chunkSize = 120;
    
    for (let i = 0; i < jsonString.length; i += chunkSize) {
      const chunk = jsonString.slice(i, i + chunkSize);
      sendEvent('chunk', { chunk });
      // Small tick for realistic streaming feel
      await new Promise(resolve => setTimeout(resolve, 40));
    }

    sendEvent('complete', { deck });
    res.end();
  } catch (error) {
    sendEvent('error', { message: error.message });
    res.end();
  }
});

// Refinement Loop Route: Edits existing deck based on user follow-up
app.post('/api/refine', async (req, res) => {
  try {
    const { existingDeck, instruction, provider } = req.body;

    if (!existingDeck || !instruction) {
      return res.status(400).json({ error: 'Both existing deck and refinement instruction are required' });
    }

    const prompt = `Here is the current study deck JSON:
${JSON.stringify(existingDeck, null, 2)}

User request for modification:
"${instruction}"

Modify the deck according to the user's instructions while preserving all unaffected parts.
Return the updated complete study deck JSON strictly adhering to the schema.`;

    const updatedDeck = await orchestrateGeneration(prompt, provider);
    return res.json({ success: true, data: updatedDeck });
  } catch (error) {
    console.error('Refinement error:', error.message);
    return res.status(500).json({
      error: 'Refinement failed',
      details: error.message
    });
  }
});

// Dedicated Failure Simulator Route for Evaluator Testing
app.post('/api/simulate-failure', async (req, res) => {
  const { mode } = req.body;

  switch (mode) {
    case 'malformed_json':
      // Truncated, invalid syntax JSON
      res.setHeader('Content-Type', 'application/json');
      return res.send('{"title": "Broken AI Response", "flashcards": [{"front": "Oops", "back": "Syntax error here... missing closing brace');

    case 'wrong_shape':
      // Valid JSON, but completely wrong shape (missing required arrays, keys as numbers)
      return res.json({
        unexpectedRoot: 'The model hallucinated a chat conversation instead of a study deck',
        message: 'Hello! Here are some thoughts on your notes, but no structured keys exist here.',
        code: 999
      });

    case 'empty_response':
      // Returns empty string / empty object
      return res.json({});

    case 'slow_timeout':
      // Simulates slow server timeout (15 seconds)
      await new Promise(resolve => setTimeout(resolve, 15000));
      return res.json({ success: true, data: generateMockDeck('Delayed Output') });

    case 'http_500':
      // Simulates 500 internal server error
      return res.status(500).json({
        error: 'Upstream Model Gateway Overloaded (HTTP 500)',
        details: 'The AI model provider is currently experiencing high load or rate limit quotas.'
      });

    case 'stale_race':
      // Takes 3 seconds to complete - used to test race condition where user triggers a second request immediately
      await new Promise(resolve => setTimeout(resolve, 3000));
      return res.json({
        success: true,
        data: {
          ...generateMockDeck('Old Stale Request #1'),
          title: 'STALE RESPONSE #1 (Should NOT overwrite newer request!)'
        }
      });

    default:
      return res.status(400).json({ error: 'Unknown simulation mode' });
  }
});

// Health & System Info Route
app.get('/api/health', (req, res) => {
  const providerInfo = getAvailableProvider();
  res.json({
    status: 'healthy',
    activeProvider: providerInfo.provider,
    hasApiKey: Boolean(providerInfo.key),
    availableModels: ['Mock Engine (Instant)', 'Gemini 1.5 Flash', 'Groq Llama 3.3', 'OpenAI GPT-4o-mini', 'Local Ollama']
  });
});

// Catch-all handler to serve index.html for client-side SPA routing in production
// Compatible with both Express 4 and Express 5 (avoids path-to-regexp wildcard error)
if (fs.existsSync(distPath)) {
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

app.listen(PORT, () => {
  console.log(`[StudyMate AI Backend] Listening on http://localhost:${PORT}`);
  console.log(`[StudyMate AI Backend] Active Provider: ${getAvailableProvider().provider}`);
});
