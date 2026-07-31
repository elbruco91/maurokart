const SAMPLE_QUESTIONS = [
  { domanda: 'Quanto fa 2 + 2?', risposta: '4' },
  { domanda: 'Quanto fa 5 + 7?', risposta: '12' },
  { domanda: 'Quanto fa 9 - 3?', risposta: '6' },
  { domanda: 'Quanto fa 10 - 4?', risposta: '6' },
  { domanda: 'Quanto fa 3 x 3?', risposta: '9' },
  { domanda: 'Quanto fa 4 x 5?', risposta: '20' },
  { domanda: 'Quanto fa 12 : 4?', risposta: '3' },
  { domanda: 'Quanto fa 20 : 5?', risposta: '4' },
  { domanda: 'Quanto fa 6 + 8?', risposta: '14' },
  { domanda: 'Quanto fa 15 - 9?', risposta: '6' },
];

function createQuestionPool(list) {
  let deck = [];

  function reshuffle() {
    deck = [...list].sort(() => Math.random() - 0.5);
  }

  reshuffle();

  function draw() {
    if (deck.length === 0) reshuffle();
    return deck.pop();
  }

  return { draw, reshuffle };
}

export { SAMPLE_QUESTIONS, createQuestionPool };
