// Curved balls: like Balls in a Line, but each chain bends along a gentle curve and
// several chains overlap. New chains keep starting while old balls fade out later,
// so the number of live balls varies. Each chain fades either one ball at a time or
// all at once, and either quickly or slowly (slow one-at-a-time fades can overlap).
Savers.register({
  id: 'curved-balls',
  name: 'Curved Balls',
  create(ctx, size) {
    const { ease, rand } = Savers;
    let { W, H } = size();
    const APPEAR = 400;          // ms per ball to grow in
    const MAX_CHAINS = 4;
    let hue = rand(0, 360);
    let chains = [];
    let nextSpawn = 0;

    function buildChain() {
      const maxR = Math.min(W, H) * 0.14;
      for (let tries = 0; tries < 200; tries++) {
        const k = rand(0.8, 0.92), n = Math.floor(rand(8, 14));
        const curve = (Math.random() < 0.5 ? -1 : 1) * rand(0.08, 0.22); // radians turned per step
        let r = rand(maxR * 0.5, maxR);
        let x = rand(0, W), y = rand(0, H), a = rand(0, Math.PI * 2);
        const balls = [];
        for (let i = 0; i < n; i++) {
          balls.push({ x, y, r });
          const nr = r * k;
          a += curve;
          x += Math.cos(a) * (r + nr);
          y += Math.sin(a) * (r + nr);
          r = nr;
        }
        if (balls.every(o => o.x - o.r >= 0 && o.x + o.r <= W && o.y - o.r >= 0 && o.y + o.r <= H)) return balls;
      }
      return null;
    }

    function spawn(now) {
      const balls = buildChain();
      if (!balls) return;
      hue = (hue + rand(25, 70)) % 360;
      const n = balls.length;
      const appearEnd = now + n * APPEAR;
      const mode = Math.random() < 0.5 ? 'single' : 'all';
      const slow = Math.random() < 0.5;
      const fadeDur = slow ? rand(3500, 7000) : rand(300, 900);
      const gap = rand(500, 1500);               // spacing between one-at-a-time fades
      const fadeStart = appearEnd + rand(1000, 4000);
      balls.forEach((b, i) => {
        b.birth = now + i * APPEAR;
        b.fadeAt = mode === 'all' ? fadeStart : fadeStart + i * gap;
        b.fadeDur = fadeDur;
      });
      chains.push({ balls, hue, end: Math.max(...balls.map(b => b.fadeAt + b.fadeDur)) });
      // Next chain starts while this one is still appearing or just after.
      nextSpawn = now + rand(0.5, 1.2) * n * APPEAR;
    }

    return {
      frame(now) {
        ({ W, H } = size());
        ctx.clearRect(0, 0, W, H);
        chains = chains.filter(c => now < c.end);
        if (now >= nextSpawn && chains.length < MAX_CHAINS) spawn(now);
        else if (now >= nextSpawn) nextSpawn = now + 500;

        for (const c of chains) {
          for (const b of c.balls) {
            const grow = ease((now - b.birth) / APPEAR);
            const fade = 1 - ease((now - b.fadeAt) / b.fadeDur);
            const r = b.r * grow;
            if (r <= 0.5 || fade <= 0) continue;
            ctx.globalAlpha = fade;
            ctx.beginPath();
            ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${c.hue}, 80%, 60%, 0.35)`;
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = `hsl(${c.hue}, 90%, 75%)`;
            ctx.stroke();
          }
        }
        ctx.globalAlpha = 1;
      }
    };
  }
});
