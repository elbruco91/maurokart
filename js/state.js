const STORAGE_KEY = 'maurokart_state_v1';

const PLAYER_COLORS = {
  1: { id: 1, name: 'Rosso', hex: '#e53935' },
  2: { id: 2, name: 'Grigio', hex: '#9e9e9e' },
  3: { id: 3, name: 'Blu', hex: '#1e88e5' },
  4: { id: 4, name: 'Arancione', hex: '#fb8c00' },
  5: { id: 5, name: 'Verde', hex: '#43a047' },
  6: { id: 6, name: 'Azzurro', hex: '#00acc1' },
  7: { id: 7, name: 'Rosa', hex: '#ec407a' },
  8: { id: 8, name: 'Nero', hex: '#212121' },
};

let state = null;

function createPlayer(id, name, colorId) {
  return {
    id,
    name,
    colorId,
    progress: 0,
    lootbox: null,
    finished: false,
    finishRank: null,
    pendingEffects: {
      boostNextRoll1: false,
      mudNextRoll1: false,
      puddleArmed: false,
      puddleReturnProgress: null,
      turboNextRoll1: null,
      shieldTurnsLeft: 0,
      noMalusActive: false,
      bananaArmed: false,
      skipNextRoll1: false,
    },
  };
}

function createTestState() {
  return {
    raceConfig: { trackId: 'breve', laps: 2 },
    players: [
      createPlayer(1, 'Rosso', 1),
      createPlayer(2, 'Blu', 3),
      createPlayer(3, 'Verde', 5),
    ],
    currentPlayerIndex: 0,
    turnPhase: 'start',
    currentTurn: { roll1: null, question: null, roll2: null, correct: null },
    history: [],
    raceStatus: 'inProgress',
    winnerId: null,
    trackHazards: {},
    activeRockets: [],
    roundBoxAssignment: null,
  };
}

function getState() {
  return state;
}

function setState(newState) {
  state = newState;
}

function saveState() {
  if (!state) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    state = JSON.parse(raw);
    return state;
  } catch (e) {
    return null;
  }
}

function clearState() {
  localStorage.removeItem(STORAGE_KEY);
  state = null;
}

function hasSavedState() {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

export {
  PLAYER_COLORS,
  createTestState,
  getState,
  setState,
  saveState,
  loadState,
  clearState,
  hasSavedState,
};
