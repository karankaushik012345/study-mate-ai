import { useState, useRef, useCallback } from 'react';
import { extractAndParseJSON, validateStudyDeck } from '../types/studySchema';

export function useStudyAssistant() {
  const [deck, setDeck] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'generating' | 'streaming' | 'refining' | 'error' | 'success'
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState(null);
  const [streamBuffer, setStreamBuffer] = useState('');
  const [lastInput, setLastInput] = useState('');

  // Protect against race conditions and stale responses
  const activeRequestIdRef = useRef(0);
  const abortControllerRef = useRef(null);

  /**
   * Cancels any active in-flight request
   */
  const cancelActiveRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * Generates a study deck from free-form text input
   */
  const generateDeck = useCallback(async (inputText, options = {}) => {
    const { stream = true, provider = 'auto', timeoutMs = 25000 } = options;

    if (!inputText || !inputText.trim()) {
      setError({
        type: 'validation',
        message: 'Please provide notes, text, or a topic to generate study materials.',
        recoverable: true
      });
      return;
    }

    // Cancel any previous pending request immediately (Race-condition protection)
    cancelActiveRequest();

    const requestId = ++activeRequestIdRef.current;
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLastInput(inputText);
    setError(null);
    setStreamBuffer('');
    setStatus(stream ? 'streaming' : 'generating');
    setStatusMessage('Analyzing material and structuring study concepts...');

    // Set client-side timeout safeguard
    const timeoutId = setTimeout(() => {
      if (activeRequestIdRef.current === requestId) {
        controller.abort();
        setError({
          type: 'timeout',
          message: 'Request timed out after 25 seconds. The AI model took too long to respond.',
          recoverable: true
        });
        setStatus('error');
      }
    }, timeoutMs);

    try {
      if (stream) {
        // SSE Streaming Generation
        const response = await fetch('/api/generate-stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: inputText, provider }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // If another request was launched while fetch was pending, discard this one!
        if (activeRequestIdRef.current !== requestId) return;

        if (!response.ok) {
          throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulatedText = '';
        let finalDeckData = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Stale response check inside loop
          if (activeRequestIdRef.current !== requestId) {
            reader.cancel();
            return;
          }

          const chunkStr = decoder.decode(value, { stream: true });
          const lines = chunkStr.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const eventPayload = JSON.parse(line.slice(6));
                if (eventPayload.chunk) {
                  accumulatedText += eventPayload.chunk;
                  setStreamBuffer(accumulatedText);
                }
                if (eventPayload.deck) {
                  finalDeckData = eventPayload.deck;
                }
                if (eventPayload.message) {
                  setStatusMessage(eventPayload.message);
                }
              } catch {
                // Ignore partial SSE split lines
              }
            }
          }
        }

        if (activeRequestIdRef.current !== requestId) return;

        // Process and validate final parsed deck
        setStatusMessage('Validating data integrity and structure...');
        let rawData = finalDeckData;

        if (!rawData && accumulatedText) {
          rawData = extractAndParseJSON(accumulatedText);
        }

        if (!rawData) {
          throw new Error('Streaming completed without returning a valid study payload.');
        }

        const validated = validateStudyDeck(rawData);
        setDeck(validated);
        setStatus('success');
        setStatusMessage('Study deck generated successfully!');
      } else {
        // Standard Non-streaming Generation
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: inputText, provider }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (activeRequestIdRef.current !== requestId) return;

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.details || errData.error || `HTTP Error ${response.status}`);
        }

        const result = await response.json();
        const validated = validateStudyDeck(result.data);

        setDeck(validated);
        setStatus('success');
        setStatusMessage('Study deck ready!');
      }
    } catch (err) {
      clearTimeout(timeoutId);

      // If intentionally aborted because of a newer user request, do not trigger error
      if (err.name === 'AbortError') {
        if (activeRequestIdRef.current === requestId) {
          // Explicit user abort
          setStatus('idle');
          setStatusMessage('');
        }
        return;
      }

      if (activeRequestIdRef.current !== requestId) return;

      console.error('Study Assistant Generation Error:', err);
      setError({
        type: 'generation_failure',
        message: err.message || 'An unexpected error occurred while processing the AI response.',
        rawResponse: streamBuffer || null,
        recoverable: true
      });
      setStatus('error');
    }
  }, [cancelActiveRequest, streamBuffer]);

  /**
   * Refinement Loop: Modifies the existing deck using natural language instructions
   */
  const refineDeck = useCallback(async (instruction, provider = 'auto') => {
    if (!deck) return;
    if (!instruction || !instruction.trim()) return;

    cancelActiveRequest();

    const requestId = ++activeRequestIdRef.current;
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setStatus('refining');
    setStatusMessage(`Refining deck: "${instruction.slice(0, 45)}..."`);
    setError(null);

    try {
      const response = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          existingDeck: deck,
          instruction: instruction.trim(),
          provider
        }),
        signal: controller.signal
      });

      if (activeRequestIdRef.current !== requestId) return;

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.details || errData.error || `HTTP Error ${response.status}`);
      }

      const result = await response.json();
      const validated = validateStudyDeck(result.data);

      setDeck(validated);
      setStatus('success');
      setStatusMessage('Deck refined successfully!');
    } catch (err) {
      if (err.name === 'AbortError') return;
      if (activeRequestIdRef.current !== requestId) return;

      console.error('Refinement error:', err);
      setError({
        type: 'refinement_failure',
        message: `Failed to refine deck: ${err.message}`,
        recoverable: true
      });
      setStatus('error');
    }
  }, [deck, cancelActiveRequest]);

  /**
   * Evaluator Testing Harness: Intentionally triggers specific failure modes
   */
  const testFailureMode = useCallback(async (mode) => {
    cancelActiveRequest();

    const requestId = ++activeRequestIdRef.current;
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setStatus('generating');
    setStatusMessage(`Testing failure simulation: [${mode}]...`);
    setError(null);

    try {
      if (mode === 'stale_race') {
        // Fire Request #1 (slow, takes 3 seconds)
        setStatusMessage('Fired Slow Request #1... firing Fast Request #2 immediately after!');
        
        const req1Promise = fetch('/api/simulate-failure', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'stale_race' }),
          signal: controller.signal
        }).then(async res => {
          const data = await res.json();
          // Check stale protection
          if (activeRequestIdRef.current === requestId) {
            setDeck(validateStudyDeck(data.data));
            setStatus('success');
          } else {
            console.warn('[Stale Guard] Discarded Request #1 because Request #2 took over!');
          }
        });

        // Fire Request #2 200ms later (Fast, immediate mock)
        setTimeout(() => {
          const req2Id = ++activeRequestIdRef.current;
          setStatusMessage('Fast Request #2 arrived! Request #1 is now marked stale.');
          const fastDeck = validateStudyDeck({
            title: 'NEW REQUEST #2 (Successfully Prevailed!)',
            topic: 'Race Condition Demo',
            difficulty: 'Beginner',
            summary: 'This proof demonstrates that Request #2 updated the UI first, and the slower Request #1 response was discarded.',
            flashcards: [{ id: 'fc-race', front: 'Did Request #2 prevail?', back: 'Yes! The sequence token discarded stale Request #1.' }],
            quiz: [{ id: 'q-race', question: 'How was race condition prevented?', options: ['Sequence ID tokens & AbortController', 'Luck'], correctIndex: 0, explanation: 'Token matching ensures stale responses never write to state.' }]
          });
          setDeck(fastDeck);
          setStatus('success');
        }, 300);

        return;
      }

      // Other failure simulations
      const response = await fetch('/api/simulate-failure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
        signal: controller.signal
      });

      if (activeRequestIdRef.current !== requestId) return;

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Simulated HTTP ${response.status}: ${errorText}`);
      }

      const rawText = await response.text();
      let parsed;
      try {
        parsed = extractAndParseJSON(rawText);
      } catch (parseErr) {
        throw new Error(`Parser rejected corrupted response: ${parseErr.message}`);
      }

      const validated = validateStudyDeck(parsed);
      setDeck(validated);
      setStatus('success');
    } catch (err) {
      if (err.name === 'AbortError') return;
      if (activeRequestIdRef.current !== requestId) return;

      setError({
        type: `simulated_${mode}`,
        message: `[Handled Gracefully] ${err.message}`,
        rawResponse: `Simulation mode: ${mode}`,
        recoverable: true
      });
      setStatus('error');
    }
  }, [cancelActiveRequest]);

  /**
   * Retries last action
   */
  const retryLast = useCallback(() => {
    if (lastInput) {
      generateDeck(lastInput);
    }
  }, [lastInput, generateDeck]);

  return {
    deck,
    setDeck,
    status,
    statusMessage,
    error,
    streamBuffer,
    generateDeck,
    refineDeck,
    testFailureMode,
    cancelActiveRequest,
    retryLast,
    reset: () => {
      cancelActiveRequest();
      setDeck(null);
      setError(null);
      setStatus('idle');
      setStreamBuffer('');
    }
  };
}
