import { PLAYER_COLORS } from '../state.js';
import { getTrackLength } from '../data/tracks.default.js';

const VEHICLE_ICONS = ['🏎️', '🚗', '🚙', '🚕', '🚓', '🚐', '🚚', '🛵'];
const TRACK_OPTIONS = [
  { id: 'pista1', label: 'GP Calmo' },
  { id: 'pista2', label: 'GP Pro' },
  { id: 'pista3', label: 'GP Aura' },
];

let els = {};
let config = null;

function defaultConfig() {
  return {
    trackId: 'pista1',
    laps: 2,
    startOrder: 'random',
    players: Array.from({ length: 4 }, (_, i) => ({
      slot: i + 1,
      name: '',
      icon: VEHICLE_ICONS[i % VEHICLE_ICONS.length],
    })),
  };
}

function resizePlayers(n) {
  const list = config.players;
  if (n > list.length) {
    for (let i = list.length; i < n; i++) {
      list.push({ slot: i + 1, name: '', icon: VEHICLE_ICONS[i % VEHICLE_ICONS.length] });
    }
  } else {
    list.length = n;
  }
}

function renderTrackOptions() {
  els.trackOptions.innerHTML = '';
  TRACK_OPTIONS.forEach((t) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-toggle';
    btn.textContent = `${t.label} (${getTrackLength(t.id)} caselle)`;
    btn.classList.toggle('active', config.trackId === t.id);
    btn.addEventListener('click', () => {
      config.trackId = t.id;
      renderTrackOptions();
    });
    els.trackOptions.appendChild(btn);
  });
}

function renderStartOrderOptions() {
  els.orderRandomBtn.classList.toggle('active', config.startOrder === 'random');
  els.orderManualBtn.classList.toggle('active', config.startOrder === 'manual');
}

function renderPlayerRows() {
  els.playerRows.innerHTML = '';
  config.players.forEach((p, index) => {
    const row = document.createElement('div');
    row.className = 'player-setup-row';

    const swatch = document.createElement('span');
    swatch.className = 'player-dot';
    swatch.style.background = PLAYER_COLORS[p.slot].hex;
    row.appendChild(swatch);

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'setup-input';
    nameInput.placeholder = PLAYER_COLORS[p.slot].name;
    nameInput.value = p.name;
    nameInput.addEventListener('input', () => {
      p.name = nameInput.value;
    });
    row.appendChild(nameInput);

    const iconPicker = document.createElement('div');
    iconPicker.className = 'icon-picker';
    VEHICLE_ICONS.forEach((icon) => {
      const iconBtn = document.createElement('button');
      iconBtn.type = 'button';
      iconBtn.className = 'icon-btn';
      iconBtn.textContent = icon;
      iconBtn.classList.toggle('active', p.icon === icon);
      iconBtn.addEventListener('click', () => {
        p.icon = icon;
        renderPlayerRows();
      });
      iconPicker.appendChild(iconBtn);
    });
    row.appendChild(iconPicker);

    if (config.startOrder === 'manual') {
      const reorder = document.createElement('div');
      reorder.className = 'reorder-controls';

      const upBtn = document.createElement('button');
      upBtn.type = 'button';
      upBtn.className = 'btn btn-small';
      upBtn.textContent = '▲';
      upBtn.disabled = index === 0;
      upBtn.addEventListener('click', () => {
        [config.players[index - 1], config.players[index]] = [config.players[index], config.players[index - 1]];
        renderPlayerRows();
      });

      const downBtn = document.createElement('button');
      downBtn.type = 'button';
      downBtn.className = 'btn btn-small';
      downBtn.textContent = '▼';
      downBtn.disabled = index === config.players.length - 1;
      downBtn.addEventListener('click', () => {
        [config.players[index + 1], config.players[index]] = [config.players[index], config.players[index + 1]];
        renderPlayerRows();
      });

      reorder.appendChild(upBtn);
      reorder.appendChild(downBtn);
      row.appendChild(reorder);
    }

    els.playerRows.appendChild(row);
  });
}

function init(elements, onStart, onCancel) {
  els = elements;

  els.lapsInput.addEventListener('input', () => {
    config.laps = Math.max(1, Math.min(20, Number(els.lapsInput.value) || 1));
  });

  els.playerCountInput.addEventListener('input', () => {
    const n = Math.max(2, Math.min(8, Number(els.playerCountInput.value) || 2));
    els.playerCountInput.value = n;
    resizePlayers(n);
    renderPlayerRows();
  });

  els.orderRandomBtn.addEventListener('click', () => {
    config.startOrder = 'random';
    renderStartOrderOptions();
    renderPlayerRows();
  });

  els.orderManualBtn.addEventListener('click', () => {
    config.startOrder = 'manual';
    renderStartOrderOptions();
    renderPlayerRows();
  });

  els.cancelBtn.addEventListener('click', () => onCancel());

  els.startBtn.addEventListener('click', () => {
    onStart({
      trackId: config.trackId,
      laps: config.laps,
      startOrder: config.startOrder,
      players: config.players.map((p) => ({
        slot: p.slot,
        name: p.name.trim() || PLAYER_COLORS[p.slot].name,
        icon: p.icon,
      })),
    });
  });
}

function show() {
  config = defaultConfig();
  els.lapsInput.value = config.laps;
  els.playerCountInput.value = config.players.length;
  renderTrackOptions();
  renderStartOrderOptions();
  renderPlayerRows();
}

export { init, show };
