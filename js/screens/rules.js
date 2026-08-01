const RULES_HTML = `
<h2>Obiettivo</h2>
<p>Vince la prima pedina che completa il numero di giri impostato, percorrendo il tracciato scelto.</p>

<h2>Flusso del turno</h2>
<ul>
  <li><strong>Inizia turno</strong>: se la pedina ha un oggetto Loot, puoi attivarlo in qualsiasi momento del turno.</li>
  <li><strong>Dado 1</strong>: la pedina avanza del valore ottenuto (salvo effetti in corso).</li>
  <li><strong>Domanda</strong>: il sistema estrae una domanda dal pool.</li>
  <li><strong>Mostra risposta</strong>: la risposta corretta viene rivelata.</li>
  <li><strong>Corretto / Errato</strong>: il formatore valuta a voce la risposta del giocatore.</li>
  <li><strong>Dado 2</strong>: se corretto la pedina avanza, se errato retrocede del valore ottenuto.</li>
  <li>Si passa alla pedina successiva.</li>
</ul>

<h2>Caselle speciali</h2>
<ul>
  <li><strong>Lootbox</strong>: assegna un oggetto (se lo slot è libero), usabile nel proprio turno.</li>
  <li><strong>Boost</strong> (pedana arancione): il prossimo Dado 1 viene potenziato (x1,5).</li>
  <li><strong>Fango</strong> (macchia marrone): il prossimo Dado 1 viene ridotto.</li>
  <li><strong>Pozza</strong> (macchia blu): se al prossimo Dado 1 esce 6, la pedina cade e torna sulla pozza.</li>
  <li><strong>Scorciatoia</strong> (tombino): teletrasporto istantaneo tra entrata e uscita collegate.</li>
</ul>

<h2>Lootbox: 3 box in base alla classifica</h2>
<p>La classifica per l'assegnazione si "congela" all'inizio di ogni giro di turni. In caso di pareggio, il gruppo prende la box della posizione più avanzata.</p>
<ul>
  <li><strong>Box 1</strong> (1° in classifica): oggetti difensivi — Fango (banana), Protezione, No Malus, Ritira la domanda, +1, Cassa Guasta.</li>
  <li><strong>Box 2</strong> (inseguitori): mix — No Malus, +1, Cassa Guasta, Protezione, Mini Turbo, Razzo inseguitore.</li>
  <li><strong>Box 3</strong> (ultime posizioni): oggetti di recupero forte — Cassa Guasta, +-1, No Malus, Super Turbo, Fulmine, Razzo al primo.</li>
</ul>
<p>Un solo oggetto alla volta nello slot. La Cassa Guasta non ha effetto e non occupa lo slot.</p>

<h2>Controlli del formatore</h2>
<ul>
  <li><strong>Avanti / Indietro</strong>: sposta manualmente la pedina di turno di una casella (Indietro chiede conferma).</li>
  <li><strong>Assegna/togli caselle</strong>: corregge la posizione di qualsiasi pedina di un numero a scelta.</li>
  <li><strong>Termina Gara</strong>: chiude la partita in anticipo mostrando la classifica finale.</li>
  <li><strong>Esci/Pausa</strong>: salva la partita e torna al menu; si può riprendere in seguito da "Riprendi partita".</li>
</ul>

<h2>Editor Piste</h2>
<p>Accessibile dal menu con password admin. Permette di disegnare la forma della pista piazzando pezzi Rettilineo/Curva, e di assegnare le caselle speciali cliccando su ciascuna casella.</p>
`;

let els = {};
let onExit = null;

function init(elements, onExitCallback) {
  els = elements;
  onExit = onExitCallback;
  els.backBtn.addEventListener('click', () => onExit());
}

function show() {
  els.content.innerHTML = RULES_HTML;
}

export { init, show };
