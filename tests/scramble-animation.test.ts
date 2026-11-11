// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest';
import { createScrambleAnimation } from '../src/scramble-animation';
import { applyMove, cubeSvg, SOLVED } from '../src/cube';

afterEach(() => vi.unstubAllGlobals());

test('replays the next move from the current state and resets for corrections and partial turns', () => {
  let tick: FrameRequestCallback;
  vi.stubGlobal('requestAnimationFrame', vi.fn(callback => { tick = callback; return 1; }));
  const cancel = vi.fn();
  vi.stubGlobal('cancelAnimationFrame', cancel);
  const element = document.createElement('div');
  const animation = createScrambleAnimation(element);
  const drawing = (state: string, move?: string, progress = 0) => {
    const container = document.createElement('div');
    container.innerHTML = cubeSvg(state, move, progress);
    return container.innerHTML;
  };
  animation.update(SOLVED, 'R', true);
  tick!(0);
  tick!(1150);
  expect(element.innerHTML).toBe(drawing(SOLVED, 'R', 1));
  tick!(1800);
  expect(element.innerHTML).toBe(drawing(SOLVED));
  const wrong = applyMove(SOLVED, 'F');
  animation.update(wrong, "F'", true);
  tick!(2000);
  tick!(3150);
  expect(element.innerHTML).toBe(drawing(wrong, "F'", 1));
  const partial = applyMove(SOLVED, 'U');
  animation.update(partial, 'U', true);
  tick!(4000);
  tick!(5150);
  expect(element.innerHTML).toBe(drawing(partial, 'U', 1));
  animation.update(partial, undefined, true);
  expect(element.innerHTML).toBe(drawing(partial));
  animation.update(partial, 'R', false);
  expect(cancel).toHaveBeenCalled();
  animation.dispose();
});

test('keeps a static cube when reduced motion is requested', () => {
  vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  const request = vi.fn();
  vi.stubGlobal('requestAnimationFrame', request);
  const animation = createScrambleAnimation(document.createElement('div'));
  animation.update(SOLVED, 'R', true);
  expect(request).not.toHaveBeenCalled();
  animation.dispose();
});
