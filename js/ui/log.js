function renderLog(container, state) {
  container.innerHTML = '';
  state.history.slice(0, 50).forEach((entry) => {
    const div = document.createElement('div');
    div.className = 'log-entry';
    div.textContent = entry.text;
    container.appendChild(div);
  });
}

export { renderLog };
