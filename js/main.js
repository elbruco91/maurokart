import * as state from './state.js';
import * as gameScreen from './screens/game.js';
import * as setupScreen from './screens/setup.js';
import * as editorScreen from './screens/editor.js';
import * as rulesScreen from './screens/rules.js';
import * as settingsScreen from './screens/settings.js';
import * as modals from './ui/modals.js';
import { loadQuestions } from './data/questionPool.js';
import { setQuestions } from './engine/turnEngine.js';
import { computeRoundBoxAssignment } from './data/lootbox.js';

const screens = {
  menu: document.getElementById('screen-menu'),
  setup: document.getElementById('screen-setup'),
  editor: document.getElementById('screen-editor'),
  rules: document.getElementById('screen-rules'),
  settings: document.getElementById('screen-settings'),
  game: document.getElementById('screen-game'),
};

let resumeBtn;

function showScreen(name) {
  Object.entries(screens).forEach(([key, el]) => {
    el.classList.toggle('active', key === name);
  });
}

function goToMenu() {
  resumeBtn.style.display = state.hasSavedState() ? '' : 'none';
  showScreen('menu');
}

function goToSetup() {
  setupScreen.show();
  showScreen('setup');
}

function goToEditor() {
  modals.showPasswordPrompt(() => {
    editorScreen.show();
    showScreen('editor');
  });
}

function goToRules() {
  rulesScreen.show();
  showScreen('rules');
}

function goToSettings() {
  settingsScreen.show();
  showScreen('settings');
}

function startRace(config) {
  const s = state.createRaceState(config);
  s.roundBoxAssignment = computeRoundBoxAssignment(s);
  state.setState(s);
  state.saveState();
  showScreen('game');
  gameScreen.render();
}

function resumeRace() {
  const s = state.loadState();
  if (!s) {
    goToMenu();
    return;
  }
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
      endRaceBtn: document.getElementById('end-race-btn'),
      diceEl: document.getElementById('dice'),
      questionBox: document.getElementById('question-box'),
      questionText: document.getElementById('question-text'),
      answerText: document.getElementById('answer-text'),
      redrawBtn: document.getElementById('redraw-btn'),
      currentPlayerLabel: document.getElementById('current-player-label'),
    },
    goToMenu,
  );

  setupScreen.init(
    {
      trackOptions: document.getElementById('track-options'),
      lapsInput: document.getElementById('laps-input'),
      playerCountInput: document.getElementById('player-count-input'),
      orderRandomBtn: document.getElementById('order-random-btn'),
      orderManualBtn: document.getElementById('order-manual-btn'),
      playerRows: document.getElementById('player-rows'),
      cancelBtn: document.getElementById('setup-cancel-btn'),
      startBtn: document.getElementById('setup-start-btn'),
    },
    startRace,
    goToMenu,
  );

  editorScreen.init(
    {
      trackSelect: document.getElementById('editor-track-select'),
      tabShape: document.getElementById('editor-tab-shape'),
      tabCells: document.getElementById('editor-tab-cells'),
      shapeControls: document.getElementById('editor-shape-controls'),
      cellControls: document.getElementById('editor-cell-controls'),
      pieceCount: document.getElementById('editor-piece-count'),
      trackContainer: document.getElementById('editor-track-container'),
      pieceStraightBtn: document.getElementById('piece-straight-btn'),
      pieceCurveLeftBtn: document.getElementById('piece-curve-left-btn'),
      pieceCurveRightBtn: document.getElementById('piece-curve-right-btn'),
      undoBtn: document.getElementById('piece-undo-btn'),
      resetBtn: document.getElementById('piece-reset-btn'),
      restoreBtn: document.getElementById('editor-restore-btn'),
      cancelBtn: document.getElementById('editor-cancel-btn'),
      saveBtn: document.getElementById('editor-save-btn'),
    },
    goToMenu,
  );

  rulesScreen.init(
    {
      content: document.getElementById('rules-content'),
      backBtn: document.getElementById('rules-back-btn'),
    },
    goToMenu,
  );

  settingsScreen.init(
    {
      questionsStatus: document.getElementById('questions-status'),
      questionsFileInput: document.getElementById('questions-file-input'),
      questionsResetBtn: document.getElementById('questions-reset-btn'),
      questionsFeedback: document.getElementById('questions-feedback'),
      tracksResetBtn: document.getElementById('tracks-reset-btn'),
      backBtn: document.getElementById('settings-back-btn'),
    },
    goToMenu,
  );

  const startBtn = document.getElementById('start-race-btn');
  startBtn.addEventListener('click', goToSetup);

  resumeBtn = document.getElementById('resume-race-btn');
  resumeBtn.addEventListener('click', resumeRace);

  document.getElementById('open-editor-btn').addEventListener('click', goToEditor);
  document.getElementById('open-rules-btn').addEventListener('click', goToRules);
  document.getElementById('open-settings-btn').addEventListener('click', goToSettings);

  goToMenu();

  startBtn.disabled = true;
  startBtn.textContent = 'Caricamento domande...';
  const questions = await loadQuestions();
  setQuestions(questions);
  startBtn.disabled = false;
  startBtn.textContent = 'Inizia gara';
}

document.addEventListener('DOMContentLoaded', init);
