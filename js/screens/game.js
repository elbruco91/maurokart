import * as state from '../state.js';
import * as engine from '../engine/turnEngine.js';
import { renderTrack } from '../ui/boardRenderer.js';
import { renderLog } from '../ui/log.js';
import * as modals from '../ui/modals.js';
import { animateDie } from '../engine/dice.js';
import { PLAYER_COLORS } from '../state.js';
import { LOOT_ITEMS } from '../data/lootbox.js';

const LOOT_WINDOW_PHASES = ['start', 'roll1', 'question', 'reveal'];

let els = {};
let onExitCallback = null;

function init(elements, onExit) {
  els = elements;
  onExitCallback = onExit;

  els.mainAction.addEventListener('click', handleMainAction);
  els.correctBtn.addEventListener('click', () => handleEvaluate(true));
  els.wrongBtn.addEventListener('click', () => handleEvaluate(false));

  els.advanceBtn.addEventListener('click', () => {
    const s = state.getState();
    engine.manualMove(s, engine.currentPlayer(s).id, 1);
    render();
  });

  els.retreatBtn.addEventListener('click', () => {
    modals.showConfirm('Se torni indietro annullerai un tiro. Confermi?', () => {
      const s = state.getState();
      engine.manualMove(s, engine.currentPlayer(s).id, -1);
      render();
    });
  });

  els.manualAdjustBtn.addEventListener('click', () => {
    modals.showManualAdjust(state.getState(), (playerId, delta) => {
      engine.manualMove(state.getState(), playerId, delta);
      render();
    });
  });

  els.exitBtn.addEventListener('click', () => {
    modals.showConfirm('Vuoi uscire e mettere in pausa la partita?', () => {
      state.saveState();
      onExitCallback();
    });
  });

  els.lootBtn.addEventListener('click', () => {
    const s = state.getState();
    const p = engine.currentPlayer(s);
    const item = LOOT_ITEMS[p.lootbox];
    if (!item) return;
    modals.showLootActivation(item, (direction) => {
      engine.activateLoot(s, direction);
      render();
    });
  });
}

function render() {
  const s = state.getState();
  if (!s) return;

  renderTrack(els.trackContainer, s);
  renderLog(els.logContainer, s);
  renderPlayerList(s);

  const cfg = engine.getPhaseConfig(s);
  const evaluating = s.turnPhase === 'evaluate';
  const finished = s.raceStatus === 'finished';

  els.mainAction.style.display = evaluating || finished ? 'none' : '';
  els.mainAction.textContent = cfg.label || '';
  els.evaluateRow.style.display = evaluating ? 'flex' : 'none';

  const hasQuestion = !!s.currentTurn.question && ['reveal', 'evaluate'].includes(s.turnPhase);
  els.questionBox.style.display = hasQuestion ? 'block' : 'none';
  if (hasQuestion) {
    els.questionText.textContent = s.currentTurn.question.domanda;
    els.answerText.textContent = s.currentTurn.question.risposta;
    els.answerText.style.display = s.turnPhase === 'evaluate' ? '' : 'none';
  }

  els.currentPlayerLabel.textContent = engine.currentPlayer(s).name;
  els.currentPlayerLabel.style.color = PLAYER_COLORS[engine.currentPlayer(s).colorId].hex;

  const cp = engine.currentPlayer(s);
  const canUseLoot = !!cp.lootbox && LOOT_WINDOW_PHASES.includes(s.turnPhase) && !finished;
  els.lootBtn.disabled = !canUseLoot;
  els.lootBtn.textContent = cp.lootbox ? `Loot: ${LOOT_ITEMS[cp.lootbox].name}` : 'Loot';

  els.finishBanner.style.display = finished ? 'block' : 'none';
  if (finished) {
    const winner = s.players.find((p) => p.id === s.winnerId);
    els.finishBanner.textContent = `Vince ${winner.name}!`;
  }
}

function renderPlayerList(s) {
  els.playerList.innerHTML = '';
  s.players.forEach((p) => {
    const row = document.createElement('div');
    row.className = 'player-row';
    if (p.id === s.players[s.currentPlayerIndex].id && s.raceStatus !== 'finished') {
      row.classList.add('active');
    }
    const dot = document.createElement('span');
    dot.className = 'player-dot';
    dot.style.background = PLAYER_COLORS[p.colorId].hex;
    row.appendChild(dot);
    const itemLabel = p.lootbox ? ` [${LOOT_ITEMS[p.lootbox].name}]` : '';
    const shieldLabel = p.pendingEffects.shieldTurnsLeft > 0 ? ' 🛡' : '';
    const label = document.createElement('span');
    label.textContent = `${p.name} - casella ${p.progress}${p.finished ? ' (arrivato)' : ''}${itemLabel}${shieldLabel}`;
    row.appendChild(label);
    els.playerList.appendChild(row);
  });
}

function handleMainAction() {
  const s = state.getState();
  const cfg = engine.getPhaseConfig(s);

  switch (cfg.action) {
    case 'advancePhase':
      engine.advancePhase(s);
      render();
      break;
    case 'rollDice1':
      rollAndAnimate(engine.rollDice1, s);
      break;
    case 'showQuestion':
      engine.showQuestion(s);
      render();
      break;
    case 'revealAnswer':
      engine.revealAnswer(s);
      render();
      break;
    case 'rollDice2':
      rollAndAnimate(engine.rollDice2, s);
      break;
    case 'nextTurn':
      engine.nextTurn(s);
      render();
      break;
    default:
      break;
  }
}

function rollAndAnimate(rollFn, s) {
  els.mainAction.disabled = true;
  const roll = rollFn(s);
  animateDie(els.diceEl, roll, () => {
    els.mainAction.disabled = false;
    render();
  });
}

function handleEvaluate(correct) {
  engine.evaluate(state.getState(), correct);
  render();
}

export { init, render };
