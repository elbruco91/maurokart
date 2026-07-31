function generateSnakeTrack(id, length, cols) {
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
  return { id, length, cols, rows, cells };
}

const TRACKS = {
  breve: generateSnakeTrack('breve', 15, 6),
  medio: generateSnakeTrack('medio', 25, 7),
  lungo: generateSnakeTrack('lungo', 35, 8),
};

function getTrack(id) {
  return TRACKS[id];
}

export { TRACKS, getTrack };
