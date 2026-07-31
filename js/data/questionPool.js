const DEFAULT_QUESTIONS_URL = 'data/questions.json';

const FALLBACK_QUESTIONS = [
  { domanda: 'Quanto fa 2 + 2?', risposta: '4' },
  { domanda: 'Quanto fa 9 - 3?', risposta: '6' },
  { domanda: 'Quanto fa 3 x 3?', risposta: '9' },
  { domanda: 'Quanto fa 12 : 4?', risposta: '3' },
];

async function loadQuestions(url = DEFAULT_QUESTIONS_URL) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) return data;
    throw new Error('pool vuoto');
  } catch (e) {
    console.warn(`Impossibile caricare ${url}, uso il pool di riserva.`, e);
    return FALLBACK_QUESTIONS;
  }
}

function drawQuestion(state, questions) {
  if (!state.questionState) {
    state.questionState = { usedIndices: [] };
  }
  const used = state.questionState.usedIndices;
  if (used.length >= questions.length) {
    used.length = 0;
  }
  const available = [];
  for (let i = 0; i < questions.length; i++) {
    if (!used.includes(i)) available.push(i);
  }
  const pick = available[Math.floor(Math.random() * available.length)];
  used.push(pick);
  return questions[pick];
}

export { loadQuestions, drawQuestion, FALLBACK_QUESTIONS, DEFAULT_QUESTIONS_URL };
