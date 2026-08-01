import { getTrackForState, getPositionOnTrack } from './board.js';
import { applyMalusWithShield } from './lootbox.js';
import { drawLootItem } from '../data/lootbox.js';

const BOOST_MAP = { 1: 2, 2: 3, 3: 5, 4: 6, 5: 8, 6: 9 };
const MUD_MAP = { 1: 0, 2: 1, 3: 2, 4: 2, 5: 3, 6: 4 };

function resolveRoll1Movement(rawRoll, player) {
  const turbo = player.pendingEffects.turboNextRoll1;
  const grounded = player.pendingEffects.boostNextRoll1;
  const muddy = player.pendingEffects.mudNextRoll1;

  if (!turbo && muddy) return { movement: MUD_MAP[rawRoll], label: ' (fango)' };
  if (!turbo && grounded) return { movement: BOOST_MAP[rawRoll], label: ' (boost)' };
  if (!turbo) return { movement: rawRoll, label: '' };

  let multiplier;
  let label;
  if (turbo === 'mini') {
    multiplier = grounded ? 2 : 1.5;
    label = grounded ? ' (mini turbo + boost)' : ' (mini turbo)';
  } else {
    multiplier = grounded ? 2.5 : 2;
    label = grounded ? ' (super turbo + boost)' : ' (super turbo)';
  }
  return { movement: Math.ceil(rawRoll * multiplier), label };
}

function consumeRoll1PendingEffects(player) {
  const wasPuddleArmed = player.pendingEffects.puddleArmed;
  player.pendingEffects.puddleArmed = false;
  return { wasPuddleArmed };
}

function clearRoll1Modifiers(player) {
  player.pendingEffects.boostNextRoll1 = false;
  player.pendingEffects.mudNextRoll1 = false;
  player.pendingEffects.turboNextRoll1 = null;
}

function applyLandingEffects(state, player, addLog) {
  if (player.finished) return;
  const track = getTrackForState(state);
  const { cellIndex, lap } = getPositionOnTrack(state, player);

  const hazard = state.trackHazards[cellIndex];
  if (hazard && hazard.type === 'mud') {
    delete state.trackHazards[cellIndex];
    applyMalusWithShield(state, player, 'la banana', () => {
      player.pendingEffects.mudNextRoll1 = true;
      player.pendingEffects.boostNextRoll1 = false;
      addLog(state, `Pedina ${player.name}: pesta una banana, il prossimo Dado 1 sara' ridotto`);
    }, addLog);
    return;
  }

  const cell = track.cells[cellIndex];

  switch (cell.type) {
    case 'boost':
      player.pendingEffects.boostNextRoll1 = true;
      player.pendingEffects.mudNextRoll1 = false;
      addLog(state, `Pedina ${player.name}: casella Boost, il prossimo Dado 1 sara' potenziato`);
      break;
    case 'mud':
      applyMalusWithShield(state, player, 'il Fango', () => {
        player.pendingEffects.mudNextRoll1 = true;
        player.pendingEffects.boostNextRoll1 = false;
        addLog(state, `Pedina ${player.name}: casella Fango, il prossimo Dado 1 sara' ridotto`);
      }, addLog);
      break;
    case 'puddle':
      applyMalusWithShield(state, player, 'la Pozza', () => {
        player.pendingEffects.puddleArmed = true;
        player.pendingEffects.puddleReturnProgress = player.progress;
        addLog(state, `Pedina ${player.name}: casella Pozza, rischio di caduta al prossimo Dado 1`);
      }, addLog);
      break;
    case 'shortcut_in':
      if (cell.shortcutTarget != null) {
        player.progress = lap * track.length + cell.shortcutTarget;
        addLog(state, `Pedina ${player.name}: Scorciatoia! Teletrasportata alla casella ${cell.shortcutTarget + 1}`);
      }
      break;
    case 'lootbox':
      if (player.lootbox) {
        addLog(state, `Pedina ${player.name}: casella Lootbox, ma lo slot e' gia' occupato`);
      } else {
        const box = (state.roundBoxAssignment && state.roundBoxAssignment[player.id]) || 1;
        const item = drawLootItem(box);
        if (item.id === 'broken_box') {
          addLog(state, `Pedina ${player.name}: Lootbox Box${box} -> Cassa guasta, nessun oggetto`);
        } else {
          player.lootbox = item.id;
          addLog(state, `Pedina ${player.name}: Lootbox Box${box} -> ${item.name}`);
        }
      }
      break;
    default:
      break;
  }
}

export {
  BOOST_MAP,
  MUD_MAP,
  resolveRoll1Movement,
  consumeRoll1PendingEffects,
  clearRoll1Modifiers,
  applyLandingEffects,
};
