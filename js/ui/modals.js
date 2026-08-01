import { PLAYER_COLORS } from '../state.js';

let modalRoot;

function init(root) {
  modalRoot = root;
}

function hide() {
  modalRoot.innerHTML = '';
  modalRoot.classList.remove('open');
}

function showConfirm(message, onConfirm) {
  modalRoot.innerHTML = '';
  modalRoot.classList.add('open');

  const box = document.createElement('div');
  box.className = 'modal-box';

  const text = document.createElement('p');
  text.textContent = message;
  box.appendChild(text);

  const btnRow = document.createElement('div');
  btnRow.className = 'modal-actions';

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Annulla';
  cancelBtn.className = 'btn';
  cancelBtn.onclick = hide;

  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = 'Conferma';
  confirmBtn.className = 'btn btn-danger';
  confirmBtn.onclick = () => {
    hide();
    onConfirm();
  };

  btnRow.appendChild(cancelBtn);
  btnRow.appendChild(confirmBtn);
  box.appendChild(btnRow);
  modalRoot.appendChild(box);
}

function showManualAdjust(state, onApply) {
  modalRoot.innerHTML = '';
  modalRoot.classList.add('open');

  const box = document.createElement('div');
  box.className = 'modal-box';

  const title = document.createElement('h3');
  title.textContent = 'Assegna / togli caselle manualmente';
  box.appendChild(title);

  const select = document.createElement('select');
  state.players.forEach((p) => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.name;
    select.appendChild(opt);
  });
  box.appendChild(select);

  const input = document.createElement('input');
  input.type = 'number';
  input.value = '1';
  box.appendChild(input);

  const btnRow = document.createElement('div');
  btnRow.className = 'modal-actions';

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Annulla';
  cancelBtn.className = 'btn';
  cancelBtn.onclick = hide;

  const applyBtn = document.createElement('button');
  applyBtn.textContent = 'Applica';
  applyBtn.className = 'btn btn-primary';
  applyBtn.onclick = () => {
    const playerId = Number(select.value);
    const delta = Number(input.value);
    hide();
    onApply(playerId, delta);
  };

  btnRow.appendChild(cancelBtn);
  btnRow.appendChild(applyBtn);
  box.appendChild(btnRow);
  modalRoot.appendChild(box);
}

function showLootActivation(item, onActivate) {
  modalRoot.innerHTML = '';
  modalRoot.classList.add('open');

  const box = document.createElement('div');
  box.className = 'modal-box';

  const title = document.createElement('h3');
  title.textContent = `Oggetto: ${item.name}`;
  box.appendChild(title);

  const btnRow = document.createElement('div');
  btnRow.className = 'modal-actions';

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Annulla';
  cancelBtn.className = 'btn';
  cancelBtn.onclick = hide;
  btnRow.appendChild(cancelBtn);

  if (item.id === 'plus_minus1') {
    const backBtn = document.createElement('button');
    backBtn.textContent = 'Indietro (-1)';
    backBtn.className = 'btn btn-loot';
    backBtn.onclick = () => {
      hide();
      onActivate(-1);
    };
    const fwdBtn = document.createElement('button');
    fwdBtn.textContent = 'Avanti (+1)';
    fwdBtn.className = 'btn btn-loot';
    fwdBtn.onclick = () => {
      hide();
      onActivate(1);
    };
    btnRow.appendChild(backBtn);
    btnRow.appendChild(fwdBtn);
  } else {
    const activateBtn = document.createElement('button');
    activateBtn.textContent = 'Attiva';
    activateBtn.className = 'btn btn-loot';
    activateBtn.onclick = () => {
      hide();
      onActivate(1);
    };
    btnRow.appendChild(activateBtn);
  }

  box.appendChild(btnRow);
  modalRoot.appendChild(box);
}

function showRaceResults(state, onBackToMenu) {
  modalRoot.innerHTML = '';
  modalRoot.classList.add('open');

  const box = document.createElement('div');
  box.className = 'modal-box modal-results';

  const title = document.createElement('h2');
  title.textContent = state.endedManually ? 'Gara terminata dal formatore' : 'Gara terminata!';
  box.appendChild(title);

  const standings = [...state.players].sort((a, b) => b.progress - a.progress);
  const list = document.createElement('div');
  list.className = 'results-list';
  standings.forEach((p, i) => {
    const row = document.createElement('div');
    row.className = 'results-row';
    if (i === 0) row.classList.add('results-first');

    const pos = document.createElement('span');
    pos.className = 'results-pos';
    pos.textContent = `${i + 1}°`;

    const dot = document.createElement('span');
    dot.className = 'player-dot';
    dot.style.background = PLAYER_COLORS[p.colorId].hex;

    const name = document.createElement('span');
    name.className = 'results-name';
    name.textContent = `${p.icon ? p.icon + ' ' : ''}${p.name}`;

    const info = document.createElement('span');
    info.className = 'results-info';
    info.textContent = p.finished ? 'Arrivato' : `Casella ${p.progress}`;

    row.append(pos, dot, name, info);
    list.appendChild(row);
  });
  box.appendChild(list);

  const btnRow = document.createElement('div');
  btnRow.className = 'modal-actions';
  const backBtn = document.createElement('button');
  backBtn.textContent = 'Torna al Menu';
  backBtn.className = 'btn btn-primary';
  backBtn.onclick = () => {
    hide();
    onBackToMenu();
  };
  btnRow.appendChild(backBtn);
  box.appendChild(btnRow);

  modalRoot.appendChild(box);
}

export { init, hide, showConfirm, showManualAdjust, showLootActivation, showRaceResults };
