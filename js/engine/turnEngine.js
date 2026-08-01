import { rollDie } from './dice.js';
import { moveProgress } from './board.js';
import { drawQuestion } from '../data/questionPool.js';
import { saveState } from '../state.js';
import { applyRoll1Modifier, consumeRoll1PendingEffects, applyLandingEffects } from './cellEffects.js';

let questionList = [];

function setQuestions(list) {
  questionList = list;
}

function currentPlayer(state) {
  return state.players[state.currentPlayerIndex];
}

function addLog(state, text) {
  state.history.unshift({ text, timestamp: Date.now() });
}

function getPhaseConfig(state) {
  const p = currentPlayer(state);
  switch (state.turnPhase) {
    case 'start':
      return { label: `Inizia turno: ${p.name}`, action: 'advancePhase' };
    case 'roll1':
      return { label: 'Lancia Dado 1', action: 'rollDice1' };
    case 'question':
      return { label: 'Mostra Domanda', action: 'showQuestion' };
    case 'reveal':
      return { label: 'Mostra Risposta', action: 'revealAnswer' };
    case 'evaluate':
      return { label: null, action: null };
    case 'roll2':
      return { label: 'Lancia Dado 2', action: 'rollDice2' };
    case 'nextTurn':
      return { label: 'Prossimo Turno', action: 'nextTurn' };
    default:
      return { label: '', action: null };
  }
}

function advancePhase(state) {
  state.turnPhase = 'roll1';
  saveState();
}

function rollDice1(state) {
  const p = currentPlayer(state);
  const rawRoll = rollDie();
  state.currentTurn.roll1 = rawRoll;

  const { wasBoosted, wasMuddy, wasPuddleArmed } = consumeRoll1PendingEffects(p);

  if (wasPuddleArmed && rawRoll === 6) {
    p.progress = p.pendingEffects.puddleReturnProgress;
    addLog(state, `Pedina ${p.name}: Dado 1 = 6, cade nella pozza e torna indietro!`);
  } else {
    const movement = applyRoll1Modifier(rawRoll, wasBoosted, wasMuddy);
    moveProgress(state, p, movement);
    const note = wasBoosted ? ' (boost)' : wasMuddy ? ' (fango)' : '';
    addLog(state, `Pedina ${p.name}: Dado 1 = ${rawRoll}${note} -> avanza di ${movement}`);
  }

  applyLandingEffects(state, p, addLog);
  state.turnPhase = 'question';
  saveState();
  return rawRoll;
}

function showQuestion(state) {
  const q = drawQuestion(state, questionList);
  state.currentTurn.question = q;
  state.turnPhase = 'reveal';
  saveState();
  return q;
}

function revealAnswer(state) {
  state.turnPhase = 'evaluate';
  saveState();
}

function evaluate(state, correct) {
  state.currentTurn.correct = correct;
  addLog(state, `Pedina ${currentPlayer(state).name}: risposta ${correct ? 'corretta' : 'errata'}`);
  state.turnPhase = 'roll2';
  saveState();
}

function rollDice2(state) {
  const p = currentPlayer(state);
  const roll = rollDie();
  state.currentTurn.roll2 = roll;
  const delta = state.currentTurn.correct ? roll : -roll;
  moveProgress(state, p, delta);
  addLog(state, `Pedina ${p.name}: Dado 2 = ${roll} (${delta >= 0 ? '+' : ''}${delta})`);
  if (p.finished) {
    addLog(state, `Pedina ${p.name} ha tagliato il traguardo!`);
    state.raceStatus = 'finished';
  } else {
    applyLandingEffects(state, p, addLog);
  }
  state.turnPhase = 'nextTurn';
  saveState();
  return roll;
}

function nextTurn(state) {
  if (state.raceStatus === 'finished') return;
  let next = state.currentPlayerIndex;
  do {
    next = (next + 1) % state.players.length;
  } while (state.players[next].finished && next !== state.currentPlayerIndex);
  state.currentPlayerIndex = next;
  state.currentTurn = { roll1: null, question: null, roll2: null, correct: null };
  state.turnPhase = 'start';
  saveState();
}

function manualMove(state, playerId, delta) {
  const p = state.players.find((pl) => pl.id === playerId);
  moveProgress(state, p, delta);
  addLog(state, `Correzione manuale: Pedina ${p.name} ${delta >= 0 ? '+' : ''}${delta}`);
  saveState();
}

export {
  setQuestions,
  currentPlayer,
  getPhaseConfig,
  advancePhase,
  rollDice1,
  showQuestion,
  revealAnswer,
  evaluate,
  rollDice2,
  nextTurn,
  manualMove,
  addLog,
};
