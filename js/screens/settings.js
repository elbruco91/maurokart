import {
  loadQuestions,
  isValidQuestionList,
  saveCustomQuestions,
  loadCustomQuestions,
  clearCustomQuestions,
} from '../data/questionPool.js';
import { setQuestions } from '../engine/turnEngine.js';
import { clearCustomTrack } from '../data/customTracks.js';
import * as modals from '../ui/modals.js';

let els = {};
let onExit = null;

function renderStatus() {
  const custom = loadCustomQuestions();
  els.questionsStatus.textContent = custom
    ? `In uso: pool personalizzato (${custom.length} domande).`
    : 'In uso: pool predefinito (data/questions.json).';
}

async function handleFile(file) {
  els.questionsFeedback.textContent = 'Caricamento...';
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!isValidQuestionList(data)) {
      els.questionsFeedback.textContent = 'File non valido: serve un array di oggetti { domanda, risposta }.';
      return;
    }
    saveCustomQuestions(data);
    setQuestions(data);
    renderStatus();
    els.questionsFeedback.textContent = `Caricate ${data.length} domande personalizzate.`;
  } catch (e) {
    els.questionsFeedback.textContent = 'Errore nella lettura del file JSON.';
  }
}

async function resetQuestions() {
  clearCustomQuestions();
  const defaults = await loadQuestions();
  setQuestions(defaults);
  renderStatus();
  els.questionsFeedback.textContent = 'Ripristinato il pool di domande predefinito.';
}

function resetTracks() {
  modals.showConfirm('Ripristinare tutte e 3 le piste predefinite? Le versioni personalizzate salvate verranno eliminate.', () => {
    ['pista1', 'pista2', 'pista3'].forEach((id) => clearCustomTrack(id));
    els.questionsFeedback.textContent = '';
  });
}

function init(elements, onExitCallback) {
  els = elements;
  onExit = onExitCallback;

  els.questionsFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
    e.target.value = '';
  });

  els.questionsResetBtn.addEventListener('click', resetQuestions);
  els.tracksResetBtn.addEventListener('click', resetTracks);
  els.backBtn.addEventListener('click', () => onExit());
}

function show() {
  renderStatus();
  els.questionsFeedback.textContent = '';
}

export { init, show };
