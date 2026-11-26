type Callback = (time: number, dt: number) => void;
type Entry = { callback: Callback; order: number; id: number };

let entries: Entry[] = [];
let request = 0;
let last: number | undefined;
let made = 0;

function loop(time: number) {
  // The screen's own timestamp: GSAP's ticker reads Date.now, which jittered by 10-15 px.
  const dt = last === undefined ? 0 : Math.min(0.05, Math.max(0, (time - last) / 1000));
  last = time;
  request = requestAnimationFrame(loop);
  for (const entry of entries) entry.callback(time, dt);
}

/** time is the frame's timestamp in ms; dt is seconds since the last frame, at most 0.05. Lower order runs first. */
export function onFrame(callback: Callback, order = 0) {
  const entry = { callback, order, id: made++ };
  entries = [...entries, entry].sort((a, b) => a.order - b.order || a.id - b.id);
  if (!request) request = requestAnimationFrame(loop);

  return () => {
    entries = entries.filter((other) => other !== entry);
    if (entries.length || !request) return;
    cancelAnimationFrame(request);
    request = 0;
    last = undefined;
  };
}
