import { useState, useEffect } from 'react';

const STORAGE_KEY = 'studymate_saved_sessions_v1';

export const SAMPLE_DECKS = [
  {
    id: 'sample-react-internals',
    title: 'React Internals & Web Performance',
    topic: 'Frontend Architecture',
    difficulty: 'Intermediate',
    estimatedMinutes: 15,
    summary: 'A deep dive into React reconciliation, hook state mechanics, stale closures, and async request race-condition mitigation.',
    keyTakeaways: [
      'Virtual DOM diffing uses fiber nodes for incremental, interruptible rendering.',
      'Stale closures occur when useEffect captures old state references across render ticks.',
      'AbortController cancels in-flight fetch requests to prevent stale updates from overwriting fresh UI state.',
      'Zod or schema validators protect UI components from crashing on malformed AI JSON.'
    ],
    flashcards: [
      {
        id: 'fc-react-1',
        front: 'What causes a stale closure in React hooks?',
        back: 'When an effect, callback, or event handler references state or props from an earlier render without listing them in its dependency array.',
        hint: 'Think about JavaScript lexical scoping rules.'
      },
      {
        id: 'fc-react-2',
        front: 'How does an AbortController protect against race conditions?',
        back: 'By passing an AbortSignal to fetch(), an in-flight request can be cancelled immediately when a new request is triggered.',
        hint: 'Prevents slow request #1 from overwriting fast request #2.'
      },
      {
        id: 'fc-react-3',
        front: 'What is the primary benefit of the React Fiber architecture?',
        back: 'It breaks rendering work into incremental units, allowing the browser main thread to prioritize high-priority user interactions.',
        hint: 'Time-slicing and interruptible rendering.'
      },
      {
        id: 'fc-react-4',
        front: 'Why should AI responses be validated with defensive fallbacks?',
        back: 'LLMs can output invalid JSON, drop required array fields, or hallucinate null values. Schema validation guarantees UI reliability.',
        hint: 'Separation between raw network data and verified component props.'
      }
    ],
    quiz: [
      {
        id: 'q-react-1',
        question: 'A user types in a search box. Request A takes 3 seconds; Request B takes 500ms. Without cancellation, what bug occurs?',
        options: [
          'Request B will fail with a 500 error',
          'Request A finishes last and overwrites Request B with stale, outdated results',
          'React will unmount the component automatically',
          'The browser cache will lock up'
        ],
        correctIndex: 1,
        explanation: 'Because Request A took longer, it resolves after Request B and sets state with old data. An AbortController or sequence token prevents this.'
      },
      {
        id: 'q-react-2',
        question: 'Which strategy handles malformed or truncated AI JSON without crashing the application?',
        options: [
          'Directly passing JSON.parse without try/catch to crash fast',
          'Wrapping in try/catch, using partial JSON repair, validating shapes, and showing a user-friendly error/retry state',
          'Hiding the error and showing a blank white screen',
          'Converting all objects into strings and logging to console only'
        ],
        correctIndex: 1,
        explanation: 'Defensive engineering pairs parsing guards with automatic fallback defaults and actionable retry UI.'
      },
      {
        id: 'q-react-3',
        question: 'In React, why should list items have stable, unique keys rather than array indices when items can be reordered or removed?',
        options: [
          'Array indices make CSS transitions faster',
          'Using array indices can cause React to reuse state from the wrong component when items move',
          'React throws a compilation error if an index is used',
          'Stable keys use less memory in the V8 engine'
        ],
        correctIndex: 1,
        explanation: 'Indices change whenever elements are inserted, deleted, or shuffled, leading to subtle state bugs in uncontrolled or animating children.'
      }
    ],
    cheatsheet: [
      {
        term: 'AbortController',
        definition: 'DOM interface allowing you to abort DOM requests (such as Fetch) as and when desired.',
        example: 'const controller = new AbortController(); fetch(url, { signal: controller.signal });'
      },
      {
        term: 'Defensive Parsing',
        definition: 'Safely handling untrusted or volatile external payloads using schema constraints and graceful fallbacks.',
        example: 'const items = Array.isArray(data?.items) ? data.items : [];'
      },
      {
        term: 'Debounce',
        definition: 'Delaying execution of a function until a specified idle duration has passed since its last invocation.',
        example: 'Waiting 300ms after the user stops typing in a search bar before firing a query.'
      }
    ]
  },
  {
    id: 'sample-cap-theorem',
    title: 'Distributed Systems & CAP Theorem',
    topic: 'System Architecture',
    difficulty: 'Advanced',
    estimatedMinutes: 20,
    summary: 'Master the fundamental trade-offs in distributed data storage: Consistency, Availability, and Partition Tolerance.',
    keyTakeaways: [
      'In any distributed network, network partitions (P) are inevitable physical realities.',
      'When a network partition occurs, a system must choose between Consistency (CP) or Availability (AP).',
      'Eventual consistency provides higher availability at the expense of temporary read discrepancies.',
      'Consensus algorithms like Raft and Paxos ensure strict serializability across quorum nodes.'
    ],
    flashcards: [
      {
        id: 'fc-cap-1',
        front: 'What does Consistency mean in the context of the CAP Theorem?',
        back: 'Every read receives the most recent write or an error, guaranteeing a single-system view.',
        hint: 'Linearizability / Strong consistency.'
      },
      {
        id: 'fc-cap-2',
        front: 'Why is Partition Tolerance non-negotiable in distributed networks?',
        back: 'Physical networks experience packet drops, fiber cuts, and latency spikes. A distributed system must survive communication failures.',
        hint: 'You cannot choose CA in a real WAN.'
      },
      {
        id: 'fc-cap-3',
        front: 'What is the core trade-off of an AP (Available / Partition-tolerant) system?',
        back: 'Nodes always accept reads and writes, but different nodes may temporarily return different versions of data until sync finishes.',
        hint: 'Amazon DynamoDB or Cassandra default modes.'
      }
    ],
    quiz: [
      {
        id: 'q-cap-1',
        question: 'Under network partition, if a system chooses Consistency (CP), what happens when a write reaches an isolated node?',
        options: [
          'The write succeeds immediately on all nodes',
          'The write is rejected or blocks until quorum connectivity is restored, sacrificing immediate availability',
          'The partition magically heals itself',
          'The node converts itself into an in-memory cache'
        ],
        correctIndex: 1,
        explanation: 'To maintain strict consistency, isolated nodes cannot accept unconfirmed writes without risking divergence.'
      },
      {
        id: 'q-cap-2',
        question: 'Which consensus protocol uses an elected leader, term numbers, and replicated logs to achieve CP consistency?',
        options: [
          'Raft',
          'DNS Round Robin',
          'MapReduce',
          'WebSocket multiplexing'
        ],
        correctIndex: 0,
        explanation: 'Raft decomposes distributed consensus into leader election, log replication, and safety guarantees.'
      }
    ],
    cheatsheet: [
      {
        term: 'Quorum',
        definition: 'The minimum number of members of an assembly that must be present to validate decisions (usually N/2 + 1).',
        example: 'In a 5-node cluster, at least 3 nodes must agree to commit a transaction.'
      },
      {
        term: 'Split-Brain',
        definition: 'A state where network partition causes two sub-clusters to believe they are the sole leader, risking divergent writes.',
        example: 'Prevented using odd node counts and strict majority quorums.'
      }
    ]
  }
];

export function useSessions() {
  const [sessions, setSessions] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback to sample decks on parse failure
    }
    return SAMPLE_DECKS;
  });

  // Persist sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (err) {
      console.warn('Failed to save sessions to localStorage:', err);
    }
  }, [sessions]);

  const saveDeck = (newDeck) => {
    if (!newDeck || !newDeck.id) return;
    setSessions(prev => {
      const existingIdx = prev.findIndex(d => d.id === newDeck.id);
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = newDeck;
        return updated;
      }
      return [newDeck, ...prev];
    });
  };

  const deleteDeck = (deckId) => {
    setSessions(prev => prev.filter(d => d.id !== deckId));
  };

  const renameDeck = (deckId, newTitle) => {
    setSessions(prev =>
      prev.map(d => (d.id === deckId ? { ...d, title: newTitle.trim() } : d))
    );
  };

  const exportSessionsToJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sessions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `studymate-decks-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importSessionsFromJSON = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        setSessions(prev => [...parsed, ...prev]);
        return { success: true, count: parsed.length };
      }
      throw new Error('Imported JSON is not an array of study decks.');
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    sessions,
    saveDeck,
    deleteDeck,
    renameDeck,
    exportSessionsToJSON,
    importSessionsFromJSON,
  };
}
