const SAMPLE_QUESTIONS = [
  { domanda: 'Domanda di prova 1: cosa fa una variabile in un programma?', risposta: 'Contiene un valore a cui si puo dare un nome, riutilizzabile nel codice.' },
  { domanda: 'Domanda di prova 2: a cosa serve un ciclo (loop)?', risposta: 'A ripetere una serie di istruzioni piu volte senza riscriverle.' },
  { domanda: 'Domanda di prova 3: cosa e una funzione?', risposta: 'Un blocco di codice riutilizzabile che esegue un compito specifico.' },
  { domanda: 'Domanda di prova 4: cosa significa debug?', risposta: 'Trovare e correggere errori in un programma.' },
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
