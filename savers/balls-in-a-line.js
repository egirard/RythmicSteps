// Balls in a line: a chain of tangent circles appears one by one, then drops out
// in order while the smallest grows into the first circle of the next chain.
Savers.register({
  id: 'balls-in-a-line',
  name: 'Balls in a Line',
  create(ctx, size) {
    const { ease, rand } = Savers;
    let { W, H } = size();
    const APPEAR = 350, HOLD = 900, DROP = 250, MORPH = 900; // ms
    let hue = rand(0, 360);

    function chain(x, y, r0, angle, k, n) {
      const out = [];
      let cx = x, cy = y, r = r0;
      for (let i = 0; i < n; i++) {
        out.push({ x: cx, y: cy, r });
        const nr = r * k;
        cx += Math.cos(angle) * (r + nr);
        cy += Math.sin(angle) * (r + nr);
        r = nr;
      }
      return out;
    }
    const fits = c => c.every(o => o.x - o.r >= 0 && o.x + o.r <= W && o.y - o.r >= 0 && o.y + o.r <= H);

    function plan(x, y, r0) {
      const maxR = Math.min(W, H) * 0.3;
      for (let tries = 0; tries < 200; tries++) {
        const k = rand(0.68, 0.85), n = Math.floor(rand(6, 10));
        const r = Math.min(r0 || rand(maxR * 0.5, maxR), maxR);
        const c = chain(x, y, r, rand(0, Math.PI * 2), k, n);
        if (fits(c)) return c;
      }
      return null;
    }

    function startSequence(prev) {
      let circles = null;
      if (prev) {
        const x = prev.x, y = prev.y;
        const maxR = Math.min(x, W - x, y, H - y);
        const target = Math.min(maxR, Math.min(W, H) * rand(0.1, 0.3));
        circles = plan(x, y, target);
        if (!circles) circles = chain(x, y, Math.max(8, maxR * 0.5), rand(0, 7), 0.7, 5);
      } else {
        const m = Math.min(W, H) * 0.2;
        circles = plan(rand(m, W - m), rand(m, H - m));
        if (!circles) circles = chain(W / 2, H / 2, m / 2, 0, 0.7, 5);
      }
      hue = (hue + rand(30, 90)) % 360;
      return { circles, hue, start: performance.now() };
    }

    function draw(x, y, r, h) {
      if (r <= 0.5) return;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${h}, 80%, 60%, 0.35)`;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = `hsl(${h}, 90%, 75%)`;
      ctx.stroke();
    }

    let seq = null;
    return {
      frame(now) {
        ({ W, H } = size());
        if (!seq) { seq = startSequence(null); seq.start = now; }
        ctx.clearRect(0, 0, W, H);
        const cs = seq.circles, n = cs.length;
        const t = now - seq.start;
        const tDropStart = n * APPEAR + HOLD;
        const tEnd = tDropStart + (n - 1) * DROP + DROP + MORPH;
        const last = cs[n - 1];

        for (let i = 0; i < n; i++) {
          const c = cs[i];
          let r = c.r * ease((t - i * APPEAR) / APPEAR);
          if (seq.carry && i === 0) r = c.r;
          if (i < n - 1) r *= 1 - ease((t - tDropStart - i * DROP) / DROP);
          draw(c.x, c.y, r, seq.hue);
        }

        const morphStart = tDropStart + (n - 2) * DROP;
        if (t > morphStart) {
          if (!seq.next) {
            seq.next = startSequence({ x: last.x, y: last.y });
            seq.next.carry = true;
          }
          const g = ease((t - morphStart) / (tEnd - morphStart));
          const r = last.r + (seq.next.circles[0].r - last.r) * g;
          if (t < tEnd) draw(last.x, last.y, r, seq.hue + (seq.next.hue - seq.hue) * g);
        }

        if (t >= tEnd && seq.next) { seq = seq.next; seq.start = now; }
      }
    };
  }
});
