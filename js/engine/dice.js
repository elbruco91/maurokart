function rollDie() {
  return 1 + Math.floor(Math.random() * 6);
}

function animateDie(el, finalValue, onDone) {
  const delays = [60, 60, 70, 80, 90, 110, 130, 160, 200, 260];
  let i = 0;
  el.classList.add('rolling');

  function tick() {
    if (i < delays.length) {
      el.textContent = String(1 + Math.floor(Math.random() * 6));
      i++;
      setTimeout(tick, delays[i - 1]);
    } else {
      el.classList.remove('rolling');
      el.textContent = String(finalValue);
      el.classList.add('landed');
      setTimeout(() => el.classList.remove('landed'), 400);
      if (onDone) onDone();
    }
  }

  tick();
}

export { rollDie, animateDie };
