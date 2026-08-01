import { getTrackForState, getPositionOnTrack } from '../engine/board.js';
import { PLAYER_COLORS } from '../state.js';

const CELL_ICONS = {
  boost: '⚡',
  mud: '≈',
  puddle: '○',
  shortcut_in: '➜',
  shortcut_out: '⬅',
  lootbox: '?',
};

const CELL_GAP = 6;
const MAX_ANIMATED_HOPS = 20;

let pawnEls = {};
let rocketEls = {};
let lastProgress = {};
let hopAnimations = {};
let currentTrackId = null;

function getCellSize() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--cell-size');
  return parseFloat(raw) || 60;
}

function cellPixelCenter(cell, cellSize) {
  return {
    x: cell.col * (cellSize + CELL_GAP) + cellSize / 2,
    y: cell.row * (cellSize + CELL_GAP) + cellSize / 2,
  };
}

function cellForProgress(track, progress) {
  const idx = ((Math.round(progress) % track.length) + track.length) % track.length;
  return track.cells[idx];
}

function renderCells(grid, track, state) {
  grid.innerHTML = '';
  track.cells.forEach((cell) => {
    const div = document.createElement('div');
    div.className = `cell cell-${cell.type}`;
    div.style.gridColumn = cell.col + 1;
    div.style.gridRow = cell.row + 1;
    if (cell.index === 0) div.classList.add('cell-start');
    const hazard = state.trackHazards[cell.index];
    const icon = hazard ? '≈' : CELL_ICONS[cell.type];
    if (hazard) div.classList.add('cell-hazard');
    div.innerHTML = icon
      ? `<span class="cell-num">${cell.index + 1}</span><span class="cell-icon">${icon}</span>`
      : `<span class="cell-num">${cell.index + 1}</span>`;
    grid.appendChild(div);
  });
}

function getPawnBadges(player) {
  const badges = [];
  const fx = player.pendingEffects;
  if (fx.shieldTurnsLeft > 0) badges.push({ icon: '🛡', title: 'Protezione attiva' });
  if (fx.turboNextRoll1 === 'mini') badges.push({ icon: '🚀', title: 'Mini Turbo pronto' });
  if (fx.turboNextRoll1 === 'super') badges.push({ icon: '🚀🚀', title: 'Super Turbo pronto' });
  if (fx.boostNextRoll1) badges.push({ icon: '⚡', title: 'Boost al prossimo Dado 1' });
  if (fx.mudNextRoll1) badges.push({ icon: '≈', title: 'Fango al prossimo Dado 1' });
  if (fx.puddleArmed) badges.push({ icon: '○', title: 'Rischio pozza al prossimo Dado 1' });
  if (fx.noMalusActive) badges.push({ icon: '✔', title: 'No Malus pronto' });
  if (fx.bananaArmed) badges.push({ icon: '🎯', title: 'Banana pronta da lasciare' });
  if (fx.skipNextRoll1) badges.push({ icon: '💫', title: 'Salta il prossimo Dado 1' });
  return badges;
}

function pointToTransform(point, offsetX, scale) {
  return `translate(${point.x + offsetX}px, ${point.y}px) translate(-50%, -50%) scale(${scale})`;
}

function buildHopKeyframes(track, fromProgress, toProgress, cellSize, offsetX) {
  const step = toProgress > fromProgress ? 1 : -1;
  const hops = Math.abs(Math.round(toProgress) - Math.round(fromProgress));
  let prevPoint = cellPixelCenter(cellForProgress(track, fromProgress), cellSize);
  const frames = [{ transform: pointToTransform(prevPoint, offsetX, 1) }];

  for (let i = 1; i <= hops; i++) {
    const point = cellPixelCenter(cellForProgress(track, fromProgress + i * step), cellSize);
    const mid = {
      x: (prevPoint.x + point.x) / 2,
      y: (prevPoint.y + point.y) / 2 - cellSize * 0.3,
    };
    frames.push({ transform: pointToTransform(mid, offsetX, 1.18) });
    frames.push({ transform: pointToTransform(point, offsetX, 1) });
    prevPoint = point;
  }
  return frames;
}

function movePawnTo(pawn, track, fromProgress, toProgress, cellSize, offsetX) {
  const finalPoint = cellPixelCenter(cellForProgress(track, toProgress), cellSize);
  const finalTransform = pointToTransform(finalPoint, offsetX, 1);

  const prevAnim = hopAnimations[pawn.dataset.playerId];
  if (prevAnim) prevAnim.cancel();

  const hops = Math.abs(Math.round(toProgress) - Math.round(fromProgress));
  if (hops === 0 || fromProgress == null) {
    pawn.style.transform = finalTransform;
    return;
  }

  if (hops > MAX_ANIMATED_HOPS) {
    pawn.style.transition = 'transform 0.5s ease';
    pawn.style.transform = finalTransform;
    return;
  }

  pawn.style.transition = 'none';
  const frames = buildHopKeyframes(track, fromProgress, toProgress, cellSize, offsetX);
  const perHop = Math.max(140, Math.min(320, 1600 / hops));
  pawn.style.transform = finalTransform;
  const anim = pawn.animate(frames, { duration: perHop * hops, easing: 'ease-in-out' });
  hopAnimations[pawn.dataset.playerId] = anim;
}

function updatePawn(pawn, player, cellSize, track, occupantIndex, occupantCount, isActive) {
  const offset = (occupantIndex - (occupantCount - 1) / 2) * (cellSize * 0.32);
  const from = lastProgress[player.id];
  movePawnTo(pawn, track, from, player.progress, cellSize, offset);
  lastProgress[player.id] = player.progress;

  pawn.style.background = PLAYER_COLORS[player.colorId].hex;
  pawn.title = player.name;
  pawn.querySelector('.pawn-icon').textContent = player.icon || player.name[0];
  pawn.classList.toggle('active', isActive);
  pawn.classList.toggle('shielded', player.pendingEffects.shieldTurnsLeft > 0);

  const badgesEl = pawn.querySelector('.pawn-badges');
  badgesEl.innerHTML = '';
  getPawnBadges(player).forEach((b) => {
    const span = document.createElement('span');
    span.className = 'pawn-badge';
    span.textContent = b.icon;
    span.title = b.title;
    badgesEl.appendChild(span);
  });
}

function updateRocket(rocket, cellSize, track) {
  let marker = rocketEls[rocket.id];
  if (!marker) {
    marker = document.createElement('div');
    marker.className = 'rocket-marker';
    marker.textContent = rocket.type === 'leader' ? '🚀' : '🛸';
    document.getElementById('pawn-overlay').appendChild(marker);
    rocketEls[rocket.id] = marker;
  }
  const clamped = Math.max(0, Math.min(rocket.position, track.length - 1));
  const cell = track.cells[clamped];
  const { x, y } = cellPixelCenter(cell, cellSize);
  marker.style.transform = `translate(${x}px, ${y - cellSize * 0.4}px) translate(-50%, -50%)`;
  marker.title = `${rocket.ownerName}: razzo ${rocket.type === 'leader' ? 'al primo' : 'inseguitore'}`;
}

function renderTrack(container, state) {
  const track = getTrackForState(state);

  if (track.id !== currentTrackId) {
    container.innerHTML = '';
    pawnEls = {};
    rocketEls = {};
    lastProgress = {};
    hopAnimations = {};
    currentTrackId = track.id;

    const grid = document.createElement('div');
    grid.className = 'track-cells';
    grid.id = 'track-grid';
    container.appendChild(grid);

    const overlay = document.createElement('div');
    overlay.className = 'pawn-overlay';
    overlay.id = 'pawn-overlay';
    container.appendChild(overlay);
  }

  const grid = document.getElementById('track-grid');
  const overlay = document.getElementById('pawn-overlay');
  grid.style.setProperty('--cols', track.cols);
  grid.style.setProperty('--rows', track.rows);
  overlay.style.width = `${track.cols * (getCellSize() + CELL_GAP)}px`;
  overlay.style.height = `${track.rows * (getCellSize() + CELL_GAP)}px`;

  renderCells(grid, track, state);

  const cellSize = getCellSize();
  const currentId = state.players[state.currentPlayerIndex].id;

  const occupants = {};
  state.players.forEach((p) => {
    const { cellIndex } = getPositionOnTrack(state, p);
    (occupants[cellIndex] = occupants[cellIndex] || []).push(p);
  });

  const seenPlayers = new Set();
  Object.entries(occupants).forEach(([, players]) => {
    players.forEach((p, i) => {
      seenPlayers.add(p.id);
      let pawn = pawnEls[p.id];
      if (!pawn) {
        pawn = document.createElement('div');
        pawn.className = 'pawn';
        pawn.dataset.playerId = p.id;
        pawn.innerHTML = '<span class="pawn-icon"></span><span class="pawn-badges"></span>';
        overlay.appendChild(pawn);
        pawnEls[p.id] = pawn;
      }
      const isActive = p.id === currentId && state.raceStatus !== 'finished';
      updatePawn(pawn, p, cellSize, track, i, players.length, isActive);
    });
  });

  Object.keys(pawnEls).forEach((id) => {
    if (!seenPlayers.has(Number(id))) {
      pawnEls[id].remove();
      delete pawnEls[id];
      delete lastProgress[id];
      delete hopAnimations[id];
    }
  });

  const activeRocketIds = new Set((state.activeRockets || []).map((r) => r.id));
  (state.activeRockets || []).forEach((rocket) => updateRocket(rocket, cellSize, track));
  Object.keys(rocketEls).forEach((id) => {
    if (!activeRocketIds.has(id)) {
      rocketEls[id].remove();
      delete rocketEls[id];
    }
  });
}

function flashPawnEffect(playerIds, className, duration = 1300) {
  playerIds.forEach((id) => {
    const pawn = pawnEls[id];
    if (!pawn) return;
    pawn.classList.add(className);
    setTimeout(() => pawn.classList.remove(className), duration);
  });
}

export { renderTrack, flashPawnEffect };
