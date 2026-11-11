import { cubeSvg } from './cube';

/** Replays one turn from the physical cube's current state without advancing it. */
export function createScrambleAnimation(element: HTMLElement) {
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let state = '';
  let move: string | undefined;
  let active = false;
  let frame: number | undefined;
  let started: number | undefined;
  function stop() {
    if (frame !== undefined) cancelAnimationFrame(frame);
    frame = undefined;
    started = undefined;
  }
  function tick(now: number) {
    started ??= now;
    const phase = (now - started) % 1800;
    const progress = Math.max(0, Math.min(1, (phase - 300) / 850));
    const eased = progress * progress * (3 - 2 * progress);
    element.innerHTML = cubeSvg(state, move, eased);
    frame = requestAnimationFrame(tick);
  }
  function restart() {
    stop();
    if (!state) return;
    element.innerHTML = cubeSvg(state);
    if (active && move && !document.hidden && !reduced?.matches) frame = requestAnimationFrame(tick);
  }
  document.addEventListener('visibilitychange', restart);
  reduced?.addEventListener('change', restart);
  return {
    update(nextState: string, nextMove: string | undefined, visible: boolean) {
      if (state === nextState && move === nextMove && active === visible) return;
      state = nextState;
      move = nextMove;
      active = visible;
      restart();
    },
    dispose() {
      stop();
      document.removeEventListener('visibilitychange', restart);
      reduced?.removeEventListener('change', restart);
    },
  };
}
