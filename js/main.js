import * as state from './state.js';
import * as gameScreen from './screens/game.js';
import * as modals from './ui/modals.js';
import { loadQuestions } from './data/questionPool.js';
import { setQuestions } from './engine/turnEngine.js';

const screens = {
  menu: document.getElementById('screen-menu'),
  game: document.getElementById('screen-game'),
};

function showScreen(name) {
  Object.entries(screens).forEach(([key, el]) => {
    el.classList.toggle('active', key === name);
  });
}

function goToMenu() {
  showScreen('menu');
}

function startTestRace() {
  state.setState(state.createTestState());
  showScreen('game');
  gameScreen.render();
}

async function init() {
  modals.init(document.getElementById('modal-root'));

  gameScreen.init(
    {
      trackContainer: document.getElementById('track-container'),
      logContainer: document.getElementById('log-container'),
      playerList: document.getElementById('player-list'),
      mainAction: document.getElementById('main-action-btn'),
      correctBtn: document.getElementById('correct-btn'),
      wrongBtn: document.getElementById('wrong-btn'),
      evaluateRow: document.getElementById('evaluate-row'),
      lootBtn: document.getElementById('loot-btn'),
      advanceBtn: document.getElementById('advance-btn'),
      retreatBtn: document.getElementById('retreat-btn'),
      manualAdjustBtn: document.getElementById('manual-adjust-btn'),
      exitBtn: document.getElementById('exit-btn'),
      diceEl: document.getElementById('dice'),
      questionBox: document.getElementById('question-box'),
      questionText: document.getElementById('question-text'),
      answerText: document.getElementById('answer-text'),
      currentPlayerLabel: document.getElementById('current-player-label'),
      finishBanner: document.getElementById('finish-banner'),
    },
    goToMenu,
  );

  const startBtn = document.getElementById('start-test-race-btn');
  startBtn.addEventListener('click', startTestRace);

  showScreen('menu');

  startBtn.disabled = true;
  startBtn.textContent = 'Caricamento domande...';
  const questions = await loadQuestions();
  setQuestions(questions);
  startBtn.disabled = false;
  startBtn.textContent = 'Avvia partita di test';
}

document.addEventListener('DOMContentLoaded', init);
