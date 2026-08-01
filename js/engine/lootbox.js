import { getPositionOnTrack } from './board.js';

function consumeShieldIfActive(player) {
  if (player.pendingEffects.shieldTurnsLeft > 0) {
    player.pendingEffects.shieldTurnsLeft = 0;
    return true;
  }
  return false;
}

function applyMalusWithShield(state, player, malusLabel, applyFn, addLog) {
  if (consumeShieldIfActive(player)) {
    addLog(state, `Pedina ${player.name}: Protezione blocca ${malusLabel}!`);
    return;
  }
  applyFn();
}

function dropBananaIfArmed(state, player, addLog) {
  if (!player.pendingEffects.bananaArmed) return;
  player.pendingEffects.bananaArmed = false;
  const { cellIndex } = getPositionOnTrack(state, player);
  state.trackHazards[cellIndex] = { type: 'mud', droppedBy: player.id };
  addLog(state, `Pedina ${player.name}: lascia una banana sulla casella ${cellIndex + 1}`);
}

function getTrueLeader(state) {
  let leader = state.players[0];
  state.players.forEach((p) => {
    if (p.progress > leader.progress) leader = p;
  });
  return leader;
}

function stepRocket(state, rocket, addLog) {
  rocket.position += rocket.step;
  let hitPlayer = null;

  if (rocket.type === 'leader') {
    const target = state.players.find((p) => p.id === rocket.targetId);
    if (target && !target.finished && rocket.position >= target.progress) {
      hitPlayer = target;
    }
  } else {
    const candidates = state.players.filter(
      (p) => p.id !== rocket.ownerId && !p.finished && p.progress <= rocket.position,
    );
    if (candidates.length > 0) {
      candidates.sort((a, b) => a.progress - b.progress);
      hitPlayer = candidates[0];
    }
  }

  if (hitPlayer) {
    applyMalusWithShield(state, hitPlayer, 'il razzo', () => {
      hitPlayer.pendingEffects.skipNextRoll1 = true;
      addLog(state, `Pedina ${hitPlayer.name}: colpita dal razzo di ${rocket.ownerName}! Salta il prossimo Dado 1`);
    }, addLog);
    state.activeRockets = state.activeRockets.filter((r) => r.id !== rocket.id);
  }
}

function stepRocketsForOwner(state, ownerId, addLog) {
  state.activeRockets
    .filter((r) => r.ownerId === ownerId)
    .forEach((rocket) => stepRocket(state, rocket, addLog));
}

function launchRocket(state, owner, type, addLog) {
  const step = type === 'leader' ? 9 : 6;
  const rocket = {
    id: `${owner.id}-${Date.now()}-${Math.random()}`,
    ownerId: owner.id,
    ownerName: owner.name,
    type,
    step,
    targetId: null,
    position: owner.progress,
  };

  if (type === 'leader') {
    const leader = getTrueLeader(state);
    if (leader.id === owner.id) {
      addLog(state, `Pedina ${owner.name}: sei gia' primo, il razzo esplode nel vuoto`);
      return;
    }
    rocket.targetId = leader.id;
  } else {
    const hasTargetAhead = state.players.some((p) => p.id !== owner.id && !p.finished && p.progress > owner.progress);
    if (!hasTargetAhead) {
      addLog(state, `Pedina ${owner.name}: nessuno davanti, il razzo esplode nel vuoto`);
      return;
    }
  }

  state.activeRockets.push(rocket);
  addLog(state, `Pedina ${owner.name}: lancia ${type === 'leader' ? 'il Razzo al primo' : 'il Razzo inseguitore'}!`);
  stepRocket(state, rocket, addLog);
}

function castLightning(state, caster, addLog) {
  state.players.forEach((other) => {
    if (other.id === caster.id || other.finished) return;
    applyMalusWithShield(state, other, 'il Fulmine', () => {
      other.pendingEffects.mudNextRoll1 = true;
      other.pendingEffects.boostNextRoll1 = false;
    }, addLog);
  });
  addLog(state, `Pedina ${caster.name}: scatena il Fulmine su tutti gli avversari!`);
}

function activateSimpleItem(state, player, itemId, direction, addLog, moveProgressFn, applyLandingEffectsFn) {
  switch (itemId) {
    case 'shield':
      player.pendingEffects.shieldTurnsLeft = 2;
      addLog(state, `Pedina ${player.name}: attiva la Protezione`);
      return true;
    case 'no_malus':
      player.pendingEffects.noMalusActive = true;
      addLog(state, `Pedina ${player.name}: attiva No Malus`);
      return true;
    case 'mini_turbo':
      player.pendingEffects.turboNextRoll1 = 'mini';
      addLog(state, `Pedina ${player.name}: attiva Mini Turbo`);
      return true;
    case 'super_turbo':
      player.pendingEffects.turboNextRoll1 = 'super';
      addLog(state, `Pedina ${player.name}: attiva Super Turbo`);
      return true;
    case 'mud_trap':
      player.pendingEffects.bananaArmed = true;
      addLog(state, `Pedina ${player.name}: prepara una banana da lasciare al prossimo movimento`);
      return true;
    case 'rocket_chaser':
      launchRocket(state, player, 'chaser', addLog);
      return true;
    case 'rocket_leader':
      launchRocket(state, player, 'leader', addLog);
      return true;
    case 'lightning':
      castLightning(state, player, addLog);
      return true;
    case 'plus1':
    case 'plus_minus1': {
      const delta = itemId === 'plus1' ? 1 : direction;
      player.pendingEffects.mudNextRoll1 = false;
      player.pendingEffects.puddleArmed = false;
      moveProgressFn(state, player, delta);
      addLog(state, `Pedina ${player.name}: usa ${itemId === 'plus1' ? '+1' : '+-1'} e si sposta di ${delta >= 0 ? '+' : ''}${delta}`);
      applyLandingEffectsFn(state, player, addLog);
      return true;
    }
    default:
      return false;
  }
}

export {
  consumeShieldIfActive,
  applyMalusWithShield,
  dropBananaIfArmed,
  stepRocketsForOwner,
  launchRocket,
  castLightning,
  activateSimpleItem,
};
