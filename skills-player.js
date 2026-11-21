(() => {
  const player = document.querySelector('.vinyl-player');
  const picker = player.querySelector('.vinyl-picker');
  const controls = player.querySelector('.vinyl-controls');
  const title = player.querySelector('.vinyl-current');
  const category = player.querySelector('.vinyl-category');
  const status = player.querySelector('.vinyl-status');
  const playback = controls.querySelector('[data-action="playback"]');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');

  // Alternate categories so a short visit gives a sample of each one.
  const groups = Array.from(picker.children);
  const longest = Math.max(...groups.map(group => group.children.length));
  const tracks = [];
  for (let position = 0; position < longest; position++) {
    for (const group of groups) {
      if (group.children[position]) tracks.push(group.children[position]);
    }
  }

  let current = 0;
  let paused = motion.matches;
  let visible = false;
  let timer;

  function showTrack(index, announce = false) {
    current = (index + tracks.length) % tracks.length;
    const track = tracks[current];
    track.selected = true;
    title.textContent = track.label;
    category.textContent = track.parentElement.label;
    status.textContent = announce ? category.textContent + ', ' + track.label : '';
    if (visible && !motion.matches) {
      title.animate([
        { transform: 'translateY(.2em)', opacity: .4 },
        { transform: 'translateY(0)', opacity: 1 }
      ], { duration: 280, easing: 'ease-out' });
    }
  }

  function syncPlayback() {
    clearInterval(timer);
    const playing = visible && !paused && !document.hidden;
    player.classList.toggle('is-playing', playing);
    player.classList.toggle('is-paused', paused);
    const label = paused ? 'Play rotation' : 'Pause rotation';
    playback.setAttribute('aria-label', label);
    playback.title = label;
    if (playing) timer = setInterval(() => showTrack(current + 1), 4200);
  }

  function pause() {
    paused = true;
    syncPlayback();
  }

  controls.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    const action = button.dataset.action;
    if (action === 'playback') {
      paused = !paused;
      syncPlayback();
    } else {
      pause();
      showTrack(current + (action === 'next' ? 1 : -1), true);
    }
  });

  picker.addEventListener('pointerdown', pause);
  picker.addEventListener('change', () => {
    pause();
    showTrack(tracks.indexOf(picker.selectedOptions[0]));
  });
  player.addEventListener('focusin', event => {
    if (event.target === picker || event.target.matches(':focus-visible')) pause();
  });
  document.addEventListener('visibilitychange', syncPlayback);
  motion.addEventListener('change', () => {
    if (motion.matches) pause();
  });
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && entry.intersectionRatio >= .1;
    syncPlayback();
  }, { threshold: .1 }).observe(player);

  showTrack(0);
  syncPlayback();
  category.hidden = false;
  controls.hidden = false;
  player.dataset.ready = '';
})();
