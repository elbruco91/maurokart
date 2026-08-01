import { rollDie } from './dice.js';
import { moveProgress } from './board.js';
import { drawQuestion } from '../data/questionPool.js';
import { saveState } from '../state.js';
import {
  resolveRoll1Movement,
  consumeRoll1PendingEffects,
  clearRoll1Modifiers,
  applyLandingEffects,
} from './cellEffects.js';
import { dropBananaIfArmed, stepAllRockets, activateSimpleItem } from './lootbox.js';
import { computeRoundBoxAssignment } from '../data/lootbox.js';

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
  const p = currentPlayer(state);
  if (p.pendingEffects.skipNextRoll1) {
    p.pendingEffects.skipNextRoll1 = false;
    addLog(state, `Pedina ${p.name}: salta il Dado 1 (colpita dal razzo)`);
    state.turnPhase = 'question';
  } else {
    state.turnPhase = 'roll1';
  }
  saveState();
}

function rollDice1(state) {
  const p = currentPlayer(state);
  dropBananaIfArmed(state, p, addLog);

  const rawRoll = rollDie();
  state.currentTurn.roll1 = rawRoll;

  const { wasPuddleArmed } = consumeRoll1PendingEffects(p);

  if (wasPuddleArmed && rawRoll === 6) {
    p.progress = p.pendingEffects.puddleReturnProgress;
    clearRoll1Modifiers(p);
    addLog(state, `Pedina ${p.name}: Dado 1 = 6, cade nella pozza e torna indietro!`);
  } else {
    const { movement, label } = resolveRoll1Movement(rawRoll, p);
    clearRoll1Modifiers(p);
    moveProgress(state, p, movement);
    addLog(state, `Pedina ${p.name}: Dado 1 = ${rawRoll}${label} -> avanza di ${movement}`);
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
  dropBananaIfArmed(state, p, addLog);

  const roll = rollDie();
  state.currentTurn.roll2 = roll;

  const hadNoMalus = p.pendingEffects.noMalusActive;
  p.pendingEffects.noMalusActive = false;

  if (!state.currentTurn.correct && hadNoMalus) {
    addLog(state, `Pedina ${p.name}: Dado 2 = ${roll}, ma No Malus annulla la retrocessione`);
  } else {
    const delta = state.currentTurn.correct ? roll : -roll;
    moveProgress(state, p, delta);
    addLog(state, `Pedina ${p.name}: Dado 2 = ${roll} (${delta >= 0 ? '+' : ''}${delta})`);
  }

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

  const finishingPlayer = currentPlayer(state);
  if (finishingPlayer.pendingEffects.shieldTurnsLeft > 0) {
    finishingPlayer.pendingEffects.shieldTurnsLeft -= 1;
  }

  let next = state.currentPlayerIndex;
  let wrapped = false;
  do {
    const prev = next;
    next = (next + 1) % state.players.length;
    if (next <= prev) wrapped = true;
  } while (state.players[next].finished && next !== state.currentPlayerIndex);

  state.currentPlayerIndex = next;
  stepAllRockets(state, addLog);

  state.currentTurn = { roll1: null, question: null, roll2: null, correct: null, redrawCredit: false };
  state.turnPhase = 'start';

  if (wrapped || !state.roundBoxAssignment) {
    state.roundBoxAssignment = computeRoundBoxAssignment(state);
  }

  saveState();
}

function manualMove(state, playerId, delta) {
  const p = state.players.find((pl) => pl.id === playerId);
  moveProgress(state, p, delta);
  addLog(state, `Correzione manuale: Pedina ${p.name} ${delta >= 0 ? '+' : ''}${delta}`);
  saveState();
}

function activateLoot(state, direction) {
  const p = currentPlayer(state);
  const itemId = p.lootbox;
  if (!itemId) return;
  p.lootbox = null;

  if (itemId === 'redraw') {
    state.currentTurn.redrawCredit = true;
    addLog(state, `Pedina ${p.name}: attiva Ritira la domanda (disponibile quando verra' mostrata)`);
  } else {
    activateSimpleItem(state, p, itemId, direction, addLog, moveProgress, applyLandingEffects);
  }
  saveState();
}

function redrawQuestion(state) {
  if (!state.currentTurn.redrawCredit) return;
  state.currentTurn.redrawCredit = false;
  state.currentTurn.question = drawQuestion(state, questionList);
  addLog(state, `Pedina ${currentPlayer(state).name}: ridisegna la domanda`);
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
  activateLoot,
  redrawQuestion,
  addLog,
};
