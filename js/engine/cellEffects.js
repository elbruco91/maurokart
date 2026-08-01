import { getTrackForState, getPositionOnTrack } from './board.js';

const BOOST_MAP = { 1: 2, 2: 3, 3: 5, 4: 6, 5: 8, 6: 9 };
const MUD_MAP = { 1: 0, 2: 1, 3: 2, 4: 2, 5: 3, 6: 4 };

function applyRoll1Modifier(rawRoll, wasBoosted, wasMuddy) {
  if (wasBoosted) return BOOST_MAP[rawRoll];
  if (wasMuddy) return MUD_MAP[rawRoll];
  return rawRoll;
}

function consumeRoll1PendingEffects(player) {
  const wasBoosted = player.pendingEffects.boostNextRoll1;
  const wasMuddy = player.pendingEffects.mudNextRoll1;
  const wasPuddleArmed = player.pendingEffects.puddleArmed;
  player.pendingEffects.boostNextRoll1 = false;
  player.pendingEffects.mudNextRoll1 = false;
  player.pendingEffects.puddleArmed = false;
  return { wasBoosted, wasMuddy, wasPuddleArmed };
}

function applyLandingEffects(state, player, addLog) {
  if (player.finished) return;
  const track = getTrackForState(state);
  const { cellIndex, lap } = getPositionOnTrack(state, player);
  const cell = track.cells[cellIndex];

  switch (cell.type) {
    case 'boost':
      player.pendingEffects.boostNextRoll1 = true;
      player.pendingEffects.mudNextRoll1 = false;
      addLog(state, `Pedina ${player.name}: casella Boost, il prossimo Dado 1 sara' potenziato`);
      break;
    case 'mud':
      player.pendingEffects.mudNextRoll1 = true;
      player.pendingEffects.boostNextRoll1 = false;
      addLog(state, `Pedina ${player.name}: casella Fango, il prossimo Dado 1 sara' ridotto`);
      break;
    case 'puddle':
      player.pendingEffects.puddleArmed = true;
      player.pendingEffects.puddleReturnProgress = player.progress;
      addLog(state, `Pedina ${player.name}: casella Pozza, rischio di caduta al prossimo Dado 1`);
      break;
    case 'shortcut_in':
      if (cell.shortcutTarget != null) {
        player.progress = lap * track.length + cell.shortcutTarget;
        addLog(state, `Pedina ${player.name}: Scorciatoia! Teletrasportata alla casella ${cell.shortcutTarget + 1}`);
      }
      break;
    default:
      break;
  }
}

export { BOOST_MAP, MUD_MAP, applyRoll1Modifier, consumeRoll1PendingEffects, applyLandingEffects };
