import { loadCustomTrack } from './customTracks.js';

function generateLoopTrack(id, rows, cols, specials) {
  const cells = [];
  let index = 0;
  for (let col = 0; col < cols; col++) cells.push({ index: index++, type: 'normal', row: 0, col });
  for (let row = 1; row < rows; row++) cells.push({ index: index++, type: 'normal', row, col: cols - 1 });
  for (let col = cols - 2; col >= 0; col--) cells.push({ index: index++, type: 'normal', row: rows - 1, col });
  for (let row = rows - 2; row >= 1; row--) cells.push({ index: index++, type: 'normal', row, col: 0 });

  specials.forEach(({ index: i, type, shortcutTarget }) => {
    cells[i].type = type;
    if (shortcutTarget != null) cells[i].shortcutTarget = shortcutTarget;
  });

  return { id, length: cells.length, cols, rows, cells };
}

const TRACKS = {
  // GP Calmo: 20 caselle, anello 5x7
  pista1: generateLoopTrack('pista1', 5, 7, [
    { index: 1, type: 'lootbox' },
    { index: 3, type: 'boost' },
    { index: 5, type: 'mud' },
    { index: 7, type: 'puddle' },
    { index: 9, type: 'lootbox' },
    { index: 11, type: 'boost' },
    { index: 13, type: 'mud' },
    { index: 15, type: 'puddle' },
    { index: 17, type: 'lootbox' },
  ]),
  // GP Pro: 30 caselle, anello 7x10
  pista2: generateLoopTrack('pista2', 7, 10, [
    { index: 1, type: 'lootbox' },
    { index: 2, type: 'mud' },
    { index: 4, type: 'boost' },
    { index: 5, type: 'mud' },
    { index: 7, type: 'lootbox' },
    { index: 8, type: 'mud' },
    { index: 10, type: 'boost' },
    { index: 11, type: 'puddle' },
    { index: 13, type: 'lootbox' },
    { index: 14, type: 'mud' },
    { index: 16, type: 'boost' },
    { index: 17, type: 'mud' },
    { index: 19, type: 'lootbox' },
    { index: 20, type: 'mud' },
    { index: 22, type: 'boost' },
    { index: 23, type: 'puddle' },
    { index: 25, type: 'lootbox' },
    { index: 26, type: 'boost' },
    { index: 28, type: 'puddle' },
  ]),
  // GP Aura: 44 caselle, anello 11x13, 2 scorciatoie (entrata->uscita a 9-10 caselle)
  pista3: generateLoopTrack('pista3', 11, 13, [
    { index: 1, type: 'lootbox' },
    { index: 2, type: 'mud' },
    { index: 3, type: 'boost' },
    { index: 4, type: 'puddle' },
    { index: 6, type: 'lootbox' },
    { index: 7, type: 'shortcut_in', shortcutTarget: 17 },
    { index: 8, type: 'mud' },
    { index: 9, type: 'boost' },
    { index: 11, type: 'puddle' },
    { index: 12, type: 'lootbox' },
    { index: 13, type: 'mud' },
    { index: 14, type: 'boost' },
    { index: 16, type: 'puddle' },
    { index: 17, type: 'shortcut_out' },
    { index: 18, type: 'lootbox' },
    { index: 19, type: 'mud' },
    { index: 21, type: 'boost' },
    { index: 22, type: 'puddle' },
    { index: 23, type: 'lootbox' },
    { index: 25, type: 'mud' },
    { index: 26, type: 'shortcut_in', shortcutTarget: 35 },
    { index: 27, type: 'boost' },
    { index: 29, type: 'mud' },
    { index: 30, type: 'lootbox' },
    { index: 31, type: 'mud' },
    { index: 33, type: 'boost' },
    { index: 34, type: 'mud' },
    { index: 35, type: 'shortcut_out' },
    { index: 37, type: 'lootbox' },
    { index: 38, type: 'mud' },
    { index: 39, type: 'boost' },
    { index: 41, type: 'boost' },
    { index: 42, type: 'lootbox' },
  ]),
};

function getTrack(id) {
  const custom = loadCustomTrack(id);
  if (custom) return custom;
  return TRACKS[id];
}

function getDefaultTrack(id) {
  return TRACKS[id];
}

function getTrackLength(id) {
  return getTrack(id).length;
}

export { TRACKS, getTrack, getDefaultTrack, getTrackLength };
