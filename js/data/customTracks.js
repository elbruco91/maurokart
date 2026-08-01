const KEY_PREFIX = 'maurokart_custom_track_';

function saveCustomTrack(track) {
  localStorage.setItem(KEY_PREFIX + track.id, JSON.stringify(track));
}

function loadCustomTrack(id) {
  const raw = localStorage.getItem(KEY_PREFIX + id);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function clearCustomTrack(id) {
  localStorage.removeItem(KEY_PREFIX + id);
}

export { saveCustomTrack, loadCustomTrack, clearCustomTrack };
