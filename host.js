// Host: runs savers, starts with the most recently added one, then every ~minute
// crossfades to another saver picked in random order (no immediate repeats).
// Debug options: ?saver=<id> pins one saver; ?interval=<seconds> changes the dwell time.
(() => {
  const params = new URLSearchParams(location.search);
  const dwell = (parseFloat(params.get('interval')) || 60) * 1000;
  const pinned = params.get('saver');
  const dpr = () => window.devicePixelRatio || 1;
  const size = () => ({ W: window.innerWidth, H: window.innerHeight });

  function makeInstance(def) {
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const fit = () => {
      const d = dpr(), { W, H } = size();
      canvas.width = W * d; canvas.height = H * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    fit();
    window.addEventListener('resize', fit);
    const impl = def.create(ctx, size);
    return { def, canvas, impl, fit };
  }

  const defs = Savers.list;
  if (!defs.length) return;
  let first = defs[defs.length - 1]; // most recent
  if (pinned) first = defs.find(d => d.id === pinned) || first;

  let bag = [];
  function pickNext(current) {
    if (!bag.length) {
      bag = defs.filter(d => d !== current);
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
    }
    return bag.pop();
  }

  const active = [];
  function show(def) {
    const inst = makeInstance(def);
    active.push(inst);
    requestAnimationFrame(() => requestAnimationFrame(() => inst.canvas.classList.add('visible')));
    return inst;
  }
  function retire(inst) {
    inst.canvas.classList.remove('visible');
    setTimeout(() => {
      inst.canvas.remove();
      window.removeEventListener('resize', inst.fit);
      const i = active.indexOf(inst);
      if (i >= 0) active.splice(i, 1);
    }, 3200);
  }

  let current = show(first);
  if (!pinned && defs.length > 1) {
    setInterval(() => {
      const old = current;
      current = show(pickNext(old.def));
      retire(old);
    }, dwell);
  }

  function loop(now) {
    for (const inst of active) inst.impl.frame(now);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
