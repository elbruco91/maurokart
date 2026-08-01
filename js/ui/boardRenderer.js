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

function renderTrack(container, state) {
  const track = getTrackForState(state);
  container.innerHTML = '';

  const grid = document.createElement('div');
  grid.className = 'track-cells';
  grid.style.setProperty('--cols', track.cols);
  grid.style.setProperty('--rows', track.rows);

  track.cells.forEach((cell) => {
    const div = document.createElement('div');
    div.className = `cell cell-${cell.type}`;
    div.style.gridColumn = cell.col + 1;
    div.style.gridRow = cell.row + 1;
    if (cell.index === 0) div.classList.add('cell-start');
    const hazard = state.trackHazards[cell.index];
    const icon = hazard ? '🍌' : CELL_ICONS[cell.type];
    if (hazard) div.classList.add('cell-hazard');
    div.innerHTML = icon
      ? `<span class="cell-num">${cell.index + 1}</span><span class="cell-icon">${icon}</span>`
      : `<span class="cell-num">${cell.index + 1}</span>`;
    grid.appendChild(div);
  });

  const occupants = {};
  state.players.forEach((p) => {
    const { cellIndex } = getPositionOnTrack(state, p);
    (occupants[cellIndex] = occupants[cellIndex] || []).push(p);
  });

  Object.entries(occupants).forEach(([cellIndex, players]) => {
    const cell = track.cells[Number(cellIndex)];
    players.forEach((p, i) => {
      const pawn = document.createElement('div');
      pawn.className = 'pawn';
      pawn.style.gridColumn = cell.col + 1;
      pawn.style.gridRow = cell.row + 1;
      pawn.style.background = PLAYER_COLORS[p.colorId].hex;
      pawn.title = p.name;
      pawn.textContent = p.name[0];
      const offset = (i - (players.length - 1) / 2) * 14;
      pawn.style.transform = `translateX(${offset}px)`;
      if (p.id === state.players[state.currentPlayerIndex].id && state.raceStatus !== 'finished') {
        pawn.classList.add('active');
      }
      grid.appendChild(pawn);
    });
  });

  container.appendChild(grid);
}

export { renderTrack };
