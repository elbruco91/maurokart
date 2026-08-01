function generateSnakeTrack(id, length, cols, specials) {
  const cells = [];
  let row = 0;
  let col = 0;
  let dir = 1;
  for (let i = 0; i < length; i++) {
    cells.push({ index: i, type: 'normal', row, col });
    if (dir === 1 && col === cols - 1) {
      row++;
      dir = -1;
    } else if (dir === -1 && col === 0) {
      row++;
      dir = 1;
    } else {
      col += dir;
    }
  }
  const rows = row + 1;

  // Piazzamento provvisorio delle caselle speciali, solo per testare le meccaniche
  // in attesa del vero editor piste (Fase 6), che sostituira' questi dati.
  specials.forEach(({ index, type, shortcutTarget }) => {
    cells[index].type = type;
    if (shortcutTarget != null) cells[index].shortcutTarget = shortcutTarget;
  });

  return { id, length, cols, rows, cells };
}

const TRACKS = {
  breve: generateSnakeTrack('breve', 15, 6, [
    { index: 1, type: 'lootbox' },
    { index: 2, type: 'boost' },
    { index: 5, type: 'mud' },
    { index: 7, type: 'lootbox' },
    { index: 8, type: 'puddle' },
    { index: 10, type: 'shortcut_in', shortcutTarget: 13 },
    { index: 13, type: 'shortcut_out' },
  ]),
  medio: generateSnakeTrack('medio', 25, 7, [
    { index: 1, type: 'lootbox' },
    { index: 3, type: 'boost' },
    { index: 8, type: 'mud' },
    { index: 11, type: 'lootbox' },
    { index: 14, type: 'puddle' },
    { index: 17, type: 'shortcut_in', shortcutTarget: 21 },
    { index: 21, type: 'shortcut_out' },
  ]),
  lungo: generateSnakeTrack('lungo', 35, 8, [
    { index: 1, type: 'lootbox' },
    { index: 4, type: 'boost' },
    { index: 10, type: 'mud' },
    { index: 15, type: 'lootbox' },
    { index: 18, type: 'puddle' },
    { index: 24, type: 'shortcut_in', shortcutTarget: 29 },
    { index: 29, type: 'shortcut_out' },
  ]),
};

function getTrack(id) {
  return TRACKS[id];
}

export { TRACKS, getTrack };
