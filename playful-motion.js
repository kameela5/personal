(() => {
  const scene = document.querySelector('.ambient-scene');
  const letter = document.querySelector('.name-letter');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let pointerX = 0;
  let pointerY = 0;
  let frame = 0;

  function paint() {
    frame = 0;
    const scrollOffset = Math.sin(window.scrollY / 350) * 18;
    scene.style.setProperty('--scene-x', `${pointerX * 25}px`);
    scene.style.setProperty('--scene-y', `${pointerY * 20 + scrollOffset}px`);
    scene.style.setProperty('--scene-tilt-x', `${pointerY * -24}deg`);
    scene.style.setProperty('--scene-tilt-y', `${pointerX * 32}deg`);
  }

  function requestPaint() {
    if (!frame && !reducedMotion.matches) frame = requestAnimationFrame(paint);
  }

  function resetPointer() {
    pointerX = 0;
    pointerY = 0;
    requestPaint();
  }

  window.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || reducedMotion.matches) return;
    pointerX = event.clientX / innerWidth * 2 - 1;
    pointerY = event.clientY / innerHeight * 2 - 1;
    requestPaint();
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', resetPointer);
  window.addEventListener('blur', resetPointer);
  window.addEventListener('scroll', requestPaint, { passive: true });

  function playLetter() {
    if (reducedMotion.matches) return;
    letter.classList.add('is-falling');
    const animation = letter.getAnimations().find(item => item.animationName === 'name-letter-fall');
    if (animation) animation.currentTime = 0;
  }

  function syncMotion() {
    letter.disabled = reducedMotion.matches;
    if (reducedMotion.matches) {
      cancelAnimationFrame(frame);
      frame = 0;
      letter.classList.remove('is-falling');
      scene.style.removeProperty('--scene-x');
      scene.style.removeProperty('--scene-y');
      scene.style.removeProperty('--scene-tilt-x');
      scene.style.removeProperty('--scene-tilt-y');
    } else {
      requestPaint();
    }
  }

  letter.addEventListener('click', playLetter);
  letter.addEventListener('animationend', () => letter.classList.remove('is-falling'));
  reducedMotion.addEventListener('change', syncMotion);
  syncMotion();

  const entrance = document.querySelector('.welcome').getAnimations()[0];
  if (entrance && !location.hash) {
    entrance.finished.then(() => {
      if (scrollY < innerHeight / 2) playLetter();
    }, () => {});
  }
})();
