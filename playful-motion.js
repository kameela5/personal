(() => {
  const scene = document.querySelector('.ambient-scene');
  const letter = document.querySelector('.name-letter');
  const ripple = scene.querySelector('.water-ripple');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let pointerX = 0;
  let pointerY = 0;
  let frame = 0;
  let lastDepth;
  let rippleAnimation;

  function paint() {
    frame = 0;
    const range = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const depth = Math.min(1, Math.max(0, scrollY / range)).toFixed(3);
    if (depth !== lastDepth) {
      scene.style.setProperty('--water-depth', depth);
      lastDepth = depth;
    }
    if (reducedMotion.matches) return;
    const scrollOffset = Math.sin(window.scrollY / 350) * 18;
    scene.style.setProperty('--scene-x', `${pointerX * 25}px`);
    scene.style.setProperty('--scene-y', `${pointerY * 20 + scrollOffset}px`);
    scene.style.setProperty('--scene-tilt-x', `${pointerY * -24}deg`);
    scene.style.setProperty('--scene-tilt-y', `${pointerX * 32}deg`);
  }

  function requestPaint() {
    if (!frame) frame = requestAnimationFrame(paint);
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
  window.addEventListener('resize', requestPaint);
  new ResizeObserver(requestPaint).observe(document.body);
  window.addEventListener('pageshow', requestPaint);

  // Let a tap on open water send a short-lived ring across the surface.
  document.addEventListener('click', event => {
    if (reducedMotion.matches || !event.detail || event.target.closest('a,button,input,textarea,select,label,article,form')) return;
    ripple.style.left = `${event.clientX}px`;
    ripple.style.top = `${event.clientY}px`;
    rippleAnimation?.cancel();
    rippleAnimation = ripple.animate([
      { transform:'translate(-50%, -50%) scale(.15)', opacity:0 },
      { opacity:.7, offset:.14 },
      { transform:'translate(-50%, -50%) scale(1.6)', opacity:0 },
    ], { duration:1050, easing:'ease-out' });
  });

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
      rippleAnimation?.cancel();
      letter.classList.remove('is-falling');
      scene.style.removeProperty('--scene-x');
      scene.style.removeProperty('--scene-y');
      scene.style.removeProperty('--scene-tilt-x');
      scene.style.removeProperty('--scene-tilt-y');
    }
    requestPaint();
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
