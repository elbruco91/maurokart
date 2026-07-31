import { getTrack } from '../data/tracks.default.js';

function getTrackForState(state) {
  return getTrack(state.raceConfig.trackId);
}

function countFinished(state) {
  return state.players.filter((p) => p.finished).length;
}

function moveProgress(state, player, delta) {
  const track = getTrackForState(state);
  const totalLength = track.length * state.raceConfig.laps;
  let newProgress = player.progress + delta;
  if (newProgress < 0) newProgress = 0;
  if (newProgress >= totalLength && !player.finished) {
    player.progress = totalLength;
    player.finished = true;
    player.finishRank = countFinished(state) + 1;
    if (!state.winnerId) state.winnerId = player.id;
  } else if (!player.finished) {
    player.progress = newProgress;
  }
  return player.progress;
}

function getPositionOnTrack(state, player) {
  const track = getTrackForState(state);
  const clampedProgress = Math.min(player.progress, track.length * state.raceConfig.laps - 1);
  const lap = Math.floor(clampedProgress / track.length);
  const cellIndex = clampedProgress % track.length;
  return { lap, cellIndex };
}

export { getTrackForState, moveProgress, getPositionOnTrack, countFinished };
