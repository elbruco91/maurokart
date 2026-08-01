const LOOT_ITEMS = {
  mud_trap: { id: 'mud_trap', name: 'Fango (banana)' },
  shield: { id: 'shield', name: 'Protezione' },
  no_malus: { id: 'no_malus', name: 'No malus' },
  redraw: { id: 'redraw', name: 'Ritira la domanda' },
  plus1: { id: 'plus1', name: '+1' },
  plus_minus1: { id: 'plus_minus1', name: '+-1' },
  broken_box: { id: 'broken_box', name: 'Cassa guasta' },
  mini_turbo: { id: 'mini_turbo', name: 'Mini Turbo' },
  super_turbo: { id: 'super_turbo', name: 'Super Turbo' },
  rocket_chaser: { id: 'rocket_chaser', name: 'Razzo inseguitore' },
  rocket_leader: { id: 'rocket_leader', name: 'Razzo al primo' },
  lightning: { id: 'lightning', name: 'Fulmine' },
};

const BOX_CONTENTS = {
  1: ['mud_trap', 'shield', 'no_malus', 'redraw', 'plus1', 'broken_box'],
  2: ['no_malus', 'plus1', 'broken_box', 'shield', 'mini_turbo', 'rocket_chaser'],
  3: ['broken_box', 'plus_minus1', 'no_malus', 'super_turbo', 'lightning', 'rocket_leader'],
};

const BOX_ASSIGNMENT_BY_PLAYER_COUNT = {
  2: [1, 2],
  3: [1, 2, 3],
  4: [1, 2, 2, 3],
  5: [1, 2, 2, 2, 3],
  6: [1, 2, 2, 2, 3, 3],
  7: [1, 1, 2, 2, 2, 3, 3],
  8: [1, 1, 2, 2, 2, 2, 3, 3],
};

function drawLootItem(box) {
  const pool = BOX_CONTENTS[box] || BOX_CONTENTS[1];
  const itemId = pool[Math.floor(Math.random() * pool.length)];
  return LOOT_ITEMS[itemId];
}

function computeRoundBoxAssignment(state) {
  const assignmentTable = BOX_ASSIGNMENT_BY_PLAYER_COUNT[state.players.length] || BOX_ASSIGNMENT_BY_PLAYER_COUNT[8];
  const sorted = [...state.players].sort((a, b) => b.progress - a.progress);
  const result = {};
  let i = 0;
  while (i < sorted.length) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1].progress === sorted[i].progress) j++;
    const box = assignmentTable[i];
    for (let k = i; k <= j; k++) result[sorted[k].id] = box;
    i = j + 1;
  }
  return result;
}

export { LOOT_ITEMS, BOX_CONTENTS, BOX_ASSIGNMENT_BY_PLAYER_COUNT, drawLootItem, computeRoundBoxAssignment };
