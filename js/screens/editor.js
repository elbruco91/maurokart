import { piecesToCells, cellsToPieces } from '../engine/pieceGeometry.js';
import { getDefaultTrack } from '../data/tracks.default.js';
import { saveCustomTrack, loadCustomTrack, clearCustomTrack } from '../data/customTracks.js';
import { roadSidesFor, buildRoadSvg, checkerOrientation } from '../ui/boardRenderer.js';
import * as modals from '../ui/modals.js';

const TRACK_OPTIONS = [
  { id: 'pista1', label: 'GP Calmo' },
  { id: 'pista2', label: 'GP Pro' },
  { id: 'pista3', label: 'GP Aura' },
];

const MAX_PIECES = 60;

const CELL_TYPE_LABELS = {
  normal: '',
  lootbox: '?',
  boost: '⚡',
  mud: '≈',
  puddle: '○',
  shortcut_in: '➜',
  shortcut_out: '⬅',
};

let els = {};
let onExit = null;
let trackId = 'pista1';
let pieces = [];
let cellTypes = [];
let mode = 'shape';

function loadTrackIntoEditor(id) {
  trackId = id;

  const source = loadCustomTrack(id) || getDefaultTrack(id);
  pieces = source.pieces ? source.pieces.slice() : cellsToPieces(source.cells);
  if (pieces.length < 1) pieces = [{ type: 'straight' }];

  cellTypes = source.cells.map((c) => ({
    type: c.type,
    shortcutTarget: c.shortcutTarget != null ? c.shortcutTarget : null,
  }));
}

function renderTrackSelect() {
  els.trackSelect.innerHTML = '';
  TRACK_OPTIONS.forEach((t) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-toggle';
    btn.textContent = t.label;
    btn.classList.toggle('active', trackId === t.id);
    btn.addEventListener('click', () => {
      loadTrackIntoEditor(t.id);
      renderAll();
    });
    els.trackSelect.appendChild(btn);
  });
}

function renderModeTabs() {
  els.tabShape.classList.toggle('active', mode === 'shape');
  els.tabCells.classList.toggle('active', mode === 'cells');
  els.shapeControls.style.display = mode === 'shape' ? '' : 'none';
  els.cellControls.style.display = mode === 'cells' ? '' : 'none';
}

function renderPieceCount() {
  els.pieceCount.textContent = `${pieces.length} caselle posizionate`;
  els.undoBtn.disabled = pieces.length <= 1;
  const atMax = pieces.length >= MAX_PIECES;
  els.pieceStraightBtn.disabled = atMax;
  els.pieceCurveLeftBtn.disabled = atMax;
  els.pieceCurveRightBtn.disabled = atMax;
}

function renderPreview() {
  const { cells, rows, cols } = piecesToCells(pieces);
  const lastIndex = cells.length - 1;

  els.trackContainer.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'track-cells';
  grid.style.setProperty('--cols', cols);
  grid.style.setProperty('--rows', rows);

  cells.forEach((cell) => {
    const type = cellTypes[cell.index] ? cellTypes[cell.index].type : 'normal';
    const div = document.createElement('div');
    div.className = `cell cell-${type}`;
    div.style.gridColumn = cell.col + 1;
    div.style.gridRow = cell.row + 1;
    if (cell.index === 0) div.classList.add('cell-start');
    if (cell.index === lastIndex) div.classList.add('cell-finish');

    const road = roadSidesFor(cells, cell.index);
    const roadSvg = road ? buildRoadSvg(road.entrySide, road.exitSide) : '';
    const icon = CELL_TYPE_LABELS[type];
    const labelHtml = icon
      ? `<span class="cell-num">${cell.index + 1}</span><span class="cell-icon">${icon}</span>`
      : `<span class="cell-num">${cell.index + 1}</span>`;
    div.innerHTML = roadSvg + labelHtml;

    if (cell.index === 0 || cell.index === lastIndex) {
      const line = document.createElement('span');
      line.className = `checker-line ${checkerOrientation(cells, cell.index)}`;
      div.appendChild(line);
    }

    if (mode === 'cells') {
      div.classList.add('cell-editable');
      div.addEventListener('click', () => openCellChooser(cell.index));
    }
    grid.appendChild(div);
  });

  els.trackContainer.appendChild(grid);
}

function openCellChooser(index) {
  const current = cellTypes[index] || { type: 'normal', shortcutTarget: null };
  modals.showCellTypeChooser(index + 1, current, pieces.length, ({ type, shortcutTarget }) => {
    cellTypes[index] = { type, shortcutTarget };
    if (type === 'shortcut_in' && shortcutTarget != null && cellTypes[shortcutTarget]) {
      cellTypes[shortcutTarget] = { type: 'shortcut_out', shortcutTarget: null };
    }
    renderPreview();
  });
}

function renderAll() {
  renderTrackSelect();
  renderModeTabs();
  renderPieceCount();
  renderPreview();
}

function addPiece(type) {
  if (pieces.length >= MAX_PIECES) return;
  pieces.push({ type });
  cellTypes.push({ type: 'normal', shortcutTarget: null });
  renderPieceCount();
  renderPreview();
}

function undoPiece() {
  if (pieces.length <= 1) return;
  pieces.pop();
  cellTypes.pop();
  renderPieceCount();
  renderPreview();
}

function resetPieces() {
  pieces = [{ type: 'straight' }];
  cellTypes = [{ type: 'normal', shortcutTarget: null }];
  renderPieceCount();
  renderPreview();
}

function saveTrack() {
  const { cells, rows, cols } = piecesToCells(pieces);
  cells.forEach((cell, i) => {
    const ct = cellTypes[i] || { type: 'normal', shortcutTarget: null };
    cell.type = ct.type;
    if (ct.shortcutTarget != null) cell.shortcutTarget = ct.shortcutTarget;
  });
  saveCustomTrack({ id: trackId, length: pieces.length, cols, rows, cells, pieces });
  renderPieceCount();
  renderPreview();
}

function restoreDefault() {
  modals.showConfirm('Ripristinare il tracciato predefinito? La versione personalizzata salvata verra\' eliminata.', () => {
    clearCustomTrack(trackId);
    loadTrackIntoEditor(trackId);
    renderAll();
  });
}

function init(elements, onExitCallback) {
  els = elements;
  onExit = onExitCallback;

  els.pieceStraightBtn.addEventListener('click', () => addPiece('straight'));
  els.pieceCurveLeftBtn.addEventListener('click', () => addPiece('curve_left'));
  els.pieceCurveRightBtn.addEventListener('click', () => addPiece('curve_right'));
  els.undoBtn.addEventListener('click', undoPiece);
  els.resetBtn.addEventListener('click', () => {
    modals.showConfirm('Ricominciare da capo la forma di questo tracciato?', resetPieces);
  });

  els.tabShape.addEventListener('click', () => {
    mode = 'shape';
    renderModeTabs();
    renderPreview();
  });
  els.tabCells.addEventListener('click', () => {
    mode = 'cells';
    renderModeTabs();
    renderPreview();
  });

  els.restoreBtn.addEventListener('click', restoreDefault);
  els.cancelBtn.addEventListener('click', () => onExit());
  els.saveBtn.addEventListener('click', saveTrack);
}

function show() {
  mode = 'shape';
  loadTrackIntoEditor(trackId);
  renderAll();
}

export { init, show };
