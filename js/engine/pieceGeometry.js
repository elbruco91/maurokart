const EAST = 0;
const SOUTH = 1;
const WEST = 2;
const NORTH = 3;

const DELTAS = {
  [EAST]: { row: 0, col: 1 },
  [SOUTH]: { row: 1, col: 0 },
  [WEST]: { row: 0, col: -1 },
  [NORTH]: { row: -1, col: 0 },
};

function turnLeft(dir) {
  return (dir + 3) % 4;
}

function turnRight(dir) {
  return (dir + 1) % 4;
}

function piecesToCells(pieces) {
  const raw = [{ row: 0, col: 0 }];
  let dir = EAST;

  for (let i = 1; i < pieces.length; i++) {
    const prevType = pieces[i - 1].type;
    if (prevType === 'curve_left') dir = turnLeft(dir);
    else if (prevType === 'curve_right') dir = turnRight(dir);
    const delta = DELTAS[dir];
    const prev = raw[i - 1];
    raw.push({ row: prev.row + delta.row, col: prev.col + delta.col });
  }

  const minRow = Math.min(...raw.map((c) => c.row));
  const minCol = Math.min(...raw.map((c) => c.col));
  const maxRow = Math.max(...raw.map((c) => c.row));
  const maxCol = Math.max(...raw.map((c) => c.col));

  const cells = raw.map((c, index) => ({
    index,
    row: c.row - minRow,
    col: c.col - minCol,
    type: 'normal',
  }));

  return {
    cells,
    rows: maxRow - minRow + 1,
    cols: maxCol - minCol + 1,
  };
}

function directionAtCell(cells, index) {
  const a = cells[Math.max(0, index - 1)];
  const b = cells[Math.min(cells.length - 1, index + 1)];
  if (a.row !== b.row) return 'vertical';
  return 'horizontal';
}

function numericDirBetween(a, b) {
  if (b.col === a.col + 1) return EAST;
  if (b.row === a.row + 1) return SOUTH;
  if (b.col === a.col - 1) return WEST;
  if (b.row === a.row - 1) return NORTH;
  return null;
}

function cellsToPieces(cells) {
  const pieces = [];
  let dir = EAST;
  for (let i = 0; i < cells.length; i++) {
    if (i === cells.length - 1) {
      pieces.push({ type: 'straight' });
      break;
    }
    const newDir = numericDirBetween(cells[i], cells[i + 1]);
    if (newDir === dir || newDir == null) pieces.push({ type: 'straight' });
    else if (newDir === turnLeft(dir)) pieces.push({ type: 'curve_left' });
    else if (newDir === turnRight(dir)) pieces.push({ type: 'curve_right' });
    else pieces.push({ type: 'straight' });
    if (newDir != null) dir = newDir;
  }
  return pieces;
}

export {
  piecesToCells,
  cellsToPieces,
  directionAtCell,
  turnLeft,
  turnRight,
  EAST,
  SOUTH,
  WEST,
  NORTH,
};
