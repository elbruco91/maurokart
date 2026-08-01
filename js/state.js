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

function createPlayer(id, name, colorId, icon) {
  return {
    id,
    name,
    colorId,
    icon: icon || null,
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
      justTeleported: false,
    },
  };
}

function shuffleArray(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function createRaceState({ trackId, laps, players, startOrder }) {
  const ordered = startOrder === 'random' ? shuffleArray(players) : players;
  return {
    raceConfig: { trackId, laps },
    players: ordered.map((p) => createPlayer(p.slot, p.name, p.slot, p.icon)),
    currentPlayerIndex: 0,
    turnPhase: 'start',
    currentTurn: { roll1: null, question: null, roll2: null, correct: null, redrawCredit: false },
    history: [],
    raceStatus: 'inProgress',
    winnerId: null,
    endedManually: false,
    trackHazards: {},
    activeRockets: [],
    roundBoxAssignment: null,
  };
}

function createTestState() {
  return createRaceState({
    trackId: 'breve',
    laps: 2,
    startOrder: 'manual',
    players: [
      { slot: 1, name: 'Rosso' },
      { slot: 2, name: 'Grigio' },
      { slot: 3, name: 'Blu' },
    ],
  });
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
  createRaceState,
  getState,
  setState,
  saveState,
  loadState,
  clearState,
  hasSavedState,
};
